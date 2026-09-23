import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

export function attestProduct(productRoot) {
  const source={},build={};
  function walk(dir,prefix='') {
    for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
      if(entry.name==='node_modules'||entry.name==='.git')continue;
      const name=prefix+entry.name;const file=path.join(dir,entry.name);
      if(entry.isSymbolicLink())throw new Error('Product export contains a symbolic link');
      if(entry.isDirectory())walk(file,name+'/');
      else (name.startsWith('dist/')?build:source)[name]=hash(fs.readFileSync(file));
    }
  }
  walk(productRoot);
  if(!Object.keys(build).length)throw new Error('Product build is missing');
  const protocol=path.resolve('evals/curated/typesafe-hr-protocol-347-v3');
  const env={...process.env,TZ:'UTC'};delete env.TYPESAFE_API_KEY;
  const seed=spawnSync(process.execPath,['--require',path.join(protocol,'fixed-date.cjs'),path.join(protocol,'seed-receipt.mjs'),productRoot],{encoding:'utf8',env,windowsHide:true});
  if(seed.status!==0)throw new Error('Product seed receipt failed: '+seed.stderr);
  const receipt=JSON.parse(seed.stdout);
  if(receipt.seed_sha256!=='8cde76f36bd76b055e2fee3fc2391ace595d94819a4b96d162f7b4e1eecdf83e')throw new Error('Product seed differs from frozen protocol');
  const product_date=new Date(receipt.product_date).toISOString();
  if(product_date!=='2026-09-17T12:00:00.000Z')throw new Error('Product date differs from frozen protocol');
  return {...receipt,product_date,source_manifest:source,build_manifest:build,product_source_sha256:hash(JSON.stringify(source)),product_build_sha256:hash(JSON.stringify(build))};
}
