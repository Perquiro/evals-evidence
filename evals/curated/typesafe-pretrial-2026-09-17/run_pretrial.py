"""Reproduce the supplied kit pre-trial; secrets stay in process memory."""
import argparse
import copy
import getpass
import importlib.util
import json
import os
from pathlib import Path
import tempfile
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "supplied"
spec = importlib.util.spec_from_file_location("rank_checks", SOURCE / "rank_checks.py")
rank = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rank)


def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2), encoding="utf-8")


def response(request, levels=None):
    levels = levels or {}
    return {"model": rank.MODEL, "answers": {
        qid: {"type": "score", "score": float(levels.get(qid, 2)), "confidence": 1.0,
              "probabilities": {str(i): float(i == levels.get(qid, 2)) for i in range(4)}}
        for qid in request["questions"]}}


def offline():
    names = sorted(p.name for p in (SOURCE / "cases").iterdir() if p.is_dir())
    situations = []
    exports = []
    for index, name in enumerate(names, 1):
        state, controls = rank.load_case(name)
        request, gate = rank.prepare(state, controls)
        folder = SOURCE / "cases" / name
        exports.append({"case": name,
            "request_matches": json.loads((folder / "request.json").read_text()) == request,
            "questions_match": json.loads((folder / "questions.json").read_text()) == (request["questions"] if request else {}),
            "host_decision_matches": json.loads((folder / "host_decision.json").read_text()) == gate})
        save(ROOT / "dry" / f"{name}.json", rank.run_case(name))
        state["available_checks"] = state.pop("candidates")
        situations.append({"workspace": index, "context": state, "host_controls": controls})
    neutral = Path(tempfile.gettempdir()) / "harbor-hr-planning-0917"
    save(neutral / "workspaces.json", situations)
    save(ROOT / "baseline-input.json", situations)
    save(ROOT / "export-consistency.json", exports)

    checks = []
    state, controls = rank.load_case(names[0])
    controls["c1"]["requiredRecovery"] = True
    controls["c1"]["eligible"] = False
    _, gate = rank.prepare(state, controls)
    checks.append({"probe": "blocked recovery with eligible ordinary work", "result": gate,
                   "pass": gate["status"] == "recovery_blocked"})
    state, controls = rank.load_case(names[0])
    controls["c1"]["humanPriority"] = 1
    controls["c1"]["eligible"] = False
    request, gate = rank.prepare(state, controls)
    checks.append({"probe": "human priority cannot restore eligibility",
                   "pass": gate is None and "c1" not in [c["id"] for c in request["state"]["candidates"]]})
    malformed = response(request)
    malformed["answers"][next(iter(malformed["answers"]))]["probabilities"] = [0, 0, 1, 0]
    try:
        rank.rank_response(request, malformed)
        rejected = False
    except ValueError:
        rejected = True
    checks.append({"probe": "invalid distribution rejected", "pass": rejected})
    missing = rank.run_case(names[0], True, transport=lambda req: (response(req) | {"model": "unexpected"}, "authored"))
    checks.append({"probe": "model mismatch falls back", "pass": missing["status"] == "unavailable"})

    # Deliberately authored inputs prove the combiner cannot distinguish equal
    # relevance/information by impact; these are not predictions of Jev output.
    state = {"objective": "Understand whether employees can access and use this HR product.",
        "scope": {"actor": "employee", "build": "b1", "session": "signed out"},
        "observations": ["The public holiday calendar is accessible without login.",
                         "Every private employee workflow requires successful login; valid fixture credentials are available."],
        "open_questions": ["Can an employee log in?", "Does the public holiday calendar show regional dates?"],
        "candidates": [{"id": "c1", "check": "Inspect regional dates on the public holiday calendar."},
                       {"id": "c2", "check": "Log in with the fixture Employee and verify private employee access."}]}
    controls = {c["id"]: {"eligible": True, "requiredRecovery": False, "humanPriority": 0} for c in state["candidates"]}
    request, _ = rank.prepare(state, controls)
    result = rank.rank_response(request, response(request))
    checks.append({"probe": "equal dimensions ignore login dependency", "kind": "diagnostic, authored responses",
                   "request": request, "result": result,
                   "finding": "Equal dimensions select c1 by ID despite the supplied access dependency; no separate impact dimension exists."})

    # Distinguish response retention from fallback behavior.
    invalid = response(request)
    invalid["model"] = "unexpected"
    report = rank.run_case(names[0], True, transport=lambda req: (invalid, "authored"))
    checks.append({"probe": "invalid response retention", "retained_by_original_runner": "response" in report,
                   "finding": "The supplied runner drops the raw response and request ID when validation fails."})
    save(ROOT / "diagnostics.json", checks)
    print(f"Offline exports checked: {len(exports)}; neutral inputs: {neutral}", flush=True)


def live(batch="live"):
    key = getpass.getpass("TypeSafe key (hidden): ").strip()
    if not key:
        raise SystemExit("No key supplied")
    os.environ["TYPESAFE_API_KEY"] = key
    try:
        for seed in [None, 7, 29]:
            for name in sorted(p.name for p in (SOURCE / "cases").iterdir() if p.is_dir()):
                captured = {}
                def transport(request):
                    raw, request_id = rank.call_api(request)
                    captured.update(response=raw, request_id=request_id)
                    return raw, request_id
                report = rank.run_case(name, live=True, shuffle_seed=seed, transport=transport)
                report["captured_transport"] = captured
                destination = ROOT / batch / f"order-{seed}" / f"{name}.json"
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_text(json.dumps(report, indent=2).replace(key, "[REDACTED]"), encoding="utf-8")
                print(json.dumps({k: report.get(k) for k in ["case", "shuffle_seed", "status", "suggested_id", "api_latency_ms", "error_type", "http_status"]}), flush=True)
    finally:
        os.environ.pop("TYPESAFE_API_KEY", None)


def diagnose(ranking=False):
    key = getpass.getpass("TypeSafe key (hidden): ").strip()
    rows = []
    probes = [
        ("models", None),
        ("systemone", {"model": rank.MODEL, "state": "The button is blue.",
                       "questions": {"color": {"type": "noul", "instructions": "Is the button blue?"}}})
    ]
    if ranking:
        request, _ = rank.prepare(*rank.load_case("01_finish_journey"))
        single = copy.deepcopy(request)
        single["questions"] = {next(iter(request["questions"])): next(iter(request["questions"].values()))}
        probes = [
            ("systemone", {"model": rank.MODEL, "state": "The user cannot log in to access any private workflow.",
                           "questions": {"impact": {"type": "score", "instructions": "How much is product access blocked?",
                                       "criteria": ["No blocked access", "One minor feature blocked", "A main workflow blocked", "All private workflows blocked"]}}}),
            ("systemone", single), ("systemone", request)
        ]
    for index, (endpoint, body) in enumerate(probes, 1):
        req = urllib.request.Request("https://api.typesafe.ai/v1/" + endpoint,
            data=json.dumps(body).encode() if body else None,
            headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
        started = time.perf_counter()
        try:
            res = urllib.request.urlopen(req, timeout=15)
        except urllib.error.HTTPError as error:
            res = error
        with res:
            row = {"probe": index, "endpoint": endpoint, "request": body, "status": res.status,
                   "request_id": res.headers.get("x-typesafe-request-id"),
                   "body": res.read(20000).decode("utf-8", errors="replace").replace(key, "[REDACTED]"),
                   "latency_ms": round((time.perf_counter() - started) * 1000, 1)}
        rows.append(row)
        print(json.dumps(row), flush=True)
    save(ROOT / ("ranking-diagnostic.json" if ranking else "transport-diagnostic.json"), rows)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--live", action="store_true")
    parser.add_argument("--diagnose", action="store_true")
    parser.add_argument("--diagnose-ranking", action="store_true")
    parser.add_argument("--batch", choices=["live", "live-after-recovery"], default="live")
    args = parser.parse_args()
    if args.diagnose or args.diagnose_ranking:
        diagnose(args.diagnose_ranking)
    elif args.live:
        live(args.batch)
    else:
        offline()
