---
title: "CSS Variables as Consistency Constraints"
description: "Why ad-hoc spacing and color values create style drift across agent-assisted iteration, and how a variable-driven design system turns consistency from a memory problem into a compile-time constraint."
lang: en
pair: zh.md
lastUpdated: 2026-05-07
status: published
---

# CSS Variables as Consistency Constraints

Every round of visual iteration adjusts something — a margin, a border color, a heading size. If each adjustment is a bare number, the next iteration has no anchor to compare against. Three sessions later the spacing feels arbitrary because it *is* arbitrary: each value was set against the previous value, not against a scale.

Treating CSS variables as a design-system contract turns consistency from a memory problem into a constraint the code can enforce.

## The Drift Problem

Style drift is not a judgment call gone wrong. It is what happens when the reviewer and the author have no shared reference. In agent-assisted work it accelerates: the agent is asked to "make it a bit tighter," tightens by some amount, and the next reviewer — human or agent — has no way to check whether the new value is part of the system or a local exception.

The symptoms are recognizable:

- Spacing values like `1rem`, `1.25rem`, `1.5rem`, `1.75rem` scattered across the stylesheet with no discernible scale.
- Two "subtle" border colors that are actually different hex values.
- Font sizes chosen by eye instead of by step.

Each value is defensible in isolation. The problem is the set.

## The Constraint Pattern

Declare the vocabulary once, reference it everywhere. CSS custom properties are designed for this — they turn named tokens into the only legal values for margin, padding, color, and border width.

A minimal spacing scale:

```css
:root {
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2.5rem;
}

.section { padding: var(--space-lg); }
.card + .card { margin-top: var(--space-md); }
```

The rule is not "use variables sometimes." The rule is "a bare `rem` or `px` for margin, padding, border-width, or gap is a bug." Variables should cover every decision the design makes repeatedly.

## What to Put Under Variables

Anything that appears more than once and is expected to stay consistent:

- **Spacing** — `--space-*`. The most common source of drift.
- **Color** — `--bg`, `--fg`, `--muted`, `--accent`, `--border`, `--border-bright`. Name tokens by role, not by the specific hex — roles survive palette changes.
- **Radii** — `--radius-sm`, `--radius-md`. A project with five different border radii almost never meant to have five.
- **Border widths** — `--border-width-thin`, `--border-width-thick`. Mixed 1px/2px borders next to each other are the clearest divider inconsistency signal.
- **Typography steps** — `--text-sm`, `--text-base`, `--text-lg`. Skip ad-hoc `font-size: 17px` once there is a scale.
- **Transition durations** — `--duration-fast`, `--duration-base`. Grouped durations make animations feel coordinated.

## Why This Mirrors Brand-Constant Single-Source-of-Truth

The same principle operates at the project-metadata layer: keep brand name, tagline, and URLs in one place (e.g., `package.json`) and read them from build scripts, OG tags, and canonical URLs. Duplicating "Agent Master Handbook" across templates produces the same class of bug as duplicating `1.5rem` across CSS — eventually one copy drifts.

CSS variables are the styling-layer instance of the same rule: **constants live in one place, consumers reference them**. The payoff is identical: future changes touch one line, not fifteen.

## Typography Baseline as an Anchor

Once variables define the vocabulary, the scale itself needs an anchor. Inventing a new typographic scale for technical documentation rarely produces something better than what already works. Start from a known-good baseline and adjust only where editorial voice requires it.

For article-like content, [GitHub Markdown CSS](https://github.com/sindresorhus/github-markdown-css) is a widely adopted reference:

- Body font size around 16px
- Body line-height around 1.5
- Paragraph margin around 1rem
- Heading top-margin around 1.5rem

Deviating by more than roughly ±15% from these values usually signals drift, not intent. Pick the baseline that matches the content genre (editorial, documentation, marketing), then encode the derived values as variables so future edits stay inside the chosen scale.

## How to Adopt Incrementally

A repo that already has drift does not need a full rewrite.

1. **Audit what is already there.** List every distinct value used for margin, padding, and border in the current stylesheet.
2. **Cluster and name.** Most of the numbers will cluster around five to seven canonical sizes. Name those; discard the rest.
3. **Extract the scale.** Declare the cluster representatives as CSS variables.
4. **Replace bare values, one property at a time.** Spacing first (highest drift rate), then borders, then colors.
5. **Forbid bare values going forward.** Add a lint rule, a review check, or — if neither is available — a line in the project's agent instructions that says bare `rem`/`px` for margin/padding/border is a review finding.

The final step is what makes the system stick. Without it, the next iteration drops a bare `1.125rem` back in and the audit was temporary.

## Review Surface

Once the scale exists, the review criteria collapse to a small set of questions:

- Does this property reference a variable, or is it a bare number?
- If it is a bare number, is there a matching variable that should be used?
- If there is no matching variable, should one be added — or is this a genuine one-off?

These questions are mechanical enough to be part of an automated lint rule or a post-change review skill. Drift becomes a findable, fixable class of issue rather than an aesthetic argument.

## References

- [GitHub Markdown CSS](https://github.com/sindresorhus/github-markdown-css) — typography baseline for article-like content.
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) — custom property semantics and cascading rules.
- [Design tokens explained (W3C Design Tokens Community Group)](https://www.w3.org/community/design-tokens/) — the formal model behind named value tokens across tools and platforms.
