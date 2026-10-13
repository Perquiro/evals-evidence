import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateAndMeasure } from './analysis.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sorting = read('coordination-pilot/provenance/failure-sort-final.json');
const categories = ['never_tried', 'tried_but_missed_required_moment', 'save_rejected', 'quit_before_reaching_it', 'unknown'];
for (const file of read('RETENTION.json').files) {
  const bytes = fs.readFileSync(path.join(root, file.path));
  assert.equal(bytes.length, file.bytes, file.path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, file.path);
}
for (const policy of ['solo', 'continuation-approx', 'director-review']) {
  const base = `coordination-pilot/${policy}`;
  const packet = read(`${base}/packet.json`);
  const inventory = read(`${base}/inventory.json`);
  const run = sorting.runs.find(run => run.id === `coordination-${policy === 'continuation-approx' ? 'continuation' : policy === 'director-review' ? 'director' : policy}`);
  assert.ok(run, policy);
  const missedIds = read(`${base}/grade-final.json`).checks.filter(check => !check.saved).map(check => check.id).sort();
  assert.deepEqual(run.misses.map(miss => miss.id).sort(), missedIds);
  const counts = Object.fromEntries(categories.map(category => [category, 0]));
  for (const miss of run.misses) {
    assert.ok(categories.includes(miss.category));
    counts[miss.category]++;
  }
  assert.deepEqual(counts, run.counts);
  const events = new Set(packet.trace.map(event => event.event));
  const writes = new Set(packet.observations.map(observation => observation.writeEvent));
  for (const item of [...run.misses, ...run.diagnostics]) {
    for (const event of item.eventIds) assert.ok(events.has(event), `${policy}/event/${event}`);
    for (const event of item.writeEventIds) assert.ok(writes.has(event), `${policy}/write/${event}`);
  }
  for (const stage of ['initial', 'final']) {
    const measured = validateAndMeasure({ inventoryIds: inventory.items.map(item => item.id), packet, grade: read(`${base}/grade-${stage}.json`) });
    assert.deepEqual(measured, read(`${base}/measurement-${stage}.json`), `${policy}/${stage}`);
  }
  const outcome = read(`${base}/provenance/outcome.json`);
  assert.ok(outcome.finalized);
  assert.deepEqual(outcome.errors, []);
  assert.equal(outcome.serverClosure.kind, 'closed');
  assert.equal(outcome.serverClosure.exitCode, 0);
  for (const seat of outcome.closures) {
    assert.equal(seat.closure.kind, 'closed');
    assert.equal(seat.closure.exitCode, 0);
    assert.equal(seat.stopReason, null);
    assert.equal(seat.host.pending, false);
    assert.deepEqual(seat.host.mismatches, []);
    assert.equal(seat.host.agents.length, 1);
    assert.ok(seat.host.agents[0].turns.length);
    for (const turn of seat.host.agents[0].turns) {
      assert.equal(turn.model, 'gpt-6-luna');
      assert.equal(turn.effort, 'medium');
    }
  }
  console.log(JSON.stringify({ policy, ...read(`${base}/measurement-final.json`).final }));
}
