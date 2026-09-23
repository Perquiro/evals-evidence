import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const directory = path.resolve(process.argv[2]);
const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
const call = async (name, args = {}) => {
  const response = await fetch(manifest.baseUrl + '/bridge/call', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, arguments: args }) });
  const result = await response.json();
  assert.ok(!result.isError, JSON.stringify(result));
  return JSON.parse(result.content.find(value => value.type === 'text').text);
};
const setup = await call('read_setup');
const actor = setup.actors.find(value => value.name === 'Reader');
assert.ok(actor);
const get = async route => (await fetch(manifest.baseUrl + route, { headers: { 'X-Actor': 'Reader' } })).json();
assert.equal((await get('/books/101')).available, true);
assert.equal((await get('/holds')).holds.length, 0);
const surface = await call('record_surface', { requestToken: randomUUID(), name: 'Reserve book', locator: 'POST /holds' });
const inventoryRequest = { requestToken: randomUUID(), surfaceId: surface.id, actorId: actor.id, platform: 'api', items: [{ key: 'reserve', name: 'Reserve River Atlas', kind: 'action' }], reports: [{ kind: 'inventory', body: 'River Atlas book 101 is available and offers POST /holds with bookId 101. Reader has no reservations.', looks: [{ kind: 'offered', item: { key: 'reserve' } }] }] };
const inventory = await call('record_inspection', inventoryRequest);
const attemptRequest = { requestToken: randomUUID(), surfaceId: surface.id, actorId: actor.id, platform: 'api', items: [], reports: [{ kind: 'action', body: 'River Atlas 101 is available and Reader has no reservations immediately before the request.', look: { kind: 'attempting', item: { id: inventory.items[0].id }, resourceRef: 'book:101; Reader holds' } }] };
const attempt = await call('record_inspection', attemptRequest);
assert.equal(attempt.authorizedAttemptIds.length, 1);
// Stop the host after Product acceptance. Read no response body and save no outcome.
const accepted = await fetch(manifest.baseUrl + '/holds', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Actor': 'Reader' }, body: JSON.stringify({ bookId: '101' }) });
assert.equal(accepted.status, 201);
fs.writeFileSync(path.join(directory, 'interruption.json'), JSON.stringify({ boundary: 'Product accepted reservation before host read response body', inventoryRequest, attemptRequest, attemptId: attempt.authorizedAttemptIds[0], productPostCountBeforeResume: 1, source: manifest.gitHead }, null, 2));
// The resumed Agent gets the lost-write request for safe replay, not the Product outcome.
fs.writeFileSync(path.join(manifest.workspace, 'pending-write.json'), JSON.stringify(attemptRequest, null, 2));
fs.writeFileSync(path.join(manifest.workspace, 'RESUME.md'), 'The prior Reader execution stopped after saving pending-write.json and around its intended reservation request. The external outcome is uncertain. Resume from saved Perquiro Knowledge, reconcile this attempt, and report what you established. Reader is the fixed Actor. Scope is this interrupted reservation only; at most 8 Product requests. Do not start unrelated checks.\n');
console.log(JSON.stringify({ surfaceId: surface.id, attemptId: attempt.authorizedAttemptIds[0], productPostCountBeforeResume: 1 }));
