// Draws the GPU fork of fork-3d.js off the main thread (see loadFork3DWorker): one image per requested pose, sent back as an ImageBitmap.
import {prepareFork} from './fork-3d.js?v=r8-1';
let canvas=null,render=null;
self.onmessage=async({data})=>{try{
 if(data.a){canvas=new OffscreenCanvas(2,2);const gl=canvas.getContext('webgl2',{alpha:true,antialias:false,premultipliedAlpha:true});if(!gl)throw new Error('WebGL2 unavailable in the worker');render=await prepareFork(gl,data.a,data.b);data.a.close();data.b.close();self.postMessage({ready:true});return;}
 if(canvas.width!==data.w||canvas.height!==data.h){canvas.width=data.w;canvas.height=data.h;}
 render(data.w,data.h,data.yaw,data.pitch,data.seams);const bitmap=canvas.transferToImageBitmap();self.postMessage({slot:data.slot,bitmap},[bitmap]);
}catch(error){self.postMessage({error:String(error?.message||error)});}};
