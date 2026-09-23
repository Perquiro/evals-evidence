# HR comparison preparation and rehearsal

Historical first freeze. Use [revision 2](../typesafe-hr-protocol-347-v2/REPORT.md) for #348. Final delivery review found that this version treated unreported TypeSafe cache classifications as cost uncertainty even though every input class has the same frozen rate. Revision 2 corrects that rule and unknown-model handling. This directory's frozen inputs and controlled results remain unchanged; no live execution used it.

The protocol and 17-item Employee checklist are frozen for four ordinary/advised pairs. Each execution starts signed out, uses Terra with low effort, and receives 60 Product requests and 30 minutes plus two minutes for recording. No live BugBusters comparison ran for #347.

The [independent preparation review](REVIEW.md) resolved the quality criterion before freezing: at most one fewer credited action per pair, no loss of demonstrated login, no increase in unsupported claims and no reduction in completed Employee workflow summaries. Ordinary Explore must complete at least one workflow beyond access. These are pilot judgments, not values derived from the synthetic perfect scores.

The [controlled report](rehearsal/report.json) was produced through the executable report command. Its retained inputs cover:

| Controlled trace | Credited actions | Total elapsed | Selection time | Estimated API-equivalent cost |
|---|---:|---:|---:|---:|
| Ordinary success | 3 | 5.0 s | 0.5 s | $0.002890 |
| Advised success | 3 | 4.5 s | 1.5 s | $0.005822 |
| Override and fallback | 3 | 6.5 s | 2.2 s | Unknown; $0.008670 known subtotal |
| Absent evidence | 0 | 2.0 s | 0.5 s | Unknown |

These times and counters were authored to exercise reporting. They are not measurements of model or Product performance. The first pair shows why selection time, total time and cost must remain separate: the advised fixture preserves quality and is faster overall, while costing more. The fallback fixture retains an HTTP 503 attempt with unknown usage and all known fallback usage. The absent-evidence fixture earns no action or behavior credit from its recommendations. Actual charges are unknown in every fixture.

The reporter passes 22 focused tests, including changed-artifact rejection at the launch/report CLI, advice without execution, missing saved support, partial cache counters, known failed usage, unknown cost, workflow-loss rejection and full interval accounting. [Reproduction commands](REPRODUCE.md) verify the freeze and rerun the report without model calls. The independent reviewers separately checked fixture arithmetic and grading support. The fixed-date seed receipt repeats the expected Product seed hash while real timers remain active.

All 259 files in the original and harder pre-trials are retained byte for byte. The harder verifier replays all 120 decisions, with 96 model calls/turns and 24 deterministic host bypasses, and verifies usage against original events. The original verifier rechecks its source kit, rankings and both 18-call batches. Its original 503 failures remain. The ten harder cases retain both acceptable incomplete-purpose alternatives and the original Score method's recovery-phone readback mismatch.

Terra's rates and long-context/cache-write rules were checked against the [official model page](https://developers.openai.com/api/docs/models/gpt-5.6-terra) on 2026-09-17. TypeSafe's input rate remains the dated published-rate assumption from the same-day pre-trial; fresh documentation retrieval failed during preparation. [rates.json](rates.json) records both source status and formulas. These estimates are separate from subscription or invoice charges.

The procedure is ready for #348 once #345/#346 supply the integration and the evaluator records the common runtime, instructions, isolation and driver proofs in a pre-dispatch launch receipt. #347 does not prove live withholding, browser request gating, normalized live telemetry or semantic grading of real outcomes. Missing execution evidence or accounting must remain visible and makes the relevant comparison inconclusive. Four pairs on one Product are a descriptive pilot. Repeated synthetic option orders are not independent Products, and HTTP versus CLI timing cannot establish intrinsic model speed or end-to-end Explore savings.
