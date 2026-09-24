import test from 'node:test';
import assert from 'node:assert/strict';
import { hostCalls } from './prepare-evidence.mjs';

const update=(at,total)=>({at_ms:at,msg:{method:'thread/tokenUsage/updated',params:{tokenUsage:{total}}}});
const counters=(input,output,cached=0)=>({inputTokens:input,outputTokens:output,cachedInputTokens:cached,cacheWriteInputTokens:0,reasoningOutputTokens:0});
test('host accounting differences cumulative counters and ignores repeated totals',()=>{
  const calls=hostCalls([update(1,counters(100,10)),update(2,counters(250,30,80)),update(3,counters(250,30,80))]);
  assert.equal(calls.length,2);
  assert.deepEqual(calls.map(c=>c.usage.input),[100,150]);
  assert.equal(calls.reduce((n,c)=>n+c.usage.output,0),30);
  assert.equal(calls[1].usage.cached_input,80);
});
test('missing or backwards cumulative classifications stay unknown',()=>{
  const calls=hostCalls([update(1,counters(100,10,50)),update(2,{inputTokens:150,outputTokens:20,cachedInputTokens:20})]);
  assert.equal(calls[1].usage.input,50);
  assert.equal(calls[1].usage.cached_input,null);
  assert.equal(calls[1].usage.cache_write_input,null);
  assert.equal(calls[1].usage.reasoning_output,null);
});
test('host-reported failure remains an unpriced attempt',()=>{
  const calls=hostCalls([{at_ms:2,msg:{method:'error',params:{message:'failed'}}}]);
  assert.equal(calls[0].status,'error');assert.equal(calls[0].usage,null);
});
test('usage without delivered model output is not labeled a usable success',()=>{
  const calls=hostCalls([update(1,counters(100,10)),{at_ms:2,msg:{method:'error',params:{message:'timeout'}}}]);
  assert.equal(calls[0].status,'unattributed_usage');assert.equal(calls[1].status,'error');
});
test('a delivered tool-call response stays usable when a later turn attempt fails',()=>{
  const calls=hostCalls([{at_ms:0,direction:'received',msg:{method:'item/tool/call',params:{tool:'browser_action'}}},update(1,counters(100,10)),{at_ms:2,msg:{method:'error',params:{message:'timeout'}}}]);
  assert.equal(calls[0].status,'ok');assert.deepEqual(calls[0].usable_output_event_indices,[0]);assert.equal(calls[1].status,'error');
});
