// Read every page through public MCP, preserving the request and response.
export async function exportKnowledge(call,actorId) {
  const read=async(name,args)=>{
    const raw=await call(name,args);
    if(raw.isError)throw new Error(`Knowledge export failed: ${JSON.stringify(raw)}`);
    return {args,raw,value:JSON.parse(raw.content.find(c=>c.type==='text').text)};
  };
  const catalogPages=[];let args={};
  do {
    const page=await read('read_knowledge_catalog',args);catalogPages.push(page);
    const value=page.value;
    if(value.entries.complete&&value.storedRelationships.complete)break;
    args={...args,...(value.entries.complete?{}:{entryContinuation:value.entries.continuation}),...(value.storedRelationships.complete?{}:{relationshipContinuation:value.storedRelationships.continuation})};
  }while(true);
  const entries=[...new Map(catalogPages.flatMap(p=>p.value.entries.items).map(e=>[e.id,e])).values()];
  const contexts=[];
  for(const entry of entries.filter(e=>e.kind==='surface'||e.kind==='journey')) {
    const base={anchor:{kind:entry.kind,id:entry.id},productVersions:{scope:'all'},observations:{detail:'records',actorIds:[actorId],scope:'both'}};
    let args=base;
    do {
      const page=await read('read_knowledge_context',args);contexts.push(page);const value=page.value;
      if(value.projections.complete&&value.storedRelationships.complete)break;
      args={...args,...(value.projections.complete?{}:{projectionContinuation:value.projections.continuation}),...(value.storedRelationships.complete?{}:{relationshipContinuation:value.storedRelationships.continuation})};
    }while(true);
  }
  return {catalogPages,contexts};
}
