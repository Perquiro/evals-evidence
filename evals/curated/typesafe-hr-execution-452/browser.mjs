import { chromium } from '@playwright/test';

// Evaluator-owned browser. No candidate JavaScript, filesystem or network API.
export class TrialBrowser {
  static async open(options) {
    const self = new TrialBrowser(options);
    self.browser = await chromium.launch({headless:true});
    self.context = await self.browser.newContext({timezoneId:'UTC',serviceWorkers:'block'});
    self.page = await self.context.newPage();
    await self.page.clock.setFixedTime(new Date('2026-09-17T12:00:00.000Z'));
    self.page.setDefaultTimeout(5000);
    await self.context.route('**/*', route => self.route(route));
    return self;
  }
  constructor({origin,limit=60,durationMs=1_800_000,onLimit=()=>{},secrets=[]}) {
    this.origin=origin; this.limit=limit; this.durationMs=durationMs;
    this.onLimit=onLimit;this.secrets=secrets;
    this.events=[]; this.admitted=0; this.pending=new Set(); this.started=null; this.reason=null;
  }
  start() { this.started=performance.now(); }
  elapsed() { return this.started===null ? null : performance.now()-this.started; }
  stop(reason) { this.reason ??= reason; }
  redact(value) {
    if(typeof value==='string')return this.secrets.reduce((text,secret)=>secret?text.replaceAll(secret,'[REDACTED]'):text,value);
    if(Array.isArray(value))return value.map(v=>this.redact(v));
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,/^(password|token|authorization|cookie|set-cookie)$/i.test(key)?'[REDACTED]':this.redact(v)]));
    return value;
  }
  redactBody(body) {try{return JSON.stringify(this.redact(JSON.parse(body)));}catch{return this.redact(body);}}
  gate() {
    if(this.started!==null && this.elapsed()>=this.durationMs) this.stop('deadline');
    if(this.admitted>=this.limit) this.stop('request budget exhausted');
    if(this.reason) throw new Error(this.reason);
  }
  async route(route) {
    const req=route.request(); const url=new URL(req.url());
    if(url.origin!==this.origin) { this.events.push({kind:'refused_origin',url:req.url(),at_ms:this.elapsed()}); return route.abort('blockedbyclient'); }
    if(!url.pathname.toLowerCase().startsWith('/api/')) return route.continue();
    const id=`request-${this.admitted+1}`;
    try {this.gate();} catch(error) {this.events.push({kind:'refused_request',url:req.url(),reason:error.message,at_ms:this.elapsed()});return route.abort('blockedbyclient');}
    this.admitted++;
    this.events.push({kind:'request',id,method:req.method(),url:req.url(),body:this.redactBody(req.postData()),at_ms:this.elapsed()});
    if(this.admitted===this.limit){this.stop('request budget exhausted');this.onLimit({at_ms:this.elapsed(),admitted:this.admitted});}
    const work=(async()=>{
      try {
        // route.fetch retains settlement even if the initiating UI action returned.
        const response=await route.fetch({timeout:15000,maxRetries:0,maxRedirects:0});
        const body=await response.text();
        this.events.push({kind:'response',id,status:response.status(),body:this.redactBody(body),at_ms:this.elapsed()});
        await route.fulfill({response});
      } catch(error) {this.events.push({kind:'request_failure',id,error:String(error),at_ms:this.elapsed()});await route.abort().catch(()=>{});}
    })();
    this.pending.add(work); try {await work;} finally {this.pending.delete(work);}
  }
  async settle() { while(this.pending.size) await Promise.allSettled([...this.pending]); }
  locator(args) {
    const locator=args.role ? this.page.getByRole(args.role,{name:args.name,exact:args.exact??true}) : this.page.locator(args.selector);
    return args.index===undefined ? locator : locator.nth(args.index);
  }
  async snapshot() { return this.redact(await this.page.locator('body').ariaSnapshot()); }
  async action(args) {
    this.gate();
    if(args.op==='snapshot') return {url:this.page.url(),snapshot:await this.snapshot(),admitted:this.admitted,remaining:Math.max(0,this.limit-this.admitted),stop:this.reason};
    const event={kind:'action',id:`action-${this.events.filter(x=>x.kind==='action').length+1}`,args:this.redact(args),dispatched_ms:this.elapsed(),executed:false};
    this.events.push(event);
    try {
      if(args.op==='navigate') {
        const url=new URL(args.path,this.origin);
        if(url.origin!==this.origin) throw new Error('Navigation outside Product origin refused');
        await this.page.goto(url.href,{waitUntil:'domcontentloaded'});
      } else if(args.op==='click') await this.locator(args).click();
      else if(args.op==='fill') await this.locator(args).fill(args.value);
      else if(args.op==='select') await this.locator(args).selectOption(args.value);
      else if(args.op==='press') await this.locator(args).press(args.value);
      else if(args.op==='check') await this.locator(args).setChecked(args.checked);
      else if(args.op==='wait_for') await this.locator(args).waitFor({state:'visible',timeout:Math.min(5000,Math.max(1,this.durationMs-(this.elapsed()??0)))});
      else throw new Error('Unsupported browser operation');
      event.executed=true;
      await this.settle();
      event.result={url:this.page.url(),snapshot:await this.snapshot()};
      event.completed_ms=this.elapsed();
      return {...event.result,actionId:event.id,admitted:this.admitted,remaining:Math.max(0,this.limit-this.admitted)};
    } catch(error) {event.error=String(error);event.completed_ms=this.elapsed();throw error;}
  }
  async capture() { await this.settle();return {url:this.page.url(),snapshot:await this.snapshot(),admitted:this.admitted,events:this.events}; }
  async close() { await this.browser?.close(); }
}
