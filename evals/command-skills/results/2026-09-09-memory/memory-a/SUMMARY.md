# Reader Explore summary

Actor: Reader (`61409925-dde8-4f75-9801-942d22518b3d`). Product-version selection: unknown. Scope: the requested first-pass exploration of Willow Library, with one Actor only.

## Covered

Recorded seven Surfaces: Catalog (`GET /catalog`), Book details (`GET /books/:id`), Create hold (`POST /holds`), Holds (`GET /holds`), Account (`GET /account`), Loans (`GET /loans`), and Loan details (`GET /loans/:id`).

Recorded four Journeys: Reserve book, Cancel hold, Search catalog, and View loan details.

Reader saw three catalog books. River Atlas was available; Garden Notes and Night Trains were unavailable. Searching with `q=River` returned only River Atlas. Reader could reserve River Atlas; `POST /holds` returned hold 301, and `DELETE /holds/301` returned `Reservation cancelled`. The subsequent holds read was empty with `No reservations`.

Garden Notes was unavailable but still offered the reserve action. `POST /holds` with book 102 returned HTTP 409 and `Book is unavailable`. Reader's account linked to Holds and Loans. Loan 201 for Garden Notes showed zero renewals, due 2026-10-01, and offered Renew loan and Return book actions.

## Checks

Accounted-for checks: the available-book reservation and cancellation. The unavailable-book request was saved as an exercised action with observation `c39621dc-a46b-412a-91dd-128b95792d73`.

Pending checks: Renew loan and Return book on Loan details, both supported by `fc2f27f8-9dc1-4eb1-971e-2a345cf468ee`. Perquiro also still lists the separately named `Reserve unavailable book` rule as pending, supported by `45c31841-e71d-40f6-a8d1-d1b5d7c5c3c7`; the matching 409 action outcome is stored separately. No blockers or unresolved outcomes are recorded.

The Product trace used 15 of the shared 40-request budget, leaving 25 requests for a later Actor-specific execution.

## Evidence

- `5f030843-6d3f-4ef5-8320-dfbffe02b859`: Reader catalog response.
- `06357f4f-70fc-492a-8a9c-b4241a3fbe4f`: available River Atlas details and reserve action.
- `f9786615-9cce-4871-9af2-efa5a8d51eff`: successful hold creation response.
- `7fbc0a2d-b0df-4e14-a048-ab419fb2c51a`: hold 301 with its cancel action.
- `c8759e72-7045-4d5b-ad6b-5e3266bc8cd0`: cancellation response.
- `4290e2e6-79a6-4b11-9eee-131be475e7ea`: unavailable-book 409 response.
- `19bbba46-84e0-4489-9144-19fda8d6a8c8`: Reader account links.
- `5528e0a2-78bb-4357-b9e7-91b304be2b67`: Reader loans list.
- `24ffe363-7785-4779-b869-09545101992f`: loan 201 details and actions.

## Remaining work

Use Librarian in a separate execution to map the librarian-only session and its offered actions. A later Reader execution can exercise renewal and return, and inspect Book 103 plus search edge cases. This Reader execution did not take those actions to preserve the shared request budget.

## Workflow note

After the first unavailable-book reservation returned an error, an error-handler command accidentally sent the same POST a second time without a newly accepted attempting record. That second request also returned HTTP 409 and did not create a hold. It is an unaccounted Product mutation attempt and a workflow failure; it is included in the 15-request total.

## Next step

Knowledge now contains Journeys that Create can propose coverage for. Before Create, run the separate Librarian Explore execution if its perspective is needed for the intended scenarios.
