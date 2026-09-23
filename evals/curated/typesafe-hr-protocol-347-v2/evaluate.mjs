import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const requireThat = (condition, message) => { if (!condition) throw Error(message); };
const present = value => typeof value === 'string' && value.trim().length > 0;
const nonnegative = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const phases = ['startup', 'candidate_generation', 'ordinary_planning', 'advice', 'advice_handling', 'override', 'fallback', 'product_interaction', 'recording', 'other'];
const selection = ['candidate_generation', 'ordinary_planning', 'advice', 'advice_handling', 'override', 'fallback'];
const round = value => Number(value.toFixed(10));
const unique = (rows, label, key = 'id') => {
  requireThat(Array.isArray(rows), `${label} must be an array`);
  const result = new Map();
  for (const row of rows) {
    requireThat(present(row[key]) && !result.has(row[key]), `missing or duplicate ${label} ${row[key]}`);
    result.set(row[key], row);
  }
  return result;
};

export function cost(calls, rates, ledgerComplete, nonTokenCost) {
  unique(calls, 'call');
  requireThat(nonTokenCost === null || nonnegative(nonTokenCost), 'invalid non-token charge');
  const unknown = [];
  const totals = Object.create(null);
  let subtotal = 0;
  let actual = 0;
  let actualComplete = ledgerComplete === true && nonTokenCost !== null;
  if (ledgerComplete !== true) unknown.push('call ledger incomplete');
  if (!nonnegative(nonTokenCost)) unknown.push('non-token cost unknown');
  else subtotal += nonTokenCost;
  const attempts = [];
  for (const call of calls) {
    requireThat(present(call.model) && present(call.status) && present(call.raw), 'call needs model, status and raw citation');
    const rate = Object.hasOwn(rates.models, call.model) ? rates.models[call.model] : undefined;
    const usage = call.usage;
    const issues = [];
    let known = 0;
    if (!rate) issues.push('rate');
    if (!usage) issues.push('usage');
    if (usage) {
      for (const key of ['input', 'cached_input', 'cache_write_input', 'output', 'reasoning_output']) {
        const value = usage[key];
        requireThat(value === null || (Number.isSafeInteger(value) && value >= 0), `invalid counter ${call.id}:${key}`);
        const modelTotals = totals[call.model] ??= {};
        const counter = modelTotals[key] ??= { known: 0, unknown_calls: 0 };
        if (value === null) counter.unknown_calls++;
        else counter.known += value;
      }
      const { input, cached_input: cached, cache_write_input: written, output, reasoning_output: reasoning } = usage;
      requireThat(input === null || cached === null || cached <= input, 'cache subsets exceed input');
      requireThat(input === null || written === null || written <= input, 'cache subsets exceed input');
      requireThat(input === null || cached === null || written === null || cached + written <= input, 'cache subsets exceed input');
      requireThat(output === null || reasoning === null || reasoning <= output, 'reasoning subset exceeds output');
      for (const key of ['input', 'output']) if (usage[key] === null) issues.push(key);
      const uniformInputRate = rate && rate.input === rate.cached_input && rate.input === rate.cache_write_input;
      // Missing cache counters remain unknown, but cannot affect a uniform input price.
      if (!uniformInputRate) for (const key of ['cached_input', 'cache_write_input']) if (usage[key] === null) issues.push(key);
      if (rate) {
        const long = rate.long_context_threshold !== null && input !== null && input > rate.long_context_threshold;
        const inputMultiplier = long ? rate.long_input_multiplier : 1;
        const outputMultiplier = long ? rate.long_output_multiplier : 1;
        // With missing classification, retain only components whose minimum charge is known.
        if (input !== null && cached !== null && written !== null) {
          known += ((input - cached - written) * rate.input + cached * rate.cached_input + written * rate.cache_write_input) * inputMultiplier;
        } else if (input !== null) {
          known += input * Math.min(rate.input, rate.cached_input, rate.cache_write_input) * inputMultiplier;
        }
        if (output !== null) known += output * rate.output * outputMultiplier;
        known /= rate.per_tokens;
      }
    } else {
      const modelTotals = totals[call.model] ??= {};
      for (const key of ['input', 'cached_input', 'cache_write_input', 'output', 'reasoning_output']) {
        const counter = modelTotals[key] ??= { known: 0, unknown_calls: 0 }; counter.unknown_calls++;
      }
    }
    subtotal += known;
    unknown.push(...issues.map(issue => `${call.id}:${issue}`));
    if (call.actual_charge_usd === null) actualComplete = false;
    else {
      requireThat(nonnegative(call.actual_charge_usd), 'invalid actual charge');
      actual += call.actual_charge_usd;
    }
    attempts.push({ id: call.id, model: call.model, status: call.status, known_component_subtotal_usd: round(known), unknown: issues, raw: call.raw });
  }
  return {
    api_equivalent_usd: unknown.length ? null : round(subtotal),
    known_component_subtotal_usd: round(subtotal), unknown,
    actual_charges_usd: actualComplete ? round(actual + nonTokenCost) : null,
    known_actual_call_charges_usd: round(actual),
    failed_attempts: calls.filter(call => call.status !== 'ok').length,
    tokens_by_model: totals, attempts,
    price_basis: rates.basis, currency: rates.currency
  };
}

export function grade(trace, checklist, protocol) {
  const actions = unique(trace.actions, 'action');
  const observations = unique(trace.observations, 'Observation');
  const items = unique(checklist.items, 'checklist item');
  unique(trace.grade.items, 'grade item', 'item_id');
  requireThat(present(trace.grade.reviewer), 'independent grader identity required');
  requireThat(Array.isArray(trace.grade.unsupported_claims) && Array.isArray(trace.grade.open_questions), 'grade needs claims and open questions');
  const validAction = action => action && action.executed === true && action.actor === protocol.actor
    && nonnegative(action.dispatched_ms) && action.dispatched_ms <= Math.min(trace.elapsed_ms, protocol.execution_ms)
    && present(action.outcome) && present(action.raw);
  const validObservation = observation => observation && observation.actor === protocol.actor && present(observation.raw)
    && present(observation.result) && nonnegative(observation.saved_ms) && observation.saved_ms <= trace.elapsed_ms
    && Array.isArray(observation.action_ids) && observation.action_ids.length > 0
    && observation.action_ids.every(id => validAction(actions.get(id)) && actions.get(id).dispatched_ms <= observation.saved_ms);
  const accepted = [];
  const rejected = [];
  for (const item of trace.grade.items) {
    requireThat(items.has(item.item_id), `unknown checklist item ${item.item_id}`);
    const actionIds = item.action_ids;
    const observationIds = item.observation_ids;
    const supported = present(item.rationale) && Array.isArray(actionIds) && actionIds.length > 0
      && Array.isArray(observationIds) && observationIds.length > 0
      && actionIds.every(id => validAction(actions.get(id)))
      && observationIds.every(id => validObservation(observations.get(id)))
      && actionIds.every(id => observationIds.some(oid => observations.get(oid)?.action_ids.includes(id)));
    (supported ? accepted : rejected).push({ ...item, ...(supported ? {} : { reason: 'Missing executed action, saved Observation, attribution, timing or raw support.' }) });
  }
  const acceptedIds = accepted.map(item => item.item_id);
  unique(trace.grade.behaviors, 'behavior');
  const behaviors = trace.grade.behaviors.filter(behavior => present(behavior.description) && behavior.observation_ids.length > 0
    && behavior.observation_ids.every(id => validObservation(observations.get(id))));
  const progress = Object.fromEntries(Object.entries(checklist.journeys).map(([name, required]) => {
    const exercised = required.filter(id => acceptedIds.includes(id));
    return [name, { exercised, missing: required.filter(id => !acceptedIds.includes(id)), complete: exercised.length === required.length }];
  }));
  return { important_actions: accepted.length, accepted, rejected,
    uncredited_items: checklist.items.map(item => item.id).filter(id => !acceptedIds.includes(id)),
    distinct_behavior_learned: behaviors, journey_progress: progress,
    completed_employee_workflows: Object.entries(progress).filter(([name, value]) => name !== 'Account access' && value.complete).length,
    unsupported_claims: trace.grade.unsupported_claims, open_questions: trace.grade.open_questions };
}

export function summarize(trace, checklist, protocol, rates) {
  requireThat(['controlled', 'live'].includes(trace.kind), 'kind must be controlled or live');
  requireThat(['ordinary', 'advised'].includes(trace.arm), 'unknown arm');
  requireThat(trace.actor === protocol.actor, 'Actor differs from protocol');
  requireThat(['completed', 'failed', 'timeout', 'interrupted'].includes(trace.status), 'invalid execution status');
  requireThat(nonnegative(trace.elapsed_ms) && trace.elapsed_ms <= protocol.execution_ms + protocol.recording_grace_ms, 'invalid elapsed time');
  requireThat(Number.isSafeInteger(trace.product_requests) && trace.product_requests >= 0 && trace.product_requests <= protocol.product_requests, 'Product request cap violated');
  requireThat(present(trace.accounting_note), 'accounting note required');
  const phaseMs = Object.fromEntries(phases.map(phase => [phase, 0]));
  let cursor = 0;
  const assigned = [];
  for (const interval of trace.phases) {
    requireThat(phases.includes(interval.phase), 'unknown phase');
    requireThat(interval.start_ms === cursor && nonnegative(interval.end_ms) && interval.end_ms >= cursor, 'phases must be contiguous and non-overlapping');
    phaseMs[interval.phase] += interval.end_ms - cursor;
    cursor = interval.end_ms;
    assigned.push(...interval.call_ids);
  }
  requireThat(cursor === trace.elapsed_ms, 'phases must cover elapsed interval');
  const callIds = [...unique(trace.calls, 'call').keys()];
  requireThat(assigned.length === callIds.length && new Set(assigned).size === assigned.length && assigned.every(id => callIds.includes(id)), 'assign each call exactly once');
  requireThat(Array.isArray(trace.recommendations) && Array.isArray(trace.overrides), 'advice/override trace required');
  return { id: trace.id, pair: trace.pair, arm: trace.arm, kind: trace.kind, status: trace.status,
    elapsed_ms: trace.elapsed_ms, selection_ms: selection.reduce((sum, phase) => sum + phaseMs[phase], 0), phase_ms: phaseMs,
    product_requests: trace.product_requests, recommendations: trace.recommendations, overrides: trace.overrides,
    quality: grade(trace, checklist, protocol), cost: cost(trace.calls, rates, trace.call_ledger_complete, trace.non_token_cost_usd),
    accounting_note: trace.accounting_note };
}

const stats = values => {
  if (!values.length || values.some(value => value === null)) return null;
  const ordered = [...values].sort((a,b) => a-b);
  const mid = Math.floor(ordered.length / 2);
  return { mean: values.reduce((sum,value) => sum+value,0)/values.length,
    median: ordered.length % 2 ? ordered[mid] : (ordered[mid-1]+ordered[mid])/2,
    min: ordered[0], max: ordered.at(-1) };
};

export function compare(runs, protocol) {
  unique(runs, 'run');
  const pairs = [];
  const reasons = [];
  if (runs.some(run => run.kind !== 'live')) reasons.push('Controlled rehearsal; no live comparison claim.');
  if (runs.length !== protocol.paired_executions * 2) reasons.push('Incomplete frozen execution schedule.');
  for (let pair = 1; pair <= protocol.paired_executions; pair++) {
    const members = runs.filter(run => run.pair === pair);
    const ordinary = members.filter(run => run.arm === 'ordinary');
    const advised = members.filter(run => run.arm === 'advised');
    requireThat(ordinary.length <= 1 && advised.length <= 1, `duplicate arm in pair ${pair}`);
    if (ordinary.length !== 1 || advised.length !== 1) continue;
    const [a] = ordinary, [b] = advised;
    const enough = a.quality.important_actions > 0 && a.quality.completed_employee_workflows >= 1;
    if (!enough) reasons.push(`Pair ${pair}: ordinary execution lacks a completed Employee workflow.`);
    const quality = b.quality.important_actions >= a.quality.important_actions - protocol.max_action_deficit_per_pair
      && b.quality.completed_employee_workflows >= a.quality.completed_employee_workflows
      && b.quality.unsupported_claims.length <= a.quality.unsupported_claims.length
      && protocol.critical_items.every(id => !a.quality.accepted.some(item => item.item_id === id) || b.quality.accepted.some(item => item.item_id === id));
    if (a.cost.api_equivalent_usd === null || b.cost.api_equivalent_usd === null) reasons.push(`Pair ${pair}: total API-equivalent cost is unknown.`);
    pairs.push({ pair, quality_met: quality && enough, action_difference: b.quality.important_actions - a.quality.important_actions,
      elapsed_difference_ms: b.elapsed_ms - a.elapsed_ms,
      cost_difference_usd: a.cost.api_equivalent_usd === null || b.cost.api_equivalent_usd === null ? null : round(b.cost.api_equivalent_usd - a.cost.api_equivalent_usd) });
  }
  if (pairs.length !== protocol.paired_executions) reasons.push('Missing complete pairs.');
  const elapsed = stats(pairs.map(pair => pair.elapsed_difference_ms));
  const costs = stats(pairs.map(pair => pair.cost_difference_usd));
  const qualityMet = pairs.length === protocol.paired_executions && pairs.every(pair => pair.quality_met);
  return { decision: reasons.length ? 'inconclusive' : qualityMet && elapsed.mean < 0 && costs.mean < 0 ? 'meets pilot criterion' : 'does not meet pilot criterion',
    quality_met: qualityMet, reasons, pairs, paired_action_difference: stats(pairs.map(pair => pair.action_difference)),
    paired_elapsed_difference_ms: elapsed, paired_cost_difference_usd: costs };
}

const sha = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
export function validateLaunch(launch, protocol) {
  for (const key of ['model', 'effort', 'service_tier', 'temperature', 'product_sha', 'actor', 'fixed_product_date']) requireThat(launch[key] === protocol[key], `launch ${key} differs from protocol`);
  for (const key of ['seed_sha256', 'product_build_sha256', 'freeze_sha256', 'common_instructions_sha256', 'ordinary_instructions_sha256', 'advised_instructions_sha256', 'tool_policy_sha256']) requireThat(sha(launch[key]), `launch needs ${key}`);
  for (const key of ['runtime_sha', 'cli_version', 'browser_version', 'grader_1', 'grader_2', 'result_reviewer', 'isolation_evidence', 'driver_evidence']) requireThat(present(launch[key]), `launch needs ${key}`);
  requireThat(launch.grader_1 !== launch.grader_2, 'graders must be independent identities');
  unique(launch.runs, 'launch run');
  const expected = protocol.order.flatMap((arms, index) => arms.map(arm => `${index + 1}:${arm}`));
  requireThat(JSON.stringify(launch.runs.map(run => `${run.pair}:${run.arm}`)) === JSON.stringify(expected), 'launch order differs from frozen schedule');
  return { valid: true, scheduled_executions: launch.runs.length };
}

function contained(base, name) {
  requireThat(present(name) && !isAbsolute(name), 'artifact path must be relative');
  const path = realpathSync(resolve(base, name));
  const rel = relative(realpathSync(base), path);
  requireThat(rel !== '..' && !rel.startsWith('../') && !rel.startsWith('..\\') && !isAbsolute(rel), 'artifact escapes packet');
  return path;
}

export function verifyManifest(base, manifest) {
  requireThat(manifest && Object.keys(manifest).length > 0, 'empty evidence manifest');
  for (const [name, expected] of Object.entries(manifest)) requireThat(sha(expected) && hash(contained(base, name)) === expected, `hash mismatch: ${name}`);
  return Object.keys(manifest).length;
}

function citation(base, manifest, value) {
  requireThat(present(value), 'missing artifact citation');
  const [name, pointer] = value.split('#');
  requireThat(manifest[name] && pointer?.startsWith('/'), `citation needs manifested file and JSON pointer: ${value}`);
  let found = read(contained(base, name));
  for (const key of pointer.slice(1).split('/').map(key => key.replaceAll('~1', '/').replaceAll('~0', '~'))) found = found?.[key];
  requireThat(found !== undefined && found !== null, `unresolved citation: ${value}`);
}

function report(packetFile, protocol, checklist, rates) {
  const base = dirname(packetFile);
  const packet = read(packetFile);
  verifyManifest(base, packet.manifest);
  requireThat(present(packet.overhead_note), 'preflight/author/grader accounting note required');
  if (packet.traces.some(trace => trace.kind === 'live')) {
    requireThat(packet.traces.every(trace => trace.kind === 'live'), 'do not mix live and controlled traces');
    requireThat(packet.manifest[packet.launch], 'launch must be manifested');
    const launch = read(contained(base, packet.launch));
    validateLaunch(launch, protocol);
    requireThat(launch.freeze_sha256 === hash(resolve(root, 'frozen.json')), 'launch uses different freeze');
    const contexts = new Set(), projects = new Set(), servers = new Set();
    for (const trace of packet.traces) {
      const planned = launch.runs.find(run => run.id === trace.id);
      requireThat(planned?.pair === trace.pair && planned?.arm === trace.arm, 'trace not in launch schedule');
      const receipt = trace.reset;
      for (const key of ['product_sha', 'seed_sha256', 'product_build_sha256', 'fixed_product_date']) requireThat(receipt?.[key] === launch[key], `reset ${key} mismatch`);
      for (const [key, seen] of [['browser_context_id', contexts], ['project_id', projects], ['server_instance_id', servers]]) {
        requireThat(present(receipt[key]) && !seen.has(receipt[key]), `reset reuses ${key}`); seen.add(receipt[key]);
      }
      requireThat(receipt.signed_out === true && receipt.empty_knowledge === true && receipt.empty_storage === true, 'reset must be signed out and empty');
      requireThat(trace.effective_model === protocol.model && trace.effective_effort === protocol.effort, 'effective model mismatch');
      requireThat(trace.comparability_verified === true, 'execution controls not verified');
      for (const value of [receipt.raw, trace.controls_raw, trace.grade.initial_1, trace.grade.initial_2, trace.grade.adjudication]) citation(base, packet.manifest, value);
    }
  }
  for (const trace of packet.traces) {
    for (const row of [...trace.actions.filter(row => row.executed), ...trace.observations, ...trace.calls]) if (row.raw) citation(base, packet.manifest, row.raw);
  }
  const runs = packet.traces.map(trace => summarize(trace, checklist, protocol, rates));
  return { kind: packet.traces.every(trace => trace.kind === 'controlled') ? 'controlled rehearsal' : 'live comparison',
    runs, comparison: compare(runs, protocol), overhead_note: packet.overhead_note,
    limitation: 'Structural validation checks citations and accounting. Independent graders must verify semantic support against raw evidence. Controlled outcomes do not prove Product behavior.' };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const protocol = read(resolve(root, 'protocol.json'));
    const command = process.argv[2];
    let output;
    if (command === 'verify') {
      const frozen = read(resolve(root, 'frozen.json'));
      const files = verifyManifest(root, frozen.hashes);
      const preserved = read(resolve(root, 'preservation.json'));
      output = { frozen_files: files, preserved_files: verifyManifest(resolve(root, '..'), preserved.files) };
    } else if (command === 'launch') {
      verifyManifest(root, read(resolve(root, 'frozen.json')).hashes);
      const launch = read(resolve(process.argv[3]));
      output = validateLaunch(launch, protocol);
      requireThat(launch.freeze_sha256 === hash(resolve(root, 'frozen.json')), 'launch uses different freeze');
    } else if (command === 'report') {
      verifyManifest(root, read(resolve(root, 'frozen.json')).hashes);
      output = report(resolve(process.argv[3]), protocol, read(resolve(root, 'checklist.json')), read(resolve(root, 'rates.json')));
    } else throw Error('Usage: node evaluate.mjs verify | launch launch.json | report packet.json');
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    console.error(error.message); process.exitCode = 1;
  }
}
