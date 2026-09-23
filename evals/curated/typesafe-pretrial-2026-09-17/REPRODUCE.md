# Reproduce the pre-trial

The copied supplied package is unchanged. manifest.json contains its SHA-256 hashes. Python 3.10 or newer is sufficient, with no packages to install.

From this directory:

```powershell
python -B run_pretrial.py
Push-Location supplied
python -B -m unittest -v test_rank_checks.py
Pop-Location
```

The first command writes dry runs, consistency results and diagnostic probes. It also writes the sanitized planning input to the current user's temporary harbor-hr-planning-0917 directory. It makes no network calls.

The live scripts ask for the API key through a hidden prompt and keep it in process memory. The original live and live-after-recovery directories contain recorded evidence. Archive or copy the entire pre-trial directory before rerunning, because a rerun uses the same output filenames.

```powershell
python -B run_pretrial.py --live
python -B run_pretrial.py --diagnose
python -B run_pretrial.py --diagnose-ranking
python -B run_pretrial.py --live --batch live-after-recovery
python -B summarize.py
python -B summarize.py --batch live-after-recovery
```

The first and fourth commands each attempt 18 inference requests, with no automatic retries. Each covers the original order and shuffle seeds 7 and 29. The diagnostic commands make five additional authenticated HTTP requests in total, of which four perform inference. There was also one credential-free GET to the inference endpoint, returning 405. Diagnostic responses are separate from fixture results.

Both ordinary planning agents received this identical prompt, with no prior conversation inherited:

> Help plan the next useful action in each independent HR workspace described in C:\Users\mathi\AppData\Local\Temp\harbor-hr-planning-0917\workspaces.json. Read only that file. For each workspace, choose one available check to do next, or decline the supplied options if none is useful. Respect host eligibility, required recovery and human priorities. Give a short practical reason based on the supplied context and, when appropriate, propose other useful work. Do not perform Product actions. Return a JSON array with workspace, selected_id (or null), reason, and optional proposed_next_step. Provide the array directly in your final response. No other files or tools are needed beyond reading that file.

The retained planning-a.json and planning-b.json contain their complete returned JSON. The anonymous mapping used in review was Linden = planner B, Cedar = the API/host outputs, Willow = planner A. Model identities were withheld from the reviewer. PROTOCOL.md records the criteria and REPORT.md records interpretation and limitations.
