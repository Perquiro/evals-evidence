# Handoff e003 — michael.reed

Assignment: Explore the manager view for evaluation records. Product version: `Manager v0.1.0`.

## Completed and verified

- Dashboard (`/dashboard`), Observation 17: Michael's dashboard shows 22 days leave balance, zero pending leave requests, one approval waiting, and five notifications. Navigation includes Directory, My Leave, Timesheet and My Profile; quick actions include Request leave, Fill timesheet and Review approvals. Approvals navigation, Onboarding and Add new hire were explicitly absent in this role's dashboard.
- Review approvals: Observations 18-20 show `Review approvals` reached `/approvals`. The page showed George Tanaka's Vacation request for Sep 24-26, 2026 (3 days, Family visit), with Approve and Reject. The request remains unchanged. Captures: `75f14941-0266-4424-b05a-8741d0dc5ce4` (immediate) and `d4bcf3ef-6d01-40c9-8bc1-88f3108fa89a` (settled); read_explore confirmed both links.
- Directory (`/directory`), Observations 21-23: 28 employees across three pages; search, department filter, pagination, and name/department/title/email columns. The Directory route action is saved as reached with Evidence `f2fd750a-409f-44f2-96c4-6d64d4169d8e` and `e5279c26-2693-4cde-8b94-05de4babd804`.
- Search item `9b5951e3-e761-41f8-9514-4b774b177b60`, Observation 24: searching Emily Dawson returned one row. It is exercised with Evidence `c8713d83-8153-4a14-b133-af326833717c` and `eefe2c5c-89ca-4218-a0cc-4d814ae036b6`.
- Employee profile (`/employees/:id`): attempting Observation 25 (`13cdbf26-d78c-4de6-bc91-14313ea1db74`) preceded a single click on Emily's directory row. Outcome Observation 26 (`31d0100b-80f6-4eab-b046-1b34615beca4`) and destination Observation 27 (`fa2c30b7-f1a9-4625-b0e6-c0522302cd10`) are read back; the check is exercised/reached with the attempt retained. Evidence `bae8a37d-43cb-4692-a17c-e2e67fd143d2` and `b5dfd857-ddb6-40f8-ae01-c32db93062ea` link to both outcomes.
- Employee profile inventory, Observation 28: Emily's role, department, email, phone, manager Michael Reed and start date are shown. Create evaluation and Edit evaluation controls were inspected and absent. Back to directory is offered. Evidence links are present on the settled capture above.
- Journey `Review an employee profile` (`0b01e635-cc8d-4df7-b225-d87759f8da8f`) records Search Emily, select the row and review profile details.

## Open checks

- Dashboard: My Leave `859b0cf8-9250-420b-9255-cfca4bd176d3`; Timesheet `0ebec67b-c0f8-406b-929b-51d94ca02307`; My Profile `7f06415e-2cd2-402c-b4f2-844336a5a2c8`; Notifications `40f29de5-0531-45eb-9c42-f12b21d6eb38`; Request leave `694d7790-832f-492a-8006-459428f3daa0`; Fill timesheet `32b7fcbe-660c-4a08-8e15-5fb3deee9796`; Review approvals `3ad83ae9-01b8-40d5-b60e-f442963787b7` reached; Directory `0f2f714b-2627-4aa1-a46b-aa56027b7fcf` reached. Three role-absent items are accounted as absent.
- Directory: Department filter `8376343f-52d9-445b-bba1-d7090f923c60`; Next page `21081bca-f31a-4f4e-a59d-2c26abeff212`; Previous page `bcc4a05a-4496-49de-8e0b-c011ff2b359e`; Search and Open employee row are exercised.
- Approvals: Approve `9b27eb02-5fd1-4206-a390-dbd7d437ada9` and Reject `af46629c-7231-4dfc-b962-f02c143d90ce` remain pending because they would alter an unrelated leave request.
- Employee profile: Back to directory `36a2ec79-b23b-4af2-be62-aba377d8c010` remains pending. Evaluation Create and Edit are absent in this Manager context.

## Usage and stop reason

- Browser requests: 4 in this execution; 12 total across the trial. No cap refusals or Product denials. No Product mutation was made. The pending leave decision was intentionally not changed.
- Stop reason: sequential handoff to Hannah's HR Admin context to inspect the same employee profile for role-specific evaluation controls.
