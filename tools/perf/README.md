# Strumenti di misura

Richiedono `npm i` (puppeteer-core) e Chrome installato (oppure `PUPPETEER_EXECUTABLE_PATH`).

- `node tools/perf/shots.mjs <baseUrl> <outDir> [--paths=/,/en]`: screenshot per sezione (hero, servizi, contatto, faq, footer, menu) a 1440x900 e 375x812 in `<outDir>/<w>x<h>/<path>/`.
- `node tools/perf/scroll-profile.mjs <url> [--json]`: scroll continuo di 10 s a 1440x900; stampa long task, tempo di scripting, frame e frame persi.
- Lighthouse: `npx --yes lighthouse@12 <url> --preset=desktop --output=json --output-path=out.json` (mobile: senza preset, `--form-factor=mobile`).

I risultati vanno in `.baseline/` (ignorato da git).
