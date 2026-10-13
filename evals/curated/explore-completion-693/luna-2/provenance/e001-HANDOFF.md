# Handoff e001 — Emily.dawson

Product version observed: `Employee v0.1.0`.

## Completed and verified

- Surface `Dashboard` (`/dashboard`), Observation 1: Emily's landing page showed 18 days leave balance, zero pending leave requests, three notifications, and quick actions. Inventory includes Directory, My Leave, Timesheet, My Profile, Notifications, Request leave, and Fill timesheet.
- Opened Directory once (application request 1). Observations 2 and 3 correlate the Directory click with `/directory`. Source check is reached; Evidence `e8c44bc4-98c3-41b5-963e-378b8e87df8e` contains the settled state and links to both Observations.
- Surface `Employee directory` (`/directory`), Observation 4: 28 employees across three pages, initially name ascending; name search, department filter (All departments, Engineering, Sales, Marketing, Finance, HR), Previous/Next, and name/department/title/email columns.
- Search for Hannah Blake returned one employee row (HR, Head of People), page 1 of 1. Outcome Observation 5 and Evidence `cfebbb44-3bb6-47a8-b66b-f04b879239da` are verified against Search `9b5951e3-e761-41f8-9514-4b774b177b60`; gap is exercised, pending 0.

## Open checks

- Dashboard: My Leave `859b0cf8-9250-420b-9255-cfca4bd176d3`; Timesheet `0ebec67b-c0f8-406b-929b-51d94ca02307`; My Profile `7f06415e-2cd2-402c-b4f2-844336a5a2c8`; Notifications `40f29de5-0531-45eb-9c42-f12b21d6eb38`; Request leave `694d7790-832f-492a-8006-459428f3daa0`; Fill timesheet `32b7fcbe-660c-4a08-8e15-5fb3deee9796`.
- Directory: Department filter `8376343f-52d9-445b-bba1-d7090f923c60`; Next page `21081bca-f31a-4f4e-a59d-2c26abeff212`; Previous page `bcc4a05a-4496-49de-8e0b-c011ff2b359e`.
- These employee checks remain unexplored while the next execution focuses on the HR evaluation workflow under the prepared Head of People Actor. No mutation was made.

## Usage and stop reason

- Application requests: 2 of 40. One browser action failed in the local locator before dispatch; trace remained at 1 request, so it did not reach the Product.
- Elapsed time at handoff: about 162 seconds. No cap refusal or Product denial.
- Stop reason: sequential handoff to the prepared HR Actor; Emily's observed view did not expose an evaluation path.
