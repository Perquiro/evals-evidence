## Problem

The next arm needs a scout, a Luna medium director, and bounded page workers on the three authenticated Actor contexts, with one shared 40-request counter and one 40-minute clock plus five minutes of saving. The private runner can do that only if a request that resumes after `await` still belongs to the execution that started it. Today `serve.mjs` answers that question by reading `activeExecution`, `currentActor`, and `activeBrowserAction`, and one HTTP `chain` holds browser waits, status, and MCP together. Solo, `continuation-approx`, and `director-review` already depend on the single-child path, the capture hashes, the unknown Product version, and Windows Job closure. This treatment cannot call `beginExplorePass`, cannot register a fake UI execution, and cannot give a worker a private allowance.

## Usage (caller's view)

The parent starts the matched pair with the same `runArm` arguments except `pageConcurrency`.

```javascript
await runArm({ source, output: serialOutput, policy: 'page-review', pageConcurrency: 1, ledger, cli });
await runArm({ source, output: parallelOutput, policy: 'page-review', pageConcurrency: 3, ledger, cli });
```

`solo`, `continuation-approx`, and `director-review` stay as they are. `pageConcurrency` on those policies throws before `/start`.

The director's explore call site is `director.mjs dispatch` of an assignment whose `page.evidence` names a scout snapshot or a closed capture, plus `conflictKeys` copied from that text. The record call site names `sourceExecution` and a subset of that execution's keys. A repeated token returns the stored job. `status`, `handoff`, and `finish` stay the director's other calls. `finish` is the only whole-request stop the director can ask for.

## Shape

`ApiAdmission` is frozen at the start of a Product request from that Actor's route. `ActorNet` holds the page, the in-flight count, the open `BrowserOperation`, and the lease. Foundational thinking put those two structures ahead of dispatch policy, because every later rule is a read of them.

Subtract before you add removed the three globals as sources of identity. A lock around the old globals would still answer a late callback with whoever holds the lock at resume time. Redesign from first principles makes `page-review` look up the execution id on the request. Solo keeps the current guard that a second `begin` throws while one execution is live, so `activeExecution` on status remains the one-live resume object.

Separate before serializing shared state left the request cap, the clock, the event number, and the Product database shared. Browser quiet is per Actor. The one MCP client is the writer queue, and that queue does not include `awaitQuiet`. Laziness protocol kept this inside `serve.mjs`, `coordination.mjs`, and `coordination-boundary.mjs`. `'single'` dispatch is the old `active` token, unchanged, for continuation and `director-review`. `'capped'` adds a page set of size `pageConcurrency` and one record slot.

Boundary discipline leaves validation in `parsePageAssignment` and `Capabilities.authorize`. The host trusts the execution id those gates already checked. Type system discipline makes a record assignment unable to carry a page target, and makes `pageConcurrency` a value 1, 2, or 3 that only `page-review` accepts. Make operations idempotent keeps the duplicate-token job and makes a second targeted release of a drained execution return the same id. Encode lessons in structure turns the quick scout into a 180 second seat, three snapshots, and six `goto`s whose paths already appear in those snapshots. Page tasks stop at eight acts or eight minutes. `finish` waits until `scout` was read and every closed job's full public bodies were paged onto the handoff. Those are broker rejects, not sentences in the prompt. Minimize reader load is why there is no pool, priority, or retry type.

The director token still cannot act by running a worker wrapper. Tokens stay in the seat environment. The Codex sandbox flag stays where `startSeat` puts it, and it is not treated as a user-isolating boundary.

## Synthesis decision

The parent arena writes this section after it compares candidates. This runner does not pick a base.

## Tradeoffs accepted

- We accept path-sized conflict keys in exchange for a broker check that two jobs cannot share a label visible in the cited snapshot. Two different paths can still update one Product row.
- We accept one MCP queue for reads and writes in exchange for not overlapping a client whose concurrent behavior is unverified. Browser waits stay off that queue.
- We accept a scout that can only `goto` a path already present in its own snapshots in exchange for a map the broker can check. A menu that is absent from the rendered dashboard is outside the assignment set until some later closed capture shows it.
- We accept fixed 180 second, six `goto`, eight act, and eight minute caps in exchange for a serial arm and a parallel arm that share every bound except `pageConcurrency`.
- We accept registering the host's existing failure `captureRefs` in exchange for leaving the solo preflight payload alone. A click that throws before any capture file still has the log line only.

## Alternatives considered

A global mutex around the current control chain keeps `activeExecution` and makes parallel workers take turns. A callback that starts after the mutex moves still inherits the new owner, and one settle still blocks status. That fails the late-request and control-plane constraints together.

Per-worker 40-request budgets, or a fresh clock per job, contradict the one allowance. Deltas between global start and end counts would include other workers' requests.

Calling `beginExplorePass` and minting a UI execution UUID hands concurrency to Core. Core allows one running pass and requires that UUID when a binding is present. The parent forbade both the call and the fake id.

A worker pool with director-chosen limits and retries is a second scheduler beside `Dispatches`. A retry of a write can repeat a Product mutation the current contract already forbids.

Several pages inside one Actor context ask for same-Actor overlap the prepared sessions do not have. One lease per existing context is the whole page cap.

Leaving the scout as a paragraph in the director prompt gives the scout the director's deadline. The short bound has to be a seat timer and a broker counter, so the scout is its own Luna medium seat and then it exits.

Attributing a background request to the Actor's most recent execution recreates the global pointer on a smaller map. After release, a late request is unowned. It still consumes the shared cap.

## Open questions and risks

Should the first scored pair keep the 180 second scout and the eight act page cap, or do you want both tighter before any native overlap check?

Is the residual cross-path Product collision acceptable for this pilot, or should write-effect jobs be limited to one while read-effect jobs use the other leases?

If an unscored MCP overlap check later shows `callTool` is safe for concurrent reads, should reads leave the MCP queue in a follow-up, or should the queue stay for the whole pilot?

## Next implementation step

Add the red proof that two Actor admissions keep their execution ids when a barrier yields between them, then delete the three globals in `serve.mjs` so that proof goes green.
