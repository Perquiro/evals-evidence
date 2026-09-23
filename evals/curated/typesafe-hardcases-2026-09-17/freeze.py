"""Finalize harder alternatives and opaque IDs before any scored execution."""
import copy
import hashlib
import json
from pathlib import Path
import random
from runner import ROOT, POLICY, prepare

if (ROOT / 'frozen.json').exists():
    raise SystemExit('Inputs are already frozen')
cases = json.loads((ROOT / 'cases.json').read_text())
expected = json.loads((ROOT / 'expectations.json').read_text())['expectations']

# Preserve authored drafts, then clarify genuine competing unknowns.
(ROOT / 'draft-cases.json').write_text(json.dumps(cases, indent=2))
(ROOT / 'draft-expectations.json').write_text(json.dumps(expected, indent=2))
first = cases[0]['state']
first['observations'][1:3] = [
    'The public benefits overview has a region selector; its effect on leave allowance guidance has not been exercised.',
    'The public holiday page has a next-year switch; its dates and region behavior have not been exercised.'
]
first['observations'].append('Valid fixture Employee credentials are supplied; private leave, contact and document workflows require sign-in.')
first['open_questions'] += ['How does changing region affect public allowance guidance?', 'Does next-year holiday navigation keep the selected region?']
first['candidates'][1]['check'] = 'Change region in the public benefits overview and inspect the allowance guidance shown.'
first['candidates'][2]['check'] = 'Switch the public holiday page to next year and inspect its dates and selected region.'
expected[0]['reason'] = 'Employee access to every private self-service workflow is still unobserved. Both public-feature checks add information, but failure there does not block entry to those workflows.'

second = cases[1]['state']
second['observations'].append('A New request form is available; its response to an end date before the start date is unknown.')
second['open_questions'].append('How does a new request form handle an end date before its start date?')
second['candidates'][2]['check'] = 'Open a new leave request, set its end date before the start date, and inspect client validation without submitting.'

fifth = cases[4]['state']
fifth['observations'].append('The contact form states that the primary phone receives sign-in recovery codes. No fresh readback has established the saved recovery destination.')
fifth['open_questions'][0] = 'Was the intended sign-in recovery phone persisted after Save?'
expected[4]['reason'] = 'The unfinished update affects the sign-in recovery destination. Its persistence check advances that access-related Journey before unrelated preference discovery.'

sixth = cases[5]['state']
sixth['observations'].append('A Benefits entry is also visible, but whether it allows enrollment or only displays guidance is unknown.')
sixth['candidates'][2]['check'] = 'Open the Benefits entry and inspect whether it offers enrollment or only guidance.'
sixth['open_questions'].append('Does Benefits offer an Employee enrollment action?')
# Either bounded probe is defensible when purpose does not distinguish them.
expected[5]['acceptable_ids'] = ['c1', 'c3']
expected[5]['reason'] = 'Either visible Leave or Benefits can resolve a concrete capability question without inventing a cross-workflow dependency; the supplied purpose does not establish one as more important.'

cases[8]['state']['observations'] = [s.replace("this evaluation's", "this session's") for s in cases[8]['state']['observations']]
cases[9]['state']['observations'].append('The same Employee sign-out/sign-in sequence has already been exercised twice with these credentials and build; both attempts reached the recorded private landing Surface.')
cases[9]['state']['candidates'][0]['check'] = 'Repeat the already-exercised sign-out/sign-in sequence with the same Employee credentials and inspect the same private landing Surface.'

winning_positions = ['c3', 'c2', 'c4', 'c2', 'c1', 'c3', 'c4', 'c2', 'c3', None]
for index, (case, answer) in enumerate(zip(cases, expected)):
    if 'host_controls' in case:
        case['control'] = case.pop('host_controls')
    old_ids = [c['id'] for c in case['state']['candidates']]
    new_ids = old_ids.copy()
    random.Random(417 + index).shuffle(new_ids)
    mapping = dict(zip(old_ids, new_ids))
    if answer['chosen_id'] is not None:
        winner = answer['chosen_id']
        desired = winning_positions[index]
        holder = next(k for k, v in mapping.items() if v == desired)
        mapping[holder], mapping[winner] = mapping[winner], mapping[holder]
    for check in case['state']['candidates']:
        check['id'] = mapping[check['id']]
    random.Random(917 + index).shuffle(case['state']['candidates'])
    case['control'] = {mapping[k]: v for k, v in case['control'].items()}
    answer['acceptable_ids'] = [mapping.get(value, value) for value in answer.get('acceptable_ids', [answer['chosen_id']])]
    answer['chosen_id'] = mapping.get(answer['chosen_id'], answer['chosen_id'])
    for seed in [None, 7, 29]:
        request, gate, neutral = prepare(case, seed)
        assert request is not None or gate is not None
        if neutral:
            for text in ['evaluation', 'benchmark', 'rubric', 'arena']:
                assert text not in json.dumps(neutral).lower()
            assert all(check['id'] in case['control'] and case['control'][check['id']]['eligible'] for check in neutral['available_checks'])

(ROOT / 'cases.json').write_text(json.dumps(cases, indent=2))
(ROOT / 'expectations.json').write_text(json.dumps({'expectations': expected}, indent=2))
paths = ['cases.json', 'expectations.json', 'runner.py', 'PROTOCOL.md']
frozen = {'policy': POLICY, 'hashes': {p: hashlib.sha256((ROOT / p).read_bytes()).hexdigest() for p in paths}}
(ROOT / 'frozen.json').write_text(json.dumps(frozen, indent=2))
print(json.dumps({'cases': len(cases), 'semantic_cases': 8, 'host_cases': 2, 'hashes': frozen['hashes']}, indent=2))
