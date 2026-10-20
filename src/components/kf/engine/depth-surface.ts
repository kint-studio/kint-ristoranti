// Proiezione di profondita' sulla GPU, con una prospettiva leggera di riserva per
// chi ha solo il Canvas. La profondita' viene dalla sagoma: ogni riga e' una
// sezione tonda. Portato dal codice della home "forma".
import type { MakeCanvas } from "./fluid-field";

export type Rect = { x: number; y: number; w: number; h: number };

const VERTEX = `#version 300 es
precision highp float;
out vec2 vUv;
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);vUv=vec2(p.x,1.0-p.y);gl_Position=vec4(p*2.0-1.0,0,1);}`;
const FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D tImage,tDepth;
uniform vec2 uAngles;
uniform float uAspect;
out vec4 color;
void main(){float cy=cos(uAngles.x),sy=sin(uAngles.x),cx=cos(uAngles.y),sx=sin(uAngles.y);vec2 uv=vUv;for(int i=0;i<3;i++){float z=texture(tDepth,clamp(uv,0.0,1.0)).r*.36;uv.x=.5+(vUv.x-.5-z*sy)/cy;uv.y=.5+(vUv.y-.5+(z*cy-(uv.x-.5)*sy)*sx*uAspect)/cx;}if(any(lessThan(uv,vec2(0)))||any(greaterThan(uv,vec2(1)))){color=vec4(0);return;}color=texture(tImage,uv);}`;

type Gpu = {
  gl: WebGL2RenderingContext;
  surface: HTMLCanvasElement;
  program: WebGLProgram;
  angles: WebGLUniformLocation | null;
  textures: WeakMap<object, WebGLTexture>;
};
export type Depth = { gpu: Gpu | null };

/** Come si costruisce il rilievo dell'oggetto.
 *  - "cupola": ogni punto sale come una sfera fino al centro della parte piu' spessa (un manubrio, tondo e massiccio);
 *  - "lineare": il rilievo cresce con la distanza dal bordo (`gain` volte) fino a un tetto (`cap`, in larghezze
 *    dell'immagine). Serve agli oggetti sottili (una forchetta e' una lastra, una penna un tubicino): con la cupola
 *    il loro spessore risultava decine di volte quello vero e, girando, le parti sottili si strappavano. */
export type DepthStyle = { kind: "cupola" } | { kind: "lineare"; gain: number; cap: number };

export function makeDepth(base: HTMLImageElement, createCanvas: MakeCanvas, style: DepthStyle = { kind: "cupola" }): Depth {
  const w = Math.min(512, base.width), h = Math.round((w * base.height) / base.width);
  const c = createCanvas();
  c.width = w;
  c.height = h;
  const x = c.getContext("2d", { willReadFrequently: true })!;
  x.drawImage(base, 0, 0, w, h);
  const { data } = x.getImageData(0, 0, w, h);
  // Rilievo: la distanza di ogni punto dal bordo della sagoma, trasformata in una cupola (un tondino e' piu' alto al
  // centro che ai lati). Prima il rilievo si calcolava riga per riga dagli estremi della sagoma: andava bene per un vaso
  // dritto, ma in un oggetto in diagonale (un manubrio) le righe che toccano contemporaneamente l'asta e un disco
  // davano salti, e con la parallasse le parti dell'asta si spostavano a scatti l'una rispetto all'altra.
  const inside = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) inside[i] = data[i * 4 + 3] > 100 ? 1 : 0;
  const dist = new Float32Array(w * h);
  const BIG = 1e6;
  for (let i = 0; i < w * h; i++) dist[i] = inside[i] ? BIG : 0;
  const at = (xx: number, yy: number) => (xx < 0 || yy < 0 || xx >= w || yy >= h ? 0 : dist[yy * w + xx]);
  for (let y = 0; y < h; y++) for (let px = 0; px < w; px++) {
    const i = y * w + px;
    if (dist[i]) dist[i] = Math.min(dist[i], at(px - 1, y) + 1, at(px, y - 1) + 1, at(px - 1, y - 1) + 1.414, at(px + 1, y - 1) + 1.414);
  }
  for (let y = h - 1; y >= 0; y--) for (let px = w - 1; px >= 0; px--) {
    const i = y * w + px;
    if (dist[i]) dist[i] = Math.min(dist[i], at(px + 1, y) + 1, at(px, y + 1) + 1, at(px + 1, y + 1) + 1.414, at(px - 1, y + 1) + 1.414);
  }
  let maxd = 0;
  for (let i = 0; i < w * h; i++) if (dist[i] < BIG) maxd = Math.max(maxd, dist[i]);
  // raggio della cupola: quello della parte piu' spessa, ma mai meno di 0,18 volte la larghezza (un'asta sottile resta tonda)
  const dome = Math.max(maxd, 0.18 * w);
  const raw = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    if (!inside[i]) continue;
    const dd = Math.min(dist[i], dome);
    const height = style.kind === "lineare"
      ? Math.min(dist[i] * style.gain, style.cap * w)
      : Math.sqrt(Math.max(0, dome * dome - (dome - dd) * (dome - dd)));
    raw[i] = (height / w * 0.7 / 0.36) * 255;
  }
  // una sfocatura 3x3 toglie le creste dove si incontrano i bordi opposti
  const depths = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let px = 0; px < w; px++) {
    const i = y * w + px;
    if (!inside[i]) continue;
    let sum = 0, n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = px + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h || !inside[yy * w + xx]) continue;
      sum += raw[yy * w + xx];
      n++;
    }
    depths[i] = Math.min(255, sum / n);
  }
  const result: Depth = { gpu: null };
  try {
    const surface = createCanvas();
    const gl = surface.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!gl) return result;
    surface.width = base.width;
    surface.height = base.height;
    const compile = (kind: number, source: string) => {
      const s = gl.createShader(kind)!;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "program");
    gl.useProgram(program);
    const depthTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, depthTex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, w, h, 0, gl.RED, gl.UNSIGNED_BYTE, depths);
    for (const [a, b] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, a, b);
    gl.uniform1i(gl.getUniformLocation(program, "tImage"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "tDepth"), 1);
    gl.uniform1f(gl.getUniformLocation(program, "uAspect"), base.width / base.height);
    result.gpu = { gl, surface, program, angles: gl.getUniformLocation(program, "uAngles"), textures: new WeakMap() };
  } catch {
    /* senza WebGL resta la prospettiva fotografica di riserva */
  }
  return result;
}

export function drawDepth(ctx: CanvasRenderingContext2D, image: CanvasImageSource, rect: Rect, depth: Depth, yaw: number, pitch: number) {
  if (Math.abs(yaw) + Math.abs(pitch) < 0.00005) {
    ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h);
    return;
  }
  if (depth.gpu) {
    const { gl, surface, program, angles, textures } = depth.gpu;
    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    let texture = textures.get(image as object);
    if (!texture) {
      texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image as TexImageSource);
      for (const [a, b] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, a, b);
      textures.set(image as object, texture);
    } else gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform2f(angles, yaw, pitch);
    gl.viewport(0, 0, surface.width, surface.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    ctx.drawImage(surface, rect.x, rect.y, rect.w, rect.h);
    return;
  }
  // la stessa risposta leggera, senza cuciture ne' deformazioni pesanti sulla CPU
  ctx.save();
  ctx.translate(rect.x + rect.w / 2 + Math.sin(yaw) * rect.w * 0.11, rect.y + rect.h / 2 - Math.sin(pitch) * rect.w * 0.12);
  ctx.transform(Math.cos(yaw), Math.sin(yaw) * Math.sin(pitch), Math.sin(pitch) * 0.05, Math.cos(pitch), 0, 0);
  ctx.drawImage(image, -rect.w / 2, -rect.h / 2, rect.w, rect.h);
  ctx.restore();
}
