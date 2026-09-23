import assert from "node:assert/strict";
import test from "node:test";
import { analyze } from "./analyze.mjs";

const policy = { version: "investigate-jev-v1", model: "jev-1.13.0" };
const ids = [
  "00000000-0000-4000-8000-000000000001",
  "00000000-0000-4000-8000-000000000002",
  "00000000-0000-4000-8000-000000000003",
  "00000000-0000-4000-8000-000000000004",
];

function judgment(question, modelOutcome, outcome, blockers = []) {
  const probabilities = { supported: 0.02, contradicted: 0.03, insufficient_evidence: 0.95 };
  probabilities[modelOutcome] = 0.95;
  for (const key of Object.keys(probabilities)) if (key !== modelOutcome) probabilities[key] = 0.025;
  return { question, modelOutcome, outcome, probabilities, blockers };
}

function record(status, id, options = {}) {
  const common = {
    id,
    findingId: id,
    assessmentRevision: 1,
    inputFingerprint: "a".repeat(64),
    evidenceIds: [],
    recommendedLayer: "product",
    policy,
    createdAt: "2026-09-19T09:00:00.000Z",
    gaps: [],
  };
  if (status === "pending") return { ...common, status, judgments: [], attempts: [] };
  return {
    ...common,
    status,
    completedAt: "2026-09-19T09:00:01.000Z",
    judgments: options.judgments ?? [],
    attempts: options.attempts ?? [],
    ...(status === "unavailable" ? { reason: "provider_failure" } : {}),
    ...(status === "stale" ? { reason: "inputs_changed" } : {}),
  };
}

function sample(caseId, status, options = {}) {
  return {
    caseId,
    source: "real_run",
    sourceReference: `finding/${caseId}`,
    capturedBeforeHumanDecision: true,
    blindedHumanReview: true,
    record: record(status, options.id ?? ids[0], options),
    human: {
      reviewer: "Reviewer A",
      at: "2026-09-19T10:00:00.000Z",
      rationale: "Independent label.",
      comparable: options.comparable ?? true,
      ...(options.comparable === false
        ? { nonComparableReason: "The frozen packet could not be reviewed after the source changed." }
        : { frozenInputFingerprint: "a".repeat(64) }),
      layer: options.layer ?? "product",
      judgments: options.humanJudgments ?? {
        behavior: "supported",
        encoding: "insufficient_evidence",
        conditions: "contradicted",
        recommendation: "supported",
      },
    },
  };
}

test("analyze reports hand-counted effective agreement, failures, and unknown usage", () => {
  const judgments = [
    judgment("behavior", "supported", "supported"),
    judgment("encoding", "contradicted", "insufficient_evidence", ["No source"]),
    judgment("conditions", "supported", "supported"),
    judgment("recommendation", "supported", "supported"),
  ];
  const attempts = [5, 0, null, 2].map((inputTokens) => ({
    elapsedMs: 10,
    httpStatus: 200,
    usage: inputTokens === null ? null : { inputTokens, outputTokens: 0, cachedInputTokens: null, cacheCreationInputTokens: null },
    outcome: "received",
  }));
  const unavailableAttempt = [{ elapsedMs: 4, httpStatus: 503, usage: null, outcome: "provider_failure" }];
  const report = analyze([
    sample("case-1", "completed", { id: ids[0], judgments, attempts }),
    sample("case-2", "pending", { id: ids[1] }),
    sample("case-3", "unavailable", { id: ids[2], attempts: unavailableAttempt }),
    sample("case-4", "stale", { id: ids[3] }),
  ]);

  assert.deepEqual(report.records, { completed: 1, pending: 1, unavailable: 1, stale: 1 });
  assert.deepEqual(report.questions.behavior.effectiveOutcomeAgreement, { compared: 1, matches: 1 });
  assert.deepEqual(report.questions.encoding.modelChoiceAgreement, { compared: 1, matches: 0 });
  assert.deepEqual(report.questions.encoding.effectiveOutcomeAgreement, { compared: 1, matches: 1 });
  assert.equal(report.questions.encoding.insufficientEvidence.effective, 1);
  assert.equal(report.questions.encoding.insufficientEvidence.human, 4);
  assert.equal(report.questions.conditions.confidentlyWrong, 1);
  assert.deepEqual(report.recommendation.byHumanLayer.product.effectiveOutcomeAgreement, { compared: 1, matches: 1 });
  assert.deepEqual(report.recommendation.supportedAgentLayerAgreement, { compared: 1, matches: 1 });
  assert.deepEqual(report.usage.inputTokens, { knownAttempts: 3, unknownAttempts: 2, sum: 7 });
  assert.equal(report.latency.providerAttemptElapsedMsSum, 44);
  assert.equal(report.providerFailures, 1);
  assert.deepEqual(report.disagreementExamples, [{
    caseId: "case-1",
    findingId: ids[0],
    status: "completed",
    humanLayer: "product",
    questions: [
      { question: "encoding", modelOutcome: "contradicted", effectiveOutcome: "insufficient_evidence", humanOutcome: "insufficient_evidence", confidentlyWrong: true },
      { question: "conditions", modelOutcome: "supported", effectiveOutcome: "supported", humanOutcome: "contradicted", confidentlyWrong: true },
    ],
  }]);
});

test("analyze refuses repeated Finding ids, repeated case ids, and synthetic sources", () => {
  const first = sample("case-1", "pending", { id: ids[0] });
  assert.throws(() => analyze([first, sample("case-1", "pending", { id: ids[1] })]), /Duplicate caseId/);
  assert.throws(() => analyze([first, sample("case-2", "pending", { id: ids[0] })]), /Duplicate Finding id/);
  assert.throws(() => analyze([{ ...first, source: "synthetic" }]), /real_run/);
  assert.throws(() => analyze([]), /at least one/);
  assert.throws(() => analyze([{ ...first, human: { ...first.human, at: "not-a-timestamp" } }]), /timestamp/);
  assert.throws(() => analyze([{ ...first, human: { ...first.human, frozenInputFingerprint: "b".repeat(64) } }]), /frozen input/);
});

test("analyze retains a non-comparable stale record without scoring a newer assessment", () => {
  const stale = sample("case-stale", "stale", { id: ids[3], comparable: false });
  const report = analyze([stale]);
  assert.deepEqual(report.records, { completed: 0, pending: 0, unavailable: 0, stale: 1 });
  assert.deepEqual(report.comparability, { comparable: 0, nonComparable: 1 });
  assert.deepEqual(report.questions.behavior.effectiveOutcomeAgreement, { compared: 0, matches: 0 });
});


test("analyze counts human labels once for partial advice and excludes non-comparable labels", () => {
  const report = analyze([
    sample("partial", "unavailable", { id: ids[0], judgments: [judgment("encoding", "insufficient_evidence", "insufficient_evidence")] }),
    sample("pending", "pending", { id: ids[1] }),
    sample("excluded", "stale", { id: ids[2], comparable: false }),
  ]);
  assert.equal(report.questions.encoding.insufficientEvidence.human, 2);
  assert.equal(report.questions.encoding.insufficientEvidence.modelChoice, 1);
  assert.deepEqual(report.questions.encoding.modelChoiceAgreement, { compared: 1, matches: 1 });
  assert.equal(report.questions.behavior.insufficientEvidence.human, 0);
});
