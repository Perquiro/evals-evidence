# Harder next-action choices: quality, latency and cost

Frozen before scored execution on 2026-09-17. Success means preserving decision quality while lowering the cost and time of next-action selection. Better decision quality is welcome but is not required for an efficiency improvement. Product interaction and candidate generation remain outside this bounded pre-trial.

1. Frame
2. Fan out
3. Cross-judge
4. Pick
5. Graft
6. Verify

Ten synthetic HR situations include eight semantic choices and two deterministic host precedence controls. An independent author prepared drafts; the parent strengthened competing unknowns, allowed both reasonable answers where Product purpose does not distinguish them, clarified repeated sign-in evidence, and randomized stable IDs and initial order. Expectations stay outside all model inputs. Freeze SHA-256 hashes of cases, expectations, policy/runner and protocol before execution.

Four methods receive the same current state and user priorities after the same host eligibility/recovery/human-priority handling:

- Original Jev Score method: two dimensions per available check, existing 40% relevance/60% information combiner and 1.5 information abstention threshold. Add the shared user policy to the supplied state; leave the supplied ranking code unchanged.
- Jev Choice method: one Choice question selecting an available ID or none, using the shared policy directly. This is an explicit alternative design for reducing selection work; no new numerical impact weights are fitted.
- Ordinary gpt-5.6-terra, low reasoning effort.
- Ordinary gpt-5.6-luna, low reasoning effort, a cheaper baseline.

All model decisions are advisory. Baselines emit only selected_id or null, with no rationale requirement, to avoid charging them for prose the TypeSafe selector does not produce. They get fresh contexts, compact task instructions and neutral working paths. Project docs, skill entries, plugins, shell/browser tools and delegation are disabled for those invocations. No Product actions or external data lookups are needed. Record tool events; any tool use invalidates an ordinary selection rather than silently introducing extra evidence.

Run each situation once in the original order and once each with seeds 7 and 29. Shuffle method order per situation with the seed in runner.py. Execute calls serially so simultaneous local model runners do not compete for resources. This is a deliberate timing-related adaptation of the eval skill's parallel fan-out. There are 120 decisions, of which 24 are host bypasses; up to 48 TypeSafe HTTP requests and 48 ordinary model turns. Keep unavailable results, invalid outputs and timeouts. Do not rerun failures or tune instructions after seeing outcomes. Diagnostic preflight requests do not enter scored denominators.

Timing starts immediately before selection preparation and ends after a validated selection or failure. Also record TypeSafe HTTP-call elapsed time, full Codex CLI wall time and the CLI turn.started-to-turn.completed interval. The latter excludes most process startup but is still a host-observed turn interval, not server-only inference time. TypeSafe uses a 15-second socket timeout; each CLI process has a 60-second wall limit. No claim of matching deadlines or intrinsic model latency will be made. Different API-versus-Codex transports and mandatory Codex context limit interpretation.

CLI JSONL exposes input, cached input, cache-write input, output and reasoning counters where available. Use actual returned counters. Estimate API-equivalent token charges at the verified published rates: Terra $2 input/$0.20 cached/$12 output per million; Luna $0.20/$0.02/$1.20; cache writes at 1.25 times uncached input where reported. Reasoning tokens are reported separately but not added to output twice. Jev is $0.042 per million input tokens, output free. Codex runs use existing subscription authentication, so these are token-price estimates, not observed subscription charges. Unknown usage is not zero. Report an input-without-cache-discount estimate as a sensitivity check. Prices: official OpenAI Terra/Luna model pages and TypeSafe Models, checked 2026-09-17.

Primary quality measure: selection belongs to the frozen acceptable-ID set. Report semantic cases separately from deterministic host controls. Repeated orders measure variation, not independent Products. Criteria for the anonymous reviewer: correct useful selection; host precedence/eligibility; actor/build attribution and uncertainty; decline repeated high-impact work when there is nothing new; conclusions warranted by observed quality, timing and usage. With ID-only outputs, do not claim to verify an agent's unstated reasoning. Grade availability separately from semantic accuracy.

After outputs finish, one fresh reviewer reads anonymous output sets together and the frozen inputs/expectations. It sees no model mapping. Only GPT-family models are available, so cross-family review is unavailable. Parent reads every output and reconciles disagreements. The retained JSONL events establish any observed tool activity and token usage; no unrelated host sessions or chats are inspected. No answers are grafted into a fictional run.

Report per-case choices, accepted/available/attempted counts, median and tail timings, price estimates with cache accounting, failures, and a recommendation. Cost per successful correct decision must include observed spend on failures where known. No full Explore savings claim is possible until actual planning replacement, fallback, candidate generation and Product-request work are measured together.
