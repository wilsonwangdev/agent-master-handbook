---
title: "Making Agents Proactively Review Their Own Code"
description: "How to use skills, hooks, and lint rules to make AI agents surface code smells without waiting for human reviewers to point them out."
lang: en
pair: zh.md
lastUpdated: 2026-05-07
status: draft
---

# Making Agents Proactively Review Their Own Code

Agents write working code. But "working" is not the same as "good." The gap between the two is where code smells accumulate — sequential awaits that could be parallel, hardcoded constants, growing function signatures, premature abstractions. Human reviewers catch these. Agents don't, unless the environment tells them to look.

This guide covers three mechanisms for closing that gap.

## The Problem: Context Priority

When an agent is executing "add sitemap generation," its attention is on making the sitemap work. It is not simultaneously thinking about whether the new code introduces a hardcoded string, whether the function call it just extended is now conflict-prone, or whether the build file is approaching a complexity threshold.

This is not a capability limitation. The agent can analyze code quality when asked. The problem is that nothing in the default workflow asks.

## Mechanism 1: Post-Change Skills

A skill is a structured checklist that an agent runs after completing a task. It shifts the agent's perspective from "implement the feature" to "review what I just wrote."

A build-focused review skill typically checks for things like:
- Independent `await` calls that could be `Promise.all`
- String literals appearing more than once
- Render or template calls with long and growing argument lists
- Duplicated filtering or mapping logic
- A build file approaching a project-specific size or complexity threshold

The skill doesn't fix anything. It surfaces findings so the decision to refactor is explicit.

> **Example from this project:** `skills/build-code-review/SKILL.md` instantiates this pattern for `build/build.mjs` with concrete thresholds (e.g., a ~300-line ceiling). Other projects should pick thresholds that match their own build layer.

### When to use

After modifying files in a specific domain (build system, API layer, test infrastructure). The skill should be domain-specific, not generic — a "review everything" skill is too broad to be useful.

### How to trigger

Today: list the skill and its trigger files in the project's agent instructions (e.g., AGENTS.md, CLAUDE.md, .cursorrules). The agent reads this instruction and runs the skill after matching file changes.

Future: hooks that automatically invoke the skill after relevant file changes.

## Mechanism 2: Hooks

Hooks are automated triggers that run without human prompting. They are the strongest mechanism because they don't depend on the agent remembering to do something.

### Common hook points

Most agent runtimes expose a few hook points:
- after an editor tool call (e.g., file write or edit)
- after a git commit
- before a tool that touches a sensitive surface

A post-edit hook scoped to a specific directory (for example, the build layer) can automatically run the matching review skill whenever a file in that directory changes.

> **Example from this project:** A post-edit hook scoped to `build/**` triggers the build code review skill. Agent Skills–compatible runtimes such as Claude Code expose `PostToolUse` and `PostCommit` hook points; other agents may use different names but follow the same pattern.

### Limitations

- Hooks add latency to every matching operation
- Overly broad hooks create noise and slow down the workflow
- Hook configuration requires explicit permission (agents cannot self-modify their own hooks)

### Recommendation

Start with skills (manual trigger). Promote to hooks only after a skill has proven its value over multiple sessions. This avoids the premature-automation trap.

## Mechanism 3: Lint Rules

Lint rules are the most reliable mechanism because they run at build time, are deterministic, and don't depend on agent behavior.

Relevant rules for agent-written code:

- `max-params` (ESLint): flag functions with more than N parameters. Forces object destructuring, which reduces merge conflicts and improves readability.
- `no-await-in-loop` (ESLint): catches sequential awaits inside loops that could be parallelized.
- Custom rules for project-specific patterns (e.g., "no hardcoded URLs in template files").

### The connection to conflict prevention

Many lint rules that improve code quality also reduce merge conflict frequency. This is not a coincidence — the same patterns that make code hard to review also make it hard to merge.

## Layering the Three Mechanisms

The three mechanisms form a progression:

1. **Lint rules** catch deterministic, pattern-matchable issues at build time
2. **Skills** catch judgment-dependent issues that require context (is this complexity justified? is this the right abstraction?)
3. **Hooks** automate skills that have proven their value

Don't start with hooks. Start with a skill, validate it catches real issues, then consider automation.

## What Agents Still Can't Do

Even with all three mechanisms, agents struggle with:

- Recognizing when a refactoring has no measurable impact at current scale
- Judging whether a pattern is "growing toward a problem" versus "already a problem"
- Knowing when to record a signal for later versus acting immediately

These require human judgment. The goal is not to eliminate human review, but to reduce the number of issues that reach human review by catching the mechanical ones earlier.
