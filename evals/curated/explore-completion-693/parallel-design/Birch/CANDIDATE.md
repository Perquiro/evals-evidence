# Caller usage

The parent chooses `page-tasks` once for each fresh arm. The same workflow runs a short scout, a director, bounded page jobs, and capture-based recording jobs. Concurrency changes how many eligible task Jobs may be active. All seats are external `gpt-6-luna` with `medium` effort.

```js
import { runArm } from './scripts/explore-completion-693/coordination.mjs';

await runArm({
  source, output, ledger, cli,            // Parent-owned fresh, frozen inputs.
  policy: 'page-tasks',
  concurrency: matchedArmConcurrency,     // 1 for serial, 3 for parallel.
});
```

The parent holds the organic request, Product, Project preparation, date, source, assets, scoring, and launch ledger fixed. Each arm has its own fresh output. Changing concurrency must not change prompts, scout bounds, task bounds, authority, saving rules, or completion criteria.

The director gets a published scout handoff after native closure and browser drain. It chooses an actual rendered page, a fixed Actor, and a bounded question. Actor availability is something the explorer observes. A route seen by another Actor does not establish access.

```js
// ASSIGNMENT.json, passed to node director.mjs dispatch ASSIGNMENT.json.
const assignment = {
  token: 'page-01',
  mode: 'explore',
  actor: selectedActor,
  question: 'Record the displayed controls and a bounded answer to the selected question.',
  references: [scout.executionId],
  page: { path: observedPath, basis: [{ kind: 'capture', key: navCaptureKey }] },
  access: 'read-page',
  after: [],
};
```

Dispatch returns a Job immediately. A duplicate token with the same parsed assignment returns that Job, including after closure. A conflicting assignment rejects. Busy slots, occupied Actors, unfinished dependencies, and conflicting Product access return a refusal without launching or queuing a seat. The director polls status and tries eligible work with the same token. It never gains browser or write authority.

After a page Job closes, the director reads its exact captures and every full public saved body. A supported omission gets a recording Job.

```js
const repair = {
  token: 'record-01',
  mode: 'record',
  actor: pageJob.actor,
  question: missingSupportedFacts,
  references: [pageJob.executionId],
  sourceExecution: pageJob.executionId,
  captures: issuedCaptureKeys,
};
```

Recording uses only those exact closed same-Actor captures and named public saved records. It can append supported Knowledge and import Evidence linked to its own accepted Observations. It cannot navigate, snapshot, screenshot, settle, request Product state, declare or resolve another attempted action, or replay a mutation. A local Job returning never completes the original request.

# Core shapes

These are design sketches for the private JavaScript runner, not new production types. Branded names denote values parsed or issued at a boundary. Existing MCP schemas remain authoritative for tool arguments and results.

```ts
type ExecutionId = string & { readonly __brand: 'PrivateExecutionId' };
type JobToken = string & { readonly __brand: 'DispatchToken' };
type CaptureKey = string & { readonly __brand: 'IssuedCaptureKey' };
type ActorName = string & { readonly __brand: 'PreparedActorName' };
type LeaseEpoch = number & { readonly __brand: 'LeaseEpoch' };
type ActionId = number & { readonly __brand: 'ActionId' };
type Concurrency = 1 | 2 | 3;

type ClosedPublicBasis =
  | { kind: 'capture'; key: CaptureKey }
  | { kind: 'knowledge'; readBack: PublicReadArguments };
type CommonAssignment = {
  token: JobToken; actor: ActorName; question: string;
  references: readonly ExecutionId[];
};
type Assignment =
  | CommonAssignment & {
      mode: 'explore';
      page: { path: string; basis: readonly ClosedPublicBasis[] };
      access: 'read-page' | 'exclusive-product';
      after: readonly JobToken[];
    }
  | CommonAssignment & {
      mode: 'record'; sourceExecution: ExecutionId;
      captures: readonly CaptureKey[];
    };

type ArmPhase =
  | { kind: 'exploring' }
  | { kind: 'saving'; reason: 'requests' | 'clock' | 'director' }
  | { kind: 'closing' }
  | { kind: 'fenced'; reason: string };
type TaskStop =
  | { kind: 'task-returned' }
  | { kind: 'local-limit'; limit: 'requests' | 'actions' | 'time' }
  | { kind: 'arm-limit'; limit: 'requests' | 'clock' }
  | { kind: 'failed'; detail: string };
type JobState =
  | { kind: 'reserved' }
  | { kind: 'running'; executionId: ExecutionId; seat: NativeSeat }
  | { kind: 'draining'; executionId: ExecutionId; native: VerifiedTreeClosure }
  | { kind: 'closed'; handoff: PublishedHandoff; stop: TaskStop }
  | { kind: 'not-started'; reason: 'allowance-ended' }
  | { kind: 'failed'; detail: string };
type ScoutTask = { kind: 'scout'; actor: ActorName; seed: RenderedSeedView };
type Job = { task: ScoutTask | { kind: 'assigned'; assignment: Assignment }; state: JobState };

type LeaseIdentity = Readonly<{
  actor: ActorName; executionId: ExecutionId; epoch: LeaseEpoch;
}>;
type PageLease = {
  identity: LeaseIdentity; page: Page;
  state: 'open' | 'draining' | 'retired';
  browserTail: Promise<void>;
  operations: Set<Promise<unknown>>;
  routes: Set<Promise<unknown>>;
  inFlight: number; lastNetworkActivity: number;
};
type ActorSlot =
  | { kind: 'reserved'; identity: LeaseIdentity }
  | { kind: 'leased'; lease: PageLease };
type OperationContext = Readonly<{
  owner: LeaseIdentity; actionId: ActionId | null;
}>;
type RequestContext = Readonly<{
  owner: LeaseIdentity;
  actualActor: VerifiedRequestActor;
  association: { kind: 'unproven'; overlapsActionId: ActionId | null };
  admittedAt: number; phaseAtAdmission: ArmPhase['kind'];
  requestNo: number;
}>;
type IssuedCapture = Readonly<{
  key: CaptureKey; sourcePath: string; sha256: string;
  executionId: ExecutionId; actor: ActorName; epoch: LeaseEpoch;
  actionId: ActionId; eventId: number;
  stage: 'immediate' | 'after' | 'failure';
  capturedAt: string; settled: boolean;
}>;
type Execution = {
  id: ExecutionId; actor: ActorName; workingDirectory: string;
  authority:
    | { kind: 'scout'; lease: PageLease }
    | { kind: 'explore'; lease: PageLease; assignment: Extract<Assignment, { mode: 'explore' }> }
    | { kind: 'record'; source: ClosedCaptureGrant };
  limits: TaskLimits;
  captures: Map<CaptureKey, IssuedCapture>;
  latestCaptureKeys: readonly CaptureKey[];
  acceptedObservationIds: Set<string>;
  dispatchedRequests: number; refusedRequests: number;
  closedHandoff: PublishedHandoff | null;
};
type Arm = {
  phase: ArmPhase; startedAt: number; exploreEndAt: number; saveEndAt: number;
  apiCount: number; refused: number; eventNumber: number; actionNumber: number;
  concurrency: Concurrency;
  jobs: Map<JobToken, Job>;
  executions: Map<ExecutionId, Execution>;
  actors: Map<ActorName, PreparedBrowserContext>;
  leases: Map<ActorName, ActorSlot>;
  pageOwners: WeakMap<Page, LeaseIdentity>;
  knowledgeTail: Promise<void>;
  seats: NativeSeat[];
};
```

`PublicReadArguments`, `VerifiedRequestActor`, `TaskLimits`, `RenderedSeedView`, and `ClosedCaptureGrant` are validated runner boundary values. A rendered seed is a retained preparation UI view, not an importable execution capture. A record grant contains a closed source execution, its Actor, exact allowed capture entries, and saved-record references. It contains no Page. `VerifiedTreeClosure` requires both effective model proof and confirmed Windows process-tree closure. Native closure alone does not produce a published handoff.

The dominant lookups are direct. A wrapper token selects authority and execution. An execution selects its own captures and accepted IDs. A request's Page selects an immutable lease identity. Actor admission checks the lease map. Job tokens select dispatch receipts and closed dependencies. Request totals come from admission events keyed by execution, never from global counter differences.

# Signatures and module map

Keep the normal call path as wrapper, broker, host. Add one runner helper, `execution-host.mjs`, for lease ownership and request admission. This is not a reusable scheduler. There are no worker pools, retry queues, live handoff protocols, or durable scheduling service.

```ts
// coordination-boundary.mjs. External inputs are unknown until parsed.
function parsePageAssignment(input: unknown, issued: IssuedState): Assignment;
function authorize(token: string, route: string, input: unknown): SeatAuthority;
function reserveDispatch(arm: Arm, assignment: Assignment): DispatchReceipt;
function enterSaving(arm: Arm, reason: SavingReason): void;

// coordination.mjs. No Core pass or UI execution registration in page-tasks.
async function coordinatePageTasks(session: Session, concurrency: Concurrency): Promise<ArmStop>;
function dispatch(assignment: Assignment): JobReceipt;
async function publishClosedJob(job: Job): Promise<PublishedHandoff>;
async function readHandoff(job: ClosedJob): Promise<ReviewInput>;
function acceptDirectorFinish(input: unknown, state: IssuedState): ArmStop;

// execution-host.mjs, called directly by serve.mjs.
async function beginPageExecution(input: AuthorizedBegin): Promise<ExecutionReceipt>;
async function operate(ctx: OperationContext, input: BrowserCommand): Promise<BrowserEnvelope>;
function admitRequest(lease: LeaseIdentity, request: ObservedRequest): RequestAdmission;
async function drainAndRelease(input: AuthorizedTargetedRelease): Promise<ClosedExecution>;
async function callKnowledge(input: AuthorizedToolCall): Promise<McpEnvelope>;

// coordinated-access.mjs. Tokens never appear in generated wrapper bodies.
function writeRootAccess(...): void;
function writeExecutionAccess(...): string;

// shutdown.mjs. Final artifacts are admitted only after every closure proof.
async function shutdownPageTasks(input: ShutdownInput): Promise<FinalizationReceipt>;
```

Bodies remain unimplemented in this package. `admitRequest` must perform every cap check and increment synchronously before the first asynchronous fetch. `drainAndRelease` must seal the execution before allowing a successor lease.

| File | Bounded change |
| --- | --- |
| `coordination.mjs` | Add `page-tasks` workflow, scout launch, bounded concurrent dispatch, closed handoffs, director review receipts, and aggregate stop handling. Keep existing policy branches. |
| `coordination-boundary.mjs` | Parse new assignments, add scout and grace permissions, replace the single active child only for this workflow, preserve token conflict checks and fencing. |
| `execution-host.mjs` | Own per-execution/Actor state, immutable operation and request contexts, request admission, page-local queues and targeted drain. |
| `serve.mjs` | Delegate the new private mode to that helper. Keep global accounting and explicit event append. Remove the whole-handler queue for this mode. Retain the legacy serial adapter and response format. |
| `coordinated-access.mjs` | Generate role-specific help and wrappers for the new fields and restrictions. Preserve local help and canonical top-level single-action array errors. |
| `native-seat.mjs`, `owned-process.mjs` | Reuse real external Luna/medium launch, env injection and Windows Job supervision. Add bounded stop reasons without accepting unknown identity. |
| `shutdown.mjs` | Join the complete seat/Job set, drain each execution, stage readback, close the server tree, then admit final artifacts. |

The parent enables the new host mode through supervisor-owned session configuration. A caller cannot select it by claiming a role or passing host flags. No Core, Skill, Product, production process-tree, domain-document, or scoring change is required. The new workflow never calls `beginExplorePass` and never registers a fake UI UUID.

# Workflow and hard bounds

The clock starts at the existing `/start`, before any native scout startup. All startup, model work, dispatch, planning, handoffs, page work, saving, and director review share it.

| Seat/task | Host-enforced bound |
| --- | --- |
| Scout | One fixed Actor. At most 4 dispatched application requests and 3 navigation actions. Navigation admission ends at arm start +120 seconds. Native hard stop is +150 seconds and publication/drain must finish by +180 seconds. All bounds include startup; unconfirmed closure/drain fences the arm. |
| Director | Luna/medium until the shared +45-minute endpoint. No Product browser authority or Knowledge write authority. |
| Page Job | At most 8 dispatched requests and 6 intentional actions. Discovery ends at the earlier of dispatch +5 minutes or arm +40 minutes. Seat stop is the earlier of dispatch +6 minutes or arm +45 minutes. |
| Recording Job | Zero Product requests or browser actions. Seat stop is the earlier of dispatch +2 minutes or arm +45 minutes. |
| Whole arm | At most 40 dispatched application requests. No Product discovery after +40 minutes. Saving only until +45 minutes. No reset or per-worker renewal. |

These task ceilings are subsets of the shared allowance. They reserve no requests and guarantee no worker a private share. Refusals do not increment dispatched counts. Automatic application fetches consume both the global counter and the owning execution's task ceiling. Static assets and Knowledge calls retain existing accounting.

The host launches the scout as an explicitly required native seat. It gets the initial rendered location, existing public Knowledge, and read-only navigation controls. It can follow only links/paths witnessed in those inputs or its own captures. It cannot submit forms, change Product records, enumerate guessed routes, or keep exploring after its bound. Its handoff maps visible navigation, page purposes, Actor uncertainty, and useful questions. Missing output leaves the map partial; it does not trigger a second scout or an invented inventory. A verified, confirmed closure caused by an enforced scout/task bound is an expected local limit.

After the scout closes and drains, the host launches the director. The director issues page assignments from published rendered UI or full public Knowledge. Every assignment names its entry page, supporting basis, Actor, question, access mode, and closed dependencies. Scope is one entry page and the stated bounded outcome. Navigation beyond that scope requires a later assignment. The question cannot create a route, control, permission, or precondition that the basis does not support.

The broker reserves the Job token, task slot, Actor claim, and Product access mode synchronously before host or native startup. Host begin independently reserves its Actor slot before awaiting Page creation. A reservation remains occupied through drain. At most `concurrency` task Jobs are reserved/running/draining, counting explorer and record Jobs. Scout is an exclusive startup phase. Each active page worker has a different Actor and its own Page lease. Recording has no browser lease. The director may review a closed Job while other Actors work, then fill an eligible slot. References always name closed published executions. No worker reads another worker's live files.

A `read-page` Job permits observed navigation and inspection. The host independently refuses non-read application methods before dispatch, even if the worker calls an action a read. Any uncertain action or operation that may change Product records requires `exclusive-product`. Such a Job starts only after all other page leases have closed and drained; no new page Job starts until it releases. Recording can overlap because it reads old captures and writes Knowledge. This conservative admission rule protects shared records and state-dependent reads without a record-lock framework.

Dependencies name closed Jobs, not optimistic plans. Before a mutation, the worker verifies the named public precondition through its own current rendered UI within its remaining allowance. Changed or unknown preconditions become unfinished work. It never assumes that another Job succeeded, that its old capture is current Product state, or that a failed mutation is safe to retry. Reclassification from read to mutation requires closing the read Job and issuing an exclusive assignment.

# Execution and request ownership

The new host does not consult `activeExecution`, `currentActor`, or `activeBrowserAction` for identity. Every browser command captures an immutable operation context before awaiting anything. Snapshot helpers take the Page and Actor explicitly. Action logs and capture paths use that context's execution and globally unique action ID throughout success and failure. No async continuation reads a mutable current owner.

Each Actor retains its prepared authenticated browser context. Before `/start`, the host retains the rendered seed views and closes preparation Pages. A lease gets a fresh Page in the same authenticated context. Opening it loads no Product path implicitly. The worker's explicit navigation consumes normal requests and actions. A retired Page is never rebound to a successor execution.

The context interceptor resolves Page ownership and freezes request context before fetching. Its closure keeps that lease identity through response, error, fulfillment, and decrement. Request Actor identity stays separate from execution ownership. Unknown credentials or a mismatch do not fall back to the lease Actor. They reject before dispatch and fence the arm when identity cannot be established.

An API request is not proven to have been caused by the latest browser action. Automatic requests use `association.kind = 'unproven'`. An optional `overlapsActionId` records the operation interval in which interception began. It is diagnostic ordering, not causal attribution. Captures still carry the exact intentional action ID. A timer beginning during the next action belongs to the same immutable Page lease and remains causally unproven. A response completing while another Actor operates retains its original execution, request number, Actor, and admission phase.

Keep Page-owner entries for the arm's lifetime. Requests from draining/retired Pages are refused before reaching Product and logged against the old execution. Unowned application requests after preparation are refused; unexplained ownership fences the arm. Service workers, popups, and other network channels must either be disabled/contained by the pinned browser setup or receive the same accountable ownership before any Product dispatch. The unscored capability gate must prove this containment; unsupported channels do not become an unmetered fallback.

Each lease has its own operation queue, route set, in-flight count, and network activity time. `awaitQuiet` receives that lease's getters. One noisy Actor cannot postpone another Actor's settled capture. Quiet is a bounded observation window, not proof that no timer can ever fire. New discovery requires an open lease and current task/arm admission. A late request cannot silently revive a stopped task.

Release targets `{executionId, epoch}`. It first stops browser admission, waits for the current operation and known admitted routes, closes that Page to terminate future page callbacks, and joins remaining route/capture/MCP bookkeeping. Request timeout, page-close error, or incomplete drain cannot produce a closed handoff or free the Actor for reuse. Repeated release returns the same confirmed receipt. Release never clears another Actor's ownership.

Actual operation admission rechecks authority, lease state, and absolute deadlines when a queued command starts. Capture publication checks the exploration cutoff after every asynchronous browser read. Queued Knowledge calls check their saving deadline before starting. An earlier HTTP arrival never extends an allowance.

Status and dispatch admission execute independently of browser queues. Global event IDs and request numbers are reserved synchronously. A journal append has explicit context, including null ownership for host events. There is no default owner supplied by `log`.

# Capture, Knowledge, and review invariants

1. Browser success and error replies both carry a typed envelope with capture references. The broker reads the body, validates and registers every issued reference and hash, then propagates the operation error. A failed action can retain an immediate or failure capture without inventing a settled outcome. If failure capture itself fails, retain the last valid references with their original action IDs and report the missing capture. Never relabel a previous capture as the failed action.

2. Capture ownership is execution + Actor + lease epoch + action + event. Real path, exact issued path, unchanged SHA-256, browser Platform, exact Actor name/ID, and omitted unknown Product version remain mandatory. An observed exact version requires a matching adapter and review before this treatment can run. No body rewriting or guard weakening supplies a missing fact.

3. Accepted Observation IDs belong to the execution whose authorized MCP call returned them. Evidence import accepts only that execution's accepted IDs. A recording execution can reuse only its declared closed same-Actor source captures and links them to its own newly accepted Observations. Knowledge being shared does not widen its capture grant.

4. Use one short FIFO at the existing shared MCP/Project writer boundary. Initially serialize both reads and writes through this single MCP session to preserve its ordering contract. The queued operation includes mutation result parsing and accepted-ID registration before its caller gets a receipt. It holds no browser, Actor, status, dispatch, or native-identity wait. There are no automatic retries of ambiguous writes. Final readback has a writer barrier.

5. The director gets every successful and failed-action capture reference, hashes, accepted IDs, Evidence IDs, task stop, resulting state, and concrete unfinished work after closure. It reads original bodies and exact public saved records through their full readback arguments, including all required pagination. Handoff summaries and Evidence links are insufficient.

6. A review receipt enumerates each issued capture, exact saved records read, supported missing facts, recording Jobs issued, and unresolved limitations. The broker checks enumeration and closure, not semantic truth. The director must compare material immediate/settled context, attempted action, visible result, and relevant network facts already captured. Blind grading remains the independent semantic check.

7. A director finish requires every reserved/required Job to be terminal, every published handoff reviewed, every required recording Job closed, and concrete unfinished/unknown work retained. It reports known-work disposition, not whole-Product completeness. Missing inventory stays unknown. Budget/deadline stop preserves accumulated facts with an incomplete disposition.

# Saving, failures, and finalization

At request exhaustion, stop new Product actions and requests across all Actors. Already dispatched work may finish and issue its attributed captures while the exploration clock remains open. Then retire the Pages. This does not grant a 41st request or another action.

At +40 minutes, stop every Product browser read as well as action admission. Snapshot, screenshot, settle-as-discovery, and new captures are closed at both broker and host boundaries. An async snapshot that crosses this deadline is not newly published as a recording source. Old issued capture files, already published response journals, and public saved Knowledge remain readable. Late response completion is retained for operational accounting but cannot establish a new grace-period Observation or resolve an unknown outcome.

Saving authority permits exact old-capture recording, Evidence import, public Knowledge readback, handoff/review writing, status, and shutdown. Existing page workers receive that restricted permission until their seat deadline; new Jobs may only be recording Jobs from closed sources. No Product request, browser inspection, retry, or state-dependent continuation is authorized. At +45 minutes, reject agent calls and stop all remaining seats. Closing process trees and admitting final artifacts do not extend agent work.

Identity mismatch, prohibited native child, unknown identity at its verification deadline, unconfirmed native/browser closure, unexpected required Job failure, uncertain required launch, or unexpected server failure fences the entire arm. Revoke admission and stop all seats, not only the offender. Preserve diagnostics and accumulated records, but do not finalize/export the arm. Expected host-proven local or shared allowance stops remain distinct from failure. A nonzero exit qualifies as expected only when the supervisor recorded the corresponding enforced stop and closure/identity still verify.

Shutdown seals dispatch, stops/join scout, director, every explorer and record seat, and checks every Job including partial launches. A definitely unlaunched allowance refusal has a terminal not-started receipt; an uncertain launch needs closure proof. Drain all leases and MCP work, seal capture/accepted-ID registries, and stage the final public Knowledge readback behind the writer barrier. Staging is diagnostic data, not a finalized export.

Then stop and verify the entire owned server tree, including Product/browser descendants, using the existing Windows Job mechanism. Only after all required Jobs and server trees have confirmed closure and all native identities verify may the parent admit staged artifacts as final and export them. A server error during staging or closure blocks admission. Repeated shutdown converges to the same receipts. Failed arms retain diagnostics without a finalized marker.

Legacy `solo`, `director-review`, and `continuation-approx` keep their current launch selection, serial ownership contract, wrapper behavior, and Core calls where already present. Their wire shapes and accounting stay compatible through the legacy adapter. Previous frozen outputs and Knowledge bodies are never changed. New matched arms use only `page-tasks`, with concurrency as their sole workflow difference.

# Bounded implementation and proof plan

The parent implements and independently reviews this package. This candidate runs no processes or tests.

1. Add the execution/lease map and typed error envelope first. Exercise existing generated wrapper commands through the real broker and `serve.mjs` Product bridge. Keep original provenance, Actor/version, token, single-action, and shutdown guards. Add deterministic gates around request start/response completion in the unscored proof driver, never in Product source or scored prompts.

2. Replace single-child admission with synchronous reservation and targeted drain. Add the new assignment parser, fixed bounds, scout role, saving permissions, and director review receipt. Keep idempotent token behavior at every launch boundary. Add the common workflow once; derive slot admission from concurrency.

3. Run the deterministic red/green cases below against baseline `624731a3` and the treatment. Use real generated wrappers in separate environment-scoped processes and the real disposable Product bridge, not handwritten substitute HTTP clients. Existing fixture seat machinery may drive deterministic calls; its synthetic identity is not native capability evidence. Use actual Windows Job supervision for fixture processes and descendants. Keep proof artifacts separate from scored outputs.

| Proof | Red condition on baseline | Green assertion |
| --- | --- | --- |
| Two Actors with gated A response | Global execution/handler queue refuses B or holds B, status, and Knowledge behind A. | B browser operation, status and MCP call finish while A's response gate remains closed. Paths, snapshots and logs keep their own execution/Actor/action identities. |
| Delayed callback and reverse completion | A request can inherit a later global owner/action; releasing one execution clears global ownership. | A late request/response keeps A's lease. Its action cause stays unproven. A retired-page request cannot dispatch or attach to its successor. Targeted B release leaves A active. |
| Actor-local quiet | A's network activity prevents B quiet. | B settles using B's getters while A stays busy. Release waits for Page close and route/bookkeeping drain, not merely native exit. |
| Shared cap and deadlines | Concurrent admission and saving-only commands have no complete enforcement. | Gate two admissions at count 39. Exactly one dispatch gets request 40; the other is refused. No await separates cap check/increment. Task slices never reset the counter. At +40 live reads/actions and late fetches refuse; at +45 agent calls refuse. |
| Failure captures and source integrity | Broker success-only registration loses returned error captures. | An error reply preserves original immediate/failure refs and hashes. Changed paths/bodies, cross-Actor sources, forged IDs, unknown version fields and wrong Platform reject. Missing after capture remains unknown. |
| Real wrapper authority and recording | Director can discover wrapper paths but must not inherit their authority; grace leaves live reads open. | Invoke an explorer wrapper with the director's env. It rejects. Record wrappers cannot act, snapshot, settle or request Product state. Exact closed same-Actor captures can save/read back during grace. Canonical array errors still occur locally. |
| Writer and full saved-body review | Receipts/Evidence can conceal omitted body facts. | Interleave two writers/imports. Accepted IDs register before return and never cross executions. Force paged public reads. A deliberately omitted supported fact produces old-capture record work, with no Product replay. |
| Dispatch, dependencies and mutation | One active child prevents overlap; naive removal permits same-Actor/state conflicts. | Duplicate identical token launches once; conflicting token rejects. Slot and Actor reservations are atomic. Closed dependencies precede work. Exclusive Product jobs cannot overlap page jobs. |
| Stops and whole-arm closure | Expanded scout/record set or browser callbacks can escape a native-only join. | Expected host-bound stop retains facts as incomplete. Any required seat/server failure or unknown identity/closure fences all Jobs. No final artifacts precede Windows zero-active tree closure. |

4. Prove Windows closure with a real child that leaves a grandchild alive. A parent task return must not release the lease or admit final output. Exercise normal exit, enforced stop, missing/corrupt closure event, native identity failure, and server failure with other Jobs active. Inspect the nonce-checked Job closure proof and process liveness. Do not substitute a PID exit receipt or mocked `closed` promise for containment.

5. Before either next scored arm starts, run a separate unscored native capability check. Use real external Luna/medium scout, director, two different-Actor explorers, and a recording seat. Verify actual recorded turns and absence of built-in children for every seat. Gate an A browser request and require B to finish a browser operation before A completes; simultaneous model thinking alone does not prove overlap. Verify shared accounting, exact saved bodies against original captures, old-capture recording, and every native/server Windows Job closure. A failure blocks both scored starts.

6. Check fresh unscored legacy solo/continuation recipes for unchanged behavior and local help. Do not reopen or rewrite earlier frozen results. Then the parent independently reviews the committed runner, launches the fresh matched concurrency-1 and concurrency-3 arms, and blind-grades them under unchanged scoring.

The implementation throughput checkpoint passes only if the gated browser/MCP/status case demonstrates Actor-local waiting and shared admission. An arena vote, more saved records, faster dispatch, or native overlap does not prove a coverage improvement.

# Grounded seams and principle decisions

The grounding is [693-parallel-grounding.md](C:/dev/Perquiro-693/.audit/693-parallel-grounding.md). The relevant implementation seams are [dispatch and handoff](../../scripts/explore-completion-693/coordination.mjs), [capabilities and Dispatches](../../scripts/explore-completion-693/coordination-boundary.mjs), [generated wrappers](../../scripts/explore-completion-693/coordinated-access.mjs), [host owner/operate/interceptor](../../scripts/explore-completion-693/serve.mjs), [quiet tracking](../../scripts/explore-completion-693/settle.mjs), [native identity](../../scripts/explore-completion-693/effective-host.mjs), [native launch](../../scripts/explore-completion-693/native-seat.mjs), [shutdown](../../scripts/explore-completion-693/shutdown.mjs), and [Windows Job closure](../../src/runs/process-tree.ts).

Foundational Thinking put execution and lease identities in the data shape before control flow. Separate Before Serializing Shared State moved browser queues and quiet counters to leases while retaining the genuinely shared allowance and Knowledge writer. Boundary Discipline and Type System Discipline made closed capture grants and validated assignment variants the only inputs to recording. Make Operations Idempotent preserved one Job per dispatch token and convergent release/shutdown. Laziness Protocol chose a fixed workflow with a conservative exclusive Product mode instead of a scheduler or record-lock framework. Prove It Works required wrapper-to-Product interleavings and actual Windows/native closure before measured starts.
