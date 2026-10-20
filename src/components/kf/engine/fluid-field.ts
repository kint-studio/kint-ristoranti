// Flusso incomprimibile del cursore: trasporto della velocita', proiezione della
// pressione e decadimento. La forma viene dalla velocita' simulata, mai da timbri
// casuali. Portato tale e quale dal codice della home "forma".
export type MakeCanvas = () => HTMLCanvasElement;
type Pt = { x: number; y: number };

export type FluidOptions = {
  width: number;
  height: number;
  createCanvas: MakeCanvas;
  radius?: number;
  decay?: number;
  idle?: number;
  force?: number;
  minRadius?: number;
  maxRadius?: number;
  /** risoluzione della maschera rispetto alla larghezza (0,6 per la scena, 0,3 per la scia dei servizi) */
  maskScale?: number;
};

export class FluidField {
  make: MakeCanvas;
  radius: number;
  decay: number;
  idle: number;
  force: number;
  minRadius: number;
  maxRadius: number;
  maskScale: number;
  /** il flusso e' fermo (nessun gesto da un po'): la maschera non cambia e non serve ricalcolarla */
  still = false;
  paintedStill = false;
  width = 0;
  height = 0;
  w = 0;
  h = 0;
  vx = new Float32Array(0);
  vy = new Float32Array(0);
  ax = new Float32Array(0);
  ay = new Float32Array(0);
  pressure = new Float32Array(0);
  pressureNext = new Float32Array(0);
  div = new Float32Array(0);
  pointer: Pt | null = null;
  old: Pt | null = null;
  lastInput = -Infinity;
  lastTime: number | null = null;
  mask!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  pixels!: ImageData;

  constructor({ width, height, createCanvas, radius = 150, decay = 0.945, idle = 900, force = 50, minRadius = 7, maxRadius = 19, maskScale = 0.6 }: FluidOptions) {
    this.make = createCanvas;
    this.radius = radius;
    this.decay = decay;
    this.idle = idle;
    this.force = force;
    this.minRadius = minRadius;
    this.maxRadius = maxRadius;
    this.maskScale = maskScale;
    this.resize(width, height);
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.w = Math.max(48, Math.min(180, Math.round(width * 0.105)));
    this.h = Math.max(48, Math.round((this.w * height) / width));
    const n = this.w * this.h;
    this.vx = new Float32Array(n);
    this.vy = new Float32Array(n);
    this.ax = new Float32Array(n);
    this.ay = new Float32Array(n);
    this.pressure = new Float32Array(n);
    this.pressureNext = new Float32Array(n);
    this.div = new Float32Array(n);
    this.pointer = null;
    this.old = null;
    this.lastInput = -Infinity;
    this.lastTime = null;
    this.still = false;
    this.paintedStill = false;
    this.mask = this.make();
    // almeno 1 px: con una finestra senza altezza (pannello nascosto) createImageData andrebbe in errore
    this.mask.width = Math.max(1, Math.min(800, Math.round(width * this.maskScale)));
    this.mask.height = Math.max(1, Math.round((this.mask.width * height) / width));
    this.context = this.mask.getContext("2d")!;
    this.pixels = this.context.createImageData(this.mask.width, this.mask.height);
    for (let i = 0; i < this.pixels.data.length; i += 4) this.pixels.data[i] = this.pixels.data[i + 1] = this.pixels.data[i + 2] = 255;
  }

  input(x: number, y: number, time: number) {
    const p = { x: x / this.width, y: y / this.height };
    if (!this.pointer || time - this.lastInput > 140) this.old = { ...p };
    this.pointer = p;
    this.lastInput = time;
  }

  sample(a: Float32Array, x: number, y: number) {
    x = Math.max(0.001, Math.min(this.w - 1.001, x));
    y = Math.max(0.001, Math.min(this.h - 1.001, y));
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, i = iy * this.w + ix;
    return (a[i] * (1 - fx) + a[i + 1] * fx) * (1 - fy) + (a[i + this.w] * (1 - fx) + a[i + this.w + 1] * fx) * fy;
  }

  step(time: number) {
    const elapsed = this.lastTime === null ? 1 / 60 : Math.max(0.001, (time - this.lastTime) / 1000);
    this.lastTime = time;
    if (time - this.lastInput > this.idle) {
      this.vx.fill(0);
      this.vy.fill(0);
      this.old = this.pointer ? { ...this.pointer } : null;
      this.still = true;
      return;
    }
    this.still = false;
    const dt = Math.min(elapsed, 0.033) * 0.84, travel = dt * Math.max(this.w, this.h), decay = Math.pow(this.decay, elapsed * 60), w = this.w, h = this.h;
    // si risale la traiettoria e si corregge il punto di partenza, mantenendo le pieghe morbide
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x, ox = x - this.vx[i] * travel, oy = y - this.vy[i] * travel;
        const backX = this.sample(this.vx, ox, oy), backY = this.sample(this.vy, ox, oy);
        const errorX = ox + backX * travel - x, errorY = oy + backY * travel - y;
        const qx = x - errorX * 0.5, qy = y - errorY * 0.5;
        const sx = qx - this.sample(this.vx, qx, qy) * travel, sy = qy - this.sample(this.vy, qx, qy) * travel;
        this.ax[i] = this.sample(this.vx, sx, sy) * decay;
        this.ay[i] = this.sample(this.vy, sx, sy) * decay;
      }
    }
    if (this.pointer && this.old && time - this.lastInput < 100) {
      const fx = (this.pointer.x - this.old.x) * this.force, fy = (this.pointer.y - this.old.y) * this.force;
      const px = this.pointer.x * w, py = this.pointer.y * h;
      const radius = Math.max(this.minRadius, Math.min(this.maxRadius, (this.radius / this.width) * w));
      if (Math.abs(fx) + Math.abs(fy) > 0.000001) {
        for (let y = Math.max(1, Math.floor(py - radius)); y < Math.min(h - 1, py + radius); y++) {
          for (let x = Math.max(1, Math.floor(px - radius)); x < Math.min(w - 1, px + radius); x++) {
            const d = Math.hypot(x - px, y - py) / radius;
            if (d >= 1) continue;
            const falloff = (1 - d) * (1 - d), i = y * w + x;
            this.ax[i] += fx * falloff;
            this.ay[i] += fy * falloff;
          }
        }
      }
      this.old = { ...this.pointer };
    }
    // divergenza e quattro iterazioni di Jacobi per la pressione
    this.pressure.fill(0);
    this.pressureNext.fill(0);
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      this.div[i] = 0.5 * (this.ax[i + 1] - this.ax[i - 1] + this.ay[i + w] - this.ay[i - w]);
    }
    for (let k = 0; k < 4; k++) {
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        this.pressureNext[i] = (this.pressure[i - 1] + this.pressure[i + 1] + this.pressure[i - w] + this.pressure[i + w] - this.div[i]) / 5;
      }
      [this.pressure, this.pressureNext] = [this.pressureNext, this.pressure];
    }
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      this.vx[i] = this.ax[i] - 0.5 * (this.pressure[i + 1] - this.pressure[i - 1]);
      this.vy[i] = this.ay[i] - 0.5 * (this.pressure[i + w] - this.pressure[i - w]);
    }
  }

  paint(ctx: CanvasRenderingContext2D, time: number) {
    this.step(time);
    // fermo e gia' dipinto: la maschera e' quella di prima, basta ridisegnarla (il lavoro pesante e' il ciclo sui pixel)
    if (this.still && this.paintedStill) {
      ctx.drawImage(this.mask, 0, 0, this.width, this.height);
      return;
    }
    const mw = this.mask.width, mh = this.mask.height, data = this.pixels.data;
    for (let y = 0; y < mh; y++) {
      for (let x = 0; x < mw; x++) {
        const gx = (x / (mw - 1)) * (this.w - 1), gy = (y / (mh - 1)) * (this.h - 1);
        const vx = this.sample(this.vx, gx, gy), vy = this.sample(this.vy, gx, gy), speed = Math.hypot(vx, vy);
        const value = speed * (0.55 - 0.22 * Math.max(-1, Math.min(1, vx)));
        let a = Math.max(0, Math.min(1, (value - 0.082) / 0.006));
        a = a * a * (3 - 2 * a);
        data[(y * mw + x) * 4 + 3] = Math.round(a * 255);
      }
    }
    this.context.putImageData(this.pixels, 0, 0);
    ctx.drawImage(this.mask, 0, 0, this.width, this.height);
    this.paintedStill = this.still;
  }
}
