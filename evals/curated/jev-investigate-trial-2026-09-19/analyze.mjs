import fs from "node:fs";
import { fileURLToPath } from "node:url";
import {
  findingJudgmentSchema,
  JUDGMENT_POLICY,
  JUDGMENT_QUESTIONS,
} from "../../../src/findings/judgment-policy.ts";

const OUTCOMES = new Set(["supported", "contradicted", "insufficient_evidence"]);
const LAYERS = new Set(["product", "expected_behavior", "test", "run_conditions", "dismiss", "unresolved"]);

export function analyze(raw) {
  if (!Array.isArray(raw)) throw new Error("Samples must be an array");
  if (raw.length === 0) throw new Error("Samples must contain at least one real Finding");
  if (raw.length > 20) throw new Error("The frozen cohort permits at most 20 Findings");
  const samples = raw.map(validateSample);
  const caseIds = new Set();
  const findingIds = new Set();
  for (const sample of samples) {
    if (caseIds.has(sample.caseId)) throw new Error(`Duplicate caseId: ${sample.caseId}`);
    if (findingIds.has(sample.record.findingId)) throw new Error(`Duplicate Finding id: ${sample.record.findingId}`);
    caseIds.add(sample.caseId);
    findingIds.add(sample.record.findingId);
  }

  const questions = Object.fromEntries(JUDGMENT_QUESTIONS.map((question) => [question, questionMetrics()]));
  const report = {
    policy: JUDGMENT_POLICY,
    samples: samples.length,
    attestations: {
      capturedBeforeHumanDecision: samples.filter((sample) => sample.capturedBeforeHumanDecision).length,
      blindedHumanReview: samples.filter((sample) => sample.blindedHumanReview).length,
      note: "These attestations are supplied metadata. They do not prove real-Run lineage or reviewer blinding.",
    },
    records: { completed: 0, pending: 0, unavailable: 0, stale: 0 },
    comparability: { comparable: 0, nonComparable: 0 },
    questions,
    disagreementExamples: [],
    recommendation: { byHumanLayer: {}, supportedAgentLayerAgreement: agreement() },
    attempts: { received: 0, provider_failure: 0, timeout: 0, invalid_output: 0 },
    providerFailures: 0,
    usage: {
      inputTokens: usageCounter(),
      outputTokens: usageCounter(),
      cachedInputTokens: usageCounter(),
      cacheCreationInputTokens: usageCounter(),
    },
    latency: {
      providerAttemptElapsedMsSum: 0,
      note: "This is the sum of recorded provider-attempt latency. It is not end-to-end Investigate time.",
    },
  };

  for (const sample of samples) {
    const { record, human } = sample;
    report.records[record.status] += 1;
    report.comparability[human.comparable ? "comparable" : "nonComparable"] += 1;
    if (record.status === "unavailable" && ["provider_failure", "timeout", "invalid_output"].includes(record.reason)) report.providerFailures += 1;
    for (const attempt of record.attempts) {
      report.attempts[attempt.outcome] += 1;
      report.latency.providerAttemptElapsedMsSum += attempt.elapsedMs;
      for (const name of Object.keys(report.usage)) updateUsage(report.usage[name], attempt.usage?.[name] ?? null);
    }
    if (!human.comparable) continue;
    for (const question of JUDGMENT_QUESTIONS) {
      report.questions[question].insufficientEvidence.human += Number(human.judgments[question] === "insufficient_evidence");
    }
    const disagreements = [];
    for (const model of record.judgments) {
      const expected = human.judgments[model.question];
      const metric = report.questions[model.question];
      compare(metric.modelChoiceAgreement, model.modelOutcome, expected);
      compare(metric.effectiveOutcomeAgreement, model.outcome, expected);
      metric.insufficientEvidence.modelChoice += Number(model.modelOutcome === "insufficient_evidence");
      metric.insufficientEvidence.effective += Number(model.outcome === "insufficient_evidence");
      const confidentlyWrong = model.probabilities[model.modelOutcome] >= 0.9 && model.modelOutcome !== expected;
      metric.confidentlyWrong += Number(confidentlyWrong);
      if (model.modelOutcome !== expected || model.outcome !== expected) {
        disagreements.push({ question: model.question, modelOutcome: model.modelOutcome, effectiveOutcome: model.outcome, humanOutcome: expected, confidentlyWrong });
      }
      if (model.question !== "recommendation") continue;
      const layer = report.recommendation.byHumanLayer[human.layer] ??= { modelChoiceAgreement: agreement(), effectiveOutcomeAgreement: agreement(), samples: 0 };
      layer.samples += 1;
      compare(layer.modelChoiceAgreement, model.modelOutcome, expected);
      compare(layer.effectiveOutcomeAgreement, model.outcome, expected);
      if (model.outcome === "supported" && expected === "supported" && record.recommendedLayer !== undefined && human.layer !== "unresolved") {
        compare(report.recommendation.supportedAgentLayerAgreement, record.recommendedLayer, human.layer);
      }
    }
    if (disagreements.length) {
      report.disagreementExamples.push({ caseId: sample.caseId, findingId: record.findingId, status: record.status, humanLayer: human.layer, questions: disagreements });
    }
  }
  return report;
}

function validateSample(value) {
  if (!record(value)) throw new Error("Each sample must be an object");
  if (typeof value.caseId !== "string" || value.caseId.trim() === "") throw new Error("Sample caseId is required");
  if (value.source !== "real_run") throw new Error("Trial samples must have source real_run");
  if (typeof value.sourceReference !== "string" || value.sourceReference.trim() === "") throw new Error("Sample sourceReference is required");
  if (value.capturedBeforeHumanDecision !== true || value.blindedHumanReview !== true) throw new Error("Each sample must attest pre-Decision capture and blinded human review");
  const parsed = findingJudgmentSchema.safeParse(value.record);
  if (!parsed.success) throw new Error(`Invalid FindingJudgment: ${parsed.error.message}`);
  if (parsed.data.policy.version !== JUDGMENT_POLICY.version || parsed.data.policy.model !== JUDGMENT_POLICY.model) throw new Error("FindingJudgment policy does not match this frozen trial");
  if (!record(value.human) || typeof value.human.reviewer !== "string" || value.human.reviewer.trim() === "" ||
      typeof value.human.at !== "string" || typeof value.human.rationale !== "string" || value.human.rationale.trim() === "" ||
      typeof value.human.layer !== "string" || !LAYERS.has(value.human.layer) || !record(value.human.judgments)) throw new Error("Sample human label is invalid");
  if (!isoTimestamp(value.human.at)) throw new Error("Sample human timestamp is invalid");
  if (value.human.comparable !== true && value.human.comparable !== false) throw new Error("Sample human comparability is required");
  if (value.human.comparable) {
    if (typeof value.human.frozenInputFingerprint !== "string" || value.human.frozenInputFingerprint !== parsed.data.inputFingerprint) throw new Error("Human label must bind to the frozen input fingerprint");
  } else if (typeof value.human.nonComparableReason !== "string" || value.human.nonComparableReason.trim() === "") {
    throw new Error("A non-comparable human label requires its reason");
  }
  for (const question of JUDGMENT_QUESTIONS) if (!OUTCOMES.has(value.human.judgments[question])) throw new Error(`Human label is missing ${question}`);
  return { ...value, record: parsed.data };
}

function questionMetrics() {
  return { modelChoiceAgreement: agreement(), effectiveOutcomeAgreement: agreement(), insufficientEvidence: { modelChoice: 0, effective: 0, human: 0 }, confidentlyWrong: 0 };
}

function agreement() {
  return { compared: 0, matches: 0 };
}

function compare(metric, left, right) {
  metric.compared += 1;
  metric.matches += Number(left === right);
}

function usageCounter() {
  return { knownAttempts: 0, unknownAttempts: 0, sum: 0 };
}

function updateUsage(counter, value) {
  if (value === null) {
    counter.unknownAttempts += 1;
  } else {
    counter.knownAttempts += 1;
    counter.sum += value;
  }
}

function record(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isoTimestamp(value) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u.test(value) && !Number.isNaN(Date.parse(value));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 3) throw new Error("Usage: node --import tsx analyze.mjs <samples.json>");
  const samples = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  process.stdout.write(`${JSON.stringify(analyze(samples), null, 2)}\n`);
}
