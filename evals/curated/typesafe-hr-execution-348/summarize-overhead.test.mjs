import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { preparationAdviceStatus, indexCapture } from './summarize-overhead.mjs';
import { sha } from './execute.mjs';

test('preflight MCP envelopes distinguish usable advice from HTTP errors and invalid results',()=>{
  const receipt={liveAdvice:{content:[{type:'text',text:'{"status":"selected","candidateId":"inspect_login","source":"typesafe"}'}]}};
  assert.equal(preparationAdviceStatus(receipt,{status:200}),'ok');
  assert.notEqual(preparationAdviceStatus(receipt,{status:503}),'ok');
  assert.equal(preparationAdviceStatus({liveAdvice:{content:[{type:'text',text:'{"status":"no_selection"}'}]}},{status:200}),'ok');
  assert.equal(preparationAdviceStatus({liveAdvice:{content:[{type:'text',text:'bad json'}]}},{status:200}),'unattributed_response');
});

test('preparation JSONL citations preserve source hash and exact event index',()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hr-overhead-'));
  const bytes=Buffer.from('{"type":"turn.started"}\n{"type":"turn.completed","usage":{"input_tokens":12}}\n');
  const events=bytes.toString().trim().split('\n').map(JSON.parse);
  const index=indexCapture(directory,'host.jsonl',bytes,events);
  const saved=JSON.parse(fs.readFileSync(path.join(directory,'host.jsonl.index.json')));
  assert.equal(saved.sha256,sha(bytes));assert.deepEqual(saved.events[1],events[1]);
  assert.equal(index.path+'#/events/1','preparation/host.jsonl.index.json#/events/1');
});
