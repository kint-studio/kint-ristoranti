// Il motore della scena della home "forma", portato in TypeScript: un compositore
// Canvas deterministico. Il cursore apre un varco (flusso fluido) attraverso cui si
// vede il "materiale tecnico" ricavato dalla foto con le giunture d'oro; la foto
// ruota appena seguendo il puntatore; all'ingresso l'oggetto si forma da cifre binarie.
// Tre classi in catena: TrailEngine -> FormationEngine -> SceneEngine.
import { drawDepth, makeDepth, type Depth, type DepthStyle, type Rect } from "./depth-surface";
import type { ForkRenderer } from "./fork-3d";
import { FluidField, type MakeCanvas } from "./fluid-field";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => { x = clamp(x); return x * x * (3 - 2 * x); };
const hash = (x: number, y: number) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };

export type SceneOptions = {
  canvas: HTMLCanvasElement;
  createCanvas: MakeCanvas;
  base: HTMLImageElement;
  width: number;
  height: number;
  dpr?: number;
  /** risoluzione massima del disegno rispetto ai pixel CSS: 1,5 sul computer, 2 sui telefoni (sono a 3x e a 1,5 sgranano) */
  maxDpr?: number;
  reduced?: boolean;
  /** dove sta l'oggetto nella scena: cambia fra desktop (a destra) e telefono (sotto il testo) */
  layout: (w: number, h: number) => Rect;
  /** false per un oggetto che svanisce in basso: niente piano ne' ombre di contatto sotto di lui */
  grounded?: boolean;
  /** com'e' fatto il rilievo che serve a girare l'oggetto: la cupola va bene per un oggetto massiccio */
  depthStyle?: DepthStyle;
  /** la forchetta 3D: se c'e', e' lei a disegnare l'oggetto al posto delle immagini deformate */
  fork3d?: ForkRenderer;
};

// Tempi dell'ingresso, in millisecondi di scena: prima le cifre disegnano la sagoma, una breve pausa,
// poi la striscia diagonale che le sostituisce con l'oggetto vero. Nell'originale erano 2100 / 650 / 2300
// (5050 in tutto). Dalle cifre formate (a 1300) all'oggetto passano ora circa 1,3 s invece di 2,6: la pausa e
// la striscia sono state dimezzate.
export const ASSEMBLY_MS = 1300;
export const WIPE_START_MS = 1425;
export const WIPE_MS = 1150;
export const FORMATION_DONE_MS = WIPE_START_MS + WIPE_MS;

type Pose = { yaw: number; pitch: number };
type Mark = { x: number; y: number; time: number };

export class TrailEngine {
  canvas: HTMLCanvasElement;
  make: MakeCanvas;
  base: HTMLImageElement;
  layout: (w: number, h: number) => Rect;
  points: Mark[] = [];
  pose: Pose = { yaw: 0, pitch: 0 };
  targetPose: Pose = { yaw: 0, pitch: 0 };
  depth: Depth;
  surfaces: Record<string, HTMLCanvasElement>;
  tech: CanvasImageSource | null = null;
  previousTime = 0;
  grounded = true;
  w = 0;
  h = 0;
  dpr = 1;
  maxDpr = 1.5;
  rect: Rect = { x: 0, y: 0, w: 0, h: 0 };
  flow!: FluidField;
  cachedPose: Pose | null = null;
  fork3d: ForkRenderer | null = null;

  constructor({ canvas, createCanvas, base, width, height, dpr = 1, layout, grounded, maxDpr = 1.5, depthStyle, fork3d }: SceneOptions) {
    this.fork3d = fork3d ?? null;
    this.maxDpr = maxDpr;
    this.canvas = canvas;
    this.make = createCanvas;
    this.base = base;
    this.layout = layout;
    this.grounded = grounded !== false;
    this.depth = makeDepth(base, createCanvas, depthStyle);
    this.surfaces = { background: this.make(), mask: this.make(), wash: this.make(), reveal: this.make(), warpedBase: this.make(), warpedTech: this.make() };
    this.resize(width, height, dpr);
  }

  // Il materiale arriva dopo, da un worker (vedi material-loader.ts): finche' non c'e' il varco non mostra nulla,
  // ma l'ingresso dura qualche secondo, quindi in pratica e' gia' pronto quando serve.
  setTech(tech: CanvasImageSource) {
    this.tech = tech;
    this.cachedPose = null;
  }

  resize(w: number, h: number, dpr = 1) {
    this.w = w;
    this.h = h;
    this.dpr = Math.min(dpr, this.maxDpr);
    for (const c of [this.canvas, ...Object.values(this.surfaces)]) {
      c.width = Math.round(w * this.dpr);
      c.height = Math.round(h * this.dpr);
      c.getContext("2d")!.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
    this.rect = this.layout(w, h);
    this.points = [];
    this.flow = new FluidField({ width: w, height: h, createCanvas: this.make });
    this.cachedPose = null;
    this.drawBackground();
  }

  drawBackground(time?: number) {
    void time;
    const x = this.surfaces.background.getContext("2d")!;
    x.fillStyle = "#f8f8f3";
    x.fillRect(0, 0, this.w, this.h);
  }

  setPointer(x: number, y: number) {
    // l'oggetto si gira verso il cursore: ~20 gradi in orizzontale, ~10 in verticale (in origine 4 e 2)
    this.targetPose.yaw = (x / this.w * 2 - 1) * 0.35;
    this.targetPose.pitch = (y / this.h * 2 - 1) * 0.18;
  }

  resetPointer() {
    this.targetPose = { yaw: 0, pitch: 0 };
  }

  addPointer(x: number, y: number, time: number) {
    this.flow.input(x, y, time);
    this.points.push({ x, y, time });
    if (this.points.length > 120) this.points.shift();
  }

  frame(time: number, full = 0) {
    const out = this.canvas.getContext("2d")!, mask = this.surfaces.mask.getContext("2d")!;
    for (const [key, c] of Object.entries(this.surfaces)) {
      if (!["background", "warpedBase", "warpedTech"].includes(key)) c.getContext("2d")!.clearRect(0, 0, this.w, this.h);
    }
    this.points = this.points.filter((p) => time - p.time < 620);
    this.flow.paint(mask, time);
    const dt = this.previousTime ? Math.min((time - this.previousTime) / 1000, 0.05) : 0.016;
    this.previousTime = time;
    const ease = 1 - Math.exp(-dt * 3.4);
    this.pose.yaw += (this.targetPose.yaw - this.pose.yaw) * ease;
    this.pose.pitch += (this.targetPose.pitch - this.pose.pitch) * ease;
    if (!this.cachedPose || Math.abs(this.pose.yaw - this.cachedPose.yaw) + Math.abs(this.pose.pitch - this.cachedPose.pitch) > 0.0001) {
      for (const [name, image] of [["warpedBase", this.base], ["warpedTech", this.tech]] as const) {
        const fork = this.fork3d;
        if (!image && !fork) continue;
        const c = this.surfaces[name].getContext("2d")!;
        c.clearRect(0, 0, this.w, this.h);
        if (fork) fork.draw(c, this.rect, this.pose.yaw, this.pose.pitch, name === "warpedTech");
        else drawDepth(c, image!, this.rect, this.depth, this.pose.yaw, this.pose.pitch);
      }
      this.cachedPose = { ...this.pose };
    }
    out.drawImage(this.surfaces.background, 0, 0, this.w, this.h);
    const wash = this.surfaces.wash.getContext("2d")!;
    wash.fillStyle = "#e7e9df";
    wash.fillRect(0, 0, this.w, this.h);
    wash.globalCompositeOperation = "destination-in";
    wash.drawImage(this.surfaces.mask, 0, 0, this.w, this.h);
    wash.globalCompositeOperation = "source-over";
    out.drawImage(this.surfaces.wash, 0, 0, this.w, this.h);
    out.drawImage(this.surfaces.warpedBase, 0, 0, this.w, this.h);
    const revealed = this.surfaces.reveal.getContext("2d")!;
    revealed.drawImage(this.surfaces.warpedTech, 0, 0, this.w, this.h);
    if (full < 0.999) {
      revealed.globalCompositeOperation = "destination-in";
      revealed.drawImage(this.surfaces.mask, 0, 0, this.w, this.h);
      if (full > 0) {
        revealed.globalCompositeOperation = "source-over";
        revealed.globalAlpha = full;
        revealed.drawImage(this.surfaces.warpedTech, 0, 0, this.w, this.h);
        revealed.globalAlpha = 1;
      }
      revealed.globalCompositeOperation = "source-over";
    }
    out.drawImage(this.surfaces.reveal, 0, 0, this.w, this.h);
  }
}

type Cell = { x: number; y: number; char: string; alpha: number; arrival: number; drift: number };

// Coordinate fotografiche fisse: il testo (le cifre) e la materia condividono una sola sagoma.
export class FormationEngine extends TrailEngine {
  elapsed = 0;
  started = false;
  done = false;
  binary: HTMLCanvasElement;
  matter: HTMLCanvasElement;
  wipe: HTMLCanvasElement;
  cells: Cell[] = [];
  cellFont = 0;
  printProgress = -1;

  constructor(options: SceneOptions) {
    super(options);
    this.binary = this.make();
    this.matter = this.make();
    this.wipe = this.make();
    this.buildPrint();
  }

  resize(w: number, h: number, dpr = 1) {
    super.resize(w, h, dpr);
    if (this.binary) this.buildPrint();
  }

  buildPrint() {
    for (const c of [this.binary, this.matter, this.wipe]) {
      c.width = this.canvas.width;
      c.height = this.canvas.height;
      c.getContext("2d")!.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
    const r = this.rect, step = this.w <= 600 ? 3.8 : 4.3, line = step * 1.45, cols = Math.ceil(r.w / step), rows = Math.ceil(r.h / line);
    const sample = this.make();
    sample.width = cols;
    sample.height = rows;
    const ctx = sample.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(this.base, 0, 0, cols, rows);
    const data = ctx.getImageData(0, 0, cols, rows).data;
    this.cells = [];
    this.cellFont = line * 0.95;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4, a = data[i + 3] / 255;
        if (a < 0.12) continue;
        const l = (data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722) / 255, rnd = hash(x, y);
        this.cells.push({
          x: r.x + ((x + 0.5) * r.w) / cols,
          y: r.y + ((y + 0.55) * r.h) / rows,
          char: rnd > 0.5 ? "1" : "0",
          alpha: a * clamp(0.34 + Math.pow(1 - l, 0.75) * 1.05),
          arrival: clamp(((rows - y) / rows) * 0.8 + rnd * 0.1 + Math.sin(x * 0.13) * 0.035),
          drift: (rnd - 0.5) * 7,
        });
      }
    }
    this.printProgress = -1;
  }

  start() {
    this.elapsed = 0;
    this.started = true;
    this.done = false;
    this.printProgress = -1;
    this.flow.resize(this.w, this.h);
    this.pose = { yaw: 0, pitch: 0 };
    this.targetPose = { yaw: 0, pitch: 0 };
    this.cachedPose = null;
  }

  setPointer(x: number, y: number) { if (this.done) super.setPointer(x, y); }
  setPose(yaw: number, pitch: number) { if (this.done) this.targetPose = { yaw, pitch }; }
  addPointer(x: number, y: number, time: number) { if (this.done) super.addPointer(x, y, time); }
  advance(dt: number) { if (this.started && !this.done) this.elapsed += Math.min(dt, 0.05) * 1000; }

  paintBinary(progress: number) {
    if (progress === this.printProgress) return;
    this.printProgress = progress;
    const ctx = this.binary.getContext("2d")!;
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.fillStyle = "#263d32";
    ctx.font = `600 ${this.cellFont}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const cell of this.cells) {
      const reveal = progress >= 1 ? 1 : smooth((progress - cell.arrival) / 0.1);
      if (!reveal) continue;
      ctx.globalAlpha = cell.alpha * reveal;
      ctx.fillText(cell.char, cell.x + cell.drift * (1 - reveal), cell.y + (1 - reveal) * 12);
    }
    ctx.globalAlpha = 1;
  }

  frame(time: number, full = 0) {
    if (!this.cachedPose) super.frame(time, 0);
    const ctx = this.canvas.getContext("2d")!;
    ctx.drawImage(this.surfaces.background, 0, 0, this.w, this.h);
    if (this.started && this.elapsed >= FORMATION_DONE_MS) {
      this.done = true;
      super.frame(time, full);
      return;
    }
    if (!this.started) return;
    const assembly = clamp(this.elapsed / ASSEMBLY_MS);
    this.paintBinary(assembly);
    const p = clamp((this.elapsed - WIPE_START_MS) / WIPE_MS);
    if (!p) { ctx.drawImage(this.binary, 0, 0, this.w, this.h); return; }
    const r = this.rect, mask = this.wipe.getContext("2d")!;
    mask.clearRect(0, 0, this.w, this.h);
    const gradient = mask.createLinearGradient(r.x, r.y + r.h + 60, r.x + r.w, r.y - 60);
    const front = p * 1.32 - 0.16;
    for (const [position, alpha] of [[0, 1], [clamp(front - 0.13), 1], [clamp(front + 0.13), 0], [1, 0]]) gradient.addColorStop(position, `rgba(255,255,255,${alpha})`);
    mask.fillStyle = gradient;
    mask.fillRect(0, 0, this.w, this.h);
    const material = this.matter.getContext("2d")!;
    material.clearRect(0, 0, this.w, this.h);
    material.drawImage(this.surfaces.warpedBase, 0, 0, this.w, this.h);
    material.globalCompositeOperation = "destination-in";
    material.drawImage(this.wipe, 0, 0, this.w, this.h);
    material.globalCompositeOperation = "source-over";
    // la maschera complementare toglie le cifre proprio dove emerge la foto
    const text = this.surfaces.reveal.getContext("2d")!;
    text.clearRect(0, 0, this.w, this.h);
    text.drawImage(this.binary, 0, 0, this.w, this.h);
    text.globalCompositeOperation = "destination-out";
    text.drawImage(this.wipe, 0, 0, this.w, this.h);
    text.globalCompositeOperation = "source-over";
    ctx.drawImage(text.canvas, 0, 0, this.w, this.h);
    ctx.drawImage(this.matter, 0, 0, this.w, this.h);
  }
}

// Un ambiente quieto e fisico: carta, luce che si sposta piano, un piano opaco con ombre di contatto.
export class SceneEngine extends FormationEngine {
  reduced: boolean;
  lightTime = 0;
  // questi tre si riempiono durante il costruttore della classe base: `declare` evita che vengano azzerati
  declare footRatio: number | undefined;
  declare grain: HTMLCanvasElement | undefined;
  declare floor: number | undefined;

  constructor(options: SceneOptions) {
    super(options);
    this.reduced = options.reduced || false;
  }

  drawBackground(time = 0) {
    const ctx = this.surfaces.background.getContext("2d")!, r = this.rect;
    if (!this.footRatio) {
      // basta una miniatura: leggere tutti i pixel di un'immagine da 2048x3072 costerebbe decine di MB per niente
      const c = this.make();
      c.width = Math.min(this.base.width, 256);
      c.height = Math.round((c.width * this.base.height) / this.base.width);
      const x = c.getContext("2d", { willReadFrequently: true })!;
      x.drawImage(this.base, 0, 0, c.width, c.height);
      const p = x.getImageData(0, 0, c.width, c.height).data;
      let bottom = c.height - 1;
      outer: for (; bottom > 0; bottom--) for (let col = 0; col < c.width; col++) if (p[(bottom * c.width + col) * 4 + 3] > 128) break outer;
      this.footRatio = (bottom + 1) / c.height;
    }
    const floor = r.y + r.h * this.footRatio, cx = r.x + r.w / 2;
    this.floor = floor;
    const drift = this.reduced ? 0 : Math.sin(time / 18000) * this.w * 0.018;
    const base = ctx.createLinearGradient(0, 0, 0, this.h);
    base.addColorStop(0, "#f4f1e9");
    base.addColorStop(0.6, "#f0ede5");
    base.addColorStop(1, "#e5e1d7");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, this.w, this.h);
    const light = ctx.createRadialGradient(this.w * 0.36 + drift, this.h * 0.32, 0, this.w * 0.36 + drift, this.h * 0.32, this.w * 0.75);
    light.addColorStop(0, "rgba(255,254,248,.72)");
    light.addColorStop(1, "rgba(255,254,248,0)");
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, this.w, this.h);
    if (!this.grain) {
      this.grain = this.make();
      this.grain.width = this.grain.height = 150;
      const g = this.grain.getContext("2d")!, p = g.createImageData(150, 150);
      let seed = 71;
      for (let i = 0; i < p.data.length; i += 4) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        p.data[i] = p.data[i + 1] = p.data[i + 2] = 40;
        p.data[i + 3] = seed % 7;
      }
      g.putImageData(p, 0, 0);
    }
    ctx.fillStyle = ctx.createPattern(this.grain, "repeat")!;
    ctx.fillRect(0, 0, this.w, this.h);
    // un piano opaco e continuo: le ombre direzionali e di contatto danno la profondita'
    if (!this.grounded) return;
    const plane = ctx.createLinearGradient(0, floor - 50, 0, this.h);
    plane.addColorStop(0, "rgba(221,217,206,0)");
    plane.addColorStop(0.45, "rgba(221,217,206,.25)");
    plane.addColorStop(1, "rgba(216,212,200,.45)");
    ctx.fillStyle = plane;
    ctx.fillRect(0, floor - 50, this.w, this.h - floor + 50);
    const shadow = (x: number, y: number, rx: number, ry: number, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(rx, ry);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, `rgba(35,30,23,${alpha})`);
      g.addColorStop(0.35, `rgba(35,30,23,${alpha * 0.55})`);
      g.addColorStop(1, "rgba(35,30,23,0)");
      ctx.fillStyle = g;
      ctx.fillRect(-1, -1, 2, 2);
      ctx.restore();
    };
    shadow(cx + r.w * 0.13, floor + 9, r.w * 0.55, Math.max(10, r.w * 0.05), 0.12);
    shadow(cx, floor + 1, r.w * 0.23, Math.max(3.5, r.w * 0.012), 0.3);
    shadow(cx, floor - 0.4, r.w * 0.17, Math.max(2, r.w * 0.006), 0.42);
  }

  frame(time: number, full = 0) {
    if (!this.reduced && time - this.lightTime > 120) {
      this.drawBackground(time);
      this.lightTime = time;
    }
    super.frame(time, full);
  }
}
