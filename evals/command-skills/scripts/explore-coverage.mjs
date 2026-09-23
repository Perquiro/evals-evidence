import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Receipt of a Product response is machine-checkable. Whether Knowledge faithfully
// records it still needs a reviewer; this helper deliberately does not score prose.
export function subset(actual, expected) {
  if (Array.isArray(expected)) return Array.isArray(actual) && (expected.length === 0
    ? actual.length === 0 : expected.every(item => actual.some(value => subset(value, item))));
  if (expected && typeof expected === 'object') return actual != null && Object.entries(expected).every(([key, value]) => subset(actual[key], value));
  return actual === expected;
}

export function coverage(inventory, events) {
  const product = events.filter(event => event.phase === 'candidate' && (event.kind === 'product' || (event.kind === 'error' && event.productRequest !== false)));
  const unclassifiedErrors = product.filter(event => event.kind === 'error' && event.productRequest === undefined).map(event => event.event);
  const allowed = product.slice(0, inventory.requestBudget).filter(event => event.kind === 'product');
  const matches = new Map();
  const items = inventory.items.map(item => {
    const { pathnamePrefix, query, ...request } = item.request;
    const found = allowed.filter(event => {
      if (!subset(event.input, request) || !subset(event.result, item.response)) return false;
      if (pathnamePrefix && !event.input.pathname.startsWith(pathnamePrefix)) return false;
      if (query && Object.keys(query).length === 0 && Object.values(event.input.query ?? {}).some(Boolean)) return false;
      if (query && Object.keys(query).length && !subset(event.input.query, query)) return false;
      if (item.after && !(matches.get(item.after) ?? []).some(previous => previous.event < event.event)) return false;
      if (item.queryRequired && (!event.input.query?.q || !event.result.body.books?.length || event.result.body.books.length >= 3)) return false;
      if (item.id === 'W12' && !(matches.get('W08') ?? []).some(previous => previous.event < event.event && event.result.body.holds?.some(hold => hold.id === previous.result.body.id))) return false;
      return true;
    });
    matches.set(item.id, found);
    return { ...item, observedEvents: found.map(event => event.event), seen: found.length > 0, durablyRecorded: 'ungraded', recordEvents: [] };
  });
  return {
    requestBudget: inventory.requestBudget, productRequests: product.length, unclassifiedErrors,
    excessRequests: Math.max(0, product.length - inventory.requestBudget),
    seen: items.filter(item => item.seen).length, total: items.length,
    supportingNavigation: ['/', '/docs', '/account'].map(pathname => ({ pathname, events: allowed.filter(event => event.input.method === 'GET' && event.input.pathname === pathname).map(event => event.event) })),
    items,
    limitation: 'Observed events prove receipt of matching responses only. A reviewer must assess consideration, truthful linked Knowledge and final durable reads. Errors without request classification conservatively consume budget and require trace review; their count is not confirmed Product traffic. All frozen outcomes remain in the denominator.'
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const directory = path.resolve(process.argv[2]);
  const inventory = JSON.parse(fs.readFileSync(path.join(directory, 'private-inventory.json'), 'utf8'));
  const events = fs.readFileSync(path.join(directory, 'events.jsonl'), 'utf8').trim().split('\n').map((line, index) => ({ event: index + 1, ...JSON.parse(line) }));
  const result = coverage(inventory, events);
  fs.writeFileSync(path.join(directory, 'observed-coverage.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ seen: result.seen, total: result.total, productRequests: result.productRequests, missing: result.items.filter(item => !item.seen).map(item => item.id) }));
}
