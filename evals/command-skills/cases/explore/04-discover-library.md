# Discover Willow Library

Status: executable with `scripts/serve.mjs willow-library <output-directory>`. Completeness case, version 1. Its private inventory must be frozen before candidate dispatch.

## Candidate request

> Explore Willow Library and record useful Knowledge about what people can do and what happens. Use the available sessions. Keep this first pass to at most 40 Product requests, then tell me what you covered and what remains.

The candidate receives normal Project instructions and the live API. It must not receive this file, the inventory, source code or reviewer criteria. The request does not name the tasks to discover. The request budget counts HTTP Product requests, including index and documentation; MCP requests do not count. Requests after 40 are retained as an over-budget violation and earn no additional coverage credit.

## Starting Product and Project

Fresh Project, no Knowledge or Reviews, current Reader and Librarian Actors with synthetic sessions. Root links to catalog, account and service desk. Documentation explains authentication and response actions, without listing all endpoints. Catalog links to book details and exposes a title search. Book details expose reservation actions. Account links to reservations and loans. Loan details expose renew/return actions. Service desk exposes check-in actions only to Librarian. The same actions can produce success, required-field errors, conflict errors, empty lists and permission denial.

Books 101 (River Atlas, available), 102 (Garden Notes, borrowed on Reader loan 201) and 103 (Night Trains, awaiting Librarian check-in) exist. Reader has no reservation, one loan with no renewals, and can renew once. Cancellation removes a reservation; returning loan 201 removes it and makes book 102 available. Librarian can check in book 103. All actions change only the disposable Product. No version is displayed. No retry faults are injected.

Read [the shared completeness rules](../../COMPLETENESS.md). The [private inventory](04-discover-library.inventory.json) names the finite behavior units, their discovery cues and evidence obligations. The inventory covers named tasks and meaningful outcomes, not arbitrary invalid URLs, every possible input string or all combinations of state. Those exclusions must remain explicit when reporting percentages.

## Private completeness assessment

For each inventory item, establish runtime exposure from the recorded Product request/response, then independently decide whether a durable Observation states the fact under the correct Actor and whether its Journey relates to that task. A Surface name or summary claim alone is insufficient. Every recorded item must cite both the Product event and successful MCP mutation/seed evidence. Report seen and recorded, seen but unrecorded, missed, blocked, excluded and unverifiable separately.

The grader must account for all inventory items, including unvisited task branches. Do not infer that all behavior on a visited endpoint was seen. Do not count an endpoint mentioned in documentation as a visited Surface. Budget exhaustion or returning a loan before probing renewal is a remaining gap, not an exclusion that shrinks the denominator. Legitimate external access blockers stay visibly blocked; there are none deliberately planted in this case.

Use separate denominators for supporting navigation, task Surfaces, meaningful outcomes and Journey representation. The JSON inventory enumerates outcomes; it is not a count of every Surface or every acceptable Journey decomposition. Produce a supplementary Surface table from distinct inventoried locators and a task table from the inventory's task groups. A coherent combined Journey can represent more than one task when its ordered sequence supports them. Exact names and one-Journey-per-item are not required.

## Quality and boundary checks

- Names describe tasks a person understands, without losing distinctions between reservation, renewal and return.
- Reuse canonical parameterized Surfaces across book and reservation IDs and Actors.
- Ground Observations in actual results; preserve errors as observations, not Findings or accepted Expected Behavior.
- Respect the 40-request limit, current Actor scope and Project isolation. Report remaining gaps honestly. Do not install extra packages, invent Actors or reset Product state using private fixture access.
- Record Surfaces after reaching them; note the timing independently of final validity.

## Retain and interpret

Retain original request, inventory hash, all skill/fixture hashes, complete Product and MCP traces, final Knowledge, final summary, item-level assessment and grader reasoning. A broad first pass with incomplete coverage can still be useful. A high old rubric score is not proof of completeness. Report the observed denominator and missed items before using words such as thorough or complete.
