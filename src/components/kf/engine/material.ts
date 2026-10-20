// Il "materiale tecnico" dell'oggetto: la foto con le giunture d'oro diventa un metallo scuro (o argento satinato),
// l'oro resta oro e sopra corrono una griglia verde e delle linee di scansione. Il calcolo e' un lavoro a fette
// (`step`): puo' girare in un worker, fuori dal thread principale, oppure a pezzi nei tempi morti della pagina.
// Portato dal sito principale (material.js), con in piu' la variante satinata per gli oggetti d'argento.
type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;
type AnyContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
export type MakeAnyCanvas = () => AnyCanvas;
type Source = CanvasImageSource & { width: number; height: number };

const sm = (a: number, z: number, v: number) => { const t = Math.max(0, Math.min(1, (v - a) / (z - a))); return t * t * (3 - 2 * t); };

export function materialJob(gold: Source, make: MakeAnyCanvas, satin = false) {
  let canvas: AnyCanvas | undefined, x: AnyContext, pixels: ImageData, row = 0;
  return {
    get canvas() { return canvas as AnyCanvas; },
    /** Calcola righe finche' non finisce il budget (ms). true quando il materiale e' pronto. */
    step(budgetMs: number): boolean {
      const t0 = performance.now();
      if (!canvas) {
        canvas = make();
        canvas.width = gold.width;
        canvas.height = gold.height;
        x = canvas.getContext("2d", { willReadFrequently: true }) as AnyContext;
        x.drawImage(gold, 0, 0);
        pixels = x.getImageData(0, 0, canvas.width, canvas.height);
      }
      const c = canvas;
      if (row < c.height) {
        while (row < c.height) {
          const end = (row + 1) * c.width * 4;
          for (let i = row * c.width * 4; i < end; i += 4) {
            const r = pixels.data[i] / 255, g = pixels.data[i + 1] / 255, b = pixels.data[i + 2] / 255, l = r * 0.299 + g * 0.587 + b * 0.114;
            const metallic = sm(0.16, 0.3, r - b) * sm(0.04, 0.16, g - b);
            const spec = Math.pow(l, 6) * 0.1;
            // argento satinato: stessi riflessi dell'oggetto ma schiacciati verso il grigio medio, con una lieve nota fredda
            const silver = 0.3 + 0.46 * l;
            for (let k = 0; k < 3; k++) {
              const shimmer = Math.pow(Math.max(0, Math.sin(((i / 4) % c.width) / c.width * 11 + Math.floor(i / 4 / c.width) / c.height * 19)), 12) * 0.14;
              const dark = satin ? silver * [0.97, 0.985, 1][k] : [0.085, 0.086, 0.082][k] * (l * 0.85 + 0.3) + spec + shimmer * 0.65;
              pixels.data[i + k] = Math.round(255 * (dark * (1 - metallic) + [r, g, b][k] * metallic));
            }
          }
          row++;
          if (performance.now() - t0 >= budgetMs) break;
        }
        if (row < c.height) return false;
      }
      x.putImageData(pixels, 0, 0);
      x.save();
      x.globalAlpha = 0.28;
      x.strokeStyle = "#c7eeaf";
      x.lineWidth = 0.55;
      for (let col = 0; col < 29; col++) {
        x.beginPath();
        for (let y = 0; y <= c.height; y += 15) x.lineTo((col * c.width) / 28 + Math.sin((y / c.height) * Math.PI) * 45, y);
        x.stroke();
      }
      for (let y = 0; y < c.height; y += 36) {
        x.beginPath();
        x.moveTo(0, y);
        x.quadraticCurveTo(c.width / 2, y + 30, c.width, y);
        x.stroke();
      }
      x.restore();
      x.save();
      x.globalAlpha = 0.18;
      x.fillStyle = "#b9e4ce";
      for (let yy = 0; yy < c.height; yy += 8) x.fillRect(0, yy, c.width, 0.8);
      x.globalAlpha = 0.7;
      for (let xx = 80; xx < c.width; xx += 160) for (let yy = 90; yy < c.height; yy += 160) { x.fillRect(xx - 3, yy - 0.5, 6, 1); x.fillRect(xx - 0.5, yy - 3, 1, 6); }
      x.restore();
      x.globalCompositeOperation = "destination-in";
      x.drawImage(gold, 0, 0);
      x.globalCompositeOperation = "source-over";
      return true;
    },
  };
}

/** Lo stesso calcolo a pezzi nei tempi morti della pagina, per i browser senza worker. */
export function buildMaterial(gold: Source, make: MakeAnyCanvas, satin: boolean, budget = 6): Promise<AnyCanvas> {
  const job = materialJob(gold, make, satin);
  const idle = typeof requestIdleCallback === "function" ? requestIdleCallback : undefined;
  return new Promise((resolve, reject) => {
    const run = (deadline?: IdleDeadline) => {
      try {
        if (job.step(deadline ? Math.max(1, deadline.timeRemaining() - 1) : budget)) resolve(job.canvas);
        else schedule();
      } catch (error) { reject(error); }
    };
    const schedule = () => (idle ? idle(run, { timeout: 200 }) : setTimeout(run, 0));
    schedule();
  });
}
