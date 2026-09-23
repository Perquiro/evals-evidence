# Librarian exploration summary

Actor: Librarian (`a6b0d017-9e46-4e87-8ccf-ce5bc5b3fccf`)

Product-version selection: unknown. The Product did not display a version.

## Covered

- Read the catalog, book details, account, holds, loans, loan details, and service desk as Librarian.
- Confirmed that Librarian has no holds and one loan: Garden Notes (loan `201`, due `2026-10-01`, with zero renewals).
- Exercised title search. `River Atlas` returned one result; an unknown title returned no books, the message `No books found`, and a clear link to `/catalog`.
- Recorded `Service desk` (`GET /desk`) and `Check in book` (`POST /desk/returns`) as new Surfaces.
- Completed the new `Check in a book` Journey. The desk offered book `103` as pending return; `POST /desk/returns` returned `Book checked in`; a follow-up `GET /books/103` reported Night Trains as available.

## Product request accounting

Reader had already used 15 of the shared 40 Product requests. This Librarian execution used 16 Product requests: 15 reads and one authorized `POST /desk/returns` mutation. The shared total is 31 requests used, leaving **9**.

## Recorded Knowledge

The final catalog contains 9 Surfaces, 5 Journeys, 29 Observations, and 9 Evidence items. No Evidence was imported in this execution. There are no open Reviews or Follow-on work.

## Remaining work

Reader-only advertised actions remain for a separate execution: reserve a book, renew loan `201`, and return loan `201`. The Librarian session did not invoke those actions because their Product responses named Reader as the Actor.

The next workflow step is Create, which can propose coverage from the five recorded Journeys once a human chooses to proceed.
