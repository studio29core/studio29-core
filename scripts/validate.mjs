import fs from 'node:fs';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';

const src = fs.readFileSync('worker.js','utf8');
const node = spawnSync(process.execPath,['--check','worker.js'],{encoding:'utf8'});
if(node.status !== 0) {console.error(node.stderr);process.exit(1);}
let count=0;
for(const key of ['COMERCIAL_HTML','CELEBRA_VALIDACAO_HTML','CELEBRA_ORGANIZADOR_HTML','CELEBRA_CONVITE_HTML']){
 const marker='const '+key+'=';
 const idx=src.indexOf(marker);
 if(idx<0){console.error('Missing '+key);process.exit(1);}
 const start=idx+marker.length;
 if(src[start]!=='"'){console.error('Expected JSON string for '+key);process.exit(1);}
 let end=start+1, escaped=false;
 while(end<src.length){
   const c=src[end];
   if(escaped){escaped=false;end++;continue;}
   if(c==='\\'){escaped=true;end++;continue;}
   if(c==='"'){end++;break;}
   end++;
 }
 let html;
 try {html=JSON.parse(src.slice(start,end));} catch(e){console.error(key,e);process.exit(1);}
 for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){
   try {new vm.Script(m[1],{filename:key+' script '+count});count++;}
   catch(e){console.error(e);process.exit(1);}
 }
}
console.log('OK: Worker syntax, embedded HTML constants, '+count+' inline scripts parsed.');
