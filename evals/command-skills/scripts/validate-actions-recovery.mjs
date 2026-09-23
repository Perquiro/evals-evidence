import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const directory = path.resolve(process.argv[2]);
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
const events = fs.readFileSync(path.join(directory, 'events.jsonl'), 'utf8').trim().split('\n').map((line, index) => ({ index: index + 1, ...JSON.parse(line) }));
const parsed = event => JSON.parse(event.result.content.find(block => block.type === 'text').text);
const writes = events.filter(event => event.kind === 'mcp' && event.input.name === 'record_inspection' && !event.result.isError);
const reports = writes.flatMap(event => event.input.arguments.reports.map((report, index) => ({ event: event.index, report, observation: parsed(event).observations[index], args: event.input.arguments })));
const attempts = new Map(writes.flatMap(event => parsed(event).authorizedAttemptIds.map(id => [id, event.index])));
const interruption = read('interruption.json');
const final = read('product-final.json');
const initialRead = events.find(event => event.phase === 'candidate' && event.kind === 'mcp' && event.input.name === 'read_explore' && !event.result.isError);
assert.ok(initialRead);
assert.deepEqual(parsed(initialRead).recovery.items.map(value => value.observation.id), [interruption.attemptId]);
const requests = events.filter(event => event.kind === 'product_request' && event.phase !== 'inspection');
const effects = events.filter(event => event.kind === 'product_effect' && ['reserve', 'cancel'].includes(event.event.kind));
assert.equal(final.reservationCount, 1);
assert.equal(final.state, 'cancelled');
assert.equal(requests.filter(event => event.input.method === 'POST' && event.input.path === '/reservations').length, 1);
assert.equal(requests.filter(event => event.phase === 'candidate' && event.input.method === 'POST').length, 1);
assert.equal(effects.length, 2);
for (const effect of effects) assert.ok(attempts.get(effect.event.attemptId) < effect.index, 'Every Product mutation has a preceding accepted attempt');
const candidateRequests = requests.filter(event => event.phase === 'candidate');
assert.ok(candidateRequests.length <= 20);
assert.equal(candidateRequests[0].input.path, '/api/reservations/42');
const replay = writes.find(event => event.phase === 'candidate' && event.input.arguments.requestToken === interruption.request.requestToken);
assert.ok(replay);
assert.deepEqual(parsed(replay).authorizedAttemptIds, []);
assert.equal(parsed(replay).observations[0].id, interruption.attemptId);
const original = reports.find(value => value.observation.id === interruption.attemptId);
assert.equal(parsed(replay).observations[0].body, original.observation.body);
const reserveOutcome = reports.find(value => value.report.look?.kind === 'exercised' && value.report.look.attemptObservationId === interruption.attemptId);
assert.ok(reserveOutcome);
const browser = events.filter(event => event.kind === 'browser');
const actions = browser.find(event => event.input.name === 'Actions');
const cancel = browser.find(event => event.input.name === 'Cancel');
assert.ok(actions && cancel);
assert.equal(actions.result.url, cancel.result.url);
assert.match(actions.result.text, /CancelEditDownload/);
assert.ok(cancel.result.inputs.some(input => input.id === 'reason' && input.visible && input.required));
const confirms = browser.filter(event => event.input.name === 'Confirm cancellation');
assert.equal(confirms.length, 2);
assert.ok(confirms[0].result.inputs.some(input => input.id === 'reason' && input.visible && input.value === '' && !input.valid && input.validationMessage));
assert.match(confirms[1].result.text, /Status: cancelled/);
const outcomes = confirms.map(click => reports.find(value => value.report.look?.kind === 'exercised' && value.report.look.attemptObservationId === click.input.attemptId));
assert.ok(outcomes.every(Boolean));
assert.notEqual(outcomes[0].report.look.item.id, outcomes[1].report.look.item.id);
const definitions = writes.flatMap(event => parsed(event).items);
assert.equal(definitions.find(item => item.id === outcomes[0].report.look.item.id).kind, 'rule');
const finalPages = fs.readdirSync(path.join(directory, 'explore')).flatMap(name => read(`explore/${name}`));
assert.ok(finalPages.every(page => page.recovery.items.length === 0));
const history = new Map(finalPages.flatMap(page => page.history.items).map(item => [item.observation.id, item]));
for (const outcome of [reserveOutcome, ...outcomes]) assert.equal(history.get(outcome.observation.id)?.observation.body, outcome.observation.body);
assert.equal(history.get(interruption.attemptId)?.observation.body, original.observation.body);
const result = {
  passed: true, totalProductRequests: requests.length, resumedProductRequests: candidateRequests.length,
  reservationCount: final.reservationCount, finalState: final.state, reservePosts: 1, resumedMutations: 1,
  reserveAttempt: interruption.attemptId, reserveOutcome: reserveOutcome.observation.id,
  emptyReasonAttempt: confirms[0].input.attemptId, emptyReasonOutcome: outcomes[0].observation.id,
  cancellationAttempt: confirms[1].input.attemptId, cancellationOutcome: outcomes[1].observation.id,
  initialUnresolved: 1, finalUnresolved: 0, rejectedMcpCalls: events.filter(event => event.phase === 'candidate' && event.kind === 'mcp' && event.result.isError).length,
  limitations: [
    'One fresh Agent after Product acceptance and unread response; the twelve controlled boundary cases are separate automated proof.',
    'Browser-required validation prevents the empty form from reaching HTTP. The separate automated HTTP proof checks the 422 branch.',
    'The Product is synthetic with a fixed Customer and no credentials. This does not establish real authentication or OS process-kill recovery.',
    'The Agent also visited the unsupported root route and saw not found; its summary statement that no Product request failed is too broad.',
    'Actions and Cancel remain action-kind reached history, not completed mutation checks. Edit and Download remain offered and unexercised.',
  ],
};
fs.writeFileSync(path.join(directory, 'validation.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
