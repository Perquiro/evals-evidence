# Perquiro evaluation evidence

Frozen evaluation evidence for [Perquiro/Perquiro](https://github.com/Perquiro/Perquiro).

The source repository keeps short reports, curation manifests, and verification instructions under `evals/`. This repository holds the full byte-preserved evidence tree.

## Layout

Paths under `evals/` match the historical source-tree layout and the receipts in `evals/CURATION.json` and `evals/curated/typesafe-hr-execution-348/CURATION.json` in the source repository.

## Verify

From a Perquiro source checkout, with this repository cloned at `PERQUIRO_EVALS_EVIDENCE`:

```powershell
$env:PERQUIRO_EVALS_EVIDENCE = 'C:\path\to\evals-evidence'
node evals/verify-curation.mjs
```

See `evals/README.md` in Perquiro/Perquiro for the retention rules.