import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, copyFileSync, mkdtempSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { cost, grade, summarize, compare, validateLaunch } from './evaluate.mjs';

const load = name => JSON.parse(readFileSync(new URL(name, import.meta.url)));
const rates = load('rates.json');
const protocol = load('protocol.json');
const checklist = load('checklist.json');
const usage = { input: 1000, cached_input: 200, cache_write_input: 100, output: 100, reasoning_output: 40 };
const call = (id = 'c1', extra = {}) => ({ id, model: 'gpt-5.6-terra', status: 'ok', usage: {...usage}, raw: 'raw.json#/calls/0', actual_charge_usd: null, ...extra });
const fixture = () => ({
  kind: 'controlled', id: 'ordinary-success', pair: 1, arm: 'ordinary', actor: protocol.actor,
  elapsed_ms: 3000, status: 'completed', product_requests: 1,
  call_ledger_complete: true, non_token_cost_usd: 0, accounting_note: 'Authored counters, no external services.',
  phases: [{ phase: 'ordinary_planning', start_ms: 0, end_ms: 1000, call_ids: ['c1'] }, { phase: 'product_interaction', start_ms: 1000, end_ms: 2000, call_ids: [] }, { phase: 'recording', start_ms: 2000, end_ms: 3000, call_ids: [] }],
  calls: [call()], recommendations: [], overrides: [],
  actions: [{ id: 'a1', actor: protocol.actor, dispatched_ms: 1000, executed: true, outcome: 'Employee dashboard appeared', raw: 'raw.json#/actions/0' }],
  observations: [{ id: 'o1', actor: protocol.actor, action_ids: ['a1'], saved_ms: 2500, result: 'Valid Employee login reached dashboard', raw: 'knowledge.json#/observations/0' }],
  grade: { reviewer: 'independent controlled oracle', unsupported_claims: [], items: [{ item_id: 'login', action_ids: ['a1'], observation_ids: ['o1'], rationale: 'Actual login and result saved.' }], behaviors: [{ id: 'employee-login-result', observation_ids: ['o1'], description: 'Valid credentials opened Employee dashboard.' }], open_questions: ['Does a profile edit persist?'] }
});

test('advice and a proposed action receive no execution credit', () => {
  const trace = fixture(); trace.actions[0].executed = false;
  trace.recommendations.push({ selected_id: 'login' });
  const result = grade(trace, checklist, protocol);
  assert.equal(result.important_actions, 0);
  assert.equal(result.distinct_behavior_learned.length, 0);
});
test('a saved Observation without raw executed support receives zero credit', () => {
  const trace = fixture(); trace.actions = [];
  assert.equal(grade(trace, checklist, protocol).important_actions, 0);
});
test('actual unexpected behavior earns credit once and exposes Journey progress', () => {
  const trace = fixture(); trace.actions[0].outcome = 'Login failed'; trace.observations[0].result = 'Valid credentials rejected';
  const result = grade(trace, checklist, protocol);
  assert.equal(result.important_actions, 1);
  assert.deepEqual(result.journey_progress['Account access'], { exercised: ['login'], missing: ['logout'], complete: false });
});
test('missing raw citation, wrong Actor or late saved Observation gets no credit', () => {
  for (const mutate of [t => t.observations[0].raw = null, t => t.actions[0].actor = 'Manager', t => t.observations[0].saved_ms = 3001]) {
    const trace = fixture(); mutate(trace); assert.equal(grade(trace, checklist, protocol).important_actions, 0);
  }
});
test('known failed-call and fallback usage both remain in the estimate', () => {
  const calls = [call('failed', { status: 'HTTP 503' }), call('fallback')];
  assert.equal(cost(calls, rates, true, 0).api_equivalent_usd, 0.00578);
  assert.equal(cost(calls, rates, true, 0).failed_attempts, 1);
});
test('missing failed-call usage cannot produce a cheaper total', () => {
  const result = cost([call(), call('failed', { status: 'HTTP 503', usage: null })], rates, true, 0);
  assert.equal(result.api_equivalent_usd, null);
  assert.equal(result.known_component_subtotal_usd, 0.00289);
  assert.equal(result.actual_charges_usd, null);
  assert.ok(result.unknown.includes('failed:usage'));
});
test('cache writes and reasoning are not double counted; large contexts use full-request multipliers', () => {
  assert.equal(cost([call()], rates, true, 0).api_equivalent_usd, 0.00289);
  assert.equal(cost([call('long', { usage: { input: 300000, cached_input: 0, cache_write_input: 0, output: 100, reasoning_output: null } })], rates, true, 0).api_equivalent_usd, 1.2018);
});
test('missing cache counters or an incomplete call ledger prevent total estimates', () => {
  assert.equal(cost([call('partial', { usage: { ...usage, cached_input: null } })], rates, true, 0).api_equivalent_usd, null);
  assert.equal(cost([], rates, false, 0).api_equivalent_usd, null);
  assert.equal(cost([call()], rates, true, null).api_equivalent_usd, null);
});
test('duplicate call IDs and contradictory usage fail closed', () => {
  assert.throws(() => cost([call(), call()], rates, true, 0), /duplicate/);
  assert.throws(() => cost([call('bad', { usage: { ...usage, cached_input: 999 } })], rates, true, 0), /subsets/);
  assert.throws(() => cost([call('bad', { usage: { ...usage, output: -1 } })], rates, true, 0), /counter/);
});
test('total elapsed includes Product and recording; selection is reported separately', () => {
  const result = summarize(fixture(), checklist, protocol, rates);
  assert.equal(result.elapsed_ms, 3000); assert.equal(result.selection_ms, 1000);
  assert.equal(result.phase_ms.fallback, 0);
});
test('unaccounted time and duplicate usage assignment are rejected', () => {
  const gap = fixture(); gap.phases[1].start_ms = 1001;
  assert.throws(() => summarize(gap, checklist, protocol, rates), /contiguous/);
  const dup = fixture(); dup.phases[1].call_ids = ['c1'];
  assert.throws(() => summarize(dup, checklist, protocol, rates), /exactly once/);
});
test('controlled traces never establish a live comparison win', () => {
  const a = summarize(fixture(), checklist, protocol, rates);
  assert.equal(compare([a], protocol).decision, 'inconclusive');
});
test('a missing launch reset or changed model fails before dispatch', () => {
  assert.throws(() => validateLaunch({ model: 'other' }, protocol), /model/);
});
test('quality cannot trade the only completed workflow for unrelated checks', () => {
  const packet = load('rehearsal/packet.json');
  const ordinary = summarize(packet.traces[0], checklist, protocol, rates);
  const advised = summarize(packet.traces[1], checklist, protocol, rates);
  advised.quality.completed_employee_workflows = 0;
  advised.quality.important_actions = 2;
  const result = compare([ordinary, advised], protocol);
  assert.equal(result.pairs[0].quality_met, false);
});
test('complete paired outcomes permit a win only with complete cost and quality', () => {
  const packet = load('rehearsal/packet.json');
  const runs = [];
  for (let pair = 1; pair <= 4; pair++) {
    for (const [index, arm] of ['ordinary', 'advised'].entries()) {
      const run = summarize(packet.traces[index], checklist, protocol, rates);
      run.id = `${pair}-${arm}`; run.pair = pair; run.kind = 'live';
      run.cost.api_equivalent_usd = index ? 0.01 : 0.02;
      runs.push(run);
    }
  }
  assert.equal(compare(runs, protocol).decision, 'meets pilot criterion');
  runs[1].cost.api_equivalent_usd = null;
  assert.equal(compare(runs, protocol).decision, 'inconclusive');
});
test('login-only ordinary outcomes cannot establish useful exploration', () => {
  const result = summarize(fixture(), checklist, protocol, rates);
  const advised = structuredClone(result); advised.id = 'advised'; advised.arm = 'advised';
  assert.equal(compare([result, advised], protocol).pairs[0].quality_met, false);
});
test('duplicates and action/Observation linkage cannot inflate a grade', () => {
  const trace = fixture(); trace.grade.items.push(structuredClone(trace.grade.items[0]));
  assert.throws(() => grade(trace, checklist, protocol), /duplicate/);
  trace.grade.items.pop(); trace.observations[0].action_ids = ['different'];
  assert.equal(grade(trace, checklist, protocol).important_actions, 0);
});
test('known cache subsets cannot exceed input when the other subset is unknown', () => {
  assert.throws(() => cost([call('partial', { usage: { ...usage, cached_input: 1001, cache_write_input: null } })], rates, true, 0), /subsets/);
});
test('negative non-token charges cannot make actual or estimated cost cheaper', () => {
  assert.throws(() => cost([call('billed', { actual_charge_usd: 0 })], rates, true, -1), /non-token/);
});

function isolatedCli() {
  const directory = mkdtempSync(join(tmpdir(), 'perquiro-347-proof-'));
  const digest = file => createHash('sha256').update(readFileSync(join(directory, file))).digest('hex');
  const write = (file, data) => writeFileSync(join(directory, file), JSON.stringify(data));
  const hashes = {};
  for (const name of ['evaluate.mjs','protocol.json','rates.json','checklist.json']) {
    copyFileSync(new URL(name, import.meta.url), join(directory, name)); hashes[name] = digest(name);
  }
  write('frozen.json', { hashes });
  const launch = load('launch.template.json');
  for (const key of Object.keys(launch).filter(key => key.endsWith('_sha256'))) launch[key] = 'a'.repeat(64);
  launch.freeze_sha256 = digest('frozen.json');
  launch.runtime_sha = 'b'.repeat(40);
  launch.cli_version = 'controlled-cli'; launch.browser_version = 'controlled-browser';
  launch.grader_1 = 'reviewer-1'; launch.grader_2 = 'reviewer-2'; launch.result_reviewer = 'reviewer-3';
  launch.isolation_evidence = 'raw.json#/isolation'; launch.driver_evidence = 'raw.json#/driver';
  write('raw.json', { isolation: { withheld: true }, driver: { request_gate: true } });
  launch.manifest = { 'raw.json': digest('raw.json') };
  write('launch.json', launch);
  const run = (command, file) => spawnSync(process.execPath, [join(directory, 'evaluate.mjs'), command, join(directory, file)], { encoding: 'utf8' });
  return { directory, digest, write, run, launch };
}

function livePacket(cli) {
  const trace = fixture();
  trace.kind = 'live'; trace.id = cli.launch.runs[0].id;
  trace.effective_model = protocol.model; trace.effective_effort = protocol.effort;
  trace.comparability_verified = true; trace.controls_raw = 'raw.json#/driver';
  trace.reset = { browser_context_id: 'browser-1', project_id: 'project-1', server_instance_id: 'server-1',
    signed_out: true, empty_knowledge: true, empty_storage: true, raw: 'raw.json#/isolation' };
  for (const key of ['product_sha', 'seed_sha256', 'product_build_sha256', 'fixed_product_date']) trace.reset[key] = cli.launch[key];
  trace.grade.initial_1 = 'trace.json#/grade'; trace.grade.initial_2 = 'trace.json#/grade'; trace.grade.adjudication = 'trace.json#/grade';
  trace.actions[0].raw = 'trace.json#/actions/0'; trace.observations[0].raw = 'trace.json#/observations/0'; trace.calls[0].raw = 'trace.json#/calls/0';
  cli.write('trace.json', trace);
  cli.write('packet.json', { traces: [trace], launch: 'launch.json',
    manifest: { 'launch.json': cli.digest('launch.json'), 'raw.json': cli.digest('raw.json'), 'trace.json': cli.digest('trace.json') },
    overhead_note: 'Authored boundary probe; no live Product execution or independent semantic grading.' });
}

test('launch rejects the original template after only its hashes have been filled', () => {
  const cli = isolatedCli(); const launch = load('launch.template.json');
  for (const key of Object.keys(launch).filter(key => key.endsWith('_sha256'))) launch[key] = cli.launch[key];
  cli.write('launch.json', launch);
  const invalid = cli.run('launch', 'launch.json');
  assert.equal(invalid.status, 1); assert.match(invalid.stderr, /runtime_sha/);
});

test('launch rejects a runtime branch name or shortened commit', () => {
  for (const runtime_sha of ['main', 'abcdef0', 'g'.repeat(40)]) {
    const cli = isolatedCli(); cli.write('launch.json', { ...cli.launch, runtime_sha });
    const invalid = cli.run('launch', 'launch.json');
    assert.equal(invalid.status, 1, runtime_sha); assert.match(invalid.stderr, /runtime_sha/);
  }
});

test('launch rejects each unfilled version or reviewer identity', () => {
  for (const key of ['cli_version', 'browser_version', 'grader_1', 'grader_2', 'result_reviewer']) {
    const cli = isolatedCli(); cli.write('launch.json', { ...cli.launch, [key]: load('launch.template.json')[key] });
    const invalid = cli.run('launch', 'launch.json');
    assert.equal(invalid.status, 1, key); assert.match(invalid.stderr, new RegExp(key));
  }
});

test('launch rejects missing or altered preflight evidence', () => {
  for (const mutate of [cli => { delete cli.launch.manifest; }, cli => cli.write('raw.json', { replaced: true })]) {
    const cli = isolatedCli(); mutate(cli); cli.write('launch.json', cli.launch);
    const invalid = cli.run('launch', 'launch.json');
    assert.equal(invalid.status, 1); assert.match(invalid.stderr, /manifest|hash mismatch/);
  }
});

test('launch rejects placeholders, unmanifested files and unresolved evidence pointers', () => {
  for (const key of ['isolation_evidence', 'driver_evidence']) {
    for (const value of ['FILL artifact citation', 'missing.json#/proof', 'raw.json#/missing', 'raw.json', 'raw.json#/driver#ignored', 'raw.json#/constructor']) {
      const cli = isolatedCli(); cli.write('launch.json', { ...cli.launch, [key]: value });
      const invalid = cli.run('launch', 'launch.json');
      assert.equal(invalid.status, 1, `${key}: ${value}`); assert.match(invalid.stderr, /citation/);
    }
  }
});

test('live report consumes a complete launch and retained preflight evidence', () => {
  const cli = isolatedCli(); livePacket(cli);
  const result = cli.run('report', 'packet.json');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).runs[0].quality.important_actions, 1);
  assert.equal(JSON.parse(result.stdout).comparison.decision, 'inconclusive');
});

test('live report rejects invalid launch metadata and preflight citations before grading', () => {
  for (const mutate of [
    launch => launch.runtime_sha = 'FILL after #345 and #346',
    launch => launch.browser_version = 'FILL before scoring',
    launch => launch.driver_evidence = 'raw.json#/missing',
    launch => launch.isolation_evidence = 'missing.json#/proof',
    launch => { delete launch.manifest; },
    launch => launch.manifest['raw.json'] = '0'.repeat(64)
  ]) {
    const cli = isolatedCli(); mutate(cli.launch); cli.write('launch.json', cli.launch); livePacket(cli);
    const invalid = cli.run('report', 'packet.json');
    assert.equal(invalid.status, 1); assert.match(invalid.stderr, /runtime_sha|browser_version|citation|manifest|hash mismatch/);
  }
});

test('launch boundary accepts the frozen schedule and rejects changed grading before dispatch', () => {
  const cli = isolatedCli();
  assert.equal(cli.run('launch','launch.json').status, 0);
  cli.write('checklist.json', {items:[]});
  const invalid = cli.run('launch','launch.json');
  assert.equal(invalid.status, 1); assert.match(invalid.stderr, /hash mismatch: checklist/);
});
test('live report rejects a launch file absent from the evidence manifest', () => {
  const cli = isolatedCli();
  cli.write('raw.json', {retained:true});
  cli.write('packet.json', {traces:[{kind:'live'}], launch:'launch.json', manifest:{'raw.json':cli.digest('raw.json')}, overhead_note:'Controlled boundary probe.'});
  const invalid = cli.run('report','packet.json');
  assert.equal(invalid.status, 1); assert.match(invalid.stderr, /launch must be manifested/);
});
test('report boundary rejects changed raw artifacts instead of accepting their claims', () => {
  const cli = isolatedCli();
  cli.write('raw.json', {retained:true}); const digest = cli.digest('raw.json');
  cli.write('raw.json', {retained:false});
  cli.write('packet.json', {traces:[], manifest:{'raw.json':digest}, overhead_note:'Controlled boundary probe.'});
  const invalid = cli.run('report','packet.json');
  assert.equal(invalid.status, 1); assert.match(invalid.stderr, /hash mismatch: raw/);
});
test('retained TypeSafe usage yields an exact estimate without inventing cache counters', () => {
  const retained = load('../typesafe-hardcases-2026-09-17/results/signed_out_login_over_public_features-None-jev_choice.json');
  const result = cost([call('choice', {model:'jev-1.13.0', usage:{input:retained.usage.input_tokens,output:retained.usage.output_tokens,cached_input:null,cache_write_input:null,reasoning_output:null}})], rates, true, 0);
  assert.equal(result.api_equivalent_usd, 0.000046158);
  assert.deepEqual(result.tokens_by_model['jev-1.13.0'].cached_input, {known:0,unknown_calls:1});
});
test('unknown model names cannot resolve inherited object properties as rates', () => {
  const result = cost([call('unknown', {model:'constructor'})], rates, true, 0);
  assert.equal(result.api_equivalent_usd, null);
  assert.deepEqual(result.unknown, ['unknown:rate']);
});
