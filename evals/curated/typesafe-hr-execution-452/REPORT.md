# Live HR comparison: ordinary and advised Explore (#452)

The frozen second trial is **inconclusive**. Ordinary Explore did not complete an Employee workflow beyond login in any pair, so the quality criterion never applied. Advised Explore was slower in every pair. Complete API-equivalent cost remains unknown.

Do not expand TypeSafe Choice on this evidence. The recommendation is to **change** the trial setup before any further comparison: the pre-launch ordinary rehearsal did complete Request leave with history readback, but none of the eight scored runs submitted leave. Date selection failed again as in #348. Fix that interaction (or freeze a different quality floor with new rationale) before spending another scored round. This report makes no production, Test Manager or broader TypeSafe change.

## Record and controls

This records the evaluation for [issue 452](https://github.com/Perquiro/Perquiro/issues/452) under the frozen [protocol 452](../typesafe-hr-protocol-452/PROTOCOL.md), which copies revision 3 controls and adds a human grader plus #450 overhead journals. All eight scheduled executions completed serially without replacement. Total candidate elapsed time was 2208.220 seconds.

Each used gpt-5.6-terra/low, standard service tier (native host value `default`), Codex 0.149.0, Chromium 151.0.7922.34, and Perquiro at `dddad8ab2f250bb9f9ac45b591c38a5cd4aa6bbe`. BugBusters stayed at `868e83d2c50f8135c5bff46db086ee4037c90ef3` with Product/browser Date fixed at 2026-09-17T12:00:00.000Z. Every run had a fresh server, browser context and empty Project. Real monotonic time governed the 30-minute budget and two-minute recording grace.

Before launch freeze, ordinary Explore rehearsal `rehearsal-ordinary-1` completed Request leave (POST Vacation 2026-10-05–2026-10-06) with saved history readback. The quality floor decision is `workflow_floor_met` (see PREPARATION.md). Scored runs did not reproduce that leave submission.

The launch hash is `e0d2b90e8d3f567e4ce1b054c964bc6cae8cc0289888324fb425402d49102296`. Graders A and B are gpt-5.6-terra model graders (same family). Grader H is human. Each run carried a UUID `executionId` for #450 `advise_explore` / `report_explore_advice_use` journals; all eight wrote journals.

## Quality

O means ordinary and A means advised. Credited checklist actions require executed support and saved Observations. No run completed a non-access Employee workflow.

| Pair | O actions | A actions | A minus O | O workflows | A workflows | Quality gate |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | 1 | 1 | 0 | 0 | 0 | Inconclusive: ordinary workflow minimum unmet |
| 2 | 1 | 1 | 0 | 0 | 0 | Inconclusive: ordinary workflow minimum unmet |
| 3 | 2 | 2 | 0 | 0 | 0 | Inconclusive: ordinary workflow minimum unmet |
| 4 | 2 | 1 | -1 | 0 | 0 | Inconclusive: ordinary workflow minimum unmet |

Paired action differences have mean −0.25, median 0 and range −1 to 0. Login was credited in every run. Directory-search was credited in pair-3 both arms and pair-4 ordinary (and the corresponding anonymous samples) when a nonempty name search and saved result existed. Leave submit/readback, logout, timesheet and profile items are zero everywhere in the scored set. Blank-date leave validation was observed repeatedly; no scored run issued `POST /api/leave`.

## Timing and cost

| Run | Status | Total (s) | Product requests | Advice journal |
| --- | --- | ---: | ---: | --- |
| 1O | completed | 212.624 | 9 | present |
| 1A | completed | 223.573 | 6 | present |
| 2A | completed | 242.461 | 7 | present |
| 2O | completed | 241.155 | 10 | present |
| 3A | completed | 401.175 | 12 | present |
| 3O | completed | 245.335 | 11 | present |
| 4O | completed | 288.067 | 15 | present |
| 4A | completed | 353.830 | 7 | present |

| Measure | Mean | Median | Range |
| --- | ---: | ---: | --- |
| Ordinary total (s) | 246.795 | 243.245 | 212.624–288.067 |
| Advised total (s) | 305.260 | 298.146 | 223.573–401.175 |
| Paired total difference A−O (s) | 58.464 | 38.356 | 1.307–155.839 |

Advised total time was higher in every pair. Mean advised elapsed was about 23.7% higher. Selection-phase durations from #450 journals are retained in the packet; missing host cost fields stay unknown, never zero.

| Run | Known component subtotal, USD | Complete API-equivalent cost | Actual charges |
| --- | ---: | --- | --- |
| 1O | 0.449369 | Unknown | Unknown |
| 1A | 0.485312 | Unknown | Unknown |
| 2A | 0.523533 | Unknown | Unknown |
| 2O | 0.484553 | Unknown | Unknown |
| 3A | 0.965251 | Unknown | Unknown |
| 3O | 0.471249 | Unknown | Unknown |
| 4O | 0.541398 | Unknown | Unknown |
| 4A | 0.720002 | Unknown | Unknown |

## Recommendation

Advised Explore did **not** match ordinary quality at lower total latency and cost. Quality is inconclusive because ordinary never cleared the workflow floor in scored pairs. Latency favored ordinary. Complete cost is unknown.

**Change** before any expansion: do not fund another identical scored comparison until ordinary Explore can reliably submit and read back leave (or another frozen Employee workflow) under scored conditions, not only in rehearsal. Stopping further advice trials on this fixture is also consistent with this packet. Expanding TypeSafe Choice is not justified here.

## Evidence

Machine report, grades, journals and raw traces live in [Perquiro/evals-evidence](https://github.com/Perquiro/evals-evidence) under `evals/curated/typesafe-hr-execution-452/`. Short reports and `CURATION.json` stay in this repository. Preparation retains the successful leave rehearsal and failed timeout attempts. Independent result review approved packet `0dd9d3c1…` and report `205f720e…`.
