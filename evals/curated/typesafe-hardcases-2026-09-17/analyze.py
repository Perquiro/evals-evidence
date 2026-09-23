"""Compute measurements without changing frozen inputs or raw results."""
import collections
import hashlib
import json
import math
from pathlib import Path
import statistics

ROOT = Path(__file__).resolve().parent
PRICES = {'gpt-5.6-terra': (2.0, 0.20, 12.0), 'gpt-5.6-luna': (0.20, 0.02, 1.20)}
LABELS = {'gpt-5.6-luna': 'Ash', 'jev_choice': 'Birch', 'jev_score': 'Cedar', 'gpt-5.6-terra': 'Elm'}


def cost(row):
    usage = row.get('usage')
    if not usage:
        return None
    if row['method'].startswith('jev'):
        return usage['input_tokens'] * 0.042 / 1_000_000
    input_rate, cache_rate, output_rate = PRICES[row['method']]
    total = usage['input_tokens']
    cached = usage.get('cached_input_tokens', 0)
    written = usage.get('cache_write_input_tokens', 0)
    assert 0 <= cached + written <= total
    return ((total - cached - written) * input_rate + cached * cache_rate + written * input_rate * 1.25
            + usage['output_tokens'] * output_rate) / 1_000_000


def no_cache_cost(row):
    usage = row.get('usage')
    if not usage:
        return None
    if row['method'].startswith('jev'):
        return cost(row)
    input_rate, _, output_rate = PRICES[row['method']]
    return (usage['input_tokens'] * input_rate + usage['output_tokens'] * output_rate) / 1_000_000


def distribution(values):
    if not values:
        return None
    values = sorted(values)
    return {'min': values[0], 'median': statistics.median(values),
            'p95_nearest_rank': values[math.ceil(len(values) * 0.95) - 1], 'max': values[-1]}


def main():
    frozen = json.loads((ROOT / 'frozen.json').read_text())
    for file, sha in frozen['hashes'].items():
        assert hashlib.sha256((ROOT / file).read_bytes()).hexdigest() == sha, file
    expected_rows = json.loads((ROOT / 'expectations.json').read_text())['expectations']
    expected = {r['case_id']: r for r in expected_rows}
    case_order = {r['case_id']: i for i, r in enumerate(expected_rows, 1)}
    results = [json.loads(p.read_text()) for p in (ROOT / 'results').glob('*.json')]
    results.sort(key=lambda r: (case_order[r['case']], [-1, 7, 29].index(-1 if r['seed'] is None else r['seed']), r['method']))
    groups = collections.defaultdict(list)
    for row in results:
        row['accepted'] = row['status'] in ['ok', 'host_decision'] and row['selected_id'] in expected[row['case']]['acceptable_ids']
        row['estimated_usd'] = cost(row)
        row['no_cache_estimated_usd'] = no_cache_cost(row)
        groups[row['method']].append(row)
    summaries = {}
    for method, rows in groups.items():
        semantic = [r for r in rows if r['status'] != 'host_decision']
        valid = [r for r in semantic if r['status'] == 'ok']
        priced = [r for r in semantic if r['estimated_usd'] is not None]
        correct = sum(r['accepted'] for r in semantic)
        spend = sum(r['estimated_usd'] for r in priced)
        usage_keys = ['input_tokens', 'cached_input_tokens', 'cache_write_input_tokens', 'output_tokens', 'reasoning_output_tokens']
        summaries[method] = {
            'decisions': len(rows), 'semantic_attempted': len(semantic), 'semantic_available': len(valid),
            'semantic_accepted': correct, 'host_decisions': len(rows) - len(semantic),
            'host_accepted': sum(r['accepted'] for r in rows if r['status'] == 'host_decision'),
            'statuses': dict(collections.Counter(r['status'] for r in semantic)),
            'selection_wall_ms': distribution([r['total_selection_ms'] for r in valid]),
            'client_call_wall_ms': distribution([r['latency_ms'] for r in valid]),
            'cli_turn_wall_ms': distribution([r['turn_latency_ms'] for r in valid if r.get('turn_latency_ms') is not None]),
            'usage': {k: sum((r.get('usage') or {}).get(k, 0) for r in semantic) for k in usage_keys},
            'priced_calls': len(priced), 'unknown_cost_calls': len(semantic) - len(priced),
            'estimated_usd_total': spend,
            'estimated_usd_per_call': spend / len(priced) if priced else None,
            'estimated_usd_per_accepted_decision': spend / correct if correct else None,
            'no_cache_estimated_usd_total': sum(r['no_cache_estimated_usd'] for r in priced),
            'tool_items': sum(r.get('tool_items', 0) for r in rows),
        }
    summary = {'complete': len(results) == 120, 'results': len(results), 'methods': summaries,
               'prices_per_million': PRICES, 'jev_input_per_million': 0.042,
               'interpretation': 'Measured host/client wall time and reported token usage. Token-price estimates, not subscription billing. CLI context/transport differs from TypeSafe HTTP. No Product actions.'}
    (ROOT / 'summary.json').write_text(json.dumps(summary, indent=2))
    choices = [{'case_number': case_order[r['case']], 'case': r['case'], 'seed': r['seed'], 'method': r['method'],
                'selected_id': r['selected_id'], 'accepted': r['accepted'], 'status': r['status'],
                'selection_wall_ms': r['total_selection_ms'], 'estimated_usd': r['estimated_usd']} for r in results]
    (ROOT / 'choices.json').write_text(json.dumps(choices, indent=2))
    bundle = {}
    for method, rows in groups.items():
        bundle[LABELS[method]] = {
            'summary': summaries[method],
            'outputs': [{'case_number': case_order[r['case']], 'seed': r['seed'], 'selected_id': r['selected_id'],
                         'status': 'available' if r['status'] in ['ok', 'host_decision'] else r['status'],
                         'host_decision': r['status'] == 'host_decision'} for r in rows]}
    (ROOT / 'review-bundle.json').write_text(json.dumps(bundle, indent=2))
    review_cases = []
    for case in json.loads((ROOT / 'cases.json').read_text()):
        review_cases.append({'case_number': case_order[case['id']], 'state': case['state'], 'control': case['control'],
                             'expected': expected[case['id']]})
    (ROOT / 'review-cases.json').write_text(json.dumps(review_cases, indent=2))
    print(json.dumps(summary, indent=2))
    for row in choices:
        print(json.dumps(row))


if __name__ == '__main__':
    main()
