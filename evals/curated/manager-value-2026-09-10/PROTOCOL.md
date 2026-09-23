# Manager value pilot

The user authorized five fresh runs of each of four configurations on BugBusters HR. This is a pilot to estimate the value of the complete managed configuration and its variability. It cannot establish a universal manager effect on its own.

## Configurations

- A: gpt-5.6-terra/low alone with the frozen state-aware-v2 Explore skill.
- B: gpt-5.6-terra/low alone with that Explore skill and the frozen stop-reviewer skill's explicit non-delegating mode.
- C: gpt-6-astra/high as stop-reviewer manager, delegating sequential fresh gpt-5.6-terra/low Explore workers.
- D: gpt-6-astra/high alone with the same Explore and non-delegating stop-reviewer instructions as B.

B and D receive the same review checklist through the byte-identical stop-reviewer skill. No HR-specific questions or scoring inventory are added. The manager skill already permits alternating manager and Explore phases without delegation; these arms use that mode and disclose that their review is not independent. The exact state-aware-v2 input remains unchanged in every arm.

A versus B estimates the effect of adding explicit review instructions to the same solo model. B versus D compares solo model configurations. C versus B and D compare the practical managed configuration to simpler alternatives; C also changes context boundaries and which model executes Product actions, so neither is a pure isolated effect of a manager role.

## Conditions and execution

Use the frozen unchanged BugBusters HR Product build at 868e83d2c50f8135c5bff46db086ee4037c90ef3 and compatible Perquiro runtime at f507314358fc548c08244c7185f13e48dd87b734. The root workspace has concurrent domain edits; they are outside this experiment. The frozen runtime still requires Journey membership for Create, which is a shared downstream limitation.

Each candidate has a fresh Product server seeded by the same unchanged code, empty Project, fresh model context and three browser contexts authenticated through the real UI before launch. Original Product data, source and Project are outside scope. The candidate may perform ordinary UI operations on synthetic data, marking created records as evaluation data. No direct HTTP calls to the Product, reset, Product source, answer key, evaluator inventory, other runs, or parent conversation is available to candidates. Browser-received API responses are permitted.

The Product and browser Date are fixed to 2026-09-10T12:00:00Z through an evaluator-owned Node preload and Playwright clock.setFixedTime. This keeps seeded dates and current-day behavior equal if the batch crosses midnight. Product source is unchanged. Timers, request waits, Perquiro record timestamps, model time and all budget clocks run normally. Expiration or advancing-calendar behavior is outside this fixed-date pilot; do not generalize those results to real-time passage.

All arms can select any prepared Actor through host-issued sequential executions. Each execution has one fixed Actor and one active owner. A/B/D perform those executions themselves within the same top-level model session and never delegate. They explicitly release one execution before beginning another. C releases each worker only after its real host completion. Product state, Knowledge and the allowance persist across executions. Opening an execution grants no mutation retry permission. No concurrent Product owners are allowed.

Use one active candidate trial at a time to avoid treatment-dependent competition for local resources. Within C only its manager and one worker may be active. The seed and within-block randomized order of five four-arm blocks are frozen in config.json before scoring. Candidate contexts contain no preceding outcomes. Run identical CLI builds/settings and confirm requested model and effort from host turn_context records. Identity claims in model prose are insufficient.

## Budgets

The candidate clock starts immediately before dispatch of its top-level prompt. Every arm receives 40 minutes including model startup, planning, MCP reads/writes, Product work, worker launches and handoffs. No new intentional Product action, execution or application API request is admitted after 40 minutes. Each arm then receives at most five minutes to preserve already observed results, release execution ownership and report gaps. Snapshot/network reads and Knowledge recording are allowed during that grace period; new Product interaction is not. The entire candidate process tree is interrupted at 45 minutes if it has not finished. A timeout is a scored result, not a discarded run.

The common 40-application-request cap counts every request admitted to the Product, including automatic fetches, failures and eventual aborts. Prepared authentication and static assets are excluded. Refusals are recorded as evaluator refusals, never Product behavior. Requests admitted before the time deadline may finish; record their dispatch timestamps so late completions cannot inflate earlier checkpoint coverage. Recording after a checkpoint does not earn saved credit at that checkpoint.

Record scores at 10, 20 and 40 elapsed minutes and at final recording close. The primary fixed-time result uses facts saved by minute 40. Final Knowledge, including grace-period preservation, is a separately named result. Never compare one arm's 45-minute final records to another's 40-minute checkpoint. A candidate that finishes early retains its final score at later checkpoints; there is no evaluator continuation coaching.

Record total calls, browser actions, Product requests, time, model/effort, execution count and available per-model input/output/reasoning/cache token counters across manager and children. Raw token totals across different models are not comparable billing cost. Provider billing is unavailable unless verified telemetry establishes otherwise. Do not claim economic superiority from MCP counts or unavailable prices.

## Browser timing

Correct the previous bridge's debounce issue by requiring a full quiet interval measured from action completion, reset by subsequent network activity, as well as no outstanding request. Enforce a bounded timeout that also fails when quiet has not been achieved. Verify delayed debounce, no-network behavior, active requests and timeout. Retain immediate snapshots and let every arm explicitly request them; an immediate snapshot is not proof of settlement. Freeze identical corrected controls for every scored run.

## Scoring

Freeze the original 27-item complete-check inventory. A check counts at most once per run. Some inventory checks overlap; preserve that rule for continuity and do not treat the 27 items as independent experimental replications. The independent replication unit is the whole fresh candidate run.

Primary: the count of distinct inventory checks faithfully retained in public Knowledge, with the complete material action/result facts. Surface-only Observations count. Neither a high Observation count nor Journey-link density is success. Unexpected behavior can earn coverage when faithfully grounded. Complete capture in raw trace, complete direct Journey grounding, completed cross-Actor sequences, early stops and lost pre-transition states are secondary diagnostics. Raw capture alone does not show that the candidate noticed the fact.

Audit unsupported material claims against raw Product/browser evidence, distinguishing an immediate state from a settled one, and distinguish evaluator-discovered discrepancies from candidate-recorded ones. Deduplicate repeated claims by behavior. Preserve concrete citations for credited checks and disputed claims.

Reviewers receive anonymous public-record and raw-trace packets with arm, model, local candidate logs, instructions and earlier scores withheld. Keep initial grades and adjudications. The candidate inventory and answer key are never supplied to candidates. Preflight failures before any scored launch may be replaced with a recorded reason. Failures after launch remain in the outcome table; never rerun only a losing configuration. A systemic control defect halts the batch and requires an explicitly recorded protocol amendment affecting every subsequent arm.

## Create follow-up

After Explore closes, freeze its final public Knowledge and primary score inputs. Launch the same fresh gpt-5.6-terra/low Create agent for every run with the same 20-minute allowance and frozen Create skill. Its separate clean working directory exposes only the generated operating contract, Create skill and public MCP bridge. It may not see the inventory, raw trace, candidate notes, arm/model label or preceding results. It cannot browse the Product or repair Knowledge. It may open one Coverage Review according to the frozen Create rules. It must not accept Expected Behavior, resolve a Review, Generate or Run Tests.

Score the distinct grounded Scenario behaviors proposed, unsupported expected outcomes, duplicate proposals, and grounding limitations. Group breadth is descriptive; a narrow initial view does not establish a complete workflow. Do not cap scores by Scenario count alone or require all behavior to be Journey-linked in the independent Knowledge score. Create does not alter the saved-coverage metric, and its time/usage is reported separately.

## Decision and uncertainty

The proposed practical threshold is at least 20% higher mean saved coverage by minute 40 for C versus each of B and D, with no increase in unsupported material claims per saved check. Report absolute differences as well; when baseline coverage is zero, the relative difference is undefined. Report all five paired block differences, means, medians, ranges and uncertainty intervals. A five-run arm is a pilot, not a guarantee of statistical power. Failure to resolve the difference means inconclusive, not equal.

Report the effect estimate separately from the threshold decision. Economic value remains unresolved without reliable comparable cost. Even a favorable HR pilot needs a held-out Product or unseen starting states before generalizing beyond HR. Do not automatically launch further Products or an unlimited number of repeats. After this authorized pilot, use observed variability to recommend a fixed next sample size if needed.
