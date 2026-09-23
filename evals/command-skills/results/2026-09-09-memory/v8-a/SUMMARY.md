# Willow Library Explore — first pass

## Boundary

- Product: Willow Library at the local synthetic URL from Setup.
- Actors used: Reader and Librarian.
- Product version: unknown; the Product did not display one.
- Product HTTP requests: 30 of the human's 40-request cap; ten requests remained unused.
- Product mutations issued: Reader renewed loan 201 once, reserved River Atlas once, and cancelled reservation 301 once. Repeat and invalid actions returned observed errors.
- Perquiro Knowledge: 13 Surfaces, 6 Journeys, 30 Observations, and 2 Evidence items, reconciled through the Project bridge.

## Knowledge prepared

Recorded Surfaces: Root; Documentation; Catalog; Book detail; Account; Reservations (`GET /holds`); Reserve book (`POST /holds`); Loans; Loan detail; Service desk; Check in a book (`POST /desk/returns`); Renew loan (`POST /loans/:id/renew`); Cancel reservation (`DELETE /holds/:id`).

Recorded Journeys: Find a book; View loans; Reserve a book; Check in a book; Renew a loan; Cancel a reservation.

The walk observed that Reader and Librarian receive the same loan-detail controls, labelled for Reader. Reader renewed Garden Notes loan 201 from zero to one renewal and moved its due date from 2026-10-01 to 2026-10-15; a second renewal returned `Renewal limit reached`. An empty reservation request returned `Book is required`; unavailable Garden Notes returned `Book is unavailable`; River Atlas reservation 301 succeeded; a repeated reservation returned `Already reserved`. Cancellation returned `Reservation cancelled`; a repeated cancellation returned `Reservation not found`.

## Covered read-only paths

Discovery covered root, documentation, catalog, two book details, account, empty reservations, loans, Reader service-desk denial, and Librarian service-desk entry. The coordinator added loan detail for both Actors, successful and empty catalog search with `GET /catalog` recovery, and Reader book 103 detail before check-in.

## Pending work

Untried actions: loan return; Reader action-level check-in access; Librarian check-in validation and success; post-check-in desk and Reader-book readbacks; repeated check-in; and final catalog consumer readback. These were deferred by the reviewed budget prioritization; no untried branch is claimed covered.

## Coordination and files

- Discovery worker: 10 read-only Product requests; ledger and captures in `notes/discovery.md`.
- Reviewer: plan reviews in `notes/review-plan.md`, `notes/review-plan-second.md`, `notes/review-plan-final.md`, and `notes/review-loan-amendment.md`.
- Coordinator plans: `notes/coordinator-plan.md`, `notes/loan-amendment.md`, and `notes/hold-cancellation-amendment.md`.
- Evidence: `3704fa5d-c316-4f2d-8f85-e65270cd7191` links discovery captures to ten Observations; `cd8b89a6-d8a3-4a45-917a-c2bc099f64d2` links coordinator captures to twenty Observations.
- Coordination overhead: discovery assignment; plan, amendment, cancellation, and evidence reviews; host thread-limit failures before the loan and cancellation amendments; a host-interrupted wait; and reviewer-capacity waits. None counts as Product work.

## Next step

Knowledge now supports Create for the recorded Journeys. Continue Explore to cover the named untried check-in and loan-return branches when their request budget is available.
