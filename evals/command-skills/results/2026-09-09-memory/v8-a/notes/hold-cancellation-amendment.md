# Hold-cancellation amendment at request 26

Request 26 (`GET /holds` as Reader) is the reviewed post-reservation readback. It returned reservation 301 for River Atlas and newly advertised a recovery action: `DELETE /holds/301` through `cancel`.

This is a new state-changing action, distinct from `GET /holds` and `POST /holds`. Per the approved plan and Explore workflow, it must be reviewed before dispatch and ranks ahead of later state-changing branches.

## Canonical mapping and outcome checklist

`DELETE /holds/:id` is a distinct canonical Surface from `GET /holds` and `POST /holds`. If cancellation is walked, `Cancel a reservation` is a Journey of Reader `GET /holds`, `DELETE /holds/:id`, and final Reader `GET /holds`. The DELETE response belongs to the DELETE Surface; each collection response belongs to the GET Surface.

| Task / action / Actor | Starting state and dependencies | Successful result | Missing required input or invalid offered choice | Unavailable Product state | Access difference | Repeated action or visible limit | Recovery and result readback |
|---|---|---|---|---|---|---|---|
| Cancel a reservation / Reader `DELETE /holds/:id` | Request 26 shows Reader reservation 301 for River Atlas with `DELETE /holds/301`. | Request 27 sends `DELETE /holds/301`. | The action capture exposes no body or offered-choice rule. | Request 29 repeats the DELETE only if request 27 succeeds and removes 301. | Request 26 does not label cancellation for an Actor or advertise a role boundary, so no actor comparison applies to the exposed control. | Request 29 is the repeat/unavailable check only after a state-changing successful first cancellation. | Request 28 immediately reads holds. Request 30 is the final collection readback only after request 29; inspect any response-linked recovery before a later variant. If request 27 fails or 301 remains, request 28 is the actual readback, repeat is blocked by that observed state, and requests 29–30 are not sent merely to fill the plan. |

## Exact gated four-request order

| Request | Actor | Request | Gate and purpose |
|---:|---|---|---|
| 27 | Reader | `DELETE /holds/301` | First cancellation outcome. |
| 28 | Reader | `GET /holds` | Immediate state readback after 27. |
| 29 | Reader | repeat `DELETE /holds/301` | Send only if 27 succeeded and 28 confirms 301 was removed; otherwise mark repeat blocked by 27–28 state and return the freed capacity to the reviewer for reprioritization. |
| 30 | Reader | `GET /holds` | Send only after 29, recording its actual recovery or unavailable result. |

## Current budget and displaced work

- Actual Product requests: 26 of 40.
- The approved remaining core work was requests 27–30: Librarian invalid and successful check-in, Librarian desk readback, and Reader book 103 readback.
- Ten requests remain protected for evidence-review corrections and final readbacks. Four non-reserved requests remain.

A minimum direct cancellation walk requires `DELETE /holds/301`, a `GET /holds` result readback, and a repeated DELETE or other unavailable-state check only if the successful DELETE changes state. That consumes capacity intended for the first successful check-in journey, whose pending state and Reader consumer have already been preserved at requests 23 and D10.

Proposed priority: use the four non-reserved requests in the exact gated order above; defer all four unperformed check-in requests. Do not use the protected ten-request reserve before the evidence review. Record the exact cancellation facts and the deferred Check in a book cells if approved. If cancellation does not succeed, request 28 reads current holds before repeat is blocked and the freed capacity returns to the reviewer for reprioritization. If either DELETE response exposes another recovery action, pause before any later variant and obtain reviewer allocation for that action.

The check-in branch remains untried from its discovered initial state: D10 showed Librarian pending return 103, and request 23 showed Reader that book 103 was unavailable before any check-in. The following cells are individually untried because the newly offered cancellation recovery consumes the four non-reserved requests while ten remain protected for evidence review: Librarian missing-input validation; Librarian successful check-in; Librarian `GET /desk` readback; and Reader `GET /books/103` consumer readback. It is deferred solely because the newly offered cancellation recovery takes priority under the Explore workflow and the 40-request cap preserves the protected reserve.
