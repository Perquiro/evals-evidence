# Reservation recovery summary

Scope: recover the uncertain Reserve action, then inspect Reservation details and Actions, exercise the empty-Reason validation branch, and cancel reservation 42. Actor: Customer (`ca8ba006-6f42-4f2c-873a-e7581316f920`). Product version observed: 2.5. Version selection used for the recovery reads: all.

## Recovered Reserve action

The saved write replayed idempotently and returned the existing attempting Observation `c4525266-4748-430c-b217-0d8dba9c97e0`; it did not authorize a new dispatch. The public state read then returned `{"id":"42","state":"active","reservationCount":1,"version":"2.5"}`, so the original Reserve action had completed. The reconciled exercised outcome is Observation `027786e1-6a66-4493-8260-86071e1ada26`, supported by Evidence `1f8fd2c1-5076-464e-b6a1-d93ed2ce4db4` from `capture-reconciliation-42.json`.

No Reserve request was repeated. The recovered Reserve check is accounted for; its final `read_explore` result reports no recovery item and an exercised gap state.

## Reservation details and cancellation

Recorded surfaces:

- Reservation details (`486a9b5c-239f-493f-b4a5-4d969c96a430`), `/reservations/:id`.
- Cancellation confirmation (`f23c4636-be1e-4c66-abbe-46d434f5e30f`), `/reservations/:id/cancel`.
- GET /api/reservations/:id (`df1becb0-7b83-487b-9632-c9e44bcc269e`), `GET /api/reservations/:id`.

Opening Actions is recorded by Observation `a2c9617b-b8ae-46a2-bbd9-b42cd8a2ac9d`; it revealed Cancel, Edit, and Download in Observation `7f6da376-b78b-479d-b190-48c5515adb80`. Selecting Cancel is recorded by Observation `edec65fa-b653-40b1-bcca-61a8fb70584c`; the cancellation form inventory, including Reason and Confirm cancellation, is `93967cf6-c11c-4a9c-a505-4c6d1221bcd7`.

The separately exercised required-Reason branch used attempt `ceebf851-8d4e-4e5e-a782-c183f9e49284` and outcome `cb492d73-a3bd-4eb7-802e-da1a93101a9d`: an empty Reason kept the form visible and the browser reported `Please fill out this field.`. Evidence `618905e4-b2ea-4090-9bc2-bf9d344208ec` imports `capture-empty-reason-validation.txt`.

The only new confirmed server mutation in this recovery was cancellation. Its accepted attempt is `966dbc2f-c758-4567-a3e9-40793cce9e55`; outcome `f806416b-4dad-4761-b358-69b9025598a7` reached the confirmation route and recorded `Status: cancelled`. Evidence `6493e244-4396-4521-8574-f6cffc4aa5ba` imports `capture-cancellation-confirmation.txt`.

The final public state read is Observation `9b30b3c2-4c23-4d0a-bedf-83cde702392c`: `{"id":"42","state":"cancelled","reservationCount":1,"version":"2.5"}`. Evidence `090e31d0-763c-4eab-9397-4142eeafb452` imports `capture-final-state-42.json`.

The recorded Journey is Reserve and cancel reservation (`f7acf160-f797-4077-ac1c-fb723c1dfb07`).

## Remaining scope and failures

The final Product state is cancelled. Reserve, the empty-Reason rule, and Confirm cancellation are accounted for. Actions and Cancel are recorded as reached access steps; Edit and Download were offered but not exercised because they are outside the authorized cancellation path.

No Product request failed. MCP recording had four corrected validation rejections: two initial `read_knowledge_context` shape attempts, an unsupported `resourceRef` on the Reserve exercised Look, and an unsupported `reachedSurfaceId` on the cancellation exercised Look. Each rejected write was retried with a new request token and no Product mutation was replayed. No installs, Project internals, fixtures, or non-public Product access were used.
