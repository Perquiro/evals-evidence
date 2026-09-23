# Final evidence review

## Decision

Do not record the proposed batch yet. The captures support the draft apart from two omissions, but the draft needs corrected factual rows, an exact cancellation Journey sequence, and an Evidence-import mapping before Perquiro writes begin.

## Capture-to-draft review

| Draft key | Review |
|---|---|
| D01 | Needs correction. R01 also links `/docs`; add Documentation to the root-link Observation or give that captured link a specific disposition. |
| D02 | Supported by R02. |
| D03 | Supported by R03. Its catalog availability is the initial state and is distinct from later reads. |
| D04 | Supported by R04. |
| D05 | Supported by R05. |
| D06 | Supported by R06. |
| D07 | Supported by R07. This initial empty collection is distinct from C22 and C28/C30. |
| D08 | Supported by R08. |
| D09 | Supported by R09. Keep it on `GET /desk`, not the unwalked check-in POST endpoint. |
| D10 | Needs correction. R10 supplies `bookId: "103"` for `POST /desk/returns`; add that input to the Observation or give the input a specific disposition. |
| C11 | Supported by C11. `renewals: 0` and due `2026-10-01` remain the pre-renewal state. |
| C12 | Supported by C12. The response shows that Librarian can read the entry point while the offered control remains labelled Reader. |
| C13 | Supported by C13. |
| C14 | Supported by C14, including the no-results message and clear route. |
| C15 | Supported by C14's `clear` link together with C15's subsequent catalog response. |
| C16 | Supported by C16. |
| C17 | Supported by C17. |
| C18 | Supported by C18. |
| C19 | Supported by C19. This final loan-detail state is distinct from C11 and the two POST responses. |
| C20 | Supported by C20. |
| C21 | Supported by C21. |
| C22 | Supported by C22. This is the post-unavailable-reservation readback, not a duplicate of D07. |
| C23 | Supported by C23. It preserves Night Trains' Reader-visible unavailable state before the untried check-in branch. |
| C24 | Supported by C24. |
| C25 | Supported by C25. |
| C26 | Supported by C26. It is the post-reservation collection state and advertises the cancellation route. |
| C27 | Supported by C27. |
| C28 | Supported by C28. It is the first post-cancellation readback. |
| C29 | Supported by C29. |
| C30 | Supported by C30. It is the final post-repeat collection readback. |

## Associations and Journey order

- Resolve the labels in the draft to the reviewed canonical identities before recording: Root `GET /`; Documentation `GET /docs`; Catalog `GET /catalog`; Book detail `GET /books/:id`; Account `GET /account`; Reservations `GET /holds`; Reserve book `POST /holds`; Loans `GET /loans`; Loan detail `GET /loans/:id`; Service desk `GET /desk`; Renew loan `POST /loans/:id/renew`; and Cancel reservation `DELETE /holds/:id`.
- The actual Actor on every drafted row matches its capture. Keep C12 and C16 as Librarian entry-point observations; do not turn their Reader-labelled controls into a claim that Librarian can perform either POST action.
- Keep the initial and final states as separate Observations: D03, D07, D10, C11, and C23 explain later availability, renewal, hold, and check-in-related states. C19, C22, C26, C28, and C30 are later states and must not replace them.
- The `Cancel a reservation` Journey must use the actual order: C26 `GET /holds`, C27 `DELETE /holds/:id`, C28 `GET /holds`, C29 `DELETE /holds/:id`, C30 `GET /holds`. The repeated DELETE must appear in the Journey sequence. The DELETE observations belong to `DELETE /holds/:id`; every holds response belongs to `GET /holds`.
- If `Check in a book` is recorded from D09, D10, and C23, its Journey surface sequence may contain only the actually reached `GET /desk` and `GET /books/:id` Surfaces. Do not include `POST /desk/returns`, which remains untried.

## Evidence mapping required before recording

The Markdown capture files are saved response bodies and materially support the factual Observations. After the corrected Observations are recorded and their ids returned, import:

- `notes/discovery.md`, linked to the resolved D01–D10 Observation ids.
- `notes/coordinator-captures.md`, linked to the resolved C11–C30 Observation ids.

Both sources are local capture files outside `.perquiro/`. Verify the returned Evidence links against the intended Observation ids. Do not include a product version because none was observed.

## Exposed untried work

Retain the draft's untried loan return; Reader action-level check-in access; Librarian check-in validation and success; desk and Reader-book check-in readbacks; repeated check-in; and post-check-in catalog readback with the reviewed budget reasons. Remove "cancellation access as another Actor" from that list: C26 does not advertise a cancellation role boundary, so the cancellation checklist's access cell is not applicable rather than untried.

After D01 and D10 are corrected, the cancellation Journey sequence is made exact, the Evidence mapping is added, and the untried list is corrected, the resolved draft rows are approved for recording.

## Limited evidence recheck

Approved. D01 now includes the Documentation link, and D10 records the advertised `bookId` 103 input. The evidence draft now maps the discovery and coordinator capture files to their respective Observation ids, gives the full repeated `Cancel a reservation` Surface sequence, keeps `Check in a book` to reached GET Surfaces only, and marks cancellation access as not applicable.

All resolved draft rows are approved for Perquiro recording and the mapped Evidence imports.
