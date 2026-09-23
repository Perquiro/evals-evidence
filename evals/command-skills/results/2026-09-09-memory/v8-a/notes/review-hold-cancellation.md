# Hold-cancellation amendment review

## Decision

Do not approve the cancellation mutation yet. The priority and arithmetic are sound, but the amendment does not yet meet the Explore checklist, mapping, and ordering requirements for the newly advertised action.

## Confirmed

- Request 26 is a real Reader `GET /holds` readback that advertises `DELETE /holds/301` as a recovery action. Treating it as a new state-changing action is correct.
- The budget is correct: 26 requests have run, ten remain protected, and four non-reserved requests remain. Replacing the four unperformed check-in requests with the cancellation branch preserves the 40-request cap and the one-quarter reserve.
- Deferring check-in is a concrete capacity disposition. D10 and request 23 retain the pending-return and pre-check-in Reader state without the cancellation branch changing either one.

## Required fixes

1. Add a full outcome row for `Cancel a reservation / Reader DELETE /holds/:id`. It must cite hold 301 as the starting state and specify:
   - first `DELETE /holds/301` for the cancellation outcome;
   - no body or offered-choice rule, if the action capture has none;
   - repeat DELETE after a successful state-changing cancellation as the unavailable and repeat branch;
   - the actual access disposition. If request 26 does not advertise a role boundary, say so. If it labels cancellation for Reader, add the required available-Actor entry comparison or retain that cell as untried with its capacity reason;
   - `GET /holds` readbacks and any response-linked recovery route.

2. Name the canonical Surface `DELETE /holds/:id`, separate from `GET /holds` and `POST /holds`. Add `Cancel a reservation` as the Journey when the action is walked. Its ordered Surface sequence should include the Reader holds entry/readback, the DELETE endpoint, and the final holds readback. Associate the DELETE response with the DELETE Surface and each collection response with `GET /holds`.

3. Replace the broad four-request statement with an exact gated order that fits the four available requests. For example: first DELETE, immediate holds readback, repeat DELETE only after the first request actually succeeds and changes state, then final holds readback. If the first DELETE fails or leaves the hold unchanged, read the collection before marking repeat blocked and do not send a second DELETE merely to fill the plan. Inspect a recovery offered by either DELETE response before later variants.

4. In the amended checklist, mark the check-in validation, successful check-in, desk readback, and Reader consumer readback individually untried because the non-reserved capacity was allocated to the newly advertised cancellation recovery. Keep the concrete preserved state and the later evidence-review reserve reason. Do not leave the old scheduled check-in cells appearing complete.

After these text changes, return the cancellation plan for the limited re-review before dispatching `DELETE /holds/301`.

## Limited re-review

Do not approve the DELETE yet. The amendment now has the required full cancellation row, `DELETE /holds/:id` Surface, `Cancel a reservation` Journey, exact normal-path order, and individual capacity dispositions for all four displaced check-in cells.

Add one failure gate. If request 27 fails or request 28 shows that hold 301 remains, requests 29 and 30 are skipped. The plan then has two non-reserved requests left, so it cannot keep claiming that cancellation consumed all four. State that the coordinator returns those freed requests for focused review before any check-in mutation. The review can either approve a complete, safe next branch that fits them or retain them unused with the observed response and a concrete reason. Do not automatically begin a partial check-in path.

Also state that a response-linked action from request 27 or 29 pauses the later variant and returns for reviewer-approved allocation. The ten protected requests remain unavailable until the later evidence review; an unadvertised recovery must not silently consume them.

After these two conditional dispositions are added, the cancellation amendment is safe to begin.

## Final micro-recheck

Approved. If the first DELETE does not remove hold 301, the plan returns the unused capacity for focused review. If either DELETE exposes another recovery action, the plan pauses before a later variant and requires reviewer allocation.

The cancellation amendment is safe to begin within the 40-request cap.
