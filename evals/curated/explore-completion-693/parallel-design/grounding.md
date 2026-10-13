**Overview.**

The parallel treatment needs changes to the private runner’s execution ownership, dispatch tracking and browser attribution. The shared request counter, clock and event sequence can remain global. They do not require one global execution or action owner.

The [recorded synthesis](C:/dev/Perquiro-693/.audit/693-coordination-synthesis.md) chose a narrow maintainable pilot boundary, adopted native serial workers, and explicitly rejected parallel workers, per-worker 40-request allowances and stronger exploration models. It also retained native identity verification, capability isolation, capture validation and fail-closed shutdown. That records the previous scope choice. It does not establish that Product interaction inherently requires serial workers.

The lifecycle report’s suggestion that parallelism would “likely” require Core changes does not apply to this treatment. The parent’s next treatment will use private executions, without `beginExplorePass` or fake UI execution registration.

**Key concepts.**

- A **seat** is a real native CLI process with its own token, verified model identity and process-tree closure.
- An **execution** is a private host-issued `eNNN` identity with a fixed Actor, assignment, directory and capture provenance.
- A **Job** tracks dispatch, native task outcome and confirmed closure. A worker returning ends its local task.
- An **Actor browser session** is an authenticated Playwright context and page. Three distinct contexts already exist. They can be leased one per Actor without supporting simultaneous same-Actor pages.
- The **allowance** is one trial-wide 40-request counter and 40-minute exploration window, followed by five minutes solely for saving existing facts.

**Trigger through shutdown.**

1. **Start the arm and allowance.** `runArm` calls `openSession`, which starts the owned server process with a private supervisor token and deferred finalization. The host prepares Product, three authenticated browser contexts and one MCP session. `/start` establishes the clock before coordination and native-seat startup. Preparation traffic is excluded from the request counter. Scout work, planning, dispatch, child startup and recording then consume the same elapsed allowance. See [`openSession`](C:/dev/Perquiro-693/scripts/explore-completion-693/coordination.mjs:18) and the [host browser preparation and API interceptor](C:/dev/Perquiro-693/scripts/explore-completion-693/serve.mjs:214).

2. **Launch and verify native seats.** `startSeat` currently fixes every seat to `gpt-6-luna` with `medium` effort. It injects only that seat’s capability token, removes supervisor credentials and rejects builtin native children. `inspectHost` checks actual recorded turns. A quick scout has no existing dedicated role or mechanically enforced short bound. It could supply a closed worker handoff, but its authority, stopping condition and retained output need an explicit contract. The director remains Luna/medium. See [`startSeat`](C:/dev/Perquiro-693/scripts/explore-completion-693/native-seat.mjs:6) and [`inspectHost`](C:/dev/Perquiro-693/scripts/explore-completion-693/effective-host.mjs:7).

3. **Dispatch through the broker.** The director submits an assignment. `parseAssignment` checks its token, Actor and closed execution references. `dispatch` creates a Job, obtains host ownership, writes execution-specific wrappers and starts the worker. It returns before completion, so the director polls status. Currently `Dispatches.active` admits only one child and host `begin` admits only one execution. Both restrictions must become bounded concurrent ownership. Preserve duplicate-token idempotence, conflicting-assignment rejection and closure fencing. References should remain closed, published handoffs unless a separate live-output protocol is introduced. See [`dispatch`](C:/dev/Perquiro-693/scripts/explore-completion-693/coordination.mjs:94) and [`parseAssignment`, `Capabilities`, `Dispatches`](C:/dev/Perquiro-693/scripts/explore-completion-693/coordination-boundary.mjs:5).

4. **Route browser and MCP work to the issued execution.** Wrappers send an execution ID and read the caller’s token from its environment. The broker derives authority from that token. A director invoking a worker wrapper still cannot gain browser or write authority. The broker forwards permitted requests using the supervisor token. The host currently resolves every worker through `activeExecution` and mutates `currentActor`. Its global HTTP `chain` then serializes browser actions, settling, MCP calls and status requests. Parallel workers require execution-specific Actor/page resolution and independent browser operation ordering. Shared mutation and finalization may still need serialization, but one worker’s browser wait cannot hold the entire control plane. See [`owner` and `operate`](C:/dev/Perquiro-693/scripts/explore-completion-693/serve.mjs:98), the [control handler](C:/dev/Perquiro-693/scripts/explore-completion-693/serve.mjs:268), and [`writeExecutionAccess`](C:/dev/Perquiro-693/scripts/explore-completion-693/coordinated-access.mjs:51).

5. **Capture, save and read back.** Each intentional action produces immediate and usually settled JSON captures under its execution directory. The broker registers returned capture paths and hashes per execution. Evidence import checks exact issued provenance, unchanged content and links to Observations accepted for that execution. Workers must read saved records back. The director’s handoff review compares original captures with full public saved bodies, including paged records where required. Missing supported facts go to recording-only work using old captures. Evidence links establish provenance, not content completeness. These checks are partly mechanical and partly instructions. See the [broker capture/import checks](C:/dev/Perquiro-693/scripts/explore-completion-693/coordination.mjs:172) and [`handoff`](C:/dev/Perquiro-693/scripts/explore-completion-693/coordination.mjs:134).

6. **Close every required Job before export.** Today the runner waits for native closure, marks the execution closed and calls untargeted `/force-release`. Parallel release must address one execution and its browser lease. Native closure alone does not drain browser callbacks. Whole-arm shutdown must stop admission, join scout, director and every required worker/recording Job, verify native identity and closure, drain browser/MCP work, then finalize captures and close the owned server tree. Existing `shutdown` already rejects unconfirmed closure and required seat failures before admission. Its invariant must cover the expanded Job set. See [`shutdown`](C:/dev/Perquiro-693/scripts/explore-completion-693/shutdown.mjs:1), [`launchOwned`](C:/dev/Perquiro-693/scripts/explore-completion-693/owned-process.mjs:5), and [host release/finalization](C:/dev/Perquiro-693/scripts/explore-completion-693/serve.mjs:283).

**Shared and per-worker data.**

| Remains shared | Needs execution/session ownership |
|---|---|
| Product backend and database | Actor context/page lease |
| 40 dispatched API requests and refusal accounting | Execution lifecycle and targeted release |
| One `/start` origin, 40-minute cutoff and saving deadline | Current action association and immutable operation context |
| Global event sequence and append-only journal | Immediate/settled capture paths and latest references |
| Global unique action numbering, if retained | In-flight requests and quiet tracking for that session |
| Knowledge store and final readback/export boundary | Capability token, native proof, assignment, handoff and Job outcome |
| Shared capture registry infrastructure | Capture entries and accepted Observation IDs keyed by execution |

The API cap check and increment currently occur before the interceptor’s first asynchronous fetch. That gives one host authoritative admission accounting. Parallel workers need attributable request totals, not independent allowances. Subtracting global start/end counters would include other workers’ requests.

**Gotchas and unresolved questions.**

- **Sequence is not ownership.** A global `eventNumber` or `actionCount` can provide unique IDs. The unsafe globals are `activeExecution`, `currentActor` and `activeBrowserAction`, which supply another operation’s identity after an asynchronous boundary.
- **Late callbacks need stable attribution.** The interceptor already captures execution ID, action ID and phase before `route.fetch`, so response completion retains those values. However, a delayed request beginning after another action or ownership transfer reads the then-current global pointers. Parallel candidates must define how delayed, background and unowned requests are attributed. A page-local “latest action” pointer alone does not prove causality. Request Actor identity must also remain distinct from owning execution identity. See the [interceptor](C:/dev/Perquiro-693/scripts/explore-completion-693/serve.mjs:223).
- **Settling currently crosses Actors.** All contexts update one `inFlight` and `lastNetworkActivity`. A busy worker could delay another worker’s settled capture. [`awaitQuiet`](C:/dev/Perquiro-693/scripts/explore-completion-693/settle.mjs:8) already accepts getters, so session-specific quiet tracking is possible. Final shutdown still needs a whole-host drain.
- **Forced release does not settle.** `/force-release` clears ownership immediately. Releasing or re-leasing an Actor while old browser work remains outstanding risks incorrect attribution even after its native worker has exited.
- **Saving-only enforcement is incomplete.** After 40 minutes, actions and new API admission are denied, but worker snapshot, screenshot and related browser commands remain available. The parallel treatment must define a grace-phase capability boundary around existing captures, saved Knowledge and recording-only work.
- **Bounds are unsettled.** Current assignments contain a question and references, not enforced worker request/action/time limits. Candidate work must define the concurrent Job cap, individual task stopping conditions and cancellation behavior. The existing three Actor contexts bound simultaneous page leases to three.
- **Shared Product mutations remain real.** Distinct browser contexts isolate session state, not Product records. Assignments need explicit state dependencies and interference handling. More pages cannot remove that constraint.
- **MCP concurrency remains unverified.** One MCP session serves shared Knowledge. Its call ordering, accepted-ID registration, retries and final readback barrier need a contract before removing the global route chain.
- **Capture failure handling needs attention.** The host can return partial capture references with an action error, while the broker registers captures only after a successful forwarded response. Parallel candidates must preserve failed-action provenance.

**Experiment dispatch and continuation approximation.**

`director-review` uses private Jobs and execution handoffs. `continuation-approx` additionally confirms a production plan, advances its queue, begins one Core pass, dispatches one worker and settles the pass. It omits UI execution binding. Core can therefore report interruption while the private native seat is active. See the [approximation loop](C:/dev/Perquiro-693/scripts/explore-completion-693/coordination.mjs:218).

Core’s [`beginExplorePass`](C:/dev/Perquiro-693/src/explore-continuation/continuation.ts:666) enforces one running pass and requires a UUID when an execution binding is supplied. Its [presentation logic](C:/dev/Perquiro-693/src/explore-continuation/continuation.ts:839) consults UI execution records. Those constraints limit actual Auto and the existing approximation. They impose no Core-change requirement on the next private treatment, which will call neither `beginExplorePass` nor fake UI registration.

Foundational Thinking shaped the state split above. Separate Before Serializing Shared State kept browser ownership independent while preserving the genuinely shared allowance. Prove It Works drove the source checks that corrected the reports’ Core and attribution ambiguities. No design winner or semantic outcome is established here.
