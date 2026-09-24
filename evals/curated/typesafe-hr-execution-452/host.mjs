import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { join } from 'node:path';
import { appendFileSync, readdirSync, existsSync, readFileSync } from 'node:fs';
import os from 'node:os';
import { parse } from 'smol-toml';

function disabledMcpServers(cwd) {
  const servers={};
  for(const file of [join(os.homedir(),'.codex/config.toml'),join(cwd,'.codex/config.toml')]) {
    if(!existsSync(file))continue;
    for(const name of Object.keys(parse(readFileSync(file,'utf8')).mcp_servers??{}))servers[name]={enabled:false};
  }
  return servers;
}

function disabledSkills(cwd) {
  const found=[];
  function walk(dir) {
    if(!existsSync(dir))return;
    for(const entry of readdirSync(dir,{withFileTypes:true})) {
      const file=join(dir,entry.name);
      if(entry.isDirectory())walk(file);
      else if(entry.name==='SKILL.md')found.push({path:dir.replaceAll('\\','/'),enabled:false});
    }
  }
  for(const dir of [join(os.homedir(),'.codex/skills'),join(os.homedir(),'.agents/skills'),join(cwd,'.agents/skills'),join(cwd,'.claude/skills')])walk(dir);
  return found;
}

export async function runHost({cwd,instructions,prompt,tools,callTool,output,timeoutMs=1_920_000,onEvent=()=>{},onClose=()=>{},signal}) {
  const exe=process.env.CODEX_EXECUTABLE ?? join(process.env.APPDATA,'npm/node_modules/@openai/codex/node_modules/@openai/codex-win32-x64/vendor/x86_64-pc-windows-msvc/bin/codex.exe');
  const args=['app-server','--stdio','-c','mcp_servers={}','-c','project_doc_max_bytes=0','-c','web_search="disabled"'];
  const mcpServers=disabledMcpServers(cwd);
  for(const name of Object.keys(mcpServers)) {
    if(!/^[A-Za-z0-9_-]+$/.test(name))throw new Error('Cannot safely address inherited MCP server name');
    args.push('-c',`mcp_servers.${name}.enabled=false`);
  }
  for(const f of ['plugins','apps','skill_search','multi_agent','shell_tool','view_image','image_generation','browser_use','computer_use','tool_suggest','shell_snapshot']) args.push('--disable',f);
  const env={...process.env}; delete env.TYPESAFE_API_KEY;
  const child=spawn(exe,args,{cwd,env,windowsHide:true});
  let nextId=0,finish,closed=false;let toolQueue=Promise.resolve();const pending=new Map();const done=new Promise(r=>finish=r);const started=performance.now();
  const log=(direction,msg)=>{const e={at_ms:performance.now()-started,direction,msg};appendFileSync(output,JSON.stringify(e)+'\n');onEvent(e);};
  const send=msg=>{if(closed)return;log('sent',msg);child.stdin.write(JSON.stringify(msg)+'\n');};
  const rpc=(method,params)=>new Promise((res,rej)=>{const id=++nextId;pending.set(id,{res,rej});send({id,method,params});});
  child.stderr.on('data',b=>appendFileSync(output+'.stderr',b));
  child.stdin.on('error',error=>finish({status:'failed',error:String(error)}));
  child.on('error',e=>finish({status:'failed',error:String(e)}));
  child.on('exit',(code,signal)=>{for(const p of pending.values())p.rej(new Error('Host exited'));finish({status:'interrupted',code,signal});});
  createInterface({input:child.stdout}).on('line',async line=>{
    let msg;try{msg=JSON.parse(line);}catch{log('unparsed',{line});return;}
    log('received',msg);
    if(pending.has(msg.id)){const p=pending.get(msg.id);pending.delete(msg.id);msg.error?p.rej(msg.error):p.res(msg.result);return;}
    if(msg.method==='turn/completed')finish({status:msg.params.turn.status,turn:msg.params.turn});
    if(msg.method && msg.id!==undefined) {
      if(msg.method==='item/tool/call') {
        try{const operation=toolQueue.then(()=>callTool(msg.params.tool,msg.params.arguments,msg.params.callId));toolQueue=operation.catch(()=>{});const result=await operation;send({id:msg.id,result:{success:true,contentItems:[{type:'inputText',text:JSON.stringify(result)}]}});}
        catch(error){send({id:msg.id,result:{success:false,contentItems:[{type:'inputText',text:String(error)}]}});}
      }else send({id:msg.id,error:{code:-32601,message:'Evaluator denies this host operation'}});
    }
  });
  const timer=setTimeout(()=>{finish({status:'timeout'});child.kill();},timeoutMs);
  const abort=()=>{finish({status:'timeout',reason:String(signal.reason)});child.kill();};
  signal?.addEventListener('abort',abort,{once:true});
  try {
    await rpc('initialize',{clientInfo:{name:'perquiro_hr_evaluation',version:'1'},capabilities:{experimentalApi:true}});send({method:'initialized',params:{}});
    const settings=await rpc('thread/start',{model:'gpt-5.6-terra',allowProviderModelFallback:false,serviceTier:'default',cwd,ephemeral:true,approvalPolicy:'never',sandbox:'read-only',baseInstructions:instructions,config:{model_reasoning_effort:'low',project_doc_max_bytes:0,mcp_servers:mcpServers,web_search:'disabled',skills:{config:disabledSkills(cwd)}},environments:[],dynamicTools:tools.map(t=>({type:'function',name:t.name,description:t.description,inputSchema:t.inputSchema}))});
    if(settings.model!=='gpt-5.6-terra'||settings.reasoningEffort!=='low'||settings.serviceTier!=='default'||settings.instructionSources.length)throw new Error('Host setting or instruction mismatch');
    let cursor=null;const inventories=[];
    do {const inventory=await rpc('mcpServerStatus/list',{threadId:settings.thread.id,cursor,detail:'toolsAndAuthOnly'});inventories.push(inventory);if(inventory.data.some(s=>mcpServers[s.name]?.enabled!==false||s.serverInfo!==null||Object.keys(s.tools).length||s.resources.length||s.resourceTemplates.length))throw new Error('Unexpected inherited MCP exposure');cursor=inventory.nextCursor;}while(cursor);
    settings.mcpInventories=inventories;
    await rpc('turn/start',{threadId:settings.thread.id,input:[{type:'text',text:prompt,text_elements:[]}],model:'gpt-5.6-terra',effort:'low'});
    const result=await done;closed=true;const elapsed_ms=performance.now()-started;onClose();
    let drainTimer;let post_close_drain_ms=null;let post_close_drain_error=null;
    try{await Promise.race([toolQueue,new Promise((_,reject)=>{drainTimer=setTimeout(()=>reject(new Error('Post-close capture drain failed')),20000);})]);post_close_drain_ms=performance.now()-started-elapsed_ms;}
    catch(error){post_close_drain_error=String(error);post_close_drain_ms=performance.now()-started-elapsed_ms;if(result.status!=='timeout')throw error;}
    finally{clearTimeout(drainTimer);}
    return {settings,result,elapsed_ms,post_close_drain_ms,post_close_drain_error};
  } finally {closed=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);child.stdin.end();child.kill();}
}
