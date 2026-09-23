# Final capture reconciliation

## Decision

Captures 26--39 are supported and ready for recording with the exact Actor/Surface/Journey associations below. The remaining single Product request is worth using for **Librarian `GET /books/103`**. Capture 30 followed the check-in link as Reader, although the check-in response was produced by Librarian; request 40 completes that resource-link readback for the changing Actor and may disclose a role-specific detail/action difference. Do not use the final request for the advertised `DELETE /holds/301` recovery: it is state-changing and has not received a separate recovery review.

The count is 39 of 40, including the malformed request 18. Capture the result of request 40, then return the final draft and actual Observation ids for one last write-payload reconciliation. No Product mutation remains authorized.

## Capture-supported facts

| Capture | Actual Actor / Surface | Journey | Approved Observation fact |
|---|---|---|---|
| 26 | Reader / `POST /holds` | Reserve a book | Repeating the reservation of book 101 returned 409 `Already reserved`. |
| 27a | Reader / `GET /holds` | Reserve a book | The Reader holds collection listed hold 301 for River Atlas (101). |
| 27b | Reader / `GET /holds` | Cancel a reservation | Hold 301 advertised `DELETE /holds/301` as its cancellation action. |
| 28 | Librarian / `POST /desk/returns` | Check in a book | Submitting an empty body after book 103 had already been checked in returned 422 `Book is required`. |
| 29 | Librarian / `POST /desk/returns` | Check in a book | Repeating check-in for book 103 returned 409 `Book is already checked in`. |
| 30a | Reader / `GET /books/:id` | Check in a book | The Reader saw Night Trains (103) available after the Librarian check-in. |
| 30b | Reader / `GET /books/:id` | Reserve a book | The available Night Trains (103) detail advertised Reader `POST /holds` with `bookId` 103. |
| 31 | Reader / `POST /loans/:id/renew` | Renew a loan | Renewing loan 201 returned renewals 1 and due date 2026-10-15. |
| 32 | Reader / `GET /loans/:id` | Renew a loan | After renewal, loan 201 showed renewals 1, due 2026-10-15, and both renewal and return actions. |
| 33 | Reader / `POST /loans/:id/renew` | Renew a loan | Repeating renewal of loan 201 returned 409 `Renewal limit reached`. |
| 34 | Reader / `GET /loans/:id` | Renew a loan | After the rejected renewal repeat, loan 201 still showed renewals 1 and due 2026-10-15. |
| 35 | Reader / `POST /loans/:id/return` | Return a book | Returning loan 201 reported `Book returned` for book 102 and linked `/catalog` and `/loans`. |
| 36 | Reader / `POST /loans/:id/return` | Return a book | Repeating the return of loan 201 returned 404 `Loan not found`. |
| 37 | Reader / `GET /loans` | Return a book | After the return, the Reader loans collection was empty and said `No loans`. |
| 38 | Reader / `GET /catalog` | Return a book | After the return, the Reader catalog showed book 102 available; 101 and 103 were also available. |
| 39 | Reader / `POST /loans/:id/renew` | Renew a loan | Renewing loan 201 after it was returned returned 404 `Loan not found`. |

## Required catalog/payload corrections

1. Reuse existing canonical ids where present. Before the Observation batch, add only missing route-pattern Surfaces: `DELETE /holds/:id`, `POST /loans/:id/renew`, and `POST /loans/:id/return`.
2. Add the newly reached tasks as Journeys if the public catalog does not already contain them: `Cancel a reservation`, `Renew a loan`, and `Return a book`. `Review a loan` describes inspecting loan 201; it does not make the separately named renewal and return tasks indistinguishable.
3. Keep captures 28 and 29 in their actual order after C2/C4. Their bodies must not imply that validation or repeat happened before the successful check-in.
4. Capture 27's advertised DELETE action is a supported fact, but its successful, repeated, and readback outcomes remain untried because recovery mutation was explicitly withheld.
5. Capture 30 is Reader evidence. Do not relabel it as Librarian merely because it followed the Librarian's check-in; request 40 is the separate Librarian readback.

## Remaining work after request 40

The only deliberately untried exposed Product action is cancellation of hold 301. Record its discovery and state that its mutation was excluded from this first pass because the 40-request budget is exhausted and no separate recovery review authorized it. After capturing request 40, reconcile all newly returned Observation ids against these facts and the earlier 27-fact batch; do not import captures as Evidence until the intended links are verified.

No Product request or Perquiro write was made during this review.
