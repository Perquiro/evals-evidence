import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { stageReport, noModelReroute } from './finalize-report.mjs';

test('a reroute invalidates the model control even when initial settings match',()=>{
  const initial={direction:'received',msg:{method:'thread/started',params:{thread:{model:'gpt-5.6-terra'}}}};
  assert.equal(noModelReroute([initial]),true);
  assert.equal(noModelReroute([initial,{direction:'received',msg:{method:'model/rerouted',params:{toModel:'another-model'}}}]),false);
});

test('a failed report build retains its error and partial output without changing its input',()=>{
  const parent=fs.mkdtempSync(path.join(os.tmpdir(),'perquiro-report-'));const input=path.join(parent,'input');fs.mkdirSync(input);fs.writeFileSync(path.join(input,'original.json'),'{}');
  const failed=stageReport(input,stage=>{fs.writeFileSync(path.join(stage,'controls.json'),'{}');throw new Error('invalid grade');});
  assert.ok(failed.failed);assert.match(JSON.parse(fs.readFileSync(path.join(failed.failed,'report-error.json'))).error,/invalid grade/);
  assert.ok(fs.existsSync(path.join(failed.failed,'controls.json')));assert.ok(!fs.existsSync(path.join(input,'controls.json')));assert.ok(!fs.existsSync(input+'-report'));
  const retried=stageReport(input,stage=>{fs.writeFileSync(path.join(stage,'report.json'),'{}');return {ok:true};});
  assert.equal(retried.published,input+'-report');assert.ok(fs.existsSync(path.join(retried.published,'report.json')));assert.ok(fs.existsSync(failed.failed));
  const repeat=stageReport(input,()=>{throw new Error('must not run');});assert.match(repeat.failure.error,/already exists/);
});

test('missing report inputs are retained as an inconclusive attempt',()=>{
  const parent=fs.mkdtempSync(path.join(os.tmpdir(),'perquiro-report-missing-'));
  const result=stageReport(path.join(parent,'missing'));
  assert.equal(result.failure.decision,'inconclusive');assert.ok(fs.existsSync(path.join(result.failed,'report-error.json')));
});
