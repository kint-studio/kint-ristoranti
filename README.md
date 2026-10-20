# kint-ristoranti

La landing di kint per i ristoratori (ristoranti, grotti e bar): una pagina sola, con la forchetta 3D nella schermata
iniziale, i servizi, il modulo di contatto (apre una email pronta verso info@kint.ch) e le FAQ. Ogni lingua ha anche
una versione testuale ("Machine") per agenti AI e crawler.

Progetto Next.js standard: si pubblica su Vercel (o qualsiasi host Next.js) senza configurazione.

## Avvio

```bash
npm install
npm run dev        # http://localhost:3000
```

Serve Node.js 20.9 o piu' recente.

## Comandi

| Comando | Cosa fa |
|---|---|
| `npm run dev` | server di sviluppo |
| `npm run lint` | ESLint |
| `npm test` | test (Vitest): indirizzi attesi e completezza delle traduzioni |
| `npm run build` | build di produzione (`next build`) |
| `npm start` | serve la build |

## Indirizzi

| Indirizzo | Pagina |
|---|---|
| `/` | landing in italiano |
| `/machine` | versione testuale in italiano |
| `/en`, `/fr`, `/de` | landing in inglese, francese, tedesco |
| `/en/machine`, `/fr/machine`, `/de/machine` | versione testuale tradotta |

Tutto il resto risponde 404. L'italiano sta in `src/app/(it)/`, le altre lingue in `src/app/[lang]/`: sono due layout
radice, cosi' `<html lang>` e' giusto gia' nell'HTML servito.

## Dove sono le cose

- Testi italiani: `src/lib/content.ts`; traduzioni della landing: `src/lib/landing-i18n.ts`; testi
  dell'interfaccia (menu, modulo, footer) in tutte le lingue: `src/lib/i18n.ts`.
- La pagina: `src/components/kf/KfLanding.tsx`; la scena con la forchetta: `src/components/kf/KfScene.tsx` e
  `src/components/kf/engine/` (WebGL2 puro, nessuna libreria 3D).
- Metadata (titolo, Open Graph, canonical, hreflang, robots): `src/lib/site.ts`.

## Dominio e indicizzazione

Il dominio definitivo non e' ancora deciso. L'indirizzo pubblico si cambia in un solo punto, `SITE_URL` in
`src/lib/site.ts` (oggi `https://kint-perf.pages.dev`): da li' vengono canonical, hreflang e Open Graph.

Finche' non c'e' il dominio le pagine escono con `robots: noindex, nofollow`. Per accendere l'indicizzazione si imposta
la variabile d'ambiente `NEXT_PUBLIC_INDEX=1` nell'ambiente di build (per esempio nelle impostazioni del progetto su
Vercel) e si rifà la build.
