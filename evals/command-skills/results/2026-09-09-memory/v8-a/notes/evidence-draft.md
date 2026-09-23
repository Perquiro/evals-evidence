# Proposed Observation ledger

Each row cites its response capture, Actor, canonical Surface, and Journey. `—` means a Surface-only navigation fact. Proposed endpoint identities awaiting recording are marked **new**.

| Key | Capture | Actor | Surface | Journey | Proposed factual Observation |
|---|---|---|---|---|---|
| D01 | discovery R01 | Reader | Root | — | The root response identifies Willow Library as a local disposable development service and links Documentation, Catalog, Account, and Service desk. |
| D02 | discovery R02 | Reader | Documentation | — | Documentation says Reader and Librarian are selected with `X-Actor` and that response actions provide their HTTP method and JSON fields. |
| D03 | discovery R03 | Reader | Catalog | Find a book | The catalog lists River Atlas as available and Garden Notes and Night Trains as unavailable. |
| D04 | discovery R04 | Reader | Book detail | Reserve a book | Available River Atlas offers Reader `POST /holds` with `bookId` 101 to reserve it. |
| D05 | discovery R05 | Reader | Book detail | Reserve a book | Unavailable Garden Notes still offers Reader `POST /holds` with `bookId` 102. |
| D06 | discovery R06 | Reader | Account | — | Account links Reader to reservations and loans. |
| D07 | discovery R07 | Reader | Reservations | Reserve a book | Reader's reservation collection is empty and says `No reservations`. |
| D08 | discovery R08 | Reader | Loans | View loans | Reader's loan collection lists Garden Notes loan 201. |
| D09 | discovery R09 | Reader | Service desk | Check in a book | Reader's service-desk entry returns `Service desk requires Librarian`. |
| D10 | discovery R10 | Librarian | Service desk | Check in a book | Librarian's service desk lists Night Trains 103 as pending return and offers `POST /desk/returns` with `bookId` 103. |
| C11 | coordinator C11 | Reader | Loan detail | View loans | Loan 201 for Garden Notes has zero renewals, is due 2026-10-01, and offers Reader renewal and return actions. |
| C12 | coordinator C12 | Librarian | Book detail | Reserve a book | Librarian can read River Atlas detail, whose reserve action is explicitly labelled for Reader. |
| C13 | coordinator C13 | Reader | Catalog | Find a book | Searching `River Atlas` returns only available River Atlas. |
| C14 | coordinator C14 | Reader | Catalog | Find a book | Searching `No such title` returns no books, says `No books found`, and offers `/catalog` to clear the search. |
| C15 | coordinator C15 | Reader | Catalog | Find a book | Following the no-results clear link returns the three-book catalog. |
| C16 | coordinator C16 | Librarian | Loan detail | Renew a loan | Librarian loan detail exposes the same renewal and return controls, both labelled for Reader. |
| C17 | coordinator C17 | Reader | **new** Renew loan (`POST /loans/:id/renew`) | Renew a loan | Renewing loan 201 returns one renewal and due date 2026-10-15. |
| C18 | coordinator C18 | Reader | **new** Renew loan (`POST /loans/:id/renew`) | Renew a loan | Repeating renewal for loan 201 returns `Renewal limit reached`. |
| C19 | coordinator C19 | Reader | Loan detail | Renew a loan | The renewal readback shows loan 201 has one renewal and due date 2026-10-15 while retaining renewal and return controls. |
| C20 | coordinator C20 | Reader | Reserve book | Reserve a book | Posting an empty reservation request returns `Book is required`. |
| C21 | coordinator C21 | Reader | Reserve book | Reserve a book | Reserving unavailable Garden Notes returns `Book is unavailable`. |
| C22 | coordinator C22 | Reader | Reservations | Reserve a book | After the unavailable reservation request, Reader's reservation collection remains empty. |
| C23 | coordinator C23 | Reader | Book detail | Check in a book | Before check-in, Night Trains detail shows it is unavailable and offers Reader a reservation action. |
| C24 | coordinator C24 | Reader | Reserve book | Reserve a book | Reserving available River Atlas creates reservation 301 and links to the reservation collection. |
| C25 | coordinator C25 | Reader | Reserve book | Reserve a book | Repeating the River Atlas reservation returns `Already reserved`. |
| C26 | coordinator C26 | Reader | Reservations | Reserve a book | Reader's reservation collection lists reservation 301 for River Atlas and offers `DELETE /holds/301` cancellation. |
| C27 | coordinator C27 | Reader | **new** Cancel reservation (`DELETE /holds/:id`) | Cancel a reservation | Deleting reservation 301 returns `Reservation cancelled`. |
| C28 | coordinator C28 | Reader | Reservations | Cancel a reservation | After cancellation, Reader's reservation collection is empty and says `No reservations`. |
| C29 | coordinator C29 | Reader | **new** Cancel reservation (`DELETE /holds/:id`) | Cancel a reservation | Repeating deletion of reservation 301 returns `Reservation not found`. |
| C30 | coordinator C30 | Reader | Reservations | Cancel a reservation | The final reservation readback remains empty and says `No reservations`. |

## Explicitly untried branches

Loan return, Reader action-level check-in access, Librarian check-in validation and success, post-check-in desk and Reader-book readbacks, repeated check-in, and final catalog consumer readback remain untried for the concrete budget dispositions in the reviewed amendments. Cancellation access is not applicable because its offered control has no role boundary. No Product version is known.

## Evidence import mapping

After Perquiro returns the corresponding Observation ids, import `notes/discovery.md` with the ids for D01–D10 and import `notes/coordinator-captures.md` with the ids for C11–C30. The imports use no product version. The `Cancel a reservation` Journey is `GET /holds`, `DELETE /holds/:id`, `GET /holds`, `DELETE /holds/:id`, `GET /holds` for C26–C30. `Check in a book` is corrected to its reached sequence of `GET /desk`, `GET /desk`, `GET /books/:id` for D09, D10, and C23.
