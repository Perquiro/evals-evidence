import fs from 'node:fs';
import path from 'node:path';
import { coverage } from './explore-coverage.mjs';
const [directoryArg, label, beforeTime] = process.argv.slice(2);
const directory = path.resolve(directoryArg);
const events = fs.readFileSync(path.join(directory, 'events.jsonl'), 'utf8').trim().split('\n').map((line, index) => ({ event: index + 1, ...JSON.parse(line) })).filter(event => Date.parse(event.time) <= Date.parse(beforeTime));
const inventory = JSON.parse(fs.readFileSync(path.join(directory, 'private-inventory.json'), 'utf8'));
const observations = new Map();
for (const event of events.filter(event => event.phase === 'candidate' && event.kind === 'mcp' && !event.result.isError)) {
  const value = JSON.parse(event.result.content.find(block => block.type === 'text').text);
  const values = event.input.name === 'record_inspection' ? value.observations : event.input.name === 'record_observation' ? [value] : [];
  for (const observation of values) if (!observations.has(observation.id)) observations.set(observation.id, { event: event.event, ...observation });
}
const observed = coverage(inventory, events);
const result = { label, beforeTime, lastEvent: events.at(-1)?.event ?? null, productRequests: observed.productRequests, outcomesSeen: observed.items.filter(item => item.seen).map(item => item.id), uniqueObservations: [...observations.values()], limitation: 'This is a trace cut. Final public reads must still confirm the preserved immutable records; Observation count is not completed-outcome coverage.' };
fs.writeFileSync(path.join(directory, `cut-${label}.json`), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ label, lastEvent: result.lastEvent, productRequests: result.productRequests, observations: observations.size }));
