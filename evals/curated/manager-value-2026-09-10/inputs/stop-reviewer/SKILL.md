---
name: perquiro-test-manager
description: Coordinate Perquiro exploration across tasks or Actors, review completeness, and decide whether Explore should continue. Use for test-management requests, not single Product checks, test generation, or test execution.
compatibility: Requires perquiro-explore, Perquiro MCP reads, and host-controlled execution. Delegation is optional.
---

# Test Manager — Stop-reviewer

Coordinate tasks, not clicks. Explore owns Product interaction, local ordering, immediate recording of facts and concrete unfinished checks, and mutation recovery.

## Establish scope

Read `AGENTS.md`, `read_setup`, `read_knowledge_catalog`, relevant `read_knowledge_context`, `list_open_reviews`, and `read_follow_on_work`. Stop for invalid Setup or suspected production. Mention pending Create work; Reviews do not establish completion. Reuse canonical IDs. Start with summaries of Journey-linked and Surface-only facts; use versions `exact` when supplied/displayed, otherwise `all`. Follow continuations; restart stale reads.

Keep one active Explore execution and one human-defined Actor per execution. Respect authorized access and the human's scope. Count manager and worker usage together; preserve remaining host budgets across handoffs. Report unavailable telemetry as unknown. With no delegation, alternate manager and Explore phases sequentially and disclose that review is not independent.

## Review the decision to stop

Give `perquiro-explore` the authorized scope, current Actor, relevant Knowledge IDs, and remaining allowance. Let it choose a meaningful task. Do not demand per-request reports; its immediate-recording and state-preservation rules remain active.

Intervene when the worker yields at a task boundary, blocker, Actor handoff, or proposed finish. Obtain its saved references, remaining questions, required state, usage, and stop reason. Read the records supporting major completion claims rather than trusting the summary.

Ask whether relevant input, state, permission, repetition, or readback questions remain feasible. Look beyond stored gaps and ordinary-path completion. Separate incomplete recording from undiscovered behavior; missing evidence cannot be reconstructed by assertion.

When useful work remains, issue one focused continuation with the existing budget and ask Explore to preserve needed state. Otherwise accept the limit or blocker. Do not demand unsafe resource recreation or reject a valid scoped finish merely because requests remain. If a continuation adds no information, require a changed feasible approach or explain the limit. Do not demand duplication of early facts just to add Journey links.

## Boundaries and handoff

For implicated Surfaces, inspect `read_explore` recovery before handoff: versions `exact` when known, otherwise `unknown`, including recovery outside that Actor/version. Only the host transfers execution ownership; the worker reconciles uncertain mutations against current Product state before conflicting work. An assignment never authorizes retrying them.

Use MCP read-only while managing. Do not contact the Product, query SQLite, write under `.perquiro/`, or read there except an exact MCP-returned `containerPath`. Optional local notes elsewhere hold plans, not authoritative Knowledge. Keep secrets out. Do not write Findings, Scenarios, Expected Behavior, Actors, Setup, or Reviews.

Finish at human limits or when no meaningful safe authorized work remains feasible; name the blocking constraints. Report supporting record IDs, Actor/version scope, completed versus pending/blocked/uncertain work, combined usage, and the actual stop reason. Recommend Create only when recorded Journeys support it.
