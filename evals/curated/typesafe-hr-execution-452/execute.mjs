import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { once } from 'node:events';
import { spawn, spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { TrialBrowser } from './browser.mjs';
import { openProject } from './project.mjs';
import { runHost } from './host.mjs';
import { exportKnowledge } from './export.mjs';
import { attestProduct } from './product-receipt.mjs';

export const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const frozen=path.resolve('evals/curated/typesafe-hr-protocol-452');
const productSha='868e83d2c50f8135c5bff46db086ee4037c90ef3';
export const browserTool={name:'browser_action',description:'Operate the isolated Product browser. Locators use role/name or a CSS selector from observed UI, with optional zero-based index. snapshot returns current accessibility text. fill_secret fills the configured Employee password without exposing it. Each action returns a capturePath that import_evidence may consume. Requests and deadlines are enforced outside the Agent.',inputSchema:{type:'object',properties:{op:{type:'string',enum:['navigate','snapshot','click','fill','fill_secret','select','press','check','wait_for']},path:{type:'string'},role:{type:'string'},name:{type:'string'},selector:{type:'string'},index:{type:'integer',minimum:0},exact:{type:'boolean'},value:{type:'string'},checked:{type:'boolean'}},required:['op'],additionalProperties:false}};
export const noteTool={name:'trial_note',description:'Record your planning phase or decision for evaluation accounting. Call before candidate generation or ordinary planning, and retain chosen actions, advice overrides, fallback reasons and open questions. This creates no Knowledge or Evidence.',inputSchema:{type:'object',properties:{phase:{type:'string',enum:['candidate_generation','ordinary_planning','advice_handling','override','fallback','recording','other']},note:{type:'string'}},required:['phase','note'],additionalProperties:false}};
const parse=result=>JSON.parse(result.content.find(x=>x.type==='text').text);
export const readTool={name:'read_project_file',description:'Read one of the two installed instruction files: AGENTS.md or .agents/skills/perquiro-explore/SKILL.md. No other file is readable.',inputSchema:{type:'object',properties:{path:{type:'string',enum:['AGENTS.md','.agents/skills/perquiro-explore/SKILL.md']}},required:['path'],additionalProperties:false}};
export const policyTools=project=>[...project.tools,browserTool,noteTool,readTool];
export function readProjectFile(files,args) {
  if(!readTool.inputSchema.properties.path.enum.includes(args.path)||!files.has(args.path))throw new Error('File is outside instruction allowlist');
  return {text:files.get(args.path)};
}

export function instructionBytes() {
  const common=fs.readFileSync('src/setup/command-skills/explore/SKILL.md','utf8')+'\n\n## Trial access and tools\nThe installed Explore instructions above are supplied in full. Root AGENTS.md is available through read_project_file. Delegation is disabled. Your sole Employee username is emily.dawson; use browser_action fill_secret for its configured password. Use only the supplied browser and public Perquiro tools. browser_action returns actual captures; import_evidence may import only those paths. Record phase and decision notes with trial_note; its notes never replace saved Observations. Call report_explore_advice_use with the launch executionId for overrides, fallbacks and selection-phase durations; unknown durations stay null, never invent zero. Use requestToken UUIDs for writes. Product purpose: an HR portal for employees. Product version: '+productSha+'.\n';
  return {common,ordinary:common+'\nUse ordinary planning to choose the next group of useful checks. Do not call advise_explore. Still call report_explore_advice_use for known selection-phase durations. Keep all recovery, authorization and recording requirements.\n',advised:common+'\nRequest advise_explore for each next group of concrete checks after recovery and human instructions, without a prior full ordinary ranking. Pass the launch executionId. Use or override optional TypeSafe advice with a short reason; keep advice_handling to authorize-then-act. Refresh changed context; reconsider useful work after no selection; use ordinary planning after unavailable advice. Keep all recovery, authorization and recording requirements.\n'};
}

export function accountingFooter(executionId) {
  return `\n\nFor advice accounting, pass executionId "${executionId}" to advise_explore and report_explore_advice_use. Give report_explore_advice_use a fresh requestToken per new report and reuse it only to retry a lost response. Report overrides, fallbacks and selection-phase durations (candidate_generation, ordinary_planning, advice, advice_handling, override, fallback) in milliseconds. Unknown durations stay null; never invent zero. Do not put Product Observation or Look content or API keys in those reports.`;
}

export async function execute({id,arm,root,productRoot,instructions,prompt,probe=false,launch,executionId}) {
  const out=path.join(root,id);fs.mkdirSync(out,{recursive:false});
  const productReceipt=attestProduct(productRoot);
  const runExecutionId=executionId??(probe?randomUUID():launch?.runs?.find(r=>r.id===id)?.executionId);
  if(!runExecutionId)throw new Error('Each execution needs a UUID executionId for advice overhead journals');
  if(!probe) {
    if(!launch)throw new Error('Live execution requires a validated launch');
    for(const key of ['product_source_sha256','product_build_sha256','seed_sha256'])if(productReceipt[key]!==launch[key])throw new Error('Product changed since launch: '+key);
  }
  const fullPrompt=prompt+accountingFooter(runExecutionId);
  const reservation=http.createServer();reservation.listen(0,'127.0.0.1');await once(reservation,'listening');const port=reservation.address().port;await new Promise(r=>reservation.close(r));const origin=`http://127.0.0.1:${port}`;
  const env={...process.env,PORT:String(port),TZ:'UTC'};delete env.TYPESAFE_API_KEY;
  const serverStarted=new Date().toISOString();
  const product=spawn(process.execPath,['--require',path.join(frozen,'fixed-date.cjs'),path.join(productRoot,'server/index.js')],{cwd:productRoot,env,windowsHide:true});
  product.stdout.on('data',b=>fs.appendFileSync(path.join(out,'product.stdout'),b));product.stderr.on('data',b=>fs.appendFileSync(path.join(out,'product.stderr'),b));
  let browser,project,start=null,phase='startup',phaseStart=0,graceTimer,deadlineTimer,closed=false;
  const stop=new AbortController();const events=[],phases=[],provider=[];const elapsed=()=>start===null?null:performance.now()-start;
  const receipt={id,arm,kind:probe?'unscored_preflight':'live',status:'failed',events,phases,provider};
  const save=(name,value)=>fs.writeFileSync(path.join(out,name),JSON.stringify(value,null,2));
  const transition=next=>{const now=elapsed();if(now===null)return;phases.push({phase,start_ms:phaseStart,end_ms:now});phaseStart=now;phase=next;};
  const grace=reason=>{if(graceTimer)return;browser.stop(reason);events.push({kind:'grace_started',reason,at_ms:elapsed()});graceTimer=setTimeout(()=>{closed=true;stop.abort(reason+'; recording grace expired');},120000);};
  try {
    let ready=false;
    for(let n=0;n<100;n++){try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
    if(!ready)throw new Error('Disposable Product did not start');
    browser=await TrialBrowser.open({origin,onLimit:()=>grace('request budget exhausted'),secrets:['password123']});const emptyStorage=await browser.context.storageState();await browser.action({op:'navigate',path:'/'});
    project=await openProject({root:path.join(out,'project'),origin,arm,onProvider:e=>{provider.push({...e,at_ms:elapsed()});save('provider.json',provider);}});
    fs.mkdirSync(path.join(project.root,'captures'));
    const knowledge=parse(await project.call('read_knowledge_catalog'));
    const initial=await browser.capture();
    receipt.reset={...productReceipt,product_sha:productSha,server_instance_id:`${product.pid}:${serverStarted}`,server_started:serverStarted,project_id:randomUUID(),project_path:project.root,browser_context_id:randomUUID(),browser_version:browser.browser.version(),empty_storage:emptyStorage.cookies.length===0&&emptyStorage.origins.length===0,empty_knowledge:knowledge.coverage.observations===0&&knowledge.coverage.surfaces===0&&knowledge.coverage.journeys===0&&knowledge.coverage.actors===1,signed_out:/Sign in|Log in|Login/i.test(initial.snapshot),initial_capture:initial,emptyKnowledge:knowledge,actor_id:project.actorId,fixed_product_date:productReceipt.product_date};
    if(!receipt.reset.empty_storage||!receipt.reset.empty_knowledge||!receipt.reset.signed_out)throw new Error('Reset checks failed');save('reset.json',receipt.reset);
    const files=new Map([['AGENTS.md',fs.readFileSync(path.join(project.root,'AGENTS.md'),'utf8')],['.agents/skills/perquiro-explore/SKILL.md',fs.readFileSync(path.join(project.root,'.agents/skills/perquiro-explore/SKILL.md'),'utf8')]]);
    const tools=policyTools(project);save('tools.json',tools);save('input.json',{instructions,candidate:prompt,prompt:fullPrompt,executionId:runExecutionId});
    if(!probe) {
      if(sha(JSON.stringify(tools))!==launch.tool_schemas[arm])throw new Error('Tool schemas differ from launch');
      if(sha(instructions)!==launch[arm+'_instructions_sha256']||sha(prompt)!==launch.candidate_sha256)throw new Error('Candidate input differs from launch');
      if(browser.browser.version()!==launch.browser_version)throw new Error('Browser differs from launch');
      const planned=launch.runs.find(r=>r.id===id);if(!planned||planned.executionId!==runExecutionId)throw new Error('executionId differs from launch');
    }
    receipt.executionId=runExecutionId;
    start=performance.now();browser.start();deadlineTimer=setTimeout(()=>grace('execution deadline'),1_800_000);
    const callTool=async(name,args,callId)=>{
      if(closed)throw new Error('Final close reached');
      const event={kind:'tool',name,args,callId,started_ms:elapsed()};events.push(event);
      try {
        let result;
        if(name==='browser_action') {
          transition('product_interaction');
          const actual=args.op==='fill_secret'?{...args,op:'fill',value:'password123'}:args;
          result=await browser.action(actual);
          const file=path.join(project.root,'captures',`${events.length}.json`);fs.writeFileSync(file,JSON.stringify(result,null,2));result={...result,capturePath:file};
          if(browser.admitted>=60)grace('request budget exhausted');
        } else if(name==='trial_note') {if(!noteTool.inputSchema.properties.phase.enum.includes(args.phase))throw new Error('Unknown accounting phase');transition(args.phase);result={recorded:true};}
        else if(name==='read_project_file'){result=readProjectFile(files,args);}
        else {transition(name==='advise_explore'?'advice':name==='report_explore_advice_use'?'recording':'recording');result=await project.call(name,args);}
        event.result=result;return result;
      } catch(error){event.error=String(error);throw error;}
      finally {event.completed_ms=elapsed();if(closed)event.late_completion=true;else if(name!=='trial_note')transition('other');save('events.json',events);}
    };
    receipt.host=await runHost({cwd:project.root,instructions,prompt:fullPrompt,tools,callTool,output:path.join(out,'host.jsonl'),signal:stop.signal,timeoutMs:probe?60000:1_920_000,onClose:()=>{closed=true;browser.stop('host closed');transition('closed');receipt.elapsed_ms=phaseStart;}});
    receipt.status=receipt.host.result.status;
    receipt.finalCapture=await browser.capture();save('browser.json',receipt.finalCapture);
    // Public catalog and context reads preserve the final recorded Knowledge.
    receipt.knowledge=await exportKnowledge((name,args)=>project.call(name,args),project.actorId);save('knowledge.json',receipt.knowledge);
    const journalFile=path.join(project.root,'.perquiro','agent-history',`${runExecutionId}.explore-advice.json`);
    if(fs.existsSync(journalFile)){receipt.advice_overhead=JSON.parse(fs.readFileSync(journalFile,'utf8'));save('advice-overhead.json',receipt.advice_overhead);}
    else{receipt.advice_overhead=null;receipt.advice_overhead_note='No Project explore-advice journal was written for this executionId. Missing host cost remains unknown, never zero.';}
  }catch(error){receipt.error=String(error);console.error(id,receipt.error);}
  finally{closed=true;clearTimeout(graceTimer);clearTimeout(deadlineTimer);if(browser){receipt.finalCapture??=await browser.capture().catch(e=>({error:String(e)}));save('browser.json',receipt.finalCapture);}save('receipt.json',receipt);await project?.close();await browser?.close();product.kill();}
  console.log(JSON.stringify({id,status:receipt.status,elapsed_ms:receipt.elapsed_ms,error:receipt.error,requests:receipt.finalCapture?.admitted,executionId:receipt.executionId}));return receipt;
}

if(process.argv[2]==='probe') {
  const root=path.resolve('.perquiro/452');const bytes=instructionBytes();
  await execute({id:process.argv[3]??'driver-probe',arm:'ordinary',root,productRoot:path.join(root,'product'),instructions:bytes.ordinary,prompt:'This is an unscored driver preflight. Read Setup, inspect the signed-out browser with snapshot, record a Surface and one grounded Observation for the visible login form, then finish. Do not log in or explore other functionality.',probe:true});
}
