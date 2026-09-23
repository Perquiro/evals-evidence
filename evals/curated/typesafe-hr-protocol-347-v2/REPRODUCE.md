# Verify or rehearse without a model

From the repository root, with Node 22.13 or newer:

```powershell
node evals/curated/typesafe-hr-protocol-347-v2/evaluate.mjs verify
node --test evals/curated/typesafe-hr-protocol-347-v2/evaluate.test.mjs
node evals/curated/typesafe-hr-protocol-347-v2/rehearse.mjs
```

The first command verifies frozen inputs and both retained evidence directories. The third runs the actual report CLI against four controlled traces and compares selected outputs with separately recorded expected values. It prints the complete report. No command rewrites input files or contacts a model/Product. The retained `rehearsal/report.json` is that output.

The prior Python verifiers remain unchanged:

```powershell
python -B evals/curated/typesafe-hardcases-2026-09-17/verify.py
python -B evals/curated/typesafe-pretrial-2026-09-17/verify_artifacts.py
```

The original pre-trial verifier also compares the downloaded source kit at its original local path. If that kit is unavailable, report that external-source check unavailable; the new preservation manifest still verifies the complete retained bytes. The harder verifier checks all 120 decisions, three option orders, host controls, frozen inputs and usage against raw host events. Neither runs a new evaluation.

To check a Product seed, use its isolated export from the pinned commit:

```powershell
$env:TZ = 'UTC'
node --require ./evals/curated/typesafe-hr-protocol-347-v2/fixed-date.cjs evals/curated/typesafe-hr-protocol-347-v2/seed-receipt.mjs <product-export>
```

The expected seed hash under this fixed date is `8cde76f36bd76b055e2fee3fc2391ace595d94819a4b96d162f7b4e1eecdf83e`. Seed equality is one reset check; it does not replace fresh server/browser/Project checks.

For #348, copy launch.template.json to an evaluator-only execution directory and fill the execution identities after #345/#346 are complete. Hash the exact frozen.json file for `freeze_sha256`. Validate the launch file, implement and prove the live host controls described in PROTOCOL.md, then record the eight scheduled executions. The protocol and checklist are withheld from executors. Normalize and independently grade the saved artifacts using SCHEMA.md, then run `node evaluate.mjs report <packet.json>` and retain stdout, stderr, exit status and raw inputs. Failed validation makes the result inconclusive and is retained with the failed execution.

`freeze.mjs` was used once after independent preparation review. It refuses to overwrite an existing frozen.json. Changes to grading or inputs require a new experiment directory and review before any new scored execution. Live result artifacts never go into either original pre-trial directory.
