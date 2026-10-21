# KINT Ristoranti

Landing statica di KINT per i ristoranti, costruita con lo stesso metodo del sito principale: HTML, CSS e JavaScript senza framework, nessuna dipendenza di runtime.

## Comandi

- `npm install`: installa gli strumenti di sviluppo.
- `npm run dev`: server locale su http://localhost:3101/ (pagina: http://localhost:3101/ristoranti/).
- `npm test`: esegue i test (`node --test`).
- `npm run build`: genera `dist/` (pagine, export per le AI, `_headers`, `_redirects`); esegue prima `npm run export` e poi costruisce `dist/`.
- `npm run export`: rigenera i file generati, che sono nel repository (pagine en/fr/de, pagine Machine, sitemap, robots, `_redirects`, blocco generato di `_headers`, 404), a partire da `ristoranti/index.html` e dai dizionari i18n. Va eseguito dopo ogni modifica ai sorgenti: `npm test` fallisce se i file generati sono vecchi.
- `tools/perf/` (shots, scroll-profile, Lighthouse): vedi `tools/perf/README.md`; servono Chrome e Node >= 22.12.
- `python tools/dev_server.py --dist`: serve `dist/` applicando `_headers` e `_redirects` (`--root <cartella>` fa lo stesso su un'altra cartella).

## Indirizzi

| Indirizzo | Pagina |
|---|---|
| `/ristoranti/` | Human italiana |
| `/en/ristoranti/`, `/fr/ristoranti/`, `/de/ristoranti/` | Human tradotte |
| `/ai/ristoranti/`, `/en/ai/ristoranti/`, `/fr/ai/ristoranti/`, `/de/ai/ristoranti/` | Machine |

`/`, `/en/`, `/fr/` e `/de/` rimandano con 301 alla landing della lingua.

## Variabili

- `BASE`: indirizzo del sito principale, una sola costante in `tools/export.mjs`.
- `INDEX=1`: abilita l'indicizzazione. Senza, le pagine sono `noindex, nofollow` e `robots.txt` vieta tutto.

## File condivisi

I file in `assets/` presenti anche nel repository principale (`../KINT-codice-completo/assets/`) devono essere identici: lo verifica `tests/shared-assets.test.js`. Le varianti per questa pagina stanno in `assets/ristoranti/`.

## Trasloco futuro

Il progetto è pensato per confluire in `kint-website-official`: le pagine diventano cartelle del sito principale e `assets/ristoranti/` si aggiunge a `assets/`.
