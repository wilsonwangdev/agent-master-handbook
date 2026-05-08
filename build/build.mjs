import { readdir, readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { join, dirname, relative, basename } from 'node:path';
import { marked } from 'marked';
import { existsSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const pkg = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf-8'));

function slugify(text) {
  return text.replace(/<[^>]+>/g, '').trim().toLowerCase()
    .replace(/\s+/g, '-').replace(/[^\p{L}\p{N}\-]/gu, '').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
}

const renderer = {
  heading({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    if (depth >= 2 && depth <= 3) {
      const id = slugify(text);
      return `<h${depth} id="${id}"><a class="heading-anchor" href="#${id}" tabindex="-1" aria-label="Link to ${id}">#</a>${text}</h${depth}>\n`;
    }
    return `<h${depth}>${text}</h${depth}>\n`;
  },
};
marked.use({ renderer });

const SITE = {
  name: pkg.displayName,
  tagline: pkg.description,
  repo: typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url,
  author: typeof pkg.author === 'string' ? { name: pkg.author } : (pkg.author || {}),
  base: process.env.BASE_PATH || '',
  url: process.env.SITE_URL || pkg.homepage || '',
  noindex: process.env.NOINDEX === 'true',
  contentDir: join(ROOT, 'content'),
  templateDir: join(ROOT, 'build', 'templates'),
  outDir: join(ROOT, 'site'),
};

const SECTION_SCHEMA = {
  concepts: 'TechArticle',
  guides: 'TechArticle',
  curated: 'Article',
  evangelism: 'Article',
};

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
  return readFile(join(SITE.templateDir, name), 'utf-8');
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
  if (SITE.author.name) {
    ld.author = { '@type': 'Person', name: SITE.author.name, ...(SITE.author.url && { url: SITE.author.url }) };
  }
  if (SITE.url) {
    ld.publisher = { '@type': 'Organization', name: SITE.name, url: SITE.url };
  }
  if (vars.source) {
    ld.citation = { '@type': 'CreativeWork', url: vars.source };
    ld.isBasedOn = vars.source;
  }
  return `<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
}

function buildHomepageJsonLd({ lang, canonicalUrl, description }) {
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      description: SITE.tagline,
      inLanguage: lang,
      publisher: { '@id': `${SITE.url}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE.url}/#organization`,
      name: SITE.name,
      url: SITE.url,
      ...(SITE.author.name && { founder: { '@id': `${SITE.url}/#author` } }),
    },
    {
      '@type': 'WebPage',
      '@id': canonicalUrl,
      url: canonicalUrl,
      name: SITE.name,
      description,
      inLanguage: lang,
      isPartOf: { '@id': `${SITE.url}/#website` },
    },
  ];
  if (SITE.author.name) {
    graph.push({
      '@type': 'Person',
      '@id': `${SITE.url}/#author`,
      name: SITE.author.name,
      ...(SITE.author.url && { url: SITE.author.url, sameAs: [SITE.author.url] }),
    });
  }
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
}

function seoVars({ lang, title, description, canonicalUrl, pairCanonicalUrl, pairLang, lastUpdated, schemaType, ogType, source, jsonLdOverride }) {
  return {
    description,
    canonicalUrl,
    pairCanonicalUrl,
    pairLang,
    ogLocale: lang === 'en' ? 'en_US' : 'zh_CN',
    ogType,
    noindex: SITE.noindex ? '<meta name="robots" content="noindex,follow">' : '',
    rssUrl: SITE.url ? `${SITE.url}/${lang}/feed.xml` : `${SITE.base}/${lang}/feed.xml`,
    jsonLd: jsonLdOverride || buildJsonLd({ title, description, lang, canonicalUrl, lastUpdated, type: schemaType, source }),
    siteName: SITE.name,
    siteTagline: SITE.tagline,
    contributeUrl: `${SITE.repo}/blob/main/CONTRIBUTING.md`,
  };
}

async function buildPages() {
  const [files, baseTemplate, pageTemplate] = await Promise.all([
    findFiles(SITE.contentDir, '.md'),
    loadTemplate('base.html'),
    loadTemplate('page.html'),
  ]);
  const pages = [];

  for (const file of files) {
    const raw = await readFile(file, 'utf-8');
    const { meta, body } = parseFrontmatter(raw);
    const html = marked(body).replace(/^<h1[^>]*>[\s\S]*?<\/h1>\n?/, '');
    const lang = meta.lang || (basename(file).startsWith('zh') ? 'zh' : 'en');
    const rel = relative(SITE.contentDir, file)
      .replace(/\.(en|zh)\.md$/, '.md')
      .replace(/\.md$/, '')
      .replace(/\/(en|zh)$/, '')
      .replace(/\/index$/, '');
    const section = rel.split('/')[0] || 'root';
    const pairLang = lang === 'en' ? 'zh' : 'en';
    const description = meta.description || extractDescription(html);
    const canonicalUrl = SITE.url ? `${SITE.url}/${lang}/${rel}/` : '';

    const markdownUrl = SITE.url ? `${SITE.url}/${lang}/${rel}/index.md` : `${SITE.base}/${lang}/${rel}/index.md`;

    const lastUpdatedLabel = meta.lastUpdated
      ? (lang === 'zh' ? `最后更新：${meta.lastUpdated}` : `Last updated: ${meta.lastUpdated}`)
      : '';

    const pageHtml = render(pageTemplate, {
      title: meta.title || '', content: html, lang,
      lastUpdatedLabel,
      pairPath: meta.pair ? `${SITE.base}/${pairLang}/${rel}/` : '', pairLang,
      sectionTitle: section.charAt(0).toUpperCase() + section.slice(1),
      homePath: `${SITE.base}/${lang}/`,
      sectionPath: `${SITE.base}/${lang}/`,
      contributeUrl: `${SITE.repo}/blob/main/CONTRIBUTING.md`,
    });
    const fullHtml = render(baseTemplate, {
      title: meta.title || SITE.name, lang, body: pageHtml, base: SITE.base, markdownUrl,
      ...seoVars({
        lang, title: meta.title, description, canonicalUrl,
        pairCanonicalUrl: (SITE.url && meta.pair) ? `${SITE.url}/${pairLang}/${rel}/` : '',
        pairLang, lastUpdated: meta.lastUpdated,
        schemaType: SECTION_SCHEMA[section] || 'Article',
        ogType: 'article',
        source: meta.source || '',
      }),
    });

    const outPath = join(SITE.outDir, lang, rel, 'index.html');
    const mdOutPath = join(SITE.outDir, lang, rel, 'index.md');
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, fullHtml);
    await writeFile(mdOutPath, raw);
    pages.push({ title: meta.title, description, lang, section, path: `${SITE.base}/${lang}/${rel}/`, status: meta.status, lastUpdated: meta.lastUpdated, rel, hasPair: !!meta.pair });
  }
  return pages;
}

function buildTimelineHtml(items, title) {
  let nodes = '';
  const last = items.length - 1;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const pos = i % 2 === 0 ? 'above' : 'below';
    const col = i + 1;
    const colStyle = `style="grid-column:${col}"`;
    const edge = i === 0 ? ' edge-start' : i === last ? ' edge-end' : '';
    const creditsHtml = item.credits
      .map(c => `<a href="${c.url}" target="_blank" rel="noopener">${c.name}</a>`)
      .join(' · ');
    nodes += `<div class="timeline-node ${pos}" role="listitem">` +
      `<div class="timeline-card${edge}" ${colStyle}>` +
      `<span class="timeline-year">${item.year}</span>` +
      `<h3>${item.title}</h3>` +
      `<span class="timeline-credit">${creditsHtml}` +
      `<span class="timeline-info" role="button" aria-label="Details" tabindex="0">i` +
      `<span class="timeline-tip">${item.desc}</span>` +
      `</span></span>` +
      `</div>` +
      `<div class="timeline-stem" aria-hidden="true" ${colStyle}></div>` +
      `<div class="timeline-dot" aria-hidden="true" ${colStyle}></div>` +
      `</div>`;
  }
  return `<section class="timeline" aria-label="${title}">` +
    `<h2>${title}</h2>` +
    `<div class="timeline-scroll">` +
    `<div class="timeline-track" role="list">${nodes}</div>` +
    `</div>` +
    `</section>`;
}

async function buildIndex(pages) {
  const [baseTemplate, indexTemplate, promptEn, promptZh, timelineEn, timelineZh] = await Promise.all([
    loadTemplate('base.html'),
    loadTemplate('index.html'),
    readFile(join(ROOT, 'build', 'data', 'quickstart.en.md'), 'utf-8'),
    readFile(join(ROOT, 'build', 'data', 'quickstart.zh.md'), 'utf-8'),
    readFile(join(ROOT, 'build', 'data', 'timeline.en.json'), 'utf-8'),
    readFile(join(ROOT, 'build', 'data', 'timeline.zh.json'), 'utf-8'),
  ]);
  const prompts = {
    en: promptEn.trim().replace('{{siteUrl}}', SITE.url),
    zh: promptZh.trim().replace('{{siteUrl}}', SITE.url),
  };
  const timelines = { en: JSON.parse(timelineEn), zh: JSON.parse(timelineZh) };
  const i18n = {
    en: { quickstartTitle: 'Quick Start', quickstartDesc: 'Copy this prompt into any AI coding agent to set up an agent-ready harness environment.', copyLabel: 'Copy', quickstartHint: 'Works with Claude Code, Cursor, Windsurf, Codex, and other agents. Run before or after your framework scaffold.', timelineTitle: 'Evolution of Agent Practices' },
    zh: { quickstartTitle: '快速开始', quickstartDesc: '将此提示词复制到任意 AI 编码工具中，即可搭建 agent-ready harness 环境。', copyLabel: '复制', quickstartHint: '适用于 Claude Code、Cursor、Windsurf、Codex 等 agent 工具。可在框架脚手架之前或之后运行。', timelineTitle: 'Agent 实践演进' },
  };

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
    const description = lang === 'en'
      ? `${SITE.tagline} — concepts, guides, curated articles, and agent-ready practices.`
      : `${SITE.tagline}——概念、指南、精选文章与 agent-ready 实践。`;
    const canonicalUrl = SITE.url ? `${SITE.url}/${lang}/` : '';

    const timelineHtml = buildTimelineHtml(timelines[lang], i18n[lang].timelineTitle);

    const indexHtml = render(indexTemplate, {
      lang, listings: listingsHtml, timeline: timelineHtml, pairLang, base: SITE.base,
      siteName: SITE.name, siteTagline: SITE.tagline,
      contributeUrl: `${SITE.repo}/blob/main/CONTRIBUTING.md`,
      quickstartPrompt: prompts[lang],
      ...i18n[lang],
    });
    const fullHtml = render(baseTemplate, {
      title: SITE.name, lang, body: indexHtml, base: SITE.base,
      ...seoVars({
        lang, title: SITE.name, description, canonicalUrl,
        pairCanonicalUrl: SITE.url ? `${SITE.url}/${pairLang}/` : '',
        pairLang, schemaType: 'WebSite', ogType: 'website',
        jsonLdOverride: SITE.url ? buildHomepageJsonLd({ lang, canonicalUrl, description }) : undefined,
      }),
    });

    const outPath = join(SITE.outDir, lang, 'index.html');
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, fullHtml);
  }

  const rootRedirect = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${SITE.base}/en/"></head></html>`;
  await writeFile(join(SITE.outDir, 'index.html'), rootRedirect);
}

async function copyAssets() {
  const cssDir = join(ROOT, 'build', 'css');
  const jsDir = join(ROOT, 'build', 'js');
  await Promise.all([
    mkdir(join(SITE.outDir, 'assets', 'css'), { recursive: true }),
    mkdir(join(SITE.outDir, 'assets', 'js'), { recursive: true }),
  ]);
  const copies = [];
  if (existsSync(cssDir)) copies.push(cp(cssDir, join(SITE.outDir, 'assets', 'css'), { recursive: true }));
  if (existsSync(jsDir)) copies.push(cp(jsDir, join(SITE.outDir, 'assets', 'js'), { recursive: true }));
  await Promise.all(copies);
}

function pageUrl(page) {
  return SITE.url ? `${SITE.url}/${page.lang}/${page.rel}/` : page.path;
}

async function buildSitemap(pages) {
  if (!SITE.url) return;
  const visible = pages.filter(p => p.status !== 'hidden');
  const pairMap = new Map();
  for (const p of visible) pairMap.set(`${p.lang}:${p.rel}`, p);

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  for (const lang of ['en', 'zh']) {
    xml += `  <url>\n    <loc>${SITE.url}/${lang}/</loc>\n  </url>\n`;
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
  await writeFile(join(SITE.outDir, 'sitemap.xml'), xml);
}

const AI_USER_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Googlebot',
  'Bingbot',
  'Applebot',
  'Applebot-Extended',
  'DuckAssistBot',
  'Meta-ExternalAgent',
  'cohere-ai',
];

async function buildRobots() {
  let txt = '';
  for (const ua of AI_USER_AGENTS) {
    txt += `User-agent: ${ua}\nAllow: /\n\n`;
  }
  txt += 'User-agent: *\nAllow: /\n';
  if (SITE.url) txt += `\nSitemap: ${SITE.url}/sitemap.xml\n`;
  await writeFile(join(SITE.outDir, 'robots.txt'), txt);
}

async function buildRSS(pages) {
  if (!SITE.url) return;
  const feeds = ['en', 'zh'].map(async (lang) => {
    const items = pages.filter(p => p.lang === lang && p.status !== 'hidden');
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n';
    xml += `  <title>${SITE.name} (${lang.toUpperCase()})</title>\n`;
    xml += `  <link>${SITE.url}/${lang}/</link>\n`;
    xml += `  <description>${SITE.tagline}</description>\n`;
    xml += `  <language>${lang}</language>\n`;
    xml += `  <atom:link href="${SITE.url}/${lang}/feed.xml" rel="self" type="application/rss+xml" />\n`;
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
    await mkdir(join(SITE.outDir, lang), { recursive: true });
    await writeFile(join(SITE.outDir, lang, 'feed.xml'), xml);
  });
  await Promise.all(feeds);
}

async function buildLlmsTxt(pages) {
  const visible = pages.filter(p => p.status !== 'hidden');
  let txt = `# ${SITE.name}\n\n`;
  txt += `> ${SITE.tagline} for agent practitioners. Concepts, guides, curated articles, and agent-ready practices for building with AI agents.\n\n`;
  if (SITE.author.name) {
    txt += `**Author**: ${SITE.author.name}`;
    if (SITE.author.url) txt += ` (${SITE.author.url})`;
    txt += '\n';
    if (SITE.repo) txt += `**Repository**: ${SITE.repo}\n`;
    if (SITE.url) txt += `**Homepage**: ${SITE.url}\n`;
    txt += '\n';
  }
  for (const section of ['concepts', 'guides', 'curated', 'evangelism']) {
    const items = visible.filter(p => p.lang === 'en' && p.section === section);
    if (!items.length) continue;
    txt += `## ${section.charAt(0).toUpperCase() + section.slice(1)}\n\n`;
    for (const p of items) {
      const url = SITE.url ? `${SITE.url}/en/${p.rel}/` : p.path;
      txt += `- [${p.title}](${url})`;
      if (p.description) txt += `: ${p.description}`;
      txt += '\n';
    }
    txt += '\n';
  }
  await writeFile(join(SITE.outDir, 'llms.txt'), txt);
}

async function buildSitemapMd(pages) {
  const visible = pages.filter(p => p.status !== 'hidden');
  let md = `# ${SITE.name} — Site Map\n\n`;
  for (const lang of ['en', 'zh']) {
    md += `## ${lang === 'en' ? 'English' : '中文'}\n\n`;
    const langPages = visible.filter(p => p.lang === lang);
    const sections = {};
    for (const p of langPages) (sections[p.section] ??= []).push(p);
    for (const [section, items] of Object.entries(sections)) {
      md += `### ${section.charAt(0).toUpperCase() + section.slice(1)}\n\n`;
      for (const p of items) {
        const url = SITE.url ? `${SITE.url}/${lang}/${p.rel}/` : p.path;
        md += `- [${p.title}](${url})`;
        if (p.description) md += ` — ${p.description}`;
        md += '\n';
      }
      md += '\n';
    }
  }
  await writeFile(join(SITE.outDir, 'sitemap.md'), md);
}

async function main() {
  console.log('Building site...');
  await mkdir(SITE.outDir, { recursive: true });
  const pages = await buildPages();
  await Promise.all([
    buildIndex(pages),
    copyAssets(),
    buildSitemap(pages),
    buildRobots(),
    buildRSS(pages),
    buildLlmsTxt(pages),
    buildSitemapMd(pages),
  ]);
  console.log(`Built ${pages.length} pages → site/`);
}

main().catch(e => { console.error(e); process.exit(1); });
