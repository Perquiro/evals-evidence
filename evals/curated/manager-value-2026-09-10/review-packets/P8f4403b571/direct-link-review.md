# Direct Journey linkage review

This review checks the six `directlyJourneyLinked: true` flags in `grade.independent.json`. It does not change primary seen or saved scoring.

| Check | Result | Complete directly linked saved alternative |
| --- | --- | --- |
| HR03 | retain `true` | `12403279-36b5-416e-9f21-f1a5767957d1` is linked to `aa954bb1-968f-4566-9956-b4c588acee67` and records Hannah's search text, settled one-row result, row identity, and page boundary. |
| HR11 | retain `true` | `9b293ab2-cbce-4cee-9f20-04ad934078a0` is linked to `ca7a44f7-d55e-451b-ac5b-b1dcaa4dc88f` and records one weekend request submission, POST 201, new id4, pending status, and two days. |
| HR12 | retain `true` | `9b293ab2-cbce-4cee-9f20-04ad934078a0` establishes the linked submission; `81b882ab-3936-4594-b726-a0b201a73261`, in the same linked Journey, records the subsequent history readback with rendered dates, type, days, and status. |
| HR13 | retain `true` | `1dea245f-6947-48b8-be0e-ed5cfca7695e` is linked to `ca7a44f7-d55e-451b-ac5b-b1dcaa4dc88f` and records return to New request after an accepted submission, with the retained type, dates, reason, and duration. |
| HR16 | retain `true` | `be3de69c-3bdb-45fb-a2a3-0f49e36c9491`, `bd89a803-5575-4897-bb5c-aaf92e2e835c`, and `1a1829f9-c225-4700-bd17-15c367e4cf12` are all linked to `13f09691-04a8-41a2-baec-bb57f6eb9754`. Together they preserve the empty-reason dialog, confirmed rejection with empty comment, and the settled queue result. |
| HR21 | correct to `false` | The material baseline, create result, and full-directory readback are saved only in unlinked Observations `8fd76029-e655-40c9-819f-5107ca9e8bb2`, `0de7f899-6584-4076-8d1b-b8ad3a59d0c2`, `49050eb8-7c5f-41e2-a1fd-7c8439ed859e`, and `265dfa96-7653-489a-be35-3b3a4a2a99ac`. Linked Observation `12403279-36b5-416e-9f21-f1a5767957d1` records a later filtered one-row search and does not preserve the 28-to-29 headcount change or the creation result. |

HR21 therefore has complete seen and saved support but lacks a complete directly Journey-linked saved alternative. Its diagnostic flag should be false; the original grade file remains intentionally unchanged.
