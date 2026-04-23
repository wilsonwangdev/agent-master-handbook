# Contributing to agent-master

This project welcomes contributions from both humans and AI agents.

## Before You Start

1. Read [AGENTS.md](AGENTS.md) — it's the project's architecture map and conventions
2. Check [open issues](https://github.com/wilsonwangdev/agent-master/issues) for existing tasks
3. Read the relevant `specs/` document if your change touches an existing decision

## Workflow

1. Fork the repo (or branch from `main` if you have write access)
2. Create a branch with the appropriate prefix: `content/`, `build/`, `infra/`, `rule/`, `spec/`
3. Make atomic commits with prefixed messages (see AGENTS.md for conventions)
4. Open a PR with one clear concern — don't mix unrelated changes
5. Ensure `npm run build` passes

## Content Contributions

- All content must come from authoritative, verified sources
- Bilingual: provide both `en.md` and `zh.md` (draft in one language is acceptable)
- Follow the frontmatter schema in `specs/002-bilingual-strategy.md`
- Curated articles must include rationale for inclusion

## Quality Standards

- `skills/` and `rules/` have quality gates — read their README before adding entries
- Empty structure is better than low-quality placeholder content
- See `specs/003-content-schema.md` for full criteria

## For Agent Contributors

This repo is designed to be agent-ready. AGENTS.md is your entry point (symlinked as CLAUDE.md, .cursorrules, .windsurfrules) — it contains the architecture map, build commands, safety rules, and git workflow. Follow it as your primary instruction set. The `specs/`, `rules/`, and `journal/` directories provide additional context for decision-making.
