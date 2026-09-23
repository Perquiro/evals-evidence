# Evidence review of the Willow Library draft

## Decision

**The capture-supported batch below is approved for Perquiro recording after the listed draft corrections. It does not close the walk.** The draft must stop describing H1 and H2 as already recorded: `record_inspection` authorizes dispatch, but it is not a Surface, Journey, or Observation write. The malformed request 18 has no response capture and is not recordable as Product Knowledge.

The actual Product count is 25 of 40: 10 discovery requests, 14 captured walk requests, and the uncaptured malformed dispatch at request 18. Fifteen requests remain for reviewer-directed gaps and final readbacks. The local walk ledger is stale at request 16 and must be expanded to include requests 17--25 and the malformed request 18 before recording.

## Capture and disposition review

| Capture / row | Actual Actor and route | Review disposition |
|---|---|---|
| D01 | Reader `GET /` | Supported. Record root identity/local disposable environment and its returned navigation as separate facts if both are retained. |
| D02 | Reader `GET /docs` | Supported. Record the `X-Actor` Reader/Librarian instruction and no-credentials condition; do not infer authorization outcomes beyond the document. |
| D03 | Reader `GET /catalog` | Supported. Record the initial 101/102/103 availability and the advertised title-search entry as separate facts. |
| D04 | Reader `GET /account` | Supported. Record the returned holds and loans links. |
| D05 | Reader `GET /desk`, 403 | Supported. Record the exact Reader desk-entry denial. |
| D06--D07 | Reader `GET /books/101`, `GET /books/102` | Supported. Record each Reader-labelled reservation advertisement separately, retaining 101's available and 102's unavailable state that distinguishes the actions. |
| D08--D09 | Reader `GET /holds`, `GET /loans` | Supported. Record the initial empty holds state and loan 201 listing separately. |
| D10 | Librarian `GET /desk` | Supported. Record pending return 103 and the advertised check-in action as separate facts. |
| W11 | Reader `GET /catalog?q=River` | Supported. Record the matching River Atlas result and detail link. |
| W12--W13 | Reader empty search, then `GET /catalog` | Supported. Record the no-results message/clear link and the successful clear recovery as separate facts. |
| W14 | Reader `GET /loans/201` | Supported. Record loan 201's zero-renewal/due state, the Reader renewal advertisement, and the Reader return advertisement as separate facts. |
| W15--W16 | Librarian `GET /account`, `GET /holds` | Supported. Record the Librarian account/holds entry result and the holds response's empty/no-reservation-action disposition. This is the actual role-entry comparison; it does not prove a direct `POST /holds` denial. |
| W17 / H1 | Reader `POST /holds {}`, 422 | Supported. Record the exact required-input outcome: `Book is required`. It is proposed now, not already recorded through inspection. |
| Request 18 | Reader malformed `POST /holds`, no body/response capture | Do **not** record an Observation. Keep it only in the local coordination ledger as an uncaptured, unresolved Product request. |
| W19 | Reader `GET /holds` | Specific duplicate disposition: it again returned no reservations after the helper failure and supplies no new user-facing Product fact beyond D08. It supports the local reconciliation only; do not use it to claim an observed response for request 18. |
| W20 | Reader `GET /books/102` | Specific duplicate/precondition disposition: it reconfirms D07's unavailable state and the same Reader reservation advertisement before the fresh H2 request. Do not write it as a second unchanged book-detail Observation. |
| W21 / H2 | Reader `POST /holds {"bookId":"102"}`, 409 | Supported. Record the exact unavailable-state outcome: `Book is unavailable`. It is proposed now, not already recorded through inspection. |
| W22 / H3 | Reader `POST /holds {"bookId":"101"}`, 201 | Supported. Record that the request created hold 301 for River Atlas and linked the holds collection. Do not claim the hold collection contains it until a later `GET /holds` capture does so. |
| W23 / C2 | Librarian `POST /desk/returns {"bookId":"103"}`, 200 | Supported. Record that check-in reported `Book checked in` for 103 and returned `/books/103`. |
| W24 / C4 catalog | Reader `GET /catalog` | Supported. Record Reader's post-check-in catalog state: 103 is available, while 101 is available and 102 remains unavailable. This readback occurred after C2, before the still-untried C3 repeat; state that actual order. |
| W25 / C4 loans | Reader `GET /loans` | Supported. Record that loan 201 remained listed after C2. This also occurred before C3. |

## Exact approved Observation batch

Use the existing canonical Surface ids where the public catalog already has them; otherwise record the exact route-pattern Surfaces below. `Surface-only` means no Journey is appropriate because the fact is navigation or role-entry context rather than a user task. Each numbered line is one Observation, with the listed actual Actor, Surface, and Journey.

| # | Actual Actor | Canonical Surface | Journey | Approved factual body |
|---|---|---|---|---|
| 1 | Reader | `GET /` | Surface-only | `GET /` identified Willow Library as a local disposable development service with synthetic data. |
| 2 | Reader | `GET /` | Surface-only | The root linked `/docs`, `/catalog`, `/account`, and `/desk`. |
| 3 | Reader | `GET /docs` | Surface-only | The documentation instructed clients to select the Reader or Librarian demo session with `X-Actor` and stated that no credentials are needed. |
| 4 | Reader | `GET /catalog` | Browse the catalog | The initial catalog listed River Atlas (101) as available and Garden Notes (102) and Night Trains (103) as unavailable. |
| 5 | Reader | `GET /catalog` | Search the catalog | The catalog advertised title search at `GET /catalog?q=<title>`. |
| 6 | Reader | `GET /account` | Surface-only | The Reader account linked reservations at `/holds` and loans at `/loans`. |
| 7 | Reader | `GET /desk` | Check in a book | `GET /desk` returned 403 with `Service desk requires Librarian`. |
| 8 | Reader | `GET /books/:id` | Reserve a book | Available River Atlas (101) advertised Reader `POST /holds` with `bookId` 101 to reserve the book. |
| 9 | Reader | `GET /books/:id` | Reserve a book | Unavailable Garden Notes (102) advertised Reader `POST /holds` with `bookId` 102 to reserve the book. |
| 10 | Reader | `GET /holds` | Reserve a book | The Reader's initial holds response was empty and said `No reservations`. |
| 11 | Reader | `GET /loans` | Review a loan | The Reader's initial loans response listed Garden Notes as loan 201. |
| 12 | Librarian | `GET /desk` | Check in a book | The Librarian desk listed Night Trains (103) as a pending return. |
| 13 | Librarian | `GET /desk` | Check in a book | The Librarian desk advertised `POST /desk/returns` with `bookId` 103 to check in Night Trains. |
| 14 | Reader | `GET /catalog` | Search the catalog | Searching for `River` returned available River Atlas (101) and its `/books/101` detail link. |
| 15 | Reader | `GET /catalog` | Search the catalog | Searching for `not-a-real-title` returned no books, `No books found`, and the `/catalog` clear link. |
| 16 | Reader | `GET /catalog` | Search the catalog | Following the search clear link restored the full catalog with 101 available and 102 and 103 unavailable. |
| 17 | Reader | `GET /loans/:id` | Review a loan | Loan 201 for Garden Notes had zero renewals and a due date of 2026-10-01. |
| 18 | Reader | `GET /loans/:id` | Review a loan | Loan 201 advertised Reader `POST /loans/201/renew` with no JSON fields. |
| 19 | Reader | `GET /loans/:id` | Review a loan | Loan 201 advertised Reader `POST /loans/201/return` with no JSON fields. |
| 20 | Librarian | `GET /account` | Surface-only | The Librarian account linked `/holds` and `/loans`. |
| 21 | Librarian | `GET /holds` | Reserve a book | The Librarian could open an empty holds collection, and that response exposed no reservation action. |
| 22 | Reader | `POST /holds` | Reserve a book | Submitting `POST /holds` with an empty JSON body returned 422 `Book is required`. |
| 23 | Reader | `POST /holds` | Reserve a book | Submitting `POST /holds` with `bookId` 102 while Garden Notes was unavailable returned 409 `Book is unavailable`. |
| 24 | Reader | `POST /holds` | Reserve a book | Submitting `POST /holds` with `bookId` 101 created hold 301 for River Atlas and linked `/holds`. |
| 25 | Librarian | `POST /desk/returns` | Check in a book | Checking in book 103 returned 200 `Book checked in` and linked `/books/103`. |
| 26 | Reader | `GET /catalog` | Check in a book | After the Librarian check-in, the Reader catalog showed book 103 available, with 101 available and 102 unavailable. |
| 27 | Reader | `GET /loans` | Check in a book | After the Librarian check-in, the Reader loans response still listed loan 201. |

## Draft corrections required before recording

1. Replace each grouped row in `EVIDENCE_DRAFT.md` with the individual supported Observation rows above. The existing groupings blur multiple facts, Actors, Surfaces, and Journeys.
2. Replace `API root`, `API documentation`, `Catalog`, `Book detail`, `Reserve book`, and `Check in book` in the write payload with the canonical route-pattern Surfaces (`GET /`, `GET /docs`, `GET /catalog`, `GET /books/:id`, `POST /holds`, and `POST /desk/returns`). `Reserve a book` and `Check in a book` are Journey names, not API Surface names.
3. Remove both claims that H1 or H2 is “already recorded through inspection outcome.” Add them to the approved Observation batch only after resolving/creating the canonical surfaces and journeys. Preserve request 18 as a local unresolved-attempt note, not Evidence or Knowledge.
4. Update `notes-walk/ledger.md` through request 25, including H1, malformed request 18, W19/W20 duplicate dispositions, H2, H3, C2, and the two Reader readbacks. Keep actual sequence: C2 and C4 occurred without C1/C3, and H3 occurred without H4.
5. Before Perquiro writes, compare the final payloads against all 27 approved lines, record one fact per call, retain actual Actors, and then attach returned Observation ids to the ledger. Do not import the response captures as Evidence unless the final Observation ids and intended links have been checked.

## Remaining exposed branches and state/order conflicts

| Branch or conflict | Status and required next check |
|---|---|
| H4 repeat and resulting holds state | Untried after successful hold 301. Before any cancellation/terminal recovery, repeat Reader `POST /holds` with `bookId` 101, then `GET /holds` to establish the hold state and inventory every recovery action. Follow the returned `/holds` link from W22. |
| Hold recovery | Unknown until the H4 holds readback. If it advertises a state-changing recovery, draft its exact Actor, route, prerequisite, success/repeat/readback, and consumer effect, then have this reviewer recheck it before dispatch. |
| C1 required input | Untried. The planned C1-before-C2 order was missed; an empty-body `POST /desk/returns {}` now observes validation after check-in, not the original pending-return state. Capture and word it with that actual starting state. |
| C3 repeat / unavailable state | Untried. The planned immediate C3-before-C4 order was missed. Retry `POST /desk/returns` with `bookId` 103, capture its actual response, and do not claim W24/W25 came after that retry. Re-read a relevant Reader result if the retry changes state. |
| Check-in resource link | W23 linked `/books/103`, but only the catalog was read. Follow `GET /books/103` to capture its resulting detail state and any newly advertised action. |
| L2a renewal | Untried. W14 supplies a no-fields validation disposition. Before terminal return, perform renewal, read loan detail, repeat renewal, and read detail again to establish its visible limit or repeat result. |
| L2b return and unavailable branches | Untried. Only after renewal repeats, return loan 201, capture the returned resource/result, try the actual return-repeat/unavailable branch, read the Reader loans and catalog results, and test the previously advertised renewal route after return if needed to distinguish its unavailable state. |
| H3 and C2 order deviations | The factual success captures remain recordable, but they do not close their planned repeat/recovery/validation cells. Do not state that H4 or C1/C3 completed. |

Use the remaining 15 requests for these gaps and their result readbacks. After each newly exposed recovery or response-dependent action, update the ledger and return only that concrete branch for recheck before a state-changing dispatch. This reviewer must recheck the corrected branch set and the final write payload/returned ids before final Knowledge reconciliation.

No Product request, Perquiro write, or Evidence import was made during this review.
