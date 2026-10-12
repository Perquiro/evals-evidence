# Explore completion rerun for #693

Retained evidence for three completed Luna/medium runs on disposable BugBusters HR data. Luna 1 saved zero of 27 complete checks, Luna 2 saved three and Luna 3 saved four. They are supplementary trials with changed launch conditions, not paired replacements for the original manager-value experiment.

Each run keeps the anonymous public Knowledge and browser/Product packet, frozen inventory and grading procedure, measurement and separately labelled launch provenance. The provenance directory was withheld from semantic graders. Full private Agent rollouts are excluded.

Luna 2 has an independent initial semantic grade and a fresh second review with per-check and per-claim adjudication. Both used Claude Opus 5.5. The initial reviewer returned `notes` as a string; `grade-initial.json` wraps it in an array to satisfy the original validator without changing decisions. Its exact stdout is retained. The second review's exact stdout is also retained, including its Markdown fence. `grade-final.json` is the extracted JSON grade.

HR12 reads an existing submitted leave request. The second review confirmed that the frozen requirement does not require a new submission during the run. The final saved checks are HR03, HR12 and HR14. There is one unsupported material claim about Manager navigation and one non-material field-label error. No Scenario was proposed.

Luna 1's read-only claim was unverified. It attempted no write or Product action. Its natural zero-coverage early stop is retained as a completed result.

Failure sorting retains the initial pass, reviewed final pass and category adjudication. Luna 1 has 27 never-tried checks. Luna 2 has 14 never tried, one missing required saved result, eight explicitly deferred workflows, one unknown partial sequence and zero causally rejected saves. The verifier checks these totals and their inventory/event references. It does not establish semantic attribution.

Luna 3 created a leave request successfully but stopped after 16 minutes when it lost the execution directory after context loss. The parent forcibly released its still-active execution after natural CLI closure. It used 10 of 40 Product requests. Independent grading and fresh review credited HR03, HR04, HR11 and HR12, with one unsupported material claim. All four complete raw checks were saved. Its 23 misses comprise 20 never tried and three unknown partial sequences. Two actionable inspection errors have no causal link to a lost complete check. The final sorting separates accepted-write references from browser/Product trace references and forced release from completion by the Agent. The recovery correction follows this frozen result.

Run `node evals/curated/explore-completion-693/verify.mjs` from this repository. The verifier checks retained byte hashes and reruns the original frozen measurement validator. It checks structural support and checkpoint eligibility. Semantic completeness remains the reviewers' cited judgment.

The frozen run commits are `1fcc46e9`, `9d6f7228` and `b629051a` in Perquiro/Perquiro. The first two precede capture recovery. The third includes that correction and precedes execution-path recovery. Each later boundary preflight is separate evidence. No fourth score is claimed here.
