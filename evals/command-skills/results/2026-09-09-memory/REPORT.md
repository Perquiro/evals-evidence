# Explore with memory: repeated Library runs

The repeated runs retain both useful durable facts and failures. The new protocol passed the deterministic recovery matrix and a fresh-Agent Reserve → details → Actions → Cancel recovery proof. These Library runs do not establish that it improves completeness or cost over v8. Host scheduling, source revisions, the pilot instruction changes and v8's adaptation to the current operating contract prevent a clean performance ranking. The [method and retained failures](METHOD.md) explain those limits.

## Frozen outcome coverage

All 25 outcomes remain in every denominator. Seen means a matching Product receipt. Fact means a supported Observation survives a final public read. Durable also requires its related Journey under the frozen rubric. Canonical means that durable fact is recorded on the required endpoint Surface. No canonical penalty is folded into the frozen durability score.

| Run | Seen | Fact | Durable | Canonical durable | Product requests / 40 |
| --- | --- | --- | --- | --- | --- |
| [memory-a](memory-a/assessment.json) | 18/25 | 17/25 | 5/25 | 3/25 | 40 |
| [memory-b](memory-b/assessment.json) | 17/25 | 17/25 | 3/25 | 2/25 | 38 |
| [memory-c](memory-c/assessment.json) | 16/25 | 16/25 | 13/25 | 5/25 | 40 |
| [v8-a](v8-a/assessment.json) | 19/25 | 19/25 | 19/25 | 19/25 | 30 |
| [v8-b](v8-b/assessment.json) | 23/25 | 20/25 | 20/25 | 17/25 | 40 |

Memory A is the early pilot. Memory B and C use the same final installed Explore bytes. V8 A uses the old recording workflow on the current runtime; v8 B mixes its frozen review gates with current structured attempts. The historical single v8 result was 25/25, as cited in METHOD.md; it is not averaged with these fresh runs.

The inventory's original priority names are core and secondary. They remain separate here.

| Run | Priority | Total | Seen | Durable |
| --- | --- | --- | --- | --- |
| memory-a | core | 19 | 16 | 5 |
| memory-a | secondary | 6 | 2 | 0 |
| memory-b | core | 19 | 15 | 3 |
| memory-b | secondary | 6 | 2 | 0 |
| memory-c | core | 19 | 15 | 12 |
| memory-c | secondary | 6 | 1 | 1 |
| v8-a | core | 19 | 15 | 15 |
| v8-a | secondary | 6 | 4 | 4 |
| v8-b | core | 19 | 17 | 14 |
| v8-b | secondary | 6 | 6 | 6 |

## Cost and available latency

Write calls include rejected calls and replays; successful unique tokens are a separate count. Product errors consume request budget. A saved Observation is not necessarily a completed outcome. The final three columns divide each cost by frozen durable outcomes.

| Run | Product | MCP reads | MCP writes | Unique write tokens | Rejected writes | Schema reads | Observations | Product / durable | Reads / durable | Writes / durable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [memory-a](memory-a/metrics.json) | 40 | 45 | 67 | 63 | 1 | 7 | 38 | 8.00 | 9.00 | 13.40 |
| [memory-b](memory-b/metrics.json) | 38 | 79 | 96 | 93 | 3 | 3 | 61 | 12.67 | 26.33 | 32.00 |
| [memory-c](memory-c/metrics.json) | 40 | 40 | 82 | 80 | 2 | 6 | 60 | 3.08 | 3.08 | 6.31 |
| [v8-a](v8-a/metrics.json) | 30 | 21 | 52 | 52 | 0 | 4 | 30 | 1.58 | 1.11 | 2.74 |
| [v8-b](v8-b/metrics.json) | 40 | 13 | 69 | 66 | 3 | 5 | 53 | 2.00 | 0.65 | 3.45 |

All elapsed values are minutes; server latency is milliseconds. Manifest elapsed includes idle time before dispatch and stop delay. Candidate span still includes reasoning and host waits. Server latency excludes those costs. Shared-host work and capacity interruptions make these unsuitable for a speed ranking.

| Run | Manifest elapsed | Candidate span | First fact delay | MCP median | MCP p95 | Product median | Product p95 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| memory-a | 50.24 | 47.88 | 1.09 | unavailable | unavailable | unavailable | unavailable |
| memory-b | 112.27 | 45.56 | 1.96 | 27.75 | 48.39 | 0.11 | 0.26 |
| memory-c | 72.84 | 27.82 | 0.76 | 28.77 | 37.65 | 0.12 | 0.29 |
| v8-a | 50.42 | 45.36 | 44.05 | 27.44 | 35.36 | 0.12 | 0.20 |
| v8-b | 58.44 | 31.02 | 15.31 | 28.06 | 34.89 | 0.11 | 0.33 |

Known coordination is reported separately from Product and MCP calls. Memory runs use three fresh Actor contexts with no child delegation. The final two memory runs each received one Reader follow-up after an early handoff. V8 A and B each used a coordinator plus discovery and reviewer roles. V8 B retained six named reviewer passes; v8 A retained two reviewer-capacity stops. V8 B received a root continuation at its evidence stop. Complete progress-message, wait-call and failed-spawn telemetry is unavailable, so these are known events rather than an invented exact tool-cost total.

## Item state and mutation protocol

Normalized duplicates are exact candidate groups, not semantic equivalence. The human judgments linked below account for aliases, omitted outcomes and false pending checks. An accepted id mechanically preceding a request is insufficient when the item or preconditions are wrong. V8 A has no structured markers under its old workflow; zero item-level reopens is therefore not measurable for that run.

| Run | Items | Normalized duplicates | Unresolved | Mutation calls | Accepted attempts | Marker verdict | False reopens | False pending | Semantic aliases |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [memory-a](memory-a/quality-notes.json) | 24 | 0 | 0 | 7 | 6 | failed: one blind repeat | 0 | 1 | none identified; three row-specific book links |
| [memory-b](memory-b/quality-notes.json) | 37 | 0 | 0 | 5 | 5 | five supported dispatches | 0 | 4 | none identified; three row-specific book links |
| [memory-c](memory-c/quality-notes.json) | 48 | 0 | 0 | 6 | 7 | six supported dispatches; one manual correlation | 0 | 6 | at least four action/link/field pairs |
| [v8-a](v8-a/quality-notes.json) | 0 | 0 | 0 | 8 | 0 | legacy: eight unmarked calls | not applicable | not applicable | not applicable to items |
| [v8-b](v8-b/quality-notes.json) | 15 | 0 | 3 | 13 | 13 | failed despite thirteen ids | 0 | 0 | one clear retry pair; other per-request names |

**memory-a:** The early pilot retained 17 factual outcomes but only five with a related Journey. Event 53 repeated the unavailable-book POST from an error handler without a fresh accepted attempt. An unavailable-rule gap stayed pending because its result was attached to the parent action. The catalog defines three book-row link items. Three actual mutation endpoints were omitted as canonical Surfaces. Final uncertainty is zero, which does not erase the unsupported retry.

**memory-b:** Seventeen outcomes were observed and factually saved, but only three have sufficient related-Journey records and two are canonical durable facts. Existing Journeys were often omitted from later writes. All five Product mutations have preceding accepted attempts and outcomes. The numeric check-in returned 404; attempted non-execution and replacement writes were then rejected, and no extra POST occurred. The final Reader fixed three catalog-link gaps, then stopped at 38 requests with two unused. Four clearly observed access steps still lack reached attribution. Item names were reused across Actors, although the catalog retained three book-row links.

**memory-c:** The run saved sixteen factual outcomes, thirteen with related Journeys, but only five on canonical endpoint Surfaces. It retained one safe non-execution reconciliation after a client-command failure, then made the replacement POST; all six dispatched mutations have preceding accepted attempts and outcomes. Check-in still failed because numeric 103 replaced the advertised string. Three resource-specific book Surfaces, concrete loan/reservation endpoint names and item aliases weaken reuse. Six observed access steps remain pending because they were recorded as independent Surface facts rather than reached Looks. No exact item completion was reopened by ordinary inventory.

**v8-a:** Nineteen outcomes were seen and saved with related Journeys and canonical endpoint identity. Ten Product requests were left unused. No typed item inventory or attempt markers were written. Three Surface writes preceded a matching visit; POST desk returns was never visited. Product repeats exercised explicit duplicate, limit and already-cancelled branches. No blind response-fetch retry was identified. Recording waited until late evidence review, leaving zero committed Observations at both retained interruption cuts.

**v8-b:** The adapted v8 run saw 23 outcomes and durably saved 20, with three loan outcomes on the source GET Surface instead of their actual POST endpoints. Thirteen mutation calls mechanically match accepted ids, but generic preparation text does not ground preconditions. The malformed unavailable attempt was retried under a new item name without typed non-execution reconciliation. The original retry, successful reservation and successful check-in attempts remain unresolved. Its three observed readbacks without saved facts and stale summary count are retained.

The stronger [fresh-Agent recovery validation](actions-recovery/validation.json) confirms one initial uncertain Reserve, no repeated Reserve, one resumed cancellation POST, a separate empty-Reason branch and zero final uncertainty. Its six resumed Product requests leave exactly one reservation. The [controlled acceptance proof](../../../../docs/proofs/253-explore-recovery-acceptance.md) covers six boundaries for both creation and cancellation. METHOD.md distinguishes these proofs from OS process-kill recovery and documents the narrower Library recovery pilot.

## Every frozen outcome

D = durable with related Journey; F = fact saved without the required Journey; S = seen without a sufficient fact; C = explicitly considered but incomplete; M = missed or consideration unsupported. Exact receipts, Observation ids/bodies, final read paths, reasons and remaining work are in each linked assessment. No status is inferred from the candidate's final summary alone.

| Item | Outcome | memory-a | memory-b | memory-c | v8-a | v8-b |
| --- | --- | --- | --- | --- | --- | --- |
| W01 | Browse the full catalog | F | F | F | D | D |
| W02 | Find a matching title | D | F | D | D | D |
| W03 | Search with no matches | F | F | M | D | D |
| W04 | Clear an empty search | S | F | M | D | D |
| W05 | Inspect an available book | F | D | D | D | D |
| W06 | Inspect a borrowed book | F | F | D | D | D |
| W07 | No reservations yet | F | F | D | D | D |
| W08 | Reserve an available book | F | D | D | D | D |
| W09 | Borrowed book cannot be reserved | F | C | D | D | D |
| W10 | Reservation needs a book | M | M | M | D | D |
| W11 | Duplicate reservation is rejected | M | M | M | D | D |
| W12 | Created reservation appears in account | F | F | D | D | S |
| W13 | Cancel a reservation | F | F | D | D | C |
| W14 | Cancellation removes the reservation | D | F | D | D | C |
| W15 | Inspect the current loan | F | F | D | D | D |
| W16 | Renew the loan | D | D | D | D | D |
| W17 | Renewal limit is enforced | C | M | M | D | D |
| W18 | Return the reader's book | D | F | D | C | D |
| W19 | Returned loan disappears | D | F | D | C | S |
| W20 | Reader cannot access service desk | M | F | F | D | D |
| W21 | Librarian can access service desk | F | F | F | D | D |
| W22 | Check-in needs a book | M | M | M | C | D |
| W23 | Check in the pending book | F | C | C | C | D |
| W24 | Repeated check-in is rejected | M | M | M | C | D |
| W25 | Checked-in book becomes available | M | M | M | C | S |

Each assessment also includes the eleven-locator Surface table, visits, premature Surface writes, six task groups and supporting navigation. Each item audit preserves final typed gaps and unresolved ids. The trace-cut files retain committed Knowledge before interruptions and Actor handoffs; METHOD.md records their outcome judgments. The incomplete and failed runs were retained without evaluator repair of candidate Knowledge.
