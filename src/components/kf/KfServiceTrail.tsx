"use client";
import { useEffect, useRef } from "react";
import { BinaryTrail } from "./engine/binary-trail";

/** La scia di cifre binarie sullo sfondo della fascia scura: passando col mouse, per un
 *  attimo si vede la griglia di 0 e 1 sotto i servizi. Solo con il mouse e senza "riduci
 *  movimento". Il canvas riempie la sezione che lo contiene. */
export function KfServiceTrail() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // il canvas e' "sticky" dentro un riquadro che copre la sezione: resta nella finestra mentre si scorre
    const canvas = ref.current, section = canvas?.parentElement?.parentElement;
    if (!canvas || !section) return;
    // senza mouse (telefoni, tablet) o con "riduci movimento" la scia non c'e': il canvas si toglie del tutto, cosi' non
    // resta un livello sticky a tutta schermata da comporre per niente
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(hover: none)").matches) { canvas.hidden = true; return; }
    const font = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim() || "ui-monospace, monospace";
    const engine = new BinaryTrail({ canvas, createCanvas: () => document.createElement("canvas"), width: section.clientWidth, height: innerHeight, dpr: devicePixelRatio, font });
    // con il menu aperto o la pagina nascosta non si disegna nulla
    const blocked = () => document.hidden || document.body.classList.contains("kf-menu-open");
    let running = false, until = 0, raf = 0;
    const draw = (time: number) => {
      if (blocked() || time > until) { engine.clear(); running = false; return; }
      engine.frame(time);
      raf = requestAnimationFrame(draw);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || blocked()) return;
      const r = canvas.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      const time = performance.now(), points = e.getCoalescedEvents?.() ?? [e];
      for (const p of points.length ? points : [e]) engine.input(p.clientX - r.left, p.clientY - r.top, time);
      until = time + 650;
      if (!running) { running = true; raf = requestAnimationFrame(draw); }
    };
    const resize = () => engine.resize(section.clientWidth, innerHeight, devicePixelRatio);
    const clear = () => engine.clear();
    const hide = () => { if (document.hidden) engine.clear(); };
    section.addEventListener("pointermove", move, { passive: true });
    const ro = new ResizeObserver(() => {
      if (Math.abs(section.clientWidth - engine.w) > 1 || Math.abs(innerHeight - engine.h) > 1) resize();
    });
    ro.observe(section);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", clear, { passive: true });
    document.addEventListener("visibilitychange", hide);
    return () => {
      cancelAnimationFrame(raf);
      section.removeEventListener("pointermove", move);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", clear);
      document.removeEventListener("visibilitychange", hide);
      ro.disconnect();
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-clip">
      <canvas ref={ref} className="sticky top-0 block h-[100svh] w-full" />
    </div>
  );
}
