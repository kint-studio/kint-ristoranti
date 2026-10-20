// Usage: node tools/perf/scroll-profile.mjs <url> [--json]
// 10 s continuous scroll top -> bottom -> top at 1440x900; prints long-task and frame stats.
import { launch } from './chrome.mjs';

const url = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!url) {
  console.error('uso: node tools/perf/scroll-profile.mjs <url> [--json]');
  process.exit(1);
}
const asJson = process.argv.includes('--json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await launch();
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.evaluateOnNewDocument(() => {
    window.__lt = [];
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__lt.push(e.duration);
    }).observe({ type: 'longtask', buffered: true });
  });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await sleep(2000);
  await page.evaluate(() => { window.__lt.length = 0; });

  const cdp = await page.createCDPSession();
  await cdp.send('Performance.enable');
  const m0 = await cdp.send('Performance.getMetrics');

  const frames = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const DUR = 10000;
        const max = document.documentElement.scrollHeight - innerHeight;
        const f = []; // frame timestamps
        const t0 = performance.now();
        const tick = (t) => {
          const k = Math.min((t - t0) / DUR, 1);
          const pos = (k < 0.5 ? k * 2 : (1 - k) * 2) * max;
          window.scrollTo({ top: pos, behavior: 'instant' });
          f.push(t);
          if (k < 1) requestAnimationFrame(tick);
          else resolve(f);
        };
        requestAnimationFrame(tick);
      }),
  );
  const m1 = await cdp.send('Performance.getMetrics');
  const lt = await page.evaluate(() => window.__lt);
  const get = (m, n) => m.metrics.find((x) => x.name === n).value;
  const scriptingMs = Math.round((get(m1, 'ScriptDuration') - get(m0, 'ScriptDuration')) * 1000);
  // a frame is "dropped" when the gap exceeds 1.5x the 16.7 ms budget
  let dropped = 0;
  for (let i = 1; i < frames.length; i++) if (frames[i] - frames[i - 1] > 25) dropped++;
  const res = {
    longTasks: lt.length,
    maxLongTaskMs: Math.round(Math.max(0, ...lt)),
    scriptingMs,
    frames: frames.length,
    droppedFramesPct: +((dropped / Math.max(1, frames.length - 1)) * 100).toFixed(2),
  };
  console.log(asJson ? JSON.stringify(res) : res);
} finally {
  await browser.close();
}
