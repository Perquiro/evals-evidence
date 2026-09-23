# Reader Explore summary

## Scope and request budget

- Actor: `Reader` (`862a4bae-17c9-4114-aa82-6b27dc67a9a6`).
- Product/version scope: Willow Library at `http://127.0.0.1:52476`; version unknown.
- Product requests used: **20 of 24**. The four remaining Reader requests were deliberately left for the later Reader continuation.
- No installation was required. The HTTP client successfully read the local disposable service.

## Knowledge saved

Recorded 13 Surfaces, 6 Journeys, 36 Observations, and one Evidence item. Relevant canonical ids:

- `GET /`: `53dfe79b-db43-403a-a84e-7f130320ea63`
- `GET /catalog`: `2c8ae724-859e-4c9d-805d-d85a2ce3f7f1`
- `GET /account`: `a2db31e6-b969-45fa-a830-0b6f18a87ddb`
- `GET /holds`: `cc358827-1734-4c85-b536-68428d8f2b5d`
- `GET /loans`: `ede4f426-9875-4ee4-9da5-7ee15123316f`
- `GET /loans/201`: `9a276b74-a265-44a8-b524-85105de0330b`
- `POST /holds`: `f138a1e3-67df-4e05-8075-ebc4289a3be4`
- `DELETE /holds/301`: `cb7059be-621d-4ccf-baf5-d47eedf3a1ac`

Journeys: Browse catalog (`c2784df2-b4c8-4d3b-bf8a-c14a2eaf6bb1`), View account (`e84a8a5a-790c-418c-8abd-608825bb29fe`), Manage loan (`88836732-dbed-4997-a7c4-0111584b14b5`), Reserve unavailable book (`83bbf115-c6c0-43e8-9e40-1fdbabc88c94`), Reserve available book (`23c21e3a-8997-4cd9-aa73-95221fd18bd3`), and Cancel reservation (`74558802-05fb-4d7e-86fb-a7fe99be952f`).

Observed and saved facts:

- Reader can browse three catalog books and search by title. River Atlas (101) was available; Garden Notes (102) and Night Trains (103) were unavailable.
- Reader's account initially had no holds and one Garden Notes loan (201), due 2026-10-01 with zero renewals.
- An authorized renewal of loan 201 returned 200, renewed it once, and changed its due date to 2026-10-15. A follow-up read matched the response.
- An authorized reservation attempt for unavailable Night Trains returned 409 Conflict with `Book is unavailable`.
- An authorized reservation of available River Atlas returned 201 with reservation 301. `GET /holds` then offered `DELETE /holds/301`.
- An authorized cancellation of reservation 301 returned 200 with `Reservation cancelled`; a follow-up `GET /holds` again returned no reservations.
- `GET /desk` with Reader returned `Service desk requires Librarian`.

Evidence `48de1d1d-7e88-4b69-a55c-3618921c6835` supports the loan renewal outcome and reconciliation.

## Recovery and remaining work

All accepted attempts have recorded outcomes; there are no unresolved mutation outcomes or blockers for the Reader pass. No product state was left requiring recovery: holds are empty, and loan 201 remains renewed once with due date 2026-10-15.

The later Librarian pass should cover `/desk` and its offered operations. A later Reader continuation has four product requests remaining; useful remaining checks include the refreshed loan list after renewal, return-loan behavior, additional catalog-search branches, and any outcomes newly exposed by those reads. Knowledge now has six journeys suitable for Create.
