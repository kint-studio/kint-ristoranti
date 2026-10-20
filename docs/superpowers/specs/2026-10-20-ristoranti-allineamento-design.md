# Landing ristoranti allineata al sito principale

Data: 2026-10-20 · Repository: `kint-studio/kint-ristoranti` (cartella locale `C:\_EDOARDO\z_kint\kint-ristoranti`) · Riferimento: sito principale in `C:\_EDOARDO\z_kint\KINT-codice-completo` (`kint-studio/kint-website-official`, pubblicato su https://kint-perf.pages.dev).

## Perché

La landing ristoranti è stata sviluppata da un'altra persona in Next.js + React + Tailwind + TypeScript. È lenta e scatta anche su desktop. Il sito principale è HTML statico con moduli JavaScript leggeri, già ottimizzato (un solo pianificatore dei frame, animazioni ferme fuori schermo, build con hash, header di cache e sicurezza, CSP con hash).

La landing diventerà una sottopagina del sito principale: **kint.ch/ristoranti**, con kint.ch come home. Va quindi scritta con lo stesso metodo, così il trasloco sarà una copia di cartelle e non una riscrittura.

## Obiettivi

1. **Stessa pagina, motore nuovo.** Aspetto, testi, sezioni e ordine restano quelli di oggi. Le sezioni sono: hero con la forchetta 3D, servizi a fisarmonica su fondo scuro con la scia, invito e modulo di contatto, FAQ, footer con il marchio gigante, menu a schermo intero, interruttore Human/Machine. In 4 lingue: it, en, fr, de.
2. **Stesso metodo del sito principale.**
   - HTML statico, CSS, moduli ES in `assets/` con versione `?v=`.
   - Un generatore Node (sul modello di `tools/ai-export.mjs` + `tools/i18n.mjs`) che da una sola sorgente italiana produce:
     - le pagine tradotte;
     - le pagine Machine;
     - head SEO (canonical, hreflang, Open Graph, JSON-LD);
     - sitemap, robots;
     - il blocco generato di `_headers` con la CSP e gli hash degli script inline eseguibili.
   - Build con esbuild in `dist/` (sul modello di `tools/build.mjs`: CSS unito e minificato, JS in bundle con hash nel nome).
   - Test con `node --test`.
   - Server di sviluppo come `tools/dev_server.py`, o equivalente.
3. **Prestazioni almeno pari al sito principale**, misurate prima e dopo (vedi «Verifica»). Nessun lag allo scroll su desktop e mobile.
4. **Pronta al trasloco.** La pagina vive già al percorso che avrà sul sito principale. Spostarla in kint-website-official deve essere copiare file e unire configurazioni, non riscrivere.

## Non obiettivi

- Trasloco in kint-website-official: non ora. Tutto resta in questo repository.
- Pubblicazione: per ora solo GitHub e locale. Niente Cloudflare, Vercel o altro hosting, niente wrangler.
- Ridisegno: nessun cambio di stile, testi o struttura delle sezioni.
- Landing palestre e studi: dopo, con lo stesso percorso.
- Privacy policy, invio del modulo a un server: il contatto resta una bozza mailto.

## Anti-obiettivi (fallimento anche se funziona)

- La pagina appare diversa da oggi in modo visibile, a parte lo scroll e quanto elencato sotto.
- Resta un framework (React, Next, Tailwind) o una dipendenza di runtime.
- Prestazioni peggiori del sito principale sulla stessa macchina.
- Codice che non segue le convenzioni del sito principale e andrebbe riscritto al trasloco.

## Decisioni prese con l'utente

- **Riscrittura** con lo stesso metodo del sito principale (approvata).
- **Il codice resta in `kint-ristoranti`** per ora.
- **Pubblicazione:** solo GitHub (push su `main`) e localhost.
- **Il contatto resta mailto.** Si compila il modulo e si apre la mail già pronta, come oggi.

## Scelte mie (l'utente le ha viste come proposta, correggibili)

- **Stack rimosso:** Next.js, React, Tailwind, Lenis, TypeScript, ESLint config next, vitest. Il `package.json` finale ha solo devDependencies di strumenti (esbuild e, se servono, sharp, fontkit e subset-font come nel principale). Nessuna dipendenza di runtime.
- **Scroll nativo, come sul sito principale.** Lenis va tolto. È l'unico cambiamento percepibile previsto; i link interni (#servizi, #prenota, #top) usano `scroll-behavior: smooth` nativo, rispettando `prefers-reduced-motion`.
- **Motori dal sito principale.** La scena (formazione da cifre binarie, superficie in rilievo, materiale ceramica/oro con worker, fluido, cursore a riposo, scia dei servizi) si basa sulle versioni di `KINT-codice-completo/assets/` (`scene-engine.js`, `formation-engine.js`, `depth-surface.js`, `fluid-field.js`, `material.js`, `material-worker.js`, `idle-cursor.js`, `service-trail.js`, `trail-engine.js`, `frame-scheduler.js`), adattate alla forchetta. Non si portano i motori `.ts` della landing.
  - Il 3D della forchetta (`fork-3d.ts`, WebGL puro senza three.js) va convertito in JS.
  - Tutto il lavoro per frame passa dal pianificatore unico (`frame-scheduler.js`): lettura, poi scrittura.
  - Le animazioni si fermano fuori schermo (IntersectionObserver) e a scheda nascosta (`visibilitychange`).
  - Rispettano `prefers-reduced-motion` come nel principale.
- **Indirizzi** già quelli del sito principale:

  | Indirizzo | Pagina |
  |---|---|
  | `/ristoranti/` | Human italiana |
  | `/en/ristoranti/`, `/fr/ristoranti/`, `/de/ristoranti/` | Human tradotte |
  | `/ai/ristoranti/`, `/en/ai/ristoranti/`, `/fr/ai/ristoranti/`, `/de/ai/ristoranti/` | Machine, stessa convenzione `/ai/<pagina>/` del principale |

  - In questo repository la radice `/` rimanda a `/ristoranti/` (`_redirects` e un `index.html` minimo con link, per il server locale).
  - Lo stesso vale per `/en/`, `/fr/` e `/de/`.
- **Pagine Machine** nello stile terminale delle pagine `/ai/` del principale (riusa `machine.css` e `mode-switch.js`/`.css`). Restano noindex come nel principale. Contenuto: lo stesso di `MachineView.tsx` oggi.
- **Esportazioni per agenti**: solo pagina Machine, JSON-LD nella head, sitemap e robots. `llms.txt`, `agents.md` e le pagine `.md` le genererà il sito principale al trasloco, dove la pagina verrà aggiunta all'indice. Questo evita due `llms.txt` concorrenti sullo stesso dominio.
- **Base dell'URL**: una costante unica `BASE = 'https://kint-perf.pages.dev'` nel generatore, come nel principale.
- **Indicizzazione** spenta: `noindex` su tutte le pagine finché non si pubblica su kint.ch. Si accende con `INDEX=1 npm run build`, non con una variabile `NEXT_PUBLIC_*`.
- **Link al sito principale**: il marchio «kint» del footer e il logo puntano a `BASE + '/'` (al trasloco diventano `/`). Menu e footer restano ancore della pagina. LinkedIn: `https://www.linkedin.com/company/kint-ch/home/`; Instagram: `https://www.instagram.com/kint.ch/`, come nel principale.
- **Font**: Geist e Geist Mono sottoinsiemi `woff2` self-hosted, come nel principale (`geist-sub.woff2`, `geist-mono-sub.woff2`, rigenerati con lo strumento di subset se servono glifi in più per fr/de). Niente `next/font`.
- **Immagini**: le stesse di `public/forma/` (forchetta ceramica, kintsugi, texture 3D), spostate in `assets/ristoranti/` o simile. Il preload in head è statico e la CSP lo consente.
- **Dev server**: porta 3101, aggiornando la voce `ristoranti-dev` in `KINT-codice-completo/.claude/launch.json`.

## Regole per i casi dubbi (scelte mie, dopo la lettura del revisore)

- **Verità visiva = la versione Next attuale, in build di produzione.** Se un motore del principale si comporta diversamente da quello della landing, vince l'aspetto della landing. Le cose da confrontare sono: tempi della formazione, rilievo, colori, cursore, comportamento mobile, fallback senza WebGL, `prefers-reduced-motion`.
  - Si parte dal motore del principale e si portano dentro i parametri della landing come configurazione, cioè `BOUNDS`, `DEPTH_STYLE`, layout, DPR massimo e immagini.
  - Se serve cambiare la logica di una copia condivisa, la modifica va commentata.
- **Ottimizzazioni invisibili sono permesse.** Si possono ridurre risoluzione di disegno, DPR, frequenza di aggiornamento fuori interazione e costo degli effetti, purché a occhio non si veda differenza nel confronto affiancato.
- **Se le prestazioni richiedono un cambiamento visibile**, si chiede all'utente prima di farlo. Non si sceglie da soli tra «uguale» e «veloce».
  - Obbligatorio comunque: nessun frame lungo (>50 ms) durante lo scroll continuo su desktop, e TBT non peggiore della home del principale.
  - LCP e punteggio Lighthouse vanno portati il più vicino possibile al principale. Lo scarto residuo va spiegato nel report.
- **Pagine Machine**: il contenuto è quello di `MachineView.tsx` in tutte le lingue. Il markup si adatta a quello delle pagine `/ai/` del principale, perché `machine.css` funzioni senza modifiche.
- **Interruttori Human/Machine e lingua**: aspetto e posizione restano quelli della landing di oggi, per la parità visiva. Il codice segue lo stile del principale (`lang-switch.js`, `mode-switch.js`) quando è possibile senza cambiare l'aspetto.
- **Server locale**: si aggiunge un piccolo server (Python come `tools/dev_server.py`, o Node) che serve la sorgente o `dist/` applicando `_headers` e `_redirects`. Così CSP e redirect si verificano davvero in locale. Resta la verifica con test sul file.
- **`launch.json`**: è un file locale non committato del repository principale, e si può aggiornare la voce `ristoranti-dev` perché avvii il nuovo server sulla porta 3101.
- **404, favicon, immagine social**:
  - `dist/` include un `404.html` nello stile della landing;
  - favicon e `apple-touch-icon` sono quelli del principale;
  - l'immagine Open Graph è `og-kint.jpg` del principale per ora. Un'immagine dedicata ai ristoranti è un lavoro futuro.
- **Numeri «prima»** presi dalla build di produzione Next (`next build && next start` sul commit `30508ec`), mai dal dev server.

## Vincoli

- Stessa architettura e convenzioni di file, commenti e test del sito principale, così i file si spostano senza rinomine. Le cartelle sono `assets/`, `tools/`, `tests/`, `i18n/`, `_headers`, `_redirects`, `dist/`.
- I file condivisi con il principale (motori, `frame-scheduler.js`, `machine.css`, `mode-switch.*`, font) sono copie: al trasloco si tiene quella del principale. Ogni modifica a una copia condivisa va commentata, così al trasloco si sa cosa riportare.
- **Header**: cache e sicurezza come il principale, cioè:
  - HSTS;
  - CSP senza `unsafe-inline` per gli script;
  - X-Content-Type-Options;
  - Referrer-Policy;
  - Permissions-Policy senza `interest-cohort`;
  - `worker-src` per il material worker.
- **Repository pubblico**: niente segreti, `.env` o email personali. La storia git resta (le commit vecchie in Next sono la storia).
- Il commit va su `main` di kint-ristoranti con push quando l'utente lo chiede.

## Verifica (definizione di «fatto»)

- `npm test` verde. I test, sul modello del principale, coprono:
  - esportazioni non obsolete (`--check`);
  - grafo dei moduli e versioni `?v=`;
  - header di cache;
  - CSP con hash corretti sul `dist`;
  - dizionari i18n completi (nessuna chiave mancante in en, fr, de);
  - tutte le route attese presenti nel `dist`;
  - nessun link interno rotto;
  - nessun riferimento a `next`, `react`, `lenis`, `/_next/`.
- `npm run build` produce `dist/` e il server locale lo serve.
- **Parità visiva**: confronto a 1440×900 e 375×812 con la versione Next attuale. La versione attuale si ottiene da `git worktree` sul commit `30508ec` avviato con `npm run dev`. Va confrontata ogni sezione, in ogni lingua almeno per hero e servizi. Unica differenza ammessa: lo scroll nativo. Ogni altra differenza va elencata nel report con il motivo.
- **Prestazioni**, prima e dopo, sulla stessa macchina:
  - Lighthouse mobile e desktop: punteggio performance, LCP, TBT, CLS;
  - peso trasferito della pagina;
  - profilo Performance del browser durante 10 secondi di scroll continuo su desktop: frame lunghi, tempo di scripting;
  - lo stesso per la home del sito principale come riferimento.
  
  Il risultato deve essere almeno pari al principale, e i numeri vanno nel report.
- Console senza errori né violazioni CSP, su `dist` servito localmente con gli header applicati (il server locale deve leggere `_headers`, come fa `tools/dev_server.py` del principale se lo fa; altrimenti verifica degli header con un test sul file).

## Lasciato a chi costruisce

- La divisione interna dei moduli JS e del CSS (un file per sezione o meno), purché segua lo stile del principale.
- Come rappresentare la sorgente unica dei testi. Può essere `index.html` italiano + dizionari JSON come nel principale, oppure un file dati. La scelta va motivata nel piano e preferita quella del principale.
- Come ricostruire lo stile senza Tailwind (CSS scritto a mano con le stesse misure, colori e breakpoint).
- Riduzione o ricodifica delle immagini, se migliora i numeri senza differenza visibile.
