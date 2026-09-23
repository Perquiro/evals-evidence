# Delivery contract for #347

Authority: [ticket #347](https://github.com/Perquiro/Perquiro/issues/347), [Spec #344](https://github.com/Perquiro/Perquiro/issues/344), stories 8–9, Testing Decisions and Further Notes. Both had no comments when read on 2026-09-17. There are no blocking dependencies.

| Acceptance | Owner and proof |
|---|---|
| Equivalent resets, fixed settings and budgets | PROTOCOL.md and protocol.json; launch receipt validation |
| Independent frozen withheld checklist and tolerance | checklist.json, REVIEW.md and frozen.json; hash verification |
| Execution-grounded quality and additional outcomes | evaluate.mjs; controlled trace acceptance tests |
| Complete time, tokens, cache, failure accounting | evaluate.mjs; phase and call ledger tests |
| Published-rate cost, unknown versus zero | rates.json; failed-call and missing-usage acceptance tests |
| Ten cases, acceptable alternatives and option order | Original evidence directories; preservation.json and original verifiers |
| Retained reliability and interpretation limits | PROTOCOL.md and REPORT.md; independent review |
| Rehearsals and independent review | rehearsal/ and REVIEW.md; report command |

Execution order: preserve existing evidence; draft and independently review protocol/checklist; establish negative reporting proofs; implement reporting and rehearse; freeze accepted artifacts; verify and review the committed candidate; deliver a PR. The checklist review can proceed independently of accounting implementation. One owner integrates the change.

Architecture gate: none. Physical placement: no production files. The new executable procedure belongs with its evaluation under evals/curated/typesafe-hr-protocol-347-v2. It consumes evaluator exports; it does not add Product execution, MCP operations, storage or domain meaning. Risk: Standard, because this changes an evaluation process. No glossary changes are needed. Related production/domain changes belong to #345 and #346.

The proof seam is the local report CLI consuming trace, Knowledge and independent grade artifacts. Live MCP integration and scored Product executions are explicitly #348 work. Controlled traces prove report mechanics, not Agent behavior or Product coverage. Invalid/missing support gets no quality credit; unknown usage cannot support a cost win; duplicate identities, contradictory counters and malformed intervals fail closed. Evaluation commands must not contact a model, act on the Product, overwrite frozen evidence or change the checklist after execution.
