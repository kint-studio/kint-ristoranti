/** Le lingue della landing: italiano alla radice (`/`) e inglese, francese e tedesco sotto /en, /fr, /de. Ogni lingua
 *  ha anche la versione testuale, sotto `/machine`. */
export const LANGS = ["it", "en", "fr", "de"] as const;
export type Lang = (typeof LANGS)[number];
export const EXTRA_LANGS = ["en", "fr", "de"] as const;
export type ExtraLang = (typeof EXTRA_LANGS)[number];

export const isExtraLang = (v: string | undefined): v is ExtraLang => !!v && (EXTRA_LANGS as readonly string[]).includes(v);

/** Il prefisso della landing in una lingua: "" per l'italiano, "/en" per l'inglese e cosi' via. */
export const langBase = (lang: Lang): string => (lang === "it" ? "" : `/${lang}`);
/** La landing in una lingua: "/" per l'italiano, "/en" per l'inglese. */
export const homeHref = (lang: Lang): string => langBase(lang) || "/";
/** La versione testuale in una lingua: "/machine", "/en/machine"... */
export const machineHref = (lang: Lang): string => `${langBase(lang)}/machine`;

/** La lingua per Open Graph: le lingue della Svizzera. */
export const OG_LOCALE: Record<Lang, string> = { it: "it_CH", en: "en_CH", fr: "fr_CH", de: "de_CH" };

export type Ui = {
  /** attributo lang di <html> e nome per esteso */
  htmlLang: string;
  coffee: string;
  /** le virgolette dei motti dei servizi */
  quote: [string, string];
  /** la scritta in basso a sinistra nella schermata iniziale */
  ideas: string;
  menu: { home: string; services: string; faq: string; contact: string; open: string; close: string; label: string; nav: string; lang: string; caption: [string, string]; micro: string };
  services: { label: string; intro: string; inBrief: string };
  call: { eyebrow: string; before: string; accent: string; text: string };
  faq: { label: string; before: string; accent: string; after: string };
  form: {
    name: string; business: string; email: string; message: string;
    namePh: string; emailPh: string; messagePh: string;
    submit: string; privacy: string; done: string;
    subject: string; mailName: string; mailBusiness: string; mailSector: string; mailEmail: string;
  };
  footer: { tagline: string; services: string; contact: string; top: string; linkedin: string; instagram: string; wordmark: string; sections: string };
  view: { aria: string; normal: string; machine: string };
  brandHome: string;
  machine: {
    normal: string; services: string; faq: string; contact: string;
    title: string; note: string;
    about: string; name: string; for: string; since: string; seat: string; servicesKey: string; country: string;
    q: string; a: string; email: string; call: string; callValue: string; book: string; bookLink: string;
  };
};

const it: Ui = {
  htmlLang: "it",
  coffee: "caffettino?",
  quote: ["«", "»"],
  ideas: "Le idee prendono forma",
  menu: { home: "Inizio", services: "Servizi", faq: "FAQ", contact: "Contattaci", open: "Apri il menu", close: "Chiudi il menu", label: "Menu", nav: "Navigazione principale", lang: "Lingua", caption: ["Parti diverse.", "Nuove possibilità."], micro: "Strategia / Design / Tecnologia" },
  services: { label: "Servizi", intro: "Ogni servizio risponde a un'esigenza concreta. Puoi partire da uno solo e aggiungere gli altri quando servono.", inBrief: "In breve" },
  call: { eyebrow: "La prossima connessione", before: "Venti minuti di call. ", accent: "Arriviamo pronti.", text: "Prima della chiamata abbiamo già fatto il check-up della tua attività e abbozzato una home. Tu ci dici se ha senso, noi ti diciamo prezzo e tempi." },
  faq: { label: "FAQ", before: "Quello che ci chiedono ", accent: "prima", after: " di firmare." },
  form: {
    name: "Nome", business: "Attività", email: "Email", message: "Due righe",
    namePh: "Andrea", emailPh: "tu@attivita.ch", messagePh: "Cosa vorresti che il digitale facesse per te?",
    submit: "Invia e fissiamo la call", privacy: "I dati servono solo per risponderti.", done: "Si apre la tua email con il messaggio pronto. Se non succede, scrivi a {email}.",
    subject: "Richiesta call: {x}", mailName: "Nome", mailBusiness: "Attività", mailSector: "Settore", mailEmail: "Email",
  },
  footer: { tagline: "Strategia. Design. Tecnologia.", services: "Servizi", contact: "Contatti", top: "Torna su ↑", linkedin: "kint su LinkedIn (si apre in una nuova scheda)", instagram: "kint su Instagram (si apre in una nuova scheda)", wordmark: "kint, torna all'inizio", sections: "Sezioni" },
  view: { aria: "Versione della pagina", normal: "Human", machine: "Machine" },
  brandHome: "home",
  machine: {
    normal: "/Human", services: "/Servizi", faq: "/Faq", contact: "/Contatto",
    title: "indice leggibile da macchine", note: "# Versione testuale di {url} per agenti AI, crawler e chi la preferisce essenziale.",
    about: "CHI SIAMO", name: "NOME", for: "PER", since: "DAL", seat: "SEDE", servicesKey: "SERVIZI", country: "Svizzera",
    q: "Q:", a: "A:", email: "EMAIL", call: "CALL", callValue: "20 minuti", book: "PRENOTA", bookLink: "Prenota una call →",
  },
};

const en: Ui = {
  htmlLang: "en",
  coffee: "caffettino?",
  quote: ["“", "”"],
  ideas: "Ideas take shape",
  menu: { home: "Home", services: "Services", faq: "FAQ", contact: "Contact us", open: "Open the menu", close: "Close the menu", label: "Menu", nav: "Main navigation", lang: "Language", caption: ["Different parts.", "New possibilities."], micro: "Strategy / Design / Technology" },
  services: { label: "Services", intro: "Every service answers a concrete need. You can start with just one and add the others when you need them.", inBrief: "In short" },
  call: { eyebrow: "The next connection", before: "Twenty minutes on a call. ", accent: "We come prepared.", text: "Before the call we have already reviewed your business and sketched a homepage. You tell us whether it makes sense, we tell you the price and the timing." },
  faq: { label: "FAQ", before: "What people ask us ", accent: "before", after: " signing." },
  form: {
    name: "Name", business: "Business", email: "Email", message: "A few lines",
    namePh: "Andrea", emailPh: "you@business.ch", messagePh: "What would you like digital to do for you?",
    submit: "Send and we'll set up the call", privacy: "Your details are only used to reply to you.", done: "Your email app opens with the message ready. If it doesn't, write to {email}.",
    subject: "Call request: {x}", mailName: "Name", mailBusiness: "Business", mailSector: "Sector", mailEmail: "Email",
  },
  footer: { tagline: "Strategy. Design. Technology.", services: "Services", contact: "Contact", top: "Back to top ↑", linkedin: "kint on LinkedIn (opens in a new tab)", instagram: "kint on Instagram (opens in a new tab)", wordmark: "kint, back to the top", sections: "Sections" },
  view: { aria: "Page version", normal: "Human", machine: "Machine" },
  brandHome: "home",
  machine: {
    normal: "/Human", services: "/Services", faq: "/Faq", contact: "/Contact",
    title: "machine-readable index", note: "# Text version of {url} for AI agents, crawlers and anyone who prefers it plain.",
    about: "ABOUT US", name: "NAME", for: "FOR", since: "SINCE", seat: "BASE", servicesKey: "SERVICES", country: "Switzerland",
    q: "Q:", a: "A:", email: "EMAIL", call: "CALL", callValue: "20 minutes", book: "BOOK", bookLink: "Book a call →",
  },
};

const fr: Ui = {
  htmlLang: "fr",
  coffee: "caffettino?",
  quote: ["« ", " »"],
  ideas: "Les idées prennent forme",
  menu: { home: "Accueil", services: "Services", faq: "FAQ", contact: "Nous contacter", open: "Ouvrir le menu", close: "Fermer le menu", label: "Menu", nav: "Navigation principale", lang: "Langue", caption: ["Pièces diverses.", "Nouvelles possibilités."], micro: "Stratégie / Design / Technologie" },
  services: { label: "Services", intro: "Chaque service répond à un besoin concret. Vous pouvez commencer par un seul et ajouter les autres quand vous en avez besoin.", inBrief: "En bref" },
  call: { eyebrow: "La prochaine connexion", before: "Vingt minutes d'appel. ", accent: "Nous arrivons préparés.", text: "Avant l'appel, nous avons déjà fait le point sur votre activité et esquissé une page d'accueil. Vous nous dites si cela a du sens, nous vous indiquons le prix et les délais." },
  faq: { label: "FAQ", before: "Ce que l'on nous demande ", accent: "avant", after: " de signer." },
  form: {
    name: "Nom", business: "Entreprise", email: "E-mail", message: "Quelques lignes",
    namePh: "Andrea", emailPh: "vous@entreprise.ch", messagePh: "Que souhaiteriez-vous que le numérique fasse pour vous ?",
    submit: "Envoyer et fixer l'appel", privacy: "Vos données ne servent qu'à vous répondre.", done: "Votre messagerie s'ouvre avec le message prêt. Si ce n'est pas le cas, écrivez à {email}.",
    subject: "Demande d'appel : {x}", mailName: "Nom", mailBusiness: "Entreprise", mailSector: "Secteur", mailEmail: "E-mail",
  },
  footer: { tagline: "Stratégie. Design. Technologie.", services: "Services", contact: "Contact", top: "Haut de page ↑", linkedin: "kint sur LinkedIn (s'ouvre dans un nouvel onglet)", instagram: "kint sur Instagram (s'ouvre dans un nouvel onglet)", wordmark: "kint, retour en haut de la page", sections: "Sections" },
  view: { aria: "Version de la page", normal: "Human", machine: "Machine" },
  brandHome: "accueil",
  machine: {
    normal: "/Human", services: "/Services", faq: "/Faq", contact: "/Contact",
    title: "index lisible par les machines", note: "# Version texte de {url} pour les agents IA, les robots d'indexation et ceux qui la préfèrent sobre.",
    about: "QUI SOMMES-NOUS", name: "NOM", for: "POUR", since: "DEPUIS", seat: "SIÈGE", servicesKey: "SERVICES", country: "Suisse",
    q: "Q :", a: "R :", email: "E-MAIL", call: "APPEL", callValue: "20 minutes", book: "RÉSERVER", bookLink: "Réserver un appel →",
  },
};

const de: Ui = {
  htmlLang: "de",
  coffee: "caffettino?",
  quote: ["«", "»"],
  ideas: "Ideen nehmen Form an",
  menu: { home: "Start", services: "Leistungen", faq: "FAQ", contact: "Kontakt", open: "Menü öffnen", close: "Menü schliessen", label: "Menü", nav: "Hauptnavigation", lang: "Sprache", caption: ["Verschiedene Teile.", "Neue Möglichkeiten."], micro: "Strategie / Design / Technologie" },
  services: { label: "Leistungen", intro: "Jede Leistung deckt ein konkretes Bedürfnis ab. Sie können mit einer einzigen starten und die anderen dazunehmen, wenn Sie sie brauchen.", inBrief: "Kurz gesagt" },
  call: { eyebrow: "Die nächste Verbindung", before: "Zwanzig Minuten Call. ", accent: "Wir kommen vorbereitet.", text: "Vor dem Anruf haben wir Ihren Betrieb bereits unter die Lupe genommen und eine Startseite skizziert. Sie sagen uns, ob es Sinn ergibt, wir nennen Ihnen Preis und Zeitplan." },
  faq: { label: "FAQ", before: "Was man uns fragt, ", accent: "bevor", after: " man unterschreibt." },
  form: {
    name: "Name", business: "Unternehmen", email: "E-Mail", message: "Ein paar Zeilen",
    namePh: "Andrea", emailPh: "sie@unternehmen.ch", messagePh: "Was soll das Digitale für Sie tun?",
    submit: "Senden und den Call vereinbaren", privacy: "Ihre Daten dienen nur dazu, Ihnen zu antworten.", done: "Ihr E-Mail-Programm öffnet sich mit der fertigen Nachricht. Falls nicht, schreiben Sie an {email}.",
    subject: "Call-Anfrage: {x}", mailName: "Name", mailBusiness: "Unternehmen", mailSector: "Branche", mailEmail: "E-Mail",
  },
  footer: { tagline: "Strategie. Design. Technologie.", services: "Leistungen", contact: "Kontakt", top: "Nach oben ↑", linkedin: "kint auf LinkedIn (öffnet in einem neuen Tab)", instagram: "kint auf Instagram (öffnet in einem neuen Tab)", wordmark: "kint, zurück an den Anfang", sections: "Abschnitte" },
  view: { aria: "Version der Seite", normal: "Human", machine: "Machine" },
  brandHome: "Startseite",
  machine: {
    normal: "/Human", services: "/Leistungen", faq: "/Faq", contact: "/Kontakt",
    title: "maschinenlesbarer Index", note: "# Textversion von {url} für KI-Agenten, Crawler und alle, die es schlicht mögen.",
    about: "ÜBER UNS", name: "NAME", for: "FÜR", since: "SEIT", seat: "SITZ", servicesKey: "LEISTUNGEN", country: "Schweiz",
    q: "F:", a: "A:", email: "E-MAIL", call: "CALL", callValue: "20 Minuten", book: "BUCHEN", bookLink: "Call buchen →",
  },
};

/** Il francese vuole uno spazio non separabile prima di ? ! : ; e dentro le virgolette « »: si applica a tutti i testi. */
export function frenchTypography<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(/ ([?!:;»])/g, " $1").replace(/« /g, "« ") as unknown as T;
  }
  if (Array.isArray(value)) return value.map(frenchTypography) as unknown as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, frenchTypography(v)])) as T;
  }
  return value;
}

export const UI: Record<Lang, Ui> = { it, en, fr: frenchTypography(fr), de };
