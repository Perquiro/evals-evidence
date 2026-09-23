import fs from 'node:fs';
import path from 'node:path';

const directory = path.resolve(process.argv[2]);
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
const catalog = read('final-catalog.json');
const entries = new Map(catalog.entries.map(entry => [entry.id, entry]));
const pages = fs.readdirSync(path.join(directory, 'explore')).flatMap(name => read(`explore/${name}`));
const unique = (values, key) => [...new Map(values.map(value => [key(value), value])).values()];
const items = unique(pages.flatMap(page => page.inventory.items), item => item.id);
const gaps = unique(pages.flatMap(page => page.gaps.items), gap => JSON.stringify([gap.item.id, gap.actorId, gap.platform, gap.productVersion]));
const recovery = unique(pages.flatMap(page => page.recovery.items), value => value.observation.id);
const duplicateGroups = new Map();
for (const item of items) {
  const key = JSON.stringify([item.surfaceId, item.kind, item.name.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ')]);
  duplicateGroups.set(key, [...(duplicateGroups.get(key) ?? []), item.id]);
}
const result = {
  itemCount: items.length,
  normalizedDuplicateGroups: [...duplicateGroups.values()].filter(ids => ids.length > 1),
  items: items.map(item => ({ ...item, surface: entries.get(item.surfaceId)?.locator })),
  gaps: gaps.map(gap => ({ itemId: gap.item.id, name: gap.item.name, actor: entries.get(gap.actorId)?.name, platform: gap.platform, productVersion: gap.productVersion, state: gap.state, accountedFor: gap.accountedFor, supportingObservationIds: gap.supportingObservationIds })),
  recovery: recovery.map(value => ({ id: value.observation.id, seq: value.observation.seq, body: value.observation.body })),
  limits: 'This enumerates final typed state and normalized duplicate candidates. Semantic aliases, false pending/reopened checks and unsupported repeats require human comparison with the actual trace. No such conclusions are inferred from a zero exact-duplicate count.',
};
fs.writeFileSync(path.join(directory, 'item-audit.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ itemCount: result.itemCount, normalizedDuplicateGroups: result.normalizedDuplicateGroups.length, recovery: result.recovery }));
