import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { sha } from './execute.mjs';

export function verifyResultReview({launch,required,review,packetHash,reportHash}) {
  assert.equal(required.reviewer,launch.result_reviewer);
  assert.equal(review.reviewer,launch.result_reviewer,'Independent result reviewer differs from launch');
  assert.ok(!['/root',launch.grader_1,launch.grader_2,launch.grader_3].includes(review.reviewer),'Result review must remain independent of grading and adjudication');
  for(const [key,value] of [['packet_sha256',packetHash],['report_sha256',reportHash]]){assert.equal(required[key],value,'Generated report changed before review');assert.equal(review[key],value,'Independent review covers different report bytes');}
  assert.equal(review.gate,'APPROVED','Independent result review has not approved this packet');
  return {verified:true,reviewer:review.reviewer,packet_sha256:packetHash,report_sha256:reportHash};
}

if(process.argv[1]?.endsWith('verify-delivery.mjs')) {
  const root=path.resolve(process.argv[2]);const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));const hash=file=>sha(fs.readFileSync(path.join(root,file)));
  const verified=spawnSync(process.execPath,['evals/curated/typesafe-hr-protocol-452/evaluate.mjs','report',path.join(root,'packet.json')],{encoding:'utf8',windowsHide:true});
  assert.equal(verified.status,0,verified.stderr);assert.deepEqual(JSON.parse(verified.stdout),read('report.json'),'Report differs from current verified inputs');
  console.log(JSON.stringify(verifyResultReview({launch:read('launch.json'),required:read('independent-review-required.json'),review:read('independent-result-review.json'),packetHash:hash('packet.json'),reportHash:hash('report.json')})));
}
