// La forchetta come lastra 3D vera, disegnata dalla GPU.
//
// Invece di deformare una foto con una mappa di profondita' (che a angoli grandi si strappa), qui la forchetta e' una
// lastra piana che gira nello spazio. Per ogni pixel dello schermo si lancia un raggio e si trova il punto della lastra
// che vede; li' due piccole immagini dicono com'e' fatta la superficie:
//   a: R,G = la pendenza liscia della superficie (normale), B = distanza dal bordo (negativa dentro la sagoma);
//   b: R = quanto e' coperto da una giuntura d'oro, G = quanto brilla l'oro.
// Il metallo e' lo stesso "studio fotografico" con cui erano fatte le immagini (pannello in alto a sinistra, striscia
// a destra...), ma calcolato qui: girando la lastra i riflessi scivolano davvero sulla superficie.
// A riposo il risultato coincide con l'immagine di prima. Le due immagini (public/forma/forchetta3-3d-a/b.webp) sono gia' pronte: lo script che le genera non fa parte di questo progetto.
import type { MakeCanvas } from "./fluid-field";
import type { Rect } from "./depth-surface";

// La scena e' misurata nelle unita' dell'immagine originale (1024 x 1536): la forchetta ha il centro in (534, 768).
const IMG_W = 1024, IMG_H = 1536, CX = 534, CY = 768;
// l'area coperta dalle due immagini, nello spazio dell'oggetto (1 pixel = 1 unita')
const TEX_W = 200, TEX_H = 1424, U0 = -100, V0 = -712;
// distanza dell'occhio dalla lastra: lontano, cosi' la prospettiva e' leggera
const EYE = 3200;

const VERTEX = `#version 300 es
precision highp float;
out vec2 vUv;
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);vUv=vec2(p.x,1.0-p.y);gl_Position=vec4(p*2.0-1.0,0,1);}`;

const FRAGMENT = `#version 300 es
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
// luce da studio: pannello morbido davanti, pannello grande in alto a sinistra, striscia a destra, soffitto, pavimento
float steelEnv(vec3 r, float turned){
  float e = 0.24 + 0.18 * smoothstep(-0.4, 0.9, -r.y);
  e += 0.42 * boxLight(r, vec3(0.0, 0.0, 1.0), 0.6, 0.6);
  e += 1.9 * boxLight(r, vec3(-0.5, -0.62, 0.6), 0.46, 0.34);
  e += 1.5 * boxLight(r, vec3(0.78, -0.08, 0.62), 0.1, 0.9);
  e *= 1.0 - 0.55 * boxLight(r, vec3(-0.86, 0.1, 0.5), 0.3, 1.3);
  e += 0.35 * boxLight(r, vec3(0.05, -0.95, 0.3), 0.5, 0.25);
  e *= 1.0 - 0.5 * smoothstep(0.3, 0.95, r.y);
  // Quando la forchetta si inclina il riflesso arriva da zone dell'ambiente dove prima non c'era niente e le superfici
  // larghe (la testa) diventavano un grigio piatto. Tre pannelli morbidi, accesi solo per i riflessi lontani
  // dall'asse (a riposo non si vedono, quindi l'immagine ferma resta quella di prima), danno sempre una sfumatura.
  float tilt = smoothstep(0.28, 0.62, 1.0 - r.z);
  e += tilt * (0.75 * boxLight(r, vec3(0.62, -0.62, 0.48), 0.55, 0.45)
             + 0.55 * boxLight(r, vec3(-0.66, 0.5, 0.55), 0.6, 0.5)
             + 0.45 * boxLight(r, vec3(0.05, 0.85, 0.5), 0.9, 0.5));
  // e una sfumatura larga che segue la direzione del riflesso: sulla testa, quasi piatta, e' quella che fa scorrere la luce
  // mentre la forchetta gira (turned vale 0 a riposo, quindi l'immagine ferma non cambia)
  e += turned * (0.55 * r.x - 0.3 * r.y);
  return max(e, 0.05);
}
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

void main(){
  // il punto dell'immagine che questo pixel guarda, e il raggio che dall'occhio ci passa
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
  // distanza dal bordo in unita' (negativa dentro): da qui vengono la copertura e lo smusso del bordo, calcolati alla
  // scala dello schermo, cosi' il filo scuro del bordo resta continuo a qualsiasi dimensione
  float sd = (a.b * 2.0 - 1.0) * 16.0;
  bool inside = uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0;
  float fw = max(fwidth(sd), 0.0005);
  float cov = inside ? clamp(0.5 - sd / fw, 0.0, 1.0) : 0.0;
  if (cov <= 0.002) { color = vec4(0.0); return; }
  vec2 g = vec2(texture(tA, cu + vec2(px.x, 0.0)).b - texture(tA, cu - vec2(px.x, 0.0)).b, texture(tA, cu + vec2(0.0, px.y)).b - texture(tA, cu - vec2(0.0, px.y)).b) * 8.0;
  g = length(g) > 0.0001 ? normalize(g) : vec2(0.0);
  // pendenza della superficie: quella liscia (dalla texture) piu' lo smusso del bordo (un quarto di cerchio di raggio 4)
  vec2 nm = a.rg * 2.0 - 1.0;
  float nzm = sqrt(max(0.0001, 1.0 - dot(nm, nm)));
  // girando, la superficie larga (la testa) cadeva nel pannello morbido dell'ambiente e restava un grigio piatto: con la
  // lastra inclinata si accentua appena la curvatura, cosi' il riflesso continua a scorrere. A riposo non cambia nulla.
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
  // l'oro delle giunture: scuro, medio, chiaro come nelle immagini; brilla un po' di piu' dove la luce lo prende
  float s = b.r * uSeams, br = b.g;
  vec3 dk = vec3(122.0, 80.0, 8.0) / 255.0, md = vec3(212.0, 156.0, 30.0) / 255.0, lt = vec3(255.0, 226.0, 124.0) / 255.0;
  vec3 gold = br < 0.6 ? mix(dk, md, br / 0.6) : mix(md, lt, (br - 0.6) / 0.4);
  gold *= 0.82 + 0.36 * clamp(vv, 0.0, 1.0);
  vec3 rgb = mix(steel, gold, s);
  color = vec4(rgb * cov, cov);
}`;

export type ForkRenderer = {
  /** Disegna la forchetta girata di `yaw` e `pitch` (radianti) dentro `rect`; `seams`: con le giunture d'oro. */
  draw(ctx: CanvasRenderingContext2D, rect: Rect, yaw: number, pitch: number, seams: boolean): void;
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  }).then(async (img) => {
    // si decodifica fuori dal thread principale: caricarla poi in una texture la farebbe fare li', bloccando lo scorrimento
    // (in una scheda nascosta decode() puo' non finire mai: dopo mezzo secondo si prosegue comunque)
    await Promise.race([img.decode().catch(() => {}), new Promise((r) => setTimeout(r, 500))]);
    return img;
  });

/** Carica le due immagini e prepara la GPU. Torna `null` se il browser non ha WebGL2: allora resta la vecchia strada. */
export async function loadFork3D(urls: { a: string; b: string }, createCanvas: MakeCanvas): Promise<ForkRenderer | null> {
  try {
    const [imgA, imgB] = await Promise.all([loadImage(urls.a), loadImage(urls.b)]);
    const surface = createCanvas();
    const gl = surface.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!gl) return null;
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
    // la compilazione dello shader (lungo) puo' bloccare la pagina: dove il browser lo consente va in parallelo
    const parallel = gl.getExtension("KHR_parallel_shader_compile");
    if (parallel) {
      const start = performance.now();
      while (!gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR) && performance.now() - start < 1500) await new Promise((r) => setTimeout(r, 8));
    }
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "program");
    gl.useProgram(program);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    [imgA, imgB].forEach((img, i) => {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    });
    gl.uniform1i(gl.getUniformLocation(program, "tA"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "tB"), 1);
    const uR = gl.getUniformLocation(program, "uR"), uSeams = gl.getUniformLocation(program, "uSeams");
    return {
      draw(ctx, rect, yaw, pitch, seams) {
        // risoluzione: quanti pixel reali copre il rettangolo (il contesto 2D e' gia' scalato dal dpr)
        const scale = ctx.getTransform().a;
        const w = Math.max(2, Math.round(rect.w * scale)), h = Math.max(2, Math.round(rect.h * scale));
        if (surface.width !== w || surface.height !== h) {
          surface.width = w;
          surface.height = h;
        }
        gl.viewport(0, 0, w, h);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
        // colonne di R = (guarda a destra: yaw) poi (guarda in basso: pitch); la terza colonna e' la normale della lastra
        gl.uniformMatrix3fv(uR, false, new Float32Array([cy, -sp * sy, -cp * sy, 0, cp, -sp, sy, sp * cy, cp * cy]));
        gl.uniform1f(uSeams, seams ? 1 : 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        ctx.drawImage(surface, rect.x, rect.y, rect.w, rect.h);
      },
    };
  } catch {
    return null;
  }
}
