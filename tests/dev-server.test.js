import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {createServer} from 'node:net';
import {fileURLToPath} from 'node:url';
const script=fileURLToPath(new URL('../tools/dev_server.py',import.meta.url));
let dir,proc,base;
const freePort=()=>new Promise(r=>{const s=createServer().listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>r(p));});});
before(async()=>{
 dir=mkdtempSync(tmpdir()+'/kint-dev-');mkdirSync(dir+'/a');
 writeFileSync(dir+'/_headers','/*\n  Content-Security-Policy: default-src \'self\'\n/x.txt\n  Content-Type: text/plain; charset=utf-8\n  Cache-Control: public, max-age=31536000, immutable\n');
 writeFileSync(dir+'/_redirects','/ /a/ 301\n');
 writeFileSync(dir+'/a/index.html','<p>a</p>');writeFileSync(dir+'/x.txt','x');writeFileSync(dir+'/404.html','<p>non trovata</p>');
 const port=await freePort();base=`http://127.0.0.1:${port}`;
 proc=spawn('python',[script,'--port',String(port),'--root',dir],{stdio:'ignore'});
 for(let i=0;i<50;i++){try{await fetch(base+'/a/');return;}catch{await new Promise(r=>setTimeout(r,100));}}
 throw new Error('server non avviato');
});
after(()=>{proc?.kill();if(dir)rmSync(dir,{recursive:true,force:true});});
test('redirect da _redirects',async()=>{
 const r=await fetch(base+'/',{redirect:'manual'});
 assert.equal(r.status,301);assert.equal(r.headers.get('location'),'/a/');
});
test('header di _headers applicati per percorso',async()=>{
 const r=await fetch(base+'/a/');
 assert.equal(r.status,200);assert.equal(r.headers.get('content-security-policy'),"default-src 'self'");
});
test('un header di _headers sostituisce quello di default, senza duplicati',async()=>{
 const r=await fetch(base+'/x.txt');
 assert.equal(r.headers.get('content-type'),'text/plain; charset=utf-8');
});
test('Cache-Control resta no-store, una sola volta, anche se _headers ne imposta uno',async()=>{
 const r=await fetch(base+'/x.txt');
 assert.equal(r.headers.get('cache-control'),'no-store');
});
test('404 con 404.html',async()=>{
 const r=await fetch(base+'/nope');
 assert.equal(r.status,404);assert.equal(await r.text(),'<p>non trovata</p>');
});
