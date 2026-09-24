import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { TrialBrowser } from './browser.mjs';

async function fixture(run) {
  const received = [];
  const server = http.createServer((req,res) => {
    received.push(req.url);
    if(req.url.startsWith('/api/')) {
      setTimeout(() => { res.setHeader('Content-Type','application/json'); res.end('{"saved":true}'); }, 40);
    } else { res.setHeader('Content-Type','text/html'); res.end('<button onclick="fetch(\'/api/save\').then(r=>r.json()).then(()=>document.querySelector(\'output\').textContent=\'Saved\')">Save</button><button onclick="fetch(\'/api/one\');fetch(\'/api/two\')">Burst</button><output>Ready</output>'); }
  });
  server.listen(0,'127.0.0.1'); await once(server,'listening');
  const browser = await TrialBrowser.open({origin:`http://127.0.0.1:${server.address().port}`,limit:1,durationMs:60_000});
  try { await run(browser,received); } finally { await browser.close(); server.closeAllConnections(); await new Promise(r=>server.close(r)); }
}

test('the browser admits only the budgeted request and retains its delayed result',async()=>fixture(async (b,received)=>{
  let capAt;b.onLimit=event=>{capAt=event.at_ms;};
  b.start(); await b.action({op:'navigate',path:'/'});
  await b.action({op:'click',role:'button',name:'Save'});
  await b.settle();
  assert.equal(b.admitted,1);
  assert.match(await b.snapshot(),/Saved/);
  await assert.rejects(b.action({op:'click',role:'button',name:'Save'}),/budget/);
  assert.equal(received.filter(x=>x==='/api/save').length,1);
  assert.equal(b.events.filter(x=>x.kind==='response'&&x.body==='{"saved":true}').length,1);
  assert.ok(capAt<b.events.find(x=>x.kind==='response').at_ms,'grace signal precedes delayed settlement');
}));

test('retained browser captures redact configured credentials',async()=>fixture(async b=>{
  b.secrets=['probe-secret'];b.start();await b.action({op:'navigate',path:'/'});
  await b.page.setContent('<input aria-label="Password"><span>probe-secret</span>');
  await b.action({op:'fill',role:'textbox',name:'Password',value:'probe-secret'});
  assert.doesNotMatch(JSON.stringify(await b.capture()),/probe-secret/);
  assert.equal(b.redactBody('{"password":"probe-secret","token":"session-secret"}'),'{"password":"[REDACTED]","token":"[REDACTED]"}');
}));

test('deadline denies even client-only actions and final capture survives the stop',async()=>fixture(async b=>{
  b.start(); await b.action({op:'navigate',path:'/'});
  b.durationMs=0;
  await assert.rejects(b.action({op:'click',role:'button',name:'Save'}),/deadline/);
  await assert.rejects(b.action({op:'snapshot'}),/deadline/);
  const final=await b.capture(); assert.match(final.snapshot,/Ready/); assert.equal(b.admitted,0);
}));

test('automatic requests from one action cannot pass the admission cap',async()=>fixture(async(b,received)=>{
  b.start();await b.action({op:'navigate',path:'/'});await b.action({op:'click',role:'button',name:'Burst'});await b.settle();
  assert.equal(received.filter(x=>x.startsWith('/api/')).length,1);
  assert.equal(b.events.filter(x=>x.kind==='refused_request').length,1);
}));

test('browser navigation cannot read evaluator files or an unrelated origin',async()=>fixture(async b=>{
  b.start();
  await assert.rejects(b.action({op:'navigate',path:'file:///C:/dev/Perquiro/CONTEXT.md'}),/origin/);
  await assert.rejects(b.action({op:'navigate',path:'https://example.com/'}),/origin/);
}));
