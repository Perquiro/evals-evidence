# HR12 independent completeness review

HR12 has complete seen support but only partial saved support. Its saved value should be `false` under the frozen complete-material-action/result rule.

The settled browser history at event 88 is the relevant displayed readback. For the new request, it renders `Sep 15, 2026 – Sep 15, 2026`, `2`, `Vacation`, `pending`, and `—`. Event 85 and the automatic API read at event 87 instead record the submitted resource as 2026-09-15 through 2026-09-16.

The final public Observation that establishes the displayed request-history readback is `96c5a690-72b9-4b3c-b775-55513c1af905`. It saves that the new pending Vacation request appears as two days with no manager comment, but omits its displayed date range. The date-bearing public records do not remedy that omission:

- `9406fefc-af9b-4b78-a990-bf5327ffc71e` records form values before submission.
- `9403441f-d3a5-42e9-b620-d182c4289a7a` and `2ddb19fd-9adb-4512-9870-a4a1c80a6c71` record the POST/API result.
- `9a7bd9e8-35ae-4502-80b4-b5e588881bfe` explicitly records an automatic `GET /api/leave` result, including the API range 2026-09-15 through 2026-09-16; it is not a saved assertion of the history's displayed range.

Dates are material displayed request details for this check. Combining the history Observation with the API-range Observation would replace the actual displayed result with a conflicting underlying resource value. The evaluator can see the discrepancy in events 85 and 88, but the candidate did not save the rendered range. This is missing saved coverage, not an unsupported claim and not a candidate-discovered defect.

Accordingly, the complete seen support set is `[85, 88]`; there is no complete saved support set. The result does not depend on a Journey link or on any further exploration.
