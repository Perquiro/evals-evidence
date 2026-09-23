# Boundary review

## HR15 immediate queue state

The qualifying raw sequence is clear. Event 171 is the immediate post-final-Approve snapshot and still shows George Tanaka's pending row with Approve and Reject. Event 172 is the approval response, event 173 reloads approvals, and events 174 and 175 show the settled empty queue.

No saved Observation preserves the event-171 queue state. Observation `4a4c36e8-3de9-4614-84d8-d9a949247d81` describes the earlier confirmation dialog and predicts a transition, not the post-final-action queue. Observation `78985b45-91ae-4625-8e8f-0fd649dc1393` records the HTTP 200 response and dialog closure. Observation `d6511d42-1779-42a2-b768-d6dfde4719bc` records only the settled empty queue. None says that George remained in the immediate UI queue after the final approval action.

Therefore HR15 remains seen, but its saved flag should be false. Its direct Journey flag is already false. This finding does not alter `grade.initial.json`.

## Scenario `2860f9e5-c6e2-4dee-a390-a3cebcbbf5f1`

The Scenario says that “the employee directory shows the created employee with the entered employment details and selected equipment.” The browser-directory row preserved in Observation `89aa737e-33fd-4d53-9bb9-50f8b35ee1e9` visibly shows the employee's name, department, title, and email. It does not visibly show the selected ThinkPad, welcome-kit choice, manager, or start date. The completion screen in `ce119d0d-b70b-4ece-a75c-e1edfa6b79c5` also does not show those fields.

Observation `3d680ff7-5dfb-4200-872f-ec19c79538d0` does support an API-backed directory readback containing the equipment and further employment data. The proposed Scenario's listed surfaces, however, name browser Directory and POST /api/employees, not GET /api/employees.

On a strict reading, “directory shows” describes the browser Directory outcome. Its selected-equipment outcome is unsupported, and the Scenario is not fully grounded. A broader reading can treat “directory” as the API-backed directory record. That reading is supportable from Observation `3d680ff7-5dfb-4200-872f-ec19c79538d0`, but it is ambiguous because the listed surfaces omit GET /api/employees and the wording says “shows.”

## Direct Journey linkage for directory checks

HR03, HR04, HR05, and HR07 have complete saved records directly linked to journey `b72ca450-73ef-495e-a458-812fef17729a`, Onboard an employee. That journey includes the directory readback after creation and the linked records document actual directory filtering, search, sorting, and paging. It is relevant to the directory-search/readback task despite the later separate Search and browse employee directory Journey.

For HR03, Observation `6402adfa-364a-4b9e-bc09-9c27404d12dc` preserves the settled unmatched search. For HR04, `3245f7c4-676b-498e-b452-3041699c7b27` preserves the HR filter. HR05 uses the same complete unmatched-search record as HR03. HR07 needs the complete later linked page set: `2d07bd7a-ce47-4302-a2f0-c1c3d1a841ae`, `a33db4d8-3125-4ce4-9887-505b308835f6`, and `707918c7-72a0-48ef-bea8-dff9b59b0598`. The last record was saved just after minute 40, so it supports final linkage but not the minute-40 saved checkpoint.

## HR01 Hannah record

Hannah's complete navigation is preserved in copied input-preparation UI Observations beginning with `b03a7b23-03a5-4418-a44d-6fcb0d2bd709`; it lists Dashboard, Directory, My Leave, Timesheet, Approvals, Onboarding, and My Profile. The initial HR01 saved failure should rest on Michael's incomplete saved navigation record, not on Hannah.
