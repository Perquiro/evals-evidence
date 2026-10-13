# Solo access

This is an isolated instance of the actual BugBusters HR training app. All data is synthetic and disposable. Creating and changing evaluation records through ordinary UI operations is expected within the stated budget. Ordinary UI operations by the three current Actors are authorized. Mark created data as evaluation data. The original localhost:5173 app and original Perquiro connection are outside scope. No reset, direct API calls, Product source, answer key, evaluator artifacts, other trials, or other Project connections. Use only the provided bridges. Do not inspect their implementation or internal browser state. Keep local files outside .perquiro. Do not write Findings, Scenarios, Expected Behavior, Actors, Setup, Reviews, or Tests.

The combined trial budget is 40 dispatched application API requests. Each request passing the gate consumes one, including automatic browser fetches, errors, and requests later aborted. The bridge does not retry. Attempts refused after forty are cap refusals and do not reach the Product or consume another application request. They are reported separately with intended method/path, sequence, cap_refused disposition and productReached:false. Do not treat them as Product denials or reached endpoints. Save their affected checks as blocked/unfinished; use reconciliation not_executed only when the available trace proves a mutation was never dispatched. Unknown outcomes require recovery.

Static assets, prepared authentication, browser snapshots and MCP calls are excluded. Each intentional browser action plus its automatic app fetches is one browser transaction: record all received results before the next intentional action. Browser-only client validation can produce an outcome without an API request. The raw browser/API trace exists for evaluator grading but does not replace required Knowledge writes.

Read AGENTS.md and REQUEST.md. You are the only agent for this entire trial. No delegation. You can use all prepared Actors: Emily.dawson, michael.reed, hannah.blake. You choose which Actor and task to explore next.

The user authorizes sequential fixed-Actor executions. The current skill's no-Actor-switch rule applies within each execution; it does not prevent you from closing one execution and beginning another through this host. This access rule is common in scope to the sequential execution authorization. Your conversation and Knowledge persist across executions. Closing an execution means its local work is complete, not that your whole session has ended. A new execution grants no mutation retry permission.

Commands from the Project root:
- node solo.mjs list
- node solo.mjs call TOOL arguments.json (read-only MCP outside an execution)
- node solo.mjs status (request and time allowances, ownership)
- node solo.mjs begin ACTOR assignment.json (your chosen question/scope and any known context)
- node solo.mjs release EXECUTION_ID handoff.json

Begin selects one Actor and returns an execution directory and exact instructions. Read its WORKER.md and follow the unchanged current v2 Explore skill. Perform the work yourself with that execution's browser.mjs and tools.mjs; do not spawn an agent. Remain on that Actor until you have saved results and explicitly released the execution. Then choose another authorized execution if useful. The returned worker prompt is a local phase instruction for you. You retain authority to read this ACCESS.md and REQUEST.md and perform these host boundary operations.

Use the installed Explore skill to select and complete useful exploration. No additional manager skill applies.

End with no active execution, SUMMARY.md describing supported outcomes, saved references, concrete gaps, usage and the actual stop reason. Do not ask for routine confirmation.
