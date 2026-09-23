# Librarian exploration summary

## Scope and request count

This execution used the `Librarian` Actor only, on Product-version selection `unknown`. No Product version was displayed.

- Reader's preceding execution used 24 Product requests.
- This Librarian execution made 10 new Product requests: captures `025` through `034`.
- Cumulative Product requests are 34 of 40; six remain. This stays below the 12-request Librarian allowance and leaves at least four requests for a later fresh Reader execution.

The final Knowledge catalog reports 14 Surfaces, three Journeys, 57 Observations, and 17 Evidence items. This execution added one Surface, 19 Observations, and ten Evidence items. It added no Journey.

## Recorded Librarian Knowledge

The root response is recorded for Librarian in Observation `724dbb51-1cda-4208-bd71-631e87146170`, with Evidence `b488577f-18d0-4c2a-af96-f41d7ed81c1b`. It offered documentation, catalog, account, and service-desk links. The Librarian followed all four links, with recorded reached Looks on the root Surface.

`GET /desk` Surface `723464dd-6ff4-4cb5-967e-39641907c9b0` is accessible to Librarian. Its inventory Observation `677fbd9b-8c6f-4f3c-86b2-1172da6adb1b` and Evidence `1bcc1c22-6fed-4537-9c67-86ec3312e963` show a `Check in a book` action to `POST /desk/returns` and `Pending returns` containing Night Trains, book `103`. The advertised JSON is `{ "bookId": "103" }`.

Before the only check-in Product write, attempting Observation `b1e2bc5f-cb60-48fb-8df3-b918ad9507d5` was accepted and authorized. The dispatched request used numeric `bookId` `103` and returned `404 Not Found` with `{ "error": "Book not found" }`. Its exercised outcome is Observation `5ca1d29a-4551-4b5c-9426-0850bb7776ff`; the reached endpoint is newly recorded Surface `POST /desk/returns`, id `af73d4d1-4c26-407e-9f04-577a78dc495e`, with inventory Observation `e9ba40dd-336d-464e-892a-2676848623b4`. Evidence `038098e0-ce94-478c-8bda-56783f8e4408` supports both records. A fresh `GET /desk` still listed the same pending return, saved as Observation `3d5bea43-4df3-4414-863c-3153a0c9969f` with Evidence `43259201-0981-475c-b31b-115bf6e7fb0a`.

`GET /docs` confirms that actions advertise their HTTP method and JSON fields, and that an empty object is valid when no fields are shown. Its Librarian inventory is Observation `66c6f6df-46f1-4b21-bd6b-26801e4245e3`, supported by Evidence `db8562a2-51c0-4b57-9c32-f45d9bb29592`.

`GET /catalog` returned River Atlas (101) and Garden Notes (102) as available and Night Trains (103) as unavailable, with a `q` title-search field. This is Observation `189fcf6c-b4a8-4859-9d42-6f108a0cff47`, Evidence `1f09113a-e3e9-43fa-9179-0e3391f2e6c1`. Following Night Trains reached `GET /books/103`; Observation `0b3df177-a470-475d-8cc1-2ab845dd472e` and Evidence `c938ab6c-91d3-4639-bb24-79d2e992a0ea` show it is unavailable and advertises `POST /holds` with `{ "bookId": "103" }` for Reader.

`GET /account` reported actor Librarian and offered reservation and loan links: Observation `595cb567-3754-44bc-a458-5bb5c436636f`, Evidence `62f75f2f-e953-47bc-84d9-fe81c2c64189`. Both account links were followed. `GET /holds` returned `No reservations` (Observation `25fc1993-445c-4126-83d2-977f2f7cd950`, Evidence `9816a606-14a8-46f6-a869-ec4cb40ade22`), and `GET /loans` returned `No loans` (Observation `e25b3582-78cd-4cc0-a34c-e97cd308eef6`, Evidence `5feaf9d4-657c-41e4-bce7-71e98869dbf7`).

## Accounted attempts, limitations, and remaining work

The numeric check-in attempt is accounted for with its saved `404` outcome. There are no unresolved or pending accepted Librarian attempts.

The advertised string-body check-in request was not sent. After the `404` outcome had been stored as exercised, a later attempt to save a non-execution reconciliation was rejected because that attempt was already resolved; the replacement attempt was then rejected because no recorded reconciliation existed. These were MCP recording rejections only and made no additional Product requests. The records establish the observed mismatch and unchanged pending return, but do not establish the result of posting the exact advertised string body.

No Product behavior is recorded as a Finding. No install was needed. There were no open Reviews or pending Follow-on work during orientation.

A later Reader execution has six remaining shared Product requests and must keep Actor fixed to Reader. Its useful remaining work includes the Reader catalog-detail link checks that the earlier summary identified. A later Librarian walk, if authorized and its recovery state permits, could inspect the desk again and determine how to cover the exact string-body check-in request without repeating the recorded numeric attempt.
