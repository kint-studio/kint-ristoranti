import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {audit,LANGS,loadDict} from '../tools/i18n.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
// Frasi italiane che esistono solo nella pagina italiana (ristoranti/index.html). «caffettino?» resta in italiano in ogni lingua, come nella versione precedente.
const ITALIAN=['kint per il','tuo locale.','>Servizi<','Le idee prendono forma','Apri il menu','Quanto costa?','Venti minuti di call','Torna su'];
for(const l of LANGS.slice(1)){
 test(`${l}: node tools/i18n.mjs --missing ${l} non trova chiavi mancanti`,()=>{assert.deepEqual(JSON.parse(execFileSync(process.execPath,['tools/i18n.mjs','--missing',l],{cwd:root,encoding:'utf8'})),{});});
 test(`${l}: ogni testo di ristoranti/index.html e del JavaScript è tradotto`,()=>{assert.deepEqual(audit(l).missing,[]);});
 test(`${l}: nessuna traduzione per testi che non esistono più`,()=>{assert.deepEqual(audit(l).orphans,[]);});
 test(`${l}: ogni traduzione conserva gli stessi tag`,()=>{assert.deepEqual(audit(l).badTags,[]);});
 test(`${l}: nessuna traduzione vuota`,()=>{assert.deepEqual(Object.entries(loadDict(l)).filter(([,v])=>!v.trim()).map(([k])=>k),[]);});
 test(`${l}: nessun testo italiano rimasto nelle pagine tradotte`,()=>{for(const p of [`${l}/ristoranti/index.html`,`${l}/ai/ristoranti/index.html`]){const h=readFileSync(root+p,'utf8');for(const s of ITALIAN)assert.ok(!h.includes(s),`${p}: ${s}`);}});}
test('de: ortografia svizzera, senza ß',()=>{assert.deepEqual(Object.values(loadDict('de')).filter(v=>v.includes('ß')),[]);});
test('nessun trattino lungo nuovo nelle traduzioni oltre a quelli già nella chiave',()=>{for(const l of LANGS.slice(1))for(const [k,v] of Object.entries(loadDict(l)))assert.ok((v.match(/—/g)||[]).length<=(k.match(/—/g)||[]).length,`${l}: ${k}`);});
test('le stringhe del JavaScript (contact.js) sono nei dizionari',()=>{for(const l of LANGS.slice(1)){const d=loadDict(l);for(const k of ['Richiesta call: {x}','Nome','Attività','Settore','Email'])assert.ok(d[k],`${l}: ${k}`);}});
test('fr: spazio non separabile prima di ? ! : ; » e dopo «',()=>{for(const v of Object.values(loadDict('fr')))assert.doesNotMatch(v.replace(/<[^>]+>/g,''),/ [?!:;»]|« /,v);});
