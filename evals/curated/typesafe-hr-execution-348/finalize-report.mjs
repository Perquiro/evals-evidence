import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { sha } from './execute.mjs';
import { validateGrade, reportItems } from './grading.mjs';

export const noModelReroute=events=>!events.some(event=>event.direction==='received'&&event.msg.method==='model/rerouted');

export function buildReport(root) {
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const write=(file,value)=>fs.writeFileSync(path.join(root,file),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const hash=file=>sha(fs.readFileSync(path.join(root,file)));
const packet=read('ungraded.json');const launch=read('launch.json');const aliases=read('blinding.json').aliases;
const first=read('grades/grader-a.json');const second=read('grades/grader-b.json');const adjudication=read('grades/adjudication.json');
const checklist=JSON.parse(fs.readFileSync('evals/curated/typesafe-hr-protocol-347-v3/checklist.json','utf8'));
const samples=Object.fromEntries(packet.traces.map(t=>[aliases[t.id],t]));
validateGrade(first,{reviewer:launch.grader_1,samples,checklist});validateGrade(second,{reviewer:launch.grader_2,samples,checklist});validateGrade(adjudication,{reviewer:'/root',samples,checklist});
const ledger=fs.readFileSync(path.join(root,'dispatch.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
const dispatched=ledger.filter(e=>e.kind==='dispatch');const closed=ledger.filter(e=>e.kind==='closed');
assert.deepEqual(dispatched.map(e=>e.id),launch.runs.map(r=>r.id));assert.deepEqual(closed.map(e=>e.id),launch.runs.map(r=>r.id));
const projectIds=new Set(),browserIds=new Set(),serverIds=new Set();
for(const trace of packet.traces) {
  const sample=aliases[trace.id];const final=adjudication.samples[sample];assert.ok(first.samples[sample]&&second.samples[sample]&&final,'Missing independent grade/adjudication');
  const files=`raw/${trace.id}/`;const receipt=read(files+'receipt.json');const index=read(files+'host-index.json');const tools=read(files+'tools.json');const input=read(files+'input.json');const browser=read(files+'browser.json');
  const threadStart=index.events.find(e=>e.direction==='sent'&&e.msg.method==='thread/start')?.msg.params;
  const turnStart=index.events.find(e=>e.direction==='sent'&&e.msg.method==='turn/start')?.msg.params;
  const allowed=new Set(tools.map(t=>t.name));
  const nativeMcp=receipt.host.settings.mcpInventories.flatMap(i=>i.data);
  const logins=browser.events.filter(e=>e.kind==='request'&&new URL(e.url).pathname.toLowerCase()==='/api/login').flatMap(request=>browser.events.filter(e=>e.kind==='response'&&e.id===request.id&&e.status>=200&&e.status<300).map(response=>{let body;try{body=JSON.parse(response.body);}catch{}return{request_id:request.id,status:response.status,username:body?.user?.username??null,role:body?.user?.role??null};}));
  const control={
    launch_sha256:hash('launch.json'),dispatch:dispatched.find(e=>e.id===trace.id),close:closed.find(e=>e.id===trace.id),
    reset:{source_sha256:receipt.reset.product_source_sha256,build_sha256:receipt.reset.product_build_sha256,seed_sha256:receipt.reset.seed_sha256,fixed_product_date:receipt.reset.fixed_product_date,signed_out:receipt.reset.signed_out,empty_storage:receipt.reset.empty_storage,empty_knowledge:receipt.reset.empty_knowledge},
    requested:{model:threadStart?.model,effort:threadStart?.config?.model_reasoning_effort,tier:threadStart?.serviceTier,fallback:threadStart?.allowProviderModelFallback},
    effective:{model:receipt.host.settings.model,effort:receipt.host.settings.reasoningEffort,tier:receipt.host.settings.serviceTier,no_model_reroute:noModelReroute(index.events)},
    actor:{successful_logins:logins,only_employee:logins.every(login=>login.username==='emily.dawson'&&login.role==='employee')},
    input_hashes:{instructions:sha(input.instructions),prompt:sha(input.prompt),tools:sha(JSON.stringify(tools))},
    isolation:{empty_instruction_sources:receipt.host.settings.instructionSources.length===0,only_configured_disabled_mcp_stubs:nativeMcp.every(s=>threadStart?.config?.mcp_servers[s.name]?.enabled===false&&s.serverInfo===null&&Object.keys(s.tools).length===0&&s.resources.length===0&&s.resourceTemplates.length===0),only_allowlisted_tool_calls:index.events.filter(e=>e.direction==='received'&&e.msg.method==='item/tool/call').every(e=>allowed.has(e.msg.params.tool)),base_instruction_hash:sha(threadStart?.baseInstructions??''),dispatch_prompt_hash:sha(turnStart?.input?.[0]?.text??'')},
    budgets:{admitted:browser.admitted,request_records:browser.events.filter(e=>e.kind==='request').length,refused:browser.events.filter(e=>e.kind==='refused_request').length,all_actions_dispatched_in_time:trace.actions.every(a=>a.dispatched_ms<=Math.min(trace.elapsed_ms,1800000)),all_requests_admitted_in_time:browser.events.filter(e=>e.kind==='request').every(e=>e.at_ms!==null&&e.at_ms<=Math.min(trace.elapsed_ms,1800000)),elapsed_ms:trace.elapsed_ms},
    final_close:{host_status:receipt.status,elapsed_ms:receipt.elapsed_ms,phase_end:receipt.phases.at(-1)?.end_ms,post_close_drain_ms:receipt.host.post_close_drain_ms,late_tool_completions:receipt.events.filter(e=>e.late_completion).map(e=>e.callId),final_capture_retained:typeof receipt.finalCapture?.snapshot==='string'},
    provenance:{host_jsonl_sha256:hash(files+'host.jsonl'),indexed_host_sha256:index.sha256,receipt_sha256:hash(files+'receipt.json')}
  };
  const checks={
    model:control.requested.model===launch.model&&control.effective.model===launch.model&&control.requested.effort===launch.effort&&control.effective.effort===launch.effort&&control.requested.tier==='default'&&control.effective.tier==='default'&&control.requested.fallback===false&&control.effective.no_model_reroute,
    reset:['product_source_sha256','product_build_sha256','seed_sha256'].every(k=>receipt.reset[k]===launch[k])&&receipt.reset.product_sha===launch.product_sha&&receipt.reset.fixed_product_date===launch.fixed_product_date&&receipt.reset.signed_out&&receipt.reset.empty_storage&&receipt.reset.empty_knowledge,
    inputs:control.input_hashes.instructions===launch[trace.arm+'_instructions_sha256']&&control.input_hashes.prompt===launch.candidate_sha256&&control.input_hashes.tools===launch.tool_schemas[trace.arm]&&control.isolation.base_instruction_hash===control.input_hashes.instructions&&control.isolation.dispatch_prompt_hash===control.input_hashes.prompt,
    isolation:control.isolation.empty_instruction_sources&&control.isolation.only_configured_disabled_mcp_stubs&&control.isolation.only_allowlisted_tool_calls,
    actor:control.actor.only_employee,
    budget:control.budgets.admitted===control.budgets.request_records&&control.budgets.admitted<=60&&control.budgets.all_actions_dispatched_in_time&&control.budgets.all_requests_admitted_in_time&&trace.elapsed_ms<=1920000,
    closure:control.final_close.phase_end===trace.elapsed_ms&&control.final_close.final_capture_retained,
    originals:control.provenance.host_jsonl_sha256===control.provenance.indexed_host_sha256&&control.provenance.receipt_sha256===control.close.receipt_sha256&&control.dispatch.launch_sha256===control.launch_sha256,
    unique_reset:!projectIds.has(receipt.reset.project_id)&&!browserIds.has(receipt.reset.browser_context_id)&&!serverIds.has(receipt.reset.server_instance_id)
  };
  projectIds.add(receipt.reset.project_id);browserIds.add(receipt.reset.browser_context_id);serverIds.add(receipt.reset.server_instance_id);
  write(files+'controls.json',{control,checks});
  trace.comparability_verified=Object.values(checks).every(Boolean);trace.controls_raw=files+'controls.json#/control';
  for(const observation of trace.observations) {
    const linked=final.observation_actions[observation.id]??[];
    assert.ok(linked.every(id=>observation.prior_action_ids.includes(id)),'Adjudication links a later or unexecuted action');
    observation.action_ids=observation.eligible?linked:[];
  }
  trace.grade={reviewer:adjudication.reviewer,items:reportItems(final.items),behaviors:final.behaviors,open_questions:final.open_questions,unsupported_claims:final.unsupported_claims,
    initial_1:`grades/grader-a.json#/samples/${sample}`,initial_2:`grades/grader-b.json#/samples/${sample}`,adjudication:`grades/adjudication.json#/samples/${sample}`};
}
const manifest={};function walk(dir,prefix=''){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const name=prefix+entry.name;if(entry.isDirectory())walk(path.join(dir,entry.name),name+'/');else if(!['packet.json','report.json','report-error.json'].includes(name))manifest[name]=hash(name);}}
walk(root);packet.manifest=manifest;packet.launch='launch.json';write('packet.json',packet);
const result=spawnSync(process.execPath,['evals/curated/typesafe-hr-protocol-347-v3/evaluate.mjs','report',path.join(root,'packet.json')],{encoding:'utf8',windowsHide:true});
if(result.status!==0)throw Object.assign(new Error('Frozen evaluator rejected the retained live packet'),{evaluator:{status:result.status,stdout:result.stdout,stderr:result.stderr}});
const report=JSON.parse(result.stdout);write('report.json',report);
write('independent-review-required.json',{status:'awaiting_independent_review',reviewer:launch.result_reviewer,packet_sha256:hash('packet.json'),report_sha256:hash('report.json')});
return report;
}

export function stageReport(inputRoot,build=buildReport) {
  const published=inputRoot+'-report';const stage=fs.mkdtempSync(path.join(path.dirname(inputRoot),'report-attempt-'));
  try {
    assert.ok(!fs.existsSync(published),'Completed report already exists');
    fs.cpSync(inputRoot,stage,{recursive:true,errorOnExist:true});
    const report=build(stage);fs.renameSync(stage,published);
    return {published,report};
  } catch(error) {
    const failure={decision:'inconclusive',reason:'Report preparation failed; every execution remains retained.',error:String(error),stack:error.stack,evaluator:error.evaluator??null,input:inputRoot};
    fs.writeFileSync(path.join(stage,'report-error.json'),JSON.stringify(failure,null,2)+'\n');
    return {failed:stage,failure};
  }
}

if(process.argv[1]?.endsWith('finalize-report.mjs')) {
  const result=stageReport(path.resolve(process.argv[2]??'.perquiro/348/evidence'));
  console.log(JSON.stringify(result.failed?{failed:result.failed,error:result.failure.error}:{published:result.published,independent_review:'pending'}));
  if(result.failed)process.exitCode=1;
}
