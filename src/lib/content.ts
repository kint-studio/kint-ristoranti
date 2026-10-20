/** I dati della landing per i ristoratori, in italiano. Le traduzioni stanno in `landing-i18n.ts`. */

export const SITE = {
  name: "kint",
  domain: "kint.ch",
  email: "info@kint.ch",
  city: "Lugano",
  since: 2020,
};

/** Un servizio della landing: titolo, motto, testo e punti dell'elenco. */
export type LandingService = {
  id: string;
  title: string;
  tagline: string;
  text: string;
  points: string[];
};

export type Landing = {
  /** nome del pubblico, per la versione testuale */
  label: string;
  /** settore gia' scelto nel modulo di contatto */
  sector: string;
  /** nome di esempio nel campo "Attivita'" del modulo */
  exampleBusiness: string;
  title: { before: string; accent: string };
  subtitle: string;
  /** titolo della sezione servizi: `lead` sbiadito, `accent` in oro */
  servicesHeading: { lead: string; accent: string };
  services: LandingService[];
  faq: { q: string; a: string }[];
  /** titolo e descrizione della pagina (metadata) */
  meta: { title: string; description: string };
};

const RISTO_SERVICES: LandingService[] = [
  {
    id: "sito",
    title: "Sito e menu digitale",
    tagline: "Aperto anche a cucina chiusa",
    text: "Un sito veloce, pensato per il telefono, dove il cliente trova il menu, gli orari e tutto quello che gli serve per scegliere il tuo locale.",
    points: [
      "Menu digitale che si aggiorna con un tuo messaggio",
      "In italiano, tedesco e inglese per i turisti",
      "Orari, mappa, WhatsApp, menu del giorno ed eventi",
    ],
  },
  {
    id: "prenotazioni",
    title: "Prenotazioni online",
    tagline: "Il tavolo si prenota da solo",
    text: "I clienti prenotano a qualsiasi ora, dal sito o da Google, senza telefonare. Il telefono resta libero durante il servizio.",
    points: [
      "Prenotazione dal sito e dalla scheda Google, giorno e notte",
      "Il cliente sceglie giorno, orario e numero di persone",
      "Conferma al cliente e avviso a te per ogni prenotazione",
      "Collegamento al programma di prenotazioni che usi già, da valutare insieme",
    ],
  },
  {
    id: "social",
    title: "Social media",
    tagline: "Piatti che si fanno guardare",
    text: "Instagram e Facebook curati da chi lo fa di mestiere, con le foto dei tuoi piatti e del tuo locale.",
    points: [
      "Strategia e calendario dei post, concordati con te",
      "Foto e reel in locale, con shooting dedicati",
      "Stories, risposte a commenti e messaggi",
      "Campagne Meta locali per aperitivi, eventi e menu di stagione",
    ],
  },
  {
    id: "google",
    title: "Google e visibilità",
    tagline: "Ti trovano prima degli altri",
    text: "Quando qualcuno cerca «ristorante vicino a me», devi esserci, con foto, orari e recensioni in ordine.",
    points: [
      "Scheda Google Business Profile ottimizzata, con foto e pulsante «Prenota»",
      "Recensioni: richiesta automatica e risposte assistite dall'AI, riviste da una persona",
      "SEO locale per chi cerca in tedesco e inglese",
      "Visibilità su ChatGPT e AI Overview, report mensile",
    ],
  },
  {
    id: "ai",
    title: "AI e automazioni",
    tagline: "Il lavoro ripetitivo, in automatico",
    text: "Chatbot e flussi automatici che rispondono ai clienti e sbrigano le attività ripetitive anche fuori orario, così in sala e in cucina hai più tempo per il servizio.",
    points: [
      "Chatbot sul sito che risponde su orari, menu e prenotazioni, anche a cucina chiusa",
      "Richieste per gruppi ed eventi raccolte e ordinate in automatico",
      "Conferme e promemoria di prenotazione inviati in automatico",
      "Individuiamo insieme le attività ripetitive da automatizzare, partendo dalle più utili",
    ],
  },
];

const RISTO_FAQ = [
  { q: "Quanto costa?", a: "Prezzi fissi, senza sorprese. In call, dopo aver visto il tuo locale, ti diciamo quanto costa e in quanto tempo è pronto, prima di firmare qualsiasi cosa." },
  { q: "Fate il servizio fotografico del locale e dei piatti?", a: "Sì: veniamo da te a fotografare il locale, i piatti e chi ci lavora, così sito e social partono con immagini vere e non di repertorio. Si concorda insieme il giorno, in un momento in cui il locale è tranquillo." },
  { q: "Come funzionano le prenotazioni online?", a: "Il cliente prenota dal sito o dalla tua scheda Google, scegliendo giorno, orario e numero di persone, senza telefonare. Se usi già un programma di prenotazioni, ne parliamo in call." },
  { q: "Posso aggiornare il menu da solo?", a: "Puoi, ma non devi: mandaci un messaggio o una foto del nuovo menu e lo aggiorniamo noi." },
  { q: "I social li gestite voi?", a: "Sì: calendario dei post, foto e reel del tuo locale, e risposte ai messaggi. Concordiamo tutto con te, e niente va online senza che una persona l'abbia rivisto." },
  { q: "Quanto tempo ci vuole per essere online?", a: "Circa dieci giorni lavorativi dalla call. Di solito il tempo se ne va per raccogliere foto e orari, per questo ti chiediamo solo un modulo di dieci minuti." },
];

export const LANDING: Landing = {
  label: "Ristoratori",
  sector: "Ristorazione & hospitality",
  exampleBusiness: "Grotto del Sole",
  title: { before: "kint per il ", accent: "tuo locale" },
  subtitle: "I servizi di cui hai bisogno offerti da professionisti nel settore.",
  servicesHeading: { lead: "Il digitale,", accent: "che serve al tuo locale." },
  services: RISTO_SERVICES,
  faq: RISTO_FAQ,
  meta: {
    title: "Per i ristoratori",
    description: "Sito con menu e prenotazioni, social media, Google, AI e automazioni: il partner digitale a prezzo fisso di ristoranti, grotti e bar.",
  },
};
