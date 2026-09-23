# Librarian Explore summary

## Scope and request budget

- Actor: `Librarian` (`d6731181-6bdb-413a-8654-f770b2cbe3fc`).
- Product/version scope: Willow Library at `http://127.0.0.1:52476`; version unknown.
- New Product HTTP requests: **12 of 12**. The rejected curl payload was rejected by the client before HTTP dispatch and is not included.
- Cumulative shared Product HTTP requests: **36 of 40**: Reader used 24 and Librarian used 12. **Four** requests remain reserved for a later fresh Reader execution.
- No package or browser installation was required. The local HTTP client read the disposable service successfully.

## Saved Knowledge

Knowledge now contains 15 Surfaces, 8 Journeys, 56 Observations, and two Evidence items. This pass added:

- `POST /desk/returns`: `d4af5ee2-2d6d-4ba5-b147-4a415fe1c238`
- `Check in book`: `171451c9-0842-4847-9e5d-d65fccc52963`, with `GET /desk` then `POST /desk/returns`

The Librarian pass recorded these grounded facts:

- `/` identified Willow Library as a local disposable development service with synthetic data and linked Catalog, Account, and Service desk.
- `/docs` says `X-Actor` selects the Reader or Librarian demo session without credentials, and responses expose links and actions.
- `/desk` listed Night Trains (`bookId` 103) as the only pending return and offered `POST /desk/returns` with that id.
- The first accepted check-in marker, `8871419f-5537-4c90-a33e-5caa8a0afa36`, was resolved as not executed: curl rejected malformed request data before it sent HTTP. The non-execution observation is `f32dc6ef-6a35-43fe-a147-0c7a7d244ab3`.
- The authorised replacement attempt, `ec92a4dc-15ad-4a7b-9195-c20d4e2a0019`, sent one POST and returned HTTP 404 with `{"error":"Book not found"}`. Its endpoint observation is `08eaa2bd-3287-4e98-b842-80e5bdf53301`; its exercised outcome on the desk action is `5aa74826-aeab-4ae6-9d9a-0c0d3f84c818`.
- A follow-up `/desk` read, recorded as `5fb898e5-7aaa-464e-a19d-1b0a90db3cf0`, still listed the same pending return and check-in action. The check-in action (`fe21b078-dabf-45de-b51f-c2d6fcff48ce`) is accounted for, with no pending, blocked, or unresolved recovery item.
- Librarian's `/account` links to `/holds` and `/loans`; both returned empty arrays, with `No reservations` and `No loans` respectively.
- The current catalog listed River Atlas (101) and Garden Notes (102) as available, Night Trains (103) as unavailable, and title search. Searching `Garden` returned only available Garden Notes. `/books/102` and `/books/103` both exposed a Reserve book action for the Reader actor.

## Limitations and handoff

- No Evidence was imported in this pass; the API response facts were saved as Observations.
- The Product HTTP allowance for this Librarian execution is exhausted. Do not make additional Product requests here.
- The service desk remains in the observed state where it offers a check-in for book 103 but the authorised request returned 404. This is recorded as an observation, not a Finding.
- All accepted Librarian attempts have terminal saved outcomes. There is no recovery action to repeat.
- A fresh Reader Explore execution may use the remaining four Product requests. Create may now propose coverage for the eight recorded Journeys when the human requests it.
