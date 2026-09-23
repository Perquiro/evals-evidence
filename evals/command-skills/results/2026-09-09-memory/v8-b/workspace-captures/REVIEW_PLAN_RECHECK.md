# Recheck of the amended pre-mutation walk plan

## Decision

**Approved only for the read-only discovery gates, requests 11--16, with the restrictions below. H1 at request 17 is not yet cleared.** The amended plan fixes the first-pass allocation failures: it gives S2 a recovery slot, adds the Librarian account comparison, gives H2 an immediate conditional readback, inventories hold recovery, and requires a separate recheck for loan actions. The core maximum is still 20 coordinator requests (11--30) after 10 discovery requests, with requests 31--40 reserved.

The plan must not treat the word "action" in S2 or A1 as authority to make an unknown state-changing request during its read-only gate. A response-discovered non-GET action needs an exact amended row and this reviewer's recheck before dispatch. A GET recovery/entry may proceed as part of the gates.

## Item-by-item recheck

| Item | Recheck decision | Reason / required handling |
|---|---|---|
| Request budget | Approved. | Discovery is 10; slots 11--30 permit at most 20 more; 31--40 remain unavailable until the evidence review directs gaps or final readbacks. Keep the ledger's combined count based on actual sent HTTP requests; a skipped conditional slot does not become an extra request. |
| S1, request 11 | Approved as read-only. | It is the grounded matching-search check from D03. Save the response and add any returned action/link to the checklist. |
| S2, requests 12--13 | Conditionally approved as read-only only. | Request 12 is the grounded no-results search. If it advertises a **GET** recovery link, request 13 may follow it and record the result. If it advertises a non-GET recovery action, do not dispatch it at 13: capture the advertisement, add its exact branch, and return it for recheck before any mutation. If it advertises no recovery, retain the response-supported disposition. |
| L1, request 14 | Approved as read-only. | It preserves loan 201 while discovering its real action(s), input rules, recovery, and terminal dependencies. It does not authorize a loan mutation. Every action it exposes must receive an exact L2 row and a recheck before it is used. |
| A1, requests 15--16 | **Text correction required before the gates.** | `GET /account` as Librarian at 15 is a valid entry-point comparison. The phrase "follow the returned holds entry/action" is too broad: request 16 may follow only a returned **GET entry/detail**. If the response advertises a POST or other mutation, record the access/disposition and stop that branch for an exact amended plan and recheck; do not call the action as part of A1. This preserves H1 as the first planned Product mutation. |
| H1, request 17 | Pending the gate conditions below. | The empty-object validation remains a grounded, non-terminal first mutation, but it may occur only after the coordinator has classified the gate results and confirmed no preceding gate changed Product state. |
| H2, requests 18--19 | Approved in the planned order after H1. | H2 retains the unavailable book 102 state until its action. If H2 accepts or links a changed resource, 19 must read that resource or `GET /holds` before H3. If H2 rejects without a link, retain the exact response as the no-readback disposition. |
| H3, request 20 | Approved after H2's actual disposition. | Run only after the conditional H2 readback, when required, has separated book 102's effect from the book 101 success. |
| H4, requests 21--23 | Partly approved; state-changing recovery needs a gate. | The repeat at 21 and `GET /holds` inventory at 22 are correctly ordered. If 22 exposes a GET recovery, it may run at 23. If it exposes a state-changing recovery, do not invoke it from the generic "use one" instruction: add the exact route, Actor, required state, success/repeat/readback order, and consumer effect, then submit it for recheck before mutation. |
| C1--C4, requests 24--28 | Approved subject to the H4 gate. | Required-field validation, Librarian success, immediate repeat/unavailable check, then Reader catalog and loan readbacks preserve the known 103 state and name the correct performer and consumer. If an earlier newly advertised mutation is deferred, it must not displace these requests without a revised numbered plan. |
| L2, requests 29--30 | Approved as a future review gate, not as authority to act. | The plan now correctly requires exact action rows and this reviewer's recheck before a disclosed loan mutation. At recheck, the coordinator must either fit all applicable branches in the remaining slots or retain every untried branch with its concrete response- and budget-based reason; two generic slots cannot silently close an action matrix. |
| Later evidence review | Retained. | This reviewer remains responsible for the evidence/draft pass after the walk. That review will check each capture-to-Observation mapping, initial versus final states, actual Actor and Surface, all outcome cells, and untried branches. It does not release reserve requests early. |

## Exact requirements before H1 at request 17

1. Execute only the read-only requests 11--16: S1; S2 and a recovery only when it is GET; L1; A1's Librarian account entry and a returned GET entry/detail only.
2. Save each response, update the local checklist and ledger with its actual Actor, method, locator, advertised actions, starting/result state, and whether a recovery/access disposition was reached.
3. Correct A1 to prohibit following a state-changing action at request 16. If S2, L1, or A1 reveals a non-GET action, do not send it; add an exact row and obtain this reviewer's recheck first.
4. Confirm from the gate captures that no Product state was changed and that book 102 remains unavailable, holds remain in their known initial state, loan 201 still exists, and desk return 103 is still pending. If a response contradicts a required starting state, stop and re-plan before H1.
5. Reconcile the actual request count. Provided steps 1--4 hold, the coordinator may dispatch the already reviewed `POST /holds {}` as Reader for H1. If any gate consumes a mutation, exposes a new stateful action needed before H1, or changes a required state, H1 stays blocked until the amended order returns for recheck.

No Product request was made and no Perquiro Knowledge was written during this recheck.
