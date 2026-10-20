# kint-ristoranti: note per agenti

- Una sola landing (ristoratori) in Next.js 16, App Router, Tailwind 4. Leggi `README.md` per indirizzi e comandi.
- Prima di consegnare: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` devono passare.
- Due layout radice: `src/app/(it)/` (italiano, alla radice) e `src/app/[lang]/` (en, fr, de). Il 404 e'
  `src/app/global-not-found.tsx`.
- Ogni testo nuovo va in italiano in `src/lib/content.ts` o `src/lib/i18n.ts` e tradotto in en/fr/de
  (`src/lib/landing-i18n.ts`, `src/lib/i18n.ts`): il test `src/lib/routes.test.ts` controlla che non manchi nulla.
- Il dominio si cambia solo in `SITE_URL` (`src/lib/site.ts`); l'indicizzazione si accende con `NEXT_PUBLIC_INDEX=1`.
- Niente clienti inventati: la fascia clienti si aggiunge solo con clienti veri e con il loro consenso.
- Commenti e messaggi di commit in italiano.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
