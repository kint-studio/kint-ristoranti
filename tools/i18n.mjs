// Copy of KINT-codice-completo/tools/i18n.mjs (9a20d7b), changed for the restaurant landing: the source is ristoranti/index.html (SOURCE);
// data-sector (the sector written in the contact mail) is translatable; t('…') keys are read from assets/ and assets/ristoranti/;
// the language switch is nav.kf-lang-switch, and the Human/Machine links of nav.kf-view-switch get the language prefix.
// Translations of the site. index.html (Italian) is the only source; i18n/<lang>.json maps Italian text to its translation.
// A unit is the content of an element whose children are only text and inline elements (key: that inner HTML, normalized), or a loose text node next to other elements.
// Translatable attributes are keyed by their value. The JavaScript passes its visible text through t('…') (assets/i18n.js); those keys live in the same dictionaries.
// Usage: node tools/i18n.mjs --missing <lang>   (prints the missing keys as JSON, ready to fill)
//        node tools/i18n.mjs --audit            (missing, orphan and tag-mismatch counts per language)
import {readFileSync,readdirSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
export const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const LANGS=['it','en','fr','de'];
export const ATTRS=['alt','aria-label','title','placeholder','data-project-folder','data-finder-folder','data-desktop-file','data-sector'];
export const SOURCE='ristoranti/index.html';
const VOID=new Set(['area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr']);
const RAWTEXT=new Set(['script','style','textarea','title']);
const SKIP=new Set(['script','style','svg','template','noscript','pre','canvas','textarea']);
const INLINE=new Set(['span','br','strong','em','b','i','small','sup','sub']);
const LETTER=/\p{L}/u;
const norm=s=>s.replace(/\s+/g,' ').trim();
const TAG=/<!--[\s\S]*?-->|<!doctype[^>]*>|<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>/gi;
const ATTR=/([^\s=>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

// Minimal tree of a well-formed document: elements keep offsets of their tag, content and attribute values.
function parse(html){
 const top={name:'#root',children:[],attrs:[]};const stack=[top];let last=0,m;TAG.lastIndex=0;
 const text=(a,b)=>{if(b>a)stack.at(-1).children.push({text:true,start:a,end:b});};
 while((m=TAG.exec(html))){
  text(last,m.index);last=TAG.lastIndex;if(!m[2])continue;
  const name=m[2].toLowerCase();
  if(m[1]){const i=stack.findLastIndex(n=>n.name===name);if(i>0){for(const n of stack.splice(i))n.close??=m.index,n.end??=TAG.lastIndex;}continue;}
  const attrs=[];const attrStart=m.index+1+m[2].length;let a;ATTR.lastIndex=0;
  while((a=ATTR.exec(m[3]))){const value=a[2]??a[3]??a[4];if(value===undefined){attrs.push({name:a[1].toLowerCase(),value:null});continue;}const vs=attrStart+a.index+a[0].indexOf(value,a[1].length);attrs.push({name:a[1].toLowerCase(),value,start:vs,end:vs+value.length});}
  const el={name,attrs,start:m.index,openEnd:TAG.lastIndex,children:[],parent:stack.at(-1)};stack.at(-1).children.push(el);
  if(VOID.has(name))continue;
  if(RAWTEXT.has(name)){const close=html.toLowerCase().indexOf(`</${name}`,TAG.lastIndex);el.children.push({text:true,start:TAG.lastIndex,end:close});el.close=close;el.end=html.indexOf('>',close)+1;TAG.lastIndex=last=el.end;continue;}
  stack.push(el);
 }
 return top;
}
const attr=(el,n)=>el.attrs.find(a=>a.name===n);
const inlineOnly=el=>el.children.every(c=>c.text||(INLINE.has(c.name)&&inlineOnly(c)));
const textOf=(html,el)=>el.text?html.slice(el.start,el.end):el.children.map(c=>textOf(html,c)).join('');

export function collect(html){
 const units=[],attrs=[];
 (function walk(node,unit){
  for(const c of node.children){
   if(c.text){if(!unit&&LETTER.test(html.slice(c.start,c.end))){const raw=html.slice(c.start,c.end),s=c.start+raw.search(/\S/),e=c.start+raw.trimEnd().length;units.push({start:s,end:e,key:norm(raw),kind:'text'});}continue;}
   for(const a of c.attrs){if(a.value===null||!LETTER.test(a.value))continue;if(ATTRS.includes(a.name)||(a.name==='content'&&c.name==='meta'&&attr(c,'name')?.value==='description'))attrs.push({start:a.start,end:a.end,key:a.value,name:a.name});}
   if(SKIP.has(c.name))continue;
   if(!unit&&c.close!==undefined&&c.children.length&&attr(c,'translate')?.value!=='no'&&inlineOnly(c)&&LETTER.test(textOf(html,c))){units.push({start:c.openEnd,end:c.close,key:norm(html.slice(c.openEnd,c.close)),kind:'block'});walk(c,true);continue;}
   if(attr(c,'translate')?.value==='no'){walk(c,true);continue;}
   walk(c,unit);
  }
 })(parse(html),false);
 return {units,attrs};
}

export const tagsOf=s=>[...s.matchAll(/<[^>]+>/g)].map(m=>m[0]).sort();
const unescapeJs=s=>JSON.parse('"'+s.replace(/\\'/g,"'").replace(/"/g,'\\"')+'"');
// Keys of the t('…') calls in a JavaScript source, already unescaped.
export function keysIn(source){return [...source.matchAll(/(?<![\w.$])t\('((?:[^'\\]|\\.)*)'/g)].map(m=>unescapeJs(m[1]));}
export function jsKeys(){const keys=new Set();for(const d of ['assets','assets/ristoranti'])for(const f of readdirSync(join(root,d)).filter(f=>f.endsWith('.js')&&f!=='i18n.js'))for(const k of keysIn(readFileSync(join(root,d,f),'utf8')))keys.add(k);return [...keys];}
export const loadDict=lang=>JSON.parse(readFileSync(join(root,'i18n',`${lang}.json`),'utf8'));
export const loadKeep=()=>new Set(JSON.parse(readFileSync(join(root,'i18n','keep.json'),'utf8')));

export function apply(html,dict,keep){
 const {units,attrs}=collect(html),missing=[],edits=[];
 for(const u of [...units,...attrs]){if(keep.has(u.key))continue;const tr=dict[u.key];if(tr===undefined){if(!missing.includes(u.key))missing.push(u.key);continue;}edits.push([u.start,u.end,tr]);}
 edits.sort((a,b)=>b[0]-a[0]);let out=html;for(const [s,e,tr] of edits)out=out.slice(0,s)+tr+out.slice(e);
 return {html:out,missing};
}

export function audit(lang,html=readFileSync(join(root,SOURCE),'utf8'),o={}){
 const dict=o.dict??loadDict(lang),keep=o.keep??loadKeep(),{units,attrs}=collect(html),wanted=new Set([...units,...attrs].map(u=>u.key).filter(k=>!keep.has(k)));for(const k of o.js??jsKeys())if(!keep.has(k))wanted.add(k);
 return {missing:[...wanted].filter(k=>!(k in dict)),orphans:Object.keys(dict).filter(k=>!wanted.has(k)),badTags:Object.entries(dict).filter(([k,v])=>JSON.stringify(tagsOf(k))!==JSON.stringify(tagsOf(v))).map(([k])=>k)};
}

const absolute=html=>html.replace(/\b(src|href|poster|srcset|imagesrcset|data-project-icon)="([^"]*)"/g,(m,a,v)=>`${a}="${a.endsWith('srcset')?v.replace(/(^|,\s*)assets\//g,'$1/assets/'):v.replace(/^assets\//,'/assets/')}"`);
const selector=(html,lang)=>html.replace(/<nav class="[^"]*\blang-switch"[\s\S]*?<\/nav>/,nav=>nav.replace(/ aria-current="true"/g,'').replace(new RegExp(`(<a href="[^"]*" hreflang="${lang}" lang="${lang}")>`),'$1 aria-current="true">'));

export function translatePage(source,lang,{dict=loadDict(lang),keep=loadKeep(),js,jsKeys:jsList}={}){
 const {html,missing}=apply(source,dict,keep);
 if(!js)for(const k of jsList??jsKeys())if(!keep.has(k)&&dict[k]===undefined&&!missing.includes(k))missing.push(k);
 if(missing.length)throw new Error(`${lang}: ${missing.length} traduzioni mancanti (node tools/i18n.mjs --missing ${lang}):\n${missing.map(k=>`  ${k}`).join('\n')}`);
 const strings=js??Object.fromEntries((jsList??jsKeys()).filter(k=>!keep.has(k)).map(k=>[k,dict[k]]));
 const json=JSON.stringify(strings).replace(/</g,'\\u003c');
 return selector(absolute(html),lang).replace('<a href="/ai/home/" data-machine-link>',`<a href="/${lang}/ai/home/" data-machine-link>`).replace(/<nav class="kf-view-switch"[\s\S]*?<\/nav>/,nav=>nav.replace(/ href="\//g,` href="/${lang}/`)).replace(/<html lang="it">/,`<html lang="${lang}">`).replace(/<script data-lang-redirect>[\s\S]*?<\/script>/,'').replace('</head>',()=>`<script type="application/json" id="kint-i18n">${json}</script></head>`);
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [flag,lang]=process.argv.slice(2);
 if(flag==='--missing'){const {missing}=audit(lang);console.log(JSON.stringify(Object.fromEntries(missing.map(k=>[k,''])),null,1));}
 else for(const l of LANGS.slice(1)){const r=audit(l);console.log(`${l}: ${r.missing.length} mancanti, ${r.orphans.length} orfane, ${r.badTags.length} con tag diversi`);}
}
