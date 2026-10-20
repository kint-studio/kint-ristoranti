import {FormationEngine} from './formation-engine.js?v=r5-1';
export {FORMATION_DONE_MS} from './formation-engine.js?v=r5-1';
// Variant of the main site's scene-engine.js for the fork. What differs from the main site's version: with grounded false (an object fading out at the bottom) there is no floor, plane or contact shadow, and the foot is not measured; when it is measured, a thumbnail of at most 256 px is enough.
export const lightDrift=(time,w,reduced)=>reduced?0:Math.round(Math.sin(time/18000)*w*.018*2)/2;
// A quiet, physical setting; approved pointer fluid and depth remain in TrailEngine.
export class SceneEngine extends FormationEngine {
 constructor(options){super(options);this.reduced=options.reduced||false;}
 drawBackground(time=0){const ctx=this.surfaces.background.getContext('2d'),r=this.rect;if(this.grounded&&!this.footRatio){const c=this.make();c.width=Math.min(this.base.width,256);c.height=Math.round(c.width*this.base.height/this.base.width);const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(this.base,0,0,c.width,c.height);const p=x.getImageData(0,0,c.width,c.height).data;let bottom=c.height-1;outer:for(;bottom>0;bottom--)for(let col=0;col<c.width;col++)if(p[(bottom*c.width+col)*4+3]>128)break outer;this.footRatio=(bottom+1)/c.height;}
 const floor=r.y+r.h*this.footRatio,cx=r.x+r.w/2;this.floor=floor;const drift=lightDrift(time,this.w,this.reduced);this.drift=drift;this.backgroundVersion=(this.backgroundVersion||0)+1;
 const base=ctx.createLinearGradient(0,0,0,this.h);base.addColorStop(0,'#f4f1e9');base.addColorStop(.60,'#f0ede5');base.addColorStop(1,'#e5e1d7');ctx.fillStyle=base;ctx.fillRect(0,0,this.w,this.h);
 const light=ctx.createRadialGradient(this.w*.36+drift,this.h*.32,0,this.w*.36+drift,this.h*.32,this.w*.75);light.addColorStop(0,'rgba(255,254,248,.72)');light.addColorStop(1,'rgba(255,254,248,0)');ctx.fillStyle=light;ctx.fillRect(0,0,this.w,this.h);
 if(!this.grain){this.grain=this.make();this.grain.width=this.grain.height=150;const g=this.grain.getContext('2d'),p=g.createImageData(150,150);let seed=71;for(let i=0;i<p.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;p.data[i]=p.data[i+1]=p.data[i+2]=40;p.data[i+3]=seed%7;}g.putImageData(p,0,0);}ctx.fillStyle=ctx.createPattern(this.grain,'repeat');ctx.fillRect(0,0,this.w,this.h);
 if(!this.grounded)return;
 // A continuous matte plane. Directional and contact shadows provide depth.
 const plane=ctx.createLinearGradient(0,floor-50,0,this.h);plane.addColorStop(0,'rgba(221,217,206,0)');plane.addColorStop(.45,'rgba(221,217,206,.25)');plane.addColorStop(1,'rgba(216,212,200,.45)');ctx.fillStyle=plane;ctx.fillRect(0,floor-50,this.w,this.h-floor+50);
 const shadow=(x,y,rx,ry,alpha)=>{ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,`rgba(35,30,23,${alpha})`);g.addColorStop(.35,`rgba(35,30,23,${alpha*.55})`);g.addColorStop(1,'rgba(35,30,23,0)');ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();};
 shadow(cx+r.w*.13,floor+9,r.w*.55,Math.max(10,r.w*.050),.12);
 shadow(cx,floor+1,r.w*.23,Math.max(3.5,r.w*.012),.30);
 shadow(cx,floor-.4,r.w*.17,Math.max(2,r.w*.006),.42);

 }
 frame(time,full=0){if(!this.reduced&&lightDrift(time,this.w,false)!==this.drift)this.drawBackground(time);super.frame(time,full);}
 forceRedraw(){this.drift=undefined;this.invalidate();}
}
