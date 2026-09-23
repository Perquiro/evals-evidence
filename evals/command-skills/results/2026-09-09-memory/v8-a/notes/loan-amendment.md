# Loan-detail amendment before mutations

Product requests 11–15 were read-only: loan detail, Librarian reservation entry, successful search, no-results search, and its `GET /catalog` recovery. Request 11 exposed two Reader actions not present in discovery:

## Canonical mapping and outcome checklist

`POST /loans/:id/renew` and `POST /loans/:id/return` are distinct from `GET /loans/:id`. `Renew a loan` will be a Journey of loan detail, renewal endpoint, and loan-detail readback. `Return a loan` is a named untried task; no return Surface or Journey is recorded until it is reached.

| Task / action / Actor | Starting state and dependencies | Successful result | Missing required input or invalid offered choice | Unavailable Product state | Access difference | Repeated action or visible limit | Recovery and result readback |
|---|---|---|---|---|---|---|---|
| Renew a loan / Reader `POST /loans/201/renew` | Request 11 observed loan 201 with `renewals: 0`, due `2026-10-01`, and a Reader-labelled action. | Request 17. | No payload is advertised, so required-input and offered-choice checks are not applicable. | No unavailable state is advertised; record any response-provided state instead of guessing. | Request 16 reads the loan-detail entry point as Librarian and compares both Reader-labelled renewal and return controls. | Request 18 only after 17 succeeds. | Request 19 reads the same loan after the first outcome or blocked first attempt; inspect any response-linked recovery before later mutations. |
| Return a loan / Reader `POST /loans/201/return` | Request 11 observed the Reader-labelled action on loan 201. | Untried. | Untried: it has no advertised payload, but its response is unknown. | Untried: the current loan is still present. | Request 16 is the Librarian loan-detail comparison for both Reader-labelled loan actions; no separate return-action probe fits the non-reserved budget. | Untried: return is terminal and no state may be consumed without its result readback. | Untried because the 40-request cap preserves ten requests for post-walk evidence review and correction; the remaining 15 non-reserved requests prioritize renewal readback, holds branches, and the successful check-in journey. |

This replaces the previous remaining request order. It uses exactly 15 Product requests, bringing the total to 30 before the protected ten-request reserve:

| Request | Actor | Request | Gate / purpose |
|---:|---|---|---|
| 16 | Librarian | `GET /loans/201` | Compare both Reader-labelled renewal and return controls at their shared detail entry point. |
| 17 | Reader | `POST /loans/201/renew` | First renewal; retain the inspected precondition and request capture locally for the later evidence review. |
| 18 | Reader | repeat `POST /loans/201/renew` | Only if 17 actually succeeds and no response-linked recovery takes precedence. |
| 19 | Reader | `GET /loans/201` | Post-outcome renewal readback; it also records a concrete blocker if 17 did not succeed. |
| 20 | Reader | `POST /holds` `{}` | Required field validation. |
| 21 | Reader | `POST /holds` `{bookId:"102"}` | Initially unavailable-book branch while holds are empty. |
| 22 | Reader | `GET /holds` | Immediate 102 outcome readback/recovery discovery. |
| 23 | Reader | `GET /books/103` | Preserve initial unavailable state before check-in. |
| 24 | Reader | `POST /holds` `{bookId:"101"}` | Only if 102 leaves a usable state or its recovery restores one. |
| 25 | Reader | repeat `POST /holds` `{bookId:"101"}` | Only if 24 succeeds. |
| 26 | Reader | `GET /holds` | Only if 24 succeeds; otherwise 22 is actual state readback. |
| 27 | Librarian | `POST /desk/returns` `{}` | Required field validation. |
| 28 | Librarian | `POST /desk/returns` `{bookId:"103"}` | Successful check-in. |
| 29 | Librarian | `GET /desk` | Final desk readback. |
| 30 | Reader | `GET /books/103` | Reader consumer readback after check-in. |

The earlier final `GET /catalog`, the Reader `POST /desk/returns` access probe, and repeated post-check-in request are deferred. The direct Reader `GET /books/103` readback, D09 Reader service-desk denial, and D10 Librarian service-desk entry are retained as the grounded check-in access evidence. The two deferred action-level branches are explicitly untried because adding the required renewal entry comparison and post-renewal detail readback consumes the 15 non-reserved requests; the ten-request protected reserve remains intact. Any covered action that exposes a recovery route consumes an unallocated/protected request only after reviewer confirmation; if capacity cannot cover its required checks, record the actual response and specific capacity blocker without treating recovery as covered.
