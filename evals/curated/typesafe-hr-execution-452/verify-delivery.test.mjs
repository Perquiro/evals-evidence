import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyResultReview } from './verify-delivery.mjs';
const fixture=()=>({launch:{grader_1:'grader-a',grader_2:'grader-b',result_reviewer:'reviewer'},required:{reviewer:'reviewer',packet_sha256:'packet',report_sha256:'report'},review:{reviewer:'reviewer',packet_sha256:'packet',report_sha256:'report',gate:'APPROVED'},packetHash:'packet',reportHash:'report'});
test('separate independent review binds to the exact packet and report',()=>assert.equal(verifyResultReview(fixture()).verified,true));
test('wrong identity, stale report, and unresolved review cannot pass delivery',()=>{
  const wrong=fixture();wrong.review.reviewer='/root';assert.throws(()=>verifyResultReview(wrong),/differs/);
  const stale=fixture();stale.reportHash='new report';assert.throws(()=>verifyResultReview(stale),/changed/);
  const unresolved=fixture();unresolved.review.gate='CHANGES_REQUIRED';assert.throws(()=>verifyResultReview(unresolved),/not approved/);
});
