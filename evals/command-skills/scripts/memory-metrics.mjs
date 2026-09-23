import fs from 'node:fs';
import path from 'node:path';

const directory = path.resolve(process.argv[2]);
const events = fs.readFileSync(path.join(directory, 'events.jsonl'), 'utf8').trim().split('\n').map((line, index) => ({ event: index + 1, ...JSON.parse(line) }));
const candidate = events.filter(event => event.phase === 'candidate');
const isProductRequest = event => event.kind === 'product' || (event.kind === 'error' && event.productRequest !== false);
const parsed = result => {
  try { return JSON.parse(result.content.find(value => value.type === 'text').text); } catch { return undefined; }
};
const surfaces = new Map(), actors = new Map(), attempts = [];
const mutations = [];
for (const event of candidate) {
  if (event.kind === 'mcp' && !event.result.isError) {
    const result = parsed(event.result);
    if (event.input.name === 'read_setup') for (const actor of result.actors) actors.set(actor.id, actor.name);
    if (event.input.name === 'record_surface') surfaces.set(result.id, result);
    if (event.input.name === 'record_inspection') {
      const args = event.input.arguments;
      for (const id of result.authorizedAttemptIds) attempts.push({ event: event.event, id, actor: actors.get(args.actorId), surface: surfaces.get(args.surfaceId), body: result.observations.find(value => value.id === id)?.body ?? '', consumed: false });
      for (const report of args.reports) {
        if (report.look?.reconciliation !== 'not_executed') continue;
        const attempt = attempts.find(value => value.id === report.look.attemptObservationId);
        if (attempt) attempt.reconciledWithoutDispatch = true;
      }
    }
  }
  if (isProductRequest(event) && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(event.input.method)) {
    const match = attempts.find(value => {
      if (value.consumed || value.reconciledWithoutDispatch || value.actor !== event.input.actor) return false;
      if (value.body.includes(`${event.input.method} ${event.input.pathname}`)) return true;
      const locator = value.surface?.locator ?? '';
      const [method, route] = locator.split(' ');
      if (method !== event.input.method || !route) return false;
      const segments = route.split('/'), actual = event.input.pathname.split('/');
      return segments.length === actual.length && segments.every((segment, index) => segment.startsWith(':') || segment === actual[index]);
    });
    if (match) match.consumed = true;
    mutations.push({ event: event.event, method: event.input.method, path: event.input.pathname, actor: event.input.actor, status: event.result?.status ?? 500, resultKind: event.kind, acceptedAttemptEvent: match?.event ?? null, attemptId: match?.id ?? null });
  }
}
const writes = candidate.filter(event => event.kind === 'mcp' && !/^(read_|list_)/.test(event.input.name));
const reads = candidate.filter(event => event.kind === 'mcp' && /^(read_|list_)/.test(event.input.name));
const observations = writes.flatMap(event => {
  if (event.result.isError) return [];
  const value = parsed(event.result);
  return event.input.name === 'record_inspection' ? value.observations.map(observation => ({ event: event.event, ...observation })) : event.input.name === 'record_observation' ? [{ event: event.event, ...value }] : [];
});
const observationMap = new Map();
for (const value of observations) if (!observationMap.has(value.id)) observationMap.set(value.id, value);
const uniqueObservations = [...observationMap.values()];
const latency = kind => {
  const values = candidate.filter(event => event.kind === kind && Number.isFinite(event.durationMs)).map(event => event.durationMs).sort((a, b) => a - b);
  return values.length ? { samples: values.length, totalMs: values.reduce((a, b) => a + b, 0), medianMs: values[Math.floor(values.length / 2)], p95Ms: values[Math.min(values.length - 1, Math.floor(values.length * .95))] } : null;
};
const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
const metrics = {
  productRequests: candidate.filter(isProductRequest).length, mcpReads: reads.length, mcpWrites: writes.length,
  unclassifiedProductErrors: candidate.filter(event => event.kind === 'error' && event.productRequest === undefined).map(event => event.event),
  uniqueSuccessfulMcpWriteTokens: new Set(writes.filter(event => !event.result.isError).map(event => event.input.arguments.requestToken)).size,
  failedMcpWrites: writes.filter(event => event.result.isError).length, schemaReads: candidate.filter(event => event.kind === 'tools').length,
  observations: uniqueObservations.length, acceptedAttempts: attempts.length, reconciledWithoutDispatch: attempts.filter(value => value.reconciledWithoutDispatch).map(value => ({ id: value.id, event: value.event })), mutations,
  mutationsWithoutMatchedAttempt: mutations.filter(value => value.attemptId === null).length,
  elapsedMs: manifest.finishedAt ? Date.parse(manifest.finishedAt) - Date.parse(manifest.startedAt) : null,
  candidateActivitySpanMs: candidate.length ? Date.parse(candidate.at(-1).time) - Date.parse(candidate[0].time) : null,
  firstObservationDelayMs: uniqueObservations.length && candidate.length ? Date.parse(uniqueObservations[0].createdAt) - Date.parse(candidate[0].time) : null,
  latency: { mcp: latency('mcp'), product: latency('product'), schema: latency('tools') },
  limitations: [
    'Attempt matching uses the returned Actor and either METHOD/path Surface identity or the exact METHOD/path named in grounded preconditions. Every mapping needs human trace inspection; this is not semantic proof that a marker authorized an arbitrary request.',
    'Elapsed time includes host scheduling and idle waits. Server latency excludes model reasoning and host tool/UI latency; absent samples mean unavailable.',
    'Outcome durability and false reopens require grading against public final reads; Observation count is not outcome coverage.',
  ],
};
fs.writeFileSync(path.join(directory, 'metrics.json'), JSON.stringify(metrics, null, 2));
fs.writeFileSync(path.join(directory, 'observation-audit.json'), JSON.stringify(uniqueObservations, null, 2));
console.log(JSON.stringify({ productRequests: metrics.productRequests, mcpReads: metrics.mcpReads, mcpWrites: metrics.mcpWrites, observations: metrics.observations, unmatchedMutations: metrics.mutationsWithoutMatchedAttempt }));
