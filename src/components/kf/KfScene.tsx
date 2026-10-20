"use client";
import { useEffect, useRef } from "react";
import type { DepthStyle, Rect } from "./engine/depth-surface";
import { IdleCursor } from "./engine/idle-cursor";
import { loadFork3D } from "./engine/fork-3d";
import { loadMaterial } from "./engine/material-loader";
import { FORMATION_DONE_MS, SceneEngine } from "./engine/scene-engine";
import { FORK_IMAGES } from "./fork-images";

/** Dove sta il disegno dentro l'immagine (frazioni 0-1), misurato una volta sull'immagine: cosi' la pagina sa quanto
 *  sara' grande la forchetta prima ancora di scaricare l'immagine e puo' iniziare subito. */
type Bounds = { top: number; bottom: number; left: number; right: number };
const BOUNDS: Bounds = { top: 0.042, bottom: 0.958, left: 0.417, right: 0.625 };

/** Il rilievo con cui la forchetta gira verso il cursore (senza WebGL2): uno spessore vicino al vero, perche' una
 *  cupola "piegava" l'oggetto sottile e strappava i rebbi. */
const DEPTH_STYLE: DepthStyle = { kind: "lineare", gain: 0.5, cap: 0.025 };

/** La forchetta sta grande al centro della schermata, come il vaso nell'hero del sito principale (alta il 68% dello
 *  schermo); il testo sta in basso a destra e su telefono sotto l'oggetto. */
function layout(w: number, h: number): Rect {
  const b = BOUNDS;
  const wf = Math.max(0.2, b.right - b.left), hf = Math.max(0.45, b.bottom - b.top), cx = (b.left + b.right) / 2;
  if (w >= 760) {
    const ih = Math.min((h * 0.68) / hf, (w * 0.36) / (wf * (2 / 3))), iw = (ih * 2) / 3;
    return { x: w * 0.5 - iw * cx, y: h * 0.9 - ih * b.bottom, w: iw, h: ih };
  }
  // telefono: fra l'intestazione e il blocco di testo in basso
  const ih = Math.min(Math.min(h * 0.44, 370) / hf, (w * 0.95) / (wf * (2 / 3))), iw = (ih * 2) / 3;
  return { x: w * 0.5 - iw * cx, y: h - 266 - ih * b.bottom, w: iw, h: ih };
}

/** Risoluzione massima del disegno rispetto ai pixel CSS: 2 sui telefoni (sono a 3x e a 1,5 sgranano), 1,5 sul computer. */
function maxDprFor(touch: boolean) {
  return touch ? 2 : 1.5;
}

/** L'immagine con l'oro piu' piccola che basta per la grandezza a cui la forchetta viene disegnata: 2048 px
 *  (`forchetta3-kintsugi.webp`), 1024 o 640. I dispositivi a tocco non scaricano mai quella da 2048 px. */
function goldImageUrl(rectWidth: number) {
  const touch = matchMedia("(hover: none)").matches;
  const need = rectWidth * Math.min(devicePixelRatio, maxDprFor(touch));
  const size = need <= 560 ? "-640" : need <= 1024 || touch ? "-1024" : "";
  return `/forma/forchetta3-kintsugi${size}.webp`;
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

/** La scena della home "forma" con la forchetta al posto del vaso: la forchetta si forma da cifre binarie, poi diventa
 *  un oggetto 3D che gira verso il cursore. Riempie tutta la sezione che la contiene (la sezione deve essere `relative`). */
export function KfScene({ caption = "Le idee prendono forma" }: { caption?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SceneEngine | null>(null);
  const idleRef = useRef(new IdleCursor());

  useEffect(() => {
    const el = wrap.current, cv = canvas.current, cursor = ring.current;
    if (!el || !cv || !cursor) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches, touch = matchMedia("(hover: none)").matches;
    const idle = idleRef.current;
    let alive = true, visible = false, pageVisible = !document.hidden, last = 0, raf = 0;
    const cleanups: (() => void)[] = [];

    (async () => {
      const box = el.getBoundingClientRect();
      const goldUrl = goldImageUrl(layout(box.width, box.height).w);
      // la forchetta non e' un'immagine: la disegna la GPU da due piccole texture, e l'immagine della sagoma serve solo a
      // disegnare le cifre (basta la piu' piccola). Se il browser non ha WebGL2 si torna alla foto deformata, con l'oro
      // e il materiale calcolato in un worker.
      const fork3dPromise = loadFork3D({ a: FORK_IMAGES.a, b: FORK_IMAGES.b }, () => document.createElement("canvas"));
      const [base, fork3d] = await Promise.all([loadImage(FORK_IMAGES.ceramic640), fork3dPromise]);
      const goldImage = fork3d ? null : loadImage(goldUrl);
      goldImage?.catch(() => {});
      if (!alive) return;
      const engine = new SceneEngine({ canvas: cv, createCanvas: () => document.createElement("canvas"), base, width: box.width, height: box.height, dpr: devicePixelRatio, reduced, maxDpr: maxDprFor(touch), layout, grounded: false, depthStyle: DEPTH_STYLE, fork3d: fork3d ?? undefined });
      engineRef.current = engine;
      // il materiale sotto il varco si calcola in un worker: la pagina non si blocca
      // la forchetta e' d'argento satinato: resta argento anche sotto il varco
      if (goldImage) loadMaterial(goldUrl, () => goldImage, true).then((tech) => { if (alive) engine.setTech(tech); }).catch(() => {});

      // Quando la scena e' ferma (formazione finita, nessun cursore, nessun gesto) non serve ridisegnarla a 60 fps: si
      // disegna a 4 fotogrammi al secondo (basta a far scorrere la luce del fondo). Cosi' si puo' tenere una risoluzione
      // piu' alta sul telefono senza fare scattare ne' scaldare il dispositivo.
      let activeUntil = 0, lastDraw = 0;
      const wake = (t = performance.now()) => { activeUntil = Math.max(activeUntil, t + 1800); };
      // ogni gesto vero ferma il cursore automatico
      const cancelIdle = () => { if (idle.activity() && engine.flow) { engine.flow.pointer = null; engine.flow.old = null; } };
      const pointer = (e: PointerEvent) => {
        if (!engine.done || (e.target as Element | null)?.closest?.("a,button,input,textarea,summary")) return;
        wake();
        const r = el.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
        if (!reduced) engine.setPointer(e.clientX - r.left, e.clientY - r.top);
        const t = performance.now(), points = e.getCoalescedEvents?.() ?? [e];
        for (const p of points.length ? points : [e]) engine.addPointer(p.clientX - r.left, p.clientY - r.top, t);
        cursor.style.left = `${e.clientX - r.left}px`;
        cursor.style.top = `${e.clientY - r.top}px`;
        cursor.style.opacity = e.pointerType === "mouse" ? "1" : "0";
      };
      const leave = () => { cursor.style.opacity = "0"; engine.resetPointer(); };
      window.addEventListener("pointermove", cancelIdle, { capture: true, passive: true });
      window.addEventListener("pointerdown", cancelIdle, { capture: true, passive: true });
      window.addEventListener("pointermove", pointer, { capture: true, passive: true });
      el.parentElement?.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        window.removeEventListener("pointermove", cancelIdle, { capture: true });
        window.removeEventListener("pointerdown", cancelIdle, { capture: true });
        window.removeEventListener("pointermove", pointer, { capture: true });
        el.parentElement?.removeEventListener("pointerleave", leave);
      });

      const ro = new ResizeObserver(() => {
        const r = el.getBoundingClientRect();
        if (Math.abs(engine.w - r.width) > 1 || Math.abs(engine.h - r.height) > 1) { engine.resize(r.width, r.height, devicePixelRatio); wake(); }
      });
      ro.observe(el);
      const io = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        last = 0;
        if (entries[0].intersectionRatio >= 0.35 && !engine.started) {
          engine.start();
          if (reduced) engine.elapsed = FORMATION_DONE_MS;
        }
      }, { threshold: [0, 0.35] });
      io.observe(el);
      const onVisibility = () => { pageVisible = !document.hidden; last = 0; wake(); };
      document.addEventListener("visibilitychange", onVisibility);
      cleanups.push(() => { ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", onVisibility); });

      const frame = (time: number) => {
        raf = requestAnimationFrame(frame);
        if (!visible || !pageVisible) { idle.suspend(); last = 0; return; }
        const dt = last ? Math.min((time - last) / 1000, 0.05) : 0;
        last = time;
        engine.advance(dt);
        const auto = idle.step(dt, !reduced && engine.done);
        if (auto) {
          // il cursore automatico percorre l'oggetto, non tutta la sezione
          const r = engine.rect;
          engine.addPointer(r.x + ((auto.x + 1) / 2) * r.w, r.y + ((1 - auto.y) / 2) * r.h, time);
          // sul telefono non c'e' il mouse: la forchetta 3D gira piano da sola, seguendo lo stesso percorso del varco
          if (touch) engine.setPose(auto.x * 0.32, auto.y * 0.2);
          cursor.style.opacity = "0";
          wake(time);
        }
        if (!engine.done) wake(time);
        // ferma: 4 fotogrammi al secondo
        if (time > activeUntil && time - lastDraw < 250) return;
        lastDraw = time;
        engine.frame(time, 0);
      };
      engine.frame(performance.now());
      raf = requestAnimationFrame(frame);
    })().catch(() => {
      // senza la scena (immagini mancanti, canvas non disponibile) resta la sezione con il solo testo
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      cleanups.forEach((c) => c());
      engineRef.current = null;
    };
  }, []);

  return (
    <>
      <div ref={wrap} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <canvas ref={canvas} className="block h-full w-full" />
        <div ref={ring} className="kf-cursor"><i /></div>
      </div>
      <div className="kf-mono absolute inset-x-[var(--kf-gutter)] bottom-5 z-10 text-[var(--kf-soft)] md:bottom-6">
        <a href="#servizi" className="flex items-center gap-4 transition-opacity hover:opacity-70">{caption} <span aria-hidden="true" className="text-base">↓</span></a>
      </div>
    </>
  );
}
