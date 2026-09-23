# Independent preparation review

Ready to freeze: yes

On 2026-09-17, two fresh Codex subagents reviewed this protocol before any scored live execution. `protocol_spec_review` checked the full ticket/Spec, the Employee checklist against the pinned Product README, quality criteria and controlled grading. `protocol_standards_review` checked reset mechanics, clock behavior, accounting, rates and artifact validation. They worked independently of the author. Their runtime did not expose concrete model identities; no cross-family independence is claimed. Neither read the Product answer key. This is a preparation review, not the two anonymous live grades required by #348.

The first review found that action count plus login protection could permit loss of the only completed Employee workflow. The final rule requires at least one completed workflow beyond access in ordinary Explore and protects that count in advised Explore. The checklist now requires unequal sort keys and nonzero weekend hours, corrects README citations and discloses omitted workflows/checks. The Spec reviewer explicitly found the corrected checklist and protocol suitable to freeze.

The Standards reviewer confirmed that `/api/reset` preserves sessions and that a fresh server is necessary. Two seed-receipt executions produced the same expected hash. A clock probe showed fixed Product Date while timers and performance.now advanced. It also found four reporting defects during preparation: incomplete cache classifications could bypass subset bounds, negative non-token charges could reduce actual cost, live launch files lacked required manifest membership, and launch validation did not verify frozen files. Those defects were corrected before freeze. Regression tests cover each rule, including CLI rejection of changed checklist/raw artifacts and an unmanifested launch.

Both reviewers independently checked the four controlled captures, their manifest hashes, normalized copies, quality support, interval arithmetic and expected cost. Their results agreed:

| Authored trace | Credited actions | Completed Employee workflows | Total / selection time | API-equivalent cost |
|---|---:|---:|---:|---:|
| ordinary-success | 3 | 1 | 5,000 / 500 ms | $0.002890 |
| advised-success | 3 | 1 | 4,500 / 1,500 ms | $0.005822 |
| override-fallback | 3 | 1 | 6,500 / 2,200 ms | Unknown; $0.008670 known subtotal |
| absent-evidence | 0 | 0 | 2,000 / 500 ms | Unknown |

The supported items are valid Employee login, leave submission and a linked later readback, each with saved Observation support. The absent-evidence trace proposes work but has no executed actions or saved Observations. The fallback trace retains its HTTP 503 attempt with unknown usage. Pair 1 preserves the rehearsed quality count and takes less total time, but costs more. The joint live-comparison decision remains inconclusive because these are controlled traces and the frozen live schedule has not run.

Parent reconciliation: all preparation findings were accepted and corrected; no grading expectation was changed to accommodate a scored Product outcome. The final checklist and tolerance precede live scoring. The semantic reviewer confirmed the revised quality-regression probes, and the accounting reviewer independently recomputed the costs. No unresolved material preparation finding remained when freezing.

The reviewers saw condition labels in the authored rehearsal. They checked the reporting procedure, not blind live outcomes or an Agent's compliance. Exact-commit delivery review is recorded separately on the PR. #348 must create anonymous evidence packets, retain two initial grades and adjudication, audit withholding/model/driver receipts, and obtain an independent result review. Semantic truth and raw-counter normalization still require human or independent Agent inspection; structural checks cannot replace that work. Review/author token usage is unavailable in this host and remains unknown, outside the candidate fixtures.
