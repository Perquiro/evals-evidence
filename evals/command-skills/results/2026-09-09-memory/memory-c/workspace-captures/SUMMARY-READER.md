# Reader Explore summary

## Scope and budget

- Actor: `Reader` (`862a4bae-17c9-4114-aa82-6b27dc67a9a6`).
- Product/version scope: Willow Library at `http://127.0.0.1:52476`; product version unknown.
- Product requests used: **24 of 24** cumulative Reader requests. No package or browser installation was required.

## Saved Knowledge

The Reader pass recorded 14 Surfaces, 7 Journeys, 40 Observations, and two Evidence items.

- `GET /`: `53dfe79b-db43-403a-a84e-7f130320ea63`
- `GET /catalog`: `2c8ae724-859e-4c9d-805d-d85a2ce3f7f1`
- `GET /account`: `a2db31e6-b969-45fa-a830-0b6f18a87ddb`
- `GET /holds`: `cc358827-1734-4c85-b536-68428d8f2b5d`
- `GET /loans`: `ede4f426-9875-4ee4-9da5-7ee15123316f`
- `GET /loans/201`: `9a276b74-a265-44a8-b524-85105de0330b`
- `POST /holds`: `f138a1e3-67df-4e05-8075-ebc4289a3be4`
- `DELETE /holds/301`: `cb7059be-621d-4ccf-baf5-d47eedf3a1ac`
- `POST /loans/201/return`: `9f335168-6ac7-4240-8e24-3eb62d958150`

Journeys are Browse catalog, View account, Manage loan, Reserve unavailable book, Reserve available book, Cancel reservation, and Return loan. Their canonical ids are retained in the Knowledge catalog.

Observed and saved facts:

- Reader can browse River Atlas (101, available), Garden Notes (102, unavailable), and Night Trains (103, unavailable), and search by title.
- The Reader service-desk request returned `Service desk requires Librarian`.
- Loan 201 for Garden Notes was renewed from zero to one renewal, changing its due date from 2026-10-01 to 2026-10-15.
- Reserving unavailable Night Trains returned 409 Conflict with `Book is unavailable`.
- Reserving available River Atlas returned 201 with hold 301. Cancelling hold 301 returned 200 with `Reservation cancelled`, and a follow-up holds read was empty.
- Returning loan 201 returned 200 with `Book returned` and bookId 102. A subsequent loans read was empty.

Evidence `48de1d1d-7e88-4b69-a55c-3618921c6835` supports the renewal response and its reconciliation. Evidence `5101e53a-a68c-4d5e-94bc-d12365fe3e20` supports the return response and its empty-loans reconciliation.

## Recovery and handoff

All accepted Reader mutation attempts have saved exercised outcomes. There are no unresolved attempts or recovery actions. At the end of the Reader pass, holds and loans both returned their documented empty states.

Reader has no remaining Product request budget. The Librarian pass should cover `/desk` and its offered operations. The recorded journeys are ready for Create when the human wants coverage proposed.
