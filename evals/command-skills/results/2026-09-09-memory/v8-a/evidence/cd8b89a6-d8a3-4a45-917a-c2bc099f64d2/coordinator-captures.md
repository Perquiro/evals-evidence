# Coordinator response captures

All requests used the local Product URL and the stated `X-Actor` header.

| Row | Actor | Request | Response |
|---|---|---|---|
| C11 | Reader | `GET /loans/201` | `{"id":"201","bookId":"102","title":"Garden Notes","renewals":0,"due":"2026-10-01","actions":[{"label":"Renew loan","method":"POST","href":"/loans/201/renew","actor":"Reader"},{"label":"Return book","method":"POST","href":"/loans/201/return","actor":"Reader"}]}` |
| C12 | Librarian | `GET /books/101` | `{"id":"101","title":"River Atlas","available":true,"actions":[{"label":"Reserve book","method":"POST","href":"/holds","json":{"bookId":"101"},"actor":"Reader"}]}` |
| C13 | Reader | `GET /catalog?q=River Atlas` | `{"books":[{"id":"101","title":"River Atlas","available":true,"href":"/books/101"}],"search":{"href":"/catalog?q=<title>","field":"q"}}` |
| C14 | Reader | `GET /catalog?q=No such title` | `{"books":[],"search":{"href":"/catalog?q=<title>","field":"q"},"message":"No books found","clear":"/catalog"}` |
| C15 | Reader | `GET /catalog` | `{"books":[{"id":"101","title":"River Atlas","available":true,"href":"/books/101"},{"id":"102","title":"Garden Notes","available":false,"href":"/books/102"},{"id":"103","title":"Night Trains","available":false,"href":"/books/103"}],"search":{"href":"/catalog?q=<title>","field":"q"}}` |
| C16 | Librarian | `GET /loans/201` | Same fields and Reader-labelled renewal and return actions as C11. |
| C17 | Reader | `POST /loans/201/renew` | `{"id":"201","renewals":1,"due":"2026-10-15"}` |
| C18 | Reader | repeated `POST /loans/201/renew` | `{"error":"Renewal limit reached"}` |
| C19 | Reader | `GET /loans/201` | `{"id":"201","bookId":"102","title":"Garden Notes","renewals":1,"due":"2026-10-15","actions":[{"label":"Renew loan","method":"POST","href":"/loans/201/renew","actor":"Reader"},{"label":"Return book","method":"POST","href":"/loans/201/return","actor":"Reader"}]}` |
| C20 | Reader | `POST /holds` `{}` | `{"error":"Book is required"}` |
| C21 | Reader | `POST /holds` `{bookId:"102"}` | `{"error":"Book is unavailable"}` |
| C22 | Reader | `GET /holds` | `{"holds":[],"message":"No reservations"}` |
| C23 | Reader | `GET /books/103` | `{"id":"103","title":"Night Trains","available":false,"actions":[{"label":"Reserve book","method":"POST","href":"/holds","json":{"bookId":"103"},"actor":"Reader"}]}` |
| C24 | Reader | `POST /holds` `{bookId:"101"}` | `{"id":"301","bookId":"101","title":"River Atlas","links":{"reservations":"/holds"}}` |
| C25 | Reader | repeated `POST /holds` `{bookId:"101"}` | `{"error":"Already reserved"}` |
| C26 | Reader | `GET /holds` | `{"holds":[{"id":"301","bookId":"101","title":"River Atlas","cancel":{"method":"DELETE","href":"/holds/301"}}]}` |
| C27 | Reader | `DELETE /holds/301` | `{"message":"Reservation cancelled"}` |
| C28 | Reader | `GET /holds` | `{"holds":[],"message":"No reservations"}` |
| C29 | Reader | repeated `DELETE /holds/301` | `{"error":"Reservation not found"}` |
| C30 | Reader | `GET /holds` | `{"holds":[],"message":"No reservations"}` |
