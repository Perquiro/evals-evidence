# Boundary review

This memo leaves `grade.independent.json` unchanged. It answers only the three requested evidence questions from the frozen packet.

## HR15: approval aftermath

The raw trace establishes two different post-confirmation states. Event 179 is the immediate browser snapshot for Michael's click on the third-row Approve button. The approval dialog is already closed, but id4 remains in the pending table with its Approve and Reject controls. Event 180 then returns id4 with `status: approved`; event 181 returns the refreshed pending list without id4; events 182 and 183 are settled browser states that show only ids2 and3.

No saved Observation preserves the immediate still-present UI state from event 179. Observation `d1000959-3689-4427-aeb2-7e5c94202619` records the decision response and says the dialog closed and row removed. Observation `defd06ff-d092-47b5-abcc-bee8149b687f` records the refreshed pending list without id4. Observation `385fd924-7c77-49bf-8fc2-065ea7114c89` preserves the POST response. Those are settled/result facts, not a saved account of the transient stale queue after confirmation.

Therefore HR15 is fully seen in the trace, but saved Knowledge has partial support for its required immediate-and-settled queue account. The absent immediate detail is a missing saved detail, not an unsupported claim.

## HR21: pre- and post-creation headcount

The observed pre-creation baseline is 28 employees. Raw browser event 324 is Hannah's dashboard at 14:25:20 and renders `Employees 28`. Final saved Observation `8fd76029-e655-40c9-819f-5107ca9e8bb2` records the same count.

The creation action is event 405 and the successful POST is event 406, which creates the named employee. Afterward event 418 returns directory `total: 29`; settled events 419 and 420 render the created employee in a directory that says `29 employees`. Final saved Observations `49050eb8-7c5f-41e2-a1fd-7c8439ed859e` and `265dfa96-7653-489a-be35-3b3a4a2a99ac` preserve the 29 count and the named employee's separate readback. Observation `1afd86fd-caf5-4bec-b88c-14c7b13c8645` also preserves that the new employee was visible in Directory.

This is an observed 28-to-29 count change across two rendered states for the same HR administrator, paired with the recorded creation and directory readback. It does not infer a baseline from id29 or from one successful POST. On that evidence, HR21 remains complete for seen and saved coverage.

## Direct Journey linkage: HR09 and HR17

HR09 has no complete directly linked saved alternative. The complete reversed-date sequence is saved in unlinked Observations `78d2ad26-8f47-4ec2-9dcc-0e1bd19ee898`, `b46b083e-33d5-4a4a-a2fa-752d834a0185`, and `6b1373b5-0759-4b2e-a95e-1547657dee45`; their trace support is events 67, 77, 82, 87, 90, and 91. Linked Observation `1dea245f-6947-48b8-be0e-ed5cfca7695e` says that reopening the form after the accepted reversed-date submission retained fields, but it does not independently record the required Product response. It cannot replace the unlinked response record for a complete directly linked HR09 support set.

HR17 also has no complete directly linked saved alternative, even allowing its relevant employee and manager Journeys to be combined. The id4 creation is directly linked in `9b293ab2-cbce-4cee-9f20-04ad934078a0`, and Emily's post-approval readback is directly linked in `5148a92c-27f6-48aa-85af-fe4dfafd94f1`. The essential manager approval is saved only in unlinked Observations `d1000959-3689-4427-aeb2-7e5c94202619`, `defd06ff-d092-47b5-abcc-bee8149b687f`, and `385fd924-7c77-49bf-8fc2-065ea7114c89`. A different branch has a directly linked manager rejection (`bd89a803-5575-4897-bb5c-aaf92e2e835c`), but its id3 creation result is only saved in unlinked Observation `6b1373b5-0759-4b2e-a95e-1547657dee45`. Thus each complete chain retains an essential unlinked Observation.
