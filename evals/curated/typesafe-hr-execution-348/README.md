# HR comparison execution, issue 348

This directory implements the live driver for the immutable
[`typesafe-hr-protocol-347-v3`](../typesafe-hr-protocol-347-v3/PROTOCOL.md).
It changes no production behavior or grading rules.

The [completed report](REPORT.md) records the inconclusive pilot result. The
[curated packet](evidence/packet.json) and [copy manifest](CURATION.json) retain
all eight executions, grades, accounting and independent result review.

Verify the delivered evidence from the repository root:

```powershell
node --import tsx evals/curated/typesafe-hr-execution-348/verify-delivery.mjs evals/curated/typesafe-hr-execution-348/evidence
```

The driver uses a fresh Codex app-server, a fresh Playwright browser context,
the pinned BugBusters server process, and Perquiro's public MCP tools for each
execution. Candidate tools cannot execute scripts, read arbitrary files, use
inherited MCP servers, or navigate outside the Product origin. The Employee
password is supplied through Setup and a browser secret-fill operation.

`TYPESAFE_API_KEY` must be available in the evaluator process. On this Windows
host it is stored in the user's environment and can be loaded without printing
it:

```powershell
$env:TYPESAFE_API_KEY = [Environment]::GetEnvironmentVariable('TYPESAFE_API_KEY', 'User')
```

The key is removed from candidate and Product child-process environments.
Provider capture retains request/response bodies without authorization headers.
Browser captures redact credential fields and the configured demo password.

## Execution

Run from the repository root after installing dependencies and building the
Perquiro runtime. Preparation exports and builds the pinned Product in
`.perquiro/348/product`; it never modifies the source checkout. Keep all failed
preparation attempts alongside the passing receipts.

```powershell
node --import tsx --test evals/curated/typesafe-hr-execution-348/browser.test.mjs evals/curated/typesafe-hr-execution-348/export.test.mjs
node --import tsx evals/curated/typesafe-hr-execution-348/launch.mjs freeze
node --import tsx evals/curated/typesafe-hr-execution-348/launch.mjs run
```

`freeze` consumes the reviewed preparation receipts named in `launch.mjs`,
checks the original protocol's hashes, and publishes a launch directory only
after validation. It records the Product source/build/seed, runtime build,
driver files, instruction bytes, tool schemas, versions, review identities,
and eight scheduled execution IDs. Failed preparation directories are kept.

Each `run` starts exactly the next scheduled execution. Invoke it eight times,
serially. The wrapper rejects changed inputs, a repeated execution, or an
unfinished prior dispatch. A failed execution stays in the ledger. The driver
records original host JSONL, provider responses, browser/network captures,
public Knowledge exports, reset receipts, and full elapsed phase intervals.

The request cap starts recording grace immediately at admission. Product
actions, including snapshots, stop at the cap or deadline; evaluator-owned
final capture can still retain already dispatched results. Host close ends
elapsed time and revokes candidate tool admission. A bounded drain preserves
in-flight captures separately; late writes receive no grading credit.

Two fresh graders receive anonymous Product actions and saved Observations,
then an independent reviewer checks the raw evidence and report. Candidate
execution never receives the checklist, Product source, prior results, or
evaluator files. Usage and charges that the host does not expose remain unknown.

## Evidence and report

After all eight scheduled receipts exist, prepare a separate evidence copy:

```powershell
node --import tsx evals/curated/typesafe-hr-execution-348/prepare-evidence.mjs
node --import tsx evals/curated/typesafe-hr-execution-348/summarize-overhead.mjs
```

The default output is `.perquiro/348/evidence`. Only its `blind` directory goes
to each fresh grader, with the identity frozen in the launch. The graders write
`grades/grader-a.json` and `grades/grader-b.json` independently. The evaluator
then writes `grades/adjudication.json`, preserving both original grades and
explaining every disagreement against the captures and saved Observations.
`GRADING.md` defines the grade format. No scored execution is repeated.

```powershell
node --import tsx evals/curated/typesafe-hr-execution-348/finalize-report.mjs
node --import tsx evals/curated/typesafe-hr-execution-348/verify-delivery.mjs .perquiro/348/evidence-report
```

Finalization works in a new staging directory. Failures retain all inputs and
a structured error there; success publishes `evidence-report`. It validates
execution controls, grade completeness, raw citations and frozen accounting.
The separate result reviewer must inspect that exact packet and report, then
write `independent-result-review.json` with their frozen identity, approval and
both SHA-256 values. `verify-delivery` rejects a missing or stale review and
reruns the frozen evaluator. Structural validation cannot decide semantic credit.

The retained report can be checked without live API credentials or the
original candidate Projects. Re-executing the Product requires the pinned
BugBusters source, the recorded host/browser build and fresh credentials;
it would be a separate experiment. Machine-local paths in original captures
are provenance, not dependencies of report verification.
