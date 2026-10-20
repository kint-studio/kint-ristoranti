import {makeDepth as makeRowDepth,drawDepth} from '../depth-surface.js?v=rt-7';
export {drawDepth};
// Variant of the main site's makeDepth for a thin object. Same GPU program and same 2D fallback; only the relief texture differs: style {kind:'lineare',gain,cap} rises with the distance from the silhouette edge (gain times, capped at cap image widths), blurred 3x3. The main site's per-row dome made the thin tines far too thick, and they tore when the fork turned.
// The relief is computed and uploaded over the main site's texture the first time the program is prepared (only a tilt needs it).
export function makeDepth(base,createCanvas,style){const depth=makeRowDepth(base,createCanvas);if(style?.kind!=='lineare')return depth;const prepare=depth.prepare;
 depth.prepare=()=>{const fresh=depth.gpu===undefined,gpu=prepare();if(fresh&&gpu){const {w,h,data}=linearRelief(base,createCanvas,style),gl=gpu.gl;gl.activeTexture(gl.TEXTURE1);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);gl.texImage2D(gl.TEXTURE_2D,0,gl.R8,w,h,0,gl.RED,gl.UNSIGNED_BYTE,data);}return gpu;};
 return depth;}
export function linearRelief(base,createCanvas,{gain,cap}){const w=Math.min(512,base.width),h=Math.round(w*base.height/base.width),c=createCanvas();c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(base,0,0,w,h);const {data}=x.getImageData(0,0,w,h),n=w*h;
 const inside=new Uint8Array(n),dist=new Float32Array(n),BIG=1e6;for(let i=0;i<n;i++){inside[i]=data[i*4+3]>100?1:0;dist[i]=inside[i]?BIG:0;}
 // Two-pass chamfer distance from the edge.
 const at=(xx,yy)=>xx<0||yy<0||xx>=w||yy>=h?0:dist[yy*w+xx];
 for(let y=0;y<h;y++)for(let px=0;px<w;px++){const i=y*w+px;if(dist[i])dist[i]=Math.min(dist[i],at(px-1,y)+1,at(px,y-1)+1,at(px-1,y-1)+1.414,at(px+1,y-1)+1.414);}
 for(let y=h-1;y>=0;y--)for(let px=w-1;px>=0;px--){const i=y*w+px;if(dist[i])dist[i]=Math.min(dist[i],at(px+1,y)+1,at(px,y+1)+1,at(px+1,y+1)+1.414,at(px-1,y+1)+1.414);}
 const raw=new Float32Array(n);for(let i=0;i<n;i++)if(inside[i])raw[i]=Math.min(dist[i]*gain,cap*w)/w*.7/.36*255;
 // A 3x3 blur removes the ridges where opposite edges meet.
 const out=new Uint8Array(n);for(let y=0;y<h;y++)for(let px=0;px<w;px++){const i=y*w+px;if(!inside[i])continue;let sum=0,k=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=px+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h||!inside[yy*w+xx])continue;sum+=raw[yy*w+xx];k++;}out[i]=Math.min(255,sum/k);}
 return {w,h,data:out};}
