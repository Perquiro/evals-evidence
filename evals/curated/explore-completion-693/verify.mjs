import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateAndMeasure } from './analysis.mjs';
const root = path.dirname(fileURLToPath(import.meta.url));
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
for (const file of read('RETENTION.json').files) {
  const bytes = fs.readFileSync(path.join(root, file.path));
  assert.equal(bytes.length, file.bytes, file.path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, file.path);
}
for (const run of ['luna-1', 'luna-2', 'luna-3']) {
  const packet = read(`${run}/packet.json`);
  const inventory = read(`${run}/inventory.json`);
  const grade = read(`${run}/grade-final.json`);
  const measured = validateAndMeasure({ inventoryIds: inventory.items.map(item => item.id), packet, grade });
  assert.deepEqual(measured, read(`${run}/measurement.json`), `${run} measurement`);
  const sorted = read(run === 'luna-3' ? 'luna-3/failure-sorting-final.json' : 'failure-sorting-final.json').runs.find(item => item.id === run);
  const categories = ['never_tried', 'tried_but_missed_required_moment', 'save_rejected', 'quit_before_reaching_it', 'unknown'];
  assert.deepEqual(sorted.misses.map(item => item.id).sort(), grade.checks.filter(item => !item.saved).map(item => item.id).sort(), `${run} missed inventory`);
  for (const category of categories) assert.equal(sorted.misses.filter(item => item.category === category).length, sorted.counts[category], `${run} ${category}`);
  assert.ok(sorted.misses.every(item => categories.includes(item.category)), 'Unknown classification');
  const traceIds = new Set(packet.trace.map(event => event.event));
  for (const item of sorted.misses) for (const id of item.eventIds) assert.ok(traceIds.has(id), `${run} unknown trace event ${id}`);
  const writeIds = new Set(packet.observations.map(observation => observation.writeEvent));
  for (const item of sorted.misses) for (const id of item.writeEventIds ?? []) assert.ok(writeIds.has(id), `${run} unknown write event ${id}`);
  console.log(JSON.stringify({ run, ...measured }));
}
