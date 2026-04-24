---
id: "003"
title: "Content Schema"
status: accepted
created: 2026-04-23
---

# SPEC 003: Content Schema

## Decision

All content lives under `content/` organized by type, with strict quality gates.

## Content Types

| Directory | Purpose | Quality Gate |
|-----------|---------|-------------|
| `concepts/` | Core concept definitions | Must be accurate, sourced, and consensus-based |
| `guides/` | Practical how-to guides | Must be tested and reproducible |
| `curated/` | Blog article curation | Must include rationale for inclusion, authoritative source |
| `evangelism/` | AI Native evangelism | Must reflect verified, non-speculative positions |

## Quality Principles

1. No outdated, low-quality, or non-consensus content
2. Structure can be placeholder; content cannot be filler
3. All references must be traceable to authoritative primary sources
4. Cutting-edge but stable — only concepts with established consensus
5. Project-specific incident reports, deployment logs, and one-off tool integrations do **not** belong in `content/` by default. They belong in `journal/` unless they can be abstracted into a reusable, broadly applicable guide that fits the site's scope.
6. Before adding new content, ask: "Is this a project-local lesson, or a reusable agent/harness pattern other projects can adopt?" Only the latter belongs in `content/`.
