import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const SKIP=/^(?:docs\/|tools\/perf\/|package-lock\.json$|\.baseline\/|\.superpowers\/|node_modules\/|tests\/paths\.test\.js$)/;
const BANNED=[/\bnext\.js\b/i,/\bnext\//i,/\breact\b/i,/\blenis\b/i,/\btailwind\b/i,/\/_next\//i,/workers\.dev/i,/edoardo/i];
const tracked=()=>execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8'}).split('\n').filter(f=>f&&!SKIP.test(f)&&existsSync(root+f));
test('nessun file tracciato nomina il vecchio stack, workers.dev o dati personali',()=>{
 const bad=[];
 for(const f of tracked()){const s=readFileSync(root+f);if(s.includes(0))continue;const t=s.toString('utf8');for(const re of BANNED)if(re.test(t))bad.push(`${f}: ${re}`);}
 assert.deepEqual(bad,[]);
});
test('package.json non ha dependencies',()=>{
 const p=JSON.parse(readFileSync(root+'package.json','utf8'));
 assert.equal(p.dependencies,undefined);
});
