# TypeSafe Explore ranking pre-trial

The supplied kit is useful for checking basic ranking behavior. It does not yet show that TypeSafe improves Explore, and its policy does not explicitly assess the user's main criterion: how much an action's failure prevents people using the Product.

On 2026-09-17, the first batch of 18 ranking requests returned HTTP 503 throughout. After diagnostic calls succeeded, a separately recorded, fixed follow-up batch answered all 18 requests successfully. It met the expected behavior in all six semantic situations across the original order and shuffle seeds 7 and 29. The two host-controlled situations also behaved correctly in all three orders. Both ordinary planning agents independently chose the expected next step in all eight situations.

These were synthetic planning and API exercises. No BugBusters HR actions ran, no Perquiro Observations were saved, and no normal-versus-advised Explore execution comparison took place.

| Situation | Expected result | Ordinary planner A | Ordinary planner B | TypeSafe follow-up, all 3 orders |
|---|---|---|---|---|
| Finish cancellation Journey | c1: reload the outcome | c1 | c1 | c1 |
| Permissions objective | c1: inspect protected details | c1 | c1 | c1 |
| Search objective | c2: inspect prefix matching | c2 | c2 | c2 |
| Required recovery | c1: read-only recovery | c1 | c1 | Host selects c1, no API call |
| Explicit human priority | c2: holiday calendar | c2 | c2 | Host selects c2, no API call |
| Eight repetitive options | Decline the set | Declined | Declined | weak_candidates, no winner |
| Explore adds a useful option | c9: cancellation and readback | c9 | c9 | c9 |
| Actor/build change | c1: manager approval view | c1 | c1 | c1 |

The 18 successful calls represent six situations repeated three times, not 18 independent situations. The recovery and human-priority results are deterministic host behavior and earn no TypeSafe semantic credit. Both planning baselines were already at the ceiling on selected IDs. This kit cannot distinguish an improvement over those baselines.

Nine supplied contract checks passed. All eight exported request/question/host-decision files matched the runner's rebuilt values. Four added contract probes passed: blocked recovery keeps precedence over ordinary eligible work, human priority cannot restore eligibility, malformed distributions are rejected, and a mismatched model falls back. These use authored responses and say nothing about model accuracy.

The failure batch and follow-up are both retained. Across the two ranking batches, 18 calls failed and 18 succeeded. This small, temporally clustered sample is not an estimate of general service uptime. Model listing, a minimal yes/no question, a minimal Score question, one original question and the complete original first request subsequently succeeded. The cause of the earlier 503 responses remains unknown. The supplied runner did not preserve HTTP response bodies or request IDs for those failures.

Successful follow-up calls took a median 813.45 ms, ranging from 767.6 to 2,198.5 ms. They reported 38,184 input tokens and 2,760 output tokens. At the published input rate of $0.042 per million tokens, that batch's reported inference usage is approximately $0.00160. This excludes diagnostic calls, planning/review agents, integration overhead and any unreported usage on failed requests; it is not an invoice or total Explore cost. The endpoint, model pin and rate were checked against the official [API reference](https://docs.typesafe.ai/api) and [model documentation](https://docs.typesafe.ai/models).

Stable choices did not mean stable scores. In situation 7, c9's priority was 0.999 in the original order and 0.853 with seed 7. Its relevance confidence changed from 0.99 to 0.30. It still won because the alternatives were repetitive. With only these repetitions, order sensitivity cannot be separated from ordinary model variation. Closer tradeoffs need measurement before using fixed confidence or score thresholds.

The independent reviewer received anonymous sets together and agreed that the selections matched the evidence. It noted that planner A's proposed cancellation in situation 6 said to make an "authorized" action available, while planner B explicitly required an eligible check. I treat this as a useful wording improvement, not an observed authorization failure: no action ran and the prompt required host eligibility. Advice and new proposals must still be checked against current Perquiro controls at execution.

The reviewer also marked down the API's generic advisory note for lacking a situation-specific explanation. I do not use that mark to compare planner quality: the procedure permitted structured advice without prose, and the review projection omitted the full returned dimension distributions. REVIEW.md retains the criterion table and this disagreement.

The hidden grading criteria covered useful selection, host precedence, declining weak options, context/evidence discipline, and actionable advice. Planner A used gpt-5.6-sol/high; planner B used gpt-5.6-terra/high. The separate reviewer used gpt-5.5/high. Only GPT-family runners were available, so this was not cross-family judging. The eventual normal-versus-advised comparison must use the same Explore model and settings. Candidate inputs had neutral names and withheld expectations and ranking code. Outputs were read end to end, including all returned ranking dimensions and distributions. Workspace agent-transcripts were unavailable, so no transcript-verified claim is made about all tool reads. No unrelated conversations were inspected.

The main gaps before the HR comparison are concrete:

- Add explicit assessment of access-blocking impact and workflow dependencies. The current formula is 40% relevance and 60% information. A diagnostic with authored equal scores selects the holiday calendar before login by ID, despite supplied evidence that all private workflows depend on login. This proves a limitation of the combiner; it is not a measured Jev mistake. None of the eight bundled cases starts with an Employee choosing whether to log in.
- Add difficult tradeoffs: an unverified access dependency against a novel peripheral detail; already-established login against a useful unresolved employee workflow; and high-impact work constrained by recovery or a human override. Keep the existing cases as basic checks, and withhold the new expected answers from both execution arms.
- Retain response/request identifiers on validation and HTTP failures, add an overall advice deadline, and revalidate snapshot freshness and host controls before execution. Preserve ordinary Explore selection when advice is unavailable. The supplied socket timeout alone is not an overall deadline.

Recommendation: retain this kit as a regression fixture set and continue designing the impact policy. Do not adopt its current weights or the 1.5 weak-set threshold as Product policy based on this result. The next useful comparison is the agreed bounded BugBusters HR run: one Employee Actor starting signed out, equivalent isolated state, equal Product-request budgets, the same Explore model, and a frozen independent checklist grading executed actions supported by saved Observations. No outputs were grafted together into a fictional execution.

The source download was left unchanged. The copied source, hashes, frozen procedure and amendment, raw traces, diagnostics, anonymous review inputs, and summaries are retained beside this report. No API key was written to these artifacts.
