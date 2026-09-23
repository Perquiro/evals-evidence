---
name: perquiro-explore
description: Explore a Product in a Perquiro Test repository when asked to look around, map behavior, or gather Knowledge for Create. Keep one Actor and save grounded Surfaces, items, Journeys, Observations, Looks, and Evidence through MCP. Do not create Findings, Scenarios, or Expected Behavior.
---

# Explore

Discover meaningful behavior and save what Create and the next session need.

## Start

Read `AGENTS.md`/Project guidance and `read_setup`; missing/invalid Setup requires human `perquiro setup`. Keep one human-defined Actor: id for inspections, name for plain Observations; attribute signed-out facts correctly. Respect scope and budgets; do not switch Actors or spawn workers to extend coverage.

Read `read_knowledge_catalog`, relevant `read_knowledge_context`, `list_open_reviews`, and `read_follow_on_work`. Mention pending Create work; Reviews do not block Explore or change automatically. Reuse ids. Context uses current-Actor `summaries`, `both` Journey-linked/Surface-only facts, and versions `exact` when supplied/displayed, otherwise `all`. Follow catalog/context continuations; restart stale reads.

For each relevant Surface, use `read_explore` before selecting checks: versions `exact` when known, otherwise `unknown`; `all` for grouped history. Inspect gaps, suggestions, blockers, access hints/support, and every recovery page, including outside Actor/version filters. Test verification covers only its mapped check. Restore access against current state.

Prove non-mutating access before recording; stop for suspected production. Before installing, obtain permission for package, command, scope, browser, and expected download size; verify afterwards.

## Explore a useful state window

Choose a task, inspect its current state, and identify relevant advertised paths, separate result readbacks, required inputs, unavailable states, permissions, repetition/limits, and newly revealed controls. Keep only a short set of concrete unanswered checks; no state graph or exhaustive matrix.

**Before leaving this state:** identify what the proposed action would make impossible, and what becomes testable afterwards. Select feasible authorized checks needing the current state before the transition. Save blocked checks and their dependencies instead of silently dropping them. For read-only tasks, use distinct inputs or visible states rather than inventing a lifecycle.

**For each selected check:** Preserve advertised input types, names, and structure except for the deliberate variation being tested; validate request construction before dispatch. For a mutation, inspect its resource and exact check; save `attempting` with grounded preconditions and non-secret `resourceRef`. Dispatch only when a fresh response includes that Observation id in `authorizedAttemptIds` and this execution owns the action. A replay grants no dispatch permission. Capture the original response, including errors; disable automatic mutation retries. Do not resend a mutation to recover its response body.

**Before any next request:** Before the next Product request, save the input case, observed HTTP status or UI message, and material response facts. For a mutation, first save `exercised` on the original item with its accepted `attemptObservationId`; leave the attempt unchanged. Record other performed checks on their exact items. For every reached API operation, including error responses, record/reuse the actual `METHOD /path` Surface and save its response inventory there. Complete origin and endpoint writes separately when needed; neither substitutes for the other. Mark followed access items `reached`, using supported `revealedVia` and `reachedSurfaceId`. Carry an existing applicable `journeyId` into each write. Unreadable responses go to recovery, not invented outcomes.

**After the result:** perform a meaningful readback when needed, recording it by the same response step. Reinspect which checks the resulting state enables. Proceed with the transition when useful current-state work is observed or concretely limited; post-transition checks still matter. Do not create replacement resources solely for checklist completion.

**Before leaving the task:** compare observations with the state-dependent questions, including branches never named in stored gaps. Continue with another useful feasible check or task. Honor human/session limits immediately. Otherwise stop only when no material safe authorized check remains feasible, not merely because stored gaps, Reviews, or Follow-on work are empty. Save concrete unfinished checks named in the handoff; human skips are neither Product denials nor completion.

## Recording rules

Use exposed MCP schemas. `record_surface` follows actual reach: stable name and page route pattern, endpoint `METHOD /path`, or mobile screen. Reuse across Actors/resources. Tabs without distinct locators share a Surface; different endpoint methods/routes do not. Advertised destinations are only offered until reached.

Use `record_inspection`; batch available distinct reports within one Surface/Actor/platform/version/Journey context. Item kinds: `information`, `form`, `field`, `action`, `tab`, `link`, `rule`. Reference new items by `key`, existing ones by `id`; keep resource values in facts, not identities.

First report per Surface/Actor/platform/version: `inventory`, grounded `body`, explicit `looks` (possibly empty), with `offered` or inspected `absent`. Later omissions are not absence. An `action` report has one factual body and exactly one Look: `reached`, `attempting`, `exercised`, or `blocked` with concrete `reason`. Concrete unanswered checks are items without Looks. Independent validation/repetition checks use `rule` and `ruleFor`; attempt and outcome belong to the exact branch. Opening a menu does not complete its children.

Use `record_journey` after a meaningful walked task: recorded Surface ids in visited order, including repeats. Reuse permanent names; an existing name replaces its sequence. Different outcomes are not new Journeys. Carry existing Journey attribution; do not delay or duplicate earlier facts for links. This contract has no later attachment tool.

After inventory, `record_observation` can save facts without item relationships: Surface, Actor name, applicable recorded Journey name. It never replaces required Looks. Record only supplied/displayed Product versions. Include `contradictsRunId` for observed contradictions of mapped Tests.

## Recover without repeating uncertain actions

Use a fresh `requestToken` per logical MCP write. Replay a lost response with identical token/arguments; correct rejected writes with a new token. Neither permits another Product request. If recording is blocked, retain response details and report the blocker rather than exploring with unsaved outcomes.

After interruption/unreadable response, use `read_explore`, restore access, and inspect current Product state. Supported completion: record without redispatch. Proven non-execution: save `blocked` with accepted `attemptObservationId`, concrete `reason`, and `reconciliation: "not_executed"`; a justified new attempt uses `repeat.kind: "non_execution"`, `reason`, and `serves`. Unknown: blocker without reconciliation, no repeat.

An error covers its case, not non-execution or every task outcome. Repetition/corrected-input checks are allowed when justified, not until success. Repeating an exercised check needs `repeat`, `reason`, and `serves`: `precondition` for access; `changed`/`repetition` for an independently named unfinished branch. This explains repetition, not result attribution. New names/tokens/inventory cannot bypass it. Do not alter attempt references or copy completion across versions. Keep one mutation owner; markers are not exactly-once guarantees or resource locks.

## Notes, Evidence, and handoff

Use MCP for authoritative Project state. Do not query its SQLite database, write under `.perquiro/`, or read there except an exact MCP-returned `containerPath`. Optional notes outside `.perquiro/` may hold tentative checks, ordering, and ids; they replace neither Knowledge nor recovery. Keep secrets out of notes, Knowledge, and git. Do not write Findings, Scenarios, Expected Behavior, Actors, Setup, or Reviews.

Import Evidence only when useful: save facts first (`capture: "pending"` when import follows). Use `import_evidence` with completed absolute `sourcePath`, distinct supporting `observationIds`, and known version. Paths must be outside and not contain `.perquiro/`; respect `evidenceMib`, excluding symlinks, junctions, special files. Captures persist without redaction: avoid secrets/personal data or obtain informed permission. Retrieve old Evidence via catalog/`read_evidence`, inspecting only its returned path.

Summarize Actor/version/scope, Product requests used, saved Surfaces/Journeys, Evidence ids, and observed/pending/blocked/uncertain checks. Include limitations, installs/commands, and mutations lacking accepted attempts as workflow failures. Installs do not satisfy Generate/Run dependencies. Recommend Create when recorded Journeys support it; readiness alone does not end Explore.
