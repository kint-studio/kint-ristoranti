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
