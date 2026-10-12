# BugBusters HR Explore trial summary

## Result

The isolated Explore trial examined the Employee directory and employee profile as Emily, HR Admin, and Manager, then Emily's leave request flow. No Product records were created, edited, approved, or rejected. No performance evaluation create/edit controls surfaced in either the Manager or HR Admin view of Emily's profile. The employee leave form was reached but no request was submitted.

Setup was valid. Product version labels observed: Employee v0.1.0, HR Admin v0.1.0, Manager v0.1.0. Synthetic test data only. Five sequential, fixed-Actor executions were released; there is no active execution.

## Recorded evidence

- E001 Emily: Dashboard and Employee directory. Directory showed 28 employees across three pages; searching “Hannah Blake” returned one HR Head of People row. See [E001 handoff](executions/e001/HANDOFF.md). Evidence: `e8c44bc4-98c3-41b5-963e-378b8e87df8e`, `cfebbb44-3bb6-47a8-b66b-f04b879239da`.
- E002 Hannah (HR Admin): Dashboard, empty Approvals table, onboarding step 1 form, directory and search. No hire data was entered. See [E002 handoff](executions/e002/HANDOFF.md). Evidence IDs are listed there.
- E003 Michael (Manager): Dashboard showed one approval waiting; Approvals exposed George Tanaka's Vacation request (Sep 24–26, 2026, three days) with Approve/Reject. It was left unchanged. Emily's profile had no evaluation controls. See [E003 handoff](executions/e003/HANDOFF.md); profile attempt `13cdbf26-d78c-4de6-bc91-14313ea1db74`, outcome `31d0100b-80f6-4eab-b046-1b34615beca4`, reached `fa2c30b7-f1a9-4625-b0e6-c0522302cd10`, Evidence `bae8a37d-43cb-4692-a17c-e2e67fd143d2`, `b5dfd857-ddb6-40f8-ae01-c32db93062ea`.
- E004 Hannah (HR Admin): same Emily profile had no evaluation controls. See [E004 handoff](executions/e004/HANDOFF.md), Observations 29–32; Evidence `8c05a94e-1da1-45c9-a170-4674a26e1d77`, `e194c7ed-f6af-43e2-bcd5-0e56daa38dab`.
- E005 Emily: My Leave showed 18 available days and one existing approved Vacation request, Aug 11–13, 2026 (three days). The New leave request form defaults to Vacation, requires start/end dates, and has a Reason field; it says weekends are not counted. The Start date picker opened on September 2026. See [E005 handoff](executions/e005/HANDOFF.md), Observations 33–40. Form inventory Evidence `47378b33-e7a4-4599-9a89-7d5b31165c3b`, `5c7d0e4e-fe09-4541-8be0-b7a6a6b105d1`.

## Open checks

- Start date picker (`23354dd9-0399-44d9-ba90-bb12c884da29`): supported by Observation `7dd1f76e-9b37-43ad-adbb-f3b21717fd8c`, pending in exact `read_explore` readback. The date-picker action response exceeded available output context; browser `snapshot` showed no capture paths and no importable path was returned. It has no linked Evidence, so the next UI action was not taken.
- Earlier open checks remain as listed in the execution handoffs: E001 Dashboard and Directory; E002 Dashboard, Directory and Onboarding; E003 Dashboard, Directory, Approvals and profile Back link; E004 profile Back link and Directory Department/Next/Previous. Each handoff gives the saved observation references and context. They were not resumed after the profile/leave workflow scope moved on.

## Allowance and approval record

`solo.mjs status` after release reports 12 of 40 application requests used, 28 remaining, 0 refused requests, and no active execution. Per-execution deltas are E001 2, E002 4, E003 4, E004 0, E005 2. E002's host release note says 6 used, but its start/end counters are 2 and 6; the delta is 4 and the host total of 12 confirms it. Elapsed time was about 18 minutes; no time or request cap was reached. No actual approval denial occurred.

All available required E005 captures were read back by their Evidence IDs and Observation links. Observation 40 is the one known exception, documented above. No `.perquiro` evidence files were inspected directly.
