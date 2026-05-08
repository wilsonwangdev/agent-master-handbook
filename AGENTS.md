# Agent Master Handbook

An AI Native handbook for agent practitioners. Both a learning resource and deployable infrastructure for making any agent environment agent-ready.

## Project Architecture

```
content/     — Source content (Markdown, bilingual EN/ZH)
  concepts/  — Core concept articles (harness engineering, context engineering, etc.)
  guides/    — Practical how-to guides
  curated/   — Curated blog articles with commentary
  evangelism/ — AI Native evangelism content
specs/       — SPEC-driven engineering documents
skills/      — Agent-usable skill definitions (quality-gated)
rules/       — Agent rules and constraints (quality-gated)
references/  — Git submodules to authoritative external repos
journal/     — Failure records and agent evolution log
build/       — Static site build system (Node ESM, marked only)
site/        — Generated output (gitignored)
```

## Setup

```bash
npm install       # also activates git hooks via husky
npm run build     # generates site/ from content/
npm run dev       # build + local preview at http://localhost:3000
npm run watch     # auto-rebuild on content/ or build/ changes (run in separate terminal)
```

Local development: run `npm run watch` in one terminal, `npm run dev` in another, refresh browser after rebuild. Note: `npm run dev` uses `python3 http.server` (pre-installed on macOS/Linux; Windows users need Python installed or can use `npx serve site` as alternative). Cross-platform dev server is tracked in ROADMAP under framework evaluation.

## Safety

- `.gitguard` contains patterns that pre-commit hook (husky) will reject.
- Never write usernames, emails, tokens, or account names from tool output into project files.
- When PII is discovered, add the pattern to `.gitguard` before committing.
- See `rules/pii-protection.md` for the full rule.

## Git Workflow

### Before starting any work

1. `git fetch -p` — sync remote state and prune deleted branches
2. `npm run clean-branches` — delete merged local branches
3. `git checkout main && git pull` — ensure main is up to date before branching
4. `git log --oneline -10` — read recent commits for context on what changed, especially if main was behind remote (signals prior attempts by humans or other agents)
5. Check ROADMAP.md — if any recently merged PRs are not checked off, update it now before starting new work
6. `gh pr list --state open` — check if any open PR has conflicts; if so, rebase it before creating a new branch
7. Plan PR boundaries: list each independent concern as a separate PR BEFORE writing code. If a task touches unrelated files (e.g. path fix + font change + new command), it is multiple PRs.
8. Check file overlap between planned PRs. If two PRs modify the same file, declare dependency and define merge order. The later PR rebases after the earlier one merges.

### Pre-work checklist (run before writing code)

Before creating a branch, verify:

- [ ] Can you describe the change in one sentence without "and"? If not, split it.
- [ ] Does this change have measurable impact at current scale? If not, record the signal for later instead of acting now.
- [ ] Have you checked if a community skill already solves this? (skills.sh, Claude Code skills, cursor.directory)
- [ ] Will this change affect Lighthouse scores? If touching CSS, templates, or fonts, review the Quality Baseline in this file.
- [ ] After modifying `build/`, will you run the build code review skill (`skills/build-code-review/SKILL.md`)?
- [ ] After modifying CSS, templates, or interactive components, will you run the frontend interaction review skill (`skills/frontend-interaction-review/SKILL.md`)?

### When diagnosing external system issues (Vercel, GitHub Actions, analytics, MCP, etc.)

1. First: inspect recent commits and diffs — prior attempts are evidence, not noise
2. Then: use official CLI tools (`vercel`, `gh`, etc.) or MCP servers to query real state
3. Then: consult official documentation
4. Last resort: inference and experimentation
- Never skip steps 1-2 and jump to guessing. See `rules/external-system-diagnosis.md`.

### Branch and PR rules

- Never push directly to `main`. Always: branch → commit → push → PR.
- Branch from `main`, name with prefix: `infra/`, `content/`, `build/`, `rule/`, `spec/`
- One concern per branch and per PR. Test: can you describe it in one sentence without "and"?
- Atomic commits: one logical change, prefixed message explaining why.
- After PR merge: `npm run clean-branches`
- See `rules/git-workflow.md` and `specs/004-pr-boundaries.md` for full rules.

## Content Conventions

- Each content piece lives in its own directory with `en.md` and `zh.md`
- Frontmatter: `title`, `lang`, `pair`, `lastUpdated`, `status` (draft|published)
- All content must come from authoritative, verified sources
- For external information, prefer primary sources (official docs, standards, author blogs, original posts, source repos) and keep claims traceable
- Avoid copying or restating large secondary summaries when a curated link-first entry point would serve better
- The handbook should aggregate, contextualize, and guide readers to source ecosystems — not become a stale duplicate of them
- Empty structure > low-quality placeholder content

### Content Layers (see SPEC 006)

All artifacts belong to one of three layers. Identify the layer before writing:

- **Layer 1 — Universal Content** (`content/`): No project-specific references. Must be useful to any practitioner with any tech stack. Use generic examples; if illustrating with this project, use a clearly marked callout block. For ecosystem or externally-derived information, prefer curated summaries with explicit primary-source links over copied secondary explanations.
- **Layer 2 — Distributable Tools** (`skills/`, `rules/`, quickstart prompt): Must work in any repo without modification, or clearly document what to adapt. No hardcoded paths or scripts.
- **Layer 3 — Project Practice** (`AGENTS.md`, `journal/`, `.claude/`): Can and should reference specific files, scripts, and conventions of this repository.

Abstraction vs specificity is this project's core tension. For Layer 1 and Layer 2, lead with intent, then offer platform-specific implementations as adaptation notes. If you notice a guide, skill, or rule binding itself to a single tool or platform, flag it — even if you wrote it in a previous session.

## Commit Conventions

Atomic commits with prefixes:
- `content:` — content additions or edits
- `build:` — build system changes
- `infra:` — project infrastructure (CI/CD, settings, configs)
- `skill:` — skill definitions
- `rule:` — rule definitions
- `spec:` — SPEC documents
- `ref:` — reference/submodule updates
- `journal:` — failure records and evolution notes

## Key Pointers

- Specs define decisions before implementation → `specs/`
- Skills and rules have quality gates → see their README files
- Journal captures failures for agent self-evolution → `journal/`
- Roadmap shows what to work on next → `ROADMAP.md`
- Contribution guidelines → `CONTRIBUTING.md`
- This repo dogfoods its own practices

## Post-Change Review

After modifying files under `build/`, run the build code review skill (`skills/build-code-review/SKILL.md`) to check for code smells before committing. This catches issues like unparallelized awaits, hardcoded constants, and growing function signatures that agents tend to miss during feature-focused work.

Project-specific parameters for the build code review skill:
- **Build directory**: `build/`
- **Main build file**: `build/build.mjs` (ceiling ~300 lines)
- **Object-parameter key threshold**: ~8 keys before extracting a helper
- **Centralized config**: `SITE` object in `build/build.mjs` (sourced from `package.json`)

After modifying CSS, templates, or interactive components, run the frontend interaction review skill (`skills/frontend-interaction-review/SKILL.md`) to check for tooltip clipping, overflow conflicts, hover affordance gaps, missing transitions, and responsive parity.

## Quality Baseline

Lighthouse CI runs on every PR. Current baseline (2026-04-24): Performance 100, Accessibility 100, Best Practices 96, SEO 100.

When modifying CSS, templates, or font loading:
- `--muted` color must maintain ≥ 4.5:1 contrast ratio against `--bg`
- Links in text content must be distinguishable without color (underline)
- Google Fonts must load non-blocking (preload + media="print" onload pattern)
- Do not add render-blocking resources to `<head>`
- Spacing, border widths, and colors in CSS must reference `--space-*`, `--border-*`, and color tokens. Bare `rem`/`px` literals for margin, padding, gap, or border-width are a review finding. See `content/guides/css-variable-consistency/en.md` for the rationale.
- When adding or changing a divider-style border, audit all existing dividers in the file as a set. Mixed widths (1px vs 2px) or mixed color tokens (`--border` vs `--border-bright`) count as inconsistency.
- Dark-theme pages must inline the critical `background`/`color` CSS in `<head>` with a light-mode media-query fallback. Without it, first paint flashes white (FOUC) while the external stylesheet arrives.

When modifying content frontmatter, JSON-LD, `robots.txt`, or `llms.txt` generation:
- Curated entries must keep a `source:` field in frontmatter pointing to the original URL. The build emits it as `citation` / `isBasedOn` in JSON-LD so AI answer engines can trace claims back to primary sources.
- New content sections must be mapped in `SECTION_SCHEMA` (`build/build.mjs`) to a schema.org type. Default `Article` is acceptable only for sections without a better fit.
- `robots.txt` explicitly allow-lists AI training and search crawlers (`GPTBot`, `ClaudeBot`, `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Perplexity-User`, `Google-Extended`, etc.). Do not replace this with a bare `User-agent: *` — explicit listing is a signal, not redundancy.
- Author and publisher identity live in `package.json` (`author`, `displayName`, `homepage`). Do not hardcode these in templates or build.mjs.
