import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { TrialBrowser } from './browser.mjs';
import { openProject } from './project.mjs';
import { runHost } from './host.mjs';
import assert from 'node:assert/strict';
import { attestProduct } from './product-receipt.mjs';
import { readProjectFile, readTool } from './execute.mjs';

const root=path.resolve('.perquiro/348');const out=path.join(root,process.argv[2]??'preflight');fs.mkdirSync(out,{recursive:false});
const reservation=http.createServer();reservation.listen(0,'127.0.0.1');await once(reservation,'listening');const port=reservation.address().port;await new Promise(r=>reservation.close(r));
const origin=`http://127.0.0.1:${port}`;
const env={...process.env,PORT:String(port),TZ:'UTC'};delete env.TYPESAFE_API_KEY;
const product=spawn(process.execPath,['--require',path.resolve('evals/curated/typesafe-hr-protocol-347-v3/fixed-date.cjs'),path.join(root,'product/server/index.js')],{env,cwd:path.join(root,'product'),windowsHide:true});
product.stdout.on('data',b=>fs.appendFileSync(path.join(out,'product.stdout'),b));product.stderr.on('data',b=>fs.appendFileSync(path.join(out,'product.stderr'),b));
let browser,project;const receipt={kind:'unscored_preflight',origin,productPid:product.pid,provider:[]};
try {
  for(let n=0;n<100;n++){try{if((await fetch(origin)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  receipt.product=attestProduct(path.join(root,'product'));
  browser=await TrialBrowser.open({origin,secrets:['password123']});
  receipt.emptyStorage=await browser.context.storageState();
  await browser.action({op:'navigate',path:'/'});
  receipt.signedOut=await browser.capture();receipt.browserVersion=browser.browser.version();
  project=await openProject({root:path.join(out,'project'),origin,arm:'advised',onProvider:e=>receipt.provider.push(e)});
  fs.mkdirSync(path.join(project.root,'captures'));
  receipt.emptyKnowledge=await project.call('read_knowledge_catalog');
  assert.equal(JSON.parse(receipt.emptyKnowledge.content[0].text).coverage.observations,0);
  assert.equal(receipt.emptyStorage.cookies.length,0);assert.equal(receipt.emptyStorage.origins.length,0);
  assert.match(receipt.signedOut.snapshot,/Sign in|Log in|Login/i);
  receipt.liveAdvice=await project.call('advise_explore',{context:{actorId:project.actorId,platform:'browser',productVersion:{kind:'exact',value:'868e83d2c50f8135c5bff46db086ee4037c90ef3'}},objective:'Check that the disposable HR login page is reachable.',productPurpose:'An HR portal for employees.',observedDependencies:null,candidates:[{id:'inspect_login',check:'Inspect the visible signed-out login page.',question:'Is the login form visible?',eligibility:{status:'eligible'}}]});
  // A candidate has no filesystem tools. This bridge denies import outside captures.
  fs.writeFileSync(path.join(out,'withheld-sentinel.txt'),'Evaluator-only sentinel.');
  try{await project.call('import_evidence',{requestToken:'00000000-0000-4000-8000-000000000034',sourcePath:path.join(out,'withheld-sentinel.txt')});receipt.withheldImport='FAILED: permitted';}catch(e){receipt.withheldImport=String(e);}
  assert.match(receipt.withheldImport,/outside the Project capture allowlist/);
  const instructionFiles=new Map(readTool.inputSchema.properties.path.enum.map(name=>[name,fs.readFileSync(path.join(project.root,name),'utf8')]));
  assert.deepEqual(readTool.inputSchema.properties.path.enum,['AGENTS.md','.agents/skills/perquiro-explore/SKILL.md']);
  receipt.instructionRead=readProjectFile(instructionFiles,{path:'AGENTS.md'});
  try{readProjectFile(instructionFiles,{path:'../withheld-sentinel.txt'});receipt.withheldRead='FAILED: permitted';}catch(e){receipt.withheldRead=String(e);}
  assert.match(receipt.withheldRead,/outside instruction allowlist/);
  const advice=JSON.parse(receipt.liveAdvice.content[0].text);assert.equal(advice.source,'typesafe');assert.equal(advice.status,'selected');
  const capBrowser=await TrialBrowser.open({origin,limit:1});
  try{capBrowser.start();await capBrowser.action({op:'navigate',path:'/API/me'});assert.equal(capBrowser.admitted,1);await assert.rejects(capBrowser.action({op:'navigate',path:'/api/me'}),/budget/);receipt.caseVariant=await capBrowser.capture();assert.equal(receipt.caseVariant.events.find(e=>e.kind==='response').status,401);}finally{await capBrowser.close();}
  receipt.probeCalls=[];
  receipt.host=await runHost({cwd:project.root,instructions:'You are a preflight examiner. Use only the supplied probe tool, then report its result. Do not explore any Product.',prompt:'Call probe with value hello. Then report whether you have any tool that can read arbitrary files or execute a shell. Do not infer tool availability from prose.',tools:[{name:'probe',description:'Return a fixed preflight receipt.',inputSchema:{type:'object',properties:{value:{type:'string'}},required:['value'],additionalProperties:false}}],callTool:async(name,args)=>{if(name!=='probe')throw new Error('No other tools allowed');receipt.probeCalls.push(args);return{received:args.value};},output:path.join(out,'host.jsonl'),timeoutMs:60000});
  assert.equal(receipt.host.result.status,'completed');assert.ok(receipt.probeCalls.some(c=>c.value==='hello'));assert.ok(receipt.host.settings.mcpInventories.every(i=>i.data.every(s=>s.serverInfo===null&&Object.keys(s.tools).length===0&&s.resources.length===0&&s.resourceTemplates.length===0)));
  receipt.passed=true;
  console.log(JSON.stringify({browserVersion:receipt.browserVersion,advice:receipt.liveAdvice,withheldImport:receipt.withheldImport,host:receipt.host.result}));
} catch(error){receipt.passed=false;receipt.error=String(error);throw error;}
finally {fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify(receipt,null,2));await project?.close();await browser?.close();product.kill();}
