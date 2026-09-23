# Coordinator outcome checklist and request order

Scope: Willow Library Explore, synthetic local Product, shared cap of 40 Product HTTP requests.

Discovery used 10 read-only requests. The revised core walk proposes 18 additional requests. Ten requests (one quarter of the total cap) remain protected for reviewer-approved response-linked recovery, evidence correction, and final readbacks, leaving two unallocated requests before that reserve. The combined maximum is 40.

## Reusable discovery evidence

`discovery.md` rows D01-D10 establish navigation, sessions, starting catalog and holds state, reserve actions, Reader service-desk denial, and Librarian service-desk entry. Those responses will be carried into Knowledge without repeating their Product reads.

## Per-action outcome checklist

| Task / action / Actor | Starting state and dependencies | Successful result | Missing required input or invalid offered choice | Unavailable Product state | Access difference | Repeated action or visible limit | Recovery and result readback |
|---|---|---|---|---|---|---|---|
| Find a book / Reader `GET /catalog?q=` | D03 gives the catalog and title-search entry. | Request 13 searches `River Atlas`. | No required parameter is advertised; `q` is the single stated search field, so invalid choice is not applicable until a response declares a rule. | Request 14 searches `No such title`; its response determines the recovery route. | No catalog role distinction is advertised. | GET has no stateful repeat or visible limit. | Immediately inspect the no-results response; use one of the two unallocated requests for its offered recovery if present. If capacity cannot cover its required checks, record the actual response and unfinished branch with the concrete capacity blocker, and do not continue as though recovery was checked. |
| View loans / Reader `GET /loans/:id` | D08 lists loan 201. | Request 11 reads `/loans/201`. | No request input beyond its discovered link. | No unavailable loan state is advertised. | No role distinction is advertised for this entry. | GET has no stateful repeat or visible limit. | If the detail response offers any action, add a separate row and return it to review before a mutation. If capacity cannot cover its required checks, record the actual response and unfinished branch with the concrete capacity blocker, and do not continue as though recovery was checked. Otherwise record that the response exposes no recovery action. |
| Reserve a book / Reader `POST /holds` | D07 is an empty hold collection; D04 advertises reserve for available 101 and D05 for unavailable 102. Preserve empty holds until requests 15–17. | After the unavailable-book branch and its immediate readback/recovery disposition, request 19 reserves 101. | Request 15 posts `{}`. The advertised payloads use fixed `bookId` values and declare no choice rule, so a separate invalid offered-choice check is not applicable unless a response declares one. | Request 16 posts `{bookId:"102"}` while holds are empty, then request 17 reads holds before any 101 reservation. | Request 12 reads `/books/101` as Librarian and compares the offered entry point with Reader's D04 advertisement. | Send request 20 only if request 19 actually succeeds; then it tests the repeat/limit outcome. | If 102 or its hold readback blocks a meaningful 101 success and offers no recovery, record that state and retain 101 success/repeat as blocked. If 19 is not successful, capture it and return the unfinished success/repeat branch for focused review. Use an unallocated request or protected reserve only for a response-linked recovery, and record the concrete blocker if capacity cannot cover it. |
| Check in a book / `POST /desk/returns` | D10 gives Librarian's pending return 103. Request 18 preserves Reader's pre-check-in unavailable view; request 22 tests Reader action access while the return is pending. | Request 24 sends Librarian `{bookId:"103"}` only if request 22 leaves the return pending. | Request 23 sends Librarian `{}` first. The advertised payload has a fixed id and no declared choice rule. | Send request 25 only after successful Librarian check-in; it tests post-consumption unavailability. | D09 is Reader's denied `GET /desk`; request 22 separately checks Reader's POST action access. | Request 25 is the repeated request and post-consumption unavailable branch only after request 24 succeeds. | If request 22 succeeds or changes the pending-return state, immediately read the desk and Reader book 103, record that actual outcome, and retain Librarian success/repeat as blocked by the changed state. If 24 fails, read the desk before any repeat; if it exposes a response-linked action needed for the new state, perform it before request 25 if capacity permits. Record a concrete blocker rather than proceeding on an assumption. |

## Ordered remaining walk

| Order | Actor | Request | Purpose / outcome cell | Prerequisites protected |
|---:|---|---|---|---|
| 11 | Reader | `GET /loans/201` | Read loan detail. If it offers an action, pause mutations for a new reviewed row. | No state changed. |
| 12 | Librarian | `GET /books/101` | Reservation entry-point comparison with D04. | No state changed. |
| 13 | Reader | `GET /catalog?q=River%20Atlas` | Successful title search. | No state changed. |
| 14 | Reader | `GET /catalog?q=No%20such%20title` | No-results search; immediate recovery disposition. | No state changed. |
| 15 | Reader | `POST /holds` `{}` | Required-input validation while holds remain empty. | Holds still empty. |
| 16 | Reader | `POST /holds` `{bookId:"102"}` | Availability-dependent reservation while holds are empty. | Do this before any hold can trigger a limit. |
| 17 | Reader | `GET /holds` | Immediate result readback and recovery/action discovery for 102. | Preserve the resulting hold state. |
| 18 | Reader | `GET /books/103` | Starting unavailable state before Librarian check-in. | Night Trains remains pending return. |
| 19 | Reader | `POST /holds` `{bookId:"101"}` | Reserve available River Atlas only if 102 leaves a usable state or its recovery has restored one. If blocked, record the concrete state and stop this branch. | First 101 outcome is subject for repeat only if it succeeds. |
| 20 | Reader | Repeat `POST /holds` `{bookId:"101"}` | Visible repeat/limit outcome only after request 19 actually succeeds; otherwise retain this cell as blocked and return it for focused review. | First 101 request succeeded. |
| 21 | Reader | `GET /holds` | Post-101 collection readback only if request 19 succeeded; otherwise skip it because request 17 is the actual-state readback and record that disposition. | Preserve any response-linked recovery action. |
| 22 | Reader | `POST /desk/returns` `{bookId:"103"}` | Reader action-level access difference. If it succeeds or changes state, read desk and Reader book 103 immediately, record it, and do not assume a pending return remains. | Night Trains is pending at dispatch, from D10. |
| 23 | Librarian | `POST /desk/returns` `{}` | Required-input validation only if request 22 left Night Trains pending; otherwise retain as blocked by Reader's observed changed state. | Night Trains remains pending. |
| 24 | Librarian | `POST /desk/returns` `{bookId:"103"}` | Successful check-in only if request 22 left the return pending. If it fails, read desk before deciding whether a repeat is meaningful. | Must precede unavailable/repeat branch. |
| 25 | Librarian | Repeat `POST /desk/returns` `{bookId:"103"}` | Unavailable/repeated check-in branch only after request 24 succeeds and any response-linked action for its new state is resolved. | The pending return is consumed by a successful request 24. |
| 26 | Librarian | `GET /desk` | Service-desk final readback and recovery/action discovery. | None. |
| 27 | Reader | `GET /books/103` | Reader-visible availability readback after Librarian check-in. | None. |
| 28 | Reader | `GET /catalog` | Catalog-level consumer readback after check-in. | None. |

The 18-request walk leaves all 10 protected requests and two unallocated requests. The protected reserve will be used only for reviewer-approved gaps, response-linked recovery actions, failed/retry reconciliation, and final public Knowledge readbacks. If an action response offers a new recovery route, it ranks before speculative variants.

## Proposed Knowledge map

- `GET /`, `GET /docs`, `GET /catalog`, `GET /books/:id`, `GET /account`, `GET /holds`, `POST /holds`, `GET /loans`, `GET /loans/:id`, `GET /desk`, and `POST /desk/returns` are distinct API Surfaces by method/route.
- Journeys expected from grounded paths: Find a book; Reserve a book; View loans; Check in a book.
- Every discovery and walk response becomes a separate factual Observation under the Surface actually reached, actual Actor, and appropriate Journey. State-changing request outcomes are distinct from their later collection/detail readbacks.

## Review questions

1. Does every exposed action have a grounded successful, invalid, unavailable, access, repeat, and readback disposition, or a concrete reason that an outcome does not apply?
2. Does the order preserve initial empty holds, the Night Trains pending-return state, and Reader-vs-Librarian comparisons before the mutations consume them?
3. Are 18 planned remaining requests plus 10 protected and two unallocated requests within the 40-request cap after discovery's 10?
