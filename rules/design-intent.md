---
name: Design Intent
type: rule
severity: medium
verified: 2026-05-14
trigger: any visual change to CSS, templates, layout, typography, or color tokens
---

# Design Intent / 设计意图

## Rule / 规则

Before changing site visuals (layout order, spacing, type scale, accent color, divider style), the agent MUST check the change against the project's stated design intent below. A change that conflicts with intent requires an explicit reason recorded in the PR description — not a silent override.

在调整站点视觉之前（布局顺序、间距、字号、强调色、分隔线），agent 必须比对下列项目设计意图。与意图冲突的改动需要在 PR 描述中给出明确理由 —— 不能默默覆盖。

## Stated Intent / 已声明的意图

### 1. Tone — Editorial reference, not marketing site / 调性

This is a handbook, not a product landing page. Hero copy is restrained, no gradients, no oversized CTAs. The reader is a practitioner looking up knowledge, not a visitor being persuaded.

这是手册，不是产品落地页。Hero 文案克制，无渐变、无大号 CTA。读者是来查知识的从业者，不是来被说服的访客。

**Reference points / 参照范式:** Stripe Press, Linear blog, Tailwind docs — dense type, generous vertical rhythm, accent through typography rather than color.

### 2. Type system — Three fonts, three roles / 字体系统

- `--serif` (Playfair Display): editorial weight. Used for `h1`/`h2`/`h3` and content list item links. Carries the "handbook" feel.
- `--sans` (Source Sans 3 + Noto Sans SC): body text and tagline. Neutral, high readability for long form.
- `--mono` (JetBrains Mono): code, section labels (uppercase + letter-spacing), metadata (last-updated, breadcrumbs).

每个字体只承担一种角色。在错误的位置混用（例如把 mono 用作 body）会破坏层级信号。

### 3. Accent — Brightness, not hue / 强调色

Dark-mode `--accent` is near-white (`#e5e5e5`). It signals importance through brightness contrast, not color. Avoid introducing purple/violet/blue accents — that reads as "AI default theme" with no design rationale. See memory `feedback_frontend_lessons` for the prior incident.

链接靠下划线区分（也是 WCAG 要求），不是靠颜色。

### 4. Spacing — Scale, not estimation / 间距

The spacing scale (`--space-xs` 0.5rem → `--space-3xl` 4.5rem) is the only legal source for margin, padding, gap, and border-width. Bare `1rem` / `1.25rem` / `1.5rem` literals are review findings, not stylistic choices. See [content/guides/css-variable-consistency/en.md](../content/guides/css-variable-consistency/en.md).

Section-level rhythm uses `--space-3xl` between major blocks (header, timeline, quickstart, footer). Content-level rhythm uses `--space-2xl`. Inline rhythm uses `--space-md` and below.

### 5. Density vs whitespace / 密度

Content area max-width is `52rem` by default, `64rem` at `min-width: 1100px`. Beyond `1100px`, the page widens rather than centering more whitespace — this is a handbook, the goal is reading throughput, not breathing room.

宽屏不是用来留白的，是用来扩展信息密度的。

### 6. Homepage section order — Story before action / 首页顺序

Order: `Header → Timeline → Quick Start → Content sections`.

Timeline precedes Quick Start because Timeline carries the story ("Agent 实践的演进"), which earns the right to ask the reader to copy a prompt. Order reversed earlier; reversed back on 2026-05-14 after social-media screenshot evaluation — at 1200×675 (X/Twitter ratio) the original order showed only the prompt block, which gave the wrong first impression.

时间线在快速开始之前，因为时间线承载故事，故事换来读者愿意复制 prompt 的信任。

### 7. Dividers — Audit as a set / 分隔线

When changing any divider-style border, audit all dividers in the file together. Allowed combinations:

- Site-level separator: `2px solid var(--border-bright)` (site-header bottom only)
- Section separator: `1px solid var(--border)` (between homepage sections)
- Page-header separator: `1px solid var(--border-bright)`
- List-item separator: `1px solid var(--border)`

Mixed widths or mixed color tokens within a single visual relationship is a review finding.

## Rationale / 理由

Existing rules and skills (`frontend-interaction-review`, `css-variable-consistency`, Quality Baseline) cover **how not to break things**. They do not cover **why the site looks the way it does**.

Without a recorded intent, every visual change becomes a fresh negotiation between the agent and the reviewer. After three iterations the spacing feels arbitrary because no one remembers what the original choice was for. This rule moves visual decisions from memory to checkable artifact.

现有规则覆盖"如何不犯错"，但没有覆盖"为什么是这样"。没有意图记录，每轮改动都是重新协商一次。三轮之后间距就显得任意 —— 因为没人记得最初的选择是为了什么。这条规则把视觉决策从记忆变成可核对的产物。

## Examples / 例子

**Correct / 正确**

- Adding a new section type → check existing token usage, pick `--space-2xl` or `--space-3xl` based on whether it's content-level or page-level.
- Considering a color accent for a CTA → re-read intent #3, decide instead to use brightness/weight/underline.
- Reordering homepage blocks → check intent #6, verify the new order still earns the action; if not, document the trade-off in the PR.

**Incorrect / 错误**

- "I'll just use `1.75rem` here, it looks better" → bare literal, no token reference, violates intent #4.
- "Let's make the accent purple for a more modern feel" → violates intent #3 without recorded reason.
- "Put Quick Start back at the top, it's more direct" → violates intent #6 without referencing the screenshot evidence from 2026-05-14.

## How to apply when an intent feels wrong / 当意图本身需要修改

If the agent (or reviewer) believes a stated intent is wrong, **update this file in the same PR** that changes the visuals. Do not silently violate the intent. The intent is the contract — changing the contract is fine, breaking it silently is not.
