import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createProjectFixture, removeProjectFixture } from '../../../src/test-support/project-fixture.ts';
import { openMcpSession } from '../../../src/test-support/mcp-session.ts';
import { exportKnowledge } from './export.mjs';

test('public export keeps Observations beyond the first context page',async()=>{
  const f=await createProjectFixture();const session=await openMcpSession(f.projectRoot);
  const call=async(name,args)=>session.client.callTool({name,arguments:args});
  try {
    const raw=await call('record_surface',{requestToken:randomUUID(),name:'Export probe',locator:'/export'});
    assert.notEqual(raw.isError,true,JSON.stringify(raw));const surface=JSON.parse(raw.content[0].text);
    const surfaceId=surface.id;
    for(let n=0;n<70;n++) {
      const result=await call('record_observation',{requestToken:randomUUID(),surfaceId,actor:'Admin',body:`Distinct exported fact ${n}`});
      assert.notEqual(result.isError,true,JSON.stringify(result));
    }
    const exported=await exportKnowledge(call,f.adminId);
    assert.equal(exported.catalogPages[0].value.coverage.observations,70);
    const bodies=new Set();
    function collect(value) {
      if(!value||typeof value!=='object')return;
      if(typeof value.body==='string')bodies.add(value.body);
      for(const child of Object.values(value))collect(child);
    }
    for(const page of exported.contexts)collect(page.value);
    for(let n=0;n<70;n++)assert.ok(bodies.has(`Distinct exported fact ${n}`),`Missing Observation ${n}`);
    assert.ok(exported.contexts.length>1);
  }finally{await session.close();removeProjectFixture(f.projectRoot);}
});
