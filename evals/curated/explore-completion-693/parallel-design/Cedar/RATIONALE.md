# Rationale: actor-lease parallel director

## Problem

The private runner already supports scout-less director review with serial native workers, shared 40-request and 40-minute allowance, and strict capture or Knowledge provenance. Parallel page work is blocked by host globals (`activeExecution`, `currentActor`, `activeBrowserAction`) and a single global control `chain`, not by the shared budget counters or event sequence. The next treatment must add a quick public-Knowledge scout, a Luna/medium director that may run up to three bounded page workers on distinct Actor leases, and recording-only follow-ups, while keeping one trial-wide cap, idempotent dispatch, fail-closed closure, and legacy solo or continuation policies untouched. Core `beginExplorePass` and fake UI execution IDs stay out of scope.

## Usage (caller's view)

Parent launches `director-parallel` with `--max-concurrent-workers 1` or `3`; everything else in the arm matches. An unscored `overlap-capability.mjs` gate must pass first. Scout writes `SCOUT_HANDOFF.json` using read-only `solo.mjs` Knowledge calls within a short wall clock. Director uses existing `director.mjs` to dispatch explore or record assignments, polls `status`, reads `handoff` after each closed Job, compares issued captures to full public saved bodies, and `finish`es with reason and unfinished work. Workers use per-execution `browser.mjs` and `tools.mjs` as today. See [CANDIDATE.md](./CANDIDATE.md) for call sites and CLI.

## Shape

The design centers on **Actor leases** and **immutable operation contexts** instead of a global scheduler.

Each Actor name maps to one Playwright page and at most one open execution. `begin` acquires the lease; `release` or targeted `force-release` drains that Actor's quiet window, clears `operation`, and frees the lease. During `act`, the host sets `operation = { executionId, actor, actionId }` and the interceptor copies that struct (or a background variant tied to the token's Actor) before any `await`. Per-Actor `inFlightApi` and `lastNetworkActivity` feed `awaitQuiet`, so one worker's settle does not stall another Actor's control plane.

Concurrency is parameterized only in `Dispatches.running` capped by `maxConcurrentWorkers` (1–3). Serial and parallel scored arms share the same policy code path.

The control plane drops the single global promise chain for browser work. Each Actor gets a short chain for `operate` on its page. MCP writes (`record_*`, `import_evidence`) serialize on `mcpChain`; read tools may run outside that chain because they do not mutate accepted-id sets, while the broker still validates Observation ids on import.

Scout is a separate seat role with the same Luna/medium contract but broker rules that forbid browser routes and Knowledge writes. Its output schema forces suggestions to cite public catalog or setup facts, keeping scout quick and mechanically bounded.

Director workflow stays cognitive on Luna/medium; the runner enforces leases, caps, grace-phase admission, and capture registration including **failed** acts when the host returns `captureRefs` on errors.

Closure order: stop admitting dispatches, stop seats, await all Job promises, targeted release per execution with drain, fence, finalize. Whole-arm failure modes match today's `shutdown` plus `dispatches.fenced`.

Principles: **separate-before-serializing-shared-state** (Actor leases before any writer lock), **boundary-discipline** (broker and `Capabilities` unchanged in intent), **make-operations-idempotent** (dispatch tokens), **type-system-discipline** (operation context frozen at async boundary), **minimize-reader-load** (no generic scheduler layer).

## Tradeoffs accepted

- We accept a per-Actor browser micro-queue in exchange for removing the global control bottleneck without giving each worker its own MCP session.
- We accept director-side `stateDeps` hints plus logging instead of automatic Product record locking, because shared Knowledge mutations are rare compared to browser isolation and explicit deps are easier to audit in handoffs.
- We accept scout output as advisory with a hard wall clock instead of dispatching scout as a full explore Job, to avoid spending lease or concurrency budget before the director starts.
- We accept targeted `force-release` per execution instead of immediate global clear, which complicates shutdown slightly but prevents cross-worker attribution bugs after native exit.
- We accept an unscored overlap proof run in the ledger before scored arms, adding operator steps in exchange for evidence that real wrappers overlap safely on Windows.

## Alternatives considered

**Global request queue with worker pool.** A single FIFO of browser commands could preserve one chain, but every command would still need execution and Actor attribution on dequeue. That recreates lease logic without isolating settle or in-flight API counts per Actor, and it keeps one slow `act` blocking unrelated Actors. Rejected in favor of per-Actor chains keyed by existing page map.

**Per-worker MCP sessions.** Would remove MCP serialization entirely but multiplies session state, accepted-id registration, and final readback barriers against one Product database. Grounding and synthesis explicitly kept one MCP session. Rejected as out of pilot boundary.

**Director-dispatched scout as `mode: 'explore'`.** Would reuse dispatch plumbing but consumes a concurrent slot and tempts browser use through normal worker wrappers. Rejected for a read-only scout seat and filesystem handoff.

**Retain `activeExecution` and add a lock around it.** Minimal diff, but delayed `route.fetch` callbacks would still read the lock holder's execution after handoff unless every release waits for all contexts' in-flight fetches globally. That serializes parallel Actors on network tail latency. Rejected; frozen per-request attribution is the viable fix.

**Same-Actor multi-page tabs.** Could raise parallelism without a third context but breaks the fixed-Actor execution model and complicates capture paths. Rejected; three Actors already bound leases to three.

## Open questions and risks

- Should `stateDeps` conflicts block dispatch at the broker when two open Jobs declare the same key, or only warn? The sketch logs and relies on director discipline; mechanical blocking may be needed if eval shows clobbering.
- Is concurrent `read_knowledge_context` paging safe without any serialization? If the MCP layer mutates cursor state, reads may need a shared read lock lighter than the write chain.
- Fixture CLI overlap proof may not exercise true Luna latency; should the gate require one real native overlap sample per machine before ledger append?
- Recording grace allowing new `record` dispatches while explore is closed could race with director `finish` if not sequenced. Should `finish` reject while record Jobs are `launching`?

## Next implementation step

Refactor `serve.mjs` ownership into `host-lease.mjs` and per-Actor interceptor attribution, then land `Dispatches` concurrent cap and targeted `force-release` before adding the scout seat and `director-parallel` policy branch.
