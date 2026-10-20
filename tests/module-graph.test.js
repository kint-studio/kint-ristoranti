import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join,posix} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>readFileSync(join(root,p),'utf8');
// Graph nodes are paths under assets/ with their ?v= query, resolved from each module's own imports.
const importsOf=spec=>{const file=spec.split('?')[0],dir=posix.dirname(file);return [...read('assets/'+file).matchAll(/from\s*'(\.{1,2}\/[^']+)'/g)].map(m=>posix.normalize(posix.join(dir,m[1])));};
const html=read('ristoranti/index.html');
function graph(){const entry=html.match(/<script type="module" src="\/assets\/([^"]+)"/)[1],seen=new Set(),queue=[entry];while(queue.length){const spec=queue.shift();if(seen.has(spec))continue;seen.add(spec);queue.push(...importsOf(spec));}return seen;}
test('ogni modulo del grafo ha una sola versione',()=>{const versions=new Map();for(const spec of graph()){const [name,q]=spec.split('?');versions.set(name,(versions.get(name)||new Set()).add(q));}for(const [name,qs] of versions)assert.equal(qs.size,1,`${name}: ${[...qs].join(', ')}`);});
test('ristoranti/index.html precarica esattamente il grafo dei moduli',()=>{const preloads=new Set([...html.matchAll(/<link rel="modulepreload" href="\/assets\/([^"]+)"/g)].map(m=>m[1]));assert.deepEqual([...preloads].sort(),[...graph()].sort());});
test('il grafo parte da assets/ristoranti/landing.js',()=>{assert.match(html,/<script type="module" src="\/assets\/ristoranti\/landing\.js\?v=[\w.-]+"><\/script>/);});
