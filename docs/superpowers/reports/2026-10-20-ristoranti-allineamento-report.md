# Report: allineamento della landing ristoranti al metodo del sito principale

Data: 2026-10-20. Branch `allineamento`. La landing, prima in Next.js (commit `30508ec`), è ora HTML, CSS e JavaScript statici, senza dipendenze di runtime, con build in `dist/` e header come il sito principale.

## Esito in breve

- Parità visiva: nessuna differenza visibile negli screenshot a 1440x900 e 375x812, in italiano e in inglese (hero, servizi, FAQ, contatto, footer, menu), salvo le differenze già decise, elencate sotto.
- Scroll continuo di 10 s su desktop: 0 long task (soglia rispettata).
- **Soglia TBT non rispettata**: il TBT Lighthouse della landing è più alto di quello della home del principale, sia mobile sia desktop. Rispetto a Next è circa uguale (desktop 98 contro 44, mobile 551 contro 496). Analisi più sotto.
- Punteggio Lighthouse mobile migliore di Next (83 contro 78) e LCP mobile migliore (2,5 s contro 3,5 s).

## Numeri: prima e dopo, Next e principale

Lighthouse 12, Chrome locale, throttling simulato dei preset, tutti nello stesso run. «Next» è la build di produzione del commit `30508ec`, «principale» la home di `KINT-codice-completo` (dist), «nuova» la landing statica (`/ristoranti/`, dist).

| Pagina | Perf | LCP ms | TBT ms | CLS | FCP ms |
|---|---|---|---|---|---|
| Next, desktop | 100 | 710 | 44 | 0,000 | 205 |
| **Nuova, desktop** | 99 | 544 | **98** | 0,000 | 340 |
| Principale, desktop | 100 | 651 | 0 | 0,000 | 483 |
| Next, mobile | 78 | 3530 | 496 | 0,000 | 755 |
| **Nuova, mobile** | 83 | 2471 | **551** | 0,000 | 1420 |
| Principale, mobile | 93 | 3023 | 9 | 0,000 | 1969 |

Riferimento del Task 1 (`.baseline/numbers.md`): Next desktop 100 / 709 / 61, mobile 78 / 3535 / 490; principale desktop 100 / 641 / 0, mobile 92 / 3077 / 11. Le misure di oggi sono coerenti.

Scroll continuo di 10 s a 1440x900 (`tools/perf/scroll-profile.mjs`):

| Pagina | long task | max ms | scripting ms | frame | frame persi % |
|---|---|---|---|---|---|
| Next | 0 | 0 | 166 | 1440 | 0 |
| **Nuova** | **0** | 0 | 82 | 1439 | 0 |
| Principale | 0 | 0 | 1256 | 1274 | 1,65 |

### Analisi del TBT

Le long task di Lighthouse nella landing sono tutte nella scena della forchetta (`landing.js`) e cadono nei primi secondi: su mobile 590 ms (sull'LCP, a 2,4 s), 327 ms e 62 ms; su desktop 125 ms e 112 ms. Un profilo CPU con throttling 4x mostra dove va il tempo: `frame` 193 ms, `paintBinary` 101 ms, `draw` e scia circa 130 ms, `buildPrint` 20 ms. Cioè l'animazione di formazione della forchetta dalle cifre binarie (migliaia di `fillText` per fotogramma nei primi secondi) più la preparazione della scena. Lo stesso lavoro c'era in Next (TBT mobile 496), quindi non è una regressione. Nella home del principale non c'è un'animazione equivalente durante la misura, per questo il suo TBT è quasi zero.

Non l'ho ridotto: alleggerire `paintBinary` o `frame` rischia di cambiare la formazione o i tempi dell'effetto, cioè una differenza visibile, e le regole chiedono prima il parere dell'utente. Opzioni da valutare con lui: (1) meno cifre o passo più largo su mobile; (2) disegnare le cifre da un atlante di glifi invece di `fillText` a ogni fotogramma (potrebbe essere invisibile, ma richiede una verifica pixel per pixel); (3) far partire la scena dopo l'LCP.

Ottimizzazioni invisibili di questo task (commit `0846241`): il caricamento delle immagini della scena non può più restare appeso in una scheda in background (`decode()` con attesa massima di 500 ms, come in `fork-3d.js`); tolti il preload `forchetta3-ceramic-1024.webp` e il file stesso, che nessuno richiamava. Effetto sui numeri: trascurabile.

## Verifiche

- Screenshot affiancati Next contro nuova (`/` contro `/ristoranti/`, `/en` contro `/en/ristoranti/`), 1440x900 e 375x812, sei sezioni ciascuno: uguali a occhio. L'hero è animata, quindi la posizione di cursore e luce può variare da un fotogramma all'altro.
- Accordion: colore del titolo e del segno «+» (chiuso, aperto, dopo il clic) letti con `getComputedStyle` su Next e sulla nuova: identici. Il segno aperto appare come «×» in entrambe.
- `prefers-reduced-motion: reduce` emulato: 0 disegni del canvas in 3 s (nessuna animazione continua), console pulita.
- WebGL disattivato (`--disable-webgl --disable-webgl2`): la scena ripiega sulla foto con il rilievo, console pulita, nessuna richiesta fallita. Anche insieme a reduced motion: pulito e fermo.
- `npm test`: 87 test, 0 falliti.

## Differenze visive note (già decise)

- Il selettore Human/Machine usa Geist Mono al posto di JetBrains Mono.
- Scroll nativo al posto di Lenis.
- I link interni a una sezione sono ancore native e aggiungono voci alla cronologia del browser.

## File condivisi e varianti

Identici al principale in `assets/` (verificati da `tests/shared-assets.test.js`): `depth-surface.js`, `fluid-field.js`, `footer-wordmark.js`, `i18n.js`, `idle-cursor.js`, `machine.css`, `mode-switch.css`, `mode-switch.js`, `service-trail.js`, i due font `geist-*.woff2`, `geist-LICENSE.txt`, `og-kint.jpg`.

Varianti in `assets/ristoranti/`, ciascuna con un commento in testa che dice cosa cambia:

| File | Motivo |
|---|---|
| `depth-surface.js` | Variante di `makeDepth` per un oggetto sottile: stesso programma GPU e stesso ripiego 2D, cambia la texture del rilievo. |
| `trail-engine.js` | Variante del motore della scia per la forchetta. |
| `scene-engine.js` | Variante: senza pavimento, piano e ombra di contatto, per un oggetto che sfuma in basso. |
| `formation-engine.js` | Variante: la forchetta si forma dalle cifre binarie. |
| `fork-3d.js`, `fork-scene.js`, `fork-images.js`, `material.js`, `material-worker.js` | Specifici della forchetta: lastra 3D su GPU, scena, immagini, materiale dorato (kintsugi) calcolato in un worker. |
| `hero.js`, `landing.js`, `menu.js`, `accordion.js`, `contact.js` | Comportamenti della landing, assenti nel principale. |
| `ristoranti.css` | Stile della landing. |

Le immagini `forchetta3-*.webp` appartengono alla landing.

## Checklist del trasloco in kint-website-official

1. Copiare `assets/ristoranti/` dentro `assets/` del sito principale. Non copiare i file di `assets/` in radice: sono identici a quelli del principale (elenco sopra) e vanno scartati.
2. Copiare le cartelle pagina `ristoranti/`, `en/ristoranti/`, `fr/ristoranti/`, `de/ristoranti/` e le Machine `ai/ristoranti/`, `en/ai/ristoranti/`, `fr/ai/ristoranti/`, `de/ai/ristoranti/`, unendole alle cartelle esistenti senza sovrascrivere altre pagine.
3. `_headers`: unire il blocco generato (tra `# --- ai-export: inizio` e `fine`) con quello del principale. La CSP deve avere `worker-src 'self'` e gli hash sha256 degli script inline delle nuove pagine; le regole di cache sono già uguali.
4. `_redirects`: NON portare le righe `/`, `/en/`, `/fr/`, `/de/` verso la landing (nel principale sono la home). Portare solo, se servono ancora, gli indirizzi vecchi della versione Next (`/machine` e simili verso le Machine ristoranti), cambiandone i percorsi.
5. `sitemap.xml`: aggiungere le 4 pagine Human con gli alternate e `x-default`; le Machine non vanno in sitemap.
6. `robots.txt`: non portarlo, vale quello del principale; le pagine ristoranti restano `noindex` finché non si esporta con `INDEX=1`.
7. `BASE` (`https://kint-perf.pages.dev` in `tools/export.mjs`): nel principale i link a `BASE + '/'` diventano relativi o il dominio definitivo.
8. Portare i test pertinenti (`dist-links`, `cache-headers`, `hero`, `fork-scene`, `contact`) adattando i percorsi, e il passaggio di build che crea bundle e worker con hash.
9. Dopo il trasloco rieseguire Lighthouse e `scroll-profile` e decidere sul TBT (vedi analisi).

## Comandi

Vedi `README.md`: `npm test`, `npm run dev`, `npm run build`, `python tools/dev_server.py --port 3101 --dist`, strumenti in `tools/perf/`.
