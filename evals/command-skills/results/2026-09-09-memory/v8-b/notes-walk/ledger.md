# Coordinator walk ledger

Requests 11–16 are read-only; combined Product requests are 16 of 40.

| Row | Actor | Method / locator | Factual result | Capture |
|---|---|---|---|---|
| W11 | Reader | `GET /catalog?q=River` | Returned River Atlas 101, available, linked at `/books/101`, and retained the `q` search field. | `11-search-match-reader.json` |
| W12 | Reader | `GET /catalog?q=not-a-real-title` | Returned no books and the message `No books found`; it offered recovery at `/catalog`. | `12-search-empty-reader.json` |
| W13 | Reader | `GET /catalog` | Following the offered recovery restored the full catalog: 101 available; 102 and 103 unavailable. | `13-search-clear-reader.json` |
| W14 | Reader | `GET /loans/201` | Loan 201 for Garden Notes had zero renewals, due `2026-10-01`, and advertised Reader `POST /loans/201/renew` and `POST /loans/201/return`. | `14-loan-201-reader.json` |
| W15 | Librarian | `GET /account` | Librarian account linked `/holds` and `/loans`. | `15-account-librarian.json` |
| W16 | Librarian | `GET /holds` | Librarian could open the holds entry point, which was empty and exposed no reservation action. | `16-holds-librarian.json` |
