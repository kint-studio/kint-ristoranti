import { frenchTypography, type Lang } from "./i18n";
import type { Landing } from "./content";

/** I testi della landing in un'altra lingua. L'italiano resta in `content.ts`; qui ci sono inglese, francese e tedesco.
 *  Tono: "you" in inglese, "vous" in francese e "Sie" in tedesco (come si scrive a un cliente in Svizzera), con
 *  l'ortografia svizzera in tedesco (ss al posto di ß, «Reservation», «Abonnement» ecc.). */
type ServiceText = { title: string; tagline: string; text: string; points: string[] };
export type LandingText = {
  label: string;
  sector: string;
  exampleBusiness: string;
  title: { before: string; accent: string };
  subtitle: string;
  servicesHeading: { lead: string; accent: string };
  services: Record<string, ServiceText>;
  faq: { q: string; a: string }[];
  meta: { title: string; description: string };
};

type Translated = Record<Exclude<Lang, "it">, LandingText>;

const SUBTITLE = {
  en: "The services you need, delivered by professionals in the field.",
  fr: "Les services dont vous avez besoin, assurés par des professionnels du secteur.",
  de: "Die Leistungen, die Sie brauchen, von Fachleuten der Branche.",
};

const REVIEWS = {
  en: "Reviews: automatic requests and AI-assisted replies, checked by a person",
  fr: "Avis : demande automatique et réponses assistées par l'IA, relues par une personne",
  de: "Bewertungen: automatische Anfrage und KI-gestützte Antworten, von einer Person geprüft",
};
const AI_VISIBILITY = {
  en: "Visibility on ChatGPT and AI Overviews, monthly report",
  fr: "Visibilité sur ChatGPT et AI Overview, rapport mensuel",
  de: "Sichtbarkeit in ChatGPT und AI Overviews, Monatsbericht",
};
const TIME_Q = {
  en: "How long does it take to go online?",
  fr: "Combien de temps faut-il pour être en ligne ?",
  de: "Wie lange dauert es, bis ich online bin?",
};

export const TRANSLATIONS: Translated = {
  en: {
    label: "Restaurateurs",
    sector: "Restaurants",
    exampleBusiness: "Grotto del Sole",
    title: { before: "kint for your ", accent: "restaurant" },
    subtitle: SUBTITLE.en,
    servicesHeading: { lead: "Digital,", accent: "built for your restaurant." },
    services: {
      sito: {
        title: "Website and digital menu",
        tagline: "Open even when the kitchen is closed",
        text: "A fast website designed for the phone, where customers find the menu, the opening hours and everything they need to choose your restaurant.",
        points: [
          "Digital menu that you update with a single message",
          "In Italian, German and English for tourists",
          "Opening hours, map, WhatsApp, daily specials and events",
        ],
      },
      prenotazioni: {
        title: "Online bookings",
        tagline: "The table books itself",
        text: "Customers book at any hour, from your website or from Google, without calling. The phone stays free during service.",
        points: [
          "Booking from your website and your Google listing, day and night",
          "The customer picks the day, the time and the number of guests",
          "A confirmation to the customer and an alert to you for every booking",
          "Integration with the booking software you already use, to be assessed together",
        ],
      },
      social: {
        title: "Social media",
        tagline: "Dishes worth looking at",
        text: "Instagram and Facebook run by people who do this for a living, with photos of your dishes and your restaurant.",
        points: [
          "Strategy and post calendar, agreed with you",
          "Photos and reels on site, with dedicated shoots",
          "Stories, replies to comments and messages",
          "Local Meta campaigns for aperitifs, events and seasonal menus",
        ],
      },
      google: {
        title: "Google and visibility",
        tagline: "They find you before the others",
        text: "When someone searches for “restaurant near me”, you need to be there, with photos, opening hours and reviews in order.",
        points: [
          "Optimised Google Business Profile, with photos and a “Book” button",
          REVIEWS.en,
          "Local SEO for people searching in German and English",
          AI_VISIBILITY.en,
        ],
      },
      ai: {
        title: "AI and automation",
        tagline: "Repetitive work, on autopilot",
        text: "Chatbots and automatic workflows that answer customers and handle repetitive tasks, even outside opening hours, so you have more time for service.",
        points: [
          "Website chatbot that answers questions on opening hours, menu and bookings, even when the kitchen is closed",
          "Requests for groups and events collected and organised automatically",
          "Booking confirmations and reminders sent automatically",
          "Together we pick the repetitive tasks worth automating, starting with the most useful",
        ],
      },
    },
    faq: [
      { q: "How much does it cost?", a: "Fixed prices, no surprises. On the call, after seeing your restaurant, we tell you what it costs and how long it takes, before you sign anything." },
      { q: "Do you do photo shoots of the restaurant and the dishes?", a: "Yes: we come to you to photograph the restaurant, the dishes and the people who work there, so your website and social media start with real images, not stock photos. The day is agreed together, at a time when the restaurant is quiet." },
      { q: "How do online bookings work?", a: "The customer books from your website or your Google listing, choosing the day, the time and the number of guests, without calling. If you already use booking software, we'll talk about it on the call." },
      { q: "Can I update the menu myself?", a: "You can, but you don't have to: send us a message or a photo of the new menu and we'll update it." },
      { q: "Do you run the social media?", a: "Yes: post calendar, photos and reels of your restaurant, and replies to messages. We agree everything with you, and nothing goes online without a person having reviewed it." },
      { q: TIME_Q.en, a: "About ten working days from the call. Most of the time goes into collecting photos and opening hours, which is why we only ask you for a ten-minute form." },
    ],
    meta: { title: "For restaurateurs", description: "Website with menu and bookings, social media, Google, AI and automation: the fixed-price digital partner for restaurants, grottos and bars." },
  },
  fr: {
    label: "Restaurateurs",
    sector: "Restaurants",
    exampleBusiness: "Grotto del Sole",
    title: { before: "kint pour votre ", accent: "restaurant" },
    subtitle: SUBTITLE.fr,
    servicesHeading: { lead: "Le numérique,", accent: "conçu pour votre restaurant." },
    services: {
      sito: {
        title: "Site web et menu numérique",
        tagline: "Ouvert même cuisine fermée",
        text: "Un site rapide, pensé pour le téléphone, où le client trouve le menu, les horaires et tout ce qu'il lui faut pour choisir votre établissement.",
        points: [
          "Menu numérique mis à jour sur simple message de votre part",
          "En italien, allemand et anglais pour les touristes",
          "Horaires, plan, WhatsApp, menu du jour et événements",
        ],
      },
      prenotazioni: {
        title: "Réservations en ligne",
        tagline: "La table se réserve toute seule",
        text: "Vos clients réservent à toute heure, depuis le site ou depuis Google, sans téléphoner. Le téléphone reste libre pendant le service.",
        points: [
          "Réservation depuis le site et la fiche Google, jour et nuit",
          "Le client choisit le jour, l'heure et le nombre de personnes",
          "Confirmation au client et alerte pour vous à chaque réservation",
          "Connexion au logiciel de réservation que vous utilisez déjà, à évaluer ensemble",
        ],
      },
      social: {
        title: "Réseaux sociaux",
        tagline: "Des plats qui attirent le regard",
        text: "Instagram et Facebook gérés par des professionnels, avec les photos de vos plats et de votre établissement.",
        points: [
          "Stratégie et calendrier des publications, définis avec vous",
          "Photos et reels sur place, avec des séances dédiées",
          "Stories, réponses aux commentaires et aux messages",
          "Campagnes Meta locales pour les apéritifs, les événements et les menus de saison",
        ],
      },
      google: {
        title: "Google et visibilité",
        tagline: "On vous trouve avant les autres",
        text: "Quand quelqu'un cherche « restaurant près de chez moi », vous devez y être, avec des photos, des horaires et des avis soignés.",
        points: [
          "Fiche Google Business Profile optimisée, avec photos et bouton « Réserver »",
          REVIEWS.fr,
          "SEO local pour ceux qui cherchent en allemand et en anglais",
          AI_VISIBILITY.fr,
        ],
      },
      ai: {
        title: "IA et automatisations",
        tagline: "Le travail répétitif, en automatique",
        text: "Des chatbots et des flux automatiques qui répondent aux clients et s'occupent des tâches répétitives, même en dehors des horaires d'ouverture, pour que vous ayez plus de temps pour le service.",
        points: [
          "Chatbot sur le site qui répond sur les horaires, le menu et les réservations, même cuisine fermée",
          "Demandes de groupes et d'événements recueillies et organisées automatiquement",
          "Confirmations et rappels de réservation envoyés automatiquement",
          "Nous choisissons ensemble les tâches répétitives à automatiser, en commençant par les plus utiles",
        ],
      },
    },
    faq: [
      { q: "Combien ça coûte ?", a: "Des prix fixes, sans surprise. Pendant l'appel, après avoir vu votre établissement, nous vous disons combien cela coûte et en combien de temps c'est prêt, avant que vous ne signiez quoi que ce soit." },
      { q: "Faites-vous un reportage photo de l'établissement et des plats ?", a: "Oui : nous venons chez vous photographier l'établissement, les plats et les personnes qui y travaillent, pour que le site et les réseaux sociaux démarrent avec de vraies images et non des photos d'archive. Nous fixons la date ensemble, à un moment où l'établissement est calme." },
      { q: "Comment fonctionnent les réservations en ligne ?", a: "Le client réserve depuis le site ou depuis votre fiche Google, en choisissant le jour, l'heure et le nombre de personnes, sans téléphoner. Si vous utilisez déjà un logiciel de réservation, nous en parlons pendant l'appel." },
      { q: "Puis-je mettre à jour le menu moi-même ?", a: "Vous pouvez, mais vous n'y êtes pas obligé : envoyez-nous un message ou une photo du nouveau menu et nous le mettons à jour." },
      { q: "Gérez-vous les réseaux sociaux ?", a: "Oui : calendrier des publications, photos et reels de votre établissement, et réponses aux messages. Nous convenons de tout avec vous, et rien n'est mis en ligne sans avoir été relu par une personne." },
      { q: TIME_Q.fr, a: "Environ dix jours ouvrables à partir de l'appel. Le temps passe surtout à rassembler photos et horaires, c'est pourquoi nous ne vous demandons qu'un formulaire de dix minutes." },
    ],
    meta: { title: "Pour les restaurateurs", description: "Site avec menu et réservations, réseaux sociaux, Google, IA et automatisations : le partenaire numérique à prix fixe des restaurants, grottos et bars." },
  },
  de: {
    label: "Gastronomie",
    sector: "Gastronomie",
    exampleBusiness: "Grotto del Sole",
    title: { before: "kint für ", accent: "Ihr Lokal" },
    subtitle: SUBTITLE.de,
    servicesHeading: { lead: "Das Digitale,", accent: "das Ihrem Lokal dient." },
    services: {
      sito: {
        title: "Website und digitale Speisekarte",
        tagline: "Offen, auch wenn die Küche geschlossen ist",
        text: "Eine schnelle, aufs Handy ausgerichtete Website, auf der Gäste Speisekarte, Öffnungszeiten und alles finden, was sie für die Wahl Ihres Lokals brauchen.",
        points: [
          "Digitale Speisekarte, die Sie mit einer Nachricht aktualisieren",
          "Auf Italienisch, Deutsch und Englisch für Touristen",
          "Öffnungszeiten, Karte, WhatsApp, Tagesmenü und Veranstaltungen",
        ],
      },
      prenotazioni: {
        title: "Online-Reservationen",
        tagline: "Der Tisch reserviert sich von selbst",
        text: "Gäste reservieren zu jeder Uhrzeit, über die Website oder Google, ohne anzurufen. Das Telefon bleibt während des Services frei.",
        points: [
          "Reservation über die Website und den Google-Eintrag, Tag und Nacht",
          "Der Gast wählt Tag, Uhrzeit und Personenzahl",
          "Bestätigung an den Gast und Benachrichtigung an Sie bei jeder Reservation",
          "Anbindung an das Reservationsprogramm, das Sie bereits nutzen, gemeinsam zu prüfen",
        ],
      },
      social: {
        title: "Social Media",
        tagline: "Gerichte, die man gern anschaut",
        text: "Instagram und Facebook, betreut von Profis, mit Fotos Ihrer Gerichte und Ihres Lokals.",
        points: [
          "Strategie und Beitragskalender, mit Ihnen abgestimmt",
          "Fotos und Reels vor Ort, mit eigenen Shootings",
          "Stories, Antworten auf Kommentare und Nachrichten",
          "Lokale Meta-Kampagnen für Aperitifs, Events und Saisonmenüs",
        ],
      },
      google: {
        title: "Google und Sichtbarkeit",
        tagline: "Man findet Sie vor den anderen",
        text: "Wenn jemand «Restaurant in meiner Nähe» sucht, müssen Sie dabei sein, mit Fotos, Öffnungszeiten und Bewertungen in Ordnung.",
        points: [
          "Optimiertes Google Business Profile, mit Fotos und «Reservieren»-Button",
          REVIEWS.de,
          "Lokales SEO für alle, die auf Deutsch und Englisch suchen",
          AI_VISIBILITY.de,
        ],
      },
      ai: {
        title: "KI und Automatisierung",
        tagline: "Routinearbeit läuft automatisch",
        text: "Chatbots und automatische Abläufe, die Gäste beantworten und wiederkehrende Aufgaben erledigen, auch ausserhalb der Öffnungszeiten, damit Sie mehr Zeit für den Service haben.",
        points: [
          "Chatbot auf der Website, der Fragen zu Öffnungszeiten, Speisekarte und Reservationen beantwortet, auch wenn die Küche geschlossen ist",
          "Anfragen für Gruppen und Events werden automatisch erfasst und geordnet",
          "Reservationsbestätigungen und Erinnerungen werden automatisch versendet",
          "Gemeinsam wählen wir die wiederkehrenden Aufgaben aus, die sich zu automatisieren lohnen, und beginnen mit den nützlichsten",
        ],
      },
    },
    faq: [
      { q: "Was kostet das?", a: "Feste Preise, keine Überraschungen. Im Call sagen wir Ihnen, nachdem wir Ihr Lokal gesehen haben, was es kostet und wie lange es dauert, bevor Sie irgendetwas unterschreiben." },
      { q: "Machen Sie auch Fotoshootings des Lokals und der Gerichte?", a: "Ja: Wir kommen zu Ihnen und fotografieren das Lokal, die Gerichte und die Menschen, die dort arbeiten, damit Website und Social Media mit echten Bildern starten und nicht mit Archivfotos. Den Termin legen wir gemeinsam fest, zu einem ruhigen Zeitpunkt." },
      { q: "Wie funktionieren die Online-Reservationen?", a: "Der Gast reserviert über Ihre Website oder Ihren Google-Eintrag, wählt Tag, Uhrzeit und Personenzahl und muss nicht anrufen. Wenn Sie bereits ein Reservationsprogramm nutzen, besprechen wir das im Call." },
      { q: "Kann ich die Speisekarte selbst aktualisieren?", a: "Sie können, müssen aber nicht: Schicken Sie uns eine Nachricht oder ein Foto der neuen Karte, und wir aktualisieren sie." },
      { q: "Betreuen Sie die Social Media?", a: "Ja: Beitragskalender, Fotos und Reels Ihres Lokals sowie Antworten auf Nachrichten. Wir stimmen alles mit Ihnen ab, und nichts geht online, ohne dass eine Person es geprüft hat." },
      { q: TIME_Q.de, a: "Etwa zehn Arbeitstage ab dem Call. Die Zeit geht meist für das Sammeln von Fotos und Öffnungszeiten drauf, deshalb bitten wir Sie nur um ein Formular von zehn Minuten." },
    ],
    meta: { title: "Für die Gastronomie", description: "Website mit Speisekarte und Reservationen, Social Media, Google, KI und Automatisierung: der digitale Partner zum Fixpreis für Restaurants, Grotti und Bars." },
  },
};

/** I testi della landing nella lingua scelta (null per l'italiano, che sta gia' in `content.ts`). */
export function landingText(lang: Lang): LandingText | null {
  if (lang === "it") return null;
  const t = TRANSLATIONS[lang];
  return lang === "fr" ? frenchTypography(t) : t;
}

/** La stessa landing con i testi nella lingua scelta: struttura e ordine dei servizi restano quelli dell'originale. */
export function translateLanding(landing: Landing, lang: Lang): Landing {
  const t = landingText(lang);
  if (!t) return landing;
  return {
    ...landing,
    label: t.label,
    sector: t.sector,
    exampleBusiness: t.exampleBusiness,
    title: t.title,
    subtitle: t.subtitle,
    servicesHeading: t.servicesHeading,
    services: landing.services.map((s) => ({ ...s, ...(t.services[s.id] ?? {}) })),
    faq: t.faq,
    meta: t.meta,
  };
}
