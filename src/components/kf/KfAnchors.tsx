"use client";
import { useEffect } from "react";
import { useLenis } from "lenis/react";

/** Fa funzionare i link interni (#servizi, #prenota, #top) della landing.
 *  Con Lenis attivo il salto nativo dell'ancora non e' affidabile (su Safari finiva
 *  sempre in cima), quindi la posizione si calcola a mano e si scorre con Lenis;
 *  a fine corsa un controllo forza l'arrivo se qualcosa l'ha fermato prima.
 *  Non si tocca la cronologia: il router di Next la rilegge e riporta in cima. */
export function KfAnchors() {
  const lenis = useLenis();
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
      if (!a) return;
      const id = decodeURIComponent((a.getAttribute("href") ?? "").slice(1));
      const target = id ? document.getElementById(id) : null;
      if (id && !target) return;
      e.preventDefault();
      const go = () => {
        const max = () => document.documentElement.scrollHeight - window.innerHeight;
        const dest = () => (target ? Math.min(max(), Math.max(0, target.getBoundingClientRect().top + window.scrollY)) : 0);
        if (lenis) lenis.scrollTo(dest(), { immediate: reduced });
        else window.scrollTo({ top: dest(), behavior: reduced ? "auto" : "smooth" });
        // Rete di sicurezza: se dopo l'animazione non siamo arrivati, ci si va di forza.
        window.setTimeout(() => {
          if (Math.abs(window.scrollY - dest()) > 4) {
            lenis?.stop();
            window.scrollTo({ top: dest(), behavior: "instant" });
            lenis?.start();
          }
        }, reduced ? 50 : 1800);
      };
      if (document.body.classList.contains("kf-menu-open")) window.setTimeout(go, 80);
      else go();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenis]);
  return null;
}
