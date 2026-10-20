import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
// Adattato da KINT-codice-completo/tests/cache-headers.test.js: pagine e asset di questa landing (assets/ e assets/ristoranti/). Il test sul dist arriva con tools/build.mjs.
const root=fileURLToPath(new URL('..',import.meta.url));
const read=p=>readFileSync(join(root,p),'utf8');
const htmlFiles=d=>existsSync(join(root,d))?readdirSync(join(root,d),{withFileTypes:true}).flatMap(e=>e.isDirectory()?htmlFiles(join(d,e.name)):e.name.endsWith('.html')?[join(d,e.name)]:[]):[];
const assetDirs=['assets','assets/ristoranti'];
const sources=['index.html','404.html',...htmlFiles('ristoranti'),...['en','fr','de'].flatMap(htmlFiles),...htmlFiles('ai'),...assetDirs.flatMap(d=>readdirSync(join(root,d)).filter(f=>/\.(js|css)$/.test(f)).map(f=>join(d,f)))];
const isAsset=f=>assetDirs.some(d=>existsSync(join(root,d,f)));
test('_headers: cache di un anno solo per JS, CSS e font',()=>{const h=read('_headers');for(const ext of ['js','css','woff2'])assert.match(h,new RegExp(`/assets/\\*\\.${ext}\\r?\\n\\s+Cache-Control: public, max-age=31536000, immutable`));for(const ext of ['webp','svg'])assert.doesNotMatch(h,new RegExp(`/assets/\\*\\.${ext}\\r?\\n\\s+Cache-Control:[^\\n]*immutable`));});
test('ogni JS, CSS e font in assets/ è richiamato con ?v= (condizione della cache immutable)',()=>{const missing=[];for(const f of sources){const text=read(f).replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');for(const m of text.matchAll(/[\w./-]*?([\w-]+\.(?:js|css|woff2))(\?v=[^"'`)\s]+)?["'`)]/g)){if(!isAsset(m[1]))continue;if(!m[2])missing.push(`${f}: ${m[0]}`);}}assert.deepEqual(missing,[]);});
test('_headers: regole di cache scritte a mano invariate',()=>{const h=read('_headers').replace(/\r\n/g,'\n');assert.ok(h.startsWith(`# Cloudflare Pages: header di cache (https://developers.cloudflare.com/pages/configuration/headers/).
# JS, CSS e font possono restare in cache un anno perché hanno sempre un hash nel nome del file (bundle di build e worker) oppure un ?v= di versione (file caricati direttamente, ad esempio le pagine Machine); ogni modifica cambia l'URL (tests/cache-headers.test.js).
/assets/*.js
  Cache-Control: public, max-age=31536000, immutable
/assets/*.css
  Cache-Control: public, max-age=31536000, immutable
/assets/*.woff2
  Cache-Control: public, max-age=31536000, immutable
# Immagini e icona non hanno versione nell'URL: un giorno di cache, poi rivalidate in background.
/assets/*.webp
  Cache-Control: public, max-age=86400, stale-while-revalidate=604800
/assets/*.svg
  Cache-Control: public, max-age=86400, stale-while-revalidate=604800

# --- ai-export: inizio
`));});
