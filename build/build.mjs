import { readdir, readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { join, dirname, relative, basename } from 'node:path';
import { marked } from 'marked';
import { existsSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const CONTENT_DIR = join(ROOT, 'content');
const TEMPLATE_DIR = join(ROOT, 'build', 'templates');
const SITE_DIR = join(ROOT, 'site');
const BASE = process.env.BASE_PATH || '';

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  }
  return { meta, body: match[2] };
}

async function findFiles(dir, ext) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) results.push(...await findFiles(full, ext));
    else if (e.name.endsWith(ext)) results.push(full);
  }
  return results;
}

async function loadTemplate(name) {
  return readFile(join(TEMPLATE_DIR, name), 'utf-8');
}

function render(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');
}

async function buildPages() {
  const files = await findFiles(CONTENT_DIR, '.md');
  const baseTemplate = await loadTemplate('base.html');
  const pageTemplate = await loadTemplate('page.html');
  const pages = [];

  for (const file of files) {
    const raw = await readFile(file, 'utf-8');
    const { meta, body } = parseFrontmatter(raw);
    const html = marked(body);
    const lang = meta.lang || (basename(file).startsWith('zh') ? 'zh' : 'en');
    const rel = relative(CONTENT_DIR, file)
      .replace(/\.(en|zh)\.md$/, '.md')
      .replace(/\.md$/, '')
      .replace(/\/(en|zh)$/, '')
      .replace(/\/index$/, '');
    const section = rel.split('/')[0] || 'root';

    const pairLang = lang === 'en' ? 'zh' : 'en';
    const pairPath = meta.pair ? `${BASE}/${pairLang}/${rel}/` : '';

    const pageHtml = render(pageTemplate, { title: meta.title || '', content: html, lang, pairPath, pairLang });
    const fullHtml = render(baseTemplate, { title: meta.title || 'agent-master', lang, body: pageHtml, base: BASE });

    const outPath = join(SITE_DIR, lang, rel, 'index.html');
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, fullHtml);
    pages.push({ title: meta.title, lang, section, path: `${BASE}/${lang}/${rel}/`, status: meta.status });
  }
  return pages;
}

async function buildIndex(pages) {
  const baseTemplate = await loadTemplate('base.html');
  const indexTemplate = await loadTemplate('index.html');

  for (const lang of ['en', 'zh']) {
    const langPages = pages.filter(p => p.lang === lang && p.status !== 'hidden');
    const sections = {};
    for (const p of langPages) {
      (sections[p.section] ??= []).push(p);
    }

    let listingsHtml = '';
    for (const [section, items] of Object.entries(sections)) {
      listingsHtml += `<section class="section"><h2>${section}</h2><ul>`;
      for (const item of items) {
        listingsHtml += `<li><a href="${item.path}">${item.title || item.path}</a></li>`;
      }
      listingsHtml += '</ul></section>';
    }

    const pairLang = lang === 'en' ? 'zh' : 'en';
    const indexHtml = render(indexTemplate, { lang, listings: listingsHtml, pairLang, base: BASE });
    const fullHtml = render(baseTemplate, { title: 'agent-master', lang, body: indexHtml, base: BASE });

    const outPath = join(SITE_DIR, lang, 'index.html');
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, fullHtml);
  }

  const rootRedirect = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${BASE}/en/"></head></html>`;
  await writeFile(join(SITE_DIR, 'index.html'), rootRedirect);
}

async function copyAssets() {
  const cssDir = join(ROOT, 'build', 'css');
  const jsDir = join(ROOT, 'build', 'js');
  await mkdir(join(SITE_DIR, 'assets', 'css'), { recursive: true });
  await mkdir(join(SITE_DIR, 'assets', 'js'), { recursive: true });
  if (existsSync(cssDir)) await cp(cssDir, join(SITE_DIR, 'assets', 'css'), { recursive: true });
  if (existsSync(jsDir)) await cp(jsDir, join(SITE_DIR, 'assets', 'js'), { recursive: true });
}

async function main() {
  console.log('Building site...');
  await mkdir(SITE_DIR, { recursive: true });
  const pages = await buildPages();
  await buildIndex(pages);
  await copyAssets();
  console.log(`Built ${pages.length} pages → site/`);
}

main().catch(e => { console.error(e); process.exit(1); });
