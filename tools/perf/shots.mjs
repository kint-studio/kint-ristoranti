// Usage: node tools/perf/shots.mjs <baseUrl> <outDir> [--paths=/,/en]
// Writes <outDir>/<w>x<h>/<path-slug>/<section>.png for 1440x900 and 375x812.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { launch } from './chrome.mjs';

const [base, out] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!base || !out) {
  console.error('uso: node tools/perf/shots.mjs <baseUrl> <outDir> [--paths=/,/en]');
  process.exit(1);
}
const pathsArg = process.argv.find((a) => a.startsWith('--paths='));
const paths = pathsArg ? pathsArg.slice(8).split(',') : ['/', '/en'];
const sizes = [[1440, 900], [375, 812]];
const slug = (p) => p.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'root';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await launch();
try {
  for (const [w, h] of sizes) {
    for (const p of paths) {
      const dir = join(out, `${w}x${h}`, slug(p));
      mkdirSync(dir, { recursive: true });
      const page = await browser.newPage();
      await page.setViewport({ width: w, height: h });
      await page.goto(new URL(p, base).href, { waitUntil: 'networkidle0', timeout: 60000 });
      await sleep(2500);
      const shot = (name) => page.screenshot({ path: join(dir, `${name}.png`) });
      // A missing selector would leave the page where it is and save a misleading shot: warn and skip it.
      const missing = async (sel, name) => {
        if (await page.$(sel)) return false;
        console.error(`attenzione: ${sel} non trovato in ${p} (${w}x${h}), ${name}.png saltato`);
        process.exitCode = 1;
        return true;
      };
      const goTo = async (sel, name) => {
        if (await missing(sel, name)) return false;
        await page.evaluate((s) => document.querySelector(s).scrollIntoView({ behavior: 'instant', block: 'start' }), sel);
        await sleep(1500);
        return true;
      };

      await shot('hero');

      if (await goTo('#servizi', 'servizi')) {
        // open the first service if it is not already
        await page.evaluate(() => {
          const b = document.querySelector('#servizi button[aria-expanded]');
          if (b && b.getAttribute('aria-expanded') !== 'true') b.click();
        });
        await sleep(800);
        await shot('servizi');
      }

      if (await goTo('#prenota', 'contatto')) await shot('contatto');

      if (await goTo('#faq', 'faq')) await shot('faq');

      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
      await sleep(1500);
      await shot('footer');

      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await sleep(1000);
      if (!(await missing('.kf-menu-toggle', 'menu'))) {
        await page.click('.kf-menu-toggle');
        await sleep(1200);
        // the menu only counts as open if the toggle says so (no JS, no menu)
        if (!(await missing('.kf-menu-toggle[aria-expanded="true"]', 'menu'))) await shot('menu');
      }
      await page.close();
      console.log(`${w}x${h} ${p} ok`);
    }
  }
} finally {
  await browser.close();
}
