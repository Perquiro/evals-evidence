# Retained Library evaluation

Issue 253 restores the Library fixture, its 25-outcome inventory, the v8 Explore variant and the supporting evaluation policy from `53deabaeeda0d9c8643eda98eb4a95b2d3f36ce8`. This directory contains that selected comparison, not the entire historical command-skill suite. Broader case counts in the restored `COMPLETENESS.md` describe the original suite at that commit.

The [repeated-run report](results/2026-09-09-memory/REPORT.md) links raw traces, final public reads, per-outcome judgments and failed attempts. The [method](results/2026-09-09-memory/METHOD.md) records source, model, host and grading limits. Candidates must not receive private inventories or grading notes.

Start a fresh disposable Library Project with:

```powershell
node --import tsx evals/command-skills/scripts/serve.mjs willow-library <new-output-directory>
```

The process prints its temporary Project and Product URL. Give a fresh Agent that Project's ordinary request and access instructions, with the shared 40-request limit. Use the returned public MCP and HTTP bridge. An optional third argument selects an installed Explore variant file. Create `STOP` in the output directory after the candidate finishes, then wait for the fixture process to close. `capture-explore.mjs` reads final public state after that stop; it does not repair candidate Knowledge.

`memory-metrics.mjs`, `explore-coverage.mjs` and `audit-memory-items.mjs` extract traces and typed state. A reviewer supplies `grading-notes.json` and `quality-notes.json`; `grade-memory.mjs` checks their Observation references, and `report-memory.mjs` renders the five-run report. Mechanical attempt matching deliberately leaves unsupported correlations unmatched. In particular, a non-execution reconciliation removes an old attempt from the match candidates. Human attribution must identify the actual replacement rather than silently reuse the old id.

`serve-reservation-recovery.mjs` starts the separate shared-Product browser recovery proof. Its `validate-actions-recovery.mjs` verifies retained events and final reads. The deterministic interruption matrix lives in `src/knowledge/explore-recovery-acceptance.test.ts`.
