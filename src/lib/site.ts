import type { Metadata } from "next";
import { LANDING } from "./content";
import { LANGS, OG_LOCALE, homeHref, machineHref, type Lang } from "./i18n";
import { translateLanding } from "./landing-i18n";

/** L'indirizzo pubblico della landing, senza "/" finale. Il dominio definitivo non e' ancora deciso: quando lo e',
 *  si cambia solo qui (canonical, hreflang, Open Graph e indirizzo citato nella versione testuale). */
export const SITE_URL = "https://kint-perf.pages.dev";

/** Il sito principale di kint: l'unico link che esce dalla landing (il marchio nel footer). */
export const MAIN_SITE_URL = "https://kint-perf.pages.dev/";

/** Indicizzazione: spenta finche' non c'e' il dominio definitivo. Si accende con NEXT_PUBLIC_INDEX=1. */
export const INDEXABLE = process.env.NEXT_PUBLIC_INDEX === "1";

/** I metadata di una pagina: titolo e descrizione della landing nella lingua, Open Graph, canonical e hreflang. */
export function pageMetadata(lang: Lang, machine: boolean): Metadata {
  const landing = translateLanding(LANDING, lang);
  const href = machine ? machineHref : homeHref;
  const title = machine ? (lang === "it" ? `Machine view: ${landing.label.toLowerCase()}` : `Machine: ${landing.label}`) : landing.meta.title;
  const description = machine && lang === "it" ? "Versione testuale della pagina, per agenti AI e crawler." : landing.meta.description;
  const languages = Object.fromEntries(LANGS.map((l) => [l, href(l)]));
  return {
    metadataBase: new URL(SITE_URL),
    title: `${title} — kint`,
    description,
    alternates: { canonical: href(lang), languages: { ...languages, "x-default": href("it") } },
    openGraph: {
      title: `${title} — kint`,
      description,
      url: href(lang),
      siteName: "kint",
      locale: OG_LOCALE[lang],
      alternateLocale: LANGS.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
      type: "website",
    },
    robots: INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
  };
}
