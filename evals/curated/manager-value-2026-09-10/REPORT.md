# Manager-value pilot: early review

The manager setup has not demonstrated enough value to justify making it the default. In the eight completed runs, it preserved more complete checks than Terra alone, but substantially fewer than Astra alone with the same stop-reviewer. Astra solo is the leading configuration in this sample. This is an assessment of the current setup on BugBusters HR, not a general conclusion about manager agents.

You requested wrap-up after eight of twenty planned runs had finished. Both complete blocks are included: two runs per configuration. C3 was interrupted after 16.0 minutes; its 25 saved Observations, trace and partial Knowledge are preserved, and Create was not started. Eleven trials never started. The batch is stopped and will not automatically resume. C3 is reported as interrupted and has no comparison score; unstarted trials are not zeros.

| Configuration | Saved checks by minute 40, each run | Mean /27 | Mean final saved, including recording grace | Grounded/proposed Scenarios, total |
|---|---:|---:|---:|---:|
| A: Terra/low solo | 3, 2 | 2.5 | 2.5 | 4/4 |
| B: Terra/low solo + stop-reviewer | 2, 3 | 2.5 | 2.5 | 2/2 |
| C: Astra/high manager + Terra/low explorers | 1, 7 | 4.0 | 4.0 | 3/3 |
| D: Astra/high solo + stop-reviewer | 11, 12 | 11.5 | 12.5 | 6/7 |

The primary measure is a complete check whose required Actor, action and observed result were preserved in public Knowledge by minute forty. Surface-only Knowledge earns full credit. It is not the number of Observations, Journeys, Scenarios or bugs. Grounded Scenarios can express useful partial behaviors that do not complete an entire inventory check, so their count need not track the primary score.

Every run used the frozen state-aware-v2 skill, the same seeded Product build and three preauthenticated Actors. All had forty minutes and forty application requests, with five extra minutes solely to record already observed facts. C used an Astra/high manager with sequential fresh Terra/low workers; one worker owned the Product at a time. B and D used the stop-reviewer in its nondelegating mode. A used Explore alone. Every completed Explore received an identical clean Terra/low Create follow-up, with twenty minutes and no Product access or Knowledge repair.

The completed-block differences C minus B were -1 and +4 saved checks, a descriptive mean of +1.5. C minus D was -10 and -5, a mean of -7.5. C minus A was -2 and +5. C's mean of 4 is 60% above B's 2.5 and about 65% below D's 11.5. With two runs per arm, each mean is also the median; the individual values above give the full range.

The frozen success criterion was at least 20% more mean saved coverage than both B and D, without a higher unsupported-material-claim rate. The completed sample does not meet its numerical coverage condition against D. The planned five-block analysis is incomplete, so this is not a completed threshold test, a significance claim or proof of inferiority. No bootstrap interval is reported from these two blocks. Stopping after seeing results also limits inference.

The strongest positive evidence for a manager is C2. Five sequential workers completed and handed off an employee leave request, date-preview checks, a manager decision and an employee readback. It saved seven complete checks, five with complete direct Journey support, and Create proposed three grounded Scenarios. This shows that the manager can coordinate a useful dependency across Actors. It does not show that the extra agent is necessary: D2 saved twelve checks by minute forty under the same allowance.

All four Terra solo runs stopped after roughly ten to seventeen minutes with most requests unused and no Product mutations. Their summaries imposed a read-only or state-preserving boundary even though the launch contract authorized ordinary UI operations on disposable synthetic data. Adding the stop-reviewer in B did not improve the mean over A. The immediate Terra problem is continuing into authorized workflow checks. The data does not identify which wording caused the scope interpretation, or prove that a prompt change would fix it.

Both completed manager runs encountered automatic approval refusals. C1's second worker was twice refused access to its own handoff files and the manager stopped early. C2's final fresh employee navigation was refused because the action payload was considered opaque and potentially outside that worker's readback scope. Its old employee UI was still readable, but did not establish a fresh server result. These are retained operational outcomes of the evaluated setup, not Product defects. They prevent a clean estimate of manager planning quality without approval friction. Removing C1 from the average would be selective; even the stronger C2 did not exceed D2.

Saving complete evidence is a separate weakness. Raw snapshots captured immediate pending approval queues and loading selectors that some candidates did not preserve in Knowledge. Those facts count as seen, but not saved. Large Observation counts can contain many faithful API or control copies while still omitting one required state. D2 saved 171 Observations but completed only thirteen saved inventory checks after grace. The stricter grade measures completeness of the required check, not whether the record volume was large.

Journey count is also a poor success measure. C1 and A2 had useful saved Surface facts, but no directly Journey-linked Observations eligible for the frozen Create rule, so Create proposed no Scenarios. That is a conversion constraint in this frozen pipeline. It does not mean those facts lack test value or that each should become a Journey. Changes to Journey/Scenario eligibility in the current repository were outside this experiment.

| Run | Saved at 10m | Saved at 20m | Saved at 40m | Final seen/saved | Final directly linked checks | Grounded/proposed Scenarios | Explore minutes incl. grace | Requests |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| A1 | 3 | 3 | 3 | 5/3 | 1 | 4/4 | 11.7 | 5 |
| A2 | 2 | 2 | 2 | 2/2 | 0 | 0/0 | 9.7 | 7 |
| B1 | 2 | 2 | 2 | 3/2 | 1 | 1/1 | 11.2 | 6 |
| B2 | 1 | 3 | 3 | 4/3 | 1 | 1/1 | 17.0 | 4 |
| C1 | 1 | 1 | 1 | 2/1 | 0 | 0/0 | 17.0 | 3 |
| C2 | 0 | 5 | 7 | 8/7 | 5 | 3/3 | 42.4 | 15 |
| D1 | 4 | 7 | 11 | 14/12 | 5 | 5/5 | 42.7 | 30 |
| D2 | 4 | 6 | 12 | 16/13 | 5 | 1/2 | 43.9 | 39 |

All eight final Knowledge grades contain zero identified unsupported material claims. This does not certify perfect accuracy or complete exploration. D2's onboarding Scenario says the directory shows selected equipment; saved API records contain it, but the browser row and detail do not display it. Under the literal browser-visible reading, only one of D2's two proposals is fully grounded. An API-record reading would make both grounded and raise D's total from six to seven. Neither interpretation changes its primary coverage score. The timesheet proposal is grounded even though the inventory's separate actual post-submission edit attempt was not performed.

Each packet received two fresh independent reviews without arm labels, model settings or candidate summaries. Original grades and subsequent boundary reviews are retained, followed by root adjudication against the actual trace and final public Knowledge. Mechanical validation checks references and timing; it cannot replace semantic review. Some masking had removed real Product and browser-target role fields; separately hashed exports restored those exact fields without changing the original packets. Reviewers could still infer style or workflow from artifacts, and root adjudication was not blind.

| Run | Initial review saved at 40m | Independent review saved at 40m | Adjudicated saved at 40m |
|---|---:|---:|---:|
| C1 | 2 | 2 | 1 |
| D1 | 12 | 12 | 11 |
| A1 | 4 | 4 | 3 |
| B1 | 2 | 2 | 2 |
| B2 | 3 | 3 | 3 |
| C2 | 8 | 7 | 7 |
| A2 | 2 | 1 | 2 |
| D2 | 13 | 14 | 12 |

Corrections mainly concerned missing transient states, complete navigation across Actors, actual displayed history dates, and complete draft-versus-submitted readback. Original reviewer judgments are not silently replaced. The two original grading sets also put D's mean saved coverage above C's; the leading-configuration observation therefore does not depend on the final disputed boundary decisions. Full per-check changes are in grading-sensitivity.json and each packet's adjudication.md.

| Configuration | Mean Explore minutes incl. grace | Mean Product requests | Mean MCP calls |
|---|---:|---:|---:|
| A | 10.7 | 6.0 | 107.0 |
| B | 14.1 | 5.0 | 73.0 |
| C | 29.7 | 9.0 | 170.5 |
| D | 43.3 | 34.5 | 237.5 |

These are actual consumed resources, not a matched-consumption comparison. All arms had equal allowances, but many candidates stopped early. C2 made 281 MCP calls for seven saved checks; D2 made 285 for twelve by minute forty. That suggests coordination and recording work deserves attention, but does not isolate handoff overhead: call counts include startup, catalog reads, inspections and writes. Manager workers were sequential, so this experiment did not test parallel speedup.

The following provider session counters cover the two completed runs in each arm. Create counters are separate. Cached input is a subset of input; reasoning output, retained in early-review-data.json, is a subset of output. Do not add subsets or treat repeated cached context as unique content. Interrupted C3 usage is retained separately in report-data.json. Evaluator preparation and grading usage are outside candidate counters. Billing cost is unknown, so no cost-normalized claim is supported.

| Arm | Stage | Model/effort | Agent sessions | Input tokens | Cached input tokens | Output tokens |
|---|---|---|---:|---:|---:|---:|
| A | explore | gpt-5.6-terra/low | 2 | 7,915,656 | 7,659,776 | 32,753 |
| A | create | gpt-5.6-terra/low | 2 | 1,584,948 | 1,479,680 | 8,563 |
| B | explore | gpt-5.6-terra/low | 2 | 10,677,117 | 10,385,152 | 41,393 |
| B | create | gpt-5.6-terra/low | 2 | 1,243,269 | 1,115,136 | 7,863 |
| C | explore | gpt-6-astra/high | 2 | 8,045,469 | 7,757,312 | 29,464 |
| C | explore | gpt-5.6-terra/low | 7 | 11,915,157 | 11,479,552 | 62,619 |
| C | create | gpt-5.6-terra/low | 2 | 880,014 | 800,768 | 8,556 |
| D | explore | gpt-6-astra/high | 2 | 31,492,062 | 30,960,640 | 74,066 |
| D | create | gpt-5.6-terra/low | 2 | 2,485,980 | 2,290,688 | 15,788 |

My recommendation is to use Astra solo as the reference configuration for the next decision and keep the manager experimental. First address Terra's self-imposed read-only stops and reliable preservation of complete observed outcomes. A narrower future manager test should target a concrete responsibility: selecting the next uncovered risk, coordinating required state across Actors, or validating a stop decision. Success should remain additional complete saved checks under a matched allowance, followed by grounded Scenario yield. That proposed work has not been run or implemented here.

This pilot covers one Product and only two completed blocks. Model capability, worker context resets, delegation and approval exposure change together; C versus D does not isolate a pure manager effect with identical executors. It supplies useful evidence about these deployable configurations, but does not establish general manager value or a bug-discovery rate.

Wrap-up verification passed: all 288 frozen input/runtime hashes and 27 original BugBusters source hashes match; the original Perquiro Project catalog is exactly unchanged, including revision 8ffaf74c-f29a-4f58-9ce0-a8e8fc8a919f. All eight completed runs used the requested models, kept Explore Knowledge unchanged during Create, proposed only Scenarios and created no Tests. Interrupted C3's saved Observations are preserved, its ownership was released, and its agent tree was terminated. All eighteen trial Product/control endpoints are closed. The candidate driver and recorded owned server/Product/Explore process IDs were absent at the final process check. Unrelated repository changes were left in place.

The reproducible record is in PROTOCOL.md, SCORING.md, inventory.json, report-data.json, early-review-data.json, grading-sensitivity.json, artifact-verification.json, wrap-up-verification.json, OPERATIONAL-NOTES.md and review-packets/. The original full-batch analysis remains marked incomplete. This early review is a separate descriptive report requested at shutdown.
