import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { runSetup } from '../../../dist/setup/setup.js';
import { createPerquiroMcpServer } from '../../../dist/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

export const exploreTools=['read_setup','read_agent_models','read_knowledge_catalog','read_knowledge_context','read_explore','read_explore_continuation','list_open_reviews','read_follow_on_work','record_surface','record_journey','record_observation','record_inspection','import_evidence','read_evidence','advise_explore'];

export async function openProject({root,origin,arm,onProvider=()=>{}}) {
  fs.mkdirSync(root,{recursive:false});
  const git=spawnSync('git',['init','--quiet'],{cwd:root,encoding:'utf8',windowsHide:true});if(git.status!==0)throw new Error(git.stderr);
  let add=false;const actorId=randomUUID();
  await runSetup({projectRoot:root,packageVersion:'348-evaluation',verifyGlobalCli:()=>{},createUuid:()=>actorId,prompt:async request=>{
    switch(request.kind) {
      case 'product':return 'BugBusters HR';case 'url':return origin;case 'agent':return 'openai';
      case 'add-actor':if(add)return 'no';add=true;return 'yes';
      case 'new-actor-name':return 'Employee';case 'new-actor-secrets':return 'EMPLOYEE_PASSWORD';case 'actor-secret-value':return 'password123';
      default:throw new Error(`Unexpected Setup prompt ${request.kind}`);
    }
  }});
  const server=createPerquiroMcpServer({projectRoot:root,packageVersion:'348-evaluation',exploreAdvice:{fetch:async(url,init)=>{
    const started=performance.now();const request=JSON.parse(init.body);
    try{const response=await fetch(url,init);const body=await response.clone().text();onProvider({request,status:response.status,body:body.replaceAll(process.env.TYPESAFE_API_KEY??'__absent__','[REDACTED]'),elapsed_ms:performance.now()-started});return response;}
    catch(error){onProvider({request,error:error.name,elapsed_ms:performance.now()-started});throw error;}
  }}});
  const client=new Client({name:'hr-evaluation',version:'1'});const [ct,st]=InMemoryTransport.createLinkedPair();await server.connect(st);await client.connect(ct);
  const tools=(await client.listTools()).tools.filter(t=>exploreTools.includes(t.name)&&(arm==='advised'||t.name!=='advise_explore'));
  const allowed=new Set(tools.map(t=>t.name));
  return {actorId,tools,client,root,
    async call(name,args={}) {
      if(!allowed.has(name))throw new Error('Tool is outside this condition allowlist');
      if(name==='import_evidence') {
        const allowedRoot=fs.realpathSync(path.join(root,'captures'))+path.sep;
        const target=fs.realpathSync(path.resolve(root,args.sourcePath));
        if(!target.startsWith(allowedRoot))throw new Error('Evidence source is outside the Project capture allowlist');
      }
      return client.callTool({name,arguments:args});
    },
    async close(){await client.close();await server.close();}
  };
}
