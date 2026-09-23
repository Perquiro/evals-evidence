# Limited final plan recheck

## Decision

Do not begin the Product walk yet. The revised plan resolves the requested decision-gate and Surface-locator corrections, but the protected-reserve blocker disposition is incomplete for the early response-linked contingencies.

## Confirmed corrections

- Reservation now gates request 19 on the observed book 102 state, gates request 20 on an actual successful 101 reservation, and records a blocker instead of treating an attempted request as success.
- Check-in now gates Librarian validation and success on the Reader action-access result. It requires immediate desk and Reader-book readbacks if the Reader request changes the pending return, and gates the repeat request on actual Librarian success.
- The canonical Surface map now uses explicit method-and-route locators, including `GET /`, `GET /docs`, `GET /account`, `GET /holds`, `POST /holds`, `GET /desk`, and `POST /desk/returns`.
- The main request accounting remains valid: 10 discovery + 18 core + 10 protected + 2 unallocated = 40.

## Required small corrections

1. Add the concrete capacity blocker to the loan-detail and no-results paths. Their rows pause for a newly exposed action, but neither says what happens if the two unallocated requests and protected reserve cannot cover the action and its required outcome checks. State that the coordinator records the actual response and the unfinished branch with the concrete capacity blocker, then does not continue as though the recovery was checked. This was the remaining protected-reserve disposition from the second review.

2. Make request 21 conditional on request 19 succeeding. If the book 102 branch blocks the 101 path, request 17 is the readback for the actual resulting state. Request 21 is labelled a post-101 readback and must be skipped or explicitly repurposed with a factual reason, rather than implying that a 101 result exists.

After those two text edits, the plan is safe to begin the Product walk. No additional Product requests are needed for this recheck.

## Micro-recheck

Approved. The Find a book and View loans rows now require the coordinator to record the actual response and a concrete capacity blocker when response-linked checks cannot fit. Request 21 now runs only after a successful request 19 and otherwise records that request 17 is the readback for the actual state.

The plan is safe to begin the Product walk within the stated 40-request cap.
