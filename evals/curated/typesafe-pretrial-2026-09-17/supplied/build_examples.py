"""Regenerate synthetic playground inputs. Expectations are never sent to TypeSafe."""
import copy
import json
from pathlib import Path
from rank_checks import prepare

ROOT = Path(__file__).resolve().parent
DEFAULT_OBJECTIVE = "Explore this HR product: learn distinct behavior and complete meaningful Journeys, favoring checks that answer concrete open questions."
cases = []


def add(name, objective, observations, questions, checks, expectations, control=None, scope=None):
    state = {"objective": objective,
             "scope": scope or {"actor": "employee-a", "build": "b17", "environment": "isolated synthetic sandbox"},
             "observations": observations, "open_questions": questions,
             "candidates": [{"id": f"c{i+1}", "check": check} for i, check in enumerate(checks)]}
    controls = {c["id"]: {"eligible": True, "requiredRecovery": False, "humanPriority": 0} for c in state["candidates"]}
    if control:
        for cid, override in control.items(): controls[cid].update(override)
    cases.append((name, state, controls, expectations))


add("01_finish_journey", DEFAULT_OBJECTIVE,
    ["On b17, employee-a submitted leave request 77 and saw it Pending in the list.",
     "Cancellation returned a success response, but request 77 has not been reloaded afterward. The attempt outcome was saved and no recovery is pending.",
     "The current employee's profile name was opened and verified twice on b17."],
    ["Does cancellation persist after reload, and where does the cancelled request appear?"],
    ["Reload request 77 and inspect its status and its presence in active/history views.",
     "Open the employee profile again and read the same displayed name.",
     "Open the About page and read the application copyright text."],
    {"top_id": "c1", "explanation": "Resolve the unfinished cancellation outcome before repeating a known fact or collecting an isolated detail."})

comparison_observations = [
    "In employee-a's b17 session, the directory shows employee-b's name. The product policy permits directory names but restricts other employees' private details.",
    "It is unknown whether opening employee-b's private-details section returns protected fields.",
    "Directory search behavior has not been exercised. Known fixture names include Alice Green and Alicia Brown.",
    "The employee profile's displayed name has already been checked in this same context."]
comparison_questions = ["Can this employee retrieve another employee's protected details?",
                        "Does directory search match a lowercase name prefix?"]
comparison_checks = [
    "Using the current employee in the authorized sandbox, open employee-b's private-details section and inspect what is returned.",
    "Search the directory for 'ali' and inspect whether Alice Green and Alicia Brown appear.",
    "Open the employee profile and read the already-verified displayed name."]
add("02_permissions_objective", "Explore whether the supplied restrictions on other employees' private details are enforced.",
    comparison_observations, comparison_questions, comparison_checks,
    {"top_id": "c1", "explanation": "The permissions investigation should outrank search for this objective."})
add("03_search_objective", "Explore directory search matching behavior, starting with lowercase name prefixes.",
    comparison_observations, comparison_questions, comparison_checks,
    {"top_id": "c2", "explanation": "With the same evidence and candidates, changing the objective should favor the search check."})

add("04_required_recovery", DEFAULT_OBJECTIVE,
    ["An archive mutation was dispatched; its response was lost. The saved attempt is unresolved.",
     "An authorized read-only lookup can inspect the exact affected project's current state.",
     "The user also asked to check the public-holiday calendar first among ordinary exploration tasks."],
    ["Did the previously dispatched archive attempt take effect?"],
    ["Recover the unresolved attempt using the authorized read-only project-state lookup.",
     "Dispatch the archive mutation again.",
     "Inspect the public-holiday calendar."],
    {"status": "recovery_precedence", "precedence_ids": ["c1"], "api_calls": 0,
     "explanation": "Host recovery rules apply before ordinary ranking and human priorities among ordinary tasks. No replay is authorized."},
    control={"c1": {"requiredRecovery": True}, "c2": {"eligible": False}, "c3": {"humanPriority": 1}})

add("05_explicit_human_priority", DEFAULT_OBJECTIVE,
    ["The user explicitly requested: check the public-holiday calendar first.",
     "There are no pending recovery attempts. All listed checks are eligible in the current sandbox."],
    ["Does the holiday calendar show the configured regional holidays?",
     "Does cancelling a pending leave request persist after reload?"],
    ["Cancel the authorized sandbox leave request and inspect its state after reload.",
     "Inspect the public-holiday calendar against the configured regional holidays.",
     "Open the About page and read the copyright text."],
    {"status": "human_priority", "precedence_ids": ["c2"], "api_calls": 0,
     "explanation": "The explicit first priority takes precedence without paying for a ranking call."},
    control={"c2": {"humanPriority": 1}})

pages = ["Profile", "Directory", "Leave list", "Calendar", "Notifications", "Dashboard", "Settings", "Help"]
repeat_observations = [f"The {page} page was opened in this same actor/build session and its page title and default contents were recorded." for page in pages]
repeat_observations += ["Approved sandbox leave request 77 has a visible Cancel action. Its status and current leave balance were recorded. Cancellation after approval has never been exercised. No unresolved attempts exist."]
repeat_questions = ["What happens to an approved request and the leave balance after cancellation?"]
repeat_checks = [f"Reopen the {page} page and read its title and default contents again." for page in pages]
add("06_existing_eight_only", DEFAULT_OBJECTIVE, repeat_observations, repeat_questions, repeat_checks,
    {"status": "weak_candidates", "suggested_id": None,
     "explanation": "The eight existing suggestions repeat known observations and cannot answer the open question. Do not mistake the highest of eight weak scores for a valuable recommendation."})
add("07_explore_adds_candidate", DEFAULT_OBJECTIVE, repeat_observations, repeat_questions,
    repeat_checks + ["For approved sandbox request 77, exercise the authorized Cancel action once, then reload its detail and leave balance to establish the resulting behavior."],
    {"top_id": "c9", "explanation": "An Explore-proposed candidate outside the original eight should become useful. TypeSafe did not discover or authorize it."})

add("08_actor_and_version_change", "Understand the manager approval Journey on build b18.",
    ["On build b17, employee-a opened the leave list and saw only their own requests.",
     "On build b18, manager-a has successfully logged in. The manager's pending-team-requests view has never been inspected.",
     "The About page copyright text was recorded in the current manager-a/b18 session."],
    ["What team requests and approval controls are visible to manager-a on b18?"],
    ["As manager-a on b18, open pending team requests and inspect the visible request details and approval controls.",
     "Reopen About and read the same copyright text."],
    {"top_id": "c1", "explanation": "An employee/b17 observation must not make a manager/b18 check look redundant."},
    scope={"actor": "manager-a", "build": "b18", "environment": "isolated synthetic sandbox"})


def main():
    expected = {}
    for name, state, controls, expectation in cases:
        directory = ROOT / "cases" / name
        directory.mkdir(parents=True, exist_ok=True)
        request, gate = prepare(state, controls)
        for filename, data in [("state.json", state), ("control.json", controls),
                               ("questions.json", request["questions"] if request else {}),
                               ("request.json", request), ("host_decision.json", gate)]:
            (directory / filename).write_text(json.dumps(data, indent=2), encoding="utf-8")
        expected[name] = expectation
    (ROOT / "expectations.json").write_text(json.dumps(expected, indent=2), encoding="utf-8")
    print(f"Created {len(cases)} synthetic cases. Expectations are stored separately from model inputs.")


if __name__ == "__main__":
    main()
