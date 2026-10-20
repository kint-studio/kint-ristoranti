import Link from "next/link";
import { UI, homeHref, machineHref, type Lang, type Ui } from "@/lib/i18n";

/** Selettore fra la pagina normale e la sua versione "machine" (testo puro,
 *  per agenti AI e crawler). Sono due indirizzi diversi, `/` e `/machine` (o `/en`
 *  e `/en/machine`...), cosi' anche chi non esegue JavaScript vede la versione testuale. */
export function ViewSwitch({ lang, current, ui = UI.it }: { lang: Lang; current: "normal" | "machine"; ui?: Ui }) {
  const item = (active: boolean, href: string, label: string) => (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-4 py-1.5 font-mono text-xs uppercase tracking-[0.14em] transition-colors ${active ? "bg-white/10 text-[#d3bd87]" : "text-[#efebe2]/75 hover:text-[#efebe2]"}`}
    >
      {label}
    </Link>
  );
  return (
    <nav data-view-switch aria-label={ui.view.aria} className="fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-[#171915]/95 p-1 shadow-[0_10px_30px_-10px_rgba(0,0,0,.5)] backdrop-blur-xl">
      {item(current === "normal", homeHref(lang), ui.view.normal)}
      {item(current === "machine", machineHref(lang), ui.view.machine)}
    </nav>
  );
}
