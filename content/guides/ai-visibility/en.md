---
title: "Making Your Site Legible to AI Answer Engines"
description: "A practical guide to AI visibility (AEO/GEO) — llms.txt, structured data, explicit crawler signals, and submission targets that let ChatGPT, Claude, Perplexity, and AI search engines understand and cite your content without you writing spam."
lang: en
pair: zh.md
lastUpdated: 2026-05-08
status: published
---

# Making Your Site Legible to AI Answer Engines

Search has a new reader. ChatGPT search, Claude, Perplexity, Google AI Overview, and Bing Copilot now arrive at your site as crawlers, summarize its content, and present that summary to users who never click through. The practices that rank pages in a classical search results list do not reliably make content legible to this reader. They sit alongside a thinner, newer discipline often called **AEO** (Answer Engine Optimization) or **GEO** (Generative Engine Optimization).

This guide is about the legitimate, non-spam side of that discipline: making what you already publish easier for AI to find, understand, and attribute correctly. It is not about flooding the web with generated text.

## What the AI Reader Needs

A traditional search crawler indexes words and links and lets a ranking model decide relevance later. An AI answer engine does more work at crawl time: it tries to *understand* what a page claims, who published it, how fresh it is, and whether the page is a primary source or a summary of one. Pages that volunteer this structure are cheap to cite correctly. Pages that don't force the engine to guess, and guessing produces wrong attributions or outright omission.

Five signals carry most of the weight:

1. **A compact, machine-readable description of the site** — one document that says what the site is, who runs it, and where the important pages live.
2. **A machine-readable full-content artifact** — the actual body text, stripped of layout, in one file that a crawler can ingest without following dozens of links.
3. **Explicit permission for AI crawlers** — not just "all crawlers allowed," but naming the specific agents you welcome.
4. **Structured semantic metadata** — JSON-LD that labels entities on the page (who, what, when, based on what source).
5. **Presence in the right indexes** — the handful of directories and webmaster tools that AI engines actively consult.

The rest of this guide is what each signal looks like in practice, with links to the specifications and vendor docs that define them.

## 1. Publish an llms.txt at Your Site Root

[llms.txt](https://llmstxt.org/) is a convention, proposed by Jeremy Howard in 2024, for a Markdown file at your site root that tells LLM-based tools what your site is about and where its key content lives. It is a deliberately simple format: an H1 with the site name, a short blockquote summary, then H2 sections of link lists. A typical shape:

```markdown
# Example Site

> One-sentence summary of what this site is.

## Concepts

- [Page title](https://example.com/concepts/page/): description.

## Guides

- [Page title](https://example.com/guides/page/): description.
```

Why this works: the file gives AI tooling a hand-authored, compact map. When a model is asked about your site, it can read `llms.txt` first and skip the cost of inferring structure from HTML.

Two pragmatic additions beyond the base spec:

- **Author / repository / homepage header lines.** Useful because AI engines are asked "who publishes X" as often as "what is X."
- **Reference to `llms-full.txt`.** Crawlers that can afford one more request often prefer the full content in one document.

> This handbook publishes both at `/llms.txt` and `/llms-full.txt`. See `build/build.mjs` for how they are generated from content frontmatter at build time.

## 2. Publish an llms-full.txt for One-Shot Ingestion

The [llms-full.txt convention](https://llmstxt.org/#format) complements `llms.txt`: it concatenates the actual body text of your important pages into a single Markdown file. Instead of making a crawler follow 20 links and merge the results, you hand it the content in one ingestion.

Practical constraints:

- **Include only what you are comfortable being cited verbatim.** Drafts, unlisted pages, and stale content should stay out.
- **Preserve per-page anchors.** Each page's section should start with an `## <page title>` heading and carry a URL, section, and last-updated metadata line so citations can point back to the canonical page.
- **Keep the file reasonable.** 50–200 KB is common. Beyond that, the cost to an individual crawler outweighs the benefit.

If your site generates static output from source Markdown, `llms-full.txt` is a by-product of the build — the content already exists in the right form.

## 3. Distinguish Training Crawlers from Search Crawlers in robots.txt

`robots.txt` is understood as a permission file, but it is also a **signal** file. An explicit allow-list tells auditors and answer engines which agents you welcome by name, which is different from the implicit allow of a bare `User-agent: *`.

Most vendors now run two classes of bots:

- **Training crawlers** collect data to train future models. Examples: [GPTBot](https://platform.openai.com/docs/bots) (OpenAI), [ClaudeBot](https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) / `anthropic-ai` (Anthropic), [Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers#google-extended) (Google), [PerplexityBot](https://docs.perplexity.ai/guides/bots) (Perplexity).
- **Search / live-retrieval crawlers** fetch content at answer time to power AI search. Examples: [OAI-SearchBot](https://platform.openai.com/docs/bots) and `ChatGPT-User` (OpenAI), [Claude-SearchBot](https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) and `Claude-User` (Anthropic), `Perplexity-User` (Perplexity).

You may have different policies for the two classes — for example, disallowing training while allowing search. Whatever the policy, state it explicitly:

```
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

The full list of active AI user agents changes. Each vendor publishes its own documentation; the links above are the canonical references. Revisit once or twice a year.

## 4. Embed JSON-LD Structured Data

JSON-LD is the format most AI engines, and Google's AI Overview, use to extract structured facts from a page. Unlike meta descriptions, JSON-LD carries typed entities — this page is an `Article` whose `author` is a `Person` named X, whose `publisher` is an `Organization`, whose `citation` is another `CreativeWork` at URL Y.

The specification lives at [schema.org](https://schema.org/). Google's practical guidance for search is in the [Structured Data documentation](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data).

Differentiation matters more than coverage. A site that labels every page as `Article` gives the AI engine one bit of information. A site that labels:

- Tutorials and reference pages as `TechArticle` or `HowTo`
- Commentary on external content as `Article` with a `citation` field pointing at the source
- Product pages as `SoftwareApplication` with schema-specific fields
- FAQ sections as `FAQPage`
- The homepage as a `@graph` linking `WebSite`, `Organization`, and `Person`

... gives the engine a dense graph it can query.

Author and publisher fields carry particular weight because AI engines are often asked "who made this" or "is this source credible." A clear `author` (`Person`) and `publisher` (`Organization`) with stable `@id` and `sameAs` links to your profiles on other platforms (GitHub, Twitter/X, LinkedIn) builds a citable identity.

> This handbook's build embeds JSON-LD per page with section-specific types (concepts → `TechArticle`, curated → `Article` with `citation`), plus a homepage `@graph` linking `WebSite`, `Organization`, `Person`, and `WebPage`. See [build.mjs](https://github.com/wilsonwangdev/agent-master-handbook/blob/main/build/build.mjs) for the generator.

## 5. Submit to the Places AI Engines Read

Signals embedded in your site only matter if the right crawlers find the site. A handful of directories and webmaster tools sit directly upstream of AI answer engines. All are free and most are one-time submissions.

- **[llmstxt.org directory](https://directory.llmstxt.cloud/)** and **[llmstxt.site](https://llmstxt.site/)** — community registries of sites that publish `llms.txt`. [llms-txt-hub on GitHub](https://github.com/thedaviddias/llms-txt-hub) accepts pull requests to add entries.
- **[Bing Webmaster Tools](https://www.bing.com/webmasters)** — Bing indexes power Copilot, DuckDuckGo, and parts of Yahoo. Submit your sitemap to accelerate crawl, and its "AI Performance" panel surfaces how often your content is cited by AI answer engines.
- **[Google Search Console](https://search.google.com/search-console)** — submit sitemap, verify AI Overview coverage.
- **[Perplexity Publishers Program](https://www.perplexity.ai/hub/legal/perplexity-publishers-program)** — a publisher registration that influences whether Perplexity treats your site as a first-class source.

Submission is not a ranking hack. It is the act of telling each system your site exists and where its sitemap lives. Most of the ongoing signal comes from the content itself; submission just ensures the content is read.

## What to Avoid

The counter-discipline to AEO is **content spam for AI** — generating large quantities of low-effort text to inflate citations or crowd out competitors. This fails in three ways:

- AI engines increasingly detect and penalize it.
- It dilutes your real content in the crawler's memory of your site.
- It damages the trust signal that structured data and explicit identity are supposed to build.

The practices in this guide assume you are publishing content you would stand behind in a human-only web. They make that content legible to AI. They do not manufacture content.

## Order of Operations

If starting from a site that has a sitemap and meta descriptions but nothing AI-specific:

1. Add `llms.txt` and `llms-full.txt`. No code changes; a build-time generator if you have one, or hand-authored files otherwise.
2. Replace the bare `User-agent: *` in `robots.txt` with an explicit AI bot list plus the wildcard.
3. Audit JSON-LD. Differentiate types by section; add `author`, `publisher`, and `citation` where applicable; add an `@graph` on the homepage linking `WebSite`, `Organization`, and `Person`.
4. Submit to Bing Webmaster Tools, Google Search Console, `llms.txt` directories, and (if relevant) Perplexity Publishers.

None of this is permanent. Vendor bot names change; schema types get added; the `llms.txt` specification itself is pre-1.0. Revisit once or twice a year against the primary sources linked above.

## Inspiration

The synthesis of these five signals into a coherent checklist is the work of practitioners writing in public. [Tw93's May 2026 post on AI visibility](https://x.com/HiTw93/status/2049868069208768812) articulated the principle — structure what you already have, do not manufacture content to game AI — and triggered this handbook's own AEO baseline work (PRs [#69](https://github.com/wilsonwangdev/agent-master-handbook/pull/69) and [#70](https://github.com/wilsonwangdev/agent-master-handbook/pull/70)). Each specific practice above links to its own canonical source.
