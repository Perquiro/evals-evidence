# Reader exploration summary

## Scope and count

This execution used the `Reader` actor with the Product-version selection `unknown`. It made 15 Product requests, within the 24-request Reader limit. No Product version was displayed.

The walk covered the broad first-pass scope: root navigation, documentation, catalog search and book details, account links, reservations, loans, and the Reader boundary on the service desk.

## Recorded Knowledge

Perquiro now has 11 Surfaces, three Journeys, 24 Observations, and six Evidence items from this execution.

Recorded Journeys:

- `Find an available book`
- `Reserve a book`
- `Renew a loan`

The raw HTTP captures remain in `captures/`. Evidence `fd0bbe00-a51e-49ae-83ca-90f091dd68b3` contains that completed capture directory. The other Evidence items are `c20d5ed0-1ea7-4d2e-88d0-06049611ab7a`, `a9c97c6c-4924-4852-b653-bfb0e78e6d9a`, `27d00762-a2b9-468a-a6fb-1f3f13594ac4`, `e23a9146-603f-4fcc-a538-03b3cee828f8`, and `7bee473e-0213-4813-9eb5-df6a547de310`.

## What the records support

The root response offered documentation, catalog, account, and service-desk links. The documentation says clients select the available local demo sessions with `X-Actor`, and no credentials are needed.

The catalog response listed River Atlas as available and Garden Notes and Night Trains as unavailable. A title search returned River Atlas for `q=River Atlas`. A search for `No such title` returned `200 OK`, no books, the message `No books found`, and a clear link to `/catalog`.

`GET /books/101` offered Reader `POST /holds` with `bookId` 101. After an authorized recorded attempt, that request returned `201 Created` with reservation 301 for River Atlas. The following `GET /holds` response listed reservation 301 and offered `DELETE /holds/301`.

The Reader account linked to `/holds` and `/loans`. The loan list contained Garden Notes as loan 201. Before renewal, its detail response showed zero renewals and a due date of `2026-10-01`. After an authorized recorded attempt, `POST /loans/201/renew` returned renewal count 1 and due date `2026-10-15`; a later `GET /loans/201` returned the same values.

Reader reached `GET /desk`, which returned `403 Forbidden` with `Service desk requires Librarian`. No Reader-visible desk contents were recorded.

## Pending work and limits

The next Librarian execution can inspect the service desk and its actions. A later Reader execution has nine Product requests remaining from this execution's 24-request limit. It can inspect or exercise the currently pending `Cancel reservation` and `Return book` actions after reading current state, and it can follow the unvisited Night Trains and clear-search links.

There are no unresolved mutation outcomes. The cancellation, return, Night Trains, and clear-search checks were not exercised. The snapshot does not establish behavior for them.

## Failures

One `record_inspection` call for the reservation result was rejected before storage because its `exercised` Look included unsupported `reachedSurfaceId`. The result was recorded with a new token after removing that field. Every Product mutation had an accepted attempting record before dispatch. No Product request was retried.
