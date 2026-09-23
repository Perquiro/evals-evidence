import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const local = name => fileURLToPath(new URL(name, import.meta.url));
const output = spawnSync(process.execPath, [local('evaluate.mjs'), 'report', local('rehearsal/packet.json')], {encoding:'utf8'});
assert.equal(output.status, 0, output.stderr);
const report = JSON.parse(output.stdout);
const expected = JSON.parse(readFileSync(local('rehearsal/expected.json')));
assert.equal(report.comparison.decision, 'inconclusive');
assert.equal(report.kind, 'controlled rehearsal');
assert.equal(report.runs.length, 4);
for(const run of report.runs) {
  for(const [key,value] of Object.entries(expected[run.id])) {
    const actual = key in run.quality ? run.quality[key] : key in run.cost ? run.cost[key] : run[key];
    assert.equal(actual,value,`${run.id}:${key}`);
  }
}
console.log(JSON.stringify(report,null,2));
