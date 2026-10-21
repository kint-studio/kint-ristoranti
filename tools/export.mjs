// Generated files of the restaurant landing, after KINT-codice-completo/tools/ai-export.mjs without llms.txt, agents.md, the .md pages and data/*.json:
// the translated pages en|fr|de/ristoranti/ (tools/i18n.mjs), the SEO head of every human page (canonical, hreflang, social preview, icons, JSON-LD, robots),
// the Machine pages ai/ristoranti/ in every language, sitemap.xml, robots.txt, _redirects, 404.html and the generated block of _headers (security headers and CSP).
// ristoranti/index.html is the only source: change the copy there, then run this script. tests/export.test.js fails when the generated files are stale.
// Usage: node tools/export.mjs [--check]   (sources stay noindex: INDEX=1 applies to tools/build.mjs only)
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {translatePage,LANGS,SOURCE,lf} from './i18n.mjs';
export const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
// Address of the main site: canonical, hreflang, Open Graph, JSON-LD and the links back to KINT.
export const BASE='https://kint-perf.pages.dev';
// Indexing stays off until the landing moves to the main site: INDEX=1 turns it on.
export const INDEX=process.env.INDEX==='1';
export const OG_IMAGE='/assets/og-kint.jpg',OG_SIZE={w:1200,h:630},OG_LOCALE={it:'it_CH',en:'en_GB',fr:'fr_CH',de:'de_CH'};
const ICONS='<link rel="icon" href="/favicon.ico" sizes="any"><link rel="apple-touch-icon" href="/apple-touch-icon.png">';
const social=(l,u,title,desc)=>`<meta property="og:type" content="website"><meta property="og:site_name" content="KINT"><meta property="og:locale" content="${OG_LOCALE[l]}"><meta property="og:url" content="${u}"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc}">`
 +`<meta property="og:image" content="${BASE}${OG_IMAGE}"><meta property="og:image:width" content="${OG_SIZE.w}"><meta property="og:image:height" content="${OG_SIZE.h}"><meta name="twitter:card" content="summary_large_image">`;
const pre=l=>l==='it'?'':`/${l}`,dir=l=>l==='it'?'':`${l}/`;
const humanPath=l=>`${pre(l)}/ristoranti/`,machinePath=l=>`${pre(l)}/ai/ristoranti/`,url=p=>`${BASE}${p}`;
// Facts the page does not state. SITE: the data of the previous landing (content.ts at 30508ec).
const SITE={name:'kint',domain:'kint.ch',city:'Lugano',since:2020};
// Machine labels: the previous landing's text version (i18n.ts and landing-i18n.ts at 30508ec); areaServed, humanVersion and resources as in the main site's ai-export.mjs.
const L={
 it:{areaServed:['Svizzera','Italia'],label:'Ristoratori',machineTitle:'Machine view: ristoratori',machineDescription:'Versione testuale della pagina, per agenti AI e crawler.',
  nav:['/Human','/Servizi','/Faq','/Contatto'],title:'indice leggibile da macchine',note:'# Versione testuale di {url} per agenti AI, crawler e chi la preferisce essenziale.',
  about:'CHI SIAMO',name:'NOME',for:'PER',since:'DAL',seat:'SEDE',services:'SERVIZI',country:'Svizzera',q:'Q:',a:'A:',email:'EMAIL',call:'CALL',callValue:'20 minuti',book:'PRENOTA',bookLink:'Prenota una call →',
  contact:'CONTATTO',lang:'Lingua',sections:'Sezioni',view:'Versione della pagina',humanVersion:'Versione Human',resources:'Risorse'},
 en:{areaServed:['Switzerland','Italy'],label:'Restaurateurs',machineTitle:'Machine: Restaurateurs',
  nav:['/Human','/Services','/Faq','/Contact'],title:'machine-readable index',note:'# Text version of {url} for AI agents, crawlers and anyone who prefers it plain.',
  about:'ABOUT US',name:'NAME',for:'FOR',since:'SINCE',seat:'BASE',services:'SERVICES',country:'Switzerland',q:'Q:',a:'A:',email:'EMAIL',call:'CALL',callValue:'20 minutes',book:'BOOK',bookLink:'Book a call →',
  contact:'CONTACT',lang:'Language',sections:'Sections',view:'Page version',humanVersion:'Human version',resources:'Resources'},
 fr:{areaServed:['Suisse','Italie'],label:'Restaurateurs',machineTitle:'Machine: Restaurateurs',
  nav:['/Human','/Services','/Faq','/Contact'],title:'index lisible par les machines',note:'# Version texte de {url} pour les agents IA, les robots d\'indexation et ceux qui la préfèrent sobre.',
  about:'QUI SOMMES-NOUS',name:'NOM',for:'POUR',since:'DEPUIS',seat:'SIÈGE',services:'SERVICES',country:'Suisse',q:'Q\u00a0:',a:'R\u00a0:',email:'E-MAIL',call:'APPEL',callValue:'20 minutes',book:'RÉSERVER',bookLink:'Réserver un appel →',
  contact:'CONTACT',lang:'Langue',sections:'Sections',view:'Version de la page',humanVersion:'Version Human',resources:'Ressources'},
 de:{areaServed:['Schweiz','Italien'],label:'Gastronomie',machineTitle:'Machine: Gastronomie',
  nav:['/Human','/Leistungen','/Faq','/Kontakt'],title:'maschinenlesbarer Index',note:'# Textversion von {url} für KI-Agenten, Crawler und alle, die es schlicht mögen.',
  about:'ÜBER UNS',name:'NAME',for:'FÜR',since:'SEIT',seat:'SITZ',services:'LEISTUNGEN',country:'Schweiz',q:'F:',a:'A:',email:'E-MAIL',call:'CALL',callValue:'20 Minuten',book:'BUCHEN',bookLink:'Call buchen →',
  contact:'KONTAKT',lang:'Sprache',sections:'Abschnitte',view:'Version der Seite',humanVersion:'Human-Version',resources:'Ressourcen'}};
const MACHINE_CSS='/assets/machine.css?v=pkg-1',SWITCH_CSS='/assets/mode-switch.css?v=15',SWITCH_JS='/assets/mode-switch.js?v=i18n-1';

// ---- reading a human page (Italian or translated)
const ENT={amp:'&',lt:'<',gt:'>',quot:'"',nbsp:' '};
const decode=s=>s.replace(/&#x([0-9a-f]+);/gi,(m,h)=>String.fromCodePoint(parseInt(h,16))).replace(/&#(\d+);/g,(m,d)=>String.fromCodePoint(Number(d))).replace(/&(amp|lt|gt|quot|nbsp);/g,(m,e)=>ENT[e]);
// Collapses ASCII whitespace only: the non-breaking spaces of French typography (before ? : ; ! and inside « ») must survive.
const text=h=>decode(h.replace(/<br\s*\/?>/g,' ').replace(/<[^>]+>/g,'')).replace(/[ \t\r\n\f]+/g,' ').trim();
function one(h,re,label){const m=h.match(re);if(!m)throw new Error(`export: in ${SOURCE} manca ${label}`);return m;}
const all=(h,re)=>[...h.matchAll(re)];
const section=(html,id)=>one(html,new RegExp(`<section[^>]*\\bid="${id}"[\\s\\S]*?</section>`),`la sezione #${id}`)[0];

export function extract(html){
 const services=section(html,'servizi'),faq=section(html,'faq');
 return {
  lang:one(html,/<html lang="(\w+)"/,'la lingua')[1],
  title:decode(one(html,/<title>([^<]+)<\/title>/,'il titolo')[1]),description:decode(one(html,/<meta name="description" content="([^"]+)">/,'la meta description')[1]),
  h1:text(one(html,/<h1[^>]*>([\s\S]*?)<\/h1>/,'il titolo della pagina')[1]),subtitle:text(one(html,/<div class="kf-hero-copy">[\s\S]*?<p>([\s\S]*?)<\/p>/,'il sottotitolo')[1]),
  email:one(html,/action="mailto:([^"]+)"/,'l’indirizzo del modulo')[1],
  servicesLabel:text(one(services,/class="kf-mono kf-services-label">([\s\S]*?)<\/div>/,'l’etichetta dei servizi')[1]),
  services:all(services,/<div class="kf-acc-item"[^>]*>([\s\S]*?)<\/ul><\/div><\/div><\/div><\/div><\/div>/g).map(([,b])=>({
   title:text(one(b,/class="kf-display kf-acc-title">([\s\S]*?)<\/span>/,'il nome del servizio')[1]),tagline:text(one(b,/class="kf-service-tagline">([\s\S]*?)<\/p>/,'il motto')[1]),
   text:text(one(b,/class="kf-service-text">([\s\S]*?)<\/p>/,'il testo del servizio')[1]),points:all(b,/<li>([\s\S]*?)<\/li>/g).map(m=>text(m[1]))})),
  faq:all(faq,/<div class="kf-acc-item"[^>]*>([\s\S]*?)<\/p><\/div><\/div><\/div><\/div>/g).map(([,b])=>({q:text(one(b,/class="kf-display kf-acc-title">([\s\S]*?)<\/span>/,'la domanda')[1]),a:text(one(b,/class="kf-acc-body"><p>([\s\S]*?)$/,'la risposta')[1])}))};
}

// ---- writing
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const attr=s=>esc(s).replace(/"/g,'&quot;');
const ldScript=ld=>`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g,'\\u003c')}</script>`;
const alternates=path=>LANGS.map(o=>`<link rel="alternate" hreflang="${o}" href="${url(path(o))}">`).join('')+`<link rel="alternate" hreflang="x-default" href="${url(path('it'))}">`;
const robotsMeta=index=>`<meta name="robots" content="${index?'index, follow':'noindex, nofollow'}">`;
const pageTitle=c=>c.title.replace(/ — kint$/,'');

// JSON-LD of a human page: the page and the service it offers, provided by KINT (the main site's Organization).
function humanLd(c){
 const l=c.lang,self=url(humanPath(l)),service=`${self}#service`;
 return {'@context':'https://schema.org','@graph':[
  {'@type':'WebPage','@id':self,url:self,name:c.title,description:c.description,inLanguage:l,mainEntity:{'@id':service}},
  {'@type':'Service','@id':service,name:pageTitle(c),serviceType:L[l].label,description:c.description,url:self,inLanguage:l,
   areaServed:L[l].areaServed.map(name=>({'@type':'Country',name})),
   provider:{'@type':'Organization','@id':`${BASE}/#organization`,name:'KINT',url:`${BASE}/`,email:c.email},
   hasOfferCatalog:{'@type':'OfferCatalog',name:c.servicesLabel,itemListElement:c.services.map(s=>({'@type':'Offer',itemOffered:{'@type':'Service',name:s.title,description:s.text}}))}}]};
}
// SEO head of a human page: one generated line after the robots meta (canonical, hreflang, social preview, icons, JSON-LD). The visible copy never changes here.
const SEO_LINE=/\n<link rel="canonical"[^\n]*<\/script>(?=\n)/;
function seoHead(html,c,index){
 const l=c.lang,self=url(humanPath(l));
 const line=`<link rel="canonical" href="${self}">${alternates(humanPath)}${social(l,self,attr(c.title),attr(c.description))}${ICONS}${ldScript(humanLd(c))}`;
 return html.replace(SEO_LINE,'').replace(/<meta name="robots" content="[^"]*">/,()=>`${robotsMeta(index)}\n${line}`);
}

const ASCII_LOGO=`██╗  ██╗██╗███╗   ██╗████████╗
██║ ██╔╝██║████╗  ██║╚══██╔══╝
█████╔╝ ██║██╔██╗ ██║   ██║
██╔═██╗ ██║██║╚██╗██║   ██║
██║  ██╗██║██║ ╚████║   ██║
╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝   ╚═╝`;
const dots=(k,w)=>`${k} ${'.'.repeat(Math.max(2,w-k.length))} `;
// The dotted keys share one width, so the values line up whatever the language.
const fields=rows=>{const w=Math.max(12,...rows.map(([k])=>k.length+1));return `<dl class="machine-fields">${rows.map(([k,v])=>`<div><dt>${dots(k,w)}</dt><dd>${v}</dd></div>`).join('')}</dl>`;};
const sec=(id,title,inner)=>`<section class="machine-section" id="${id}"><h2>${esc(title)}</h2><div class="machine-body">${inner}</div></section>`;
// Machine page: the previous landing's text version (MachineView.tsx at 30508ec) in the markup of the main site's /ai/ pages; always noindex.
function machinePage(c,index){
 const l=c.lang,T=L[l],self=url(machinePath(l)),human=humanPath(l),title=`${T.machineTitle} — kint`,desc=T.machineDescription??c.description;
 const mail=`<a href="mailto:${c.email}">${c.email}</a>`,note=T.note.replace('{url}',`${BASE.replace(/^https?:\/\//,'')}${human}`);
 const [hn,...anchors]=T.nav;
 return `<!doctype html><html lang="${l}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${attr(desc)}"><meta name="robots" content="${index?'noindex':'noindex, nofollow'}">`
 +`<link rel="canonical" href="${self}">${alternates(machinePath)}${social(l,self,attr(title),attr(desc))}${ICONS}<link rel="stylesheet" href="${MACHINE_CSS}"><link rel="stylesheet" href="${SWITCH_CSS}"></head>`
 +`<body class="machine-page"><div class="machine-reveal" aria-hidden="true"></div><div class="machine-scanlines" aria-hidden="true"></div><main class="machine-content"><header><a class="machine-brand-link" href="${machinePath(l)}" aria-label="KINT"><pre class="machine-logo" aria-hidden="true">${ASCII_LOGO}</pre></a>`
 +`<nav class="machine-nav" aria-label="${attr(T.sections)}"><a href="${human}">${esc(hn)}</a> ${anchors.map((a,i)=>`<a href="#${['servizi','faq','contatto'][i]}">${esc(a)}</a>`).join(' ')}</nav>`
 +`<nav class="machine-langs" aria-label="${attr(T.lang)}">${LANGS.map(o=>`<a hreflang="${o}" lang="${o}" href="${machinePath(o)}"${o===l?' aria-current="true"':''}>${o.toUpperCase()}</a>`).join(' ')}</nav></header>`
 +`<h1>${esc(`${SITE.domain} :: ${T.title} :: ${T.label}`)}</h1><p class="comment">${esc(note)}</p>`
 +sec('about',T.about,fields([[T.name,esc(SITE.name)],[T.for,esc(T.label)],[T.since,String(SITE.since)],[T.seat,esc(`${SITE.city}, ${T.country}`)],[T.services,esc(c.services.map(s=>s.title).join(', '))]])+`<p>${esc(`${c.h1} ${c.subtitle}`)}</p>`)
 +sec('servizi',T.services,c.services.map(s=>`<h3>* ${esc(s.title)}</h3><p class="comment">${esc(s.tagline)}</p><p>${esc(s.text)}</p><ul>${s.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>`).join(''))
 +sec('faq','FAQ',c.faq.map(f=>`<p class="machine-q">${esc(`${T.q} ${f.q}`)}</p><p>${esc(`${T.a} ${f.a}`)}</p>`).join(''))
 +sec('contatto',T.contact,fields([[T.email,mail],[T.call,esc(T.callValue)],[T.book,`<a href="${human}#prenota">${esc(T.bookLink)}</a>`]]))
 +`<footer class="machine-footer"><h2>${esc(T.resources)}</h2><p class="machine-resources"><a href="${human}">${esc(T.humanVersion)}</a></p><p>/* EOF */</p></footer></main>`
 +`<nav class="mode-switch" aria-label="${attr(T.view)}" data-mode="machine"><div class="mode-pill"><a href="${human}" data-human-link>Human</a><span aria-current="page">Machine</span></div></nav><script src="${SWITCH_JS}" defer></script></body></html>\n`;
}

// 404 in the landing's style (the previous landing's not-found page): one for every path, in Italian.
const notFound=css=>`<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>404 — kint</title>
<meta name="robots" content="noindex, nofollow">
${ICONS}
<link rel="stylesheet" href="${css}">
</head>
<body>
<main class="kf-404"><p class="kf-mono">404</p><h1 class="kf-display">Pagina non trovata<span class="kf-gold">.</span></h1><a href="/ristoranti/" class="kf-btn">Torna alla pagina</a></main>
</body>
</html>
`;

export const robotsTxt=index=>index?`User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`:`User-agent: *\nDisallow: /\n`;
export const HM='# --- ai-export: inizio',HE='# --- ai-export: fine';
// CSP hashes: the browser hashes the exact text between <script> and </script>. Scripts with src are covered by 'self'; data blocks (JSON-LD, the i18n JSON) are never executed.
// Executable: no type, a JavaScript MIME type, or module.
const executable=a=>{const t=a.match(/(?:^|\s)type\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);if(!t)return true;const v=(t[1]??t[2]??t[3]).trim().toLowerCase();return v===''||v==='module'||/^(?:text|application)\/(?:x-)?(?:java|ecma)script$/.test(v);};
export function inlineScriptHashes(html){
 return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(([,a])=>!/(?:^|\s)src\s*=/i.test(a)&&executable(a))
  .map(([,,code])=>`'sha256-${createHash('sha256').update(code,'utf8').digest('base64')}'`);
}
// Security rule for every path, as in the main site. script-src: 'self' plus the hash of every inline script of the generated pages, sorted so the output is deterministic.
// connect-src 'self' covers the material worker's fetch of the fork images; img-src data:/blob: covers canvas output; worker-src is 'self' only (no blob workers).
export function securityBlock(files){
 const hashes=[...new Set([...files].filter(([f])=>f.endsWith('.html')).flatMap(([,h])=>inlineScriptHashes(h)))].sort();
 const csp=["default-src 'self'",`script-src 'self'${hashes.map(x=>' '+x).join('')}`,"style-src 'self' 'unsafe-inline'","img-src 'self' data: blob:","font-src 'self'","connect-src 'self'","worker-src 'self'","frame-ancestors 'none'","base-uri 'self'","form-action 'self' mailto:","object-src 'none'"].join('; ');
 return `/*\n  Content-Security-Policy: ${csp}\n  X-Frame-Options: DENY\n  Strict-Transport-Security: max-age=31536000; includeSubDomains\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()\n  X-Content-Type-Options: nosniff\n`;
}
export const headersBlock=security=>`${HM}\n# Generato da tools/export.mjs: non modificare a mano.\n${security}${HE}\n`;
// Only the block between the markers is generated; the cache rules above it stay as written by hand.
const headersFile=security=>{let h;try{h=readFileSync(join(root,'_headers'),'utf8').replace(/\r\n/g,'\n');}catch{h='';}
 const a=h.indexOf(HM),b=h.indexOf(HE);
 if(a>=0&&b>a)return h.slice(0,a)+headersBlock(security)+h.slice(b+HE.length).replace(/^\n/,'');
 return h+(h===''||h.endsWith('\n\n')?'':h.endsWith('\n')?'\n':'\n\n')+headersBlock(security);};
const REDIRECTS=()=>`# Generato da tools/export.mjs: non modificare a mano.\n${LANGS.map(l=>`${pre(l)}/ ${humanPath(l)} 301`).join('\n')}\n${LANGS.slice(1).map(l=>`/${l} ${humanPath(l)} 301`).join('\n')}\n`
 +`# Indirizzi della versione precedente e della cartella /ai/.\n${LANGS.map(l=>`${pre(l)}/machine ${machinePath(l)} 301\n${pre(l)}/ai/ ${machinePath(l)} 301\n${pre(l)}/ai ${machinePath(l)} 301`).join('\n')}\n`;

// The source is read as LF whatever the checkout: with CRLF the SEO_LINE strip would miss and the SEO block would be duplicated.
export function generate({source,index=process.env.INDEX==='1'}={}){
 source=lf(source??readFileSync(join(root,SOURCE),'utf8'));const files=new Map();
 for(const l of LANGS){
  const page=l==='it'?source:translatePage(source,l),c=extract(page);
  files.set(`${dir(l)}ristoranti/index.html`,seoHead(page,c,index));
  files.set(`${dir(l)}ai/ristoranti/index.html`,machinePage(c,index));
 }
 const css=one(source,/<link rel="stylesheet" href="(\/assets\/ristoranti\/ristoranti\.css\?v=[^"]+)">/,'il foglio di stile')[1];
 files.set('404.html',notFound(css));
 files.set('_redirects',REDIRECTS());
 files.set('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${LANGS.map(l=>`<url><loc>${url(humanPath(l))}</loc>${LANGS.map(o=>`<xhtml:link rel="alternate" hreflang="${o}" href="${url(humanPath(o))}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${url(humanPath('it'))}"/></url>`).join('')}</urlset>\n`);
 files.set('robots.txt',robotsTxt(index));files.set('_headers',headersFile(securityBlock(files)));
 return {files};
}

// Line endings follow the checkout (Git may turn LF into CRLF on Windows): compare without them.
const same=(a,b)=>a.replace(/\r\n/g,'\n')===b.replace(/\r\n/g,'\n');
const current=f=>{try{return readFileSync(join(root,f),'utf8');}catch{return null;}};
export const stale=files=>[...files].filter(([f,s])=>current(f)===null||!same(current(f),s)).map(([f])=>f);

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 // The committed sources are never indexable: INDEX=1 only reaches the pages built into dist/ (tools/build.mjs).
 const {files}=generate({index:false}),changed=stale(files);
 if(process.argv.includes('--check')){if(changed.length){console.error(`File generati non aggiornati: ${changed.join(', ')}\nEsegui: npm run export`);process.exit(1);}console.log('File generati aggiornati.');}
 else{for(const f of changed){mkdirSync(dirname(join(root,f)),{recursive:true});writeFileSync(join(root,f),files.get(f));}console.log(`export: ${changed.length} file aggiornati su ${files.size}`);}
}
