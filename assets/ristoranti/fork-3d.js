// The fork as a real 3D slab drawn by the GPU (WebGL2). Instead of warping a photo with a depth map (which tears at large angles), a ray is cast for every screen pixel and hits the rotated slab; two small textures describe the surface there:
//  a: R,G = smooth surface slope (normal), B = distance from the edge (negative inside the silhouette);
//  b: R = gold seam coverage, G = gold brightness.
// The metal is lit by the same "photo studio" the images were made with, computed here, so highlights really slide over the surface as it turns. At rest the result matches the photo.
// Scene units are those of the original 1024x1536 image; the fork is centred on (534, 768).
const IMG_W=1024,IMG_H=1536,CX=534,CY=768;
// Area covered by the two textures in object space (1 px = 1 unit).
const TEX_W=200,TEX_H=1424,U0=-100,V0=-712;
// Eye distance from the slab: far away, so the perspective stays gentle.
const EYE=3200;
const VERTEX=`#version 300 es
precision highp float;
out vec2 vUv;
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);vUv=vec2(p.x,1.0-p.y);gl_Position=vec4(p*2.0-1.0,0,1);}`;
const FRAGMENT=`#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D tA, tB;
uniform mat3 uR;
uniform float uSeams;
out vec4 color;
const vec2 IMG = vec2(${IMG_W}.0, ${IMG_H}.0);
const vec2 CEN = vec2(${CX}.0, ${CY}.0);
const vec2 TEX = vec2(${TEX_W}.0, ${TEX_H}.0);
const vec2 ORG = vec2(${U0}.0, ${V0}.0);
const float EYE = ${EYE}.0;
float boxLight(vec3 r, vec3 L, float wx, float wy){
  vec3 l = normalize(L);
  float along = dot(r, l);
  if (along <= 0.0) return 0.0;
  vec3 t = vec3(l.y, -l.x, 0.0);
  float tl = length(t.xy);
  if (tl == 0.0) tl = 1.0;
  t.xy /= tl;
  vec3 b = cross(l, t);
  float ax = dot(r, t) / along, ay = dot(r, b) / along;
  return 1.0 - smoothstep(0.82, 1.18, max(abs(ax) / wx, abs(ay) / wy));
}
// studio light: soft front panel, large panel top left, strip on the right, ceiling, floor
float steelEnv(vec3 r, float turned){
  float e = 0.24 + 0.18 * smoothstep(-0.4, 0.9, -r.y);
  e += 0.42 * boxLight(r, vec3(0.0, 0.0, 1.0), 0.6, 0.6);
  e += 1.9 * boxLight(r, vec3(-0.5, -0.62, 0.6), 0.46, 0.34);
  e += 1.5 * boxLight(r, vec3(0.78, -0.08, 0.62), 0.1, 0.9);
  e *= 1.0 - 0.55 * boxLight(r, vec3(-0.86, 0.1, 0.5), 0.3, 1.3);
  e += 0.35 * boxLight(r, vec3(0.05, -0.95, 0.3), 0.5, 0.25);
  e *= 1.0 - 0.5 * smoothstep(0.3, 0.95, r.y);
  // panels lit only for off-axis reflections (invisible at rest): a tilted fork never turns flat grey
  float tilt = smoothstep(0.28, 0.62, 1.0 - r.z);
  e += tilt * (0.75 * boxLight(r, vec3(0.62, -0.62, 0.48), 0.55, 0.45)
             + 0.55 * boxLight(r, vec3(-0.66, 0.5, 0.55), 0.6, 0.5)
             + 0.45 * boxLight(r, vec3(0.05, 0.85, 0.5), 0.9, 0.5));
  // a broad gradient following the reflection makes light slide over the flat head while turning (turned is 0 at rest)
  e += turned * (0.55 * r.x - 0.3 * r.y);
  return max(e, 0.05);
}
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main(){
  vec2 P = vec2(vUv.x * IMG.x, vUv.y * IMG.y);
  vec3 eye = vec3(CEN, EYE), dir = vec3(P, 0.0) - eye;
  vec3 N = uR[2];
  float t = dot(N, vec3(CEN, 0.0) - eye) / dot(N, dir);
  vec3 H = eye + t * dir;
  vec3 loc = transpose(uR) * (H - vec3(CEN, 0.0));
  vec2 uv = (loc.xy - ORG) / TEX;
  vec2 cu = clamp(uv, 0.0, 1.0), px = 1.0 / TEX;
  vec4 a = texture(tA, cu);
  vec4 b = texture(tB, cu);
  // coverage and edge bevel at screen scale, so the dark edge line stays continuous at any size
  float sd = (a.b * 2.0 - 1.0) * 16.0;
  bool inside = uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0;
  float fw = max(fwidth(sd), 0.0005);
  float cov = inside ? clamp(0.5 - sd / fw, 0.0, 1.0) : 0.0;
  if (cov <= 0.002) { color = vec4(0.0); return; }
  vec2 g = vec2(texture(tA, cu + vec2(px.x, 0.0)).b - texture(tA, cu - vec2(px.x, 0.0)).b, texture(tA, cu + vec2(0.0, px.y)).b - texture(tA, cu - vec2(0.0, px.y)).b) * 8.0;
  g = length(g) > 0.0001 ? normalize(g) : vec2(0.0);
  vec2 nm = a.rg * 2.0 - 1.0;
  float nzm = sqrt(max(0.0001, 1.0 - dot(nm, nm)));
  // a tilted slab slightly accentuates the curvature so the reflection keeps moving; nothing changes at rest
  vec2 slope = -nm / nzm * (1.0 + 14.0 * (1.0 - uR[2].z));
  float depth = max(-sd, 0.0), BEV = 4.0;
  if (depth < BEV) {
    float S = sqrt(max(BEV * BEV - (BEV - depth) * (BEV - depth), 0.02));
    slope -= ((BEV - depth) / S) * g;
  }
  float sl = length(slope);
  if (sl > 2.2) slope *= 2.2 / sl;
  vec3 n = normalize(vec3(-slope, 1.0));
  vec3 nw = uR * n;
  vec3 r = vec3(2.0 * nw.z * nw.x, 2.0 * nw.z * nw.y, 2.0 * nw.z * nw.z - 1.0);
  float turned = smoothstep(0.002, 0.04, 1.0 - uR[2].z);
  float e = steelEnv(r, turned) * 1.25;
  e *= 1.0 + (hash(floor(loc.xy)) - 0.5) * 0.015;
  float vv = 1.0 - exp(-1.9 * e);
  vec3 steel = clamp(vec3(vv * 0.985 + 4.0 / 255.0, vv * 0.99 + 5.0 / 255.0, vv + 8.0 / 255.0), 0.0, 1.0);
  float s = b.r * uSeams, br = b.g;
  vec3 dk = vec3(122.0, 80.0, 8.0) / 255.0, md = vec3(212.0, 156.0, 30.0) / 255.0, lt = vec3(255.0, 226.0, 124.0) / 255.0;
  vec3 gold = br < 0.6 ? mix(dk, md, br / 0.6) : mix(md, lt, (br - 0.6) / 0.4);
  gold *= 0.82 + 0.36 * clamp(vv, 0.0, 1.0);
  vec3 rgb = mix(steel, gold, s);
  color = vec4(rgb * cov, cov);
}`;
// Decoded off the main thread: uploading an undecoded image to a texture would decode it here and stall scrolling. In a hidden tab decode() may never settle, so it gives up waiting after 500 ms.
const loadImage=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;}).then(async img=>{await Promise.race([img.decode().catch(()=>{}),new Promise(r=>setTimeout(r,500))]);return img;});
// Compiles the program and uploads both textures into gl; returns render(w,h,yaw,pitch,seams), which draws the fork turned by yaw and pitch (radians) over the whole w x h drawing buffer. Shared by the page and the worker.
export async function prepareFork(gl,imgA,imgB){
 const compile=(kind,source)=>{const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader');return s;};
 const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,VERTEX));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,FRAGMENT));gl.linkProgram(program);
 // The long shader may block the page while compiling: where the browser allows it, it compiles in parallel.
 const parallel=gl.getExtension('KHR_parallel_shader_compile');
 if(parallel){const start=performance.now();while(!gl.getProgramParameter(program,parallel.COMPLETION_STATUS_KHR)&&performance.now()-start<1500)await new Promise(r=>setTimeout(r,8));}
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'program');
 gl.useProgram(program);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,gl.NONE);
 [imgA,imgB].forEach((img,i)=>{const tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);});
 gl.uniform1i(gl.getUniformLocation(program,'tA'),0);gl.uniform1i(gl.getUniformLocation(program,'tB'),1);
 const uR=gl.getUniformLocation(program,'uR'),uSeams=gl.getUniformLocation(program,'uSeams'),matrix=new Float32Array(9);
 return (w,h,yaw,pitch,seams)=>{
  gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
  const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  // columns of R: turn right (yaw) then down (pitch); the third column is the slab normal
  matrix.set([cy,-sp*sy,-cp*sy,0,cp,-sp,sy,sp*cy,cp*cy]);gl.uniformMatrix3fv(uR,false,matrix);
  gl.uniform1f(uSeams,seams?1:0);gl.drawArrays(gl.TRIANGLES,0,3);};}
// Resolution of a draw: the real pixels the rect covers (the 2D context is already scaled by the dpr).
const pixels=(ctx,rect)=>{const scale=ctx.getTransform().a;return [Math.max(2,Math.round(rect.w*scale)),Math.max(2,Math.round(rect.h*scale))];};
// Loads both textures and prepares the GPU on the page. Resolves null without WebGL2 (or if anything fails): the scene then falls back to the photo with relief.
export async function loadFork3D(urls,createCanvas){try{
 const [imgA,imgB]=await Promise.all([loadImage(urls.a),loadImage(urls.b)]);
 const surface=createCanvas(),gl=surface.getContext('webgl2',{alpha:true,antialias:false,premultipliedAlpha:true});if(!gl)return null;
 const render=await prepareFork(gl,imgA,imgB);
 return {
  // Draws the fork turned by yaw and pitch (radians) inside rect; seams: with the gold seams.
  draw(ctx,rect,yaw,pitch,seams){const [w,h]=pixels(ctx,rect);if(surface.width!==w||surface.height!==h){surface.width=w;surface.height=h;}render(w,h,yaw,pitch,seams);ctx.drawImage(surface,rect.x,rect.y,rect.w,rect.h);},
 };}catch{return null;}}
// The same fork drawn by the GPU in a worker (OffscreenCanvas). On a cold start, creating the WebGL2 context, compiling the shader and sizing the drawing buffer block the thread for tens of milliseconds: in the worker they never block the page.
// The worker sends back one image per pose; draw() shows the latest one and asks for the next, so a turn follows the pointer about one frame later. When a newer image arrives, onUpdate() asks the scene to draw again.
// It resolves once the fork at rest (size() gives [w,h] in real pixels, read when the worker is ready) is ready with and without seams, so the first frame is already the final one. Resolves null, silently like loadFork3D, if the browser cannot do it (no WebGL2 in workers, worker error or no answer within timeout): the caller then uses loadFork3D.
export async function loadFork3DWorker(urls,{workerUrl,size,load=loadImage,timeout=8000}={}){
 if(typeof Worker==='undefined'||typeof OffscreenCanvas==='undefined'||typeof createImageBitmap==='undefined')return null;
 let worker,timer;try{
 const images=await Promise.all([load(urls.a),load(urls.b)]);
 const [a,b]=await Promise.all(images.map(img=>createImageBitmap(img,{premultiplyAlpha:'none',colorSpaceConversion:'none'})));
 worker=new Worker(workerUrl,{type:'module'});
 const slots=[{},{}],same=(p,q)=>!!p&&!!q&&p.w===q.w&&p.h===q.h&&p.yaw===q.yaw&&p.pitch===q.pitch;
 // one request in flight per image (with and without seams): the worker always draws the latest pose asked for
 const send=i=>{const s=slots[i];s.busy=true;s.sent=s.want;worker.postMessage({slot:i,seams:i===1,...s.want});};
 const fork={onUpdate:null,
  draw(ctx,rect,yaw,pitch,seams){const [w,h]=pixels(ctx,rect),i=seams?1:0,s=slots[i];s.want={w,h,yaw,pitch};if(!s.busy&&!same(s.want,s.have))send(i);if(s.bitmap){ctx.drawImage(s.bitmap,rect.x,rect.y,rect.w,rect.h);s.drawn=s.have;}},
  destroy(){worker.terminate();for(const s of slots)s.bitmap?.close();}};
 let primed=false;
 await new Promise((resolve,reject)=>{
  timer=setTimeout(()=>reject(new Error('fork worker timeout')),timeout);
  worker.onerror=event=>reject(event.error||new Error('fork worker failed'));
  worker.onmessage=({data})=>{
   if(data.error)return reject(new Error(data.error));
   if(data.ready){const [w,h]=size();for(const i of [0,1]){slots[i].want={w,h,yaw:0,pitch:0};send(i);}return;}
   const s=slots[data.slot];s.bitmap?.close();s.bitmap=data.bitmap;s.have=s.sent;s.busy=false;
   if(!same(s.want,s.have))send(data.slot);
   if(!primed){if(slots[0].bitmap&&slots[1].bitmap){primed=true;resolve();}return;}
   if(!same(s.drawn,s.have))fork.onUpdate?.();};
  worker.postMessage({a,b},[a,b]);});
 clearTimeout(timer);return fork;
 }catch{clearTimeout(timer);worker?.terminate();return null;}}
