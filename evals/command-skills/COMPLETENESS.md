# Command skill completeness

Completeness asks whether an Agent accounted for every relevant item in a fixed case, performed the work within its scope, and left the required records. The existing rubric measures correctness and quality. Keep those scores unchanged and report inventory coverage as a separate measure.

The inventory is private evaluator material. Candidates receive the ordinary request, installed skill, Project state, and Product access. They must discover the relevant items through those inputs. Do not pass this document or case inventories to candidates.

## Freeze the inventory before an attempt

Give each item a stable case-prefixed ID. Bind evaluator aliases to actual record IDs in the private manifest. An item states its priority, obligation, expected evidence, and any permitted exclusion or blocker. Use P0 for a boundary that can invalidate the attempt, P1 for required work or source consideration, and P2 for useful optional work. Report these priorities separately; do not let several easy items compensate for a P0 failure.

Classify each obligation as **consider**, **deliver**, **report**, or **preserve**. One item may have several obligations. Every required source must receive a disposition. Every selected outcome must be traced through its required action and record. A short, correct boundary stop can finish the requested command handling while leaving delivery blocked.

The 12 Create, Generate, Run, and Investigate Markdown cases currently describe intended fixtures. Their inventory tables are designs, not observed coverage. An executable case must bind every item to accessible seeded state or a reproducible Product behavior before scoring. If an item is absent from the implemented fixture, mark the affected attempt fixture-invalid; do not quietly shrink its denominator. Record known omissions from the overall suite separately, including Product follow-up and replacement/cancellation paths not exercised here.

## Record three separate facts

Each scored item has `considered`, `actionCompleted`, and `durablyRecorded` values of yes, no, unknown, or not-required, with evidence references for each. Reading a response proves receipt; an explicit decision, relevant action, or accurate handoff proves consideration. A record that existed before the attempt does not prove that the candidate read it. An attempted mutation does not prove a committed record.

Use these final statuses as a readable summary of those fields:

| Status | Evidence required |
|---|---|
| Completed and recorded | Required action succeeded and a final public Project read confirms the required durable record and links. |
| Completed, no record required | Required consideration, report, or preservation succeeded; the skill requires no new Project record. Retain the transcript or before/after proof. |
| Seen but unrecorded | Relevant behavior or work was observed/completed, but its required Project record is absent. A final answer is not a substitute. |
| Considered, incomplete | The Agent recognized the item but neither completed its required action nor established a legitimate blocker or exclusion. |
| Missed | Accessible relevant material was not considered or handled. A skipped continuation that concealed it is a miss. |
| Blocked | A concrete dependency, human boundary, execution restriction, or exhausted budget prevents completion. Retain the cause and remaining work. |
| Excluded | The frozen scope permits this disposition and the evidence supports the reason. Include it in the report. |
| Unverifiable | Missing traces, inaccessible evidence, or absent final reads prevent a judgment. Do not treat missing evidence as a pass or an established miss. |

Report wrong assertions, fabricated facts, secret exposure, invalid Decisions, or other hard failures separately even if an item was completed and recorded. These statuses describe coverage, not correctness.

## Denominators and reporting

Report counts and item IDs, not a single completeness percentage:

- **Consideration:** items with supported consideration divided by all required consideration items. This includes legitimate exclusions and blockers, because the Agent still needs to recognize and explain them.
- **Action completion:** completed required actions divided by all required in-scope actions. Keep blocked actions in this denominator. Exclude only predeclared out-of-scope or conditional actions whose condition did not occur, listing each reason. Show blocked counts alongside completion so a correct boundary stop is visible.
- **Durable recording:** completed required records divided by all required in-scope records, including those whose prerequisite work is blocked. Also list seen-but-unrecorded items explicitly. Use not-applicable when no durable write is required.
- **Disposition coverage:** required items with an evidence-backed completed, blocked, or permitted excluded disposition divided by all required items. This can be complete while action completion is partial.

P2 optional work has a separate count. Do not add it to required denominators. Freeze budgets before running; report actual time/tool limits and whether a limit was hit. Budget exhaustion explains a gap but does not turn it into completed coverage. For broad discovery, preserve both the full known inventory and the portion reached within budget.

Every result row records: item ID; priority; obligations; candidate-visible discovery source; the three evidence fields; final status; reason; evidence references; and any remaining action. For simulated tool results, state exactly what was simulated. Generate or repair claims require actual generated-file execution to establish runnable delivery. Reviewer judgments cannot replace that execution.

## What counts for each command

| Command | Full source consideration | Required completion and recording |
|---|---|---|
| Explore | Reachable Surfaces, meaningful Journeys, relevant Actors, and outcomes in the frozen fixture inventory. Track each Actor/outcome separately. | Actual visits and exercised outcomes, followed by grounded Knowledge and relevant links. A catalog listing alone is not a visit. |
| Create, new coverage | Every eligible Journey, accepted comparison relevant to candidates, and known Explore gaps. | Grounded selected Scenarios in one returned Coverage Review, plus an explanation of omitted Journeys. A useful short selection is valid; do not require every possible Scenario. |
| Create, linked work | Every source Scenario and Decision in the one selected work item; relevant accepted comparisons. | Exactly one faithful same-Journey proposal per source, with complete source mappings in the returned linked Review. Other work remains explicitly outside this invocation. |
| Generate | Every Scenario in the requested queue and each accepted Given/When/Then boundary, plus affected shared files and prerequisites. | Each supported selected Scenario has a faithful file, Recorded Test, history, and terminal recorded check after its final relevant edit. Unsupported or blocked delivery stays visible. |
| Run | Every requested recorded Test and every returned result, fault, Stop request, and bundle disposition. | Frozen selections and terminal outcomes are read and reported individually; later unexecuted selections remain named. A failing Test can have a fully completed execution. |
| Investigate | Every affected requested failure or selected work source, accepted outcome, available source Evidence, and material unknown. | Each has a justified repair/history/check or a judgment Finding and Review, or an explicit blocker. Unrelated failures and human Decisions remain outside scope. |

For Create selection, report two inventories: consideration of all eligible Journeys, then completion of the candidate's selected behavior. An observed but deliberately deferred behavior is not a missing Scenario when its omission is justified. A candidate that selects nothing despite available useful grounding can still fail the existing coverage-value rubric. For linked work, all sources are mandatory; the Agent cannot choose a smaller denominator.

## Review existing and new attempts

An old rubric pass does not establish inventory completeness. Reassess preserved artifacts item by item and label the review retrospective. Preserve original scores. If the old attempt lacks evidence needed for an item, use unverifiable and name the missing capture. Run a fresh attempt when that matters to the comparison.

Compare variants on the same implemented inventory, model, tool access, and budget over repeated fresh attempts. Report correctness, completeness, readability, and cost separately. The fixture inventory supports claims about that fixture only; it cannot establish that an Agent will discover everything in a real Product.
