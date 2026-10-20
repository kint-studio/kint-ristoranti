import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,mkdtempSync,rmSync,readdirSync} from 'node:fs';
import {join,relative,sep} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {buildSite,assetsToPublish,root} from '../tools/build.mjs';
import {inlineScriptHashes} from '../tools/export.mjs';
// Test sul risultato della build (tools/build.mjs), come tests/build.test.js del sito principale: ogni test costruisce in una cartella temporanea.
const HUMAN=['ristoranti/index.html','en/ristoranti/index.html','fr/ristoranti/index.html','de/ristoranti/index.html'];
const MACHINE=['ai/ristoranti/index.html','en/ai/ristoranti/index.html','fr/ai/ristoranti/index.html','de/ai/ristoranti/index.html'];
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):[join(d,e.name)]);
const withBuild=async(fn,opts)=>{const out=mkdtempSync(join(tmpdir(),'kint-ristoranti-build-'));try{const r=await buildSite(out,opts);await fn(out,r);}finally{rmSync(out,{recursive:true,force:true});}};
const read=(out,f)=>readFileSync(join(out,f),'utf8');
test('build: gli 8 indirizzi, la radice, 404, _headers e _redirects esistono',()=>withBuild(out=>{
 for(const f of [...HUMAN,...MACHINE,'index.html','404.html','_headers','_redirects','robots.txt','sitemap.xml','favicon.ico','apple-touch-icon.png','assets/og-kint.jpg'])assert.ok(existsSync(join(out,f)),f);
}));
test('build: ogni pagina Human carica un solo CSS e un solo JS con hash di 10 caratteri, senza modulepreload',()=>withBuild((out,r)=>{
 assert.match(r.css,/^assets\/ristoranti\/landing\.[0-9a-f]{10}\.css$/);assert.match(r.js,/^assets\/ristoranti\/landing\.[0-9a-f]{10}\.js$/);
 for(const f of HUMAN){const h=read(out,f);
  assert.deepEqual([...h.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(m=>m[1]),['/'+r.css],f);
  assert.deepEqual([...h.matchAll(/<script type="module" src="([^"]+)">/g)].map(m=>m[1]),['/'+r.js],f);
  assert.ok(!h.includes('modulepreload'),f);}
 for(const f of [r.css,r.js])assert.ok(existsSync(join(out,f)),f);
 assert.doesNotMatch(read(out,r.js),/from"\.\/[\w-]+\.js/,'import non risolti nel bundle');
}));
test('build: le pagine Machine e gli asset condivisi sono copiati invariati',()=>withBuild(out=>{
 for(const f of MACHINE)assert.deepEqual(readFileSync(join(out,f)),readFileSync(join(root,f)),f);
 for(const f of ['assets/machine.css','assets/mode-switch.js','assets/mode-switch.css','assets/geist-sub.woff2'])assert.deepEqual(readFileSync(join(out,f)),readFileSync(join(root,f)),f);
 const assets=readdirSync(join(out,'assets/ristoranti'));
 for(const f of ['landing.js','hero.js','material.js','material-worker.js'])assert.ok(!assets.includes(f),`${f} è già nel bundle`);
 assert.ok(assets.some(f=>f.endsWith('.webp')));
 const list=assetsToPublish(root);assert.ok(list.includes('assets/mode-switch.js')&&!list.includes('assets/ristoranti/landing.js'));
}));
test('build: ogni immagine della forchetta, anche quella con percorso a template, è nel dist',()=>withBuild((out,r)=>{
 const bundle=read(out,r.js);assert.ok(bundle.includes('forchetta3-kintsugi'));
 for(const f of readdirSync(join(root,'assets/ristoranti')).filter(f=>f.endsWith('.webp')))assert.ok(existsSync(join(out,'assets/ristoranti',f)),f);
 for(const m of bundle.matchAll(/\/assets\/[\w./-]+\.(?:webp|woff2|jpg)/g))assert.ok(existsSync(join(out,m[0])),m[0]);
}));
test('build: il worker è un bundle a parte con hash e il bundle lo richiama per nome',()=>withBuild((out,r)=>{
 const bundle=read(out,r.js),m=bundle.match(/new URL\("\.\/(material-worker\.[0-9a-f]{10}\.js)"/);
 assert.ok(m,'URL del worker con hash nel bundle');assert.ok(existsSync(join(out,'assets/ristoranti',m[1])),m[1]);
 assert.ok(!existsSync(join(out,'assets/ristoranti/material-worker.js')));assert.doesNotMatch(bundle,/material-worker\.js/);
}));
test('build: ogni hash della CSP di _headers corrisponde a uno script inline del dist e viceversa',()=>withBuild(out=>{
 const hdr=read(out,'_headers').split(/\r?\n/),i=hdr.findIndex(l=>l==='/*');assert.ok(i>=0,'regola /* mancante');
 const csp=hdr.slice(i+1).find(l=>/^\s*Content-Security-Policy:/.test(l));assert.ok(csp,'CSP mancante');
 const inCsp=[...csp.matchAll(/'(sha256-[^']+)'/g)].map(m=>m[1]).sort();
 const inDist=[...new Set(walk(out).filter(f=>f.endsWith('.html')).flatMap(f=>inlineScriptHashes(readFileSync(f,'utf8'))))].map(h=>h.slice(1,-1)).sort();
 assert.deepEqual(inCsp,inDist);assert.match(csp,/worker-src 'self'/);assert.doesNotMatch(csp,/script-src[^;]*unsafe-inline/);
 assert.match(read(out,'_headers'),/\/assets\/\*\.js\r?\n\s+Cache-Control: public, max-age=31536000, immutable/,'regole di cache a mano mantenute');
}));
test('build: nessun file del dist contiene node_modules, tools/ o .ts',()=>withBuild(out=>{
 for(const f of walk(out)){const p=relative(out,f).split(sep).join('/');
  assert.ok(!/node_modules|(^|\/)tools\/|\.ts$/.test(p),p);
  if(/\.(?:html|js|css|json|txt|xml)$/.test(p))assert.doesNotMatch(readFileSync(f,'utf8'),/node_modules|\btools\/|\.ts\b/,p);}
 for(const f of ['README.md','AGENTS.md','CLAUDE.md','docs','tests','i18n'])assert.ok(!existsSync(join(out,f)),f);
}));
test('build: INDEX=1 rende indicizzabili le pagine Human e robots.txt solo nel dist; le sorgenti non cambiano',()=>{
 const tracked=['ristoranti/index.html','en/ristoranti/index.html','robots.txt','_headers','sitemap.xml'],before=tracked.map(f=>readFileSync(join(root,f),'utf8'));
 return withBuild(out=>{
  for(const f of HUMAN)assert.doesNotMatch(read(out,f),/noindex/,f);
  for(const f of MACHINE)assert.match(read(out,f),/<meta name="robots" content="noindex/,f);
  const robots=read(out,'robots.txt');assert.match(robots,/Allow: \//);assert.doesNotMatch(robots,/Disallow/);assert.match(robots,/Sitemap: https:\/\/[^\s]+\/sitemap\.xml/);
  assert.deepEqual(tracked.map(f=>readFileSync(join(root,f),'utf8')),before,'sorgenti cambiate');
  execFileSync(process.execPath,[join(root,'tools/export.mjs'),'--check'],{env:{...process.env,INDEX:'1'}});
 },{index:true});
});
test('build: senza INDEX le pagine Human restano noindex e robots.txt vieta tutto',()=>withBuild(out=>{
 for(const f of HUMAN)assert.match(read(out,f),/<meta name="robots" content="noindex, nofollow">/,f);
 assert.match(read(out,'robots.txt'),/Disallow: \//);
},{index:false}));
