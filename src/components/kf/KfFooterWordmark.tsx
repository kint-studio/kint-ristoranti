"use client";
import { useEffect, useRef } from "react";

/** Il marchio gigante del footer: "kint." scalato in modo che l'inchiostro vero delle
 *  lettere (non il riquadro del testo) riempia esattamente la larghezza. Si misura
 *  carattere per carattere, compreso il puntino colorato a parte. Portato dal codice
 *  della home "forma". */
export function KfFooterWordmark({ label = "kint, torna all'inizio" }: { label?: string }) {
  const link = useRef<HTMLAnchorElement>(null);
  const type = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = link.current, t = type.current;
    if (!el || !t) return;
    const ctx = document.createElement("canvas").getContext("2d")!;
    let queued = false, lastWidth = 0;
    const fit = () => {
      const width = el.clientWidth;
      if (!width || Math.abs(width - lastWidth) < 0.1) return;
      lastWidth = width;
      el.style.fontSize = "100px";
      let size = 100;
      // un secondo passaggio misura alla scala finale, per gli arrotondamenti del raster dei glifi
      for (let pass = 0; pass < 2; pass++) {
        t.style.transform = "none";
        const origin = el.getBoundingClientRect().left;
        const walker = document.createTreeWalker(t, NodeFilter.SHOW_TEXT), range = document.createRange();
        let node: Node | null, left = Infinity, right = -Infinity;
        while ((node = walker.nextNode())) {
          const text = node as Text, style = getComputedStyle(text.parentElement!);
          ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
          for (let i = 0; i < text.length; i++) {
            range.setStart(text, i);
            range.setEnd(text, i + 1);
            const box = range.getBoundingClientRect(), ink = ctx.measureText(text.data[i]);
            left = Math.min(left, box.left - origin - ink.actualBoundingBoxLeft);
            right = Math.max(right, box.left - origin + ink.actualBoundingBoxRight);
          }
        }
        if (!Number.isFinite(left) || !Number.isFinite(right)) { el.style.removeProperty("font-size"); return; }
        const guard = 2, scale = Math.max(1, width - 2 * guard) / Math.max(1, right - left);
        size *= scale;
        el.style.fontSize = `${size}px`;
        t.style.transform = `translateX(${guard - left * scale}px)`;
      }
    };
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; fit(); });
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    window.addEventListener("resize", schedule, { passive: true });
    const onFonts = () => { lastWidth = 0; schedule(); };
    document.fonts.addEventListener("loadingdone", onFonts);
    document.fonts.ready.then(onFonts);
    fit();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      document.fonts.removeEventListener("loadingdone", onFonts);
    };
  }, []);

  return (
    <a ref={link} href="#top" aria-label={label} className="kf-wordmark">
      <span ref={type} className="kf-wordmark-type">kint<span className="kf-wordmark-dot">.</span></span>
    </a>
  );
}
