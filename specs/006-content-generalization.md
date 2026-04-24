---
id: "006"
title: "Content Generalization — Separating Universal Guidance from Project-Specific Practice"
status: accepted
created: 2026-04-25
---

# SPEC 006: Content Generalization

## Problem

The project serves two audiences through the same artifacts:

1. **External readers** — practitioners looking for universal agent-ready / harness engineering guidance
2. **Project agents** — AI agents operating within this specific repository

Content, skills, and rules currently mix project-specific details (file names, scripts, config objects) with universal principles. This creates three problems:

- Guides read like project documentation rather than reusable knowledge
- Skills and rules reference project-specific tooling, making them non-portable
- Agent context files contain universal advice that should be in content, and project-specific instructions that should stay in agent context

## Three-Layer Model

All artifacts in this project belong to exactly one of three layers:

### Layer 1: Universal Content (`content/`)

Audience: any practitioner, any project.

Rules:
- No references to `agent-master`, `build.mjs`, `SITE` config, `npm run clean-branches`, or any project-specific file/script
- Use generic examples: "your build script", "the project's entry point", "a config object"
- When illustrating a concept with a real example, use clearly marked callout blocks (e.g., "Example from a static site project:") rather than weaving project details into the main narrative
- The test: could someone with a completely different tech stack read this and find it useful?

### Layer 2: Distributable Tools (`skills/`, `rules/`, quickstart prompt)

Audience: practitioners who want to adopt specific practices in their own projects.

Rules:
- Must work in any repository without modification, OR clearly document what needs to be adapted
- No hardcoded file paths, script names, or project-specific config references
- Use parameterized descriptions: "your build directory", "the project's config file"
- Skills that are inherently project-specific (e.g., checking `build.mjs` line count) belong in Layer 3, not here
- The test: could someone install this skill into a different project and have it work?

### Layer 3: Project Practice (`AGENTS.md`, `journal/`, `.claude/`, project-specific skills)

Audience: agents and humans working on this specific repository.

Rules:
- Can and should reference specific files, scripts, and conventions
- This is where `build.mjs`, `npm run clean-branches`, `SITE` config, Lighthouse baselines, etc. belong
- Journal entries naturally reference project specifics — this is correct
- AGENTS.md is inherently project-specific — this is correct
- The test: does this only make sense in the context of this repository?

## Current Violations

### Content that should be generalized

| File | Issue |
|------|-------|
| `content/guides/skills-ecosystem/` | "For agent-master, skills should be treated as both..." — project name in universal guide |
| `content/guides/proactive-agent-review/` | "Example: `skills/build-code-review.md` in this project checks for..." — project-specific skill reference |
| `content/guides/proactive-agent-review/` | References to `build/*` files and PostToolUse hooks on specific paths |

### Skills that should be split or parameterized

| File | Issue |
|------|-------|
| `skills/build-code-review.md` | References `build/build.mjs`, `SITE` config object, 300-line threshold — all project-specific |

This skill should be split into:
- A **generic build review skill** (Layer 2) with parameterized paths and thresholds
- A **project-specific instance** (Layer 3) that fills in the parameters for this repo

### Rules that should be parameterized

| File | Issue |
|------|-------|
| `rules/git-workflow.md` | `npm run clean-branches` is a project-specific script |

The rule's principles are universal; the specific commands should be marked as "adapt to your project."

## Implementation Plan

### Phase 1: Add layer markers to AGENTS.md

Add a "Content Layers" section to AGENTS.md explaining the three-layer model. This gives agents the context to make correct layer decisions when creating new content.

### Phase 2: Generalize existing content

For each guide in `content/guides/`:
- Replace project-specific references with generic descriptions
- Move project-specific examples into clearly marked callout blocks
- Ensure the main narrative reads as universal guidance

### Phase 3: Split skills into generic + project-specific

- Create a generic `skills/build-review.md` that works for any project
- Keep a project-specific version in `.claude/skills/` or reference it from AGENTS.md
- Same pattern for any future skills

### Phase 4: Parameterize rules

- Mark project-specific commands in rules with "adapt to your project" annotations
- Keep the universal principles as the main content

## Boundary Principle

When in doubt about which layer something belongs to, ask:

> If I copy this file into a completely different project, does it still make sense?

- Yes → Layer 1 or Layer 2
- Only with adaptation → Layer 2 (with clear adaptation notes)
- No → Layer 3

## Abstraction Level Principle

The three-layer model defines WHERE content goes. This principle defines HOW it is written.

Layer 1 and Layer 2 content must describe **intent**, not **implementation**. Binding to a specific tool turns universal guidance into a single-vendor instruction that breaks when the reader uses a different stack.

### Pattern: Intent + Adaptation

Instead of:

```
Run `gh pr list --state open` to check for conflicting PRs.
```

Write:

```
Check if any open merge/pull request has conflicts.
(GitHub: `gh pr list`, GitLab: `glab mr list`, Bitbucket: `bb pr list`)
```

The intent ("check for conflicting PRs") is universal. The implementation varies by platform.

### Where this applies

- **Git hosting**: GitHub / GitLab / Bitbucket — CLI commands, PR/MR terminology, CI systems
- **Package managers**: npm / pnpm / yarn / bun — scripts, install commands, lockfiles
- **Agent tools**: Claude Code / Cursor / Windsurf / Codex — config file names, skill formats, hook mechanisms
- **Languages and frameworks**: Node / Python / Go — build commands, test runners, project structure conventions

### Where specificity is acceptable

- Layer 3 (project practice): always specific — that's its purpose
- Layer 2 adaptation notes: specific commands inside clearly marked "adapt to your project" blocks
- Layer 1 callout blocks: specific examples inside clearly marked "Example from a [type] project:" blocks

### The tension

More abstract = more portable but less actionable.
More specific = more actionable but less portable.

The resolution is not to pick one extreme. It is to **lead with intent, follow with implementations**. The reader gets the universal principle first, then finds their specific tool in the adaptation notes.

## Distributable Isolation Principle

This project is both a knowledge base ABOUT agent-ready practices AND a repository that PRACTICES them. This creates a risk: distributable artifacts (templates, quickstart prompts, example configs) can collide with the project's own runtime files.

### The collision problem

If the project distributes an AGENTS.md template and also has its own AGENTS.md, an agent working in this repo cannot distinguish "this is an instruction I should follow" from "this is a template I should copy for the user."

### Rule: physical separation

Distributable templates and examples must live in a dedicated directory (e.g., `templates/` or `dist/`) that is:
- Clearly marked in AGENTS.md as "not project instructions — these are for distribution"
- Never symlinked or referenced as project configuration
- Excluded from agent tool auto-discovery paths (not named AGENTS.md, CLAUDE.md, .cursorrules at the repo root)

### Current state

The quickstart prompt (`build/data/quickstart.{en,zh}.md`) is safe — it is a prompt that tells an agent to CREATE files, not a file that could be mistaken for project configuration. But as the project grows to include more distributable artifacts, this principle must be enforced.

## Continuous Evolution Mechanism

The abstraction-vs-specificity balance is the core design tension of this project. It cannot be resolved once and frozen — it requires ongoing review as content grows and the ecosystem evolves.

### Abstraction Review Trigger

An abstraction review is triggered when any of the following occur:

1. A new guide, skill, or rule is added — the author must declare its layer and verify abstraction level before merge
2. A user or contributor reports that content is too project-specific or too abstract to be useful
3. A distributable artifact is found to reference project-specific tooling
4. The project adds support for a new platform or tool (e.g., adding GitLab CI support) — all existing Layer 1 and Layer 2 content must be audited for single-platform assumptions

### Review Process

When triggered:
1. Identify the affected files and their current layer assignment
2. Check each file against the Boundary Principle and Abstraction Level Principle
3. For violations: propose a concrete fix (generalize, split, or reclassify)
4. Record the review outcome in a journal entry if it reveals a systemic pattern

### Evolution Log

Significant abstraction decisions and their rationale should be recorded in `journal/` entries tagged as `type: abstraction-review`. This creates a traceable history of how the project's generalization stance evolves over time.

### Agent Guidance for Evolution

Add to AGENTS.md:

> This project's core tension is between abstraction (portability) and specificity (actionability). When writing Layer 1 or Layer 2 content, lead with intent, follow with platform-specific implementations. When you notice content that binds to a single tool or platform, flag it — even if you wrote it yourself in a previous session. The goal is not perfection but continuous improvement of the abstraction boundary.

## Agent Guidance

Add to AGENTS.md:

> When creating content, skills, or rules, identify which layer it belongs to before writing. Universal content must not reference project-specific files, scripts, or configurations. If you need to illustrate with a project example, use a clearly separated callout block.
