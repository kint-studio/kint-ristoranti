import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,mkdtempSync,rmSync,readdirSync,statSync} from 'node:fs';
import {join,dirname,relative,sep} from 'node:path';
import {tmpdir} from 'node:os';
import {buildSite} from '../tools/build.mjs';
// Ogni href e src interno di ogni HTML del dist risolve a un file del dist o a un redirect di _redirects.
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):[join(d,e.name)]);
test('dist: ogni href e src interno risolve a un file del dist, considerando _redirects',async()=>{
 const out=mkdtempSync(join(tmpdir(),'kint-ristoranti-links-'));
 try{await buildSite(out);
  const redirects=new Set(readFileSync(join(out,'_redirects'),'utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')).map(l=>l.split(/\s+/)[0]));
  const missing=[];let n=0;
  const exists=p=>{const t=join(out,p);return existsSync(t)&&(!statSync(t).isDirectory()||existsSync(join(t,'index.html')));};
  const check=(from,ref)=>{if(/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(ref)||ref==='')return;
   const path=ref.replace(/[?#].*$/,'');if(path==='')return;n++;
   const abs=path.startsWith('/')?path:'/'+relative(out,join(dirname(join(out,from)),path)).split(sep).join('/');
   if(!exists(abs)&&!redirects.has(abs))missing.push(`${from}: ${ref}`);};
  for(const f of walk(out).filter(f=>f.endsWith('.html')).map(f=>relative(out,f).split(sep).join('/'))){
   // Si leggono solo gli attributi dei tag: JSON-LD e altri blocchi di dati non sono link.
   const text=readFileSync(join(out,f),'utf8');
   for(const m of text.matchAll(/<(?:a|link|script|img|source)\b[^>]*?\s(?:href|src)="([^"]+)"/g))check(f,m[1]);}
  assert.ok(n>50,'pochi link controllati');assert.deepEqual(missing,[]);
 }finally{rmSync(out,{recursive:true,force:true});}
});
