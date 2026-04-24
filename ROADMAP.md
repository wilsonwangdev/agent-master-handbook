# Roadmap

Current status and next steps for agent-master. Each item links to a GitHub issue when created.

## Now

- [x] Merge foundational PRs (#2 infra, #3 rules, #4 design, #5 contributing, #6 spec)
- [x] Enable GitHub Pages deployment
- [x] Fix site base path for GitHub Pages (#9)
- [x] Fix clean-branches for squash merge (#7)
- [x] Upgrade typography (#10)
- [x] Add dev server and watch mode (#11)
- [x] Site enhancement plan — SEO, GEO, navigation, RSS, quality governance (SPEC 005, #27)
- [x] Add meta descriptions to all content (#28)
- [x] SEO foundation: canonical, hreflang, OG, JSON-LD, backup-domain noindex (#29)
- [x] Discovery artifacts: sitemap.xml, robots.txt, RSS, llms.txt, sitemap.md (#30)
- [x] Breadcrumb navigation and contribution entry points (#31)
- [x] Build engineering cleanup: site config, parallelization, constant extraction (#32)
- [x] First verified skill definition: build code review (#33)
- [x] Skills ecosystem guide (EN+ZH) (#34)
- [x] Make AGENTS.md the canonical entry point with symlinks (#14)
- [x] Add pre-work checklist to prevent PR scope creep (#13)
- [ ] Merge remaining PRs (#13, #14, #15, #16)
- [x] GEO: per-page Markdown output and `<link rel="alternate" type="text/markdown">` (SPEC 005 Phase 7 remainder)
- [x] Lighthouse baseline evaluation and targeted remediation (SPEC 005 Phase 8)
- [x] Journal: record premature optimization lesson from build.mjs parallelization

## Next

- [ ] Add multi-agent collaboration guide: document how different agents (Claude Code, Cursor, Codex, Windsurf) interact with AGENTS.md and the symlink strategy
- [ ] Add external-system diagnosis playbook: recent commits → official CLI/MCP → docs → inference
- [ ] Add MCP concept article (EN+ZH)
- [ ] Add Prompt Engineering concept article (EN+ZH)
- [ ] Curate more articles: Anthropic managed agents, agent evals
- [ ] Add AI Native workflow guide (EN+ZH)
- [ ] Light/dark theme toggle (currently dark-only with prefers-color-scheme fallback)
- [ ] Git conflict prevention guide: conflict-prone code patterns, lint-enforced refactoring thresholds, agent-workflow-specific strategies
- [ ] Proactive agent review guide: how to make agents surface code smells without human prompting (skills, hooks, lint rules)

## Later

- [ ] Multi-agent orchestration patterns: how multiple agents collaborate on the same repo (concurrent PRs, conflict resolution, shared context)
- [ ] Client-side search for the site
- [ ] Expand submodule references
- [ ] Community contribution workflow validation
- [ ] Explore MCP server integration for content management
- [ ] i18n beyond EN/ZH
- [ ] Evaluate lightweight framework (Astro, Eleventy) if build.mjs complexity exceeds maintainability threshold — also resolves cross-platform dev server (see journal/2026-04-24-github-pages-deployment.md for trigger conditions)

## Principles

- Items move from Later → Next → Now as they become relevant
- Each item should be small enough for one PR
- Agent contributors can pick any unclaimed item from Now or Next
- When completing an item, check the box and link the PR
