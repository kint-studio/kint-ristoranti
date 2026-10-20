// t(): the Italian text is the key. Translated pages (tools/i18n.mjs) carry their strings in <script type="application/json" id="kint-i18n">; Italian has none and gets the key back.
let table;
function strings(){if(table!==undefined)return table;table=null;try{const el=globalThis.document?.getElementById('kint-i18n');if(el)table=JSON.parse(el.textContent);}catch(error){console.warn('KINT translations unreadable, showing Italian',error);}return table;}
const LOCALES={it:'it-CH',en:'en-GB',fr:'fr-CH',de:'de-CH'};
export const localeFor=l=>LOCALES[l]||LOCALES.it;
export const lang=()=>globalThis.document?.documentElement?.lang||'it';
export const langPrefix=()=>{const l=lang();return l==='it'?'':'/'+l;};
export function t(key,vars){const s=strings()?.[key]??key;return vars?s.replace(/\{(\w+)\}/g,(m,k)=>vars[k]??m):s;}
export function resetI18n(){table=undefined;}
