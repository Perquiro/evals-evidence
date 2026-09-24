import fs from 'node:fs';
import path from 'node:path';
import { hostCalls } from './prepare-evidence.mjs';
import { cost } from '../typesafe-hr-protocol-452/evaluate.mjs';
import { sha } from './execute.mjs';

export function preparationAdviceStatus(receipt,provider) {
  let advice;try{advice=JSON.parse(receipt.liveAdvice?.content?.find(c=>c.type==='text')?.text);}catch{}
  return provider.status===200&&['selected','no_selection'].includes(advice?.status)?'ok':provider.error??advice?.status??'unattributed_response';
}

export function indexCapture(preparation,name,bytes,events) {
  const indexedName=name+'.index.json';
  const index={original:name,sha256:sha(bytes),events};
  fs.writeFileSync(path.join(preparation,indexedName),JSON.stringify(index,null,2)+'\n',{flag:'wx'});
  return {path:'preparation/'+indexedName,sha256:sha(fs.readFileSync(path.join(preparation,indexedName)))};
}

if(process.argv[1]?.endsWith('summarize-overhead.mjs')) {
const root=path.resolve(process.argv[2]??'.perquiro/452/evidence');
const preparation=path.join(root,'preparation');
const rates=JSON.parse(fs.readFileSync('evals/curated/typesafe-hr-protocol-452/rates.json','utf8'));
const records=[];
const nativeFiles=['app-server-probe.raw.json','host-isolation-probe.jsonl','host-isolation-fixed.jsonl','host-isolation-fixed-2.jsonl',...['preflight-1','preflight-2','preflight-3','preflight-4','driver-probe-1','driver-probe-2','timeout-probe-1'].map(d=>d+'/host.jsonl')];
for(const name of nativeFiles) {
  const file=path.join(preparation,name);if(!fs.existsSync(file))continue;
  const bytes=fs.readFileSync(file);const text=bytes.toString('utf8').trim();
  const rows=text?(name.endsWith('.json')?JSON.parse(text):text.split('\n').map(JSON.parse)):[];
  const index=indexCapture(preparation,name,bytes,rows);
  const calls=hostCalls(rows).map(call=>({...call,id:name+':'+call.id,raw:`${index.path}#/events/${call.event_index}`}));
  records.push({source:'preparation/'+name,sha256:sha(bytes),index,calls,note:'Only host-visible usage is priced. Missing transport attempts and actual charges remain unknown.'});
}
for(const name of ['host-probe.stdout.jsonl','host-probe-2.stdout.jsonl']) {
  const file=path.join(preparation,name);if(!fs.existsSync(file))continue;
  const bytes=fs.readFileSync(file);const rows=bytes.toString('utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
  const index=indexCapture(preparation,name,bytes,rows);
  const calls=rows.flatMap((row,ordinal)=>row.type==='turn.completed'&&row.usage?[{id:name+':'+ordinal,model:'gpt-5.6-terra',status:'ok',usage:{input:row.usage.input_tokens??null,cached_input:row.usage.cached_input_tokens??null,cache_write_input:null,output:row.usage.output_tokens??null,reasoning_output:null},actual_charge_usd:null,raw:`${index.path}#/events/${ordinal}`}]:[]);
  records.push({source:'preparation/'+name,sha256:sha(bytes),index,calls,note:'Requested model from the CLI probe; its effective model was not independently verifiable, so this is only an overhead estimate assumption. Missing cache-write and reasoning counters remain null.'});
}
for(const name of ['preflight-1','preflight-2','preflight-3','preflight-4']) {
  const file=path.join(preparation,name,'receipt.json');if(!fs.existsSync(file))continue;
  const bytes=fs.readFileSync(file);const receipt=JSON.parse(bytes);
  const calls=(receipt.provider??[]).map((provider,index)=>{let body;try{body=JSON.parse(provider.body);}catch{}return{id:name+':typesafe-'+index,model:body?.model??provider.request?.model??'unknown',status:preparationAdviceStatus(receipt,provider),usage:body?.usage?{input:body.usage.input_tokens??null,cached_input:null,cache_write_input:null,output:body.usage.output_tokens??null,reasoning_output:null}:null,actual_charge_usd:null,raw:`preparation/${name}/receipt.json#/provider/${index}`};});
  records.push({source:`preparation/${name}/receipt.json`,sha256:sha(bytes),calls,note:'Unscored live TypeSafe preflight usage.'});
}
for(const name of ['host-probe.receipt.json','host-probe-2.receipt.json']) {
  const file=path.join(preparation,name);if(!fs.existsSync(file))continue;
  const bytes=fs.readFileSync(file);const receipt=JSON.parse(bytes);
  records.push({source:'preparation/'+name,sha256:sha(bytes),calls:[],outcome:{code:receipt.code,timed_out:receipt.timedOut,elapsed_ms:receipt.elapsed_ms},note:'Execution provenance without token counters. Available usage is included from the paired stdout JSONL; an empty stdout is unknown usage, not zero cost.'});
}
const calls=records.flatMap(r=>r.calls);
const output={scope:'issue 452 preparation only, separate from the eight candidate executions.',records,known_usage:cost(calls,rates,false,null),unknowns:['Authoring and review/grader usage are not exposed to this evaluator.','Underlying host transport attempts, unfinished-request usage, attributable non-token charges, and actual charges are unavailable.','Earlier #347 preparation and synthetic experiments are preserved separately and are not recomputed here.'],interpretation:'The known component subtotal is not total experiment cost. Preflight stages with no captured counters are not assumed free.'};
fs.writeFileSync(path.join(root,'overhead.json'),JSON.stringify(output,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({visibleUsageRecords:calls.length,knownComponentSubtotalUsd:output.known_usage.known_component_subtotal_usd,totalUsd:null}));
}
