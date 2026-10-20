import Link from "next/link";
import { ViewSwitch } from "@/components/machine/ViewSwitch";
import { SITE, type Landing } from "@/lib/content";
import { LANGS, UI, homeHref, langBase, machineHref, type Lang } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

// "KINT" in ANSI Shadow: la stessa idea dell'indice testuale di basement.studio
const ASCII = [
  "██╗  ██╗██╗███╗   ██╗████████╗",
  "██║ ██╔╝██║████╗  ██║╚══██╔══╝",
  "█████╔╝ ██║██╔██╗ ██║   ██║   ",
  "██╔═██╗ ██║██║╚██╗██║   ██║   ",
  "██║  ██╗██║██║ ╚████║   ██║   ",
  "╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝   ╚═╝   ",
].join("\n");

function Rule({ id, label }: { id: string; label: string }) {
  return (
    <h2 id={id} className="mb-4 mt-12 flex scroll-mt-6 items-center gap-3 text-xs font-normal tracking-[0.18em] text-gold">
      <span aria-hidden="true">──</span>
      {label}
      <span aria-hidden="true" className="h-px flex-1 bg-gold/40" />
    </h2>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-x-3 py-0.5 md:grid-cols-[9rem_1fr]">
      <dt className="whitespace-pre text-gold">
        {k} <span className="opacity-50">{".".repeat(Math.max(2, 12 - k.length))}</span>
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

/** La landing come testo puro, a tutto schermo: titoli, servizi, domande e
 *  contatto, senza grafica. Scorre da sola: `data-lenis-prevent` dice allo
 *  scroll morbido di non intercettare la rotella. */
export function MachineView({ landing, lang = "it" }: { landing: Landing; lang?: Lang }) {
  const { title, subtitle, services, faq, label } = landing;
  const ui = UI[lang], m = ui.machine;
  const home = homeHref(lang);
  // l'indirizzo della landing citato nella nota: dominio da SITE_URL (senza https://), piu' la lingua
  const url = `${SITE_URL.replace(/^https?:\/\//, "")}${langBase(lang)}`;
  return (
    <div data-lenis-prevent className="fixed inset-0 z-[90] overflow-y-auto bg-bg font-mono text-[13px] uppercase leading-relaxed text-ink/85 md:text-sm">
      <main className="mx-auto max-w-3xl px-6 pb-32 pt-10">
        <pre aria-hidden="true" className="overflow-x-auto text-[11px] leading-[1.1] text-gold sm:text-sm" style={{ fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace" }}>{ASCII}</pre>
        <p className="sr-only">{SITE.name}</p>

        <nav aria-label={ui.footer.sections} className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-xs tracking-[0.12em]">
          <Link href={home} className="bg-gold px-1.5 text-[#0b0a09]">{m.normal}</Link>
          <a href="#servizi" className="text-gold hover:underline">{m.services}</a>
          <a href="#faq" className="text-gold hover:underline">{m.faq}</a>
          <a href="#contatto" className="text-gold hover:underline">{m.contact}</a>
        </nav>
        {/* le lingue: la stessa versione testuale nella lingua scelta */}
        <nav aria-label={ui.menu.lang} className="mt-3 flex gap-x-3 text-xs tracking-[0.12em]">
          {LANGS.map((code) => (
            <Link key={code} href={machineHref(code)} hrefLang={code} lang={code} aria-current={code === lang ? "true" : undefined} className={code === lang ? "text-ink underline" : "text-gold hover:underline"}>{code.toUpperCase()}</Link>
          ))}
        </nav>

        <h1 className="mt-6 text-sm font-normal text-ink">
          {SITE.domain} :: {m.title} :: {label}
        </h1>
        <p className="mt-3 text-gold/80">{m.note.replace("{url}", url)}</p>

        <Rule id="about" label={m.about} />
        <dl>
          <Row k={m.name}>{SITE.name}</Row>
          <Row k={m.for}>{label}</Row>
          <Row k={m.since}>{SITE.since}</Row>
          <Row k={m.seat}>{SITE.city}, {m.country}</Row>
          <Row k={m.servicesKey}>{services.map((s) => s.title).join(", ")}</Row>
        </dl>
        <p className="mt-5">
          {SITE.name} {title.before}
          {title.accent}. {subtitle}
        </p>

        <Rule id="servizi" label={m.servicesKey} />
        <div className="space-y-8">
          {services.map((s) => (
            <section key={s.id}>
              <h3 className="font-normal text-ink">* {s.title}</h3>
              <p className="mt-1 text-gold/80">{ui.quote[0]}{s.tagline}{ui.quote[1]}</p>
              <p className="mt-2">{s.text}</p>
              <ul className="mt-2 space-y-0.5">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-2"><span aria-hidden="true" className="text-gold">-</span>{p}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <Rule id="faq" label="FAQ" />
        <div className="space-y-5">
          {faq.map((f) => (
            <div key={f.q}>
              <p className="text-ink">{m.q} {f.q}</p>
              <p className="mt-1">{m.a} {f.a}</p>
            </div>
          ))}
        </div>

        <Rule id="contatto" label={m.contact.replace("/", "").toUpperCase()} />
        <dl>
          <Row k={m.email}><a href={`mailto:${SITE.email}`} className="normal-case text-gold hover:underline">{SITE.email}</a></Row>
          <Row k={m.call}>{m.callValue}</Row>
          <Row k={m.book}><Link href={`${home}#prenota`} className="text-gold hover:underline">{m.bookLink}</Link></Row>
        </dl>
      </main>
      <ViewSwitch lang={lang} current="machine" ui={ui} />
    </div>
  );
}
