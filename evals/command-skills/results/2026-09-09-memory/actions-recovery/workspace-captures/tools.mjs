import fs from 'node:fs';
const [mode,file] = process.argv.slice(2);
const input=file?JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'')):{};
const response=await fetch("http://127.0.0.1:54473"+'/'+mode,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input)});
console.log(JSON.stringify(await response.json(),null,2));
if(!response.ok)process.exitCode=1;
