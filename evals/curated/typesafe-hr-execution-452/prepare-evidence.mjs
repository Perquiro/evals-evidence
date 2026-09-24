import fs from 'node:fs';
import path from 'node:path';
import { randomInt } from 'node:crypto';
import { sha } from './execute.mjs';

const scratch=path.resolve('.perquiro/452');
const live=path.join(scratch,'live');
const output=path.resolve(process.argv[2]??'.perquiro/452/evidence');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const write=(file,value)=>fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const hash=file=>sha(fs.readFileSync(file));
const actor='Employee:emily.dawson';
const parse=result=>{try{return JSON.parse(result.content.find(c=>c.type==='text').text);}catch{return null;}};
const containsId=(value,id)=>value&&typeof value==='object'&&(value.id===id||Object.values(value).some(v=>Array.isArray(v)?v.some(x=>containsId(x,id)):containsId(v,id)));
const blind=value=>{
  if(typeof value==='string')return value.replace(/http:\/\/127\.0\.0\.1:\d+/g,'[Product origin]').replace(/pair-\d+-(?:ordinary|advised)/g,'[execution]').replace(/\b(?:ordinary|advised|TypeSafe|jev-1\.13\.0|gpt-5\.6-terra)\b/gi,'[planning metadata withheld]');
  if(Array.isArray(value))return value.map(blind);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,blind(v)]));
  return value;
};

export function hostCalls(rows) {
  const calls=[];let previousIndex=-1;let previous={inputTokens:0,cachedInputTokens:0,cacheWriteInputTokens:0,outputTokens:0,reasoningOutputTokens:0};
  const names={input:'inputTokens',cached_input:'cachedInputTokens',cache_write_input:'cacheWriteInputTokens',output:'outputTokens',reasoning_output:'reasoningOutputTokens'};
  for(let i=0;i<rows.length;i++) {
    const row=rows[i];if(row.msg.method!=='thread/tokenUsage/updated')continue;
    const total=row.msg.params.tokenUsage.total;
    if(Object.values(names).every(k=>total[k]===previous[k]))continue;
    const usage=Object.fromEntries(Object.entries(names).map(([to,from])=>[to,Number.isSafeInteger(total[from])&&Number.isSafeInteger(previous[from])&&total[from]>=previous[from]?total[from]-previous[from]:null]));
    const outputs=rows.slice(previousIndex+1,i+1).flatMap((event,offset)=>event.direction==='received'&&(event.msg.method==='item/tool/call'||event.msg.method==='item/completed'&&event.msg.params?.item?.type==='agentMessage'&&event.msg.params.item.text?.length)?[previousIndex+1+offset]:[]);
    calls.push({id:`host-${calls.length+1}`,model:'gpt-5.6-terra',status:outputs.length?'ok':'unattributed_usage',usage,actual_charge_usd:null,event_index:i,usable_output_event_indices:outputs,at_ms:row.at_ms});previous=total;previousIndex=i;
  }
  for(let i=0;i<rows.length;i++)if(rows[i].msg.method==='error'||rows[i].msg.method==='codex/event/stream_error')calls.push({id:`host-error-${i}`,model:'gpt-5.6-terra',status:'error',usage:null,actual_charge_usd:null,event_index:i,at_ms:rows[i].at_ms});
  return calls;
}

if(process.argv[1]?.endsWith('prepare-evidence.mjs')) {
  const launch=read(path.join(live,'launch.json'));
  for(const run of launch.runs)if(!fs.existsSync(path.join(live,run.id,'receipt.json')))throw new Error('Retain a complete receipt for every scheduled execution before preparing grades: '+run.id);
  fs.mkdirSync(output,{recursive:false});fs.mkdirSync(path.join(output,'raw'));fs.mkdirSync(path.join(output,'blind'));
  const preparation=path.join(output,'preparation');fs.mkdirSync(preparation);
  const preparationDirectories=['preflight-1','preflight-2','preflight-3','preflight-4','driver-probe-1','driver-probe-2','timeout-probe-1'];
  for(const name of preparationDirectories) {
    const from=path.join(scratch,name);if(!fs.existsSync(from))continue;
    const to=path.join(preparation,name);fs.mkdirSync(to);
    for(const file of fs.readdirSync(from))if(fs.statSync(path.join(from,file)).isFile())fs.copyFileSync(path.join(from,file),path.join(to,file));
  }
  for(const file of fs.readdirSync(scratch))if(/\.(?:json|jsonl|log|stderr|txt)$/.test(file)&&fs.statSync(path.join(scratch,file)).isFile())fs.copyFileSync(path.join(scratch,file),path.join(preparation,file));
  for(const name of ['launch.json','launch-lock.json','launch-validation.json','preflight.json','instructions.json','tools.json','tool-policy.json','dispatch.jsonl'])fs.copyFileSync(path.join(live,name),path.join(output,name));
  fs.copyFileSync('evals/curated/typesafe-hr-protocol-452/checklist.json',path.join(output,'blind/checklist.json'));
  const shuffled=[...launch.runs];for(let n=shuffled.length-1;n>0;n--){const i=randomInt(n+1);[shuffled[n],shuffled[i]]=[shuffled[i],shuffled[n]];}
  const aliases=Object.fromEntries(shuffled.map((run,n)=>[run.id,`sample-${String(n+1).padStart(2,'0')}`]));
  const traces=[];
  for(const run of launch.runs) {
    const source=path.join(live,run.id);const raw=path.join(output,'raw',run.id);fs.mkdirSync(raw);
    for(const name of fs.readdirSync(source))if(fs.statSync(path.join(source,name)).isFile())fs.copyFileSync(path.join(source,name),path.join(raw,name));
    const captureSource=path.join(source,'project/captures');
    if(fs.existsSync(captureSource))fs.cpSync(captureSource,path.join(raw,'captures'),{recursive:true,errorOnExist:true});
    const receipt=read(path.join(raw,'receipt.json'));const browser=read(path.join(raw,'browser.json'));const knowledge=read(path.join(raw,'knowledge.json'));
    const rows=fs.readFileSync(path.join(raw,'host.jsonl'),'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
    write(path.join(raw,'host-index.json'),{original:'host.jsonl',sha256:hash(path.join(raw,'host.jsonl')),events:rows});
    const prefix=`raw/${run.id}/`;const citation=(file,pointer)=>prefix+file+'#'+pointer;
    const actions=browser.events.flatMap((event,index)=>event.kind==='action'&&event.dispatched_ms!==null?[{id:event.id,actor,dispatched_ms:event.dispatched_ms,executed:event.executed===true,outcome:JSON.stringify(event.result??{error:event.error}),raw:citation('browser.json',`/events/${index}`),args:event.args,completed_ms:event.completed_ms,result:event.result,error:event.error}]:[]);
    for(let index=0;index<receipt.events.length;index++) {
      const event=receipt.events[index];if(event.name==='browser_action'&&event.args.op==='snapshot'&&event.result&&!event.late_completion)actions.push({id:`snapshot-${index}`,actor,dispatched_ms:event.started_ms,executed:true,outcome:JSON.stringify(event.result),raw:citation('receipt.json',`/events/${index}`),args:event.args,completed_ms:event.completed_ms,result:event.result});
    }
    actions.sort((a,b)=>a.dispatched_ms-b.dispatched_ms);actions.forEach((a,i)=>{a.ordinal=i+1;});
    const observations=[];const seen=new Set();
    knowledge.contexts.forEach((context,ci)=>context.value.storedRelationships.items.forEach((group,gi)=>{
      if(group.kind!=='observations')return;
      group.observations.forEach((observation,oi)=>{
        if(seen.has(observation.id))return;seen.add(observation.id);
        const save=receipt.events.find(e=>['record_inspection','record_observation'].includes(e.name)&&!e.result?.isError&&containsId(parse(e.result),observation.id));
        observations.push({id:observation.id,actor,action_ids:[],saved_ms:save?.completed_ms??null,result:observation.body,raw:citation('knowledge.json',`/contexts/${ci}/value/storedRelationships/items/${gi}/observations/${oi}`),context:group.context,eligible:!!save&&!save.late_completion&&save.completed_ms<=receipt.elapsed_ms,prior_action_ids:actions.filter(a=>a.executed&&a.completed_ms<=save?.completed_ms).map(a=>a.id)});
      });
    }));
    const hostOffset=receipt.elapsed_ms-receipt.host.elapsed_ms;
    const calls=hostCalls(rows).map(call=>({...call,at_ms:call.at_ms+hostOffset,raw:citation('host-index.json',`/events/${call.event_index}`)}));
    receipt.provider.forEach((provider,index)=>{
      let body;try{body=JSON.parse(provider.body);}catch{}
      const adviceEvent=receipt.events.find(e=>e.name==='advise_explore'&&e.started_ms<=provider.at_ms&&e.completed_ms>=provider.at_ms);const advice=parse(adviceEvent?.result);
      calls.push({id:`typesafe-${index+1}`,model:body?.model??provider.request.model,requested_model:provider.request.model,effective_model:body?.model??null,status:provider.status===200&&['selected','no_selection'].includes(advice?.status)?'ok':provider.error??advice?.status??'error',usage:body?.usage?{input:body.usage.input_tokens??null,cached_input:null,cache_write_input:null,output:body.usage.output_tokens??null,reasoning_output:null}:null,actual_charge_usd:null,raw:citation('receipt.json',`/provider/${index}`),at_ms:provider.at_ms,elapsed_ms:provider.elapsed_ms});
    });
    if(receipt.status!=='completed')calls.push({id:'host-unfinished',model:'gpt-5.6-terra',status:receipt.status,usage:null,actual_charge_usd:null,raw:citation('receipt.json','/host/result'),at_ms:receipt.elapsed_ms});
    const phases=receipt.phases.map(p=>({...p,call_ids:[]}));
    for(const call of calls){const at=Math.min(receipt.elapsed_ms,Math.max(0,call.at_ms??0));const phase=phases.find(p=>at>=p.start_ms&&at<p.end_ms)??phases.at(-1);phase.call_ids.push(call.id);}
    const recommendations=receipt.events.flatMap((e,i)=>e.name==='advise_explore'?[{args:e.args,result:parse(e.result),error:e.error,raw:citation('receipt.json',`/events/${i}`)}]:[]);
    const overrides=receipt.events.flatMap((e,i)=>e.name==='trial_note'&&['override','fallback'].includes(e.args.phase)?[{...e.args,raw:citation('receipt.json',`/events/${i}`)}]:[]);
    const journalOverrides=receipt.events.flatMap((e,i)=>e.name==='report_explore_advice_use'?[{args:e.args,result:parse(e.result),error:e.error,raw:citation('receipt.json',`/events/${i}`)}]:[]);
    const adviceOverhead=receipt.advice_overhead??(fs.existsSync(path.join(raw,'advice-overhead.json'))?read(path.join(raw,'advice-overhead.json')):null);
    const trace={...run,kind:'live',actor,status:receipt.status,elapsed_ms:receipt.elapsed_ms,product_requests:browser.admitted,phases,calls,call_ledger_complete:false,non_token_cost_usd:null,
      accounting_note:'Host-visible usage is successive cumulative counter differences; unchanged totals are not counted twice. Missing/reset counters remain null. Host timestamps are aligned to execution time using their common close endpoint. Each usage event is assigned once to the candidate-declared phase in which it arrived, an attribution estimate for model work spanning phases. TypeSafe exposes input/output totals only. App-server does not expose a complete transport-attempt ledger or attributable non-token charges, so complete cost remains unknown. Actual charges are unavailable. Host close ends elapsed; post-close capture drain is excluded. Observation save time is the MCP response completion upper bound. #450 Project explore-advice journals are retained when written; missing journal cost stays unknown, never zero.',
      recommendations,overrides,journal_reports:journalOverrides,advice_overhead:adviceOverhead,advice_overhead_note:receipt.advice_overhead_note??(adviceOverhead?null:'No Project explore-advice journal; missing host cost remains unknown.'),actions,observations,effective_model:receipt.host.settings.model,effective_effort:receipt.host.settings.reasoningEffort,comparability_verified:false,controls_raw:citation('receipt.json','/host'),reset:{...receipt.reset,raw:citation('receipt.json','/reset')},grade:null};
    traces.push(trace);
    const anonymousActions=actions.map(action=>({id:action.id,ordinal:action.ordinal,args:action.args,executed:action.executed,within_budget:action.dispatched_ms<=Math.min(receipt.elapsed_ms,1800000),result:action.result?{url:action.result.url,snapshot:action.result.snapshot}:undefined,error:action.error,
      requests:browser.events.filter(e=>e.kind==='request'&&e.at_ms>=action.dispatched_ms&&e.at_ms<=action.completed_ms).map(request=>({method:request.method,url:request.url,body:request.body,response:browser.events.filter(e=>['response','request_failure'].includes(e.kind)&&e.id===request.id).map(e=>({status:e.status,body:e.body,error:e.error}))}))}));
    const anonymousObservations=observations.map(o=>({id:o.id,body:o.result,context:o.context,saved_before_close:o.eligible,saved_after_action:Math.max(0,...actions.filter(a=>a.completed_ms<=o.saved_ms).map(a=>a.ordinal))}));
    const network=browser.events.filter(e=>e.kind==='request').map(request=>({id:request.id,method:request.method,url:request.url,body:request.body,after_action:Math.max(0,...actions.filter(a=>a.dispatched_ms<=request.at_ms).map(a=>a.ordinal)),before_action:actions.find(a=>a.dispatched_ms>request.at_ms)?.ordinal??null,response:browser.events.filter(e=>['response','request_failure'].includes(e.kind)&&e.id===request.id).map(e=>({status:e.status,body:e.body,error:e.error,before_close:e.at_ms<=receipt.elapsed_ms}))}));
    const evaluatorRefusals=browser.events.filter(e=>e.kind==='refused_request').map(e=>({url:e.url,reason:e.reason,product_result:false}));
    const sample=aliases[run.id];const evidenceFile=sample+'-evidence.json';
    write(path.join(output,'blind',evidenceFile),blind({browser:{actions:anonymousActions,network,evaluatorRefusals},knowledge:{observations:anonymousObservations}}));
    write(path.join(output,'blind',sample+'.json'),blind({sample,actions:anonymousActions.map((a,i)=>({id:a.id,ordinal:a.ordinal,executed:a.executed,within_budget:a.within_budget,raw:evidenceFile+'#/browser/actions/'+i})),observations:anonymousObservations.map((o,i)=>({...o,raw:evidenceFile+'#/knowledge/observations/'+i})),evidence:evidenceFile}));
  }
  write(path.join(output,'blinding.json'),{aliases,transformations:['Random order/opaque sample IDs','No planning, model, advice, cost, elapsed time, launch or host material in anonymous packets','Loopback origins replaced; planning-label strings masked consistently','Actions retain order, inputs, actual captures and network outcomes; Observations retain original IDs and bodies apart from masking','saved_after_action is only a temporal bound, never causal support']});
  write(path.join(output,'ungraded.json'),{traces,overhead_note:'Authoring, preflight and review are separate from candidate execution. Available raw preflight counters are retained; authoring/reviewer usage and actual charges remain unknown.'});
  fs.copyFileSync('evals/curated/typesafe-hr-execution-452/GRADING.md',path.join(output,'blind/GRADING.md'));
  const blindManifest=Object.fromEntries(fs.readdirSync(path.join(output,'blind')).map(file=>[file,hash(path.join(output,'blind',file))]));
  write(path.join(output,'blind/index.json'),{samples:Object.values(aliases).sort().map(id=>id+'.json'),manifest:blindManifest,raw_evidence:'Each evidence file contains captured inputs, accessibility snapshots, network bodies and saved Observation bodies, with only the documented metadata transformations. Original labeled files and provenance remain outside this grader directory.'});
  const manifest={};
  function walk(dir,prefix=''){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const name=prefix+entry.name;const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file,name+'/');else manifest[name]=hash(file);}}
  walk(output);write(path.join(output,'manifest.json'),manifest);
  console.log(JSON.stringify({output,runs:traces.length,actions:traces.map(t=>t.actions.length),observations:traces.map(t=>t.observations.length)}));
}
