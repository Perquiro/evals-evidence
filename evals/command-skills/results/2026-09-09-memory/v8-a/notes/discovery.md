# Willow Library discovery ledger

Scope: read-only discovery worker. Product requests are numbered; bridge reads are not Product HTTP requests.

## Captures

### R01 — Reader — `GET /`

```json
{
  "product": "Willow Library",
  "environment": "Local disposable development service. All data is synthetic.",
  "docs": "/docs",
  "links": {
    "catalog": "/catalog",
    "account": "/account",
    "serviceDesk": "/desk"
  }
}
```

### R02 — Reader — `GET /docs`

```json
{
  "authentication": "Set X-Actor to Reader or Librarian, the available local demo sessions. No credentials are needed.",
  "navigation": "Follow links and actions in responses. Actions give their HTTP method and JSON fields. An empty object is valid when no fields are listed."
}
```

### R03 — Reader — `GET /catalog`

```json
{
  "books": [
    { "id": "101", "title": "River Atlas", "available": true, "href": "/books/101" },
    { "id": "102", "title": "Garden Notes", "available": false, "href": "/books/102" },
    { "id": "103", "title": "Night Trains", "available": false, "href": "/books/103" }
  ],
  "search": { "href": "/catalog?q=<title>", "field": "q" }
}
```

### R04 — Reader — `GET /books/101`

```json
{
  "id": "101",
  "title": "River Atlas",
  "available": true,
  "actions": [
    {
      "label": "Reserve book",
      "method": "POST",
      "href": "/holds",
      "json": { "bookId": "101" },
      "actor": "Reader"
    }
  ]
}
```

### R05 — Reader — `GET /books/102`

```json
{
  "id": "102",
  "title": "Garden Notes",
  "available": false,
  "actions": [
    {
      "label": "Reserve book",
      "method": "POST",
      "href": "/holds",
      "json": { "bookId": "102" },
      "actor": "Reader"
    }
  ]
}
```

### R06 — Reader — `GET /account`

```json
{
  "links": { "reservations": "/holds", "loans": "/loans" },
  "actor": "Reader"
}
```

### R07 — Reader — `GET /holds`

```json
{
  "holds": [],
  "message": "No reservations"
}
```

### R08 — Reader — `GET /loans`

```json
{
  "loans": [
    { "id": "201", "title": "Garden Notes", "href": "/loans/201" }
  ]
}
```

### R09 — Reader — `GET /desk`

```json
{
  "error": "Service desk requires Librarian"
}
```

### R10 — Librarian — `GET /desk`

```json
{
  "checkIn": {
    "label": "Check in a book",
    "method": "POST",
    "href": "/desk/returns",
    "json": { "bookId": "103" }
  },
  "pendingReturns": [
    { "bookId": "103", "title": "Night Trains" }
  ]
}
```

## Fact ledger

| Row | Actor | Method / locator | Request | Result | Offered action or pending link | Capture path |
|---|---|---|---:|---|---|---|
| D01 | Reader | `GET /` | 1 | Willow Library identifies the local synthetic environment and exposes docs. | `/docs`, `/catalog`, `/account`, `/desk` offered. | `notes/discovery.md#r01` |
| D02 | Reader | `GET /docs` | 2 | Documentation says Reader and Librarian are supported `X-Actor` sessions with no credentials, and response actions define methods and JSON fields. | Follow response links and actions. | `notes/discovery.md#r02` |
| D03 | Reader | `GET /catalog` | 3 | Catalog lists River Atlas as available and Garden Notes and Night Trains as unavailable. | Book details at `/books/101`, `/books/102`, `/books/103`; title search at `/catalog?q=<title>`. | `notes/discovery.md#r03` |
| D04 | Reader | `GET /books/101` | 4 | The available River Atlas detail offers Reader a `POST /holds` “Reserve book” action with `bookId: "101"`. | Reserving is untried because discovery is read-only. | `notes/discovery.md#r04` |
| D05 | Reader | `GET /books/102` | 5 | The unavailable Garden Notes detail still offers Reader the same `POST /holds` “Reserve book” action with `bookId: "102"`. | Reserving is untried because discovery is read-only. | `notes/discovery.md#r05` |
| D06 | Reader | `GET /account` | 6 | Reader account exposes reservation and loan collections. | `/holds` and `/loans` offered. | `notes/discovery.md#r06` |
| D07 | Reader | `GET /holds` | 7 | Reader’s reservation collection is empty and reports “No reservations.” | No hold-detail links were offered. | `notes/discovery.md#r07` |
| D08 | Reader | `GET /loans` | 8 | Reader’s loan collection lists Garden Notes with loan detail `/loans/201`. | `/loans/201` offered. | `notes/discovery.md#r08` |
| D09 | Reader | `GET /desk` | 9 | Service-desk entry returns `{"error":"Service desk requires Librarian"}`. | The equivalent entry remains to be read as Librarian. | `notes/discovery.md#r09` |
| D10 | Librarian | `GET /desk` | 10 | Service desk lists Night Trains (`bookId: "103"`) as a pending return and offers `POST /desk/returns` “Check in a book.” | Check-in is untried because discovery is read-only. | `notes/discovery.md#r10` |

## Untried actions

- `GET /account`
- `GET /desk`
- `GET /books/101`
- `GET /books/102`
- `GET /books/103`
- `GET /catalog?q=<title>`
- `POST /holds` with `bookId: "101"` as Reader (untried; state-changing)
- `POST /holds` with `bookId: "102"` as Reader (untried; state-changing)
- `GET /loans/201` as Reader
- `POST /desk/returns` with `bookId: "103"` as Librarian (untried; state-changing)
- Reader catalog search using `/catalog?q=<title>`
- `GET /books/103` as Reader
- Reader and Librarian detail/read access comparisons outside the service desk
