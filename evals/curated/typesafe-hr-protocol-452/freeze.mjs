import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const review = readFileSync(join(root,'REVIEW.md'),'utf8');
if (!review.includes('Ready to freeze: yes')) throw Error('Independent protocol review must be resolved first');
const hashes = {};
function visit(directory) {
  for(const entry of readdirSync(directory,{withFileTypes:true})) {
    const path = join(directory,entry.name);
    if(entry.isDirectory()) visit(path);
    else if(!['frozen.json','REPORT.md','report.json'].includes(entry.name)) {
      hashes[relative(root,path).replaceAll('\\','/')] = createHash('sha256').update(readFileSync(path)).digest('hex');
    }
  }
}
visit(root);
writeFileSync(join(root,'frozen.json'),JSON.stringify({frozen_at:new Date().toISOString(),purpose:'Issue #452, before live scored executions',hashes},null,2)+'\n',{flag:'wx'});
console.log(`Frozen ${Object.keys(hashes).length} files. Existing freezes cannot be overwritten.`);

