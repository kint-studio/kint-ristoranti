# Landing ristoranti allineata al sito principale — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Riscrivere la landing ristoranti (oggi Next.js + React + Tailwind + Lenis) come sito statico con lo stesso metodo del sito principale KINT, identica a vista e veloce almeno quanto il principale.

**Architecture:** La sorgente è un solo file HTML italiano, `ristoranti/index.html`, con CSS e moduli ES in `assets/` versionati `?v=`. Un generatore Node, sul modello di `tools/ai-export.mjs` + `tools/i18n.mjs` del principale, produce:
- le pagine en/fr/de;
- le pagine Machine `/ai/ristoranti/`;
- head SEO e JSON-LD;
- sitemap, robots, `_redirects`;
- il blocco generato di `_headers` con la CSP.

`tools/build.mjs` crea `dist/` con CSS e JS in bundle con hash, come il principale. I file condivisi con il principale restano copie identiche in `assets/`. Tutto ciò che è solo della landing sta in `assets/ristoranti/`.

**Tech Stack:** HTML, CSS, moduli ES, Canvas 2D, WebGL2 per la forchetta, Web Worker. Node ≥ 20.9 con `node --test`. esbuild. Python 3 per il server locale. Solo devDependencies.

**Spec:** `docs/superpowers/specs/2026-10-20-ristoranti-allineamento-design.md` (leggerla per intero prima di ogni task).

**Repository di riferimento** (sola lettura, mai modificarlo salvo `.claude/launch.json` nel Task 2): `C:\_EDOARDO\z_kint\KINT-codice-completo`, d'ora in poi «il principale».

## Global Constraints

- **Nessuna dipendenza di runtime.** `package.json` ha solo `devDependencies`: `esbuild`, `puppeteer-core`, più `sharp`, `fontkit` e `subset-font` solo se servono davvero. Restano `"type": "module"`, `"private": true`, `engines.node ">=20.9.0"` e `name: "kint-ristoranti"`.
- **Via del tutto** Next.js, React, Tailwind, Lenis, TypeScript, ESLint, vitest, `src/`, `public/`, `next.config.ts`, `tsconfig*`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts` e `next-env.d.ts`.
- **Indirizzi:**

  | Indirizzo | Pagina |
  |---|---|
  | `/ristoranti/` | Human italiana |
  | `/en/ristoranti/`, `/fr/ristoranti/`, `/de/ristoranti/` | Human tradotte |
  | `/ai/ristoranti/`, `/en/ai/ristoranti/`, `/fr/ai/ristoranti/`, `/de/ai/ristoranti/` | Machine |

  `/`, `/en/`, `/fr/` e `/de/` rimandano con 301 alla landing della lingua.
- **`BASE = 'https://kint-perf.pages.dev'`**: una sola costante, in `tools/export.mjs`. I link al sito principale (logo, «kint» nel copyright) sono `BASE + '/'`.
- **Indicizzazione:** `noindex, nofollow` (meta robots e `robots.txt` Disallow) salvo con `INDEX=1`. Le pagine `/ai/` sono sempre `noindex`.
- **Social:** LinkedIn `https://www.linkedin.com/company/kint-ch/home/`, Instagram `https://www.instagram.com/kint.ch/`. Email `info@kint.ch`, contatto via `mailto:`.
- **File condivisi:** ogni file in `assets/` (non in `assets/ristoranti/`) che esiste anche in `KINT-codice-completo/assets/` deve essere **byte-identico** a quello del principale (CRLF/LF normalizzati). Le varianti per la forchetta vanno in `assets/ristoranti/<nome>.js` e importano o estendono la copia condivisa, con un commento che dice cosa cambia.
- **Stile del codice:** si segue il file del principale da cui si parte. Moduli compatti, commenti brevi in inglese in `assets/` e `tools/`, test in italiano come nel principale. Niente TypeScript, niente JSX.
- **Versioni:** ogni JS, CSS e woff2 di `assets/` è richiamato con `?v=<versione>`. Ogni modifica di un file cambia la sua versione e quella di chi lo importa.
- **Header**, come il principale:
  - CSP senza `'unsafe-inline'` negli script (hash sha256 degli script inline eseguibili) e con `worker-src 'self'`;
  - HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`;
  - `Permissions-Policy` senza `interest-cohort`;
  - cache di un anno immutabile per js, css e woff2; per webp e svg, un giorno con `stale-while-revalidate`.
- **Parità visiva:** la verità è la versione Next al commit `30508ec`, in build di produzione. La sola differenza ammessa senza chiedere è lo scroll nativo al posto di Lenis. Una differenza visibile fatta per le prestazioni si chiede all'utente (il controller si ferma e chiede).
- **Prestazioni (soglie):**
  - durante 10 s di scroll continuo su desktop (1440×900), nessun long task oltre 50 ms;
  - TBT Lighthouse (mobile e desktop) non peggiore della home del principale misurata nello stesso run.
- **Commit:** in italiano, che finiscono con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Nessun push: lo fa il controller quando l'utente lo chiede.
- **Repository pubblico:** niente segreti, `.env` o email personali, URL `*.workers.dev`, «edoardo».

## Review Focus

1. **Scena senza WebGL2 o con immagini che non si caricano:** oggi resta il testo e la scena ripiega sulla foto in rilievo. Deve ripiegare allo stesso modo, senza errori in console. Test nel Task 5.
2. **`prefers-reduced-motion: reduce`:** la formazione è subito completa, niente cursore automatico, niente scia in movimento, scroll nativo non animato. Test nel Task 5 e verifica nel Task 8.
3. **Scheda nascosta o hero fuori schermo:** zero frame disegnati dalla scena e dalla scia. Test nel Task 5 con un finto scheduler e un finto IntersectionObserver.
4. **Modulo di contatto con caratteri speciali** (`&`, `?`, `#`, accenti, a capo) nei campi: l'URL `mailto:` è codificato correttamente e il settore è quello della pagina. Test nel Task 4.
5. **Cambio lingua dal menu, su una pagina tradotta e su una Machine:** porta alla stessa pagina nell'altra lingua, Human→Human e Machine→Machine, mai a `/` o a una pagina inesistente. Test nel Task 6 (link interni tutti risolti nel `dist`).

---

### Task 1: Riferimento «prima» (build Next, screenshot, misure)

Questo task si fa prima di toccare il codice Next.

**Files:**
- Create: `tools/perf/shots.mjs`, `tools/perf/scroll-profile.mjs`, `tools/perf/README.md`
- Create (git-ignorato): `.baseline/` con screenshot e numeri
- Modify: `.gitignore` (aggiungere `.baseline/`, `dist/`), `package.json` (aggiungere solo `puppeteer-core` in devDependencies)

**Interfaces:**
- Produces:
  - `node tools/perf/shots.mjs <baseUrl> <outDir> [--paths=/,/en]`: scrive `<outDir>/<w>x<h>/<path-slug>/<sezione>.png` per 1440×900 e 375×812. Le sezioni sono hero, servizi (con la prima voce aperta), contatto, faq, footer e menu aperto. Usa Chrome installato (`PUPPETEER_EXECUTABLE_PATH` oppure il percorso standard di Windows).
  - `node tools/perf/scroll-profile.mjs <url> [--json]`: scroll continuo di 10 s dall'alto al fondo e ritorno a 1440×900. Stampa `{longTasks: n, maxLongTaskMs, scriptingMs, frames, droppedFramesPct}`.
  - Lighthouse: `npx --yes lighthouse@12 <url> --preset=desktop|--form-factor=mobile --output=json --output-path=...`, con i campi performance score, LCP, TBT e CLS.
- La build di riferimento della versione Next sta in un worktree esterno: `git worktree add ../kint-ristoranti-next 30508ec`, poi `npm ci && npx next build && npx next start -p 3111`. Il worktree resta per i confronti dei task successivi.

- [ ] **Step 1:** Crea il worktree, installa ed esegui `next build`, poi avvia `next start -p 3111` in background. Atteso: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3111/` → `200`.
- [ ] **Step 2:** Scrivi `shots.mjs` e `scroll-profile.mjs`. Eseguili su `http://localhost:3111` per `/` e `/en`. Atteso: PNG in `.baseline/next/` e un JSON di profilo.
- [ ] **Step 3:** Esegui Lighthouse mobile e desktop su `http://localhost:3111/`. Esegui Lighthouse e `scroll-profile` anche sulla home del principale servita dal suo `dist`:

  ```bash
  cd ../KINT-codice-completo && npm run build
  python -m http.server 8091 -d dist
  ```

  Scrivi `.baseline/numbers.md` con una tabella Next contro principale.
- [ ] **Step 4:** Commit (solo `tools/perf/*`, `.gitignore` e `package.json`): «chore: strumenti di misura e riferimento della versione Next».

### Task 2: Via Next, scheletro statico, server locale, test di base

**Files:**
- Delete: `src/`, `public/` (prima sposta `public/forma/*.webp` in `assets/ristoranti/` con gli stessi nomi), `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `AGENTS.md`/`CLAUDE.md` attuali (da riscrivere brevi)
- Create: `package.json` (scripts `test`, `dev`, `build`, `export`), `tools/dev_server.py`, `index.html` (rimando minimo a `/ristoranti/`), `ristoranti/index.html` (scheletro: head con meta charset e viewport, `<main>` vuoto), `tests/paths.test.js`, `tests/shared-assets.test.js`, `README.md`
- Copy, identici, dal principale: `assets/geist-sub.woff2`, `assets/geist-mono-sub.woff2`, `assets/geist-LICENSE.txt`, `favicon.ico`, `apple-touch-icon.png`, `assets/og-kint.jpg`
- Modify (repository principale, file locale non committato): `KINT-codice-completo/.claude/launch.json`, cioè la voce `ristoranti-dev`, che diventa `{"name":"ristoranti-dev","runtimeExecutable":"python","runtimeArgs":["C:/_EDOARDO/z_kint/kint-ristoranti/tools/dev_server.py","--port","3101"],"port":3101}`

**Interfaces:**
- Produces:
  - `python tools/dev_server.py [--port 3101] [--dist]`. Serve la radice del repository (o `dist/` con `--dist`) con i MIME del principale e `Cache-Control: no-store`. Con `--dist` applica le regole di `_headers` per pattern di percorso e i redirect di `_redirects` (status 301/302). Serve `/x/` come `/x/index.html` e risponde 404 con `404.html`.
  - `npm run dev` = `python tools/dev_server.py --port 3101`
  - `npm test` = `node --test "tests/*.test.js"`

- [ ] **Step 1: Write failing tests**
  - `tests/shared-assets.test.js`: per ogni file in `assets/` (escluso `assets/ristoranti/`) che esiste in `../KINT-codice-completo/assets/`, contenuto uguale con `\r\n`→`\n`. Si salta con `t.skip` se il principale non c'è.
  - `tests/paths.test.js`:
    - nessun file tracciato contiene `next/`, `react`, `lenis`, `tailwind`, `/_next/`, `workers.dev`, `edoardo` (insensibile al caso). Esclusi `docs/`, `tools/perf/`, `package-lock.json`, `.baseline/`.
    - `package.json` non ha `dependencies`.
- [ ] **Step 2:** `npm test` → FAIL, perché c'è ancora Next.
- [ ] **Step 3:** Esegui cancellazioni, spostamenti e copie. Scrivi `dev_server.py`, partendo da quello del principale (senza `do_PUT`) e aggiungendo `--dist`, `_headers`, `_redirects` e 404. Scrivi il `package.json` nuovo, poi `npm install`. Scrivi il README in italiano (cos'è, `npm install`, `npm run dev`, `npm test`, `npm run build`, indirizzi, `BASE`, `INDEX=1`, trasloco futuro in kint-website-official).
- [ ] **Step 4:** `npm test` → PASS. Con `npm run dev`:
  - `curl -I http://localhost:3101/ristoranti/` → 200;
  - `curl http://localhost:3101/nope` → 404.
- [ ] **Step 5:** Commit: «refactor: via Next.js, scheletro statico come il sito principale».

### Task 3: Pagina Human italiana: markup e CSS (senza JS)

**Files:**
- Modify: `ristoranti/index.html`, cioè tutte le sezioni in HTML statico: header con logo e pulsante «caffè» e menu, hero (contenitore della scena, `k.`, titolo, sottotitolo, didascalia ↓), servizi a fisarmonica (`<details>`/`<summary>` o pulsanti con `aria-expanded`, come `service-accordion.js` del principale), contatto con modulo, FAQ, footer con marchio, menu overlay (`inert` quando chiuso), interruttore Human/Machine.
- Create: `assets/ristoranti/ristoranti.css`, che sostituisce Tailwind e `src/app/globals.css`: stesse misure, colori `--kf-*`, `clamp()`, breakpoint `sm 640`/`md 768`/`lg 1024`, `@font-face` Geist e Geist Mono da `assets/geist*-sub.woff2` con `font-display: swap`, `scroll-behavior: smooth` solo senza `prefers-reduced-motion`.
- Test: `tests/page.test.js`

**Interfaces:**
- Consumes: testi italiani da `git show 30508ec:src/lib/content.ts`, `src/lib/i18n.ts` e `src/lib/landing-i18n.ts` (parte italiana). L'ordine e la struttura delle sezioni vengono da `src/components/kf/KfLanding.tsx`.
- Produces: id delle sezioni `top`, `servizi`, `prenota`, `faq`; gli attributi `data-*` che il JS dei task 4 e 5 aggancia:
  - `data-scene` (contenitore hero) con dentro `canvas` e `.kf-cursor`;
  - `data-menu-open`, `data-menu-close`, `#menu`;
  - `data-accordion` (gruppo) e `data-accordion-item`;
  - `form[data-contact]` con `data-sector` e `data-example`;
  - `data-footer-wordmark`;
  - `[data-service-trail]` (canvas nei servizi);
  - `[data-year]`.

  Tutti i testi visibili sono nell'HTML, nessuno nel JS, tranne quelli passati da `t()` nel Task 4.

- [ ] **Step 1: Write failing tests** in `tests/page.test.js`:
  - `ristoranti/index.html` ha `<html lang="it">`, un solo `<h1>`, le sezioni `#top #servizi #prenota #faq`, nessun `style=` inline e nessun `<script>` inline (salvo JSON-LD aggiunto dopo).
  - Ogni `<img>` ha `width`, `height` e `alt`.
  - Il numero di servizi e di FAQ è uguale a quello di `content.ts` al commit `30508ec`, scritto a mano come costante nel test.
  - Il testo del `<h1>` è uguale a `title.before + title.accent + "."` italiano.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Scrivi markup e CSS. La pagina deve apparire uguale alla Next con la scena vuota: sfondo della hero dello stesso colore di partenza della scena.
- [ ] **Step 4:** `npm test` → PASS. Esegui `node tools/perf/shots.mjs http://localhost:3101/ristoranti/ .baseline/static` e confronta a occhio con `.baseline/next/` sezione per sezione, a 1440 e a 375 (salvo la scena). Elenca le differenze nel report del task e correggile.
- [ ] **Step 5:** Commit: «feat: pagina ristoranti in HTML e CSS statici».

### Task 4: Interazioni (menu, fisarmonica, ancore, contatto, footer, lingua, vista)

**Files:**
- Create: `assets/ristoranti/landing.js` (entry, `type="module"`), più i moduli di sola landing che servono in `assets/ristoranti/`, per esempio `menu.js` e `contact.js`.
- Copy, identici, dal principale, se fanno quello che serve: `assets/i18n.js`, `assets/frame-scheduler.js`, `assets/style-cache.js`, `assets/service-accordion.js`, `assets/footer-wordmark.js`, `assets/mail-compose.js`, `assets/lang-switch.js`. Se uno non va bene così com'è, la variante va in `assets/ristoranti/` e la copia identica non si mette.
- Modify: `ristoranti/index.html` (script module e modulepreload del grafo, come il principale)
- Test: `tests/contact.test.js`, `tests/module-graph.test.js` (copiato e adattato dal principale: entry `assets/ristoranti/landing.js`)

**Interfaces:**
- Produces:
  - `composeLandingMail({name,business,email,message,sector}, labels) -> string`, l'href `mailto:info@kint.ch?subject=…&body=…`, in `assets/ristoranti/contact.js`. Il corpo ha lo stesso formato di `KfContactForm.tsx`: `${mailName}: …\n${mailBusiness}: …\n${mailSector}: …\n${mailEmail}: …\n\n${message}`, e l'oggetto è `subject.replace('{x}', business||name)`.
  - `initLanding(document)`, chiamata da `landing.js`.
- Comportamenti da riprodurre come in Next:
  - menu che apre e chiude, Esc, focus intrappolato, `inert`;
  - fisarmonica con la prima voce aperta;
  - ancore #top, #servizi, #prenota con scroll nativo;
  - messaggio «fatto» dopo l'invio;
  - anno corrente nel footer;
  - marchio del footer che si adatta alla larghezza (`footer-wordmark.js`);
  - sblocco `:active` su iOS (listener `touchstart` passivo).

- [ ] **Step 1: Write failing tests:**
  - `tests/contact.test.js`: `composeLandingMail` con `business: "Trattoria & Co #1?"`, `message: "Ciao\nàèì"` → `decodeURIComponent` di subject e body restituisce esattamente i testi attesi. Il settore è quello passato. L'href inizia con `mailto:info@kint.ch?subject=`.
  - `tests/module-graph.test.js`: una sola versione per modulo; `ristoranti/index.html` precarica esattamente il grafo.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementa. Nessun listener di scroll o `requestAnimationFrame` proprio: tutto il lavoro per frame passa da `scheduler` di `frame-scheduler.js`.
- [ ] **Step 4:** `npm test` → PASS. Nel browser su `http://localhost:3101/ristoranti/`: menu, fisarmonica, ancore e invio del modulo (si apre il `mailto:`) funzionano, e la console è pulita.
- [ ] **Step 5:** Commit: «feat: interazioni della landing ristoranti senza framework».

### Task 5: Scena della hero (forchetta) e scia dei servizi

Task di giudizio: modello più capace.

**Files:**
- Copy, identici, dal principale: `assets/formation-engine.js`, `assets/trail-engine.js`, `assets/depth-surface.js`, `assets/fluid-field.js`, `assets/material.js`, `assets/material-worker.js`, `assets/idle-cursor.js`, `assets/scene-engine.js`, `assets/service-trail.js` (solo quelli che si usano davvero).
- Create:
  - `assets/ristoranti/fork-3d.js`: conversione JS di `src/components/kf/engine/fork-3d.ts`, WebGL2 puro.
  - `assets/ristoranti/fork-scene.js`: estende o configura `SceneEngine` del principale con i parametri della forchetta. Valori da `KfScene.tsx`:
    - `BOUNDS = {top:.042,bottom:.958,left:.417,right:.625}`;
    - `DEPTH_STYLE = {kind:'lineare',gain:.5,cap:.025}`;
    - `layout()` come in `KfScene.tsx`;
    - `maxDpr` 2 su touch e 1,5 su desktop;
    - immagini per larghezza come `goldImageUrl`.

    Aggiunge ciò che la scena Next fa e quella del principale non fa: la posa 3D che segue il cursore e, su touch, il cursore automatico che gira la forchetta.
  - `assets/ristoranti/fork-images.js`: gli URL delle immagini in `assets/ristoranti/`.
  - `assets/ristoranti/hero.js`: avvio come `KfScene.tsx`, cioè:
    - avvio al 35% di visibilità;
    - stop fuori schermo e a scheda nascosta;
    - 4 fotogrammi al secondo da ferma;
    - `reduced` → formazione completa subito;
    - fallback senza WebGL2 con la foto in rilievo e il materiale nel worker;
    - errori → resta il testo.

    Usa `scheduler` del principale invece di un `requestAnimationFrame` proprio, se lo consente senza cambiare il ritmo dei frame. Se non lo consente, un solo rAF che si ferma da solo, come `frame()` in `app.js` del principale.
  - Preload statici in `ristoranti/index.html` delle stesse immagini di `ForkPreload`, con gli stessi `media` e `fetchpriority`.
- Test: `tests/hero.test.js`, `tests/fork-scene.test.js`

**Interfaces:**
- Consumes: `scheduler` (`frame-scheduler.js`), `IdleCursor`, `SceneEngine`/`FormationEngine`, `loadMaterial(url,{workerUrl,load,make})` del principale.
- Produces: `startHero(root: Element, {matchMedia, IntersectionObserver, document, loadImage, createCanvas}) -> {stop()}` in `hero.js`, con le dipendenze iniettabili per i test.

- [ ] **Step 1: Write failing tests:**
  - `tests/fork-scene.test.js`: `layout(1440,900)` e `layout(375,812)` restituiscono lo stesso rettangolo della funzione `layout` di `KfScene.tsx`. I valori attesi vanno calcolati a mano e scritti nel test.
  - `goldImageUrl` con touch non restituisce mai l'immagine da 2048 px.
  - `tests/hero.test.js`, con finti IntersectionObserver, `document.hidden` e `matchMedia`:
    - (a) con l'hero non visibile, 0 chiamate a `engine.frame` in 1 s simulato;
    - (b) con `document.hidden=true`, 0 chiamate;
    - (c) con `prefers-reduced-motion`, `engine.elapsed === FORMATION_DONE_MS` all'avvio;
    - (d) se `loadFork3D` restituisce `null`, si usa il percorso foto più materiale, senza eccezioni;
    - (e) se `loadImage` rifiuta, `startHero` non lancia e non resta nessun canvas visibile con errore.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementa. Confronta la scena affiancata con `http://localhost:3111/`:
  - tempi della formazione;
  - rilievo;
  - colori del fondo;
  - cursore;
  - rotazione 3D;
  - telefono (375×812 con touch emulato).

  Vince l'aspetto Next. Ottimizzazioni invisibili sono permesse; quelle visibili si segnalano al controller prima di farle.
- [ ] **Step 4:** `npm test` → PASS. Esegui `node tools/perf/scroll-profile.mjs http://localhost:3101/ristoranti/`: 0 long task oltre 50 ms (sulla sorgente non in bundle è indicativo, la soglia vera si misura nel Task 8). Console pulita, anche con WebGL disattivato (`--disable-webgl` in `shots.mjs` o flag equivalente).
- [ ] **Step 5:** Commit: «feat: scena della forchetta con i motori del sito principale».

### Task 6: Generatore: lingue, Machine, SEO, sitemap, header

**Files:**
- Copy, identico, dal principale: `tools/i18n.mjs`. Se serve un cambiamento (per esempio la sorgente in `ristoranti/index.html` invece di `index.html`), la variante va in `tools/i18n.mjs` con un commento in testa che dice cosa cambia rispetto al principale. Questo file è escluso dal test di identità, che riguarda solo `assets/`.
- Create:
  - `i18n/en.json`, `i18n/fr.json`, `i18n/de.json` (e `keep.json` se serve): chiave = testo italiano, valore = traduzione. Le traduzioni vengono da `landing-i18n.ts` e `i18n.ts` al commit `30508ec`, senza ritradurre.
  - `tools/export.mjs`: `BASE` e `INDEX` (da `process.env.INDEX==='1'`).
  - `assets/machine.css`, `assets/mode-switch.js`, `assets/mode-switch.css`, copiati identici dal principale.
- Generated (committati, come nel principale): `en/ristoranti/index.html`, `fr/…`, `de/…`, `ai/ristoranti/index.html` + `en|fr|de/ai/ristoranti/index.html`, `sitemap.xml`, `robots.txt`, `_redirects`, il blocco `# --- ai-export: inizio/fine` di `_headers` (con il nome del marcatore uguale al principale), `404.html`.
- Test: `tests/export.test.js`, `tests/i18n-dictionaries.test.js`, `tests/cache-headers.test.js` (adattato dal principale)

**Interfaces:**
- Produces:
  - `generate() -> {files: Map<path,string>}` e `stale(files) -> string[]`, come `tools/ai-export.mjs`.
  - `node tools/export.mjs [--check]`.
  - `npm run export`.
  - Head di ogni Human:
    - `<html lang>`;
    - title e description della landing nella lingua (da `landing.meta`);
    - canonical;
    - hreflang it/en/fr/de + `x-default` → `/ristoranti/`;
    - Open Graph (`og:locale` `it_CH`/`en_GB`/`fr_CH`/`de_CH` come il principale, `og:image` = `BASE/assets/og-kint.jpg` 1200×630);
    - icone;
    - JSON-LD `WebPage` + `Service` (`areaServed` Svizzera e Italia, `provider` = Organization KINT con `url` = `BASE/`);
    - `robots` secondo `INDEX`.
  - Machine: contenuto di `MachineView.tsx` al commit `30508ec`, nel markup delle pagine `/ai/` del principale, sempre `noindex`, con link «Versione Human» e lingue Machine→Machine.

- [ ] **Step 1: Write failing tests:**
  - `tests/export.test.js`:
    - `stale(files)` vuoto;
    - per ogni lingua, `<html lang="xx">`, canonical `BASE/xx/ristoranti/` (it: `BASE/ristoranti/`), 4 hreflang reciproci + `x-default`;
    - `og:locale` giusto;
    - `meta name="robots"` contiene `noindex` senza `INDEX` e non lo contiene con `INDEX=1` (genera con env impostata);
    - le pagine `/ai/` sempre `noindex`;
    - la sitemap ha le 4 Human con alternate e nessuna `/ai/`;
    - `robots.txt` senza `INDEX` contiene `Disallow: /`;
    - `_redirects` contiene `/ /ristoranti/ 301`, `/en/ /en/ristoranti/ 301`, `/fr/ /fr/ristoranti/ 301`, `/de/ /de/ristoranti/ 301`;
    - la CSP del blocco generato contiene lo sha256 di ogni `<script>` inline eseguibile di ogni pagina generata e nessun `'unsafe-inline'` in `script-src`, oltre a `worker-src 'self'`;
    - `Permissions-Policy` non contiene `interest-cohort`.
  - `tests/i18n-dictionaries.test.js`: per en, fr e de, `node tools/i18n.mjs --missing <lang>` restituisce `[]`, e nessuna pagina tradotta contiene testo italiano rimasto. Si controlla con un campione di frasi italiane uniche (`ui.coffee`, il titolo dell'hero, l'etichetta dei servizi) scritte come costanti.
  - `tests/cache-headers.test.js`: adattato dal principale (regole di cache scritte a mano e `?v=` ovunque).
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementa, partendo da `tools/ai-export.mjs` del principale e togliendo `llms`, `agents`, `.md` e `data/*.json`. Le stringhe usate dal JS passano da `t()` di `assets/i18n.js` e stanno negli stessi dizionari, come nel principale.
- [ ] **Step 4:** `npm run export && npm test` → PASS. `curl` su `http://localhost:3101/` per ognuno degli 8 indirizzi della tabella → 200. Lo shot di `/en/ristoranti/` va confrontato con `.baseline/next/…/en`.
- [ ] **Step 5:** Commit: «feat: lingue, pagine Machine, SEO e header generati».

### Task 7: Build in `dist/` e test sul risultato

**Files:**
- Create: `tools/build.mjs`, sul modello di quello del principale:
  - `HUMAN_PAGES` = le 4 pagine `ristoranti/`;
  - `PUBLISHED_DIRS` = `ristoranti`, `ai`, `en`, `fr`, `de`;
  - in radice: `index.html`, `404.html`, `_headers`, `_redirects`, `robots.txt`, `sitemap.xml`, `favicon.ico`, `apple-touch-icon.png`;
  - `assetsToPublish` che include `assets/ristoranti/**`;
  - CSS unito in `assets/ristoranti/landing.<hash>.css`;
  - JS in `assets/ristoranti/landing.<hash>.js`;
  - worker in un bundle a parte con hash;
  - CSP ricalcolata sugli script inline del `dist`, come fa il principale dopo il roast.
- Test: `tests/build.test.js`, `tests/dist-links.test.js`

**Interfaces:**
- Consumes: `generate()` del Task 6, `ristoranti/index.html` e `assets/ristoranti/landing.js`.
- Produces: `buildSite(outDir) -> Promise<void>` e `npm run build` = `node tools/export.mjs && node tools/build.mjs`.

- [ ] **Step 1: Write failing tests:**
  - `tests/build.test.js`: in una cartella temporanea:
    - esistono gli 8 HTML della tabella degli indirizzi, più `index.html`, `404.html`, `_headers` e `_redirects`;
    - ogni pagina Human carica esattamente 1 CSS e 1 JS con hash di 10 caratteri;
    - nessun `modulepreload` rimasto;
    - il worker è referenziato con nome con hash;
    - ogni sha256 nella CSP di `_headers` corrisponde a uno script inline presente nel `dist` e viceversa;
    - nessun file in `dist` contiene `node_modules`, `tools/` o `.ts`.
  - `tests/dist-links.test.js`: ogni `href` e `src` interno (che inizia con `/` o è relativo) di ogni HTML del `dist` risolve a un file del `dist`, considerando `_redirects`.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementa.
- [ ] **Step 4:** `npm run build && npm test` → PASS. Con `python tools/dev_server.py --port 3101 --dist`: `curl -I` di `/ristoranti/` mostra `Content-Security-Policy`, e `/` risponde 301 verso `/ristoranti/`. Nel browser la console è senza errori né violazioni CSP su `/ristoranti/`, `/en/ristoranti/` e `/ai/ristoranti/`.
- [ ] **Step 5:** Commit: «feat: build di pubblicazione in dist come il sito principale».

### Task 8: Verifica finale: parità, prestazioni, report

**Files:**
- Create: `docs/superpowers/reports/2026-10-20-ristoranti-allineamento-report.md`
- Modify: `README.md` (comandi finali), `AGENTS.md` breve (opzionale: cos'è, comandi, regola dei file condivisi identici al principale)

- [ ] **Step 1:** Servi `dist` con `python tools/dev_server.py --port 3101 --dist` e la Next su 3111. Esegui `shots.mjs` su entrambi per `/` (Next) contro `/ristoranti/`, e per `/en` contro `/en/ristoranti/`, a 1440×900 e 375×812. Elenca ogni differenza visiva. Ammesse solo lo scroll nativo e quelle già approvate.
- [ ] **Step 2:** Lighthouse mobile e desktop e `scroll-profile.mjs` su `dist` (`/ristoranti/`), Next (3111) e home del principale (8091), nello stesso run. Atteso: 0 long task oltre 50 ms durante lo scroll desktop della landing; TBT della landing ≤ TBT della home del principale (mobile e desktop).
- [ ] **Step 3:** Verifica con `prefers-reduced-motion: reduce` emulato (niente animazioni continue) e con WebGL disattivato (fallback, console pulita).
- [ ] **Step 4:** Scrivi il report:
  - tabella dei numeri prima e dopo e del principale;
  - differenze visive;
  - copie condivise e varianti in `assets/ristoranti/` con il motivo;
  - checklist del trasloco futuro: quali cartelle copiare in kint-website-official, quali blocchi di `_headers`, `_redirects` e sitemap unire, quali file condivisi scartare perché identici.
- [ ] **Step 5:** `npm test` → PASS. Commit: «docs: report dell'allineamento della landing ristoranti».
