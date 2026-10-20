// Shared helper: launch the system Chrome/Edge through puppeteer-core.
import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

export function chromePath() {
  const p = process.env.PUPPETEER_EXECUTABLE_PATH || CANDIDATES.find(existsSync);
  if (!p) throw new Error('Chrome non trovato: imposta PUPPETEER_EXECUTABLE_PATH');
  return p;
}

export const launch = (args = []) =>
  puppeteer.launch({ executablePath: chromePath(), headless: true, args });
