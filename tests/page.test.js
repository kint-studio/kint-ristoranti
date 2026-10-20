import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('..',import.meta.url);
const html=readFileSync(new URL('ristoranti/index.html',root),'utf8');
// numeri di src/lib/content.ts al commit 30508ec, scritti a mano
const SERVICES=5,FAQ=6;
const H1='kint per il tuo locale.';
const text=s=>s.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const count=(re)=>(html.match(re)||[]).length;
test('pagina: lang italiano, un solo h1 con il titolo della landing',()=>{
 assert.match(html,/<html lang="it">/);
 const h1=html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)||[];assert.equal(h1.length,1);
 assert.equal(text(h1[0]),H1);});
test('pagina: le sezioni top, servizi, prenota e faq',()=>{for(const id of ['top','servizi','prenota','faq'])assert.equal(count(new RegExp(`\\bid="${id}"`,'g')),1,id);});
test('pagina: niente style inline e niente script inline eseguibili',()=>{
 assert.doesNotMatch(html,/\sstyle=/i);
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){const [,a,body]=m;
  if(/type="application\/ld\+json"/.test(a))continue;
  assert.match(a,/type="module"/,`script non ammesso: ${a}`);assert.match(a,/\ssrc="/,`script module senza src: ${a}`);assert.equal(body.trim(),'',`script con contenuto: ${a}`);}});
test('pagina: ogni img ha width, height e alt',()=>{for(const [img] of html.matchAll(/<img\b[^>]*>/gi))for(const a of ['width','height','alt'])assert.match(img,new RegExp(`\\s${a}="`),`${a}: ${img}`);});
test('pagina: servizi e FAQ quanti in content.ts',()=>{
 const group=name=>{const m=html.match(new RegExp(`<section id="${name}"[\\s\\S]*?</section>`));assert.ok(m,name);return (m[0].match(/\bdata-accordion-item\b/g)||[]).length;};
 assert.equal(group('servizi'),SERVICES);assert.equal(group('faq'),FAQ);});
test('pagina: gli agganci per il JS',()=>{
 for(const sel of [/\bdata-scene\b/,/\bdata-menu-open\b/,/\bdata-menu-close\b/,/\bid="menu"/,/\bdata-accordion\b(?!-)/,/<form\b[^>]*\bdata-contact\b/,/\bdata-sector="Ristorazione &amp; hospitality"/,/\bdata-example="Grotto del Sole"/,/\bdata-footer-wordmark\b/,/\bdata-service-trail\b/,/\bdata-year\b/])assert.match(html,sel);
 const scene=html.match(/<div\b[^>]*\bdata-scene\b[\s\S]*?<\/div>\s*<\/div>/);assert.ok(scene&&/<canvas\b/.test(scene[0])&&/class="kf-cursor"/.test(scene[0]),'scena con canvas e cursore');
 assert.match(html,/<div\b[^>]*\bid="menu"[^>]*\binert\b/,'menu chiuso e inerte');});
test('pagina: font Geist locali con font-display swap e scroll morbido solo senza riduci movimento',()=>{
 const css=readFileSync(new URL('assets/ristoranti/ristoranti.css',root),'utf8');
 assert.match(css,/@font-face\{font-family:'Geist';src:url\('\.\.\/geist-sub\.woff2\?v=[^']+'\)/);assert.match(css,/@font-face\{font-family:'Geist Mono';src:url\('\.\.\/geist-mono-sub\.woff2\?v=[^']+'\)/);
 assert.equal((css.match(/font-display:swap/g)||[]).length,2);
 assert.match(css,/@media \(prefers-reduced-motion:no-preference\)\{html\{scroll-behavior:smooth\}\}/);assert.doesNotMatch(css.replace(/@media \(prefers-reduced-motion:no-preference\)\{html\{scroll-behavior:smooth\}\}/,''),/scroll-behavior:smooth/);
 assert.match(html,/<link rel="stylesheet" href="\/assets\/ristoranti\/ristoranti\.css\?v=[^"]+">/);});
