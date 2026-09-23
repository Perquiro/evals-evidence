# Harder choices: TypeSafe, timing and cost

TypeSafe's direct-choice variant matched both ordinary planning baselines on the harder cases at lower measured selection time and estimated token cost. It is the strongest option to take into the bounded Perquiro trial.

We added ten synthetic Employee HR situations, including eight semantic choices and two host controls. Each ran in three option orders through four methods. All 96 model calls/turns returned usable output; the remaining 24 decisions bypassed models through shared host rules. No Product actions ran.

| Method | Accepted semantic decisions | Median total selection time | Estimated cost per decision | Estimated cost per 1,000 decisions |
|---|---:|---:|---:|---:|
| TypeSafe: one Choice question | 24/24 | 0.798 s | $0.00004444 | $0.0444 |
| TypeSafe: original Score method | 23/24 | 0.852 s | $0.00008298 | $0.0830 |
| Luna, low reasoning effort | 24/24 | 3.875 s | $0.00103274 | $1.0327 |
| Terra, low reasoning effort | 24/24 | 4.077 s | $0.00651295 | $6.5130 |

The cost columns use measured token counts and published API prices, including reported cache hits. Codex used existing subscription authentication, so these are API-equivalent estimates, not subscription charges. The 1,000-decision column extrapolates this small sample's mean cost; 1,000 decisions were not executed.

In these runners, Choice took about 4.9 times less median total selection time than Luna, with 23 times lower estimated cost. Against Terra the corresponding ratios were 5.1 and 147. Those are observed implementation-level comparisons. Codex includes mandatory runtime context and uses a different transport from TypeSafe HTTP.

The CLI's turn-start-to-completion median, excluding most process startup, was 2.735 seconds for Luna and 2.989 seconds for Terra. Choice's HTTP-call median was 0.798 seconds. That still leaves a roughly 3.4 to 3.7 times timing difference, but the intervals are not pure server inference time. A minimal direct OpenAI API caller or a persistent Explore session can have different latency and costs.

## What the harder cases established

All methods selected login ahead of genuinely unobserved public HR features when private Employee workflows required entry. They chose a concrete cancellation readback over repeating proven login, kept old-build errors separate from current-build access, investigated possible session-wide access loss, and declined a set that only repeated established behavior. When Product purpose was incomplete, the frozen answer set accepted either of two useful capability probes. No method needed to invent a payroll or approval dependency to choose one.

The two host controls, required recovery and explicit human priority, passed 6/6 for each method without a model call. The ineligible operator-only check was removed before any model saw the available options. These results validate the shared host handling, not model enforcement of authorization.

One result differed from the frozen expectation. With shuffle seed 7, the original Score method preferred discovering notification settings over reading back a changed primary phone. The supplied context said that phone receives sign-in recovery codes. The unfinished persistence check was therefore the expected next action.

That method assigned notification discovery a combined priority of 0.7993 and the phone readback 0.7867. Its relevance confidence for the readback was only 0.06. Choice and both ordinary planners selected the readback in every order. The original method selected it in the other two orders. This is one observed reversal; three calls cannot separate an order effect from ordinary model variation.

Choice used one question over the available IDs plus none. The original method asked two questions per available check and combined relevance and information using its existing weights. Both received the same factual state and user priorities. The formulation and aggregation changed together, so this run does not attribute the difference solely to the Choice primitive or prove broader quality superiority. The [Choice API](https://docs.typesafe.ai/primitives/choice) supports a selected option, distribution, and confidence, which are retained in the raw traces.

## Cost and tail measurements

| Method | Input tokens | Cached input tokens | Output tokens | Estimated total for 24 model decisions | Total without cache discounts |
|---|---:|---:|---:|---:|---:|
| Choice | 25,392 | N/A | 1,341 | $0.001066 | $0.001066 |
| Original Score | 47,418 | N/A | 3,072 | $0.001992 | $0.001992 |
| Luna | 147,015 | 27,392 | 261 | $0.024786 | $0.029716 |
| Terra | 182,343 | 117,504 | 261 | $0.156311 | $0.367818 |

No cache-write or reasoning-output tokens were reported by the ordinary runners. Reasoning tokens were not counted twice. TypeSafe charges for input tokens; its output tokens are reported for completeness. Price sources checked on 2026-09-17: [TypeSafe Models](https://docs.typesafe.ai/models), [Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna), and [Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra). The rates and formula are retained in PROTOCOL.md and analyze.py. Preflight calls, the author/reviewer agents and this orchestration are excluded from the per-decision comparison.

Choice used 46.5% fewer input tokens than the original method. Its total selection-time p95 was 0.943 seconds and maximum was 1.715 seconds. The original method's p95 was 1.134 seconds. Luna's p95 was 6.446 seconds; Terra's was 6.528 seconds, with a retained maximum of 25.874 seconds. These p95 values use the nearest-rank calculation on only 24 observations per method. Do not infer production tail guarantees from them.

There were no unavailable or invalid outputs in this batch and no calls were repeated to replace failures. The earlier basic trial's 18 HTTP 503 responses remain preserved in its own directory. This successful later batch does not erase that reliability finding.

## Review and recommendation

The independent reviewer saw anonymous methods and all output IDs together. It confirmed the acceptance totals, the original method's single mismatch, and the intentionally flexible answer for the incomplete-purpose case. It recommended the method later revealed as Choice. The parent agreed after reading all selected outputs and inspecting the scoring reversal. REVIEW.md retains its assessment and the interpretation limits.

The choice-quality criterion was matching the frozen acceptable-ID set, not producing a better explanation. ID-only outputs cannot establish an agent's reasoning or its behavior during Product execution. The eight semantic situations repeated three times are not 24 independent Products. All reviewers/runners were from the available GPT family except TypeSafe; a different-family review was unavailable.

Take the Choice method into the next bounded HR comparison, preserving the original Score method as a regression case. This supports the user's intended efficiency direction: preserve useful choices while doing less expensive planning work. It does not require improving on the ordinary planner's choices to be worthwhile.

The full Perquiro comparison still needs to measure the work Choice actually replaces, advice handling and overrides, failure fallback, candidate generation, and saved Product outcomes together. Adding a call while leaving all ordinary planning work intact does not establish a saving. The agreed quality check remains an independently frozen HR checklist, one Employee Actor starting signed out, equivalent Product state and equal Product-request budgets.

## Evidence and reproducibility

Inputs, expectations, runner and protocol were hashed before the scored run. Their hashes still match. The schedule was verified serial, all 120 decisions are present exactly once, original rankings reproduce from stored model responses, and usage totals match the retained CLI completion events. Those events show 48 final agent messages and no tool calls or file reads by the ordinary planners. [Codex JSONL usage events](https://learn.chatgpt.com/docs/non-interactive-mode) supplied the counters and timestamps. No API key was found in the artifacts.

The original downloaded kit and first pre-trial evidence were left unchanged. This directory contains frozen inputs, raw results, the summary, anonymous review inputs and scripts. The repository trial description now states comparable decision quality at lower total latency and cost as the intended success criterion.
