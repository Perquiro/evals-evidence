# Reproduce measurements

Python 3.10 or newer is sufficient. The ordinary runners use the local Codex 0.149.0 binary and existing subscription authentication. runner.py records its exact arguments in each result. Both use low reasoning effort, compact instructions and neutral temporary working paths, with skills/plugins and action tools disabled for these invocations. The CLI still supplies mandatory runtime context.

To verify or recompute summaries from the retained data, run from this directory:

```powershell
python -B verify.py
python -B analyze.py
```

Neither command calls a model. analyze.py rewrites derived summaries and anonymous review projections; raw result files remain untouched. It computes reported-cache-aware API-equivalent estimates, and a separate estimate without cache discounts.

To run a fresh experiment, create a new sibling directory, copy the frozen cases.json, expectations.json, runner.py and PROTOCOL.md, and retain the original supplied ranking dependency at the neighboring typesafe-pretrial-2026-09-17 path. Re-freeze the copied inputs for the new run instead of reapplying freeze.py's draft transformations. That script documents how the authored drafts became this particular frozen set; it is not an idempotent fixture generator.

runner.py refuses to run if results already exists. A fresh run prompts for the TypeSafe key without echo and keeps it in memory. It then executes the frozen original order plus seeds 7 and 29, with method order deterministically shuffled per situation. The neutral prompt content and raw TypeSafe requests, complete responses, CLI events, timings and token counters are saved per decision.

No Product credentials, Product actions or live Perquiro service are required for these synthetic cases. Do not interpret the results as a completed normal-versus-advised Explore execution.
