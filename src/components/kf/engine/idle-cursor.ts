// Cursore "fantasma": quando nessuno muove il mouse, dopo un paio di secondi percorre
// l'oggetto da solo, cosi' il varco con le giunture d'oro si vede anche da fermi.
// Portato dal codice della home "forma".
const power1InOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function idlePosition(seconds: number) {
  const t = ((seconds % 9.5) + 9.5) % 9.5;
  let x: number, y: number;
  if (t < 2.5) { y = t / 2.5; x = power1InOut(y); }
  else if (t < 4) { x = 1; y = 1; }
  else if (t < 6.5) { const p = (t - 4) / 2.5; y = 1 - p; x = 1 - power1InOut(p); }
  else { x = 0; y = 0; }
  return { x: -Math.cos(x * Math.PI * 4) * 0.75, y: Math.cos(y * Math.PI) * 0.5 };
}

export class IdleCursor {
  wait = 2.5;
  elapsed = 0;
  running = false;

  /** chiamato a ogni gesto vero: ferma il cursore automatico e dice se stava girando */
  activity() {
    const was = this.running;
    this.wait = 2;
    this.elapsed = 0;
    this.running = false;
    return was;
  }

  suspend() {
    this.elapsed = 0;
    this.running = false;
    this.wait = 2.5;
  }

  step(dt: number, enabled: boolean) {
    if (!enabled) { this.suspend(); return null; }
    if (!this.running) {
      this.wait -= dt;
      if (this.wait > 0) return null;
      this.running = true;
      this.elapsed = 0;
    } else this.elapsed += dt;
    return idlePosition(this.elapsed);
  }
}
