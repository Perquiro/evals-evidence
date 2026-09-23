// The annotations are human judgments. This verifies their evidence references,
// joins them to frozen receipt criteria, and renders counts without grading prose.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const directory = path.resolve(process.argv[2]);
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8').replace(/^\uFEFF/, ''));
const coverage = read('observed-coverage.json');
const annotations = read('grading-notes.json');
const observations = read('observation-audit.json');
const catalog = read('final-catalog.json');
const entries = new Map(catalog.entries.map(entry => [entry.id, entry]));
const events = fs.readFileSync(path.join(directory, 'events.jsonl'), 'utf8').trim().split('\n').map((line, index) => ({ event: index + 1, ...JSON.parse(line) })).filter(event => event.phase === 'candidate');
const files = fs.readdirSync(path.join(directory, 'contexts')).map(name => ({ name: `contexts/${name}`, value: read(`contexts/${name}`) }));
const records = new Map();
function visit(value, file) {
  if (!value || typeof value !== 'object') return;
  if (typeof value.id === 'string' && typeof value.body === 'string' && typeof value.seq === 'number') records.set(value.id, { file, body: value.body });
  for (const child of Object.values(value)) visit(child, file);
}
for (const file of files) visit(file.value, file.name);
const items = coverage.items.map(item => {
  const annotation = annotations[item.id];
  assert.ok(annotation, `Missing judgment for ${item.id}`);
  const facts = (annotation.seqs ?? []).map(seq => {
    const observation = observations.find(value => value.seq === seq);
    assert.ok(observation, `Missing Observation ${seq}`);
    assert.equal(records.get(observation.id)?.body, observation.body, 'Final public read must preserve the fact');
    const actor = entries.get(observation.actorId)?.name;
    if (item.request.actor) assert.equal(actor, item.request.actor, `${item.id} Actor`);
    const surface = entries.get(observation.surfaceId);
    const journey = entries.get(observation.journeyId);
    return { observationId: observation.id, observationSeq: seq, writeEvent: observation.event, finalRead: records.get(observation.id).file, actor, surface: surface?.locator, journey: journey?.name, body: observation.body };
  });
  assert.ok(item.seen || facts.length === 0, 'No observed coverage credit from prose alone');
  const factRecorded = facts.length > 0;
  const durablyRecorded = factRecorded && annotation.journeyRelated === true;
  if (durablyRecorded) assert.ok(facts.some(fact => fact.journey), 'Journey credit needs a real Journey link');
  const canonicalRecord = durablyRecorded && facts.some(fact => fact.surface === item.locator && fact.journey);
  return {
    id: item.id, priority: item.priority, task: item.task, title: item.title, discovery: item.discovery,
    obligation: item.record, considered: item.seen ? 'yes' : annotation.considered ?? 'unknown',
    actionCompleted: item.seen ? 'yes' : 'no', factRecorded, durablyRecorded, canonicalRecord,
    status: durablyRecorded ? 'completed and recorded' : item.seen ? 'seen but unrecorded' : annotation.status ?? 'missed',
    reason: annotation.reason, productEvents: item.observedEvents, facts,
    remaining: durablyRecorded ? null : item.seen ? 'Record the fact with its relevant Journey context.' : item.record,
  };
});
const metrics = read('metrics.json');
const count = key => items.filter(item => item[key]).length;
const durable = count('durablyRecorded');
const summary = {
  seen: coverage.seen, factRecorded: count('factRecorded'), durablyRecorded: durable, canonicalRecord: count('canonicalRecord'), total: coverage.total,
  missed: items.filter(item => item.actionCompleted === 'no').map(item => item.id),
  seenButUnrecorded: items.filter(item => item.actionCompleted === 'yes' && !item.durablyRecorded).map(item => item.id),
  productRequestsPerDurableOutcome: durable ? metrics.productRequests / durable : null,
  mcpReadsPerDurableOutcome: durable ? metrics.mcpReads / durable : null,
  mcpWritesPerDurableOutcome: durable ? metrics.mcpWrites / durable : null,
};
const surfaces = [...new Set(coverage.items.map(item => item.locator))].map(locator => {
  const [method, route] = locator.split(' ');
  const visitedEvents = events.filter(event => event.kind === 'product' && event.input.method === method && route.split('/').length === event.input.pathname.split('/').length && route.split('/').every((part, index) => part.startsWith(':') || part === event.input.pathname.split('/')[index])).map(event => event.event);
  const records = events.filter(event => event.kind === 'mcp' && event.input.name === 'record_surface' && event.input.arguments.locator === locator && !event.result.isError).map(event => ({ id: JSON.parse(event.result.content.find(block => block.type === 'text').text).id, event: event.event }));
  return { locator, recordedIds: catalog.entries.filter(entry => entry.kind === 'surface' && entry.locator === locator).map(entry => entry.id), visitedEvents, recordedBeforeFirstVisit: records.filter(record => !visitedEvents.some(event => event < record.event)), outcomesSeen: items.filter(item => coverage.items.find(value => value.id === item.id).locator === locator && item.actionCompleted === 'yes').map(item => item.id) };
});
const tasks = [...new Set(items.map(item => item.task))].map(task => ({ task, outcomes: items.filter(item => item.task === task).map(item => item.id), journeys: [...new Set(items.filter(item => item.task === task && item.durablyRecorded).flatMap(item => item.facts.map(fact => fact.journey).filter(Boolean)))] }));
fs.writeFileSync(path.join(directory, 'assessment.json'), JSON.stringify({ summary, items, surfaces, tasks, supportingNavigation: coverage.supportingNavigation, limits: 'Human annotations judge factual sufficiency and related Journey meaning. Surface-only facts count separately; canonical endpoint quality is separate from frozen Journey-linked durability. No criteria or denominator changed.' }, null, 2));
console.log(JSON.stringify(summary));
