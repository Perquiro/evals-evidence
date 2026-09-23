# Reader exploration summary

## Scope and count

This Reader-only execution used the Product-version selection `unknown`. It made the full 24 Product requests allowed before handoff. No Product version was displayed.

The prior summary is preserved as `SUMMARY-READER-INTERRUPTED.md`. This summary includes the continuation.

## Recorded Knowledge

Perquiro now has 13 Surfaces, three Journeys, 38 Observations, and seven Evidence items.

Recorded Journeys:

- `Find an available book`
- `Reserve a book`
- `Renew a loan`

Raw HTTP captures `001-root.http` through `024-catalog-cleared.http` remain in `captures/`. Evidence `8e4868a3-d020-4408-8cde-8c01d9fbf830` imports the completed capture directory for the continuation. Earlier captures are also retained in Evidence `fd0bbe00-a51e-49ae-83ca-90f091dd68b3` and the five smaller Evidence items listed in `SUMMARY-READER-INTERRUPTED.md`.

## What the records support

The root response offered documentation, catalog, account, and service-desk links. The documentation says clients select the available local demo sessions with `X-Actor`, and no credentials are needed.

The catalog listed River Atlas, Garden Notes, and Night Trains. It supports title searches and returned `No books found` for the recorded absent-title query. Clearing that query later returned River Atlas and Garden Notes as available and Night Trains as unavailable.

Reader reserved River Atlas with `POST /holds`, which returned `201 Created` and reservation 301. After a fresh `GET /holds` confirmed reservation 301 and offered its cancellation, an accepted attempting record authorized `DELETE /holds/301`. That request returned `200 OK` with `Reservation cancelled`. A later `GET /holds` returned no holds and `No reservations`.

Reader renewed Garden Notes loan 201 from zero renewals and due date `2026-10-01` to renewal count 1 and due date `2026-10-15`. After a fresh read confirmed the return action, an accepted attempting record authorized `POST /loans/201/return`. It returned `200 OK` with `Book returned` for book 102. A later `GET /loans` returned no loans and `No loans`. A later `GET /books/102` returned Garden Notes as available.

`GET /books/103` returned Night Trains as unavailable. Both it and Garden Notes offered Reader `POST /holds` with their book id. The records do not establish the result of reserving either of those titles.

Reader reached `GET /desk`, which returned `403 Forbidden` with `Service desk requires Librarian`. No Reader-visible desk contents were recorded.

## Pending work and handoff

There are no unresolved Reader mutation outcomes and no remaining Reader Product requests in this execution. The specific `Cancel reservation`, `Return book`, search, and clear-search checks are recorded as accounted for.

The catalog's River Atlas, Garden Notes, and Night Trains link Looks remain pending because their earlier and later detail reads were saved as independent observations rather than attributed link outcomes. Their observed detail bodies are durable Knowledge, but the link checks themselves are not accounted for.

The next execution should use the `Librarian` actor to inspect the service desk and any actions it offers. It should read current state before any mutation. Three recorded Journeys are available for later Create work.

## Failures

One earlier `record_inspection` call for the reservation result was rejected before storage because its `exercised` Look included unsupported `reachedSurfaceId`. The result was then recorded with a new token after removing that field. Every Product mutation had an accepted attempting record before dispatch. No Product request was retried.
