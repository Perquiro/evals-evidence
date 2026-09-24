# Live HR comparison: ordinary and advised Explore

The frozen pilot is **inconclusive**, with a known quality failure and no measured latency reduction. Pair two lost two checklist actions and its completed leave workflow in the advised condition. Ordinary Explore also failed the minimum workflow requirement in pairs one, three and four. Complete API-equivalent cost and actual charges remain unknown.

Do not use this pilot to justify expanding TypeSafe Choice or making a savings claim. The next decision should be whether to fund a separate, newly frozen trial after ordinary Explore can reliably complete and verify an Employee workflow and the host can expose complete cost accounting. This report makes no production, Test Manager or broader TypeSafe change.

## Record and controls

This records the evaluation for [issue 452](https://github.com/Perquiro/Perquiro/issues/348) under [Spec 344](https://github.com/Perquiro/Perquiro/issues/344) and the unchanged [revision 3 protocol](../typesafe-hr-protocol-452/PROTOCOL.md). All eight scheduled executions completed serially without replacement, manual coaching or a scored rerun. Total candidate elapsed time was 3534.110 seconds.

Each used gpt-5.6-terra/low, standard service tier (native host value `default`), default temperature/context policy, disabled fallback/delegation, Codex 0.149.0, Chromium 151.0.7922.34, and the same Perquiro build at `8f6255ac23854a578b35490ae00b5fc2096183f2`. BugBusters was pinned to `868e83d2c50f8135c5bff46db086ee4037c90ef3`, with Product/browser Date fixed at 2026-09-17T12:00:00.000Z and UTC. Every run had a fresh server, browser context and empty Project with the same Employee, starting signed out. Real monotonic time governed the 30-minute execution budget and at most two-minute recording grace; each run admitted between 8 and 15 of its 60 permitted Product API requests.

The [launch](evidence/launch.json), [control/normalizer audit](evidence/normalizer-review.json), [native-counter audit](evidence/native-counter-audit.json), and each run's `controls.json` retain settings, source/build/seed hashes, prompt/tool bytes, isolation, reset, budget and close evidence. The launch hash is `b7b3c6e4383d137e0cb08f592e7e3d6d5565192ff3b9c43f13970d27df658885`. Candidates could use only the supplied browser, public Perquiro tools and two instruction files. The checklist, Product source, evaluator and prior results remained withheld.

## Quality

O means ordinary and A means advised. An action is credited only when the full frozen item has executed and saved support. Workflow completion is the checklist milestone summary, not proof that a stored Journey was completed.

| Pair | O actions | A actions | A minus O | O workflows | A workflows | Quality gate |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | 1 | 1 | 0 | 0 | 0 | Inconclusive: ordinary workflow minimum unmet |
| 2 | 3 | 1 | -2 | 1 | 0 | Failed: two-action deficit and lost workflow |
| 3 | 1 | 1 | 0 | 0 | 0 | Inconclusive: ordinary workflow minimum unmet |
| 4 | 2 | 2 | 0 | 0 | 0 | Inconclusive: ordinary workflow minimum unmet |

Paired action differences have mean −0.5, median 0 and range −2 to 0. Both conditions retained login credit in every pair. Final adjudication records zero unsupported material completion/result claims in each run; the two disputed planned-action markers remain visible in both original grades and reconciliation.

| Run | Credited items | Distinct behavior units |
| --- | --- | ---: |
| 1O | login | 4 |
| 1A | login | 2 |
| 2A | login | 2 |
| 2O | login, leave-submit, leave-readback | 2 |
| 3A | login | 3 |
| 3O | login | 3 |
| 4O | login, directory-search | 4 |
| 4A | login, directory-search | 4 |

Only 2O completed a non-access workflow: Request leave. Its one successful POST created a pending two-day Vacation request, navigation to history triggered a separate GET, and the settled row and submitted values were saved. The history displayed September 29 as both endpoints while the request used September 29–30. This observed discrepancy does not remove exercise credit. Other runs did not complete any checklist workflow. Every run lacks logout/private-page revisit; the two directory searches lack detail reload/direct load; draft saves lack reload; submitted weeks lack later edit attempts; no profile save/readback was exercised. Blank-date validation is not an end-before-start test, and Monday-only hours are not a seven-day total test.

[Machine report](evidence/report.json), [all final item decisions](evidence/grades/adjudication.json), and the [raw packet and manifest](evidence/packet.json) retain every accepted item, all zero-credit reasons, supporting IDs, behavior summaries, Journey milestones and questions.

| Run | Learned behavior beyond authentication | Remaining questions |
| --- | --- | --- |
| 1O | Submitting while both leave dates were empty showed required-fields validation and stayed on the form. Saving a draft with Monday set to one recorded total 1 h and displayed Draft saved. Clicking Start date opened an in-page September 2026 calendar. | Does the saved one-hour draft retain its value after a reload? Can the in-page calendar be used to select dates and submit a valid leave request? |
| 1A | A leave submission with blank dates displayed the required-fields message and remained on the new-request page. | Can an entered leave date be retained and submitted through the available date control? |
| 2A | A Personal leave submission with empty date fields showed the required-fields message and did not create a request. | Can a Personal leave request be submitted after dates are selected through the page's date control? |
| 2O | A September 29–30 Vacation submission produced a pending two-day request, while history displayed September 29 as both endpoints. | Why did history render September 29 as both endpoints when the saved submission result contained September 30 as the end date? Does a fresh history reload retain the displayed end-date discrepancy? Why did available balance fall from 18 to 16 while the new request was still pending? |
| 3A | Submitting a leave form with both required dates empty showed a required-fields message and stayed on the form. Saving a one-hour Monday timesheet draft displayed Draft saved and total 1 h. | Does the saved one-hour draft retain its value after a reload? Can dates selected through the in-page calendar produce a valid leave request and history readback? |
| 3O | Submitting a zero-hour week succeeded, marked it submitted, and disabled inputs and submit controls. Submitting a leave form with empty required dates showed required-fields validation and stayed on the form. | What happens if an edit is attempted after this submitted week? |
| 4O | A search for Emily Dawson settled to one Engineering Software Engineer row. Saving an eight-hour Monday draft displayed Draft saved with total 8 h. Submitting the blank leave form displayed required-fields validation and stayed on New leave request. | Does the saved eight-hour draft persist after a reload? Can a date selected through the picker be submitted and read back? |
| 4A | A search for Emily settled to the single Emily Dawson directory row. Submitting the saved eight-hour week marked it submitted and disabled the hourly inputs and controls. Saving the Monday-eight-hour draft displayed Draft saved and retained total 8 h in the immediate result. | What happens if an edit is attempted after this submitted week? Do the saved draft hours persist after a reload? |

Behavior counts group executed action/result units and deduplicate them by meaning. Visible-control inventory remains in the Observations and is not counted as a tested operation. These secondary summaries cannot compensate for missing checklist actions.

## Timing

All times below are seconds. Total includes startup, model work, candidate generation, advice, fallback, browser interaction, recording and finalization through host close. The post-close capture drain is excluded.

| Run | Status | Total | Selection phases | Product requests | Saved Observations |
| --- | --- | ---: | ---: | ---: | ---: |
| 1O | completed | 390.512 | 0.007 | 11 | 15 |
| 1A | completed | 509.662 | 17.540 | 8 | 19 |
| 2A | completed | 432.999 | 7.352 | 9 | 11 |
| 2O | completed | 474.332 | 5.249 | 12 | 15 |
| 3A | completed | 463.221 | 58.788 | 8 | 12 |
| 3O | completed | 334.168 | 0.002 | 15 | 13 |
| 4O | completed | 345.798 | 4.806 | 11 | 16 |
| 4A | completed | 583.419 | 16.413 | 12 | 14 |

| Measure | Mean | Median | Range |
| --- | ---: | ---: | --- |
| Ordinary total | 386.202 | 368.155 | 334.168–474.332 |
| Advised total | 497.325 | 486.442 | 432.999–583.419 |
| Ordinary selection | 2.516 | 2.406 | 0.002–5.249 |
| Advised selection | 25.023 | 16.976 | 7.352–58.788 |
| Paired total difference (A minus O) | 111.123 | 124.102 | -41.333–237.620 |

Advised total time was higher in three pairs and lower in pair two. Mean total elapsed was 28.8% higher. This is a descriptive result for four pairs on one Product, not an estimate of intrinsic model speed.

| Pair | Total difference (A minus O) | Complete cost difference |
| --- | ---: | --- |
| 1 | 119.150 | Unknown |
| 2 | -41.333 | Unknown |
| 3 | 129.054 | Unknown |
| 4 | 237.620 | Unknown |

The full phase partition follows, including zero phases. Phase labels are coarse: browser/MCP operations switch automatically, candidate notes label some planning, and intervening model time goes to `other`. Host usage timestamps are aligned by the common close endpoint and assigned once by arrival phase. The control audit found 315 of 331 host usage deltas, including 7,332 of 7,711 reasoning-output tokens, in `other`. Therefore selection-phase time is not a reliable standalone measure of planning cost or total Explore time.

| Phase | 1O | 1A | 2A | 2O | 3A | 3O | 4O | 4A |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| startup | 10.494 | 8.378 | 7.582 | 7.009 | 10.872 | 7.045 | 7.739 | 4.354 |
| candidate_generation | 0.000 | 0.002 | 0.010 | 0.000 | 24.707 | 0.000 | 0.000 | 7.936 |
| ordinary_planning | 0.007 | 0.002 | 0.000 | 5.249 | 0.000 | 0.002 | 4.806 | 0.000 |
| advice | 0.000 | 5.928 | 3.415 | 0.000 | 6.198 | 0.000 | 0.000 | 8.457 |
| advice_handling | 0.000 | 11.607 | 3.926 | 0.000 | 23.740 | 0.000 | 0.000 | 0.018 |
| override | 0.000 | 0.002 | 0.002 | 0.000 | 0.000 | 0.000 | 0.000 | 0.002 |
| fallback | 0.000 | 0.000 | 0.000 | 0.000 | 4.143 | 0.000 | 0.000 | 0.000 |
| product_interaction | 17.966 | 11.546 | 11.579 | 22.550 | 11.655 | 13.373 | 16.939 | 17.274 |
| recording | 1.982 | 1.593 | 1.359 | 1.909 | 31.187 | 1.352 | 1.419 | 14.268 |
| other | 360.063 | 470.605 | 405.127 | 437.615 | 350.720 | 312.396 | 314.895 | 531.109 |

## Cost and available usage

The host exposes cumulative counters, not a complete transport-attempt ledger. Successive differences preserve the final native totals without double-counting duplicate updates. Missing attempts, non-token charges and actual billed charges remain unknown. The frozen evaluator therefore leaves total API-equivalent cost, paired cost differences, and their means/medians/ranges null. Known components below are lower bounds, never cheaper-total claims.

| Run | Known component subtotal, USD | Complete API-equivalent cost | Actual charges |
| --- | ---: | --- | --- |
| 1O | 0.524894 | Unknown | Unknown |
| 1A | 0.520119 | Unknown | Unknown |
| 2A | 0.429227 | Unknown | Unknown |
| 2O | 0.758451 | Unknown | Unknown |
| 3A | 0.559331 | Unknown | Unknown |
| 3O | 0.483916 | Unknown | Unknown |
| 4O | 0.511396 | Unknown | Unknown |
| 4A | 0.953514 | Unknown | Unknown |

The retained [rates](../typesafe-hr-protocol-452/rates.json) are the frozen API-equivalent assumptions, not invoices or reverified current prices. Subscription authentication does not imply zero cost. Native `failed_attempts` in the report counts non-`ok` normalized records, including unattributed usage; it is not a complete transport-failure count. Every captured error and retry remains in the original event stream.

| Run | Terra input | Cache-read subset | Cache-write subset | Output | Reasoning subset | TypeSafe input | TypeSafe output |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1O | 1435482 | 1358592 | 0 | 8283 | 1033 | Not used | Not used |
| 1A | 1223724 | 1153792 | 0 | 12405 | 973 | 15158 | 256 |
| 2A | 1073934 | 1020416 | 0 | 9812 | 741 | 8665 | 160 |
| 2O | 2044696 | 1920256 | 0 | 10460 | 1363 | Not used | Not used |
| 3A | 1453466 | 1373952 | 0 | 10405 | 712 | 15537 | 301 |
| 3O | 1328809 | 1257472 | 0 | 7479 | 615 | Not used | Not used |
| 4O | 1541455 | 1478912 | 0 | 7544 | 940 | Not used | Not used |
| 4A | 3165449 | 3077632 | 0 | 13438 | 1334 | 26142 | 435 |

Input includes its cache subsets; reasoning is included in output and is not priced twice. TypeSafe cache-read, cache-write and reasoning counters are unknown. Its equal frozen input rates make the known input total sufficient to price that component without pretending the classifications are known. Requested/effective models and the original usage events remain in the packet.

There were 28 captured live TypeSafe HTTP attempts: all returned 200, with 27 selected results and one no-selection result. A further local advice call in 3A was rejected for a malformed target before provider dispatch; its correction and fallback phase remain recorded. Three explicit overrides remain: 1A chose Timesheet ahead of Profile, 2A preferred the core leave submission to empty-field validation, and 4A abandoned an uncertain leave submission after date-control failures. Recommendations, actual browser actions and reasons are retained separately.

## Grading and limitations

Two fresh, isolated graders configured as gpt-5.6-terra/high received only shuffled anonymous actions, network results, saved Observation bodies and the frozen checklist. Both agreed on all 136 checklist decisions: 12 credits and 124 zeros. Grader A's original file is retained with one Observation-ID transcription error; its corrected file changes two occurrences of that ID and no decision. [Reconciliation](evidence/grades/reconciliation.json) retains all disagreements and the evaluator's evidence.

Grader B flagged two pre-action markers as unsupported claims. The original records identify both as `look: attempting` write-ahead markers, rather than completed actions; one also has an explicit correction acknowledging that its dates were absent. Adjudication grants neither marker credit and keeps zero unsupported completion/result claims in the final summary. The blind packets retained both bodies but omitted attempt-role/correction metadata. That omission and the wording ambiguity are limitations. Retaining B's two flags would add a claim-constraint failure in pair three; it cannot turn this pilot into a favorable result.

Both graders share a model family; agreement is not independent human validation. The separate [result review](evidence/independent-result-review.json) approved semantic support, all pairs, original records and the normalizer, bound to the exact packet/report hashes. The curated copy passed the frozen evaluator replay and review-binding check. Four pairs are a bounded pilot; checklist items are not independent replications, and the checklist is not exhaustive HR coverage. Date-picker/locator failures and early candidate stopping limited coverage despite substantial unused request/time budgets.

## Preparation and verification

[Preparation history](PREPARATION.md) retains failed probes as well as passing isolation, budget, timeout and public-MCP proofs. [Overhead accounting](evidence/overhead.json) has 27 host/provider usage records and a known component subtotal of USD 0.318690624. Its complete total, authoring/grading/reviewer usage and actual charges are unknown. These are separate from candidate results; earlier synthetic experiments remain byte-preserved and are not substitutes for this pilot.

The 22 focused tests pass. All 23 frozen files and 259 preserved historical files verify. The repository suite reported 1,618 passes, six failures and three skips in unchanged UI derivation tests; type checking passed. No production files or glossary terms changed. [README](README.md) gives the report verification commands; they require no live TypeSafe key. Original machine-local paths are retained as provenance. The user-level credential and private candidate Project state are excluded from the curated evidence.
