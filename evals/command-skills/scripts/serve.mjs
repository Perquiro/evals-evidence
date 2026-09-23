import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { randomUUID, createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runSetup } from '../../../src/setup/setup.ts';
import { openMcpSession } from '../../../src/test-support/mcp-session.ts';
import { products, createProduct } from './products.mjs';
import { snapshotFixture } from './snapshot-fixture.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const [slug, outputArgument, variantArgument] = process.argv.slice(2);
if (!products[slug] || !outputArgument) throw new Error('Usage: node --import tsx evals/command-skills/scripts/serve.mjs <product> <output-directory>');
const output = path.resolve(outputArgument);
fs.mkdirSync(output, { recursive: true });
if (fs.existsSync(path.join(output, 'manifest.json'))) throw new Error('Use a fresh output directory for each attempt');
snapshotFixture(output, ['serve.mjs', 'products.mjs', 'library-product.mjs'].map(file => new URL(file, import.meta.url)));
const workspace = fs.mkdtempSync(path.join(os.tmpdir(), `${slug}-`));
const write = (directory, name, value) => fs.writeFileSync(path.join(directory, name), typeof value === 'string' ? value : JSON.stringify(value, null, 2));
const log = entry => fs.appendFileSync(path.join(output, 'events.jsonl'), JSON.stringify({ time: new Date().toISOString(), ...entry }) + '\n');
const product = createProduct(slug);
let session;
let phase = 'preparation';
let chain = Promise.resolve();
let active = true;
let sequence = 0;
const server = http.createServer((request, response) => {
  const receivedAt = performance.now();
  chain = chain.then(async () => {
    const startedAt = performance.now();
    const timing = () => ({ durationMs: performance.now() - startedAt, queueMs: startedAt - receivedAt });
    const url = new URL(request.url, 'http://127.0.0.1');
    let text = '';
    for await (const chunk of request) text += chunk;
    const send = (status, body) => {
      response.writeHead(status, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(body));
    };
    try {
      if (url.pathname === '/bridge/tools' && request.method === 'GET') {
        const result = await session.client.listTools();
        log({ phase, kind: 'tools', result, ...timing() });
        return send(200, result);
      }
      if (url.pathname === '/bridge/call' && request.method === 'POST') {
        const input = JSON.parse(text);
        const result = await session.client.callTool(input);
        log({ phase, kind: 'mcp', input, result, ...timing() });
        return send(200, result);
      }
      const input = { method: request.method, pathname: url.pathname, query: url.searchParams, actor: request.headers['x-actor'], body: text ? JSON.parse(text) : {} };
      const result = product(input);
      log({ phase, kind: 'product', input: { ...input, query: Object.fromEntries(url.searchParams) }, result, ...timing() });
      return send(result.status, result.body);
    } catch (error) {
      const bridgeRequest = (url.pathname === '/bridge/tools' && request.method === 'GET') || (url.pathname === '/bridge/call' && request.method === 'POST');
      log({ phase, kind: 'error', productRequest: !bridgeRequest, input: { method: request.method, pathname: url.pathname, actor: request.headers['x-actor'] }, message: error.message });
      send(500, { error: error.message });
    }
  }).catch(error => { console.error(error); response.destroy(); });
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}`;
try {
  const git = spawnSync('git', ['init', '-q', workspace], { encoding: 'utf8', windowsHide: true });
  if (git.status !== 0) throw new Error(git.stderr || 'git init failed');
  let actorPosition = 0;
  await runSetup({
    projectRoot: workspace, packageVersion: '0.0.1', verifyGlobalCli: () => {},
    prompt: async prompt => {
      if (prompt.kind === 'product') return products[slug].name;
      if (prompt.kind === 'url') return baseUrl;
      if (prompt.kind === 'agent') return 'openai';
      if (prompt.kind === 'add-actor') return actorPosition < products[slug].actors.length ? 'yes' : 'no';
      if (prompt.kind === 'new-actor-name') return products[slug].actors[actorPosition++];
      if (prompt.kind === 'new-actor-secrets') return '';
      throw new Error(`Unexpected Setup prompt: ${prompt.kind}`);
    },
  });
  const installedExplore = path.join(workspace, '.agents/skills/perquiro-explore/SKILL.md');
  const baselineExplore = fs.readFileSync(installedExplore);
  if (variantArgument) {
    const variant = fs.readFileSync(path.resolve(variantArgument), 'utf8');
    if (!variant.startsWith('---') || !variant.includes('name: perquiro-explore')) throw new Error('Expected an Explore skill variant');
    fs.writeFileSync(installedExplore, variant);
    write(output, 'baseline-explore.SKILL.md', baselineExplore.toString());
  }
  session = await openMcpSession(workspace);
  async function call(name, args = {}) {
    const input = { name, arguments: args };
    const result = await session.client.callTool(input);
    log({ phase, kind: 'mcp', input, result });
    if (result.isError) throw new Error(JSON.stringify(result.content));
    return JSON.parse(result.content.find(item => item.type === 'text').text);
  }
  const mutate = (name, args) => call(name, { requestToken: randomUUID(), ...args });
  const seed = {};
  if (slug === 'atlas-directory') {
    for (let index = 1; index <= 70; index++) await mutate('record_surface', { name: `Archive ${String(index).padStart(2, '0')}`, locator: `GET /archive/${index}` });
    seed.list = await mutate('record_surface', { name: 'Customers', locator: 'GET /customers' });
    seed.detail = await mutate('record_surface', { name: 'Customer details', locator: 'GET /customers/:id' });
    seed.journey = await mutate('record_journey', { name: 'Search customers', surfaceIds: [seed.list.id, seed.detail.id] });
    seed.observations = [];
    for (const [surfaceId, body] of [
      [seed.list.id, 'Searching Customers for Ada returned Ada North with id 101.'],
      [seed.detail.id, 'Opening customer 101 returned Ada North; opening customer 102 returned Ben West.'],
    ]) seed.observations.push(await mutate('record_observation', { surfaceId, actor: 'Member', journey: seed.journey.name, body }));
  }
  write(output, 'seed.json', seed);
  const skill = fs.readFileSync(installedExplore);
  write(output, 'explore.SKILL.md', skill.toString());
  const manifest = { product: slug, workspace, baseUrl, pid: process.pid, startedAt: new Date().toISOString(), skillSha256: createHash('sha256').update(skill).digest('hex'),
    gitHead: spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', windowsHide: true }).stdout.trim(),
    node: process.version, transport: 'Real Perquiro MCP client/server over an HTTP-to-MCP bridge; synthetic local HTTP Product',
    ...(variantArgument ? {variantSource: path.relative(root, path.resolve(variantArgument)), variantPreparation: 'Real Setup first; evaluator then replaced only installed Explore bytes before candidate dispatch', baselineExploreSha256: createHash('sha256').update(baselineExplore).digest('hex')} : {}),
    setup: 'Prepared through runSetup with scripted human answers; global CLI check skipped in fixture only',
    isolation: 'Fresh temporary Git Project; same shared host/filesystem; candidate instructed to stay in assigned Project. Not an OS access boundary.',
  };
  write(output, 'manifest.json', manifest);
  write(workspace, 'tools.mjs', `import fs from 'node:fs';\nconst [action,name,file] = process.argv.slice(2);\nconst base = ${JSON.stringify(baseUrl)};\nif (action !== 'list' && action !== 'call') throw new Error('Usage: node tools.mjs list | node tools.mjs call <tool> [arguments.json]');\nconst response = await fetch(base + (action === 'list' ? '/bridge/tools' : '/bridge/call'), action === 'list' ? {} : {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,arguments:file ? JSON.parse(fs.readFileSync(file,'utf8').replace(/^\\uFEFF/,'')) : {}})});\nconsole.log(JSON.stringify(await response.json(),null,2));\nif (!response.ok) process.exitCode = 1;\n`);
  write(workspace, 'ACCESS.md', `# ${products[slug].name}\n\nThis is a disposable local development Product. Its data and demo sessions are synthetic. All operations described by its API are permitted within the Actors in Setup.\n\nThe Product is an HTTP API. GET the URL from Setup, then follow its documentation. Use an HTTP client already installed on this machine. Set X-Actor to the available Actor name when selecting a demo session; there are no credentials.\n\nPerquiro MCP is connected through tools.mjs for this Project. Do not use other Perquiro connections from the host, which belong to other Projects.\n\n- List actual tool descriptions and schemas: node tools.mjs list\n- Call a tool with an empty argument object: node tools.mjs call read_setup\n- Call with a JSON argument file: node tools.mjs call record_surface arguments.json\n\nThe bridge returns the MCP result unchanged, including content and isError. Read the JSON text inside content. Store temporary request files and captures in this Project, outside .perquiro. Do not inspect bridge implementation or other workspaces.\n`);
  write(workspace, 'REQUEST.md', products[slug].prompt + '\n');
  write(output, 'request.md', products[slug].prompt + '\n');
  write(output, 'access.md', fs.readFileSync(path.join(workspace, 'ACCESS.md'), 'utf8'));
  write(output, 'agent-contract.md', fs.readFileSync(path.join(workspace, 'AGENTS.md'), 'utf8'));
  phase = 'candidate';
  console.log(JSON.stringify({ workspace, output, baseUrl, pid: process.pid }));
  const interval = setInterval(async () => {
    if (!active || !fs.existsSync(path.join(output, 'STOP'))) return;
    active = false;
    clearInterval(interval);
    try {
      await chain;
      phase = 'inspection';
      const catalog = await call('read_knowledge_catalog');
      const entries = [...catalog.entries.items];
      const relationships = [...catalog.storedRelationships.items];
      let page = catalog;
      while (!page.entries.complete || !page.storedRelationships.complete) {
        const args = {};
        if (!page.entries.complete) args.entryContinuation = page.entries.continuation;
        if (!page.storedRelationships.complete) args.relationshipContinuation = page.storedRelationships.continuation;
        const next = await call('read_knowledge_catalog', args);
        if (!page.entries.complete) entries.push(...next.entries.items);
        if (!page.storedRelationships.complete) relationships.push(...next.storedRelationships.items);
        page = { ...next, entries: page.entries.complete ? page.entries : next.entries, storedRelationships: page.storedRelationships.complete ? page.storedRelationships : next.storedRelationships };
      }
      write(output, 'final-catalog.json', { revision: catalog.revision, coverage: catalog.coverage, entries, storedRelationships: relationships });
      write(output, 'final-reviews.json', await call('list_open_reviews'));
      write(output, 'final-work.json', await call('read_follow_on_work'));
      manifest.finishedAt = new Date().toISOString();
      write(output, 'manifest.json', manifest);
    } finally {
      await session.close();
      server.close();
    }
  }, 500);
} catch (error) {
  await session?.close();
  server.close();
  throw error;
}
