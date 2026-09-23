# HR12 review

## Judgment

HR12 is seen but only partially saved. The initial grade remains unchanged as requested.

The complete check requires the employee to read back the submitted request in request history and to record the displayed request details. Events 84 and 85 establish that Emily submitted id 3 with dates 2026-09-15 through 2026-09-16. Event 88 then shows the request-history row after that submission. Its displayed date cell is `Sep 15, 2026 – Sep 15, 2026`, alongside `2`, `Vacation`, `pending`, and `—` for the manager comment.

Observation `96c5a690-72b9-4b3c-b775-55513c1af905` is the only final public Observation that records the rendered request-history row. It saves the new request as pending Vacation for 2 days with no manager comment, but omits the displayed date range. That omission is material because dates are part of the row's displayed request details, and the rendered date range differs from the dates submitted and returned by the API.

No other final public Observation fills that gap. Observations `9403441f-d3a5-42e9-b620-d182c4289a7a`, `9a7bd9e8-35ae-4502-80b4-b5e588881bfe`, and `2ddb19fd-9adb-4512-9870-a4a1c80a6c71` preserve the submission or API dates, not the dates displayed in request history. Observation `56761e47-744e-47a9-95dc-aed42258f379` records only the leave balance and the rule text from `/leave`.

This is a missing saved fact, not an unsupported claim. Observation `96c5a690-72b9-4b3c-b775-55513c1af905` makes no false date claim, and the candidate did not need to identify the display discrepancy for the trace to earn seen credit.

## Resulting support treatment

- `seen`: true, with complete support `[84, 85, 88]`.
- `saved`: false. The final public Knowledge has no Observation that preserves the full displayed history details, so `savedSupportSets` must be empty.
- `directlyJourneyLinked`: false, as before.
