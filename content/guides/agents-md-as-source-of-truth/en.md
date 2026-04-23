---
title: "AGENTS.md as Single Source of Truth"
lang: en
pair: zh.md
lastUpdated: 2026-04-24
status: draft
---

# AGENTS.md as Single Source of Truth

A practical guide to setting up a unified agent entry point that works across all major AI coding tools.

## The Problem

Each AI coding tool reads a different file for project instructions:

- Claude Code reads `CLAUDE.md`
- Cursor reads `.cursorrules`
- Windsurf reads `.windsurfrules`
- Codex reads `AGENTS.md`

Maintaining separate files means duplicated content, drift between versions, and inconsistent agent behavior across tools.

## The Solution: One File, Multiple Symlinks

Choose one canonical file and symlink the rest:

```bash
# AGENTS.md is the canonical file (real content lives here)
ln -s AGENTS.md CLAUDE.md
ln -s AGENTS.md .cursorrules
ln -s AGENTS.md .windsurfrules
```

Git tracks symlinks correctly — collaborators who clone the repo get working symlinks.

## Why AGENTS.md, Not CLAUDE.md

We initially used CLAUDE.md as the canonical file with AGENTS.md as a symlink. We reversed this because:

- **Tool-neutral naming**: AGENTS.md doesn't favor any specific vendor. A project that uses AGENTS.md as its entry point signals it supports all agent tools equally.
- **Emerging convention**: AGENTS.md is gaining adoption as the standard agent instruction file across the ecosystem (OpenAI Codex, community projects).
- **CLAUDE.md as symlink still works**: Claude Code follows symlinks, so `CLAUDE.md -> AGENTS.md` is transparent to it.

## Common Mistakes

### Starting with the wrong canonical file

We started with CLAUDE.md as canonical because Claude Code was our primary tool. When we added multi-agent support, we had to reverse all symlinks and update references across README, CONTRIBUTING, and other docs. Start with AGENTS.md from day one.

### Not updating references

When renaming the canonical file, grep the entire repo for references to the old name. Internal docs (README, CONTRIBUTING) need updating. Content files that reference the concept generically ("through CLAUDE.md or equivalent") can stay — they describe the industry convention, not this specific file.

### Forgetting Windows compatibility

Symlinks on Windows require either Developer Mode enabled or administrator privileges. Document this in your setup instructions. Alternatively, some teams use a post-checkout git hook to create copies instead of symlinks on Windows.

## Verification

After setup, verify all paths resolve to the same content:

```bash
head -1 AGENTS.md CLAUDE.md .cursorrules .windsurfrules
# All should show the same first line
```
