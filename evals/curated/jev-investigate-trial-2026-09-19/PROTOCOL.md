# Investigate Jev trial

**Status: NOT RUN.** This directory defines the real-Run comparison for #378. It contains no Project records, human labels, provider calls, or quality result. Synthetic tests of `analyze.mjs` prove only local counting and validation.

## Frozen policy and cohort

Score only `investigate-jev-v1` with model `jev-1.13.0`, as exported by `src/findings/judgment-policy.ts`. Before collecting a sample, write a freeze record outside this repository's tracked trial inputs containing:

- the candidate commit SHA;
- SHA-256 hashes of this protocol, `src/findings/judgment-policy.ts`, `src/findings/judgment-sharing.ts`, and `src/findings/judgments.ts`;
- the selected Project reference and the Run-date window;
- the ordered cohort, which is the first at most 20 consecutive real unresolved Findings in that window that have a stored assessment; and
- the cohort selection timestamp and the operator.

Do not replace a skipped, unavailable, pending, stale, or disagreeing Finding. Do not mix Projects, windows, policy versions, or candidate SHAs in one scored file.

Before requesting advice, a human reviews and approves the exact non-private excerpts through `perquiro investigate-sharing`. Freeze those excerpts with the packet before either Jev or the independent reviewer produces labels. Approval permits disclosure and must not encode the human labels. Missing approval stays an unavailable cohort record. The independent reviewer sees the same approved excerpts and recorded gaps; do not compare a label based on fuller private captures with advice based on excerpts.

Call Jev once for each Finding and assessment revision selected by the frozen cohort. A durable attempt is reused for unchanged model input. Never re-sample to obtain a preferred result. Retain `pending`, `unavailable`, and `stale` records in the sample file. They are provider and workflow outcomes, not missing rows.

An unavailable, partial, or stale record may be scored only against the exact frozen packet identified by its `inputFingerprint`. If the source changed and that retained packet cannot be reviewed, retain the record with `comparable: false` and a reason. Do not compare a human label from a newer assessment. Non-comparable records remain in status and provider accounting, but do not enter agreement measures.

## Blinded human labels

An independent reviewer labels each frozen Finding before seeing Jev's recommendation, probabilities, effective outcome, or an eventual Investigate Decision. The Jev input omits that Decision. The reviewer records a rationale, one existing human layer (`product`, `expected_behavior`, `test`, `run_conditions`, or `dismiss`) or `unresolved`, and one answer for each question:

- `behavior`: supported, contradicted, or insufficient evidence;
- `encoding`: supported, contradicted, or insufficient evidence;
- `conditions`: supported, contradicted, or insufficient evidence; and
- `recommendation`: supported, contradicted, or insufficient evidence.

The stored `capturedBeforeHumanDecision` and `blindedHumanReview` attestations are required. They are not proof of lineage or blinding. Retain the independent review material and freeze record with the private real-Run packet.

## Sample file

The analyzer accepts one JSON array. Each entry has this shape:

```json
{
  "caseId": "unique-cohort-id",
  "source": "real_run",
  "sourceReference": "retained-private-reference",
  "capturedBeforeHumanDecision": true,
  "blindedHumanReview": true,
  "record": "FindingJudgment object",
  "human": {
    "reviewer": "independent reviewer",
    "at": "ISO-8601 timestamp",
    "rationale": "why this label follows from retained records",
    "comparable": true,
    "frozenInputFingerprint": "the record inputFingerprint",
    "layer": "product",
    "judgments": {
      "behavior": "supported",
      "encoding": "insufficient_evidence",
      "conditions": "insufficient_evidence",
      "recommendation": "supported"
    }
  }
}
```

`record` must pass the shared `findingJudgmentSchema`. The analyzer rejects duplicate case IDs, duplicate Finding IDs, non-real sources, a cohort over 20, missing attestations, and a different policy. It does not access a Project or the network.

For a retained but non-comparable record, replace `frozenInputFingerprint` with `"comparable": false` and a non-empty `nonComparableReason`. The analyzer rejects a comparable label whose fingerprint differs from `record.inputFingerprint`.

Run it with:

```powershell
node --import tsx evals/curated/jev-investigate-trial-2026-09-19/analyze.mjs <samples.json>
```

## Measures

For each question, report agreement between the human label and both the Jev model choice and Perquiro's effective outcome. Include per-case disagreement examples with all three outcomes and the confidently-wrong flag. Count insufficient-evidence answers separately for model choice, effective outcome, and human label. A confidently wrong judgment has selected probability at least 0.90 and a model choice that conflicts with the human label.

For recommendation, report those agreements by human layer. When both the human and effective recommendation judgment are supported, compare the Agent's recommended layer with the human layer. `unresolved` never counts as an agreed layer.

Report all record statuses, provider attempt outcomes, unavailable provider failures, token counters, and the sum of provider-attempt latency. Null usage remains unknown, never zero. The latency sum is not end-to-end Investigate time. Report the cohort size, disagreement examples, unavailable and stale records, and sample limits. Do not treat this trial as a correctness target or publish a favorable result without those limits.
