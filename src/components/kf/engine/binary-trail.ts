// La scia di cifre binarie della sezione servizi: lo stesso flusso del vaso, regolato
// per una striscia stretta e di breve durata. Portato dal codice della home "forma".
import { FluidField, type MakeCanvas } from "./fluid-field";

const hash = (x: number, y: number) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };

// Dimensione di una cifra (come il sito principale): meno celle da disegnare e una griglia piu' larga
const CELL_W = 7.5, CELL_H = 11.25;
type Cell = { x: number; y: number; group: number; alpha: number; epoch: number | null };

export class BinaryTrail {
  canvas: HTMLCanvasElement;
  make: MakeCanvas;
  mask: HTMLCanvasElement;
  print: HTMLCanvasElement;
  font: string;
  w = 0;
  h = 0;
  dpr = 1;
  tick = -1;
  cells: Cell[] = [];
  cleared = false;
  flow!: FluidField;

  /** `font`: il nome vero della famiglia (il canvas non risolve var()) */
  constructor({ canvas, createCanvas, width, height, dpr = 1, font }: { canvas: HTMLCanvasElement; createCanvas: MakeCanvas; width: number; height: number; dpr?: number; font: string }) {
    this.canvas = canvas;
    this.make = createCanvas;
    this.font = font;
    this.mask = this.make();
    this.print = this.make();
    this.resize(width, height, dpr);
  }

  resize(w: number, h: number, dpr = 1) {
    this.w = w;
    this.h = h;
    this.dpr = Math.min(dpr, 1.5);
    for (const c of [this.canvas, this.mask, this.print]) {
      c.width = Math.round(w * this.dpr);
      c.height = Math.round(h * this.dpr);
      c.getContext("2d")!.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
    this.flow = new FluidField({ width: w, height: h, createCanvas: this.make, radius: 52, minRadius: 3, maxRadius: 10, decay: 0.915, idle: 580, force: 45, maskScale: 0.3 });
    this.tick = -1;
    // le celle si calcolano una volta: a ogni passo cambia solo un ottavo delle cifre, non tutte
    this.cells = [];
    for (let y = CELL_H / 2; y < h; y += CELL_H) for (let x = CELL_W / 2; x < w; x += CELL_W) this.cells.push({ x, y, group: (x * 7 + y * 13) % 8, alpha: 0.55 + hash(x, y) * 0.4, epoch: null });
    this.cleared = false;
  }

  input(x: number, y: number, time: number) { this.cleared = false; this.flow.input(x, y, time); }

  /** Una sola volta: le chiamate ripetute (a ogni scroll) non fanno nulla. */
  clear() {
    if (this.cleared) return;
    this.cleared = true;
    this.flow.vx.fill(0);
    this.flow.vy.fill(0);
    this.flow.pointer = this.flow.old = null;
    this.flow.lastInput = -Infinity;
    this.flow.still = false;
    this.flow.paintedStill = false;
    this.canvas.getContext("2d")!.clearRect(0, 0, this.w, this.h);
  }

  frame(time: number) {
    this.cleared = false;
    const mask = this.mask.getContext("2d")!;
    mask.clearRect(0, 0, this.w, this.h);
    this.flow.paint(mask, time);
    const tick = Math.floor(time / 300);
    if (tick !== this.tick) {
      const first = this.tick < 0;
      this.tick = tick;
      const print = this.print.getContext("2d")!;
      if (first) print.clearRect(0, 0, this.w, this.h);
      print.font = `10px ${this.font}`;
      print.textAlign = "center";
      print.textBaseline = "middle";
      print.fillStyle = "#f2f3e9";
      for (const c of this.cells) {
        const epoch = Math.floor((tick + c.group) / 8);
        if (!first && epoch === c.epoch) continue;
        c.epoch = epoch;
        if (!first) print.clearRect(c.x - CELL_W / 2, c.y - CELL_H / 2, CELL_W, CELL_H);
        print.globalAlpha = c.alpha;
        print.fillText(hash(c.x + epoch, c.y) > 0.5 ? "1" : "0", c.x, c.y);
      }
      print.globalAlpha = 1;
    }
    const out = this.canvas.getContext("2d")!;
    out.clearRect(0, 0, this.w, this.h);
    out.drawImage(this.print, 0, 0, this.w, this.h);
    out.globalCompositeOperation = "destination-in";
    out.drawImage(this.mask, 0, 0, this.w, this.h);
    out.globalCompositeOperation = "source-over";
  }
}
