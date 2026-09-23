# Explore next-check ranking: trial kit

This kit tests TypeSafe advice for **Explore only**. Test Manager and severity assessment are outside this trial. It follows the narrower decision in your supplied discussion. The referenced `C:/dev/Perquiro` repository files were not accessible here; this is a standalone trial, not a repository patch.

All product observations and candidates in this kit are synthetic. No live TypeSafe API call or product action was made while preparing it. The runner can make real TypeSafe calls when you supply an API key. It never executes the candidate checks or writes Perquiro state.

## Try the playground first

1. Open `cases/01_finish_journey/state.json` and paste its complete contents into **State**.
2. Open `cases/01_finish_journey/questions.json` and paste its complete contents into **Questions**. Paste the questions object itself, without an outer `questions` property.
3. Select `jev-1.13.0` if the playground exposes model selection; otherwise note the returned model version.
4. Run the request. You should receive six answers: two scores for each of three candidates.

`c0_relevance` and `c0_information` refer to `candidates[0]`, whose stable ID is `c1`. Every instruction identifies its own target; question IDs alone are not visible to the model.

The desired result is that reloading the cancelled request ranks above rereading a known profile name or collecting copyright text. This is an expectation to test, not a reported model result. Inspect the whole distribution and confidence, especially when results are close.

The full `request.json` is for the HTTP API. Do not paste the full request into the State box. Cases 04 and 05 have empty questions because host rules bypass the model; test them with the Python runner.

## Run from Windows PowerShell

Extract the zip and open a terminal in the `explore-ranking-trials` folder. Python 3.10+ is enough; no pip install is needed. Use `py -3` in place of `python` if that is how Python is installed.

```powershell
python rank_checks.py --list
python rank_checks.py --case all
python -m unittest -v test_rank_checks.py
```

Those commands make no network calls and invent no model scores. To configure the key without typing it directly into shell history:

```powershell
$typesafeSecret = Read-Host "TypeSafe API key" -AsSecureString
$env:TYPESAFE_API_KEY = [System.Net.NetworkCredential]::new("", $typesafeSecret).Password
python rank_checks.py --case 01_finish_journey --live
python rank_checks.py --case all --live
```

A complete live suite makes six API requests; the recovery and explicit-priority cases bypass TypeSafe. There are no automatic retries. With large demand, an individual request may fail; the trace reports `unavailable` and no ranking advice.

On macOS/Linux, set `TYPESAFE_API_KEY` in your shell environment and run the same Python commands, using `python3` if necessary. Do not paste the key into the playground State, your observations, or a shared result file.

## What each case tests

| Case | Desired observation |
|---|---|
| `01_finish_journey` | `c1`, the post-cancellation readback, outranks repeated profile inspection and copyright text |
| `02_permissions_objective` | `c1`, checking protected details, is favored for the permissions objective |
| `03_search_objective` | With identical evidence and candidates, changing the objective favors `c2`, the search check |
| `04_required_recovery` | Existing recovery rules select precedence for `c1`; no API call and no mutation replay |
| `05_explicit_human_priority` | Explicit eligible first priority `c2` takes precedence; no API call |
| `06_existing_eight_only` | Eight suggestions repeat known observations; low information scores should trigger `weak_candidates` |
| `07_explore_adds_candidate` | Adding Explore-proposed `c9` creates a useful next check; ranking never invented that candidate |
| `08_actor_and_version_change` | Employee/b17 observations must not make an untested manager/b18 check look redundant |

Expected results live in `expectations.json`. They are never included in the model request. These are easy synthetic contract probes, not a representative benchmark or proof that TypeSafe improves exploration.

Cases 06 and 07 directly address the current eight-suggestion limit. The first asks whether TypeSafe can recognize low-value candidates. The second checks whether an additional Explore-proposed check is ranked appropriately. Their difference is candidate availability, so do not describe it as a measured improvement from scoring alone.

## Scoring policy

Each eligible candidate receives two independent Score questions, both on a 0–3 descriptive scale:

- **Relevance:** how directly the check serves the supplied objective.
- **Information:** what distinct behavior or concrete uncertainty its outcome could clarify, given the saved observations.

The code calculates:

```python
priority = 0.4 * relevance / 3 + 0.6 * information / 3
```

The weights are transparent trial defaults, not learned weights or calibrated probabilities. The result is not failure likelihood, severity, or percentage coverage. Confidence is displayed separately and does not reduce the priority score.

When every candidate has information below 1.5, the script retains all scores but returns `weak_candidates` without a suggested winner. That 1.5 threshold is an uncalibrated demonstration of abstaining from a weak set. Tune or remove it using real traces. It is not a stop condition, an authorization rule, or a requirement that Explore obey.

`control.json` represents facts supplied by the host, not judgments made by TypeSafe:

- `eligible`: current execution rules permit considering this check.
- `requiredRecovery`: existing recovery work takes precedence over ordinary exploration.
- `humanPriority`: 1 precedes 2; 0 means ordinary work. It never overrides ineligibility or required recovery.

For real integration, obtain these values from the existing host and revalidate at execution. An `eligible: true` value in an editable demo file grants no product authorization. Invalid controls fail before model evaluation. The runner only provides advice or states the host precedence; it does not dispatch actions.

## Read and repeat results

Live calls save complete JSON traces under `results/` by default. They include the exact request, full answer distributions, model/rubric version, ranking weights, input digest, observed API latency, reported token usage, and suggested ordering. No API key is saved. Real evidence may be sensitive if you replace the synthetic fixtures; minimize what is sent and retained.

Use a different directory and shuffle candidate order to check whether incidental ordering changes the suggestion:

```powershell
python rank_checks.py --case all --live --shuffle-seed 7 --out results-seed-7
python rank_checks.py --case all --live --shuffle-seed 29 --out results-seed-29
```

Compare stable candidate IDs, not positional question names. A repeat can differ; log the first result and variation rather than rerunning until you get the answer you want. A low-confidence or close ranking is a reason for Explore to inspect the evidence. If the API, model version, or response validation fails, ordinary Explore selection remains the fallback.

The 15-second urllib timeout is a socket-operation timeout, not a host-level overall deadline. A production integration needs a real overall deadline and freshness validation. These traces measure TypeSafe call cost/latency only; the live Explore experiment must also measure agent work, product requests, and integration overhead. Multiply actual reported input tokens by your applicable price to estimate inference charges.

## Adapt to a saved Perquiro state

Copy a case folder to a new uniquely named folder under `cases/`, then edit `state.json` and `control.json`. The CLI discovers case directories automatically. IDs must be unique and match across both files.

Use the actual objective, current Actor/build, concise source-linked saved observations, concrete open questions, and 3–12 feasible candidate checks. This is an initial trial range, not a product cap. Candidates may combine existing `nextChecks` with checks Explore proposes from the current evidence. Record their origin outside the model-facing text so you can distinguish ranking effects from candidate-generation effects.

The CLI rebuilds questions from `rank_checks.py`; editing an exported `questions.json` affects only your playground experiment. Change the rubric constants/instruction builder in the Python file for CLI experiments and assign a new rubric version. `build_examples.py` regenerates the bundled synthetic cases, overwriting those named fixture files; it is not necessary for normal runs.

Do not send the full exploration transcript, credentials, unrelated project records, expected rankings, or another model's preferred answer. Do send relevant contradictory observations and scope information. Missing evidence must not be replaced with an invented summary.

## Turn this into the bounded live Explore trial

The playground checks rubric behavior. Establishing an exploration benefit requires two bounded Explore executions from equivalent starting conditions:

1. Use the same product build, isolated/reset fixture state, starting Actor, objective, Explore model/settings, and product-request budget. Keep Test Manager outside both arms. Use fresh independent sessions so one arm does not inherit the other's discoveries.
2. Give both arms the same candidate-generation policy: existing suggestions plus independent Explore proposals when useful. Baseline chooses normally; the advised arm receives scores and may override. Only the advised arm calls TypeSafe.
3. At each meaningful selection boundary, capture candidate IDs and origins, referenced observations, current objective/scope, host eligibility/precedence, proposed ordering, actual selected check, and any override reason. Save product outcomes immediately using the existing Explore contract.
4. Recheck current scope/constraints before execution. Do not re-score a stale snapshot or reuse advice from before a state-changing action as if it were current.
5. Compare meaningful behavioral outcomes reached, distinct behavior learned, Journeys completed, concrete unknowns resolved, repeated low-value checks, saved evidence and linkage, product requests, agent/MCP calls, full wall time, and total tokens. Surface count alone is not the success metric. Require evidence for a claimed resolved question.
6. Repeat from several independent starting situations, retaining both wins and regressions. Have reviewers assess the saved evidence without seeing which arm produced it where practical. One attractive ranking is not sufficient evidence of an exploration improvement.

The adapter functions `prepare`, `call_api`, and `rank_response` are usable building blocks, but connecting them to Perquiro's authoritative records and live host checks is still integration work. No repository-specific tool names or line contents are assumed here.

## Sources and validation

The request follows the [HTTP API](https://docs.typesafe.ai/api) and [Score primitive](https://docs.typesafe.ai/primitives/score). The design uses the [focused-judgment guidance](https://docs.typesafe.ai/concepts/how-to-build-with-system-one) and [composite scoring pattern](https://docs.typesafe.ai/patterns/composite-scoring). Review [known limitations](https://docs.typesafe.ai/model-jaggedness/jev-1.13) before interpreting model outputs as reliable assessments.

The local tests use authored responses solely to check routing, validation, and ID binding. No mock scores are presented as real TypeSafe outputs. No live accuracy, latency, or exploration improvement is claimed.
