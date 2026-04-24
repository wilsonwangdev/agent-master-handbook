import { readdir, readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { join, dirname, relative, basename } from 'node:path';
import { marked } from 'marked';
import { existsSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const CONTENT_DIR = join(ROOT, 'content');
const TEMPLATE_DIR = join(ROOT, 'build', 'templates');
const SITE_DIR = join(ROOT, 'site');
const BASE = process.env.BASE_PATH || '';
const SITE_URL = process.env.SITE_URL || '';
const NOINDEX = process.env.NOINDEX === 'true';

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

function extractDescription(html) {
  const match = html.match(/<p>(.*?)<\/p>/s);
  if (!match) return '';
  return match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 160);
}

function buildJsonLd(vars) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': vars.type || 'Article',
    headline: vars.title,
    description: vars.description,
    inLanguage: vars.lang,
    url: vars.canonicalUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': vars.canonicalUrl },
  };
  if (vars.lastUpdated) ld.dateModified = vars.lastUpdated;
  return `<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
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
    const description = meta.description || extractDescription(html);
    const canonicalUrl = SITE_URL ? `${SITE_URL}/${lang}/${rel}/` : '';
    const pairCanonicalUrl = (SITE_URL && meta.pair) ? `${SITE_URL}/${pairLang}/${rel}/` : '';
    const ogLocale = lang === 'en' ? 'en_US' : 'zh_CN';
    const noindex = NOINDEX ? '<meta name="robots" content="noindex,follow">' : '';
    const sectionTitle = section.charAt(0).toUpperCase() + section.slice(1);
    const homePath = `${BASE}/${lang}/`;
    const sectionPath = `${BASE}/${lang}/`;
    const jsonLd = buildJsonLd({ title: meta.title, description, lang, canonicalUrl, lastUpdated: meta.lastUpdated, type: 'Article' });

    const pageHtml = render(pageTemplate, { title: meta.title || '', content: html, lang, pairPath, pairLang, sectionTitle, homePath, sectionPath });
    const rssUrl = SITE_URL ? `${SITE_URL}/${lang}/feed.xml` : `${BASE}/${lang}/feed.xml`;
    const fullHtml = render(baseTemplate, {
      title: meta.title || 'agent-master', lang, body: pageHtml, base: BASE,
      description, canonicalUrl, pairCanonicalUrl, pairLang, ogLocale, noindex, jsonLd, ogType: 'article', rssUrl,
    });

    const outPath = join(SITE_DIR, lang, rel, 'index.html');
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, fullHtml);
    pages.push({ title: meta.title, description, lang, section, path: `${BASE}/${lang}/${rel}/`, status: meta.status, lastUpdated: meta.lastUpdated, rel, hasPair: !!meta.pair });
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
    const description = lang === 'en'
      ? 'AI Native knowledge base for agent practitioners — concepts, guides, curated articles, and agent-ready practices.'
      : 'AI Native 知识库——面向 agent 实践者的概念、指南、精选文章与 agent-ready 实践。';
    const canonicalUrl = SITE_URL ? `${SITE_URL}/${lang}/` : '';
    const pairCanonicalUrl = SITE_URL ? `${SITE_URL}/${pairLang}/` : '';
    const ogLocale = lang === 'en' ? 'en_US' : 'zh_CN';
    const noindex = NOINDEX ? '<meta name="robots" content="noindex,follow">' : '';
    const jsonLd = buildJsonLd({ title: 'agent-master', description, lang, canonicalUrl, type: 'WebSite' });
    const rssUrl = SITE_URL ? `${SITE_URL}/${lang}/feed.xml` : `${BASE}/${lang}/feed.xml`;
    const fullHtml = render(baseTemplate, {
      title: 'agent-master', lang, body: indexHtml, base: BASE,
      description, canonicalUrl, pairCanonicalUrl, pairLang, ogLocale, noindex, jsonLd, ogType: 'website', rssUrl,
    });

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

function pageUrl(page) {
  return SITE_URL ? `${SITE_URL}/${page.lang}/${page.rel}/` : page.path;
}

async function buildSitemap(pages) {
  if (!SITE_URL) return;
  const visible = pages.filter(p => p.status !== 'hidden');
  const pairMap = new Map();
  for (const p of visible) pairMap.set(`${p.lang}:${p.rel}`, p);

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  for (const lang of ['en', 'zh']) {
    xml += `  <url>\n    <loc>${SITE_URL}/${lang}/</loc>\n  </url>\n`;
  }
  for (const p of visible) {
    const url = pageUrl(p);
    xml += `  <url>\n    <loc>${url}</loc>\n`;
    if (p.lastUpdated) xml += `    <lastmod>${p.lastUpdated}</lastmod>\n`;
    const pairLang = p.lang === 'en' ? 'zh' : 'en';
    if (p.hasPair && pairMap.has(`${pairLang}:${p.rel}`)) {
      xml += `    <xhtml:link rel="alternate" hreflang="${p.lang}" href="${url}" />\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="${pairLang}" href="${pageUrl(pairMap.get(`${pairLang}:${p.rel}`))}" />\n`;
    }
    xml += '  </url>\n';
  }
  xml += '</urlset>\n';
  await writeFile(join(SITE_DIR, 'sitemap.xml'), xml);
}

async function buildRobots() {
  let txt = 'User-agent: *\nAllow: /\n';
  if (SITE_URL) txt += `\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  await writeFile(join(SITE_DIR, 'robots.txt'), txt);
}

async function buildRSS(pages) {
  if (!SITE_URL) return;
  for (const lang of ['en', 'zh']) {
    const items = pages.filter(p => p.lang === lang && p.status !== 'hidden');
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n';
    xml += `  <title>agent-master (${lang.toUpperCase()})</title>\n`;
    xml += `  <link>${SITE_URL}/${lang}/</link>\n`;
    xml += `  <description>AI Native Knowledge Base</description>\n`;
    xml += `  <language>${lang}</language>\n`;
    xml += `  <atom:link href="${SITE_URL}/${lang}/feed.xml" rel="self" type="application/rss+xml" />\n`;
    for (const p of items) {
      xml += '  <item>\n';
      xml += `    <title>${p.title || ''}</title>\n`;
      xml += `    <link>${pageUrl(p)}</link>\n`;
      xml += `    <guid>${pageUrl(p)}</guid>\n`;
      if (p.description) xml += `    <description>${p.description}</description>\n`;
      if (p.lastUpdated) xml += `    <pubDate>${new Date(p.lastUpdated).toUTCString()}</pubDate>\n`;
      xml += '  </item>\n';
    }
    xml += '</channel>\n</rss>\n';
    await mkdir(join(SITE_DIR, lang), { recursive: true });
    await writeFile(join(SITE_DIR, lang, 'feed.xml'), xml);
  }
}

async function buildLlmsTxt(pages) {
  const visible = pages.filter(p => p.status !== 'hidden');
  const base = SITE_URL || '';
  let txt = '# agent-master\n\n';
  txt += '> AI Native knowledge base for agent practitioners. Concepts, guides, curated articles, and agent-ready practices for building with AI agents.\n\n';
  for (const section of ['concepts', 'guides', 'curated', 'evangelism']) {
    const items = visible.filter(p => p.lang === 'en' && p.section === section);
    if (!items.length) continue;
    txt += `## ${section.charAt(0).toUpperCase() + section.slice(1)}\n\n`;
    for (const p of items) {
      const url = base ? `${base}/en/${p.rel}/` : p.path;
      txt += `- [${p.title}](${url})`;
      if (p.description) txt += `: ${p.description}`;
      txt += '\n';
    }
    txt += '\n';
  }
  await writeFile(join(SITE_DIR, 'llms.txt'), txt);
}

async function buildSitemapMd(pages) {
  const visible = pages.filter(p => p.status !== 'hidden');
  const base = SITE_URL || '';
  let md = '# agent-master — Site Map\n\n';
  for (const lang of ['en', 'zh']) {
    md += `## ${lang === 'en' ? 'English' : '中文'}\n\n`;
    const langPages = visible.filter(p => p.lang === lang);
    const sections = {};
    for (const p of langPages) (sections[p.section] ??= []).push(p);
    for (const [section, items] of Object.entries(sections)) {
      md += `### ${section.charAt(0).toUpperCase() + section.slice(1)}\n\n`;
      for (const p of items) {
        const url = base ? `${base}/${lang}/${p.rel}/` : p.path;
        md += `- [${p.title}](${url})`;
        if (p.description) md += ` — ${p.description}`;
        md += '\n';
      }
      md += '\n';
    }
  }
  await writeFile(join(SITE_DIR, 'sitemap.md'), md);
}

async function main() {
  console.log('Building site...');
  await mkdir(SITE_DIR, { recursive: true });
  const pages = await buildPages();
  await buildIndex(pages);
  await copyAssets();
  await buildSitemap(pages);
  await buildRobots();
  await buildRSS(pages);
  await buildLlmsTxt(pages);
  await buildSitemapMd(pages);
  console.log(`Built ${pages.length} pages → site/`);
}

main().catch(e => { console.error(e); process.exit(1); });
