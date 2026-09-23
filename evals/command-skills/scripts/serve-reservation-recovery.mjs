// Fresh-Agent proof uses the exact HTTP Product exercised by the automated matrix.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { randomUUID, createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { startReservationProduct } from '../../../src/test-support/reservation-product.ts';
import { runSetup } from '../../../src/setup/setup.ts';
import { openMcpSession } from '../../../src/test-support/mcp-session.ts';

const output = path.resolve(process.argv[2]);
fs.mkdirSync(output, { recursive: true });
assert.ok(!fs.existsSync(path.join(output, 'manifest.json')), 'Use a fresh result directory');
const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'reservation-recovery-'));
const write = (base, name, data) => fs.writeFileSync(path.join(base, name), typeof data === 'string' ? data : JSON.stringify(data, null, 2));
let phase = 'preparation';
const log = event => fs.appendFileSync(path.join(output, 'events.jsonl'), JSON.stringify({ time: new Date().toISOString(), phase, ...event }) + '\n');
const product = await startReservationProduct(true, event => log({ kind: 'product_effect', event }), input => log({ kind: 'product_request', input }));
assert.equal(spawnSync('git', ['init', '-q', workspace], { windowsHide: true }).status, 0);
let actorAdded = false;
await runSetup({ projectRoot: workspace, packageVersion: 'proof', verifyGlobalCli: () => {}, prompt: async prompt => {
  if (prompt.kind === 'product') return 'Reservation Product';
  if (prompt.kind === 'url') return product.url;
  if (prompt.kind === 'agent') return 'openai';
  if (prompt.kind === 'add-actor') { if (actorAdded) return 'no'; actorAdded = true; return 'yes'; }
  if (prompt.kind === 'new-actor-name') return 'Customer';
  if (prompt.kind === 'new-actor-secrets') return '';
  throw new Error(`Unexpected Setup prompt ${prompt.kind}`);
} });
let session = await openMcpSession(workspace);
async function call(name, args = {}) {
  const input = { name, arguments: args };
  const result = await session.client.callTool(input);
  log({ kind: 'mcp', input, result });
  assert.ok(!result.isError, JSON.stringify(result));
  return JSON.parse(result.content.find(block => block.type === 'text').text);
}
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(product.url + '/reserve');
const reserveBody = await page.locator('body').innerText();
assert.match(reserveBody, /Reserve/);
assert.equal(await product.readState(), 'none');
const actor = (await call('read_setup')).actors[0];
const surface = await call('record_surface', { requestToken: randomUUID(), name: 'Reserve', locator: '/reserve' });
const inventory = await call('record_inspection', { requestToken: randomUUID(), surfaceId: surface.id, actorId: actor.id, platform: 'browser', productVersion: '2.5', items: [{ key: 'reserve', name: 'Reserve', kind: 'action' }], reports: [{ kind: 'inventory', body: 'The Reserve page offers a Reserve submit button. Current Product state says there is no reservation and version is 2.5.', looks: [{ kind: 'offered', item: { key: 'reserve' } }] }] });
const pending = { requestToken: randomUUID(), surfaceId: surface.id, actorId: actor.id, platform: 'browser', productVersion: '2.5', items: [], reports: [{ kind: 'action', body: 'Reserve is offered and the current Product state has no reservation immediately before POST /reservations.', look: { kind: 'attempting', item: { id: inventory.items[0].id }, resourceRef: 'reservation:42' } }] };
const attempt = await call('record_inspection', pending);
assert.equal(attempt.authorizedAttemptIds.length, 1);
const accepted = await fetch(product.url + '/reservations', { method: 'POST', headers: { 'x-perquiro-attempt-id': attempt.authorizedAttemptIds[0] } });
assert.equal(accepted.status, 201);
// Do not consume the response body or publish an outcome. Close the original MCP
// session and browser so the resumed Agent cannot inherit their transient state.
await session.close(); await browser.close();
write(output, 'interruption.json', { boundary: 'Product accepted Reserve before response body was read', attemptId: attempt.authorizedAttemptIds[0], request: pending, inventory, productEvents: product.events, reservationCount: product.reservationCount() });
session = await openMcpSession(workspace);
const resumedBrowser = await chromium.launch({ headless: true });
const resumedPage = await resumedBrowser.newPage();
async function snapshot() {
  return { url: resumedPage.url(), text: await resumedPage.locator('body').innerText(), inputs: await resumedPage.locator('input').evaluateAll(inputs => inputs.map(input => ({ id: input.id, value: input.value, required: input.required, visible: input.getClientRects().length > 0, valid: input.validity.valid, validationMessage: input.validationMessage }))) };
}
const server = http.createServer(async (request, response) => {
  const started = performance.now();
  let raw = ''; for await (const part of request) raw += part;
  try {
    const input = raw ? JSON.parse(raw) : {};
    let result;
    if (request.url === '/tools') { result = await session.client.listTools(); log({ kind: 'tools', result, durationMs: performance.now() - started }); }
    else if (request.url === '/mcp') {
      result = await session.client.callTool(input);
      log({ kind: 'mcp', input, result, durationMs: performance.now() - started });
    } else if (request.url === '/browser') {
      if (input.action === 'goto') { assert.equal(new URL(input.url).origin, product.url); await resumedPage.goto(input.url); }
      else if (input.action === 'click') { await resumedPage.setExtraHTTPHeaders(input.attemptId ? { 'x-perquiro-attempt-id': input.attemptId } : {}); await resumedPage.getByRole(input.role, { name: input.name, exact: true }).click(); }
      else if (input.action === 'fill') await resumedPage.getByLabel(input.label, { exact: true }).fill(input.value);
      else assert.equal(input.action, 'snapshot');
      result = await snapshot(); log({ kind: 'browser', input, result, durationMs: performance.now() - started });
    } else throw new Error('Unknown proof adapter');
    response.writeHead(200, { 'content-type': 'application/json' }); response.end(JSON.stringify(result));
  } catch (error) { log({ kind: 'adapter_error', message: error.message }); response.writeHead(500); response.end(JSON.stringify({ error: error.message })); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const bridge = `http://127.0.0.1:${server.address().port}`;
const skill = fs.readFileSync(path.join(workspace, '.agents/skills/perquiro-explore/SKILL.md'));
write(output, 'explore.SKILL.md', skill.toString());
fs.mkdirSync(path.join(output, 'fixture-sources'));
for (const url of [import.meta.url, new URL('../../../src/test-support/reservation-product.ts', import.meta.url)]) {
  const source = fileURLToPath(url); fs.copyFileSync(source, path.join(output, 'fixture-sources', path.basename(source)));
}
const manifest = { workspace, output, productUrl: product.url, bridge, startedAt: new Date().toISOString(), skillSha256: createHash('sha256').update(skill).digest('hex'), gitHead: spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', windowsHide: true }).stdout.trim(), sourceState: 'HEAD plus extraction of the shared tested Product fixture and this proof adapter', node: process.version };
write(output, 'manifest.json', manifest);
write(workspace, 'pending-write.json', pending);
write(workspace, 'tools.mjs', `import fs from 'node:fs';\nconst [mode,file] = process.argv.slice(2);\nconst input=file?JSON.parse(fs.readFileSync(file,'utf8').replace(/^\\uFEFF/,'')):{};\nconst response=await fetch(${JSON.stringify(bridge)}+'/'+mode,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input)});\nconsole.log(JSON.stringify(await response.json(),null,2));\nif(!response.ok)process.exitCode=1;\n`);
write(workspace, 'ACCESS.md', `This is a disposable synthetic Product with one Customer session and no credentials. All described checks are authorized. The prior execution stopped around its Reserve request; its external outcome is uncertain. Resume from MCP Knowledge and pending-write.json. Reconcile the original action, then continue Reservation details, Actions, and cancellation, including separately observed required-field behavior. Keep Customer fixed. At most 20 new Product requests; no unrelated work or new reservation without established need.\n\nUse node tools.mjs tools for MCP schemas. Use node tools.mjs mcp request.json with {name,arguments}. The response is unchanged MCP content. Browser control is an actual fresh Playwright Chromium page: node tools.mjs browser request.json accepts {action:'goto',url}, {action:'click',role,name,attemptId?}, {action:'fill',label,value}, or {action:'snapshot'}. Snapshots contain actual visible body text and input required/validity state. A click carrying attemptId sends that accepted id as the Product header for trace attribution; this is not authorization by itself. Product URL: ${product.url}. Current-state read: GET ${product.url}/api/reservations/42. Stay in this Project and do not read SQLite, other Projects, fixture sources, or .perquiro except an exact MCP-returned Evidence path. The installed Explore skill applies. Save SUMMARY.md and captures here.\n`);
write(output, 'access.md', fs.readFileSync(path.join(workspace, 'ACCESS.md'), 'utf8'));
phase = 'candidate'; console.log(JSON.stringify(manifest));
const timer = setInterval(async () => {
  if (!fs.existsSync(path.join(output, 'STOP'))) return;
  clearInterval(timer); phase = 'inspection';
  try {
    const catalog = await call('read_knowledge_catalog');
    assert.ok(catalog.entries.complete && catalog.storedRelationships.complete);
    write(output, 'final-catalog.json', { entries: catalog.entries.items, storedRelationships: catalog.storedRelationships.items, revision: catalog.revision });
    write(output, 'product-final.json', { events: product.events, reservationCount: product.reservationCount(), state: await product.readState() });
    manifest.finishedAt = new Date().toISOString(); write(output, 'manifest.json', manifest);
  } finally { await session.close(); await resumedBrowser.close(); server.close(); await product.close(); }
}, 500);
