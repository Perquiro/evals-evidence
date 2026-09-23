"""Check retained evidence without contacting a model or rewriting results."""
import collections
from datetime import datetime, timedelta
import hashlib
import json
import re
from runner import ROOT, original, prepare

frozen = json.loads((ROOT / 'frozen.json').read_text())
for filename, sha in frozen['hashes'].items():
    assert hashlib.sha256((ROOT / filename).read_bytes()).hexdigest() == sha, filename
cases = {c['id']: c for c in json.loads((ROOT / 'cases.json').read_text())}
records = [json.loads(p.read_text()) for p in (ROOT / 'results').glob('*.json')]
assert len(records) == 120
keys = {(r['case'], r['method'], r['seed']) for r in records}
assert len(keys) == 120
expected_keys = {(case, method, seed) for case in cases for seed in [None, 7, 29]
                 for method in ['jev_score', 'jev_choice', 'gpt-5.6-terra', 'gpt-5.6-luna']}
assert keys == expected_keys
tool_types = collections.Counter()
for r in records:
    case = cases[r['case']]
    request, gate, neutral = prepare(case, r['seed'])
    if gate:
        assert r['status'] == 'host_decision' and r['api_calls'] == 0
        assert r['host'] == gate
        assert r['selected_id'] == next(iter(gate.get('precedence_ids', [])), None)
    elif r['method'].startswith('gpt-'):
        cmd = r['command']
        assert cmd[cmd.index('-m') + 1] == r['method']
        assert 'model_reasoning_effort="low"' in cmd
        completion = [e['event'] for e in r['events'] if e['event'].get('type') == 'turn.completed']
        if completion:
            assert r['usage'] == completion[-1]['usage']
        for e in r['events']:
            if e['event'].get('type') == 'item.completed':
                tool_types[e['event']['item']['type']] += 1
        assert r['tool_items'] == 0
        assert 'candidate' not in r['prompt'].lower() and 'rubric' not in r['prompt'].lower()
    elif r['status'] == 'ok':
        assert r['response']['model'] == 'jev-1.13.0'
        assert r['usage'] == r['response']['usage']
        if r['method'] == 'jev_score':
            assert r['request'] == request
            assert r['ranking'] == original.rank_response(request, r['response'])
        else:
            answer = r['response']['answers']['next']
            assert r['selected_id'] == (None if answer['choice'] == 'none' else answer['choice'])
            assert r['request']['state'] == neutral
    assert r['selected_id'] is None or case['control'][r['selected_id']]['eligible']

ordered = sorted(records, key=lambda r: r['started_utc'])
for previous, current in zip(ordered, ordered[1:]):
    finished = datetime.fromisoformat(previous['started_utc']) + timedelta(milliseconds=previous['total_selection_ms'])
    assert datetime.fromisoformat(current['started_utc']) >= finished - timedelta(milliseconds=5)

for path in ROOT.rglob('*'):
    if path.is_file():
        assert not re.search(rb'apikey_[A-Za-z0-9_]{24,}', path.read_bytes()), path.name

assert set(tool_types) <= {'agent_message', 'reasoning'}
print(json.dumps({'frozen_hashes': 'match', 'complete_unique_decisions': len(records),
                  'selection_replay': 'passed', 'provider_usage_matches_events': 'passed',
                  'serial_schedule': 'verified', 'ordinary_completed_item_types': dict(tool_types),
                  'credential_scan': 'passed'}, indent=2))
