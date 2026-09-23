import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const directory = path.resolve(process.argv[2]);
const names = ['memory-a', 'memory-b', 'memory-c', 'v8-a', 'v8-b'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const results = names.map(name => {
  const root = path.join(directory, name);
  const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const manifest = read('manifest.json');
  assert.ok(manifest.finishedAt, `${name} must be stopped`);
  assert.equal(hash(fs.readFileSync(path.join(root, 'private-inventory.json'))), 'def22bf386a557e786a69ec4f2579d416c76c0c4f39554e182b5be757ca7756d');
  const skillHash = hash(fs.readFileSync(path.join(root, 'explore.SKILL.md')));
  const expectedSkill = name === 'memory-b' ? read('pre-dispatch-refresh.json').skillSha256 : manifest.skillSha256;
  assert.equal(skillHash, expectedSkill, `${name} installed skill snapshot`);
  const fixtureHashes = read('fixture-hashes.json');
  for (const [file, expected] of Object.entries(fixtureHashes)) assert.equal(hash(fs.readFileSync(path.join(root, 'fixture-sources', file))), expected, `${name} ${file}`);
  const publicRecords = new Map();
  const visit = value => {
    if (!value || typeof value !== 'object') return;
    if (value.kind === 'observations' && Array.isArray(value.observations) && value.actor && value.context) {
      for (const observation of value.observations) publicRecords.set(observation.id, {
        ...observation, actorId: value.actor.id,
        surfaceId: value.context.kind === 'surface' ? value.context.id : observation.surfaceId,
        journeyId: value.context.kind === 'journey' ? value.context.id : undefined,
        productVersion: value.productVersion ?? observation.productVersion,
      });
    }
    for (const child of Object.values(value)) visit(child);
  };
  for (const file of fs.readdirSync(path.join(root, 'contexts'))) visit(read(`contexts/${file}`));
  const observations = read('observation-audit.json');
  for (const observation of observations) {
    const stored = publicRecords.get(observation.id);
    assert.ok(stored, `${name} missing public Observation ${observation.id}`);
    for (const key of ['id', 'seq', 'body', 'surfaceId', 'actorId', 'journeyId', 'productVersion']) assert.equal(stored[key], observation[key], `${name} immutable ${key}`);
  }
  const assessment = read('assessment.json');
  assert.equal(assessment.items.length, 25);
  assert.equal(assessment.surfaces.length, 11);
  assert.equal(assessment.tasks.length, 6);
  return { name, passed: true, observationsConfirmedInFinalPublicReads: observations.length, skillHash, fixtureFiles: Object.keys(fixtureHashes).length, frozenOutcomes: assessment.items.length };
});
fs.writeFileSync(path.join(directory, 'integrity-validation.json'), JSON.stringify({ results, limits: 'Checks bytes, immutable record fields and complete inventory shape. Semantic grading and causal interpretation remain human judgments in grading-notes.json and quality-notes.json.' }, null, 2));
console.log(JSON.stringify(results));
