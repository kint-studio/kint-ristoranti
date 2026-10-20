import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readdirSync,readFileSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const mine=fileURLToPath(new URL('../assets/',import.meta.url));
const main=fileURLToPath(new URL('../../KINT-codice-completo/assets/',import.meta.url));
const norm=b=>b.toString('latin1').replace(/\r\n/g,'\n');
test('i file condivisi in assets/ sono identici a quelli del sito principale',t=>{
 if(!existsSync(main))return t.skip('sito principale non trovato');
 const diff=[];let n=0;
 for(const f of readdirSync(mine)){
  if(f==='ristoranti'||statSync(mine+f).isDirectory()||!existsSync(main+f))continue;
  n++;if(norm(readFileSync(mine+f))!==norm(readFileSync(main+f)))diff.push(f);
 }
 assert.deepEqual(diff,[]);
 assert.ok(n>0,'nessun file condiviso trovato');
});
