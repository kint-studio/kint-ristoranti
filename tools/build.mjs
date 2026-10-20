// Build for publishing: copies the site into dist/ and, for the four Human pages (ristoranti/ and its en/fr/de translations), joins and minifies the stylesheets and bundles landing.js with its modules into one minified file. Names carry a content hash.
// The Machine pages (ai/) and the assets still loaded on their own (assetsToPublish) are copied unchanged; the material worker becomes its own hashed bundle.
// INDEX=1 (or {index:true}) makes the Human pages and robots.txt of dist/ indexable; the sources in the repository stay noindex.
// The CSP of dist/_headers is recomputed on the inline scripts of dist/. Local development keeps using the sources without a build.
// Usage: node tools/build.mjs [outDir]
import {build,transform} from 'esbuild';
import {readFileSync,writeFileSync,rmSync,mkdirSync,cpSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,dirname,resolve,relative,sep} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {generate,securityBlock,headersBlock,HM,HE} from './export.mjs';
export const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const hash=text=>createHash('sha256').update(text).digest('hex').slice(0,10);
const local=href=>join(root,href.replace(/^\//,'').replace(/\?.*$/,''));
// Imports carry ?v= cache-busting queries: resolve them to the file on disk.
const stripVersion={name:'strip-version',setup(b){b.onResolve({filter:/\?v=/},args=>({path:resolve(args.resolveDir,args.path.replace(/\?.*$/,''))}));}};
const HUMAN_PAGES=['ristoranti/index.html','en/ristoranti/index.html','fr/ristoranti/index.html','de/ristoranti/index.html'];
const PUBLISHED_DIRS=['ristoranti','ai','en','fr','de'];
// Pages that load the bundles: the Human pages and 404.html (stylesheet only), so the unbundled stylesheet is not published for it.
const BUNDLED_PAGES=[...HUMAN_PAGES,'404.html'];
const ROOT_FILES=['index.html','404.html','_headers','_redirects','robots.txt','sitemap.xml','favicon.ico','apple-touch-icon.png'];
const BUNDLE_DIR='assets/ristoranti';
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):[join(d,e.name)]);
const rel=(base,f)=>relative(base,f).split(sep).join('/');
// Tags of the Human pages that the build replaces with the bundles.
const bundledTags=/<link rel="(?:stylesheet|modulepreload)" href="[^"]+">|<script type="module" src="[^"]+"><\/script>/g;
// Files of assets/ that production still loads on their own: the bundled CSS and JS modules are left out.
// Images, fonts and other non-code files count when a published text file names their path (assets/…, also as an absolute URL)
// or when a stylesheet or script of assets/ names the file (url(...) of fonts, fork images built at runtime).
// CSS and JS count only when a published page loads them outside the bundle (Machine pages, mode-switch.js, the 404 page).
// The OG image and the font licence are always published.
export function assetsToPublish(base=root){
 const all=walk(join(base,'assets')).map(f=>rel(base,f));
 const code=f=>/\.(?:js|css)$/.test(f);
 const top=readdirSync(base).filter(f=>/\.(?:txt|xml|html)$/.test(f));
 const texts=[...top,...PUBLISHED_DIRS.flatMap(d=>existsSync(join(base,d))?walk(join(base,d)).map(f=>rel(base,f)):[])].filter(f=>/\.(?:html|txt|xml|json|jsonld)$/.test(f));
 const pageText=f=>{const t=readFileSync(join(base,f),'utf8');return BUNDLED_PAGES.includes(f)?t.replace(bundledTags,''):t;};
 const published=texts.map(pageText).join('\n');
 const sources=all.filter(code).map(f=>readFileSync(join(base,f),'utf8')).join('\n');
 // A bare file name counts only between delimiters, so forchetta3-kintsugi.webp does not match forchetta3-kintsugi-640.webp.
 const named=(f,text)=>text.includes(f)||new RegExp(`[/"'(\\s]${f.split('/').pop().replace(/[.]/g,'\\.')}[?"'#)\\s]`).test(text);
 // Paths built at runtime with a template (forchetta3-kintsugi${size}.webp): any asset between the fixed prefix and suffix counts.
 const templates=[...sources.matchAll(/\/(assets\/[\w./-]*?)\$\{[^}]+\}([\w.-]*)/g)].map(m=>[m[1],m[2]]);
 const templated=f=>templates.some(([a,b])=>f.startsWith(a)&&f.endsWith(b));
 const always=['assets/og-kint.jpg','assets/geist-LICENSE.txt','assets/mode-switch.js','assets/mode-switch.css'];
 return all.filter(f=>always.includes(f)||(code(f)?published.includes(f):named(f,published)||named(f,sources)||templated(f))).sort();
}
export async function buildSite(out=join(root,'dist'),{index=process.env.INDEX==='1'}={}){
 rmSync(out,{recursive:true,force:true});mkdirSync(out,{recursive:true});
 for(const f of ROOT_FILES)cpSync(join(root,f),join(out,f));
 for(const d of PUBLISHED_DIRS)cpSync(join(root,d),join(out,d),{recursive:true});
 for(const f of assetsToPublish(root)){mkdirSync(dirname(join(out,f)),{recursive:true});cpSync(join(root,f),join(out,f));}
 // Pages and robots.txt are generated again for dist/ with the requested indexing; the files in the repository are not touched.
 const {files}=generate({index});
 for(const f of files.keys())if(/^(?:(?:en|fr|de)\/)?(?:ai\/)?ristoranti\/index\.html$|^robots\.txt$/.test(f))writeFileSync(join(out,f),files.get(f));
 const first=files.get('ristoranti/index.html');
 // CSS: the stylesheets in document order become one file, so the cascade is unchanged.
 const links=[...first.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)];
 const css=(await transform(links.map(m=>readFileSync(local(m[1]),'utf8')).join('\n'),{loader:'css',minify:true})).code;
 const cssName=`${BUNDLE_DIR}/landing.${hash(css)}.css`;writeFileSync(join(out,cssName),css);
 // JS: landing.js and its module graph become one ES module; the modulepreload hints are no longer needed.
 const entry=first.match(/<script type="module" src="([^"]+)"><\/script>/);
 const bundle=async file=>(await build({entryPoints:[file],bundle:true,format:'esm',minify:true,target:'es2020',write:false,plugins:[stripVersion],legalComments:'none'})).outputFiles[0].text;
 // The material worker is loaded with new URL('./material-worker.js?v=…',import.meta.url): it becomes its own bundle with a hashed name, and the URL in landing.js points to it.
 const worker=await bundle(join(root,BUNDLE_DIR,'material-worker.js'));const workerName=`material-worker.${hash(worker)}.js`;writeFileSync(join(out,BUNDLE_DIR,workerName),worker);
 const workerUrl=/\.\/material-worker\.js\?v=[\w.-]+/g;let js=await bundle(local(entry[1]));
 if(!js.match(workerUrl))throw new Error('build: URL del material worker non trovato nel bundle');js=js.replace(workerUrl,`./${workerName}`);
 const jsName=`${BUNDLE_DIR}/landing.${hash(js)}.js`;writeFileSync(join(out,jsName),js);
 // Every Human page gets the same bundles, with root-absolute paths.
 for(const p of BUNDLED_PAGES){let page=readFileSync(join(out,p),'utf8');
  [...page.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].forEach((m,i)=>{page=page.replace(m[0],i===0?`<link rel="stylesheet" href="/${cssName}">`:'');});
  page=page.replace(/<script type="module" src="[^"]+"><\/script>/,`<script type="module" src="/${jsName}"></script>`).replace(/<link rel="modulepreload" href="[^"]+">/g,'');
  writeFileSync(join(out,p),page);}
 // CSP: the hashes follow the inline scripts of the pages as published. Only the generated block of _headers changes; the cache rules stay as written.
 const html=new Map(walk(out).filter(f=>f.endsWith('.html')).map(f=>[rel(out,f),readFileSync(f,'utf8')]));
 const headers=readFileSync(join(out,'_headers'),'utf8').replace(/\r\n/g,'\n'),a=headers.indexOf(HM),b=headers.indexOf(HE);
 if(a<0||b<a)throw new Error('build: blocco generato di _headers non trovato');
 // The notes that name the generator are for the repository, not for dist/.
 const dropNote=t=>t.split('\n').filter(l=>!l.includes('tools/export.mjs')).join('\n');
 writeFileSync(join(out,'_headers'),dropNote(headers.slice(0,a)+headersBlock(securityBlock(html))+headers.slice(b+HE.length).replace(/^\n/,'')));
 writeFileSync(join(out,'_redirects'),dropNote(readFileSync(join(out,'_redirects'),'utf8')));
 return {css:cssName,js:jsName,worker:`${BUNDLE_DIR}/${workerName}`,stylesheets:links.length,cssBytes:css.length,jsBytes:js.length,pages:HUMAN_PAGES};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const r=await buildSite(process.argv[2]?resolve(process.argv[2]):undefined);console.log(`dist/: ${r.stylesheets} fogli di stile -> ${r.css} (${r.cssBytes} B), landing -> ${r.js} (${r.jsBytes} B), worker -> ${r.worker}`);}
