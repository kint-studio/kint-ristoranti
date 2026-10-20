import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {generate,stale,root,BASE} from '../tools/export.mjs';
import {LANGS} from '../tools/i18n.mjs';
const {files}=generate();
const pre=l=>l==='it'?'':`/${l}`,human=l=>`${pre(l)}/ristoranti/`,machine=l=>`${pre(l)}/ai/ristoranti/`,file=p=>p.slice(1)+'index.html';
const OG={it:'it_CH',en:'en_GB',fr:'fr_CH',de:'de_CH'};
const robots=h=>h.match(/<meta name="robots" content="([^"]*)">/)?.[1];
const pages=[...files].filter(([f])=>f.endsWith('.html'));
const csp=()=>files.get('_headers').match(/Content-Security-Policy: ([^\n]+)/)[1];
const scriptSrc=()=>csp().split(';').map(s=>s.trim()).find(s=>s.startsWith('script-src '));

test('file generati allineati alla sorgente (altrimenti: npm run export)',()=>{assert.deepEqual(stale(files),[]);});
test('le 8 pagine, sitemap, robots, _redirects, _headers e 404',()=>{
 for(const l of LANGS){assert.ok(files.has(file(human(l))),human(l));assert.ok(files.has(file(machine(l))),machine(l));}
 for(const f of ['sitemap.xml','robots.txt','_redirects','_headers','404.html'])assert.ok(files.has(f),f);});
test('Human: lang, canonical, hreflang reciproci e x-default',()=>{for(const l of LANGS){const h=files.get(file(human(l)));
 assert.match(h,new RegExp(`<html lang="${l}">`));assert.ok(h.includes(`<link rel="canonical" href="${BASE}${human(l)}">`),l);
 for(const o of LANGS)assert.ok(h.includes(`<link rel="alternate" hreflang="${o}" href="${BASE}${human(o)}">`),`${l} → ${o}`);
 assert.ok(h.includes(`<link rel="alternate" hreflang="x-default" href="${BASE}/ristoranti/">`),l);
 assert.equal((h.match(/<link rel="canonical"/g)||[]).length,1,l);assert.equal((h.match(/hreflang="x-default"/g)||[]).length,1,l);}});
test('Human: Open Graph con og:locale della lingua e immagine 1200×630, icone',()=>{for(const l of LANGS){const h=files.get(file(human(l)));
 assert.ok(h.includes(`<meta property="og:locale" content="${OG[l]}">`),l);assert.ok(h.includes(`<meta property="og:url" content="${BASE}${human(l)}">`),l);
 assert.ok(h.includes(`<meta property="og:image" content="${BASE}/assets/og-kint.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`),l);
 assert.ok(h.includes('<link rel="icon" href="/favicon.ico" sizes="any"><link rel="apple-touch-icon" href="/apple-touch-icon.png">'),l);}});
test('Human: title e description nella lingua, anche in Open Graph',()=>{
 const meta={it:['Per i ristoratori — kint','Sito con menu e prenotazioni'],en:['For restaurateurs — kint','Website with menu and bookings'],fr:['Pour les restaurateurs — kint','Site avec menu et réservations'],de:['Für die Gastronomie — kint','Website mit Speisekarte und Reservationen']};
 for(const l of LANGS){const h=files.get(file(human(l))),[title,desc]=meta[l];
  assert.ok(h.includes(`<title>${title}</title>`),l);assert.ok(h.includes(`<meta property="og:title" content="${title}">`),l);
  assert.match(h,new RegExp(`<meta name="description" content="${desc}`));assert.match(h,new RegExp(`<meta property="og:description" content="${desc}`));}});
test('Human: JSON-LD WebPage e Service, Svizzera e Italia, fornitore KINT',()=>{for(const l of LANGS){const h=files.get(file(human(l)));
 const ld=JSON.parse(h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]),g=ld['@graph'],page=g.find(n=>n['@type']==='WebPage'),service=g.find(n=>n['@type']==='Service');
 assert.equal(page.url,`${BASE}${human(l)}`);assert.equal(page.inLanguage,l);
 assert.equal(service.areaServed.length,2);assert.ok(service.areaServed.every(a=>a['@type']==='Country'),l);
 assert.equal(service.provider['@type'],'Organization');assert.equal(service.provider.url,`${BASE}/`);assert.equal(service.provider.name,'KINT');
 assert.equal(service.hasOfferCatalog.itemListElement.length,5);}});
test('robots: noindex senza INDEX, indicizzabile con INDEX=1; Machine sempre noindex',()=>{
 for(const l of LANGS){assert.match(robots(files.get(file(human(l)))),/noindex/,l);assert.match(robots(files.get(file(machine(l)))),/noindex/,l);}
 assert.match(files.get('robots.txt'),/^Disallow: \/$/m);
 const before=process.env.INDEX;process.env.INDEX='1';let indexed;try{indexed=generate().files;}finally{if(before===undefined)delete process.env.INDEX;else process.env.INDEX=before;}
 for(const l of LANGS){assert.doesNotMatch(robots(indexed.get(file(human(l)))),/noindex/,l);assert.match(robots(indexed.get(file(machine(l)))),/noindex/,l);}
 assert.doesNotMatch(indexed.get('robots.txt'),/Disallow: \/$/m);assert.match(indexed.get('robots.txt'),new RegExp(`Sitemap: ${BASE}/sitemap.xml`));});
test('sitemap: le 4 Human con alternate e x-default, nessuna pagina /ai/',()=>{const s=files.get('sitemap.xml');
 assert.deepEqual([...s.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]),LANGS.map(l=>`${BASE}${human(l)}`));
 for(const l of LANGS)assert.equal(s.split(`hreflang="${l}" href="${BASE}${human(l)}"`).length-1,4,l);
 assert.equal((s.match(/hreflang="x-default" href="[^"]+\/ristoranti\/"/g)||[]).length,4);assert.ok(!s.includes('/ai/'));});
test('_redirects: radice e lingue verso la landing',()=>{const r=files.get('_redirects').split('\n');
 for(const l of ['/ /ristoranti/ 301','/en/ /en/ristoranti/ 301','/fr/ /fr/ristoranti/ 301','/de/ /de/ristoranti/ 301','/en /en/ristoranti/ 301','/fr /fr/ristoranti/ 301','/de /de/ristoranti/ 301'])assert.ok(r.includes(l),l);});
test('CSP: hash di ogni script inline eseguibile, niente unsafe-inline negli script, worker-src self',()=>{
 const src=scriptSrc();assert.ok(src,'script-src');assert.ok(!src.includes("'unsafe-inline'"));assert.match(csp(),/(?:^|; )worker-src 'self'(?:;|$)/);
 for(const [f,h] of pages)for(const m of h.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){const [,a,code]=m;if(/\bsrc=/.test(a)||/type="application\/(?:ld\+)?json"/.test(a))continue;
  const hash=`'sha256-${createHash('sha256').update(code,'utf8').digest('base64')}'`;assert.ok(src.includes(hash),`${f}: ${a}`);}});
test('header di sicurezza: HSTS, nosniff, Referrer-Policy, Permissions-Policy senza interest-cohort',()=>{const h=files.get('_headers');
 assert.match(h,/Strict-Transport-Security: max-age=\d+/);assert.match(h,/X-Content-Type-Options: nosniff/);assert.match(h,/Referrer-Policy: /);
 const pp=h.match(/Permissions-Policy: ([^\n]+)/);assert.ok(pp);assert.ok(!pp[1].includes('interest-cohort'));
 assert.ok(h.includes('# --- ai-export: inizio')&&h.includes('# --- ai-export: fine'));});
test('Machine: lingua, link Versione Human e lingue Machine → Machine',()=>{for(const l of LANGS){const h=files.get(file(machine(l)));
 assert.match(h,new RegExp(`<html lang="${l}">`));assert.ok(h.includes(`<link rel="canonical" href="${BASE}${machine(l)}">`),l);
 assert.match(h,new RegExp(`<a href="${human(l)}">(?:Versione Human|Human version|Version Human|Human-Version)</a>`));
 assert.ok(h.includes(`<a href="${human(l)}" data-human-link>Human</a>`),l);
 const langs=h.match(/<nav class="machine-langs"[\s\S]*?<\/nav>/)[0];for(const o of LANGS)assert.ok(langs.includes(`href="${machine(o)}"`),`${l} → ${o}`);
 assert.equal((h.match(/<section class="machine-section"[^>]*id="servizi"[\s\S]*?<\/section>/)[0].match(/<h3>/g)||[]).length,5,l);
 assert.equal((h.match(/<section class="machine-section"[^>]*id="faq"[\s\S]*?<\/section>/)[0].match(/<p class="machine-q">/g)||[]).length,6,l);}});
test('Human: cambio lingua e interruttore Human/Machine nella stessa lingua',()=>{for(const l of LANGS){const h=files.get(file(human(l)));
 const langs=h.match(/<nav class="[^"]*kf-lang-switch"[\s\S]*?<\/nav>/)[0];for(const o of LANGS)assert.ok(langs.includes(`<a href="${human(o)}" hreflang="${o}" lang="${o}"${o===l?' aria-current="true"':''}>`),`${l} → ${o}`);
 const view=h.match(/<nav class="kf-view-switch"[\s\S]*?<\/nav>/)[0];assert.ok(view.includes(`<a href="${human(l)}" aria-current="page">Human</a>`),l);assert.ok(view.includes(`<a href="${machine(l)}">Machine</a>`),l);}});
test('ogni link interno delle pagine generate porta a una pagina o a un file che esiste',()=>{
 const bad=[];for(const [f,h] of pages)for(const [,u] of h.matchAll(/\b(?:href|src)="(\/[^"#?]*)/g)){if(u.startsWith('//'))continue;const p=u.endsWith('/')?join(u.slice(1),'index.html'):u.slice(1);
  if(!files.has(p.replace(/\\/g,'/'))&&!existsSync(join(root,p)))bad.push(`${f}: ${u}`);}
 assert.deepEqual(bad,[]);});
test('404: noindex, stile della landing, link alla pagina',()=>{const h=files.get('404.html');assert.match(robots(h),/noindex/);assert.ok(h.includes('href="/ristoranti/"'));assert.match(h,/ristoranti\.css\?v=/);});
