import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const directory = path.resolve(process.argv[2]);
const names = ['memory-a', 'memory-b', 'memory-c', 'v8-a', 'v8-b'];
const read = (name, file) => JSON.parse(fs.readFileSync(path.join(directory, name, file), 'utf8'));
const runs = names.map(name => ({ name, assessment: read(name, 'assessment.json'), metrics: read(name, 'metrics.json'), items: read(name, 'item-audit.json'), quality: read(name, 'quality-notes.json') }));
for (const run of runs) {
  assert.equal(run.assessment.items.length, 25);
  assert.equal(run.assessment.surfaces.length, 11);
  assert.equal(run.assessment.tasks.length, 6);
  assert.ok(run.metrics.productRequests <= 40);
}
const table = (head, rows) => ['| ' + head.join(' | ') + ' |', '| ' + head.map(() => '---').join(' | ') + ' |', ...rows.map(row => '| ' + row.join(' | ') + ' |')].join('\n');
const link = (run, file) => `[${run.name}](${run.name}/${file})`;
const fixed = value => value === null || value === undefined ? 'unavailable' : value.toFixed(2);
const minutes = value => value === null ? 'unavailable' : fixed(value / 60000);
const coverageRows = runs.map(run => { const s = run.assessment.summary; return [link(run, 'assessment.json'), `${s.seen}/25`, `${s.factRecorded}/25`, `${s.durablyRecorded}/25`, `${s.canonicalRecord}/25`, run.metrics.productRequests]; });
const priorities = runs.flatMap(run => ['core', 'secondary'].map(priority => {
  const items = run.assessment.items.filter(item => item.priority === priority);
  return [run.name, priority, items.length, items.filter(item => item.actionCompleted === 'yes').length, items.filter(item => item.durablyRecorded).length];
}));
const costRows = runs.map(run => { const m = run.metrics, s = run.assessment.summary; return [link(run, 'metrics.json'), m.productRequests, m.mcpReads, m.mcpWrites, m.uniqueSuccessfulMcpWriteTokens, m.failedMcpWrites, m.schemaReads, m.observations, fixed(s.productRequestsPerDurableOutcome), fixed(s.mcpReadsPerDurableOutcome), fixed(s.mcpWritesPerDurableOutcome)]; });
const timing = runs.map(run => { const m = run.metrics; return [run.name, minutes(m.elapsedMs), minutes(m.candidateActivitySpanMs), minutes(m.firstObservationDelayMs), fixed(m.latency.mcp?.medianMs), fixed(m.latency.mcp?.p95Ms), fixed(m.latency.product?.medianMs), fixed(m.latency.product?.p95Ms)]; });
const qualityRows = runs.map(run => [link(run, 'quality-notes.json'), run.items.itemCount, run.items.normalizedDuplicateGroups.length, run.items.recovery.length, run.metrics.mutations.length, run.metrics.acceptedAttempts, run.quality.markerVerdict, run.quality.falseReopens, run.quality.falsePending, run.quality.semanticAliases]);
const status = item => item.durablyRecorded ? 'D' : item.factRecorded ? 'F' : item.actionCompleted === 'yes' ? 'S' : item.considered === 'yes' ? 'C' : 'M';
const itemRows = runs[0].assessment.items.map((item, index) => [item.id, item.title, ...runs.map(run => status(run.assessment.items[index]))]);
const report = `# Explore with memory: repeated Library runs

The repeated runs retain both useful durable facts and failures. The new protocol passed the deterministic recovery matrix and a fresh-Agent Reserve → details → Actions → Cancel recovery proof. These Library runs do not establish that it improves completeness or cost over v8. Host scheduling, source revisions, the pilot instruction changes and v8's adaptation to the current operating contract prevent a clean performance ranking. The [method and retained failures](METHOD.md) explain those limits.

## Frozen outcome coverage

All 25 outcomes remain in every denominator. Seen means a matching Product receipt. Fact means a supported Observation survives a final public read. Durable also requires its related Journey under the frozen rubric. Canonical means that durable fact is recorded on the required endpoint Surface. No canonical penalty is folded into the frozen durability score.

${table(['Run', 'Seen', 'Fact', 'Durable', 'Canonical durable', 'Product requests / 40'], coverageRows)}

Memory A is the early pilot. Memory B and C use the same final installed Explore bytes. V8 A uses the old recording workflow on the current runtime; v8 B mixes its frozen review gates with current structured attempts. The historical single v8 result was 25/25, as cited in METHOD.md; it is not averaged with these fresh runs.

The inventory's original priority names are core and secondary. They remain separate here.

${table(['Run', 'Priority', 'Total', 'Seen', 'Durable'], priorities)}

## Cost and available latency

Write calls include rejected calls and replays; successful unique tokens are a separate count. Product errors consume request budget. A saved Observation is not necessarily a completed outcome. The final three columns divide each cost by frozen durable outcomes.

${table(['Run', 'Product', 'MCP reads', 'MCP writes', 'Unique write tokens', 'Rejected writes', 'Schema reads', 'Observations', 'Product / durable', 'Reads / durable', 'Writes / durable'], costRows)}

All elapsed values are minutes; server latency is milliseconds. Manifest elapsed includes idle time before dispatch and stop delay. Candidate span still includes reasoning and host waits. Server latency excludes those costs. Shared-host work and capacity interruptions make these unsuitable for a speed ranking.

${table(['Run', 'Manifest elapsed', 'Candidate span', 'First fact delay', 'MCP median', 'MCP p95', 'Product median', 'Product p95'], timing)}

Known coordination is reported separately from Product and MCP calls. Memory runs use three fresh Actor contexts with no child delegation. The final two memory runs each received one Reader follow-up after an early handoff. V8 A and B each used a coordinator plus discovery and reviewer roles. V8 B retained six named reviewer passes; v8 A retained two reviewer-capacity stops. V8 B received a root continuation at its evidence stop. Complete progress-message, wait-call and failed-spawn telemetry is unavailable, so these are known events rather than an invented exact tool-cost total.

## Item state and mutation protocol

Normalized duplicates are exact candidate groups, not semantic equivalence. The human judgments linked below account for aliases, omitted outcomes and false pending checks. An accepted id mechanically preceding a request is insufficient when the item or preconditions are wrong. V8 A has no structured markers under its old workflow; zero item-level reopens is therefore not measurable for that run.

${table(['Run', 'Items', 'Normalized duplicates', 'Unresolved', 'Mutation calls', 'Accepted attempts', 'Marker verdict', 'False reopens', 'False pending', 'Semantic aliases'], qualityRows)}

${runs.map(run => `**${run.name}:** ${run.quality.summary}`).join('\n\n')}

The stronger [fresh-Agent recovery validation](actions-recovery/validation.json) confirms one initial uncertain Reserve, no repeated Reserve, one resumed cancellation POST, a separate empty-Reason branch and zero final uncertainty. Its six resumed Product requests leave exactly one reservation. The [controlled acceptance proof](../../../../docs/proofs/253-explore-recovery-acceptance.md) covers six boundaries for both creation and cancellation. METHOD.md distinguishes these proofs from OS process-kill recovery and documents the narrower Library recovery pilot.

## Every frozen outcome

D = durable with related Journey; F = fact saved without the required Journey; S = seen without a sufficient fact; C = explicitly considered but incomplete; M = missed or consideration unsupported. Exact receipts, Observation ids/bodies, final read paths, reasons and remaining work are in each linked assessment. No status is inferred from the candidate's final summary alone.

${table(['Item', 'Outcome', ...names], itemRows)}

Each assessment also includes the eleven-locator Surface table, visits, premature Surface writes, six task groups and supporting navigation. Each item audit preserves final typed gaps and unresolved ids. The trace-cut files retain committed Knowledge before interruptions and Actor handoffs; METHOD.md records their outcome judgments. The incomplete and failed runs were retained without evaluator repair of candidate Knowledge.
`;
fs.writeFileSync(path.join(directory, 'REPORT.md'), report);
console.log('Wrote report from five complete assessments.');
