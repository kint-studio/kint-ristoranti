# Report: allineamento della landing ristoranti al metodo del sito principale

Data: 2026-10-20. Branch `allineamento`. La landing, prima in Next.js (commit `30508ec`), è ora HTML, CSS e JavaScript statici, senza dipendenze di runtime, con build in `dist/` e header come il sito principale.

## Esito in breve

- Parità visiva: nessuna differenza visibile negli screenshot a 1440x900 e 375x812, in italiano e in inglese (hero, servizi, FAQ, contatto, footer, menu), salvo le differenze già decise, elencate sotto.
- Scroll continuo di 10 s su desktop: 0 long task (soglia rispettata).
- Soglia TBT rispettata: TBT Lighthouse della landing 0 ms su mobile e desktop (mediana di 3 misure), contro 9 e 0 della home del principale e 488 e 38 di Next. Prima della correzione era 551 e 98: analisi più sotto.
- Punteggio Lighthouse mobile 98 (Next 78, principale 92) e LCP mobile 2,4 s (Next 3,5 s, principale 3,1 s).

## Numeri: prima e dopo, Next e principale

Lighthouse 12, Chrome locale, throttling simulato dei preset, tutti nello stesso run, mediana di 3 misure per riga. «Next» è la build di produzione del commit `30508ec`, «principale» la home di `KINT-codice-completo` (dist), «nuova» la landing statica (`/ristoranti/`, dist). Tra parentesi la nuova prima della correzione del TBT (commit `efee1d3`).

| Pagina | Perf | LCP ms | TBT ms | CLS | FCP ms |
|---|---|---|---|---|---|
| Next, desktop | 100 | 710 | 38 | 0,000 | 205 |
| **Nuova, desktop** | 100 (99) | 546 (544) | **0** (98) | 0,000 | 342 |
| Principale, desktop | 100 | 635 | 0 | 0,000 | 472 |
| Next, mobile | 78 | 3543 | 488 | 0,000 | 755 |
| **Nuova, mobile** | 98 (83) | 2407 (2471) | **0** (551) | 0,000 | 1356 |
| Principale, mobile | 92 | 3077 | 9 | 0,000 | 2102 |

Riferimento del Task 1 (`.baseline/numbers.md`): Next desktop 100 / 709 / 61, mobile 78 / 3535 / 490; principale desktop 100 / 641 / 0, mobile 92 / 3077 / 11. Le misure di oggi sono coerenti.

Scroll continuo di 10 s a 1440x900 (`tools/perf/scroll-profile.mjs`):

| Pagina | long task | max ms | scripting ms | frame | frame persi % |
|---|---|---|---|---|---|
| Next | 0 | 0 | 204 | 1440 | 0 |
| **Nuova** | **0** | 0 | 165 | 1439 | 0 |
| Principale | 0 | 0 | 1370 | 1303 | 0,69 |

### Analisi del TBT

Prima della correzione le long task di Lighthouse erano nella preparazione della scena, non nell'animazione delle cifre (che è lo stesso codice del principale e costa pochi millisecondi per fotogramma). Una traccia senza throttling, come quella che Lighthouse moltiplica per 4, mostrava due task: 150 ms per caricare la forchetta 3D e costruire la scena, 82 ms per il primo fotogramma. Misurando le singole chiamate su un profilo vuoto: creazione del contesto WebGL2 50-125 ms, prima interrogazione dello shader 26-37 ms, ridimensionamento della superficie WebGL al primo disegno 86 ms (attesa della compilazione dello shader nel processo GPU). La home del principale non crea un contesto WebGL durante il caricamento, per questo il suo TBT è quasi zero. A questo si aggiungeva un layout forzato (`getBoundingClientRect` dell'hero) dentro la valutazione del modulo (58 ms in Lighthouse).

Correzione, invisibile (commit `a89bf08`):
- la forchetta GPU si disegna in un worker (`assets/ristoranti/fork-3d-worker.js`, OffscreenCanvas): contesto, shader e texture non bloccano più la pagina. Il worker rimanda un'immagine per posa e la pagina mostra l'ultima; la scena parte solo quando la forchetta a riposo è pronta, con e senza venature, quindi il primo fotogramma è già quello finale. Se il browser non ha WebGL2 nei worker (o il worker non risponde entro 8 s) si disegna sulla pagina come prima, e senza WebGL2 resta il ripiego sulla foto;
- l'hero si misura quando servono le misure (immagini arrivate, worker pronto), non mentre il modulo si valuta.

Verifica visiva: a riposo la forchetta del worker e quella disegnata sulla pagina coincidono al pixel (differenza massima 1 su 255), su desktop e su telefono; ruotata verso il cursore la differenza è solo di fase (mean ≤ 0,27, cioè un fotogramma di ritardo nella rotazione, a occhio uguale). Contro Next: a riposo mean 0,02 (desktop) e 0,11 (telefono, solo il testo HUMAN/MACHINE già noto). La formazione parte a freddo in circa 465 ms dal caricamento (Next 507 ms, disegno sulla pagina 393 ms). Riduci movimento: mean 0,01 contro Next; senza WebGL: mean 0,17 contro Next (fase della luce), console pulita in tutti i casi.

Ottimizzazioni invisibili di questo task (commit `0846241`): il caricamento delle immagini della scena non può più restare appeso in una scheda in background (`decode()` con attesa massima di 500 ms, come in `fork-3d.js`); tolti il preload `forchetta3-ceramic-1024.webp` e il file stesso, che nessuno richiamava. Effetto sui numeri: trascurabile.

## Verifiche

- Screenshot affiancati Next contro nuova (`/` contro `/ristoranti/`, `/en` contro `/en/ristoranti/`), 1440x900 e 375x812, sei sezioni ciascuno: uguali a occhio. L'hero è animata, quindi la posizione di cursore e luce può variare da un fotogramma all'altro.
- Accordion: colore del titolo e del segno «+» (chiuso, aperto, dopo il clic) letti con `getComputedStyle` su Next e sulla nuova: identici. Il segno aperto appare come «×» in entrambe.
- `prefers-reduced-motion: reduce` emulato: 0 disegni del canvas in 3 s (nessuna animazione continua), console pulita.
- WebGL disattivato (`--disable-webgl --disable-webgl2`): la scena ripiega sulla foto con il rilievo, console pulita, nessuna richiesta fallita. Anche insieme a reduced motion: pulito e fermo.
- `npm test`: 93 test, 0 falliti.

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
| `fork-3d.js`, `fork-3d-worker.js`, `fork-scene.js`, `fork-images.js`, `material.js`, `material-worker.js` | Specifici della forchetta: lastra 3D su GPU disegnata in un worker, scena, immagini, materiale dorato (kintsugi) calcolato in un worker. |
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
8. Portare i test pertinenti (`dist-links`, `cache-headers`, `hero`, `fork-scene`, `fork-3d`, `contact`) adattando i percorsi, e il passaggio di build che crea bundle e worker con hash (materiale e forchetta: `WORKERS` in `tools/build.mjs`).
9. Dopo il trasloco rieseguire Lighthouse e `scroll-profile` e confermare TBT e long task.

## Comandi

Vedi `README.md`: `npm test`, `npm run dev`, `npm run build`, `python tools/dev_server.py --port 3101 --dist`, strumenti in `tools/perf/`.
