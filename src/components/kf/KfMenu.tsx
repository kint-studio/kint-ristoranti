"use client";
import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import type { Lang, Ui } from "@/lib/i18n";

// Lo stato aperto/chiuso e' fuori da React: il bottone sta nell'intestazione (dentro la prima sezione) e il pannello
// sta alla radice della pagina, perche' una sezione con `isolate` non potrebbe coprire le altre.
let isOpen = false;
const listeners = new Set<() => void>();
const setOpen = (value: boolean) => { if (isOpen === value) return; isOpen = value; listeners.forEach((l) => l()); };
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const useOpen = () => useSyncExternalStore(subscribe, () => isOpen, () => false);

export type MenuItem = { label: string; href: string };

/** Il bottone a due righe del sito principale: un cerchio con due linee (la seconda piu' corta) che diventano una X. */
export function KfMenuButton({ openLabel = "Apri il menu", closeLabel = "Chiudi il menu" }: { openLabel?: string; closeLabel?: string }) {
  const open = useOpen();
  return (
    <button type="button" className="kf-menu-toggle" aria-label={open ? closeLabel : openLabel} aria-expanded={open} aria-controls="kf-menu" data-open={open} onClick={() => setOpen(!isOpen)}>
      <span /><span />
    </button>
  );
}

/** Il menu a tutto schermo del sito principale: fondo scuro che scende dall'alto, a sinistra la "k." grande e la frase,
 *  a destra le voci grandi. Le voci sono quelle che esistono nella landing. */
export type LangLink = { code: Lang; href: string; current: boolean };

export function KfMenuOverlay({ items, home, ui, langs }: { items: MenuItem[]; home: string; ui: Ui; langs: LangLink[] }) {
  const open = useOpen();

  useEffect(() => {
    document.body.classList.toggle("kf-menu-open", open);
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);
  useEffect(() => () => { document.body.classList.remove("kf-menu-open"); setOpen(false); }, []);

  return (
    <div id="kf-menu" className="kf-menu" data-open={open} inert={!open} role="dialog" aria-modal="true" aria-label={ui.menu.label}>
      <div className="kf-menu-bar">
        <BrandLogo href={home} onDark homeLabel={ui.brandHome} />
        <KfMenuButton openLabel={ui.menu.open} closeLabel={ui.menu.close} />
      </div>
      <div className="kf-menu-caption">
        <span className="kf-menu-k">k.</span>
        <p>{ui.menu.caption[0]}<br />{ui.menu.caption[1]}</p>
        <span className="kf-mono">{ui.menu.micro}</span>
        {/* le lingue stanno qui, come nel sito principale: stessa pagina nella lingua scelta */}
        <nav className="kf-mono kf-lang-switch" aria-label={ui.menu.lang}>
          {langs.map((l, i) => (
            <span key={l.code} className="contents">
              {i > 0 && <i aria-hidden="true">|</i>}
              <Link href={l.href} hrefLang={l.code} lang={l.code} aria-current={l.current ? "true" : undefined} onClick={() => setOpen(false)}>{l.code.toUpperCase()}</Link>
            </span>
          ))}
        </nav>
      </div>
      <nav aria-label={ui.menu.nav} className="kf-menu-nav">
        {items.map((it) => (
          <a key={it.href} href={it.href} onClick={() => setOpen(false)}>{it.label}</a>
        ))}
      </nav>
    </div>
  );
}
