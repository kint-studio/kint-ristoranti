// Computes the gold material off the main thread (see loadMaterial in material.js).
// Variant of the main site's material-worker.js: imports the fork's material.js and passes its satin option.
import {materialJob} from './material.js?v=r5-1';
self.onmessage=async({data})=>{try{const gold=await createImageBitmap(await (await fetch(data.url)).blob());const job=materialJob(gold,()=>new OffscreenCanvas(1,1),data.satin);job.step(Infinity);const bitmap=job.canvas.transferToImageBitmap();self.postMessage({bitmap},[bitmap]);}catch(error){self.postMessage({error:String(error?.message||error)});}};
