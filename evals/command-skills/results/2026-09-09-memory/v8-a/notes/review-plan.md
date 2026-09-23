# Explore plan review

## Decision

Revise the checklist before the coordinator sends a Product request. The proposal has the right broad paths and preserves the pending return, but it is not yet the outcome checklist required for an Explore walk.

## Checklist coverage

1. The table is a request sequence, not a per-action outcome checklist. Before a mutation, add a row for each discovered action and fill every column with a concrete request, a cited discovery row, or `not applicable` with a Product or scope reason. At minimum cover:
   - Reader catalog search, including successful search, no-results recovery, and why any input, role, repetition, or unavailable-state cells do not apply.
   - Reader reservation through `POST /holds`, including the required `bookId` check, a successful reservation, the unavailable-book result, repeat or limit result, response-linked recovery, and collection or detail readback.
   - Librarian check-in through `POST /desk/returns`, including its required input, Reader action access result, Librarian success, post-consumption unavailable or repeat result, and readbacks.
   - Loan detail after request 11. If it advertises an action, add that action and its full outcome row before treating the loan path as covered.

2. The plan does not dispose of the declared-choice cells for either POST action. If the action payloads name a fixed book rather than a choice rule, record that as `not applicable` and cite the action payload. If a response presents a choice rule, test one offered but invalid choice with all other inputs valid. Do not use speculative identifiers.

3. Request 13 promises to check the no-results search's offered recovery, but it cannot name that request until the no-results response is read. Reserve capacity for the response-linked action, place it immediately after request 13, and leave the cell pending until it is observed. The same rule applies to a recovery or detail link returned by requests 11, 16, 18, 19, 20, 23, or 25. A later discovery review must not turn an unknown recovery into an unsupported `not applicable`.

4. Preserve the initial facts as separate rows in the evidence map. In particular, D03 and D05 establish that books 102 and 103 were unavailable before the walk; D07 establishes empty Reader holds; and D10 establishes the pending return. The final book, catalog, hold, and desk readbacks explain later states and are not duplicates of those starting observations.

## Ordering and state safety

1. The reservation order is unsafe. Request 19 tests book 102 only after a successful reservation and repeat attempt for book 101. If active holds have a limit, the response for book 102 could report that limit rather than the availability-dependent outcome the plan claims to test. Test book 102 while holds are still empty, after request 15. Then inspect its response and the immediate hold readback for a recovery or cancellation route before attempting the book 101 success path. If the book 102 request itself creates a hold that prevents the success path, use its newly advertised recovery route or record the concrete budget or scope blocker. Do not assume that no limit exists because D07 showed an empty collection.

2. Keep request 14 before the Librarian check-in. It correctly captures the Reader-visible unavailable state of book 103 while the return remains pending. Keep request 21 before request 23. It correctly checks Reader action access before the Librarian consumes the pending return. Keep request 22 before request 23 as well.

3. Request 11 must be a decision point. A loan detail may expose a state-changing recovery action. Read it before unrelated mutations, add its row, and perform any checks that rely on the current loan state before a terminal action can remove that state. The current phrase "if any" leaves every outcome cell for that action blank.

4. Requests 18 and 20 should be explicit response readbacks, not closure assumptions. If the reservation response or collection exposes a hold detail, cancellation, or other action, follow it while its prior state still exists. Apply the same check to the final desk response before closing the check-in journey.

## Actors, Surfaces, and Journeys

1. D04 advertises the reservation action specifically for Reader. Add a Librarian read of its entry point, such as `GET /books/101`, before the Reader reservation mutation. Compare the offered controls with D04. The Reader `POST /desk/returns` test at request 21 is useful for the service-desk action, but it does not test the separately advertised Reader reservation boundary. A permission response for an action cannot substitute for this entry-point comparison.

2. Name the canonical API Surfaces explicitly by method and route. The proposed map must distinguish at least `GET /holds` from `POST /holds`; the latter is absent from the named list even though it carries the reservation mutations. Keep `GET /desk` separate from `POST /desk/returns`, and use route patterns for `GET /books/:id` and `GET /loans/:id`. Catalog searches can remain observations on `GET /catalog` if the route is unchanged and the query distinguishes the factual result.

3. Give the facts an actual Journey link where they are part of a task. `Find a book` should cover catalog search and selected book detail; `Reserve a book` should cover book detail, `POST /holds`, and the resulting hold readback; `View loans` should include the loan collection and detail; and `Check in a book` should include the service-desk entry, the Reader and Librarian action results, and Reader-visible post-check-in readbacks. Root, documentation, and navigation facts may remain Surface-only when they are not part of a walked task. Do not attach a POST response to its GET collection Surface.

4. The final Reader reads of book 103 and the catalog are appropriate consumer readbacks for the Librarian check-in. Record their actual Reader actor and their own GET Surfaces. Record the initiating Librarian on the check-in response. Keep the D09 Reader denial on `GET /desk` distinct from the Reader POST access result on `POST /desk/returns`.

## Request budget

Discovery consumed 10 requests. The ordered requests numbered 11 through 27 are 17 requests, so the stated plan is 10 discovery + 17 planned + 10 protected reserve = 37 requests. Three requests are presently unallocated.

The plan's references to "20 additional Product requests" and the review question that adds 20 planned requests do not match the 17-row sequence. Replace them with the actual arithmetic. The ten-request reserve is one quarter of the human's 40-request cap and must remain protected until the later evidence review. The three unallocated requests may cover the missing Librarian entry-point comparison and other reviewer-approved gaps without using the reserve. Any response-linked recovery actions, corrections, or final readbacks must be counted against the protected reserve, and the combined total must remain at or below 40.

## Required revision before walking

Publish a revised table with the rows and dispositions above, reorder the reservation branch so a hold limit cannot mask the unavailable-book result, add the Librarian reservation entry-point comparison, and correct the arithmetic. Then return the revised checklist for review before the first Product mutation.
