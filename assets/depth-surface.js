// Depth projection on the GPU; lightweight perspective fallback for Canvas-only browsers.
const VERTEX=`#version 300 es
precision highp float;
out vec2 vUv;
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);vUv=vec2(p.x,1.0-p.y);gl_Position=vec4(p*2.0-1.0,0,1);}`;
const FRAGMENT=`#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D tImage,tDepth;
uniform vec2 uAngles;
uniform float uAspect;
out vec4 color;
void main(){float cy=cos(uAngles.x),sy=sin(uAngles.x),cx=cos(uAngles.y),sx=sin(uAngles.y);vec2 uv=vUv;for(int i=0;i<3;i++){float z=texture(tDepth,clamp(uv,0.0,1.0)).r*.36;uv.x=.5+(vUv.x-.5-z*sy)/cy;uv.y=.5+(vUv.y-.5+(z*cy-(uv.x-.5)*sy)*sx*uAspect)/cx;}if(any(lessThan(uv,vec2(0)))||any(greaterThan(uv,vec2(1)))){color=vec4(0);return;}color=texture(tImage,uv);}`;
export function makeDepth(base,createCanvas){const w=Math.min(512,base.width),h=Math.round(w*base.height/base.width),c=createCanvas();c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(base,0,0,w,h);const {data}=x.getImageData(0,0,w,h);const depths=new Uint8Array(w*h);for(let y=0;y<h;y++){let left=w,right=0;for(let px=0;px<w;px++)if(data[(y*w+px)*4+3]>100){left=Math.min(left,px);right=px;}const center=(left+right)/2,radius=(right-left)/2;for(let px=left;px<=right;px++)depths[y*w+px]=Math.min(255,Math.sqrt(Math.max(0,radius*radius-(px-center)*(px-center)))/w*.7/.36*255);}// WebGL is compiled lazily: only a tilt (fine pointer) needs it, so touch screens never pay for it and desktops warm it up in idle time.
 const result={gpu:undefined,prepare(){if(result.gpu!==undefined)return result.gpu;result.gpu=null;try{const surface=createCanvas();const gl=surface.getContext('webgl2',{alpha:true,antialias:false,premultipliedAlpha:false});if(!gl)return null;surface.width=base.width;surface.height=base.height;const compile=(kind,source)=>{const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,VERTEX));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,FRAGMENT));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.useProgram(program);const depthTex=gl.createTexture();gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,depthTex);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);gl.texImage2D(gl.TEXTURE_2D,0,gl.R8,w,h,0,gl.RED,gl.UNSIGNED_BYTE,depths);for(const [a,b] of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,a,b);gl.uniform1i(gl.getUniformLocation(program,'tImage'),0);gl.uniform1i(gl.getUniformLocation(program,'tDepth'),1);gl.uniform1f(gl.getUniformLocation(program,'uAspect'),base.width/base.height);result.gpu={gl,surface,program,angles:gl.getUniformLocation(program,'uAngles'),textures:new WeakMap()};}catch(error){/* Photographic perspective remains available without WebGL. */console.warn('KINT depth WebGL unavailable, using the 2D perspective',error);}return result.gpu;}};
 if(!globalThis.matchMedia?.('(hover: none)').matches)(globalThis.requestIdleCallback||(cb=>setTimeout(cb,1)))(()=>result.prepare(),{timeout:3000});
 return result;}
export function drawDepth(ctx,image,rect,depth,yaw,pitch){
 if(Math.abs(yaw)+Math.abs(pitch)<.00005){ctx.drawImage(image,rect.x,rect.y,rect.w,rect.h);return;}
 const gpu=depth.gpu===undefined?depth.prepare?.():depth.gpu;
 if(gpu){const {gl,surface,program,angles,textures}=gpu;gl.useProgram(program);gl.activeTexture(gl.TEXTURE0);let texture=textures.get(image);if(!texture){texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);for(const [a,b] of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,a,b);textures.set(image,texture);}else gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform2f(angles,yaw,pitch);gl.viewport(0,0,surface.width,surface.height);gl.drawArrays(gl.TRIANGLES,0,3);ctx.drawImage(surface,rect.x,rect.y,rect.w,rect.h);return;}
 // The same slight response is preserved, without raster seams or heavy CPU warping.
 ctx.save();ctx.translate(rect.x+rect.w/2+Math.sin(yaw)*rect.w*.11,rect.y+rect.h/2-Math.sin(pitch)*rect.w*.12);ctx.transform(Math.cos(yaw),Math.sin(yaw)*Math.sin(pitch),Math.sin(pitch)*.05,Math.cos(pitch),0,0);ctx.drawImage(image,-rect.w/2,-rect.h/2,rect.w,rect.h);ctx.restore();
}
