import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FORK_IMAGES } from "../components/kf/fork-images";
import { LANDING } from "./content";
import { EXTRA_LANGS, LANGS, UI, homeHref, machineHref } from "./i18n";
import { TRANSLATIONS, translateLanding } from "./landing-i18n";

const APP = join(__dirname, "..", "app");

/** Il file pagina che serve un indirizzo: l'italiano sta nel gruppo (it), le altre lingue sotto [lang]. */
function pageFile(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts[0] && (EXTRA_LANGS as readonly string[]).includes(parts[0])) return join(APP, "[lang]", ...parts.slice(1), "page.tsx");
  return join(APP, "(it)", ...parts, "page.tsx");
}

describe("indirizzi", () => {
  const expected = ["/", "/machine", "/en", "/en/machine", "/fr", "/fr/machine", "/de", "/de/machine"];

  it("ogni lingua ha la landing e la versione Machine", () => {
    expect(LANGS.flatMap((l) => [homeHref(l), machineHref(l)])).toEqual(expected);
  });

  it.each(expected)("%s ha il suo file pagina", (path) => {
    expect(existsSync(pageFile(path))).toBe(true);
  });

  it("il layout delle lingue genera solo en, fr e de, e nient'altro", () => {
    const layout = readFileSync(join(APP, "[lang]", "layout.tsx"), "utf8");
    expect(layout).toContain("export const dynamicParams = false");
    expect(layout).toContain("EXTRA_LANGS.map((lang) => ({ lang }))");
    expect([...EXTRA_LANGS]).toEqual(["en", "fr", "de"]);
  });
});

/** Le chiavi di un oggetto, in profondita' ("a.b.c"); gli array contano per lunghezza. */
function keys(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) return [`${prefix}[${value.length}]`, ...value.flatMap((v, i) => keys(v, `${prefix}[${i}]`))];
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
  return [prefix];
}

describe("traduzioni", () => {
  it.each(EXTRA_LANGS)("l'interfaccia in %s ha tutte le chiavi dell'italiano", (lang) => {
    expect(keys(UI[lang]).sort()).toEqual(keys(UI.it).sort());
  });

  it.each(EXTRA_LANGS)("la landing in %s traduce ogni servizio, ogni punto e ogni domanda", (lang) => {
    const t = TRANSLATIONS[lang];
    expect(Object.keys(t.services).sort()).toEqual(LANDING.services.map((s) => s.id).sort());
    for (const s of LANDING.services) expect(t.services[s.id].points).toHaveLength(s.points.length);
    expect(t.faq).toHaveLength(LANDING.faq.length);
    expect(keys(translateLanding(LANDING, lang)).sort()).toEqual(keys(LANDING).sort());
  });

  it.each(EXTRA_LANGS)("nessun testo in %s e' vuoto", (lang) => {
    const empty = keys(TRANSLATIONS[lang]).filter((k) => {
      const v = k.split(/\.|\[|\]/).filter(Boolean).reduce<unknown>((o, p) => (o as Record<string, unknown>)[p], TRANSLATIONS[lang]);
      return typeof v === "string" && v.trim() === "";
    });
    expect(empty).toEqual([]);
  });
});

describe("immagini", () => {
  it.each(Object.values(FORK_IMAGES))("%s esiste in public/", (src) => {
    expect(existsSync(join(__dirname, "..", "..", "public", src))).toBe(true);
  });
});
