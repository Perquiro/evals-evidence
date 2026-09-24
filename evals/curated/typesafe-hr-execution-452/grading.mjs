import assert from 'node:assert/strict';

const text=value=>typeof value==='string'&&value.trim().length>0;
const ids=(values,known,label)=>{
  assert.ok(Array.isArray(values)&&values.every(text),label+' must be an ID array');
  assert.equal(new Set(values).size,values.length,label+' contains duplicate IDs');
  assert.ok(values.every(id=>known.has(id)),label+' names unknown evidence');
};

export function validateGrade(grade,{reviewer,samples,checklist}) {
  assert.ok(text(grade.reviewer),'Reviewer identity is required');
  if(reviewer)assert.equal(grade.reviewer,reviewer,'Reviewer differs from frozen identity');
  assert.deepEqual(Object.keys(grade.samples).sort(),Object.keys(samples).sort(),'Every anonymous sample needs a grade');
  for(const [name,source] of Object.entries(samples)) {
    const sample=grade.samples[name];const actions=new Set(source.actions.map(a=>a.id));const observations=new Set(source.observations.map(o=>o.id));
    assert.deepEqual(sample.items.map(i=>i.item_id).sort(),checklist.items.map(i=>i.id).sort(),'Every checklist item needs exactly one decision');
    for(const item of sample.items) {
      assert.equal(typeof item.credit,'boolean','Credit must be explicit');assert.ok(text(item.rationale),'Every credit and zero needs a rationale');
      ids(item.action_ids,actions,'Item actions');ids(item.observation_ids,observations,'Item Observations');
      if(item.credit)assert.ok(item.action_ids.length&&item.observation_ids.length,'Credit needs action and saved Observation support');
    }
    assert.ok(sample.observation_actions&&typeof sample.observation_actions==='object'&&!Array.isArray(sample.observation_actions),'Observation attribution is required');
    for(const [id,links] of Object.entries(sample.observation_actions)){assert.ok(observations.has(id),'Attribution names an unknown Observation');ids(links,actions,'Attributed actions');}
    assert.ok(Array.isArray(sample.behaviors),'Behavior list is required');
    assert.equal(new Set(sample.behaviors.map(b=>b.id)).size,sample.behaviors.length,'Duplicate behavior IDs');
    for(const behavior of sample.behaviors){assert.ok(text(behavior.id)&&text(behavior.description),'Behavior needs identity and description');ids(behavior.action_ids,actions,'Behavior actions');ids(behavior.observation_ids,observations,'Behavior Observations');}
    for(const field of ['open_questions','unsupported_claims'])assert.ok(Array.isArray(sample[field]),field+' must be a list');
  }
}

export function reportItems(items) {
  return items.map(({credit,...item})=>credit?item:{...item,partial_support:{action_ids:item.action_ids,observation_ids:item.observation_ids},action_ids:[],observation_ids:[]});
}
