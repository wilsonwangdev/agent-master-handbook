---
id: "005"
title: "Site Enhancement Plan — SEO, GEO, Navigation, RSS, Quality Governance"
status: accepted
created: 2026-04-24
---

# SPEC 005: Site Enhancement Plan

## Decision

Enhance the static site with SEO infrastructure, GEO (AI/Agent readability), navigation, RSS, and Lighthouse-based quality governance — all within the existing custom build system. Framework migration is deferred until explicit trigger conditions are met.

## Domain Strategy

- Primary domain: `https://agent-master-handbook.vercel.app`
- Backup domain: GitHub Pages (`https://wilsonwangdev.github.io/agent-master-handbook`)
- All canonical URLs, Open Graph URLs, hreflang alternates, sitemap entries, RSS links, and `llms.txt` links point to the primary Vercel domain
- GitHub Pages output includes `<meta name="robots" content="noindex,follow">` to prevent duplicate-content indexing
- Environment variable `SITE_URL` controls the primary domain; `BASE_PATH` remains for path-prefix compatibility

## Frontmatter Schema Extension

Add optional `description` field to content frontmatter:

```yaml
title: "Page Title"
description: "One-line summary suitable for meta description, OG, RSS, and llms.txt"
lang: en
pair: zh.md
lastUpdated: 2026-04-24
status: draft
```

When `description` is absent, the build system extracts the first paragraph of content as fallback.

## Enhancement Scope

### SEO
- `<meta name="description">`, Open Graph, Twitter Card tags
- `<link rel="canonical">` pointing to Vercel primary domain
- `<link rel="alternate" hreflang>` for EN/ZH pairs plus `x-default`
- JSON-LD structured data: `Article`/`TechArticle` for pages, `WebSite` for index
- `sitemap.xml` with `<xhtml:link>` hreflang alternates
- `robots.txt` with sitemap declaration

### GEO (Agent Readability)
- `/llms.txt` — site-level agent index following llmstxt.org format
- `/sitemap.md` — Markdown site map for agent consumption
- Per-page Markdown output (`.md` alongside `.html`) for agent-friendly access
- `<link rel="alternate" type="text/markdown">` in HTML head
- Stable heading hierarchy and semantic HTML for chunking/citation

### Navigation
- Breadcrumbs on detail pages: Home → Section → Page
- `BreadcrumbList` JSON-LD structured data
- Contribution entry points in header and footer linking to CONTRIBUTING.md

### RSS
- Per-language feeds: `/en/feed.xml`, `/zh/feed.xml`
- RSS autodiscovery `<link>` in HTML head

### Quality Governance
- Lighthouse baseline measurement for Performance, Accessibility, Best Practices, SEO
- Targeted remediation based on Lighthouse findings (font loading, semantics, contrast)

## Framework Decision

### Current: stay with custom build.mjs

The build system (`build/build.mjs`, ~125 lines) remains maintainable for the current scope. The enhancements above are metadata generation, derived-file output, and template additions — not platform-level features.

### Why frameworks exist

Static site frameworks solve systemic content-platform problems: theme systems, component reuse, multi-type content modeling, versioned docs, search indexing, image pipelines, incremental builds, plugin ecosystems, content schema validation, and authoring ergonomics. They replace "an ever-growing collection of site capabilities," not just Markdown-to-HTML conversion.

### Re-evaluation triggers

Migrate to a mature SSG (Astro/Starlight, Eleventy, VitePress, etc.) when any of these arise:

1. Site-wide search requirement
2. Versioned documentation
3. Rich component blocks (tabs, callouts, API references, interactive examples)
4. Content types multiply beyond simple section listings
5. Build logic exceeds single-file maintainability or features couple across generation rules
6. Multiple contributors need schema validation and authoring guardrails

## Implementation Order

Each phase is one PR, merged sequentially:

1. `spec/005-site-enhancement-plan` — this document
2. `content/add-meta-descriptions` — description frontmatter for all content
3. `build/primary-domain-and-seo-foundation` — SITE_URL, canonical, hreflang, OG, JSON-LD, noindex for backup domain
4. `build/sitemap-robots-and-hreflang` — sitemap.xml, robots.txt
5. `build/navigation-and-contribution-entry` — breadcrumbs, contribution links
6. `build/rss-and-content-discovery` — RSS feeds
7. `build/geo-agent-readability` — llms.txt, sitemap.md, per-page Markdown output
8. `build/lighthouse-baseline-and-performance-remediation` — Lighthouse audit and fixes
