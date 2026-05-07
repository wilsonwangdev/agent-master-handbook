---
title: "Preventing Git Conflicts in Agent Workflows"
description: "Practical patterns for reducing merge conflicts when AI agents work on parallel branches — conflict-prone code patterns, lint thresholds, and PR boundary strategies."
lang: en
pair: zh.md
lastUpdated: 2026-05-07
status: published
---

# Preventing Git Conflicts in Agent Workflows

Merge conflicts are one of the most common friction points when agents work on parallel branches. Most conflicts are not random — they trace back to predictable code patterns that can be prevented through structure, lint rules, and PR discipline.

## Why Agents Make Conflicts Worse

Human developers intuitively avoid editing the same lines. Agents don't have this instinct. When two agent sessions work on the same file, they tend to:

- Append to the same growing function call or config object
- Add new variables to the same block of declarations
- Modify the same template in different ways

The result is conflicts that are technically simple but frequent enough to slow down the workflow.

## Conflict-Prone Code Patterns

### Growing function call arguments

When a function call accumulates many inline arguments, every PR that adds a new argument touches the same lines.

```javascript
// Conflict-prone: every new variable extends this block
const fullHtml = render(baseTemplate, {
  title, lang, body, base, description, canonicalUrl,
  pairCanonicalUrl, pairLang, ogLocale, noindex, jsonLd,
  ogType, rssUrl, markdownUrl, siteName, siteTagline,
});
```

Fix: extract a helper that assembles the object, so each PR modifies the helper instead of the call site.

```javascript
const fullHtml = render(baseTemplate, {
  title, lang, body, base,
  ...seoVars({ lang, title, description, canonicalUrl, ... }),
});
```

### Positional parameters

Functions with many positional parameters are worse than object parameters because inserting a new parameter shifts all subsequent positions.

Lint threshold: when a function exceeds 4-5 parameters, refactor to a single options object.

### Shared constant blocks

When multiple constants are declared in a single block, any PR that adds a new constant touches adjacent lines.

Fix: group constants into a config object. New properties are added inside the object, reducing line-level conflicts.

### Append-only files

Files where every change is an append (log files, changelog entries, growing arrays) will conflict whenever two branches both append.

Fix: use structured formats where entries are independent (one file per entry, or sections separated by clear delimiters).

## Lint Rules That Prevent Conflicts

Some conflict-prone patterns can be caught by static analysis:

- **Max function parameters**: ESLint `max-params` rule. Set a threshold (e.g., 4) and enforce object destructuring above it.
- **Max line length in function calls**: long single-line function calls are harder to merge than multi-line ones.
- **Import ordering**: auto-sorted imports don't conflict because both branches produce the same order.

These rules don't mention "conflicts" — they're standard code quality rules. But their side effect is directly reducing merge conflict frequency.

## PR Boundary Strategies

The most effective conflict prevention is not in the code — it's in how work is split.

### File overlap check

Before starting parallel work, list which files each PR will touch. If two PRs modify the same file, declare the dependency and define merge order.

### Vertical slicing

Split work by feature boundary, not by layer. A PR that touches "all templates" will conflict with any other template PR. A PR that adds "sitemap generation end-to-end" touches fewer shared files.

### Smallest possible diff

The fewer lines a PR changes, the less likely it conflicts. Resist the urge to clean up adjacent code while implementing a feature.

## Agent-Specific Recommendations

### Declare file ownership in the task

When assigning parallel tasks to agents, explicitly state which files each task should modify. This prevents two agents from independently deciding to "improve" the same file.

### Rebase before push, not after conflict

Agents should rebase onto the latest main before pushing, not after a conflict is reported. This catches conflicts early when the diff is still fresh in context.

### Use the pre-work checklist

Before creating a branch, verify the change is a single concern that can be described in one sentence. This is the simplest and most effective conflict prevention measure.
