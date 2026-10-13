import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = path.dirname(fileURLToPath(import.meta.url));

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const fail = message => { throw new Error(message); };
const numericIds = values => Array.isArray(values) && values.every(value => Number.isInteger(value));
const strings = values => Array.isArray(values) && values.every(value => typeof value === 'string' && value.length > 0);

function check(condition, message, errors) {
  if (!condition) errors.push(message);
}

function packetScenarioIds(proposals) {
  const ids = new Set();
  const visit = value => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== 'object') return;
    if (typeof value.id === 'string' && typeof value.gherkin === 'string') ids.add(value.id);
    Object.values(value).forEach(visit);
  };
  visit(proposals);
  return ids;
}

function checkpointMaps(checkpoints, trace, observations, errors) {
  check(checkpoints && typeof checkpoints === 'object', 'Packet checkpoints must be an object.', errors);
  const startedAt = Date.parse(checkpoints?.candidateStartedAt);
  check(!Number.isNaN(startedAt), 'Packet lacks a valid candidate_start time.', errors);
  const traceIds = new Set(trace.keys());
  const result = new Map();
  for (const entry of checkpoints?.checkpoints ?? []) {
    check(Number.isInteger(entry.minutes), 'Checkpoint minutes must be an integer.', errors);
    check(!result.has(entry.minutes), `Duplicate ${entry.minutes}-minute checkpoint.`, errors);
    const observed = new Set(entry.eligibleObservationIds ?? []);
    const events = new Set([...(entry.productEventIds ?? []), ...(entry.browserEventIds ?? [])]);
    check(strings(entry.eligibleObservationIds ?? []), `Checkpoint ${entry.minutes} has invalid observation IDs.`, errors);
    check(numericIds(entry.productEventIds ?? []) && numericIds(entry.browserEventIds ?? []), `Checkpoint ${entry.minutes} has invalid event IDs.`, errors);
    const cutoffAt = startedAt + entry.minutes * 60_000;
    check(typeof entry.cutoff === 'string' && Date.parse(entry.cutoff) === cutoffAt, `Checkpoint ${entry.minutes} cutoff does not match candidate_start.`, errors);
    for (const id of observed) check(observations.has(id), `Checkpoint ${entry.minutes} cites unknown Observation ${id}.`, errors);
    for (const id of events) check(traceIds.has(id), `Checkpoint ${entry.minutes} cites unknown trace event ${id}.`, errors);
    result.set(entry.minutes, { observations: observed, events, cutoffAt });
  }
  for (const minutes of [10, 20, 40]) check(result.has(minutes), `Packet lacks the ${minutes}-minute checkpoint.`, errors);
  return result;
}

function validateSupportSets(checkItem, observations, traceIds, errors) {
  const prefix = checkItem.id;
  check(Array.isArray(checkItem.seenSupportSets), `${prefix} seenSupportSets must be an array.`, errors);
  check(Array.isArray(checkItem.savedSupportSets), `${prefix} savedSupportSets must be an array.`, errors);
  for (const support of checkItem.seenSupportSets ?? []) {
    check(numericIds(support) && support.length > 0, `${prefix} has an empty or invalid seen support set.`, errors);
    for (const eventId of support ?? []) check(traceIds.has(eventId), `${prefix} cites unknown trace event ${eventId}.`, errors);
  }
  for (const support of checkItem.savedSupportSets ?? []) {
    check(support && typeof support === 'object', `${prefix} has an invalid saved support set.`, errors);
    check(strings(support?.observationIds) && support.observationIds.length > 0, `${prefix} has an empty or invalid saved Observation set.`, errors);
    check(numericIds(support?.eventIds) && support.eventIds.length > 0, `${prefix} has an empty or invalid saved event set.`, errors);
    for (const observationId of support?.observationIds ?? []) check(observations.has(observationId), `${prefix} cites Observation ${observationId} absent from final public Knowledge.`, errors);
    for (const eventId of support?.eventIds ?? []) check(traceIds.has(eventId), `${prefix} cites unknown trace event ${eventId}.`, errors);
  }
  if (checkItem.seen) check((checkItem.seenSupportSets ?? []).length > 0, `${prefix} is seen without complete support.`, errors);
  if (checkItem.saved) check((checkItem.savedSupportSets ?? []).length > 0, `${prefix} is saved without complete support.`, errors);
  if (!checkItem.seen) check((checkItem.seenSupportSets ?? []).length === 0, `${prefix} is seen false with support.`, errors);
  if (!checkItem.saved) check((checkItem.savedSupportSets ?? []).length === 0, `${prefix} is saved false with support.`, errors);
}

function supportByCutoff(support, checkpoint, observations, trace) {
  return support.eventIds.every(id => checkpoint.events.has(id))
    && support.eventIds.every(id => Date.parse(trace.get(id).time) <= checkpoint.cutoffAt)
    && support.observationIds.every(id => checkpoint.observations.has(id)
      && observations.get(id).writeEvent !== null
      && Date.parse(observations.get(id).writeTime) <= checkpoint.cutoffAt);
}

function rate(claims, saved) {
  return saved === 0 ? null : claims / saved;
}

/**
 * Validates an adjudicated grade against one anonymous review packet and derives
 * only the mechanically defined metrics in SCORING.md. It never assigns credit.
 */
export function validateAndMeasure({ inventoryIds, packet, grade }) {
  const errors = [];
  check(Array.isArray(inventoryIds) && inventoryIds.length === 27, 'Inventory must contain exactly 27 IDs.', errors);
  check(new Set(inventoryIds).size === inventoryIds.length, 'Inventory IDs must be distinct.', errors);
  const observations = new Map((packet.observations ?? []).map(item => [item.id, item]));
  check(observations.size === (packet.observations ?? []).length, 'Packet has duplicate Observation IDs.', errors);
  for (const observation of observations.values()) {
    check(typeof observation.id === 'string' && observation.id.length > 0, 'Packet Observation lacks an ID.', errors);
    check(Number.isInteger(observation.writeEvent), `Observation ${observation.id} lacks an accepted write event.`, errors);
    check(typeof observation.writeTime === 'string' && !Number.isNaN(Date.parse(observation.writeTime)), `Observation ${observation.id} lacks an accepted write time.`, errors);
  }
  const trace = new Map((packet.trace ?? []).map(event => [event.event, event]));
  const traceIds = new Set(trace.keys());
  check(traceIds.size === (packet.trace ?? []).length, 'Packet trace has duplicate event IDs.', errors);
  check([...traceIds].every(Number.isInteger), 'Packet trace event IDs must be integers.', errors);
  const checkpoints = checkpointMaps(packet.checkpoints, trace, observations, errors);

  check(Array.isArray(grade?.checks), 'grade.json checks must be an array.', errors);
  const checks = new Map();
  for (const item of grade?.checks ?? []) {
    check(item && typeof item === 'object', 'grade.json contains an invalid check.', errors);
    check(typeof item?.id === 'string', 'grade.json check lacks an ID.', errors);
    check(!checks.has(item?.id), `Duplicate grade check ${item?.id}.`, errors);
    if (item?.id) checks.set(item.id, item);
  }
  check(checks.size === inventoryIds.length && inventoryIds.every(id => checks.has(id)), 'grade.json must contain each of the 27 exact inventory IDs once.', errors);
  for (const id of inventoryIds) {
    const item = checks.get(id);
    if (!item) continue;
    for (const key of ['seen', 'saved', 'directlyJourneyLinked']) check(typeof item[key] === 'boolean', `${id} ${key} must be a boolean.`, errors);
    check(typeof item.rationale === 'string' && item.rationale.length > 0, `${id} needs a rationale.`, errors);
    check(!item.saved || item.seen, `${id} saved requires seen.`, errors);
    check(!item.directlyJourneyLinked || item.saved, `${id} directlyJourneyLinked requires saved.`, errors);
    validateSupportSets(item, observations, traceIds, errors);
  }

  check(Array.isArray(grade?.unsupportedClaims), 'unsupportedClaims must be an array.', errors);
  const claims = grade?.unsupportedClaims ?? [];
  for (const claim of claims) {
    check(claim && typeof claim.claim === 'string' && claim.claim.length > 0, 'Unsupported claim needs claim text.', errors);
    check(strings(claim?.observationIds) && claim.observationIds.length > 0, `Unsupported claim ${claim?.claim ?? ''} needs saved Observation IDs.`, errors);
    check(numericIds(claim?.eventIds ?? []), `Unsupported claim ${claim?.claim ?? ''} has invalid event IDs.`, errors);
    check(typeof claim?.reason === 'string' && claim.reason.length > 0, `Unsupported claim ${claim?.claim ?? ''} needs a reason.`, errors);
    check(typeof claim?.material === 'boolean', `Unsupported claim ${claim?.claim ?? ''} needs material.`, errors);
    for (const id of claim?.observationIds ?? []) check(observations.has(id), `Unsupported claim cites Observation ${id} absent from final public Knowledge.`, errors);
    for (const id of claim?.eventIds ?? []) check(traceIds.has(id), `Unsupported claim cites unknown trace event ${id}.`, errors);
  }

  const proposedIds = packetScenarioIds(packet.proposals ?? []);
  check(Array.isArray(grade?.scenarios), 'scenarios must be an array.', errors);
  const scenarios = new Map();
  for (const scenario of grade?.scenarios ?? []) {
    const observationIds = Array.isArray(scenario?.observationIds) ? scenario.observationIds : [];
    const unsupportedOutcomes = Array.isArray(scenario?.unsupportedOutcomes) ? scenario.unsupportedOutcomes : [];
    check(scenario && typeof scenario.id === 'string', 'Scenario needs an ID.', errors);
    check(!scenarios.has(scenario?.id), `Duplicate graded Scenario ${scenario?.id}.`, errors);
    if (scenario?.id) scenarios.set(scenario.id, scenario);
    check(typeof scenario?.grounded === 'boolean', `Scenario ${scenario?.id ?? ''} grounded must be a boolean.`, errors);
    check(typeof scenario?.distinctBehaviorKey === 'string' && scenario.distinctBehaviorKey.length > 0, `Scenario ${scenario?.id ?? ''} needs distinctBehaviorKey.`, errors);
    check(strings(observationIds), `Scenario ${scenario?.id ?? ''} has invalid Observation IDs.`, errors);
    check(Array.isArray(scenario?.unsupportedOutcomes), `Scenario ${scenario?.id ?? ''} unsupportedOutcomes must be an array.`, errors);
    check(typeof scenario?.rationale === 'string' && scenario.rationale.length > 0, `Scenario ${scenario?.id ?? ''} needs a rationale.`, errors);
    if (scenario?.grounded) {
      check(observationIds.length > 0, `Scenario ${scenario.id} grounded requires saved Observation support.`, errors);
      check(unsupportedOutcomes.length === 0, `Scenario ${scenario.id} grounded cannot have unsupportedOutcomes.`, errors);
    }
    for (const id of observationIds) check(observations.has(id), `Scenario ${scenario?.id ?? ''} cites Observation ${id} absent from final public Knowledge.`, errors);
  }
  check(scenarios.size === proposedIds.size && [...proposedIds].every(id => scenarios.has(id)), 'grade.json scenarios must cover every proposed Scenario exactly once.', errors);
  check(Array.isArray(grade?.notes), 'notes must be an array.', errors);
  if (errors.length) fail(errors.join('\n'));

  const checkpointResults = {};
  for (const minutes of [10, 20, 40]) {
    const checkpoint = checkpoints.get(minutes);
    const seen = inventoryIds.filter(id => checks.get(id).seen && checks.get(id).seenSupportSets.some(set => set.every(eventId => checkpoint.events.has(eventId) && Date.parse(trace.get(eventId).time) <= checkpoint.cutoffAt))).length;
    const saved = inventoryIds.filter(id => checks.get(id).saved && checks.get(id).savedSupportSets.some(set => supportByCutoff(set, checkpoint, observations, trace))).length;
    const unsupportedClaims = claims.filter(claim => claim.material && claim.observationIds.some(id => checkpoint.observations.has(id))).length;
    checkpointResults[minutes] = { seen, saved, unsupportedClaims, unsupportedRate: rate(unsupportedClaims, saved) };
  }
  const finalSeen = inventoryIds.filter(id => checks.get(id).seen).length;
  const finalSaved = inventoryIds.filter(id => checks.get(id).saved).length;
  const directlyJourneyLinked = inventoryIds.filter(id => checks.get(id).directlyJourneyLinked).length;
  const groundedBehaviorKeys = new Set([...scenarios.values()].filter(scenario => scenario.grounded).map(scenario => scenario.distinctBehaviorKey));
  const finalUnsupported = claims.filter(claim => claim.material).length;
  return {
    checkpoints: checkpointResults,
    final: { seen: finalSeen, saved: finalSaved, directlyJourneyLinked, unsupportedClaims: finalUnsupported, unsupportedRate: rate(finalUnsupported, finalSaved) },
    create: { proposedScenarios: scenarios.size, distinctGroundedBehaviorCount: groundedBehaviorKeys.size },
  };
}

const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const median = values => {
  const ordered = [...values].sort((left, right) => left - right), middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
};
const percentile = (values, proportion) => {
  const ordered = [...values].sort((left, right) => left - right), index = (ordered.length - 1) * proportion, lower = Math.floor(index), upper = Math.ceil(index);
  return ordered[lower] + (ordered[upper] - ordered[lower]) * (index - lower);
};

function bootstrapMeans(differences) {
  const values = [];
  const choose = (depth, sum) => {
    if (depth === differences.length) { values.push(sum / differences.length); return; }
    for (const difference of differences) choose(depth + 1, sum + difference);
  };
  choose(0, 0);
  return { samples: values.length, percentile95: [percentile(values, 0.025), percentile(values, 0.975)] };
}

function comparison(runs, baseline) {
  const byArmAndBlock = new Map(runs.map(run => [`${run.arm}:${run.block}`, run]));
  const differences = [1, 2, 3, 4, 5].map(block => {
    const candidate = byArmAndBlock.get(`C:${block}`), comparator = byArmAndBlock.get(`${baseline}:${block}`);
    if (!candidate || !comparator) fail(`Missing paired block ${block} for C-${baseline}.`);
    return candidate.checkpoints[40].saved - comparator.checkpoints[40].saved;
  });
  return { differences, mean: mean(differences), median: median(differences), range: [Math.min(...differences), Math.max(...differences)], bootstrap: bootstrapMeans(differences) };
}

function armSummary(runs, arm) {
  const armRuns = runs.filter(run => run.arm === arm);
  const totalSaved = armRuns.reduce((sum, run) => sum + run.checkpoints[40].saved, 0);
  const totalClaims = armRuns.reduce((sum, run) => sum + (run.checkpoints[40].unsupportedClaims ?? 0), 0);
  return { runs: armRuns.length, meanSavedAt40: mean(armRuns.map(run => run.checkpoints[40].saved)), totalSavedAt40: totalSaved, unsupportedClaimsAt40: totalClaims, unsupportedRateAt40: rate(totalClaims, totalSaved) };
}

/** Aggregates complete, validated trial measurements. */
export function aggregate(runs) {
  for (const arm of ['A', 'B', 'C', 'D']) {
    const armRuns = runs.filter(run => run.arm === arm);
    if (armRuns.length !== 5) fail(`Aggregate requires five complete runs for arm ${arm}.`);
    if (new Set(armRuns.map(run => run.block)).size !== 5 || ![1, 2, 3, 4, 5].every(block => armRuns.some(run => run.block === block))) fail(`Aggregate requires blocks 1 through 5 for arm ${arm}.`);
  }
  const arms = Object.fromEntries(['A', 'B', 'C', 'D'].map(arm => [arm, armSummary(runs, arm)]));
  const comparisons = { 'C-B': comparison(runs, 'B'), 'C-D': comparison(runs, 'D') };
  const thresholdFor = baseline => {
    const candidate = arms.C, comparator = arms[baseline];
    if (comparator.meanSavedAt40 === 0 || comparator.unsupportedRateAt40 === null || candidate.unsupportedRateAt40 === null) return { baseline, status: 'inconclusive', coverage: 'relative difference undefined', unsupportedRate: 'undefined' };
    const coverage = candidate.meanSavedAt40 >= comparator.meanSavedAt40 * 1.2;
    const unsupportedRate = candidate.unsupportedRateAt40 <= comparator.unsupportedRateAt40;
    return { baseline, status: coverage && unsupportedRate ? 'passed' : 'not_met', coverage, unsupportedRate, candidateMeanSavedAt40: candidate.meanSavedAt40, baselineMeanSavedAt40: comparator.meanSavedAt40, candidateUnsupportedRateAt40: candidate.unsupportedRateAt40, baselineUnsupportedRateAt40: comparator.unsupportedRateAt40 };
  };
  const thresholds = [thresholdFor('B'), thresholdFor('D')];
  return { arms, comparisons, threshold: { status: thresholds.every(result => result.status === 'passed') ? 'passed' : thresholds.some(result => result.status === 'not_met') ? 'not_met' : 'inconclusive', comparisons: thresholds }, cost: 'unknown' };
}

function verifyFrozenFile(root, file) {
  const frozen = readJson(path.join(root, 'frozen-inputs.json'));
  const expected = frozen.hashes?.[file];
  if (typeof expected !== 'string') fail(`Frozen inputs lack ${file} hash.`);
  const actual = fs.readFileSync(path.join(root, file));
  if (createHash('sha256').update(actual).digest('hex') !== expected) fail(`${file} differs from frozen inputs.`);
  return expected;
}

function loadPacket(packetPath, expectedScoringHash, packetHashes) {
  for (const [file, expected] of Object.entries(packetHashes ?? {})) {
    if (file === 'grade.json') continue;
    const resolved = path.resolve(packetPath, file);
    if (!resolved.startsWith(packetPath + path.sep)) fail(`Packet ${packetPath} names a file outside its directory.`);
    const contents = fs.readFileSync(resolved);
    if (createHash('sha256').update(contents).digest('hex') !== expected) fail(`Packet ${packetPath} has a changed ${file}.`);
  }
  const packet = {
    observations: readJson(path.join(packetPath, 'observations.json')),
    checkpoints: readJson(path.join(packetPath, 'checkpoints.json')),
    proposals: readJson(path.join(packetPath, 'create-proposals.json')),
    trace: fs.readFileSync(path.join(packetPath, 'trace.jsonl'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse),
  };
  const packetScoring = fs.readFileSync(path.join(packetPath, 'SCORING.md'));
  if (createHash('sha256').update(packetScoring).digest('hex') !== expectedScoringHash) fail(`Packet ${packetPath} has a non-frozen SCORING.md.`);
  return packet;
}

export async function analyze(root = base) {
  const config = readJson(path.join(root, 'config.json'));
  const inventory = readJson(path.join(root, 'inventory.json'));
  const inventoryIds = inventory.items?.map(item => item.id);
  const scoringHash = verifyFrozenFile(root, 'SCORING.md');
  verifyFrozenFile(root, 'config.json');
  verifyFrozenFile(root, 'inventory.json');
  const packetRoot = path.resolve(root, 'review-packets');
  const runs = [], missing = [];
  for (const trial of config.trials) {
    const mappingFile = path.join(root, 'attempts', trial.id, 'review-packet.json');
    if (!fs.existsSync(mappingFile)) { missing.push({ id: trial.id, reason: 'review packet missing' }); continue; }
    const mapping = readJson(mappingFile);
    const packetPath = path.resolve(mapping.path);
    if (!packetPath.startsWith(packetRoot + path.sep)) fail(`Trial ${trial.id} maps outside review-packets.`);
    const gradeFile = path.join(packetPath, 'grade.json');
    if (!fs.existsSync(gradeFile)) { missing.push({ id: trial.id, reason: 'adjudicated grade missing' }); continue; }
    const packet = loadPacket(packetPath, scoringHash, mapping.hashes);
    const measurement = validateAndMeasure({ inventoryIds, packet, grade: readJson(gradeFile) });
    runs.push({ id: trial.id, arm: trial.arm, block: trial.block, ...measurement, reviewPacket: mapping.label });
  }
  const result = { complete: missing.length === 0 && runs.length === config.trials.length, expectedRuns: config.trials.length, gradedRuns: runs.length, missing, runs, cost: 'unknown' };
  if (result.complete) result.aggregate = aggregate(runs);
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  analyze(process.argv[2] ? path.resolve(process.argv[2]) : base).then(result => console.log(JSON.stringify(result, null, 2))).catch(error => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
