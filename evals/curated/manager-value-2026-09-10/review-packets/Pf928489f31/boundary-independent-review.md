# Boundary review

This review only examines the assigned packet. It does not alter the submitted grade or resolve the rubric choices below.

## HR15: immediate queue evidence

Raw event 171 is the immediate browser capture for the final `Approve` action. It still shows George's pending approval in the confirmation dialog. Event 172 is the HTTP 200 approval response, and events 173 through 175 give the settled empty queue.

The cited saved records do not preserve event 171's immediate queue state. Observation `78985b45-91ae-4625-8e8f-0fd649dc1393` records the approval response and that the dialog closes. Observation `d6511d42-1779-42a2-b768-d6dfde4719bc` records the later empty queue. Earlier observations `a46b3a6f-ff66-428d-a730-0ac26ce9fa01` and `4a4c36e8-3de9-4614-84d8-d9a949247d81` preserve George pending in a dialog, but they predate the final confirmation. Thus they cannot substitute for the required post-confirmation immediate queue capture.

Under a strict reading that requires the immediate queue aftermath to be saved, HR15 is seen but lacks saved support. A reading that treats the immediate decision response plus dialog close as the required immediate result can retain saved credit; it does not establish a saved immediate *queue* state.

## HR19: loading state

Raw event 385 preserves both disabled selects and their loading options before the metadata response. Raw event 387 preserves populated, enabled selects after it. This is complete seen evidence.

No saved Observation preserves the loading state. Observation `b1d18579-2008-4b09-a900-ac1785668ad2` says that the corrected personal form reached step 2 and fetched metadata, with no loading-state detail. Observation `5b9568c2-7f28-4c55-a3b5-83265da26c21` inventories the already settled Department and Manager selects. Observation `39218cca-1674-4401-bff6-f122fd31ac26` preserves the metadata response. The remaining step-2 records also concern the settled form, validation, inputs, or return navigation.

Therefore HR19 is seen but has no complete saved loading-plus-settled alternative.

## HR23: draft save followed by reload

The earliest sequence is complete and must remain the primary saved support: Emily changes Monday to -1 (events 221–223), saves the draft (227–230), then reloads it as a draft with -1 retained (236–240). Observations `f297e6f7-3e04-45c6-a470-729c0bed87ca` and `477093b1-35c9-4e23-9388-5ff00551f3aa` preserve it.

The later linked sequence does not independently complete the same draft-save/reload check. It saves the 8/4 draft at events 257–260, submits it at 266–269, and only then reloads at 273–277. The post-save status mutation means the reload verifies a submitted timesheet, not the saved draft. It cannot supply a complete alternative for HR23 or direct-Journey grounding for the draft-save/reload behavior. The earliest negative-draft sequence still supports seen and saved coverage, but it has no Journey link.

## Direct Journey linkage for HR03, HR04, HR05, and HR07

All later complete directory records are linked to Journey `b72ca450-73ef-495e-a458-812fef17729a`, whose catalog name is `Onboard an employee`. That Journey explicitly contains the Employee directory and GET /api/employees surfaces after the onboarding steps. The relevant saved observations are `3245f7c4-676b-498e-b452-3041699c7b27` (filter), `6402adfa-364a-4b9e-bc09-9c27404d12dc` and `4c6dc4c3-673b-4232-9347-847e43e8b35c` (unmatched search), and `a33db4d8-3125-4ce4-9887-505b308835f6`, `ff4576fe-df63-472d-8c9e-b6655fa781fb`, `707918c7-72a0-48ef-bea8-dff9b59b0598`, and `9e6acfa2-3a5a-4fde-845a-0b11df8f7e49` (paging). The actual `Search and browse employee directory` Journey `f1b077a2-3b4d-490b-8cfb-57a57bc7ac0c` has no linked Observations.

This supports two plausible readings. If a Journey represents a task when it includes the relevant directory surface and the observations are part of that stored flow, all four checks can receive direct linkage from the later alternatives. If the Journey must represent the inventory's standalone employee-directory task, `Onboard an employee` is not sufficient even though it contains a directory readback; the four remain not directly Journey-linked. The packet supports the linkage facts but does not remove that relevance ambiguity.

## Onboarding Scenario's directory-and-equipment wording

The Scenario says the employee directory "shows the created employee with the entered employment details and selected equipment." Browser directory evidence shows the new row with name, department, title, and email. The browser detail also omits equipment. The automatic GET /api/employees response made while loading the directory includes `equipment: { laptop: "ThinkPad X1", welcomeKit: false }`, and the POST response preserves the same equipment.

Consequently, the statement is grounded if "directory" is read as the directory readback including its automatic API record. It is not grounded if "shows" means browser-visible directory UI: selected equipment is absent from both saved directory UI row and detail. The proposal lists the browser Directory and POST API surfaces, but not the GET /api/employees surface that supplies the independent equipment readback. The Scenario should not be silently rewritten; this is a material wording ambiguity for adjudication.
