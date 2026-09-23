# Loan amendment review

## Decision

Do not approve the amendment for mutation yet. The newly exposed loan actions need their own canonical Surfaces, Journey disposition, complete outcome rows, and a loan-detail result readback within the non-reserved request budget.

## Safe parts

- Renewal is scheduled before the untried terminal return action, so the proposed repeat can use loan 201's observed `renewals: 0` state.
- Request 17 is correctly conditional on a successful request 16 and on any response-linked recovery taking priority.
- The count is arithmetically correct: 10 discovery requests, 5 completed read-only walk requests, and 15 proposed requests total 30, preserving the ten-request reserve.
- Deferring `POST /loans/201/return` is a permitted concrete remaining branch only if the handoff retains it explicitly. It must not be described as covered.

## Required fixes

1. Add `POST /loans/:id/renew` and `POST /loans/:id/return` to the canonical Surface map. A POST action is not `GET /loans/:id`. Add `Renew a loan` as the walked Journey for the detail, renewal requests, and its result readback. Keep `Return a loan` as a named, untried task with its concrete budget disposition unless it is actually walked.

2. Replace the amendment's three-column action table with full outcome rows, or add equivalent rows to the coordinator checklist. The renewal row needs an explicit access-difference disposition based on the actual loan-detail capture. If the action is labelled for Reader, include the required Librarian entry-point comparison or record why that boundary is not advertised. The return row must state each untried outcome cell and its specific capacity reason; a general statement that other branches are allocated is not a completed disposition.

3. Schedule a `GET /loans/201` readback after the renewal outcome or outcomes and before the walk closes the renewal path. The POST responses are mutation facts. They do not replace the later detail readback required for a changed loan state. If the first renewal succeeds, preserve the repeat check first when it is meaningful, then read the loan detail and record its actual due date, renewal count, offered actions, and any recovery link. If the first renewal does not succeed, read the detail before declaring repeat blocked.

4. The amendment currently allocates all 30 non-reserved requests, so adding the required loan readback would exceed the 40-request cap while preserving the full ten-request reserve. Reprioritize one planned request into a named untried branch with a concrete reason, or revise the walk scope before mutation. Do not consume the protected reserve for this pre-evidence readback.

5. The earlier final catalog readback is now deferred. Keep that specific untried consumer branch in the final checklist, with the reason that the direct Reader `GET /books/103` readback was prioritized and the protected reserve remains intact. The direct book readback does not make the catalog's changed-list state observed.

After these changes, submit the amended checklist for a limited re-review before request 16.

## Limited re-review

Do not begin mutation yet. The amendment now provides the two POST endpoint identities, complete outcome rows, a Librarian entry-point comparison, a post-renewal detail readback, and a budget that preserves all ten protected requests. Two corrections remain:

1. The Renew a loan outcome row has stale request numbers. Its successful result says request 16, its repeat says request 17, and its access comparison says request 18. In the ordered plan, request 16 is the Librarian `GET /loans/201`, request 17 is the first renewal, request 18 is the repeat, and request 19 is the readback. Correct the row before dispatch so observations cannot be attached to the wrong Actor or Surface.

2. Request 16 reads the same loan-detail entry point that advertises both Reader-labelled actions. State explicitly that it compares the offered renewal and return controls, then use that one capture for both action rows. The current Return a loan access cell calls the comparison only a renewal allocation and leaves the return boundary ambiguous. Do not add another Product request for this correction.

Also replace the unclear phrase "after a Perquiro attempting inspection" in request 17 with its actual prerequisite or remove it. The ordered plan must not rely on an unnamed operation.

After these text-only corrections, the amended plan is safe to begin mutation within the 40-request cap.

## Micro-recheck

Do not approve yet. The request numbers now agree with the ordered plan, and request 16 explicitly compares both Reader-labelled loan controls at their shared Librarian entry point.

The new prerequisite at request 17 is still invalid: "record its inspected precondition and attempting action through Perquiro" names no Explore operation. More importantly, an attempted future action is not an Observation, and the Explore workflow requires the proposed Knowledge review before recording. Replace it with a local checklist and capture requirement: retain request 11's observed loan state and the request 17 response, then include both in the later evidence mapping and review. Do not write Perquiro Knowledge before dispatching the renewal.

After that one text correction, the amendment is safe to begin mutation within the 40-request cap.

## Final micro-review

Approved. Request 17 now retains the observed precondition and request capture locally for the later evidence review. It no longer requires a pre-dispatch Perquiro write or treats an attempted action as an Observation.

The amended walk is safe to begin mutation within the 40-request cap.
