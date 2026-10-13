# Page review candidate

Caller of this runner is the parent arm. Serial and parallel use one workflow. The only experimental difference is `pageConcurrency`.

## Caller usage

`page-review` runs one scout seat, then one director seat, then page jobs the director assigns. Every seat is a real `gpt-6-luna` / `medium` process from `startSeat`. Builtin native children stay rejected. The arm does not call `beginExplorePass` and does not register a UI execution id.

Matched pair, same source, fresh outputs, same ledger file only across policies that already use it, same limits:

```javascript
await runArm({
  source,
  output: serialOutput,
  policy: 'page-review',
  pageConcurrency: 1,
  ledger,
  cli,
});

await runArm({
  source,
  output: parallelOutput,
  policy: 'page-review',
  pageConcurrency: 3,
  ledger,
  cli,
});
```

`pageConcurrency` is required for `page-review` and forbidden on every other policy. Legal values are 1, 2, and 3. The comparison uses 1 and 3. The director prompt is the same text in both arms. It tells the director to read `status.pageConcurrency` and `status.limits`. It does not say serial or parallel.

Legacy arms stay valid and keep their current stop kinds:

```javascript
await runArm({ source, output, policy: 'solo', ledger, cli });
await runArm({ source, output, policy: 'continuation-approx', ledger, cli });
await runArm({ source, output, policy: 'director-review', ledger, cli });
```

Passing `pageConcurrency` to those three throws before `/start`.

The director writes `ASSIGNMENT.json` and calls the existing wrapper. Explore assignment:

```json
{
  "token": "directory-emily",
  "mode": "explore",
  "actor": "Emily.dawson",
  "question": "Open the Directory path that is already visible in the cited snapshot. Save what that page shows. Stop at the host act cap.",
  "references": [],
  "page": {
    "path": "/directory",
    "evidence": {
      "kind": "snapshot",
      "executionId": "e001",
      "sourcePath": "C:/.../executions/e001/snapshot-Emily.dawson.json"
    }
  },
  "effect": "read",
  "conflictKeys": ["/directory"],
  "dependsOn": []
}
```

Recording assignment, after that explore job is closed:

```json
{
  "token": "directory-emily-record",
  "mode": "record",
  "actor": "Emily.dawson",
  "question": "Append the supported fact missing from the saved body. Use the closed capture. Do not act.",
  "references": ["e002"],
  "sourceExecution": "e002",
  "conflictKeys": ["/directory"],
  "dependsOn": ["e002"]
}
```

A second dispatch with the same token and the same bytes returns the same job object. A second dispatch with the same token and different bytes is a 400. It does not fence the arm and it does not launch another seat.

Director call sequence after its own `read_setup`:

```javascript
// node director.mjs scout
// node director.mjs dispatch assignment.json
// node director.mjs status
// node director.mjs handoff job.json
// node director.mjs finish stop.json
```

`finish` input stays `{ "reason": "...", "unfinished": [] }`. A closed page job is not an arm finish. `stop.json` still has to name the unfinished remainder of the original request.

`solo`, `continuation-approx`, and `director-review` do not gain `scout`, `page`, `effect`, or `conflictKeys`. Their assignment key set stays the one in `parseAssignment` today.

## Types

These aliases are the contract. The JavaScript stays in the existing modules. Branded strings are checked once in the parsers below.

```javascript
/**
 * @typedef {'Emily.dawson' | 'michael.reed' | 'hannah.blake'} ActorName
 * @typedef {`e${string}`} ExecutionId
 * @typedef {'solo' | 'continuation-approx' | 'director-review' | 'page-review'} Policy
 * @typedef {1 | 2 | 3} PageConcurrency
 * @typedef {'scout' | 'director' | 'worker' | 'record' | 'solo'} SeatRole
 * @typedef {'single' | 'capped'} DispatchMode
 * @typedef {'read' | 'write'} PageEffect
 */

/**
 * Copied synchronously at API admission, before any await.
 * requestActor comes from the Product bearer token.
 * executionId is the browser operation on contextActor, or null.
 * @typedef {{
 *   contextActor: ActorName,
 *   requestActor: ActorName | 'anonymous',
 *   executionId: ExecutionId | null,
 *   actionId: number | null,
 *   phase: 'preparation' | 'candidate' | 'inspection',
 *   accepted: boolean
 * }} ApiAdmission
 */

/**
 * @typedef {{
 *   executionId: ExecutionId,
 *   actor: ActorName,
 *   actionId: number,
 *   phase: 'candidate'
 * }} BrowserOperation
 */

/**
 * One slot per prepared Actor. The page and the context already exist.
 * operation is non-null only while that Actor's chain is inside act or scout goto.
 * quarantined stays set after a drain timeout. That Actor cannot be leased again.
 * @typedef {{
 *   actor: ActorName,
 *   inFlight: number,
 *   lastNetworkActivity: number,
 *   operation: BrowserOperation | null,
 *   lease: ExecutionId | null,
 *   quarantined: boolean
 * }} ActorNet
 */

/**
 * @typedef {{
 *   id: ExecutionId,
 *   actor: ActorName,
 *   role: 'scout' | 'worker' | 'record' | 'solo',
 *   recordOnly: boolean,
 *   releasedAt: string | null,
 *   admittedRequests: number
 * }} HostExecution
 */

/**
 * Legacy explore and record assignments. director-review and continuation-approx
 * accept this and reject unknown fields.
 * @typedef {{
 *   token: string,
 *   mode: 'explore' | 'record',
 *   actor: ActorName,
 *   question: string,
 *   references: ExecutionId[],
 *   sourceExecution?: ExecutionId
 * }} LegacyAssignment
 */

/**
 * @typedef {{
 *   kind: 'snapshot',
 *   executionId: ExecutionId,
 *   sourcePath: string
 * }} SnapshotEvidence
 */

/**
 * @typedef {{
 *   kind: 'knowledge',
 *   surfaceId: string
 * }} KnowledgeEvidence
 */

/**
 * page-review explore assignment. record mode must not carry page or effect.
 * @typedef {LegacyAssignment & {
 *   mode: 'explore',
 *   page: { path: string, evidence: SnapshotEvidence | KnowledgeEvidence },
 *   effect: PageEffect,
 *   conflictKeys: string[],
 *   dependsOn: ExecutionId[]
 * }} PageAssignment
 */

/**
 * @typedef {LegacyAssignment & {
 *   mode: 'record',
 *   sourceExecution: ExecutionId,
 *   conflictKeys: string[],
 *   dependsOn: ExecutionId[]
 * }} RecordAssignment
 */

/**
 * @typedef {{
 *   token: string,
 *   assignment: LegacyAssignment | PageAssignment | RecordAssignment,
 *   state: 'launching' | 'running' | 'closed' | 'not_started' | 'failed',
 *   kind: 'page' | 'record',
 *   executionId?: ExecutionId,
 *   actor?: ActorName,
 *   handoffReads: number,
 *   result?: object,
 *   error?: string
 * }} Job
 */

/**
 * Arm stop kinds already returned by coordinate stay.
 * page-review must not add a kind that treats one closed job as a finished request.
 * @typedef {{
 *   kind: 'clock' | 'budget' | 'director_finished' | 'director_exited' | 'failed' | 'solo_exited' | 'task_returned',
 *   detail?: string
 * }} ArmStop
 */
```

Dominant reads and writes:

- API admission reads `ActorNet.operation` for `contextActor` and increments the one `apiCount`. It never reads another Actor's slot and never subtracts two global snapshots.
- `act` writes `ActorNet.operation` for its leased Actor, then awaits Playwright. The matching `finally` clears that slot only after that Actor's `awaitQuiet`.
- Status reads `apiCount`, the clock, and a copy of the execution list. It does not enter an Actor chain or the MCP chain.
- Knowledge `callTool` is the only user of the MCP chain. Browser waits are not on that chain.
- Handoff reads the job's issued capture map, including refs registered from a failed `act`, then pages public saved bodies to completion.
- Finalization reads every Actor chain and the MCP chain, then writes the export. It does not run while a required Job is open.

There is no second index to rebuild. `issuedCaptures` stays the execution-keyed map that already exists. `admittedRequests` is incremented in the same synchronous admission that increments `apiCount`, and only when `admission.executionId` is non-null.

## Signatures and module map

No new scheduler module. The change stays in the runner files that already own these steps.

```javascript
export const pageReviewLimits = {
  scoutMs: 180_000,
  scoutSnapshots: 3,
  scoutGotos: 6,
  pageActCap: 8,
  pageMs: 8 * 60_000,
  maxActors: 3,
};

export function parseAssignment(input, actors, executions) { throw new Error('not implemented'); }
export function parsePageAssignment(input, actors, executions, issuedCaptures, knowledgeText) { throw new Error('not implemented'); }

export class Dispatches {
  constructor(mode) { this.mode = mode; this.jobs = new Map(); this.fenced = false; }
  start(token, launch) { throw new Error('not implemented'); }
  close(token, closure) { throw new Error('not implemented'); }
  cancelUnlaunched(token) { throw new Error('not implemented'); }
  assertClosed() { throw new Error('not implemented'); }
}

export function admitApi(state, contextActor, requestActor) { throw new Error('not implemented'); }
export function releaseExecution(state, executionId) { throw new Error('not implemented'); }
```

`parseAssignment` keeps today's body and today's error text. `parsePageAssignment` is a separate function. `page-review` calls it. The other policies do not.

`Dispatches` mode `'single'` keeps today's `active` token, today's "Close the current child before another dispatch", and today's close, cancel, and assert behavior. `director-review` and `continuation-approx` construct that mode. Mode `'capped'` takes `{ pageConcurrency }`. Page jobs use a set whose size cannot pass `pageConcurrency`. Record jobs use one extra slot and do not consume a page seat. A record job may overlap page jobs. `'single'` does not gain that overlap.

Module map:

- `coordination-boundary.mjs` holds `pageReviewLimits`, both parsers, `Capabilities` for the scout role and the grace denials, and `Dispatches`.
- `coordination.mjs` holds the `page-review` branch, scout launch, failure-capture registration, and handoff paging. The `continuation-approx` branch still calls `beginExplorePass`. The new branch does not import that call into its path.
- `serve.mjs` holds `ActorNet`, the Actor chains, the MCP chain, `admitApi`, and targeted release. `log` takes an explicit admission or execution id. It does not read a process-wide current execution, Actor, or action.
- `coordinated-access.mjs` adds the `page-review` ACCESS paragraph and the `scout` director command. The `director-review` command string stays the current text.
- `shutdown.mjs` releases each live execution by id after that Actor's drain, then keeps the current finalize rule.
- `settle.mjs`, `native-seat.mjs`, `owned-process.mjs`, and `access.mjs` stay as they are. `awaitQuiet` already takes getters. Each Actor passes its own `inFlight` and `lastNetworkActivity`.
- New proofs live in `page-attribution-proof.mjs` and `native-overlap-proof.mjs`.

`Capabilities.authorize` additions, all at the broker boundary:

- Role `scout` may `snapshot`, and may `goto` only under the scout caps below. It cannot `fill`, `select`, `check`, `press`, `click`, `reload`, `back`, `waitVisible`, `screenshot`, dispatch, finish, or call `record_*`.
- After the explore clock, every role loses `act`, `snapshot`, and `screenshot`. `captures` and `network` still return stored refs and the existing journal. `record_*`, public reads, and `import_evidence` stay available until the 45 minute mark. This closes the grace hole where snapshot and screenshot still observed live UI.
- A `record` seat still cannot open `/browser`. That check stays.
- A director token on `/browser`, including a worker wrapper run from the director cwd, still fails with the current browser rejection. The wrapper still reads `PERQUIRO_SEAT_TOKEN` from the environment. The broker still rejects a caller-supplied `role`.

Host routes:

- `/host` `begin` without `concurrent: true` still throws `Release the completed worker before starting another execution` when any execution is live. Solo and continuation use this path.
- `/host` `begin` with `concurrent: true` is sent only by the `page-review` broker, which is the supervisor. It leases `input.actor` when that Actor's `lease` is null and `quarantined` is false, and when the live page-lease count is below `pageConcurrency`. The same Actor throws `Actor browser is already leased`.
- `/host` `status` keeps `activeExecution` when exactly one execution is live, with the same resume fields solo recovery already reads. When zero or several are live, `activeExecution` is null. Capped mode also returns `activeExecutions`, `pageConcurrency`, and `limits`. Solo's one-live responses gain no required field and drop none.
- `/force-release` with `executionId` drains that Actor, then clears that lease and operation. A second call for an already released id returns `{ released: id }` and does not touch another Actor. Omitting `executionId` is legal only when zero or one execution is live, which is the solo and shutdown shape today. Omitting it while two leases are live throws.
- `/finish-explore` waits for every Actor chain, every Actor quiet period, and the MCP chain, then writes the export. A drain timeout skips the export.

Scout sequence inside `coordinate` for `page-review` only:

1. Clock is already running from `/start`. Do not start it again.
2. Launch the scout seat through the existing `launch` helper, so it is already in `session.seats` when `shutdown` joins every tree. Its `endAt` is `min(exploreEndAt, now + scoutMs)`.
3. Scout execution id is issued first. It gets no durable page lease. Each scout `snapshot` or allowed `goto` installs `BrowserOperation` on that Actor for the call, then clears it after that Actor is quiet.
4. Identity mismatch or unconfirmed closure fences the arm before the director starts.
5. A scout deadline is an expected stop. Keep whatever snapshot files were hashed. Start the director.
6. Drain every Actor before the first page `begin`, so a late scout request cannot receive a worker execution id.

Scout broker caps, counted in `authorize` and in the host:

- At most one `snapshot` per prepared Actor, three total.
- At most six `goto` actions. The path must already occur in a snapshot file this scout execution issued for that same Actor.
- No other action kind.
- Wall clock 180 seconds from scout seat start, and never past `exploreEndAt`.

Those gotos increment the shared `apiCount`. They do not reset it.

Page jobs:

- `parsePageAssignment` requires `page.path` to occur in the cited snapshot file's `ui` or `url`, or in the public Knowledge text the broker just read for `surfaceId`. The cited snapshot execution must be the scout execution or a closed execution. An open worker capture cannot be cited.
- `conflictKeys` is non-empty. Every key occurs in that same cited text. The active key set rejects overlap with any launching or running job.
- `effect: 'write'` uses the same rule. `effect: 'read'` is still a page lease and still counts toward `pageConcurrency`.
- `dependsOn` entries are closed issued executions. A missing or open id rejects the dispatch.
- The worker seat `endAt` is `min(exploreEndAt, now + pageMs)`. `authorize` rejects the 9th `act`. Hitting either bound stops that seat, closes that Job after real closure, and leaves the arm running.
- One live lease per Actor. Three prepared contexts are the hard ceiling, so `pageConcurrency` cannot exceed 3.

Record jobs:

- Same Actor and closed `sourceExecution`, as today.
- `conflictKeys` must be a subset of the source execution's keys. Recording cannot name a new Product target.
- Overlap with an active key rejects the dispatch.
- No page lease, no `/browser`, no new Product request. `admittedRequests` on a record execution stays 0. The existing assertion that record and explore `startingApiRequests` match at the end of a record job still describes this.
- Seat `endAt` is the arm's 45 minute mark. There is no private request budget.

Handoff for `page-review`:

- Still requires `job.state === 'closed'`.
- Returns issued capture refs for successes and failures, saved Observation ids, and the worker `HANDOFF.md` text with the existing 32000 character slice.
- The broker, using the supervisor token, pages `read_knowledge_context` and `read_explore` until complete for those saved ids and puts those pages on the handoff result. The saved-body array is not sliced.
- `handoffReads` increments. `finish` throws until every closed Job has `handoffReads >= 1` and the director has called `scout` once.
- The review instruction stays a comparison of those full bodies with the capture files. Evidence links are provenance. The broker cannot prove the model judged the prose. It can prove the bodies were fetched and the handoff was read.

Shared Product rows stay shared. Conflict keys are visible labels from cited evidence, usually the page path. Two workers can still change one database row through two paths. That residual stays. The broker does not grow a Product lock manager to guess it.

MCP:

- One chain around `mcp.client.callTool` and `listTools`.
- Reads and writes both use it. The client has not been shown safe for overlap, so the chain is the writer boundary.
- A worker's `awaitQuiet` does not enter this chain. Status does not enter it. Another Actor's `act` does not enter it.

Attribution:

```javascript
export function admitApi(state, contextActor, requestActor) {
  const net = state.actorNets.get(contextActor);
  const executionId = net.operation?.executionId ?? null;
  const actionId = net.operation?.actionId ?? null;
  let accepted = false;
  if (state.phase === 'candidate' && !state.explorationClosed() && state.apiCount < 40) {
    state.apiCount += 1;
    if (executionId) state.executions.get(executionId).admittedRequests += 1;
    accepted = true;
  }
  return Object.freeze({
    contextActor,
    requestActor,
    executionId,
    actionId,
    phase: state.phase,
    accepted,
  });
}
```

The real function returns the frozen admission and performs the cap update before the route awaits `route.fetch`, a proof barrier, or anything else. `/api/reset` still returns 403 before this function runs. A closed explore clock returns `accepted: false` and still logs that admission. A full cap does the same and increments the existing `refused` counter without incrementing `apiCount`. `requestActor` stays a separate field from `executionId` on the event. Event field names `workerExecutionId` and `browserActionId` stay. Their values come from the admission. A later read of another Actor's slot cannot change them.

A request that enters after `operation` is cleared is `executionId: null`. It still consumes the shared cap when admitted. It is not charged to the record execution, the next lease, or some other Actor. A callback that already entered `admitApi` keeps the admission it froze, including across a later lease change.

`actionCount` and `eventNumber` stay process-wide and increment synchronously inside the logger and the act start. They are ids, not owners.

Failure captures:

- The host error body already carries `browserPayload.captureRefs`. Solo preflight compares that set. Do not add a new error file to it.
- The broker's forward path parses the host JSON on both 200 and 400. It hashes and stores every `captureRefs` path, and any `captures` source path not already in that list, under the execution id, with `{ failed: responseIsError }`.
- The worker wrapper still exits non-zero on a 400. Its stdout JSON still contains those `captureRefs`, so import can name them.
- `import_evidence` keeps the exact path, realpath, sha256, Actor, platform, unknown version, and accepted Observation checks. A failed-action ref is eligible when it was issued for that execution, or for the record source execution when the seat role is `record`.

Release:

```javascript
export async function releaseExecution(state, executionId) {
  const execution = state.executions.get(executionId);
  if (!execution || execution.releasedAt) return { released: execution?.id ?? null };
  execution.admitting = false;
  await state.actorChains.get(execution.actor);
  await awaitQuiet({
    getInFlight: () => state.actorNets.get(execution.actor).inFlight,
    getLastNetworkActivity: () => state.actorNets.get(execution.actor).lastNetworkActivity,
  });
  const net = state.actorNets.get(execution.actor);
  if (net.lease === executionId) net.lease = null;
  if (net.operation?.executionId === executionId) net.operation = null;
  execution.releasedAt = new Date().toISOString();
  return { released: executionId };
}
```

On quiet timeout the Actor's `quarantined` flag is set, the lease stays, and the arm fences. Shutdown then skips `/finish-explore` and skips admission of the packet. Captures already hashed stay on disk.

`runArm` still refuses a dirty worktree and still writes `freeze.json` before coordinate. `page-review` does not add a scored precondition.

Codex `--sandbox workspace-write` stays on every seat, including scout, because `startSeat` stays unchanged. That flag is not the authority boundary. The seat token is. Task API isolation is not a same-user OS sandbox.

## Invariants

1. `activeExecution`, `currentActor`, and `activeBrowserAction` are not read to decide who owns a request, a capture, or a release. Identity is the execution id on the request plus the `ActorNet` slot for that context Actor.
2. Check and increment of the shared 40 happen in one synchronous block. There is no per-worker reset and no second allowance.
3. The 40 minute clock starts at the existing `/start` and includes scout, director, handoffs, and jobs. The five minute grace is the existing recording window. Grace can read and record from old captures. Grace cannot `act`, `snapshot`, or `screenshot`.
4. A page Job reaching `closed` does not set the arm stop. Only the director seat's own end, a shared budget or clock stop, or a fence does.
5. Duplicate tokens are idempotent. Conflicting tokens reject without fencing. Unknown native identity, unconfirmed Job or server closure, a required seat's unexpected non-zero exit, and a drain timeout fence the arm and skip export.
6. Expected deadline and budget stops retain hashed captures and saved Knowledge. `stop.kind` stays `clock` or `budget`. Bodies are not rewritten. Export still waits until every required seat and the server tree report `kind: 'closed'`.
7. Every required closure receipt used for export has `proof: 'windows_job_zero_active'`. A process exit without that proof does not finalize.
8. Director review of a `page-review` arm is a completed `scout` read plus a handoff read of full public bodies for every closed Job. The director token never becomes a worker token by invoking `browser.mjs` or `tools.mjs`.
9. Solo status with one live execution, the solo single-action recovery paths, `continuation-approx`, and `director-review` authorization text and role set stay. `verifyAccess` still sees exactly `director`, `worker`, and `record` on `director-review`.
10. A design vote, a larger diff, or a green proof is not a coverage improvement.

## Implementation and proof plan

Order is the proof order. Each red run is the current checkout, or the new assertion applied before the matching change. Each green run is that assertion after the change. Proofs use `PERQUIRO_PROOF_CLOCK`, the real Product process, generated `browser.mjs` from `writeExecutionAccess`, and the supervisor control port. They do not use a native model. They do not grade.

1. Delayed admission. Arm a proof barrier inside the Actor route after `admitApi` returns. Start a generated `act` on Actor A so the route freezes A's execution id and then waits. While it waits, lease Actor B and finish a generated `act` whose Product response is not held. Release A's barrier. Read `events.jsonl`. A's product event keeps A's `workerExecutionId` and `actionId`. B's event keeps B's. The red order, read the owner after the barrier, fails this assertion. Also fire one request after A's release and before any new operation on A. That event has `workerExecutionId: null` and B's id nowhere on it.
2. Shared cap. `smoke-time` sets `apiRequests` to 39. Two generated acts on two Actors overlap. Ending `apiCount` is 40 and `refused` is 1. The refused event still carries its own admission. Neither execution's `admittedRequests` equals the global counter.
3. Status during settle. Hold A's quiet barrier for two seconds. `POST /host` status returns within 500 ms. A generated act on B completes during the hold. The MCP `read_setup` from the director token also completes during the hold.
4. Concurrency. `pageConcurrency: 1` rejects a second page dispatch with a different Actor while the first Job is `running`, and returns the same job for a duplicate token. `pageConcurrency: 3` admits a second and third Actor and rejects a second lease of the first Actor. A fourth page dispatch rejects. `director-review` still rejects any second child, including a record child, while the first is active.
5. Evidence and keys. A page path absent from the cited snapshot rejects. A `fill` during scout rejects. The seventh scout `goto` rejects. A fourth scout snapshot rejects. An explore dispatch before `director.mjs scout` rejects. `finish` before handoff rejects. Two live jobs with the same `/directory` key reject.
6. Failure refs. A generated `act` that fails after the host has produced `captureRefs` exits non-zero, prints those refs, and leaves them hashed in the broker map with `failed: true`. `import_evidence` accepts that path for an Observation accepted on that execution. A director token running that same `browser.mjs` is still rejected and adds no capture.
7. Grace. At 40 minutes plus 30 seconds, explore `begin` and `act` and `snapshot` reject, record `begin` still works, and a record seat's browser command rejects with no `apiCount` change. At 45 minutes, `record_surface` rejects. This extends `lifecycle-proof.mjs`'s existing grace assertions. It does not replace them.
8. Fence and export. A fixture `page-review` arm at `pageConcurrency: 3` launches scout, director, three page fixtures, and one record fixture through `launchOwned`. Export's `manifest.finishedAt` is absent until every seat receipt and the server receipt have `kind: 'closed'` and `proof: 'windows_job_zero_active'`. Killing one worker tree, or failing one identity check, leaves `finishedAt` unset and `dispatches.fenced` true. A clock stop after real closures still exports, with `stop.kind === 'clock'`, and does not rewrite saved records.
9. Legacy. Existing `coordination-proof.mjs` policies `solo`, `continuation-approx`, and `director-review` stay green without editing their expected role set, request counts, or access text.

Unscored native overlap check, separate from any scored start. `native-overlap-proof.mjs` launches two real `startSeat` processes on `gpt-6-luna` / `medium`, with builtin children forbidden. They overlap in wall clock, each calls the broker with its own token, and both receipts have `proof: 'windows_job_zero_active'`. The script writes `overlap-proof.json` beside the supervision directory. It does not call `runArm`, does not open a scored output, and does not read grades. The parent runs it before the next scored `page-review` pair. The scored pair still differs only by `pageConcurrency`.

Passing these proofs, or preferring this writeup, does not increase saved complete checks. The parent grades that later, if at all.
