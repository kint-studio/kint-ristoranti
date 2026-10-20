import {IdleCursor} from '../idle-cursor.js?v=36';
import {loadMaterial as loadSatinMaterial} from './material.js?v=r5-1';
import {loadFork3D as loadFork} from './fork-3d.js?v=r5-1';
import {FORK_IMAGES} from './fork-images.js?v=r5-1';
import {ForkScene,FORMATION_DONE_MS,layout,goldImageUrl} from './fork-scene.js?v=r5-1';
const decoded=async src=>{const image=new Image();image.src=src;await image.decode();return image;};
// The hero scene: the fork forms from binary digits, then becomes a 3D object that turns towards the pointer. Starts at 35% visibility; draws nothing off screen or in a hidden tab (the loop stops itself, like frame() in the main site's app.js); 4 frames per second when still.
// Without WebGL2 it falls back to the photo with relief, with the silver material computed in a worker. If anything fails, the scene layer is hidden and the hero keeps its text on the plain section background.
// Every browser dependency can be injected for the tests.
export function startHero(root,{matchMedia=q=>globalThis.matchMedia(q),IntersectionObserver=globalThis.IntersectionObserver,ResizeObserver=globalThis.ResizeObserver,document=globalThis.document,window=globalThis,loadImage=decoded,createCanvas=()=>document.createElement('canvas'),loadFork3D=loadFork,loadMaterial=loadSatinMaterial,Engine=ForkScene,raf=cb=>globalThis.requestAnimationFrame(cb),now=()=>performance.now(),dpr}={}){
 const ratio=()=>dpr??globalThis.devicePixelRatio??1,canvas=root.querySelector('canvas'),cursor=root.querySelector('.kf-cursor'),section=root.parentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,touch=matchMedia('(hover: none)').matches,idle=new IdleCursor(),cleanups=[];
 let alive=true,engine=null,visible=false,pageVisible=!document.hidden,running=false,last=0,activeUntil=0,lastDraw=-Infinity;
 const listen=(target,type,fn,options)=>{target.addEventListener(type,fn,options);cleanups.push(()=>target.removeEventListener(type,fn,options));};
 // Still (formation over, no pointer, no gesture): no need for 60 fps, 4 frames per second keep the light of the background moving.
 const keepActive=(t=now())=>{activeUntil=Math.max(activeUntil,t+1800);};
 const frame=time=>{if(!alive||!visible||!pageVisible){running=false;idle.suspend();last=0;return;}raf(frame);
  const dt=last?Math.min((time-last)/1000,.05):0;last=time;engine.advance(dt);
  const auto=idle.step(dt,!reduced&&engine.done);
  if(auto){// the idle cursor travels over the object, not the whole section
   const r=engine.rect;engine.addPointer(r.x+(auto.x+1)/2*r.w,r.y+(1-auto.y)/2*r.h,time);
   // no mouse on a phone: the fork turns slowly by itself, along the same path as the reveal
   if(touch)engine.setPose(auto.x*.32,auto.y*.2);
   cursor.style.opacity='0';keepActive(time);}
  if(!engine.done)keepActive(time);
  if(time>activeUntil&&time-lastDraw<250)return;
  lastDraw=time;engine.frame(time,0);};
 const resume=()=>{if(alive&&engine&&!running&&visible&&pageVisible){running=true;last=0;raf(frame);}};
 const fail=()=>{root.hidden=true;canvas.hidden=true;return null;};
 const ready=(async()=>{
  const box=root.getBoundingClientRect(),goldUrl=goldImageUrl(layout(box.width,box.height).w,{touch,dpr:ratio()});
  // The fork is not a photo: the GPU draws it from two small textures, and the silhouette image only draws the digits (the smallest is enough).
  const [base,fork3d]=await Promise.all([loadImage(FORK_IMAGES.ceramic640),loadFork3D({a:FORK_IMAGES.a,b:FORK_IMAGES.b},createCanvas)]);
  if(!alive)return null;
  engine=new Engine({canvas,createCanvas,base,width:box.width,height:box.height,dpr:ratio(),reduced,touch,fork3d:fork3d||null});
  // Without WebGL2 the material under the reveal is computed in a worker, so the page never blocks; the fork stays satin silver there too.
  if(!fork3d)loadMaterial(goldUrl,{workerUrl:new URL('./material-worker.js?v=r5-1',import.meta.url),load:loadImage,make:createCanvas,satin:true}).then(tech=>{if(alive&&tech)engine.setTech(tech);},()=>{});
  // Every real gesture stops the idle cursor.
  const cancelIdle=()=>{if(idle.activity()&&engine.flow){engine.flow.pointer=null;engine.flow.old=null;}};
  const pointer=e=>{if(!engine.done||e.target?.closest?.('a,button,input,textarea,summary'))return;keepActive();const r=root.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;
   if(!reduced)engine.setPointer(e.clientX-r.left,e.clientY-r.top);
   const t=now(),points=e.getCoalescedEvents?.()||[e];for(const p of points.length?points:[e])engine.addPointer(p.clientX-r.left,p.clientY-r.top,t);
   cursor.style.left=`${e.clientX-r.left}px`;cursor.style.top=`${e.clientY-r.top}px`;cursor.style.opacity=e.pointerType==='mouse'?'1':'0';};
  listen(window,'pointermove',cancelIdle,{capture:true,passive:true});listen(window,'pointerdown',cancelIdle,{capture:true,passive:true});listen(window,'pointermove',pointer,{capture:true,passive:true});
  if(section)listen(section,'pointerleave',()=>{cursor.style.opacity='0';engine.resetPointer();});
  const ro=new ResizeObserver(()=>{const r=root.getBoundingClientRect();if(Math.abs(engine.w-r.width)>1||Math.abs(engine.h-r.height)>1){engine.resize(r.width,r.height,ratio());keepActive();}});ro.observe(root);
  const io=new IntersectionObserver(entries=>{const entry=entries[entries.length-1];visible=entry.isIntersecting;last=0;
   if(entry.intersectionRatio>=.35&&!engine.started){engine.start();if(reduced)engine.elapsed=FORMATION_DONE_MS;}resume();},{threshold:[0,.35]});io.observe(root);
  listen(document,'visibilitychange',()=>{pageVisible=!document.hidden;last=0;keepActive();resume();});
  cleanups.push(()=>{ro.disconnect();io.disconnect();});
  return engine;})().catch(fail);
 return {ready,get engine(){return engine;},stop(){alive=false;cleanups.forEach(c=>c());}};}
