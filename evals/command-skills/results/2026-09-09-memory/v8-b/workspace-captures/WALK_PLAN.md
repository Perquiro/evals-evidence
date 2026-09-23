# Willow Library reviewed walk plan

Human scope: Explore Willow Library and record Knowledge of what people can do and what happens.

Product request budget: 40. Discovery used 10 read-only requests. This plan may use at most 20 more before evidence review. Ten requests remain reserved for reviewer-directed gaps and final readbacks.

Discovery evidence is the fact ledger at `notes-discovery/ledger.md` and captures `01` through `10`. The Product version is unknown.

## Outcome checklist and request order

| Key | Actor | Action / starting state | Concrete ordered check | Outcome cell covered | Planned request number |
|---|---|---|---|---|---|
| S1 | Reader | Catalog advertises title search | `GET /catalog?q=River` | Matching result and returned links | 11 |
| S2 | Reader | Search remains available | `GET /catalog?q=not-a-real-title`; if its response advertises a recovery link/action, use it in the next request, otherwise retain the response's explicit no-recovery disposition | No-results and offered recovery | 12–13 |
| L1 | Reader | Loan 201 exists for Garden Notes | `GET /loans/201`; list every advertised action, field and rule | Detail state, actions, recovery/terminal dependency | 14 |
| A1 | Librarian | Reservation is labelled Reader-only in book details | `GET /account` as Librarian and follow the returned holds entry/action only if exposed | Advertised role-boundary comparison or a response-supported no-entry disposition | 15–16 |
| H1 | Reader | Holds are empty; books 101 and 102 advertise reserve | `POST /holds` with `{}` | Required-input validation | 17 |
| H2 | Reader | Book 102 is unavailable but advertises reserve | `POST /holds` with `{bookId:"102"}` before any state can change it; if accepted or linked to a changed resource, immediately read that resource or `GET /holds` | Unavailable-state outcome and conditional resulting state | 18–19 |
| H3 | Reader | Book 101 is available and advertises reserve | Save an attempted-action inspection, then `POST /holds` with `{bookId:"101"}` | Successful outcome | 20 |
| H4 | Reader | State after H3 | Re-attempt reservation for book 101, then `GET /holds`; inventory every hold/hold-detail recovery action and use one reachable recovery in the next request if advertised | Repetition/visible limit, result readback, and recovery | 21–23 |
| C1 | Librarian | Desk shows pending return book 103 | `POST /desk/returns` with `{}` | Required-input validation | 24 |
| C2 | Librarian | Book 103 is pending return | Save an attempted-action inspection, then `POST /desk/returns` with `{bookId:"103"}` | Successful result | 25 |
| C3 | Librarian | State after C2 | Re-attempt check-in for 103 | Repetition/unavailable state | 26 |
| C4 | Reader | Reader consumed catalog and loans before change | Read `GET /catalog` and `GET /loans` after C2 | Reader-visible consumer readback | 27–28 |
| L2a | Reader | Loan 201 exposes `POST /loans/201/renew` with no JSON fields | Save an attempted-action inspection, send renewal, then read `/loans/201` while the loan remains present | Renewal result and changed-state readback | 29–30 after re-review |
| L2b | Reader | Loan 201 exposes `POST /loans/201/return` with no JSON fields | Preserve this terminal action for the reserve after evidence review: then inspect attempt, return, repeat/now-unavailable branch, and read the Reader collection/catalog result | Terminal return, unavailable/repeat and consumer readback | Reserve 31–34 after evidence review |

## Grounded dispositions

* The `/desk` access difference is already grounded: Reader received 403 and Librarian reached the desk (D05 and D10). No duplicate mutation is planned to establish it.
* The discovery captures establish initial availability for books 101–103, empty holds, and the starting loan. Those facts will stay separate from later changed-state readbacks.
* No invalid offered choice is advertised beyond required JSON `bookId`; no speculative identifier probes are planned. If loan detail advertises a distinct constraint, one representative check will be scheduled.
* H2 runs before any terminal action affecting 102. Its conditional readback completes before H3. L1 runs before any possible loan-terminal action. H4 runs before work uses a terminal completion and inventories an offered hold recovery before it is used. C3 runs before a later operation could recreate the pending-return state.
* The read-only gates completed at requests 11–16. They preserved all discovered state: request 13 still listed 101 available and 102/103 unavailable; request 14 still showed loan 201; no mutation was sent; the Reader's holds remain the empty discovery state; and desk 103 remains its discovery pending-return state. Request 15–16 showed that Librarian can reach `/account` and `/holds`, but the holds response exposed no reservation action, so the action's Reader label stays the only observed boundary.
* Each Product mutation will be preceded by a fresh `record_inspection` attempt tied to the exact surface, Actor, resource, and advertised action; no mutation will dispatch without its returned authorization.

## Evidence drafting and recording plan

Proposed Surfaces, subject to the evidence review: `GET /`, `GET /docs`, `GET /catalog`, `GET /books/:id`, `GET /account`, `GET /holds`, `GET /loans`, `GET /loans/:id`, `GET /desk`, `POST /holds`, and `POST /desk/returns`; any loan mutation endpoint will be added only if seen.

Proposed Journeys: `Browse the catalog`, `Search the catalog`, `Reserve a book`, `Review a loan`, and `Check in a book`.

For each discovery or walk ledger row, the later evidence draft will state the actual Actor, Surface, Journey, response capture, exact observed fact, and disposition. Each mutation response and each resulting collection/detail readback will have separate rows. Captures will be imported only after supported Observation ids exist.
