import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { openMcpSession } from '../../../src/test-support/mcp-session.ts';

const directory = path.resolve(process.argv[2]);
const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
assert.ok(manifest.finishedAt, 'Stop the fixture before opening final read session');
const catalog = JSON.parse(fs.readFileSync(path.join(directory, 'final-catalog.json'), 'utf8'));
const session = await openMcpSession(manifest.workspace);
const write = (name, data) => {
  const target = path.join(directory, name);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(data, null, 2));
};
async function call(name, args) {
  const input = { name, arguments: args };
  const result = await session.client.callTool(input);
  fs.appendFileSync(path.join(directory, 'events.jsonl'), JSON.stringify({ time: new Date().toISOString(), phase: 'inspection', kind: 'mcp', input, result }) + '\n');
  assert.ok(!result.isError);
  return JSON.parse(result.content.find(block => block.type === 'text').text);
}
try {
  for (const surface of catalog.entries.filter(item => item.kind === 'surface')) {
    const args = { surfaceId: surface.id, actorIds: catalog.entries.filter(item => item.kind === 'actor').map(item => item.id), productVersions: { scope: 'all' } };
    const pages = [];
    const finished = new Set();
    let incomplete;
    do {
      const page = await call('read_explore', args);
      pages.push(page);
      const tokens = Object.fromEntries(Object.entries(page).flatMap(([key, value]) => {
        if (!value || typeof value !== 'object' || finished.has(key)) return [];
        if (value.complete === true) finished.add(key);
        return value.complete === false && typeof value.continuation === 'string' ? [[key, value.continuation]] : [];
      }));
      // Completed collections need no further page. For a collection with no
      // continuation on this round, later repeated first pages are ignored by consumers.
      incomplete = Object.keys(tokens).length > 0;
      args.continuations = tokens;
    } while (incomplete);
    write(`explore/surface-${surface.id}.json`, pages);
  }
  for (const actor of catalog.entries.filter(item => item.kind === 'actor')) {
    const args = { anchor: { kind: 'actor', id: actor.id }, productVersions: { scope: 'all' }, observations: { detail: 'records', actorIds: [actor.id], scope: 'both' } };
    const pages = []; let page;
    do {
      page = await call('read_knowledge_context', args); pages.push(page);
      if (!page.storedRelationships.complete) args.relationshipContinuation = page.storedRelationships.continuation; else delete args.relationshipContinuation;
      if (!page.projections.complete) args.projectionContinuation = page.projections.continuation; else delete args.projectionContinuation;
    } while (!page.storedRelationships.complete || !page.projections.complete);
    write(`contexts/actor-${actor.id}.json`, pages);
  }
  for (const entry of catalog.entries.filter(item => item.kind === 'evidence')) {
    const evidence = await call('read_evidence', { evidenceId: entry.id });
    write(`evidence/${entry.id}.json`, evidence);
    const source = path.resolve(manifest.workspace, evidence.containerPath);
    assert.ok(source.startsWith(manifest.workspace + path.sep));
    fs.cpSync(source, path.join(directory, 'evidence', entry.id), { recursive: true });
  }
  console.log('Captured final Actor Observation contexts and referenced Evidence.');
} finally { await session.close(); }
