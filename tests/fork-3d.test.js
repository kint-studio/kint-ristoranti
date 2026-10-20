import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadFork3DWorker} from '../assets/ristoranti/fork-3d.js';
// La forchetta GPU disegnata nel worker: finti Worker, OffscreenCanvas e createImageBitmap. Il finto worker risponde solo quando il test lo chiede (reply).
const flush=()=>new Promise(r=>setTimeout(r,0));
function fakes({fail=false}={}){
 const sent=[],workers=[];let closed=0;
 const bitmap=n=>({n,close(){closed++;}});
 class FakeWorker{constructor(url,o){this.url=url;this.o=o;this.terminated=false;workers.push(this);}
  postMessage(data){sent.push(data);if(data.a)queueMicrotask(()=>this.onmessage({data:fail?{error:'WebGL2 unavailable in the worker'}:{ready:true}}));}
  terminate(){this.terminated=true;}}
 const reply=(i=0)=>{const data=sent.filter(m=>'slot' in m)[i];workers[0].onmessage({data:{slot:data.slot,bitmap:bitmap(data)}});};
 globalThis.Worker=FakeWorker;globalThis.OffscreenCanvas=class{};globalThis.createImageBitmap=async(img,o)=>({img,o,close(){}});
 return {sent,workers,reply,get closed(){return closed;},requests:()=>sent.filter(m=>'slot' in m)};}
const reset=()=>{delete globalThis.Worker;delete globalThis.OffscreenCanvas;delete globalThis.createImageBitmap;};
const ctx=(scale=1)=>{const drawn=[];return {drawn,getTransform:()=>({a:scale}),drawImage:(...a)=>drawn.push(a)};};
const urls={a:'/a.webp',b:'/b.webp'},load=async src=>({src});
test('worker: senza Worker o OffscreenCanvas risolve null (si disegna sulla pagina)',async()=>{
 reset();assert.equal(await loadFork3DWorker(urls,{workerUrl:'w.js',size:()=>[10,20],load}),null);});
test('worker: risolve solo con la forchetta a riposo pronta, con e senza venature, alla misura data',async()=>{
 const f=fakes();try{
  let fork=null;const p=loadFork3DWorker(urls,{workerUrl:'w.js',size:()=>[445,668],load}).then(x=>fork=x);
  await flush();await flush();
  assert.equal(f.workers[0].o.type,'module');
  const init=f.sent[0];assert.equal(init.a.o.premultiplyAlpha,'none');assert.equal(init.a.o.colorSpaceConversion,'none');assert.equal(init.a.img.src,'/a.webp');
  assert.deepEqual(f.requests().map(({slot,seams,w,h,yaw,pitch})=>({slot,seams,w,h,yaw,pitch})),[{slot:0,seams:false,w:445,h:668,yaw:0,pitch:0},{slot:1,seams:true,w:445,h:668,yaw:0,pitch:0}]);
  f.reply(0);await flush();assert.equal(fork,null,'manca ancora quella con le venature');
  f.reply(1);await p;assert.ok(fork);
  // il primo disegno usa subito l'immagine a riposo, senza nuove richieste
  const c=ctx();fork.draw(c,{x:5,y:6,w:445,h:668},0,0,false);fork.draw(c,{x:5,y:6,w:445,h:668},0,0,true);
  assert.equal(c.drawn.length,2);assert.deepEqual(c.drawn[0].slice(1),[5,6,445,668]);assert.equal(c.drawn[1][0].n.seams,true);assert.equal(f.requests().length,2);
 }finally{reset();}});
test('worker: una richiesta per volta, sempre l\'ultima posa, e onUpdate quando arriva un\'immagine nuova',async()=>{
 const f=fakes();try{
  const p=loadFork3DWorker(urls,{workerUrl:'w.js',size:()=>[100,150],load});await flush();await flush();f.reply(0);f.reply(1);const fork=await p;
  let updates=0;fork.onUpdate=()=>updates++;const rect={x:0,y:0,w:50,h:75},c=ctx(2);
  fork.draw(c,rect,.1,0,false);fork.draw(c,rect,.2,0,false);fork.draw(c,rect,.3,-.1,false);
  // la posa .1 è in volo; le altre aspettano e vince l'ultima
  assert.deepEqual(f.requests().slice(2).map(r=>[r.slot,r.w,r.h,r.yaw]),[[0,100,150,.1]]);
  assert.equal(c.drawn.length,3,'intanto mostra l\'immagine precedente');
  f.reply(2);assert.equal(updates,1);assert.deepEqual(f.requests().slice(3).map(r=>[r.yaw,r.pitch]),[[.3,-.1]]);assert.equal(f.closed,1,'immagine vecchia liberata');
  f.reply(3);assert.equal(updates,2);fork.draw(c,rect,.3,-.1,false);assert.equal(c.drawn.at(-1)[0].n.yaw,.3);assert.equal(f.requests().length,4,'già aggiornata: nessuna richiesta');
  fork.destroy();assert.equal(f.workers[0].terminated,true);
 }finally{reset();}});
test('worker: se il worker non ha WebGL2 risolve null e lo chiude',async()=>{
 const f=fakes({fail:true});const warn=console.warn;console.warn=()=>{};try{
  assert.equal(await loadFork3DWorker(urls,{workerUrl:'w.js',size:()=>[10,20],load}),null);assert.equal(f.workers[0].terminated,true);
 }finally{console.warn=warn;reset();}});
test('worker: se il worker non risponde entro il tempo massimo risolve null',async()=>{
 const f=fakes();f.workers.length=0;const warn=console.warn;console.warn=()=>{};try{
  globalThis.Worker=class{constructor(){f.workers.push(this);}postMessage(){}terminate(){this.terminated=true;}};
  assert.equal(await loadFork3DWorker(urls,{workerUrl:'w.js',size:()=>[10,20],load,timeout:20}),null);assert.equal(f.workers[0].terminated,true);
 }finally{console.warn=warn;reset();}});
