#!/usr/bin/env node
// Capture X card screenshot with timeline scrolled to show Loop Engineering
import puppeteer from 'puppeteer-core';
import { mkdir, access, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = join(ROOT, 'assets', 'screenshots');

const CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];
const BASE_URL = process.env.SCREENSHOT_URL || 'http://localhost:3000';

async function findChrome() {
  for (const p of CHROME_PATHS) {
    try { await access(p); return p; } catch {}
  }
  throw new Error('No Chrome found');
}

async function capture() {
  const chromePath = await findChrome();
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--hide-scrollbars'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 675, deviceScaleFactor: 2 });

  await page.goto(`${BASE_URL}/en/`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 300));

  // Scroll timeline to show last entries so Loop Engineering is visible
  await page.evaluate(() => {
    const scroll = document.querySelector('.timeline-scroll');
    if (scroll) scroll.scrollLeft = scroll.scrollWidth;
  });
  await new Promise(r => setTimeout(r, 200));

  const filepath = join(OUT_DIR, 'home-en-x-card.png');
  await page.screenshot({ path: filepath, fullPage: false });
  console.log(`Captured: ${filepath}`);

  await browser.close();
  console.log('Done');
}

capture().catch(err => { console.error(err.message); process.exit(1); });
