import { BrandLogo } from "@/components/BrandLogo";
import { CurrentYear } from "@/components/CurrentYear";
import { KfAccordion } from "@/components/kf/KfAccordion";
import { KfAnchors } from "@/components/kf/KfAnchors";
import { KfContactForm } from "@/components/kf/KfContactForm";
import { KfFooterWordmark } from "@/components/kf/KfFooterWordmark";
import { KfMenuButton, KfMenuOverlay, type MenuItem } from "@/components/kf/KfMenu";
import { FORK_IMAGES, KfScene } from "@/components/kf/KfScene";
import { KfServiceTrail } from "@/components/kf/KfServiceTrail";
import { ViewSwitch } from "@/components/machine/ViewSwitch";
import { SITE, type Landing } from "@/lib/content";
import { LANGS, UI, homeHref, type Lang, type Ui } from "@/lib/i18n";
import { MAIN_SITE_URL } from "@/lib/site";

const GUTTER = "px-[var(--kf-gutter)]";
const WRAP = "mx-auto max-w-[1600px]";
const SECTION = "py-[clamp(64px,7vw,112px)]";

/** La landing nello stile del sito "forma": carta color crema, caratteri Geist, etichette in mono, la forchetta 3D
 *  nella schermata iniziale, servizi in un elenco che si apre, una fascia scura, contatto, FAQ e footer.
 *  Il contenuto viene tutto da `landing` (gia' tradotto nella lingua `lang`). */
export function KfLanding({ landing, lang = "it" }: { landing: Landing; lang?: Lang }) {
  const ui = UI[lang];
  return (
    <div className="kf">
      <KfAnchors />
      <KfHero landing={landing} lang={lang} ui={ui} />
      <KfServices landing={landing} ui={ui} />
      <KfContact landing={landing} ui={ui} />
      <KfFaq landing={landing} ui={ui} />
      <KfFooter ui={ui} />
      <KfMenuOverlay items={menuItems(ui)} home={homeHref(lang)} ui={ui} langs={langLinks(lang)} />
      <ViewSwitch lang={lang} current="normal" ui={ui} />
    </div>
  );
}

/** I link per cambiare lingua: la landing nella lingua scelta (l'italiano sta alla radice). */
function langLinks(current: Lang) {
  return LANGS.map((code) => ({ code, href: homeHref(code), current: code === current }));
}

/** Le voci del menu sono le sezioni che ci sono nella pagina. */
function menuItems(ui: Ui): MenuItem[] {
  return [
    { label: ui.menu.home, href: "#top" },
    { label: ui.menu.services, href: "#servizi" },
    { label: ui.menu.faq, href: "#faq" },
    { label: ui.menu.contact, href: "#prenota" },
  ];
}

function KfHeader({ lang, ui }: { lang: Lang; ui: Ui }) {
  return (
    <header className={`${GUTTER} relative z-10 pt-6 md:pt-8`} id="top">
      <div className={`${WRAP} flex items-center justify-between gap-4`}>
        <BrandLogo href={homeHref(lang)} homeLabel={ui.brandHome} />
        <div className="flex items-center gap-3 md:gap-4">
          <a href="#prenota" className="kf-btn">{ui.coffee}</a>
          <KfMenuButton openLabel={ui.menu.open} closeLabel={ui.menu.close} />
        </div>
      </div>
    </header>
  );
}

/** Le immagini della forchetta partono a scaricarsi subito, senza aspettare che parta il codice della scena: sui
 *  telefoni quella da 1024 px, ovunque la sagoma da 640 px e le due piccole texture del modello 3D. */
function ForkPreload() {
  return (
    <>
      <link rel="preload" as="image" href={FORK_IMAGES.ceramic1024} media="(hover: none)" fetchPriority="high" />
      <link rel="preload" as="image" href={FORK_IMAGES.ceramic640} fetchPriority="high" />
      <link rel="preload" as="image" href={FORK_IMAGES.a} fetchPriority="high" />
      <link rel="preload" as="image" href={FORK_IMAGES.b} fetchPriority="high" />
    </>
  );
}

/** La schermata iniziale con l'impostazione del sito principale: alta quanto lo schermo, la forchetta 3D grande al
 *  centro, la "k." in alto, il titolo piccolo in basso a destra e la didascalia in basso a sinistra. */
function KfHero({ landing, lang, ui }: { landing: Landing; lang: Lang; ui: Ui }) {
  const { title, subtitle } = landing;
  return (
    <section className="kf-hero-principale relative isolate overflow-hidden">
      <ForkPreload />
      <KfScene caption={ui.ideas} />
      <KfHeader lang={lang} ui={ui} />
      <a className="kf-center-mark" href="#top" aria-hidden="true" tabIndex={-1}>k<span>.</span></a>
      <div className="kf-hero-copy">
        <h1 className="kf-display">
          {title.before}
          <span className="text-[var(--kf-gold)]">{title.accent}.</span>
        </h1>
        <p>{subtitle}</p>
      </div>
    </section>
  );
}

function KfServices({ landing, ui }: { landing: Landing; ui: Ui }) {
  const { services, servicesHeading } = landing;
  return (
    <section id="servizi" className={`${GUTTER} ${SECTION} relative bg-[var(--kf-dark)] text-[#efebe2]`}>
      <KfServiceTrail />
      <div className={`${WRAP} relative z-10`}>
        <div className="kf-mono text-[#efebe2]/55">
          <span>{ui.services.label}</span>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-end">
          <h2 className="kf-display text-[clamp(44px,7.2vw,116px)]">
            <span className="block text-[#efebe2]/38">{servicesHeading.lead}</span>
            <span className="block text-[var(--kf-gold)]">{servicesHeading.accent}</span>
          </h2>
          <p className="max-w-md text-[#bac1ad]">{ui.services.intro}</p>
        </div>
        <div className="mt-14 md:mt-20">
          <KfAccordion
            variant="dark"
            defaultOpen={0}
            items={services.map((s) => ({
              key: s.id,
              title: s.title,
              body: (
                <div className="grid gap-8 md:grid-cols-2 md:gap-14">
                  <div>
                    <p className="kf-mono text-[#efebe2]/50">{ui.services.inBrief}</p>
                    <p className="mt-3 text-xl leading-snug tracking-[-0.01em] text-[#efebe2]">{ui.quote[0]}{s.tagline}{ui.quote[1]}</p>
                    <p className="mt-4 max-w-md leading-relaxed text-[#c0c4b4]">{s.text}</p>
                  </div>
                  <ul>
                    {s.points.map((p) => (
                      <li key={p} className="flex gap-3 border-t border-[#efebe2]/15 py-3 text-[#d9dccb] first:border-t-0 first:pt-0">
                        <span aria-hidden="true" className="mt-3 h-px w-3.5 shrink-0 bg-[var(--kf-gold)]" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            }))}
          />
        </div>
      </div>
    </section>
  );
}

/** L'invito alla call e il modulo sono una sola sezione, tutta sul fondo a righe. */
function KfContact({ landing, ui }: { landing: Landing; ui: Ui }) {
  const { sector, exampleBusiness } = landing;
  return (
    <section id="prenota" className={`${GUTTER} kf-grid-paper scroll-mt-4 border-y border-[var(--kf-line)] py-[clamp(80px,10vw,160px)]`}>
      <div className={WRAP}>
        <div className="text-center">
          <p className="kf-mono text-[var(--kf-muted)]">{ui.call.eyebrow}</p>
          <h2 className="kf-display mx-auto mt-8 max-w-5xl text-[clamp(44px,7.4vw,116px)] text-balance">
            {ui.call.before}<span className="text-[var(--kf-gold)]">{ui.call.accent}</span>
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-[var(--kf-soft)]">
            {ui.call.text}
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-3xl md:mt-20">
          <KfContactForm sector={sector} exampleBusiness={exampleBusiness} t={ui.form} email={SITE.email} />
        </div>
      </div>
    </section>
  );
}

function KfFaq({ landing, ui }: { landing: Landing; ui: Ui }) {
  return (
    <section id="faq" className={`${GUTTER} ${SECTION} border-t border-[var(--kf-line)]`}>
      <div className={`${WRAP} grid gap-12 lg:grid-cols-[1fr_1.7fr] lg:gap-24`}>
        <div>
          <p className="kf-mono text-[var(--kf-muted)]">{ui.faq.label}</p>
          <h2 className="kf-display mt-8 text-[clamp(34px,4.6vw,72px)] text-balance">
            {ui.faq.before}<span className="text-[var(--kf-gold)]">{ui.faq.accent}</span>{ui.faq.after}
          </h2>
        </div>
        <KfAccordion variant="paper" defaultOpen={0} items={landing.faq.map((f) => ({ key: f.q, title: f.q, body: <p className="max-w-2xl leading-relaxed text-[var(--kf-soft)]">{f.a}</p> }))} />
      </div>
    </section>
  );
}

const LINKEDIN = "https://www.linkedin.com/company/kint-ch/";
const INSTAGRAM = "https://www.instagram.com/kint.ch/";

/** Il footer del sito principale: il marchio gigante a tutta larghezza e, sotto, una riga a 12 colonne
 *  (la firma, i link alle sezioni, i social e il copyright). Servizi e contatti sono sezioni della stessa pagina;
 *  "kint" nel copyright porta al sito principale. */
function KfFooter({ ui }: { ui: Ui }) {
  return (
    <footer className={`${GUTTER} kf-footer bg-[var(--kf-dark)] pb-24 text-[var(--kf-on)]`}>
      <div className={WRAP}>
        <KfFooterWordmark label={ui.footer.wordmark} />
        <div className="kf-footer-bottom">
          <span>{ui.footer.tagline}</span>
          <nav className="kf-footer-links" aria-label={ui.footer.sections}>
            <a href="#servizi">{ui.footer.services}</a>
            <a href="#prenota">{ui.footer.contact}</a>
            <a href="#top">{ui.footer.top}</a>
          </nav>
          <div className="kf-footer-social">
            <a href={LINKEDIN} target="_blank" rel="noopener" aria-label={ui.footer.linkedin}>LinkedIn ↗</a>
            <a href={INSTAGRAM} target="_blank" rel="noopener" aria-label={ui.footer.instagram}>Instagram ↗</a>
          </div>
          <span>© <CurrentYear buildYear={new Date().getFullYear()} /> <a href={MAIN_SITE_URL}>kint</a></span>
        </div>
      </div>
    </footer>
  );
}
