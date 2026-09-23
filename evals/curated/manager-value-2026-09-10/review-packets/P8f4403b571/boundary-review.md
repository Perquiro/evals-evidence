# Boundary adjudication review

This review leaves `grade.initial.json` unchanged.

## HR15 — approval aftermath

The raw trace has both required states. At event 179, immediately after Michael confirms approval, the dialog is closed but id4 remains in the displayed pending queue. Event 180 records the successful approval response. Events 182 and 183 are the settled browser states, where id4 is absent after the queue refresh.

No saved Observation preserves the event-179, post-confirmation still-present queue state. `d1000959-3689-4427-aeb2-7e5c94202619` says the approval response closed the dialog and “row removed”; `defd06ff-d092-47b5-abcc-bee8149b687f` records the refreshed pending API result without id4; and `decc0816-e3d9-4f67-94c6-351a64b9e293` records absent controls after approval. All three preserve the settled outcome only. The earlier pending records are pre-confirmation states and cannot substitute for the required immediate aftermath.

Adjudication: HR15 is seen-complete through events 179–183, but saved support is partial and cannot satisfy the rubric’s immediate-and-settled requirement.

## HR21 — observed headcount change

There is an observed, saved pre-creation baseline: `8fd76029-e655-40c9-819f-5107ca9e8bb2` records Hannah’s dashboard with 28 employees, supported by event 324. The submission then succeeds at events 405–408 and is preserved in `0de7f899-6584-4076-8d1b-b8ad3a59d0c2`. The subsequent directory read at events 417–420 is preserved by `49050eb8-7c5f-41e2-a1fd-7c8439ed859e`, which records 29 employees and the new employee visible.

The complete saved alternative is therefore observations `8fd76029-e655-40c9-819f-5107ca9e8bb2`, `0de7f899-6584-4076-8d1b-b8ad3a59d0c2`, and `49050eb8-7c5f-41e2-a1fd-7c8439ed859e`, with events 324, 405–408, and 417–420. It establishes the observed 28-to-29 headcount change without inferring a baseline from the created id or external knowledge.

Adjudication: HR21 remains complete; the initial support set omitted the saved pre-creation baseline but a complete supported alternative exists.

## Direct Journey diagnostic — HR09 and HR17

HR09 has no complete directly Journey-linked saved support. `1dea245f-6947-48b8-be0e-ed5cfca7695e` is linked to the leave journey and records that the returned form retained reversed values after an accepted submission, but the material Product response — POST 201, creation of id3, pending status, and the result of the reversed-date submission — is preserved by unlinked `6b1373b5-0759-4b2e-a95e-1547657dee45`. The linked Observation does not retain the full response. The appropriate diagnostic value is false.

HR17 also has no complete directly Journey-linked saved support. The employee creation and later employee readback are directly linked to the leave journey in `9b293ab2-cbce-4cee-9f20-04ad934078a0` and `5148a92c-27f6-48aa-85af-fe4dfafd94f1`. The material manager approval of that same id4 is preserved by unlinked `d1000959-3689-4427-aeb2-7e5c94202619`; the directly linked approval-journey records concern id3’s rejection, not id4’s approval. Events 179–183 prove the manager action, but they do not make the saved Observation Journey-linked. There is no alternate complete directly linked set, even allowing multiple relevant Journeys. The appropriate diagnostic value is false.
