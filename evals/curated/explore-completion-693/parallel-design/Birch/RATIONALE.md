# Problem

The next runner treatment must test page concurrency while holding the scout/director/page-task workflow fixed. Existing authenticated Actor contexts can support independent workers. Global execution, Actor and action pointers, the whole-handler queue, and native-only release prevent safe overlap. The contract also requires one 40-request/40-minute allowance, five saving-only minutes, exact capture provenance, real external Luna/medium seats, and fail-closed process-tree shutdown.

# Usage

The parent calls `runArm({ policy: 'page-tasks', concurrency: 1 | 3, ...freshParentInputs })`. Both arms run the same bounded scout and director. The director dispatches an observed page with its Actor, source basis and question, reads the closed handoff against full public saved bodies, and dispatches recording work for supported omissions. Recording names exact old captures from a closed same-Actor source. See [CANDIDATE.md](CANDIDATE.md) for the caller sketches and signatures.

# Shape

Give each page execution an immutable Actor/Page lease, operation context, capture registry, and accepted Observation set. Keep one request admission counter, clock and event sequence. Late requests retain their Page lease; action causality stays explicitly unproven. Retire the old Page after drain before re-leasing its authenticated context.

Allow read-only page Jobs to overlap across Actors. A Job that may mutate Product records requires exclusive Product access after other page leases close. Serialize only the existing shared MCP/Project boundary, including reads initially. Browser waits hold their own lease queue. Status and dispatch remain independent.

Foundational Thinking and Separate Before Serializing Shared State drove this ownership split. Boundary Discipline and Type System Discipline drove closed capture grants and role-specific admission. Make Operations Idempotent preserved dispatch tokens and closure receipts. Laziness Protocol kept a fixed workflow with conservative mutation exclusion. Prove It Works drove the wrapper/bridge interleavings and separate native overlap gate.

# Synthesis decision

Parent-owned. This candidate makes no arena selection or claim about other candidates.

# Tradeoffs accepted

- We accept fewer simultaneous mutation tasks in exchange for an enforceable shared-state rule without undocumented record identities.
- We accept a fresh Page on Actor handoff in exchange for terminating old timers and avoiding ownership rebinding. Navigation consumes the shared allowance.
- We accept causal uncertainty for automatic requests in exchange for honest execution attribution without Product instrumentation.
- We accept serialized MCP calls in exchange for preserving the shared client's ordering and atomic accepted-ID registration. Browser waits cannot enter that queue.

# Alternatives considered

- One global command mutex. It protects pointers but serializes browser waiting, status and Knowledge. It cannot demonstrate useful page overlap.
- One independent host/server per worker. It isolates globals but splits request admission, Knowledge state and server shutdown. Reconciling those systems exceeds this runner-only treatment.
- Rebind an existing Page to the latest execution/action. Delayed timers can cross ownership boundaries. Quiet windows do not prove that rebinding is safe.
- Fine-grained Product record locks or optimistic reconciliation. Public UI does not provide a complete conflict identity model. A mistaken independence declaration can corrupt a state-dependent observation.
- Live handoff streams with worker retries. They widen authority and completion semantics without helping the bounded comparison. Closed handoffs and exact-capture recording are enough.

# Open questions and risks

Can the pinned browser bridge contain every delayed request and non-Page channel under immutable lease ownership? The native capability gate must answer this before scored starts.

Does a 120-second scout discovery window leave useful navigation after actual native startup? Its hard bound remains fixed for both arms; a partial map is honest evidence.

Will the conservative read-only overlap produce better semantic coverage under the fixed allowance? Only the parent's matched blind grading can answer.

# Next implementation step

Build the per-execution host state and error capture envelope, then prove a gated A request cannot block B's generated browser wrapper, status, or public Knowledge call.
