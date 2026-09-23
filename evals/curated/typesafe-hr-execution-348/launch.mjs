import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { execute, instructionBytes, policyTools, sha } from './execute.mjs';
import { openProject } from './project.mjs';
import { attestProduct } from './product-receipt.mjs';

const protocolRoot=path.resolve('evals/curated/typesafe-hr-protocol-347-v3');
const driverRoot=path.resolve('evals/curated/typesafe-hr-execution-348');
const scratch=path.resolve('.perquiro/348');
const liveRoot=path.join(scratch,'live');
let live=liveRoot;
const productRoot=path.join(scratch,'product');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const write=(file,value)=>fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const hashFile=file=>sha(fs.readFileSync(file));
const exe=process.env.CODEX_EXECUTABLE??path.join(process.env.APPDATA,'npm/node_modules/@openai/codex/node_modules/@openai/codex-win32-x64/vendor/x86_64-pc-windows-msvc/bin/codex.exe');
function command(executable,args) {
  if(executable==='git')args=['-c',`safe.directory=${path.resolve('.').replaceAll('\\','/')}`,...args];
  const result=spawnSync(executable,args,{encoding:'utf8',windowsHide:true});
  if(result.status!==0)throw new Error(result.stderr||result.stdout||'Command failed');
  return result.stdout.trim();
}
function manifest(dir) {
  const result={};
  function walk(at,prefix='') {for(const entry of fs.readdirSync(at,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
    const name=prefix+entry.name;const file=path.join(at,entry.name);
    if(entry.isDirectory())walk(file,name+'/');else result[name]=hashFile(file);
  }}
  walk(dir);return result;
}
function driverManifest() {return Object.fromEntries(['browser.mjs','browser.test.mjs','execute.mjs','export.mjs','export.test.mjs','host.mjs','launch.mjs','preflight.mjs','product-receipt.mjs','project.mjs'].map(f=>[f,hashFile(path.join(driverRoot,f))]));}
function verifyLaunch(launchFile) {return JSON.parse(command(process.execPath,[path.join(protocolRoot,'evaluate.mjs'),'launch',launchFile]));}
function verifyFrozen() {
  command('git',['diff','--exit-code','a57a3dfa394721cae816c85ef7ea5557becdb428','--','evals/curated/typesafe-hr-protocol-347-v3']);
  return JSON.parse(command(process.execPath,[path.join(protocolRoot,'evaluate.mjs'),'verify']));
}
function policy(schemas) {return {schemas,model:'gpt-5.6-terra',effort:'low',serviceTier:'default',providerFallback:false,delegation:false,nativeTools:false,inheritedMcpTools:false,fileReads:['AGENTS.md','.agents/skills/perquiro-explore/SKILL.md'],evidenceImports:'Project captures only',browser:'same Product origin; no script evaluation',requests:60,durationMs:1800000,recordingGraceMs:120000,hostConfiguration:'host.mjs; frozen driver manifest'};}

if(process.argv[2]==='freeze') {
  assert.ok(!fs.existsSync(live),'Launch already exists; never overwrite or rerun');
  const frozenVerification=verifyFrozen();
  const preflight=read(path.join(scratch,'preflight-4/receipt.json'));
  const probe=read(path.join(scratch,'driver-probe-2/receipt.json'));
  const timeout=read(path.join(scratch,'timeout-probe-1/receipt.json'));
  const sourceProof=read(path.join(scratch,'source-proof.json'));
  assert.equal(preflight.passed,true);assert.equal(probe.status,'completed');assert.equal(timeout.status,'timeout');
  assert.ok(timeout.elapsed_ms>=60000&&timeout.elapsed_ms<65000&&timeout.finalCapture.snapshot);
  assert.equal(sourceProof.passed,true);
  const testLog=command(process.execPath,['--import','tsx','--test',path.join(driverRoot,'browser.test.mjs'),path.join(driverRoot,'export.test.mjs')]);
  const product=attestProduct(productRoot);assert.equal(product.product_source_sha256,preflight.product.product_source_sha256);
  assert.equal(product.product_source_sha256,sourceProof.preflight_product_source_sha256);
  assert.equal(sourceProof.pinned_commit,'868e83d2c50f8135c5bff46db086ee4037c90ef3');
  live=path.join(scratch,'launch-preparation-'+randomUUID());
  fs.mkdirSync(live);
  const toolProject=await openProject({root:path.join(scratch,'launch-tool-project-'+randomUUID()),origin:'http://127.0.0.1:1',arm:'advised'});
  let advised;try{advised=policyTools(toolProject);}finally{await toolProject.close();}
  const ordinary=advised.filter(t=>t.name!=='advise_explore');
  const tools={ordinary,advised};write(path.join(live,'tools.json'),tools);
  const toolPolicy=policy(tools);write(path.join(live,'tool-policy.json'),toolPolicy);
  const instructions=instructionBytes();write(path.join(live,'instructions.json'),instructions);
  const proof={isolation:{preflight,withholding:'Candidate receives only dynamic browser/public MCP/instruction-file tools. Disabled MCP stubs expose no tools, resources or templates. No native file/shell tools. Evidence imports constrained by realpath.'},driver:{probe,timeout,sourceProof,tests:testLog,frozenVerification},limitations:{preflightCosts:'Separate overhead. Raw preflight attempts retained; authoring and reviewer usage not fully available.'}};
  write(path.join(live,'preflight.json'),proof);
  const launch={...read(path.join(protocolRoot,'launch.template.json')),...Object.fromEntries(['seed_sha256','product_source_sha256','product_build_sha256'].map(k=>[k,product[k]])),
    freeze_sha256:hashFile(path.join(protocolRoot,'frozen.json')),
    common_instructions_sha256:sha(instructions.common),ordinary_instructions_sha256:sha(instructions.ordinary),advised_instructions_sha256:sha(instructions.advised),
    candidate_sha256:hashFile(path.join(protocolRoot,'candidate.md')),tool_policy_sha256:sha(JSON.stringify(toolPolicy)),
    tool_schemas:{ordinary:sha(JSON.stringify(ordinary)),advised:sha(JSON.stringify(advised))},
    runtime_sha:command('git',['rev-parse','HEAD']),runtime_build_manifest:manifest(path.resolve('dist')),driver_manifest:driverManifest(),
    cli_version:command(exe,['--version']),browser_version:preflight.browserVersion,node_version:process.version,host_platform:`${os.platform()} ${os.arch()}`,
    grader_1:'/root/blind_grader_a',grader_2:'/root/blind_grader_b',result_reviewer:'/root/driver_spec',
    isolation_evidence:'preflight.json#/isolation',driver_evidence:'preflight.json#/driver',
    manifest:Object.fromEntries(['preflight.json','instructions.json','tools.json','tool-policy.json'].map(f=>[f,hashFile(path.join(live,f))])),frozen_at:new Date().toISOString()};
  write(path.join(live,'launch.json'),launch);
  const validated=verifyLaunch(path.join(live,'launch.json'));
  write(path.join(live,'launch-validation.json'),validated);
  write(path.join(live,'launch-lock.json'),{sha256:hashFile(path.join(live,'launch.json')),frozen_at:launch.frozen_at});
  const launchSha=hashFile(path.join(live,'launch.json'));fs.renameSync(live,liveRoot);
  console.log(JSON.stringify({launch:validated,sha256:launchSha}));
} else if(process.argv[2]==='run') {
  const launchFile=path.join(live,'launch.json');const launch=read(launchFile);const lock=read(path.join(live,'launch-lock.json'));
  verifyFrozen();
  assert.equal(hashFile(launchFile),lock.sha256);verifyLaunch(launchFile);
  assert.deepEqual(driverManifest(),launch.driver_manifest);assert.deepEqual(manifest(path.resolve('dist')),launch.runtime_build_manifest);
  assert.equal(command(exe,['--version']),launch.cli_version);assert.equal(process.version,launch.node_version);
  const instructions=instructionBytes();for(const key of ['common','ordinary','advised'])assert.equal(sha(instructions[key]),launch[key+'_instructions_sha256']);
  const prompt=fs.readFileSync(path.join(protocolRoot,'candidate.md'),'utf8');assert.equal(sha(prompt),launch.candidate_sha256);
  const ledger=path.join(live,'dispatch.jsonl');const prior=fs.existsSync(ledger)?fs.readFileSync(ledger,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse):[];
  const completed=prior.filter(e=>e.kind==='closed');const dispatched=prior.filter(e=>e.kind==='dispatch');
  assert.equal(completed.length,dispatched.length,'An interrupted dispatch needs evidence preservation before any continuation');
  for(let i=0;i<completed.length;i++){assert.equal(dispatched[i].id,launch.runs[i].id);assert.equal(completed[i].id,launch.runs[i].id);}
  const next=launch.runs[completed.length];assert.ok(next,'All eight executions already dispatched');
  const currentProduct=attestProduct(productRoot);
  for(const key of ['product_source_sha256','product_build_sha256','seed_sha256'])assert.equal(currentProduct[key],launch[key]);
  const append=event=>fs.appendFileSync(ledger,JSON.stringify({...event,at:new Date().toISOString(),launch_sha256:lock.sha256})+'\n');
  append({kind:'dispatch',...next});
  try {
    const receipt=await execute({...next,root:live,productRoot,instructions:instructions[next.arm],prompt,launch});
    append({kind:'closed',id:next.id,status:receipt.status,receipt_sha256:hashFile(path.join(live,next.id,'receipt.json'))});
  } catch(error) {
    const file=path.join(live,next.id+'-driver-failure.json');
    write(file,{id:next.id,kind:'driver_failure',error:String(error),stack:error.stack,at:new Date().toISOString(),launch_sha256:lock.sha256});
    append({kind:'closed',id:next.id,status:'failed',driver_failure_sha256:hashFile(file)});
    throw error;
  }
} else throw new Error('Use freeze before scoring, then run once per frozen execution');
