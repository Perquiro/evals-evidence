# Remainder-branch review

## Decision

**Approved with one correction:** run the listed branches in the order below, use a fresh exact `record_inspection` authorization before every POST, and do not dispatch a hold recovery mutation. Add the previously advertised renewal endpoint after the terminal return when capacity remains, so its unavailable-state outcome is distinct from the return-repeat outcome.

The public Knowledge count (11 Surfaces, 5 Journeys, 36 Observations) is consistent with the already approved batch having been recorded. This review authorizes only further Product observation; every resulting fact and final write payload returns to this reviewer for a final evidence-to-record recheck.

## Item-by-item order review

| Order | Actual Actor / exact action | Decision and state requirement |
|---|---|---|
| 26 | Reader `POST /holds` with `{"bookId":"101"}` | Approved. This is the required repeat of the successful hold action and must happen before any cancellation/recovery. Inspect and authorize this exact repeat, then capture its actual result. |
| 27 | Reader `GET /holds` | Approved after the repeat. It follows W22's `/holds` link, establishes whether hold 301 is present, and inventories each hold/hold-detail recovery action. |
| Recovery discovered at 27 | Actual Actor/route only after the capture | No mutation is approved. Record any advertised recovery as an untried branch with its actual Actor, route, and starting state. A GET recovery may be considered only after its capture is reviewed; a POST or other state-changing recovery needs a separate concrete plan and recheck. |
| 28 | Librarian `POST /desk/returns` with `{}` | Approved. C1 was missed before C2, so this now observes the required-input result after check-in. Its factual body must name that actual later state; do not represent it as a pre-check-in validation. |
| 29 | Librarian `POST /desk/returns` with `{"bookId":"103"}` | Approved after C1. This is the required repeat/unavailable branch after the successful check-in. Capture the actual result. |
| 30 | Librarian `GET /books/103` | Approved after the repeat. Follow W23's returned resource link as the changing Actor. Record the detail state and any newly advertised action; do not dispatch a new action merely because the detail exposes it. |
| Conditional 31--32 | Reader `GET /catalog`, Reader `GET /loans` | Run immediately only if C1 or C3 reports a change. They are the consumer readbacks after the repeat branch. If neither changes state, W24/W25 remain the only existing Reader check-in readbacks and these two requests remain available. |
| Next | Reader `POST /loans/201/renew` | Approved only while the current detail/action remains advertised. It is the initial renewal result. Obtain fresh authorization, then capture its response. No-body validation is already a response-supported not-applicable disposition from W14. |
| Next | Reader `GET /loans/201` | Approved after the first renewal. It must show the changed loan state and current advertised actions before the repeat. |
| Next | Reader `POST /loans/201/renew` | Approved after the first renewal detail readback. This repeat must occur before the terminal return; inspect and authorize the exact repeat. |
| Next | Reader `GET /loans/201` | Approved after the renewal repeat. Capture the visible repeat result/limit and current state. |
| Next | Reader `POST /loans/201/return` | Approved only after the renewal-repeat readback establishes that loan 201 remains returnable. It is terminal; capture its response and every returned link. |
| Next | Reader `POST /loans/201/return` | Approved immediately after the terminal return as the return repeat/unavailable branch. It must precede final collection readbacks. |
| Next | Reader `GET /loans`, Reader `GET /catalog` | Approved after the return repeat. These are the Reader consumer readbacks for the returned loan and book 102's catalog state. |
| Correction: if capacity remains | Reader `POST /loans/201/renew` | Required to close the renewal unavailable-state branch after loan 201 is terminal. It is distinct from retrying `POST /loans/201/return`; inspect and authorize it as the exact already advertised renewal route, then capture its actual unavailable result. |

## Budget and adaptation rules

The fixed actions above use 13 requests when C1/C3 do not change Product state: hold repeat and readback (2), C1/C3/book detail (3), renewal and its two detail readbacks (4), then return/repeat/final Reader readbacks (4). That leaves two of the 15 requests for the corrected post-return renewal check and one response-dependent readback or reviewer-directed gap.

If C1 or C3 changes state, spend the two conditional Reader readbacks immediately. That uses all 15 requests before the corrected post-return renewal check. Stop after the final planned readbacks, document renewal-unavailable as untried because the human request budget was consumed by the changed-state consumer checks, and return the captures for recheck. Do not omit the consumer checks to make room for it.

Each inspection is authorization for only the exact reviewed method, locator, Actor, resource, and body in its row. The inspection result is not a final Observation. No recovery mutation is authorized by this document.

## Remaining facts for the final evidence pass

The final review must verify each new capture against the actual Actor and route, preserve the known ordering deviations (C1/C3 are after C2/C4), attach a distinct Observation to every meaningful result, and keep all untried recovery/action branches with their concrete reason. It must also reconcile the final Observation ids against the public catalog before Evidence import.

No Product request or Perquiro write was made during this review.
