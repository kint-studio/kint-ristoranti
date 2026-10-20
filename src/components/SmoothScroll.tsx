"use client";
import { useEffect } from "react";
import { ReactLenis } from "lenis/react";

/** Lo scroll morbido della pagina (Lenis). `KfAnchors` lo usa per i link interni (#servizi, #prenota, #top). */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  // iOS Safari non applica `:active` se il documento non ha almeno un gestore
  // di tocco: un listener passivo che non fa nulla basta a sbloccarlo.
  useEffect(() => {
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    return () => document.removeEventListener("touchstart", noop);
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.09, duration: 1.2, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
