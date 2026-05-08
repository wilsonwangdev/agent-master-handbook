---
title: "让你的站点被 AI 回答引擎看懂"
description: "一份关于 AI 可见性（AEO / GEO）的实用指南——llms.txt、结构化数据、显式爬虫信号与提交入口，让 ChatGPT、Claude、Perplexity 和 AI 搜索引擎在不制造垃圾内容的前提下理解并正确引用你的内容。"
lang: zh
pair: en.md
lastUpdated: 2026-05-08
status: published
---

# 让你的站点被 AI 回答引擎看懂

搜索多了一类新读者。ChatGPT search、Claude、Perplexity、Google AI Overview、Bing Copilot 会以爬虫身份访问你的站点，汇总其内容，再把摘要呈现给从不点进原站的用户。让页面在经典搜索结果列表里排名靠前的那套做法，并不可靠地让内容被这类读者看懂。它们旁边多了一门更薄、更新的学科，通常叫 **AEO**（Answer Engine Optimization）或 **GEO**（Generative Engine Optimization）。

本文写的是这门学科里正当的、非垃圾的那一半：把你已经发布的内容变得更容易被 AI 发现、理解、正确归属。不是往网络里灌生成文本。

## AI 读者需要什么

传统搜索爬虫抓文本和链接，把相关性判断留给排名模型。AI 回答引擎在抓取阶段就要做更多事：它试图 *理解* 页面声称了什么、由谁发布、时效如何、是一手源还是某个一手源的二手摘要。主动吐出这些结构的页面，被正确引用的成本低。不主动吐出的页面，引擎只能猜，而猜就会产生错误归属，或者干脆被跳过。

五类信号承担了大部分权重：

1. **一个紧凑的、机器可读的站点描述** —— 一份文档讲清楚这是什么站、谁在运营、重要页面在哪里。
2. **一个机器可读的全文产物** —— 页面正文，剥离排版，放在一个文件里，爬虫无需跟链接就能吃进去。
3. **对 AI 爬虫的显式准入** —— 不只是"允许所有爬虫"，而是点名欢迎哪些具体 agent。
4. **结构化的语义元数据** —— JSON-LD 给页面上的实体打标签（谁、什么、何时、基于哪个来源）。
5. **出现在对的索引里** —— AI 引擎真正会去读的那几个目录与 webmaster 工具。

后文逐一说明每类信号在实践中长什么样，并链到定义它们的规范或厂商文档。

## 1. 在站点根部发布 llms.txt

[llms.txt](https://llmstxt.org/) 是 Jeremy Howard 在 2024 年提出的约定：在站点根部放一份 Markdown 文件，告诉 LLM 类工具这个站是做什么的、关键内容在哪里。格式故意保持简单：一级标题写站名，引用块写一句话摘要，再用二级标题组织链接列表。典型样式：

```markdown
# Example Site

> 一句话说明这个站是什么。

## Concepts

- [页面标题](https://example.com/concepts/page/): 简要描述。

## Guides

- [页面标题](https://example.com/guides/page/): 简要描述。
```

为什么有效：这份文件给了 AI 工具一张手写的、紧凑的地图。当模型被问到你的站点时，它可以先读 `llms.txt`，省去从 HTML 里推断结构的成本。

在基础规范之外，有两条务实的补充：

- **加上作者 / 仓库 / 主页行。** 有用，因为 AI 引擎被问到"X 是谁发布的"的频率和"X 是什么"差不多高。
- **引用 `llms-full.txt`。** 愿意多付一个请求的爬虫通常更喜欢一次性拿到全文。

> 本手册在 `/llms.txt` 和 `/llms-full.txt` 都发布了。生成逻辑见 `build/build.mjs`，构建时从内容 frontmatter 自动产生。

## 2. 发布 llms-full.txt 供一次性摄取

[llms-full.txt 约定](https://llmstxt.org/#format) 是 `llms.txt` 的搭档：把重要页面的正文拼成一份 Markdown 文件。爬虫不用再跟 20 条链接再合并结果，你直接把内容一次性递给它。

几个实际约束：

- **只放你愿意被一字不差引用的内容。** 草稿、未公开的页面、陈旧内容都别进来。
- **保留逐页锚点。** 每个页面在文件里的那段，用 `## <页面标题>` 开头，并带上 URL、区块、lastUpdated 元信息，这样引用可以回指到原始页面。
- **体积保持合理。** 50–200 KB 是常见区间。超出这个范围，对单个爬虫的成本开始大于收益。

如果你的站是从 Markdown 源码静态生成的，`llms-full.txt` 只是构建的副产物——内容已经以正确的形态存在了。

## 3. 在 robots.txt 里区分训练爬虫与搜索爬虫

`robots.txt` 通常被理解成一份权限文件，但它同时是一份 **信号** 文件。显式的 allow-list 告诉审计工具和回答引擎：你按名字欢迎哪些 agent，这和一条裸的 `User-agent: *` 的隐式允许并不等价。

多数厂商现在运行两类 bot：

- **训练爬虫** 采集数据用于训练下一代模型。示例：[GPTBot](https://platform.openai.com/docs/bots)（OpenAI）、[ClaudeBot](https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) / `anthropic-ai`（Anthropic）、[Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers#google-extended)（Google）、[PerplexityBot](https://docs.perplexity.ai/guides/bots)（Perplexity）。
- **搜索 / 实时检索爬虫** 在回答时即时抓取，为 AI 搜索供给内容。示例：[OAI-SearchBot](https://platform.openai.com/docs/bots) 与 `ChatGPT-User`（OpenAI）、[Claude-SearchBot](https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) 与 `Claude-User`（Anthropic）、`Perplexity-User`（Perplexity）。

你对这两类的策略可以不同——比如拒绝训练、允许搜索。无论策略是什么，都显式写出来：

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

活跃 AI user agent 的完整名单会变。每家厂商发布自己的文档，上面的链接就是权威来源。每年复核一两次。

## 4. 嵌入 JSON-LD 结构化数据

JSON-LD 是绝大多数 AI 引擎（包括 Google AI Overview）从页面提取结构化事实时首选的格式。和 meta description 不同，JSON-LD 携带的是带类型的实体 —— 这个页面是一个 `Article`，它的 `author` 是名叫 X 的 `Person`，它的 `publisher` 是一个 `Organization`，它的 `citation` 是位于 URL Y 的另一个 `CreativeWork`。

规范在 [schema.org](https://schema.org/)。Google 面向搜索的实用指引在 [Structured Data 文档](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)。

**类型的区分度比覆盖率更重要。** 把所有页面都标成 `Article` 的站点，只给了引擎一比特的信息。一个站点如果：

- 把教程和参考页标成 `TechArticle` 或 `HowTo`
- 把对外部内容的评注标成 `Article` 加一个指向来源的 `citation`
- 把产品页标成 `SoftwareApplication` 并带上对应字段
- 把 FAQ 区块标成 `FAQPage`
- 在首页用 `@graph` 把 `WebSite`、`Organization`、`Person` 关联起来

...就能给引擎一张可查询的密图。

作者和发布者字段格外重要，因为 AI 引擎经常被问"这是谁做的"或"这个来源可不可信"。一个清晰的 `author`（`Person`）、`publisher`（`Organization`），加上稳定的 `@id` 与指向你在其他平台（GitHub、Twitter/X、LinkedIn）账号的 `sameAs` 链接，能搭出一个可引用的身份。

> 本手册的构建按页面类型嵌入不同的 JSON-LD（concepts → `TechArticle`、curated → `Article` 带 `citation`），首页则用 `@graph` 关联 `WebSite`、`Organization`、`Person`、`WebPage`。生成逻辑见 [build.mjs](https://github.com/wilsonwangdev/agent-master-handbook/blob/main/build/build.mjs)。

## 5. 提交到 AI 引擎真正会读的入口

站内信号只有在对的爬虫发现了站点之后才算数。有一小批目录和 webmaster 工具直接位于 AI 回答引擎的上游。都是免费的，多数是一次性提交。

- **[llmstxt.org 目录](https://directory.llmstxt.cloud/)** 与 **[llmstxt.site](https://llmstxt.site/)** —— 发布了 `llms.txt` 的站点的社区登记处。[llms-txt-hub（GitHub）](https://github.com/thedaviddias/llms-txt-hub) 通过 PR 收录条目。
- **[Bing Webmaster Tools](https://www.bing.com/webmasters)** —— Bing 的索引为 Copilot、DuckDuckGo 以及部分 Yahoo 提供动力。提交 sitemap 能加速抓取，它的 "AI Performance" 面板能看到你的内容被 AI 回答引擎引用的频次。
- **[Google Search Console](https://search.google.com/search-console)** —— 提交 sitemap，确认 AI Overview 的曝光情况。
- **[Perplexity Publishers Program](https://www.perplexity.ai/hub/legal/perplexity-publishers-program)** —— 出版方登记，影响 Perplexity 是否把你的站当作一等来源。

提交不是排名 hack。它只是告诉每套系统"我这个站存在、sitemap 在这里"。持续信号仍然来自内容本身，提交只确保内容被读到。

## 要避免的事

AEO 的反面学科是 **为 AI 制造内容垃圾** —— 批量生产低质量文本来冲引用次数或挤掉对手。这套做法在三个方向上都失败：

- AI 引擎检测这类行为的能力在持续增强，还会相应惩罚。
- 会稀释真实内容在爬虫对你这个站的记忆中的密度。
- 会破坏结构化数据与显式身份本该建立的信任信号。

本指南的前提是：你发表的内容，即使在一个只有人类的互联网上也愿意署名。这些做法让这类内容对 AI 可见。它们不制造内容。

## 推荐顺序

假设起点是一个已经有 sitemap 和 meta description，但还没有任何 AI 专属动作的站：

1. 加上 `llms.txt` 和 `llms-full.txt`。不需要改代码；如果有构建系统就加个生成器，没有就手写。
2. 把 `robots.txt` 里裸的 `User-agent: *` 替换为显式的 AI bot 列表加通配符。
3. 审计 JSON-LD。按区块区分类型；在合适的地方加上 `author`、`publisher`、`citation`；在首页加一个 `@graph` 关联 `WebSite`、`Organization`、`Person`。
4. 提交到 Bing Webmaster Tools、Google Search Console、`llms.txt` 目录，以及（如果相关）Perplexity Publishers。

这些都不是一劳永逸的。厂商 bot 名会变，schema 类型会新增，`llms.txt` 规范本身也还在 1.0 以前。每年对照上面的一手源复核一两次。

## 灵感来源

把以上五类信号整合成一份可操作清单，是一线实践者公开写作的工作。[Tw93 2026 年 5 月关于 AI 可见性的推文](https://x.com/HiTw93/status/2049868069208768812) 清晰表达了核心原则——"结构化你本来就有的内容，别制造内容去讨好 AI"——也直接触发了本手册的 AEO 基线工作（PR [#69](https://github.com/wilsonwangdev/agent-master-handbook/pull/69) 与 [#70](https://github.com/wilsonwangdev/agent-master-handbook/pull/70)）。上文每一条具体做法都链到它自己的权威来源。
