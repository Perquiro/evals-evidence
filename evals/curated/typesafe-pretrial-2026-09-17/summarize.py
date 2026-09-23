import collections
import json
from pathlib import Path
import statistics
import argparse

ROOT = Path(__file__).resolve().parent
parser = argparse.ArgumentParser()
parser.add_argument("--batch", choices=["live", "live-after-recovery"], default="live")
args = parser.parse_args()
suffix = "" if args.batch == "live" else "-after-recovery"
traces = [json.loads(p.read_text()) for p in sorted((ROOT / args.batch).glob("*/*.json"))]
calls = [r for r in traces if r["api_calls"]]
expected = json.loads((ROOT / "supplied" / "expectations.json").read_text())
def meets(r):
    expectation = expected[r["case"]]
    if r["status"] == "unavailable":
        return None
    return all(r.get("suggested_id" if key == "top_id" else key) == value
               for key, value in expectation.items() if key != "explanation")
summary = {
    "traces": len(traces), "api_calls": len(calls),
    "statuses": dict(collections.Counter(r["status"] for r in traces)),
    "http_statuses": dict(collections.Counter(str(r.get("http_status")) for r in calls)),
    "request_latency_ms": {"min": min(r["api_latency_ms"] for r in calls),
                           "median": statistics.median(r["api_latency_ms"] for r in calls),
                           "max": max(r["api_latency_ms"] for r in calls)},
    "latency_interpretation": "Failed request elapsed time; no successful inference latency observed.",
    "fixture_expectations_met": sum(meets(r) is True for r in traces),
    "fixture_expectations_not_met": sum(meets(r) is False for r in traces),
    "fixture_expectations_unavailable": sum(meets(r) is None for r in traces),
    "usage_reported_calls": sum(r.get("usage") is not None for r in calls),
    "reported_input_tokens": sum((r.get("usage") or {}).get("input_tokens", 0) for r in calls),
    "reported_output_tokens": sum((r.get("usage") or {}).get("output_tokens", 0) for r in calls),
    "ordinary_planners": {
        name: {"selections": [r["selected_id"] for r in json.loads((ROOT / f"planning-{name}.json").read_text())]}
        for name in ["a", "b"]}
}
summary["estimated_reported_input_cost_usd"] = summary["reported_input_tokens"] * 0.042 / 1_000_000 if summary["usage_reported_calls"] else None
summary["billing_note"] = "Published rate estimate for reported input only, not an invoice. Unknown usage on failed requests is not zero. Agent cost excluded."
if args.batch != "live":
    summary["latency_interpretation"] = "Successful API-call elapsed time, including client/network overhead, not full Explore latency."
(ROOT / f"summary{suffix}.json").write_text(json.dumps(summary, indent=2))
bundle = {"Linden": json.loads((ROOT / "planning-b.json").read_text()),
          "Cedar": [{"workspace": int(r["case"][:2]), "status": r["status"],
                     "selected_id": r.get("suggested_id") or next(iter(r.get("precedence_ids", [])), None),
                     "reason": r.get("note", r.get("reason")),
                     "availability": "unavailable" if r["status"] == "unavailable" else "available"}
                    for r in traces if r["shuffle_seed"] is None],
          "Willow": json.loads((ROOT / "planning-a.json").read_text())}
(ROOT / f"review-bundle{suffix}.json").write_text(json.dumps(bundle, indent=2))
print(json.dumps(summary, indent=2))
for r in traces:
    print(json.dumps({"case":r["case"], "seed":r["shuffle_seed"], "status":r["status"],
        "rows":[{"id":row["id"], "priority":row["priority_score"],
                 "dimensions":{d:{k:a[k] for k in ["score", "confidence", "probabilities"]}
                               for d,a in row["dimensions"].items()}}
                for row in r.get("ranking",[])]}))
