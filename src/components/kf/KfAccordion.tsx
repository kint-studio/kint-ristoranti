"use client";
import { useState } from "react";

export type KfItem = { key: string; num?: string; title: string; body: React.ReactNode };

/** Elenco che si apre riga per riga, come i servizi del sito "forma": numero in
 *  mono, titolo grande, "+" che diventa "x". Una sola riga aperta alla volta.
 *  `dark` per la sezione scura, `paper` per quella chiara. */
export function KfAccordion({ items, variant, defaultOpen = null }: { items: KfItem[]; variant: "dark" | "paper"; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const dark = variant === "dark";
  return (
    <div className={`border-b ${dark ? "border-[#efebe2]/20" : "border-[var(--kf-line)]"}`}>
      {items.map((it, i) => {
        const isOpen = open === i;
        const id = `kf-${variant}-${i}`;
        return (
          <div key={it.key} className={`border-t ${dark ? "border-[#efebe2]/20" : "border-[var(--kf-line)]"}`}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={id}
                onClick={() => setOpen(isOpen ? null : i)}
                className={`group grid w-full items-center gap-3 py-5 text-left md:gap-6 md:py-7 ${it.num ? "grid-cols-[2.2rem_1fr_2rem] md:grid-cols-[4.5rem_1fr_3rem]" : "grid-cols-[1fr_2rem] md:grid-cols-[1fr_3rem]"}`}
              >
                {it.num && <span className={`kf-mono ${dark ? "text-[#efebe2]/55" : "text-[var(--kf-muted)]"}`}>{it.num}</span>}
                <span
                  className={`kf-display transition-colors duration-300 ${
                    dark
                      ? `text-[clamp(30px,4.6vw,72px)] leading-[1.02] tracking-[-0.045em] ${isOpen ? "text-[#efebe2]" : "text-[#efebe2]/40 group-hover:text-[#efebe2]/75"}`
                      : `text-[clamp(20px,2.4vw,32px)] leading-[1.15] tracking-[-0.03em] ${isOpen ? "text-[var(--kf-ink)]" : "text-[var(--kf-ink)]/80 group-hover:text-[var(--kf-ink)]"}`
                  }`}
                >
                  {it.title}
                </span>
                <span aria-hidden="true" className={`justify-self-end text-3xl font-light leading-none text-[var(--kf-gold)] transition-transform duration-500 ${isOpen ? "rotate-45" : ""}`}>+</span>
              </button>
            </h3>
            <div id={id} role="region" className="kf-panel" data-open={isOpen} inert={!isOpen}>
              <div>
                <div className={`${it.num ? "pl-[2.95rem] md:pl-[6rem]" : ""} pb-8 pr-4 md:pb-12`}>{it.body}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
