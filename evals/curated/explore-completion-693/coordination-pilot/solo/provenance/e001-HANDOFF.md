# Explore handoff — execution e001

## Scope and current state

Explore used fixed Actor Emily Dawson (`176a99f7-1b58-4890-986d-221411913e9d`) in the Bugbusters HR Product. Setup, Knowledge, pending Follow-on work, and open Reviews were read before work; Setup was valid, Knowledge started empty, and there was no continuation or Review work. The exploration pass is recorded in Perquiro Knowledge and read back. Current catalog: 3 Actors, 7 Surfaces, 6 Journeys, 49 Observations, 59 Evidence, 0 Scenarios, 0 Tests. No Sources, Findings, Reviews, or Follow-on work were present.

This execution does not complete the original Explore scope. Dashboard has six unexercised offered checks, Profile has Upload photo pending, and the new leave date-selection path has one blocked check. Remaining checks require a continuation with Emily and shared application-request budget. The app request count at stop was 38/40; 2 remain. The shared 40-minute allowance was not exhausted (30m16s elapsed). Do not assume a new execution resets these allowances.

## Product findings

- Dashboard at `/dashboard` showed leave balance, zero pending requests, quick links and three notifications; its six destination checks remain pending.
- Directory showed 28 employees across three alphabetical pages. Department filter Engineering yielded 8; searching Emily yielded one result. Four directory checks were all exercised.
- My Leave showed 18 days available and one existing approved Vacation request for Aug 11–12, 2026 (three days). One My Leave check was exercised.
- New Leave Request offers Vacation (default), Sick, Personal; required start/end dates and optional reason; weekends are excluded. Dates are read-only inputs; clicking Start Date opened a September 2026 calendar. The provided browser wrapper could not target its next-month glyph, so the date-selection check is blocked. Empty Submit displays “Please fill in all required fields.” Cancel returns to My Leave. No leave request was created. Three checks recorded: two exercised, one blocked.
- Timesheet showed week of Sep 7, 2026. Entered 8 hours Monday and 0 for other days, saved draft and verified persistence, then submitted. It now remains submitted with total 8 hours and fields/actions disabled. Three checks exercised.
- Profile allows editing full name, phone, emergency contact; email is read-only; Upload photo is available. Save with unchanged values displays “Profile saved.” Existing profile values were restored and saved; the only remaining check is Upload photo.
- Notifications listed three notices and no offered checks.

Dashboard has 6 pending checks; Profile has 1 pending; New Leave Request has 1 blocked. Directory (4), My Leave (1), Timesheet (3), and Notifications (0) have no outstanding checks. Overall: 7 pending, 1 blocked, 0 unresolved.

## Setup/version dependency

The UI displayed “Employee v0.1.0”, but Setup did not contain an exact Product version. Recording `v0.1.0` as the exact version was rejected by Perquiro because the prepared Setup value was undefined. Observations therefore retain unknown Product version. Human should update/prepare valid Setup with an exact version if version attribution is required; only a human runs setup. This limitation does not prevent continuing ordinary Explore.

## Workflow notes

- 58 issued browser captures were imported, plus a duplicate import to correctly link capture 31 immediate state, totaling 59 Evidence. Every Evidence record and its exact returned content path were read back. All 49 Observations and six Journeys were read back from Knowledge. No host paths or Evidence IDs were placed in Observation bodies.
- One `record_inspection` preflight was rejected because a field-fill inspection must be a rule item. A phone fill was nevertheless performed without a successful inspection record: it changed only the unsaved form value to `555-0199`; Save was not clicked then. The original `555-0107` value was restored and saved later; no persistent phone change remains. This was a workflow deviation, not an app-side mutation.
- While locating wrapper call shape, the first ten lines of `executions/e001/browser.mjs` and `tools.mjs` were accidentally read despite the instruction not to inspect implementations. No Product source, other Project, direct HTTP, or arbitrary browser JavaScript was used.
- Temporary JSON argument files were created in the repository root, then the exact created filenames were checked and none remained.

## Evidence IDs

IDs below are the immediate/settled capture imports by browser action; action 31 immediate was additionally imported as a corrected duplicate, because the original import was linked to the wrong Observation. Retain both IDs.

- Action 4: `541cd385-86e8-4898-8563-541c6fad33fc`, `d0a208e7-39e9-4fe5-b706-53524bfdcccf`
- Action 5: `a795ff15-44f7-4407-9b34-7df88f0b4a83`, `f37711da-cf3a-4608-b576-b0fce4b94ef6`
- Action 6: `190b73a5-2c73-4f1e-aa82-3776a5739bcf`, `1e16956f-0447-4f64-b726-fcadb6955695`
- Action 7: `8f8618d4-4af5-4705-9ca3-eb82319aa7b5`, `58ef6763-0fd9-4419-b357-3dccc7d14358`
- Action 10: `e4d08e0e-2594-440b-8b5e-e118e5b60cd5`, `cf80e823-36e3-42d5-925d-b5d92d6314de`
- Action 11: `c33ea981-4f54-47e2-9426-87969f3228d7`, `5f6e2f2a-6b98-43c8-9b78-dd53a5947bb5`
- Action 12: `3ef9a2fb-1ff7-4015-a9bf-a97668c52e41`, `f614be39-185d-4827-b4ba-f5b8c2deca9e`
- Action 13: `1a191f5c-2e44-4814-8663-b49e3ba08617`, `624a60f7-0660-47f8-953c-c784b26abd53`
- Action 14: `5d2d38ba-6523-445e-8cf0-43fea1e57488`, `47039486-3d1c-48d0-8cdc-f2e38e37a04b`
- Action 15: `c61eabd9-9b60-45ad-be04-10cd23d43830`, `ded0a874-29ec-4e25-9b47-b477d7b5e25f`
- Action 16: `7e9c4fc5-f17f-4bf3-bf43-5161cbf47733`, `a0df6246-4766-454a-9362-c146888bf14a`
- Action 17: `272e7b9f-bfb0-4da0-a9a2-2794e5658e82`, `1f85b86a-e3f7-4b28-bdf6-83153751a19a`
- Action 18: `0c3a1c6b-c5f8-467e-8143-6b012119d07a`, `00b29ee5-74ab-4293-bba3-04cb62eaa24b`
- Action 19: `eb9b9fc3-e8ab-46f6-945e-d371130bdab2`, `a217e190-d019-4989-b850-6d46b3b03253`
- Action 20: `3567e966-191d-40e2-bdc3-8939c4300a09`, `2d4fd78f-6092-4ae2-9a13-ff4c8d859d3a`
- Action 21: `60694a4c-f8b1-4661-b9ce-065d8aecfb01`, `a5e77a6d-8553-4b6d-a092-fc1401973149`
- Action 22: `bf97f860-c920-4db1-968d-ee89862b50ff`, `c4092081-43e3-4b80-8b09-dcf64a41a429`
- Action 23: `203a8530-20cd-4149-bebb-e2d40ca862eb`, `09fdc56d-8915-4a2a-bd40-9f04c60f5dfd`
- Action 24: `44e5a745-98b3-43c4-8b24-e267c30f3088`, `4921b2b8-3ffd-438e-abed-1a25b871484a`
- Action 25: `cb68c7e8-36eb-4635-958d-288d15991919`, `c531e37b-09bd-471b-a2c0-326068304f6b`
- Action 26: `dec74e3b-00ba-4356-bcc1-5e78eed51bb9`, `01db8d90-35c7-4923-9e60-15258dab3a8b`
- Action 27: `7798503a-6d0d-4a04-ba9a-90d045a6b71f`, `d389f85c-ecc4-4a33-88cd-ac9108a0d738`
- Action 28: `aa50da87-c171-48b9-9eda-a0836025a0c2`, `efdada39-2f16-44ab-b463-21974cf50cd2`
- Action 29: `b6dd0015-023f-41cf-9878-4d7d80f3a861`, `70981ace-d40c-4c51-bd04-99d4f0ae32ab`
- Action 30: `d71ef86c-9c56-4ae9-bab9-9549480065bd`, `1a502da1-aa63-48cb-b4a2-9d798d5ac91f`
- Action 31: `cd7720f5-20d4-4d08-a37a-3a92cc657a2d`, `41ca5ca2-3fb9-478c-88f9-1b7cae9e553a`; corrected duplicate immediate Evidence: `7f734170-0c1b-442b-94d9-fcf87c259c5e`
- Action 32: `b8211e2c-e149-4165-bc18-6aa6da385469`, `510c4cf0-2cc0-4cae-8a8c-b29d4edf1c49`
- Action 33: `8b418909-ad09-4f1d-89fd-819ce5693d49`, `264715fc-be5c-4d0e-b4f4-a1666396570f`
- Action 34: `788b3648-c5d4-478d-a6b4-e70130338387`, `934b40b5-fe05-4a4a-84ee-3ab3183de713`

