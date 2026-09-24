import test from 'node:test';
import assert from 'node:assert/strict';
import { validateGrade, reportItems } from './grading.mjs';
const context={reviewer:'grader-a',checklist:{items:[{id:'login'},{id:'readback'}]},samples:{sample:{actions:[{id:'action-1'}],observations:[{id:'observation-1'}]}}};
const fixture=()=>({reviewer:'grader-a',samples:{sample:{items:[{item_id:'login',credit:true,action_ids:['action-1'],observation_ids:['observation-1'],rationale:'Captured login and saved identity.'},{item_id:'readback',credit:false,action_ids:[],observation_ids:[],rationale:'No reload or subsequent readback was captured.'}],observation_actions:{'observation-1':['action-1']},behaviors:[],open_questions:[],unsupported_claims:[]}}});
test('complete independent judgment is accepted',()=>validateGrade(fixture(),context));
test('missing, duplicate and unknown checklist decisions are rejected',()=>{
  for(const mutate of [g=>g.samples.sample.items.pop(),g=>g.samples.sample.items[1].item_id='login',g=>g.samples.sample.items[1].item_id='invented']){const g=fixture();mutate(g);assert.throws(()=>validateGrade(g,context),/exactly one/);}
});
test('wrong reviewer, empty zero rationale and fabricated evidence are rejected',()=>{
  const wrong=fixture();wrong.reviewer='another';assert.throws(()=>validateGrade(wrong,context),/Reviewer/);
  const zero=fixture();zero.samples.sample.items[1].rationale='';assert.throws(()=>validateGrade(zero,context),/rationale/);
  const fabricated=fixture();fabricated.samples.sample.items[0].action_ids=['missing'];assert.throws(()=>validateGrade(fabricated,context),/unknown evidence/);
});
test('zero decisions retain their reason and partial support without becoming credit',()=>{
  const items=fixture().samples.sample.items;items[1].action_ids=['action-1'];
  const result=reportItems(items);assert.equal(result.length,2);assert.equal(result[1].rationale,items[1].rationale);assert.deepEqual(result[1].action_ids,[]);assert.deepEqual(result[1].partial_support.action_ids,['action-1']);
});
