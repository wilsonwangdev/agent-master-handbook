#!/usr/bin/env node
import puppeteer from 'puppeteer-core';
import { mkdir, access, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = join(ROOT, 'assets', 'screenshots');

const SYSTEM_CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

async function findChrome() {
  for (const p of SYSTEM_CHROME_PATHS) {
    try { await access(p); return p; } catch {}
  }
  throw new Error('No Chrome/Chromium found. Install Chrome or set CHROME_PATH.');
}

const VIEWPORTS = [
  { name: 'x-card', width: 1200, height: 675, scale: 2 },
  { name: 'og-image', width: 1200, height: 630, scale: 2 },
  { name: 'desktop', width: 1440, height: 900, scale: 2 },
  { name: 'mobile', width: 390, height: 844, scale: 3 },
];

const PAGES = [
  { path: '/en/', slug: 'home-en' },
  { path: '/zh/', slug: 'home-zh' },
  { path: '/en/concepts/harness-engineering/', slug: 'harness-engineering' },
  { path: '/en/guides/skills-ecosystem/', slug: 'skills-ecosystem' },
];

const BASE_URL = process.env.SCREENSHOT_URL || 'http://localhost:3000';

async function capture() {
  const chromePath = process.env.CHROME_PATH || await findChrome();
  console.log(`Using Chrome: ${chromePath}\n`);

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--hide-scrollbars'],
  });

  for (const viewport of VIEWPORTS) {
    console.log(`Viewport: ${viewport.name} (${viewport.width}x${viewport.height}@${viewport.scale}x)`);

    const page = await browser.newPage();
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: viewport.scale,
    });

    for (const target of PAGES) {
      const url = `${BASE_URL}${target.path}`;
      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);
      await new Promise(r => setTimeout(r, 200));

      const filename = `${target.slug}-${viewport.name}.png`;
      const filepath = join(OUT_DIR, filename);
      await page.screenshot({ path: filepath, fullPage: false });
      console.log(`  ${filename}`);
    }

    await page.close();
  }

  await browser.close();
  console.log(`\nDone → ${OUT_DIR}`);
}

capture().catch(err => { console.error(err.message); process.exit(1); });
