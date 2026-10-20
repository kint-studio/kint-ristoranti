import {test} from 'node:test';
import assert from 'node:assert/strict';
import {startHero} from '../assets/ristoranti/hero.js';
import {ForkScene,FORMATION_DONE_MS} from '../assets/ristoranti/fork-scene.js';
// Un finto contesto 2D: ogni metodo non fa nulla, le letture di pixel restituiscono pixel vuoti.
const pixels=(...a)=>({data:new Uint8ClampedArray(Math.max(1,(a.at(-2)|0)*(a.at(-1)|0))*4)});
function context(){const own={getImageData:pixels,createImageData:pixels,getTransform:()=>({a:1}),measureText:()=>({width:5})};
 return new Proxy(own,{get:(t,k)=>k in t?t[k]:()=>({addColorStop(){}}),set:(t,k,v)=>{t[k]=v;return true;}});}
const canvas=()=>{const ctx=context();return {width:300,height:150,hidden:false,style:{},getContext:type=>type==='2d'?ctx:null};};
const events=()=>{const map=new Map();return {addEventListener:(t,f)=>map.set(t,[...(map.get(t)||[]),f]),removeEventListener:(t,f)=>map.set(t,(map.get(t)||[]).filter(g=>g!==f)),emit:(t,e)=>(map.get(t)||[]).forEach(f=>f(e))};};
const flush=()=>new Promise(r=>setTimeout(r,0));
function setup({reduced=false,touch=false,hidden=false,fork=null,loadImage}={}){
 const view=canvas(),ring={style:{}},section=events();
 const root={...events(),parentElement:section,querySelector:s=>s==='canvas'?view:s==='.kf-cursor'?ring:null,getBoundingClientRect:()=>({left:0,top:0,right:1440,bottom:900,width:1440,height:900})};
 const doc={...events(),hidden},win=events();
 let observer;const IO=class{constructor(cb){this.cb=cb;observer=this;}observe(){}disconnect(){}};
 const RO=class{observe(){}disconnect(){}};
 let queue=[],clock=0;const raf=cb=>{queue.push(cb);};
 // un secondo simulato: 60 fotogrammi da 16,7 ms
 const run=(frames=60)=>{for(let i=0;i<frames;i++){clock+=1000/60;const q=queue;queue=[];q.forEach(cb=>cb(clock));}};
 const frames={n:0},engines=[];
 const Engine=class extends ForkScene{constructor(o){super(o);engines.push(this);}frame(...a){frames.n++;return super.frame(...a);}};
 const material=[];
 const hero=startHero(root,{
  matchMedia:q=>({matches:(q.includes('reduce')&&reduced)||(q.includes('hover: none')&&touch)}),
  IntersectionObserver:IO,ResizeObserver:RO,document:doc,window:win,dpr:1,raf,now:()=>clock,Engine,
  loadImage:loadImage||(async()=>({width:640,height:960})),createCanvas:canvas,
  loadFork3D:async()=>fork,loadMaterial:(url,o)=>{material.push({url,o});return Promise.resolve({width:1024,height:1536});}});
 const intersect=ratio=>observer.cb([{isIntersecting:ratio>0,intersectionRatio:ratio}]);
 return {hero,root,view,ring,doc,win,run,frames,engines,material,intersect,get queued(){return queue.length;}};}
const fork3d=()=>{const calls=[];return {calls,draw:(...a)=>calls.push(a)};};

test('(a) hero non visibile: nessun engine.frame in 1 s',async()=>{
 const s=setup({fork:fork3d()});await s.hero.ready;s.intersect(0);s.run();
 assert.equal(s.engines.length,1);assert.equal(s.frames.n,0);assert.equal(s.queued,0,'nessun rAF in coda');});
test('(b) scheda nascosta: nessun engine.frame in 1 s',async()=>{
 const s=setup({hidden:true,fork:fork3d()});await s.hero.ready;s.intersect(1);s.run();
 assert.equal(s.frames.n,0);assert.equal(s.queued,0);
 // tornando visibile la scena riparte, e si ferma di nuovo uscendo dallo schermo
 s.doc.hidden=false;s.doc.emit('visibilitychange');s.run();assert.ok(s.frames.n>0);
 s.intersect(0);const n=s.frames.n;s.run();assert.equal(s.frames.n,n);});
test('(c) riduci movimento: formazione completa all\'avvio',async()=>{
 const s=setup({reduced:true,fork:fork3d()});const engine=await s.hero.ready;s.intersect(.5);
 assert.equal(engine.started,true);assert.equal(engine.elapsed,FORMATION_DONE_MS);
 s.run(2);assert.equal(engine.done,true);});
test('(c2) senza riduci movimento la formazione dura FORMATION_DONE_MS',async()=>{
 const s=setup({fork:fork3d()});const engine=await s.hero.ready;s.intersect(.2);assert.equal(engine.started,false,'sotto il 35% non parte');
 s.intersect(.5);assert.equal(engine.elapsed,0);s.run(60);assert.equal(engine.done,false);s.run(120);assert.equal(engine.done,true);});
test('(d) senza WebGL2 (loadFork3D null): foto in rilievo e materiale nel worker, senza eccezioni',async()=>{
 const s=setup({fork:null});const engine=await s.hero.ready;
 assert.equal(engine.fork3d,null);
 assert.equal(s.material.length,1);assert.match(s.material[0].url,/forchetta3-kintsugi(-640|-1024)?\.webp$/);
 assert.match(String(s.material[0].o.workerUrl),/\/assets\/ristoranti\/material-worker\.js\?v=[\w.-]+$/);
 await flush();assert.ok(engine.tech,'il materiale arriva alla scena');
 s.intersect(1);s.run(200);assert.equal(engine.done,true);
 s.win.emit('pointermove',{clientX:900,clientY:300,pointerType:'mouse',target:{}});s.run(10);
 assert.ok(s.frames.n>0);assert.equal(s.view.hidden,false);});
test('(d2) con la forchetta 3D: niente materiale, la GPU disegna e la posa segue il cursore',async()=>{
 const f=fork3d(),s=setup({fork:f});const engine=await s.hero.ready;assert.equal(s.material.length,0);
 s.intersect(1);s.run(200);const before=f.calls.length;
 s.win.emit('pointermove',{clientX:1400,clientY:100,pointerType:'mouse',target:{}});s.run(30);
 assert.ok(f.calls.length>before);assert.ok(engine.pose.yaw>0.1&&engine.pose.pitch<-0.05,`posa ${JSON.stringify(engine.pose)}`);
 assert.equal(s.ring.style.opacity,'1');});
test('(d3) telefono: dopo l\'attesa il cursore automatico gira la forchetta',async()=>{
 const s=setup({touch:true,fork:fork3d()});const engine=await s.hero.ready;s.intersect(1);s.run(200);
 assert.deepEqual(engine.targetPose,{yaw:0,pitch:0});s.run(200);
 assert.notDeepEqual(engine.targetPose,{yaw:0,pitch:0});});
test('(e) immagine che non si carica: startHero non lancia e la scena sparisce',async()=>{
 let s;assert.doesNotThrow(()=>{s=setup({fork:fork3d(),loadImage:()=>Promise.reject(new Error('404'))});});
 assert.equal(await s.hero.ready,null);assert.equal(s.engines.length,0);assert.equal(s.view.hidden,true);assert.equal(s.root.hidden,true,'resta solo il fondo della sezione, come prima');
 s.run();assert.equal(s.frames.n,0);});
test('stop(): la scena si ferma',async()=>{
 const s=setup({fork:fork3d()});await s.hero.ready;s.intersect(1);s.run(5);s.hero.stop();const n=s.frames.n;s.run();assert.equal(s.frames.n,n);});
