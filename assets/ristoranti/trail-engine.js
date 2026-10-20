import {FluidField} from '../fluid-field.js?v=ui-7';
import {makeDepth,drawDepth} from './depth-surface.js?v=r5-1';
// Variant of the main site's trail-engine.js for the fork. What differs from the main site's version:
// - options maxDpr (main: 1.5 fixed), layout(w,h) for the object rect (main: the vase rect), depthStyle, grounded and fork3d;
// - with fork3d the GPU draws the object (fork-3d.js) instead of drawDepth, and the relief is not built at all;
// - the object turns towards the pointer by about 20 degrees horizontally and 10 vertically (main: .075/.035 rad), easing at 3.4/s (main 2.8).
// Deterministic Canvas compositor. Pointer-driven reveal works without WebGL.
export class TrailEngine {
 constructor({canvas,createCanvas,base,gold=null,tech=null,footRatio,width,height,dpr=1,maxDpr=1.5,layout,grounded=true,depthStyle,fork3d=null}){this.canvas=canvas;this.make=createCanvas;this.base=base;this.gold=gold;this.footRatio=footRatio;this.maxDpr=maxDpr;this.layout=layout;this.grounded=grounded!==false;this.fork3d=fork3d||null;this.points=[];this.pose={yaw:0,pitch:0};this.targetPose={yaw:0,pitch:0};this.depth=this.fork3d?null:makeDepth(base,createCanvas,depthStyle);this.surfaces={background:this.make(),mask:this.make(),wash:this.make(),reveal:this.make(),warpedBase:this.make(),warpedTech:this.make()};this.tech=tech||null;this.previousTime=0;this.resize(width,height,dpr);}
 setTech(image){this.tech=image;this.cachedPose=null;this.dirty=true;}
 invalidate(){this.dirty=true;}
 resize(w,h,dpr=1){this.w=w;this.h=h;this.dpr=Math.min(dpr,this.maxDpr);for(const c of [this.canvas,...Object.values(this.surfaces)]){c.width=Math.round(w*this.dpr);c.height=Math.round(h*this.dpr);c.getContext('2d').setTransform(this.dpr,0,0,this.dpr,0,0);}this.rect=this.layout(w,h);this.points=[];this.flow=new FluidField({width:w,height:h,createCanvas:this.make});this.cachedPose=null;this.dirty=true;this.drawBackground();}
 drawBackground(){this.backgroundVersion=(this.backgroundVersion||0)+1;const x=this.surfaces.background.getContext('2d');x.fillStyle='#f8f8f3';x.fillRect(0,0,this.w,this.h);x.strokeStyle='#e1e2d7';x.lineWidth=.7;for(let i=-8;i<15;i++){x.beginPath();for(let y=-50;y<this.h+50;y+=8){const xx=this.w*.5+i*115+Math.sin(y*.006+i*1.3)*110+Math.sin(y*.012+i)*45;if(y===-50)x.moveTo(xx,y);else x.lineTo(xx,y);}x.stroke();}}
 setPointer(x,y){this.targetPose.yaw=(x/this.w*2-1)*.35;this.targetPose.pitch=(y/this.h*2-1)*.18;}
 resetPointer(){this.targetPose={yaw:0,pitch:0};}
 addPointer(x,y,time){this.flow.input(x,y,time);this.points.push({x,y,time});if(this.points.length>120)this.points.shift();}

 frame(time,full=0){const out=this.canvas.getContext('2d');this.points=this.points.filter(p=>time-p.time<620);const maskChanged=this.flow.paint(this.surfaces.mask.getContext('2d'),time);

 const dt=this.previousTime?Math.min((time-this.previousTime)/1000,.05):.016;this.previousTime=time;const ease=1-Math.exp(-dt*3.4);this.pose.yaw+=(this.targetPose.yaw-this.pose.yaw)*ease;this.pose.pitch+=(this.targetPose.pitch-this.pose.pitch)*ease;
 let poseChanged=false;if(!this.cachedPose||Math.abs(this.pose.yaw-this.cachedPose.yaw)+Math.abs(this.pose.pitch-this.cachedPose.pitch)>.0001){const fork=this.fork3d;for(const [name,image] of [['warpedBase',this.base],['warpedTech',this.tech]]){const c=this.surfaces[name].getContext('2d');c.clearRect(0,0,this.w,this.h);if(fork)fork.draw(c,this.rect,this.pose.yaw,this.pose.pitch,name==='warpedTech');else if(image)drawDepth(c,image,this.rect,this.depth,this.pose.yaw,this.pose.pitch);}this.cachedPose={...this.pose};poseChanged=true;}
 // Nothing that feeds the composition changed: the output canvas already holds this frame.
 const key=`${this.backgroundVersion}:${full}`;if(!maskChanged&&!poseChanged&&!this.dirty&&key===this.composedKey)return;this.dirty=false;this.composedKey=key;for(const name of ['wash','reveal'])this.surfaces[name].getContext('2d').clearRect(0,0,this.w,this.h);

 out.drawImage(this.surfaces.background,0,0,this.w,this.h);
 const wash=this.surfaces.wash.getContext('2d');wash.fillStyle='#e7e9df';wash.fillRect(0,0,this.w,this.h);wash.globalCompositeOperation='destination-in';wash.drawImage(this.surfaces.mask,0,0,this.w,this.h);wash.globalCompositeOperation='source-over';out.drawImage(this.surfaces.wash,0,0,this.w,this.h);
 out.drawImage(this.surfaces.warpedBase,0,0,this.w,this.h);
 const revealed=this.surfaces.reveal.getContext('2d');revealed.drawImage(this.surfaces.warpedTech,0,0,this.w,this.h);
if(full<.999){revealed.globalCompositeOperation='destination-in';revealed.drawImage(this.surfaces.mask,0,0,this.w,this.h);if(full>0){revealed.globalCompositeOperation='source-over';revealed.globalAlpha=full;revealed.drawImage(this.surfaces.warpedTech,0,0,this.w,this.h);revealed.globalAlpha=1;}revealed.globalCompositeOperation='source-over';}out.drawImage(this.surfaces.reveal,0,0,this.w,this.h);
 }
}
