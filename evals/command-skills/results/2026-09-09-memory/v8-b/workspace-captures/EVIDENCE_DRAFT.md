# Evidence draft and reconciliation

Product requests used: 25 of 40, including one malformed uncaptured `POST /holds` dispatch (request 18) and its reconciliation readback (19). The malformed call remains unresolved; it did not create a hold, as request 19 showed.

## Proposed recorded rows

| Rows | Surface / Actor / Journey | Capture support | Proposed fact or disposition |
|---|---|---|---|
| D01–D02 | API root, API documentation / Reader / Browse the catalog | discovery 01–02 | Record local synthetic API entry and the Reader/Librarian `X-Actor` session instruction. |
| D03,D06,D07 | Catalog, Book detail / Reader / Browse the catalog; Reserve a book | discovery 03,06,07 | Record starting availability 101 true, 102/103 false; 101 and 102 both advertised reservation. |
| D04,D08,D09 | Account, Holds, Loans / Reader / Review a loan | discovery 04,08,09 | Record account links, empty initial holds, and initial loan 201. |
| D05,D10 | Service desk / Reader and Librarian / Check in a book | discovery 05,10 | Record Reader 403 desk denial and Librarian's 103 pending-return action. |
| W11–W13 | Catalog / Reader / Search the catalog | 11–13 | Record matching search, no-results message and `/catalog` clear recovery. |
| W14 | Loan detail / Reader / Review a loan | 14 | Record loan 201 fields and offered renew/return actions. |
| W15–W16 | Account, Holds / Librarian / Reserve a book | 15–16 | Record Librarian reaches account and empty holds, but no reservation action appeared there. |
| H1 | Reserve book / Reader / Reserve a book | 17 | Already recorded through inspection outcome: empty body returned 422 `Book is required`. |
| H2 | Reserve book / Reader / Reserve a book | 18 malformed,19 reconcile,20,21 | Already recorded through inspection outcome: fresh exact 102 request returned 409 `Book is unavailable`; preserve malformed attempt and empty reconciliation as unresolved coordination evidence, not a Product fact. |
| H3 | Reserve book / Reader / Reserve a book | 22 | Record 201 result with hold 301 for River Atlas; current record is only an attempted inspection, so fact still needs final reviewed recording. |
| C2 | Check in book / Librarian / Check in a book | 23 | Record 200 `Book checked in`, book 103 and its detail link; current record is only an attempted inspection, so fact still needs final reviewed recording. |
| C4 | Catalog, Loans / Reader / Check in a book | 24–25 | Record Reader sees 103 become available while loan 201 remains listed. |

## Explicit remaining work

Untried because outcome review and record reconciliation are required before consuming the reserve: hold 101 repetition, hold recovery action discovery, check-in required-input and repetition branches, loan renewal repeat/return terminal branches, and any hold details. The 15 request reserve remains available.
