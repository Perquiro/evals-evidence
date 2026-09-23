"""Read-only consistency checks over retained evidence; no network calls."""
import hashlib
import json
from pathlib import Path
import re
from run_pretrial import ROOT, rank

original = Path(r"C:\Users\mathi\Downloads\perquiro-explore-ranking-trials\explore-ranking-trials")
manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8-sig"))
for item in manifest:
    path = ROOT / item["Path"]
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    assert digest.upper() == item["Sha256"]
    source = original / path.relative_to(ROOT / "supplied")
    assert hashlib.sha256(source.read_bytes()).hexdigest() == digest

for path in ROOT.rglob("*"):
    if path.is_file():
        assert not re.search(rb"apikey_[A-Za-z0-9_]{24,}", path.read_bytes()), f"Credential-like value in {path.name}"

assert all(all(value for key, value in row.items() if key != "case")
           for row in json.loads((ROOT / "export-consistency.json").read_text()))
assert all(row["pass"] for row in json.loads((ROOT / "diagnostics.json").read_text()) if "pass" in row)

counts = {}
for batch in ["live", "live-after-recovery"]:
    traces = [json.loads(p.read_text()) for p in (ROOT / batch).glob("*/*.json")]
    assert len(traces) == 24
    counts[batch] = {"traces": len(traces), "api_calls": sum(r["api_calls"] for r in traces)}
    assert counts[batch]["api_calls"] == 18
    for report in traces:
        if "response" in report:
            rebuilt = rank.rank_response(report["request"], report["response"])
            assert all(report[k] == v for k, v in rebuilt.items())
        elif report["api_calls"]:
            assert report["status"] == "unavailable" and report["http_status"] == 503

expected = ["c1", "c1", "c2", "c1", "c2", None, "c9", "c1"]
for name in ["a", "b"]:
    rows = json.loads((ROOT / f"planning-{name}.json").read_text())
    assert [r["selected_id"] for r in rows] == expected

print(json.dumps({"source_files_match_original_and_manifest": len(manifest),
                  "credential_scan": "passed", "export_and_contract_probes": "passed",
                  "saved_rankings_recomputed": "passed", "batches": counts}, indent=2))
