import fs from 'node:fs';
const [action,name,file] = process.argv.slice(2);
const base = "http://127.0.0.1:52476";
if (action !== 'list' && action !== 'call') throw new Error('Usage: node tools.mjs list | node tools.mjs call <tool> [arguments.json]');
const response = await fetch(base + (action === 'list' ? '/bridge/tools' : '/bridge/call'), action === 'list' ? {} : {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,arguments:file ? JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'')) : {}})});
console.log(JSON.stringify(await response.json(),null,2));
if (!response.ok) process.exitCode = 1;
