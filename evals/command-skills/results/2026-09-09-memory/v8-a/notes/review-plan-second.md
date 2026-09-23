# Second Explore plan review

## Decision

Do not approve the plan yet. It resolves several first-pass findings, but three state-changing branches still need a safe disposition for an unexpected response before the coordinator walks them.

## Resolved from the first pass

- The revised table now gives catalog search, loan detail, reservation, and check-in their own outcome rows. It supplies dispositions for non-applicable input, access, repetition, and unavailable-state cells.
- The unavailable book 102 branch now runs while Reader holds are empty, with an immediate `GET /holds` readback before the book 101 path.
- `GET /books/101` as Librarian is scheduled before mutation to compare the Reader-only reservation entry point.
- The plan keeps the pre-check-in book 103 read, Reader check-in access request, Librarian required-input validation, and final Reader consumer readbacks in a safe relative order when their preceding calls have the expected non-mutating outcomes.
- The arithmetic is now correct: 10 discovery + 18 core requests + 10 protected reserve + 2 unallocated requests = 40.
- The Knowledge map now separates `GET /holds` from `POST /holds`, and separates the desk GET and POST endpoints. Change `Account` to `GET /account`, and give Root and Documentation their explicit GET locators before recording, so every API Surface follows the method-and-route convention.

## Remaining corrections

1. The Reader action-access check at request 22 can consume the only pending return if the Product unexpectedly accepts it. Its current prerequisite, "Night Trains still pending return," is an assumption rather than protection. Add a decision point after request 22:
   - If Reader is denied and the return remains pending, continue with Librarian requests 23 and 24.
   - If Reader succeeds or changes the pending-return state, immediately read the affected desk and Reader book state, record the actual access outcome, and mark the unperformed Librarian-success and repeat cells with that concrete state blocker. Do not send requests 23 through 25 as though the return were still pending.

   A safer access probe may be possible only if the actual action contract shows a non-consuming request that still tests the Reader boundary. Do not invent one.

2. Requests 19 and 20 assume that the book 102 branch leaves a usable state and that the first book 101 request succeeds. The plan says to use recovery only when it is advertised, but it has no disposition when book 102 creates a hold with no recovery route, or when request 19 has a non-success outcome. Add explicit gates:
   - After requests 16 and 17, inspect the 102 result and the current holds. If its state blocks a meaningful 101 success test and no authorized recovery is offered, record that state and retain the success/repeat cells as blocked for that reason.
   - Send request 20 only after request 19 actually succeeds. If request 19 fails or has a different outcome, capture that result and return the unfinished success/repeat branch for focused review. A request attempt does not complete the repeat cell.

3. Apply the same gate to check-in. Request 25 is a valid repeat and post-consumption check only after request 24 actually succeeds. If request 24 fails, read the resulting desk state before deciding whether a second request is meaningful. Also inspect a response-linked action from request 24 before request 25 when it depends on the just-created state; the recovery rule ranks it ahead of later variants.

4. The loan-detail and no-results contingencies are otherwise safe: both pause mutations and allocate capacity for a response-linked action. The revised checklist should state that the coordinator records the concrete blocker if the protected reserve cannot cover all required checks, rather than silently proceeding to a later mutation.

## Approval condition

Revise the three decision gates above and the remaining Surface locator names, then submit the corrected checklist for the limited recheck. No Product request should be made before then.
