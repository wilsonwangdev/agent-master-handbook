# Roadmap

Current status and next steps for Agent Master Handbook. Each item links to a GitHub issue when created.

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
- [x] Add pre-work checklist to prevent PR scope creep (#13, #43)
- [x] Journal PR conflict prediction failure (#15)
- [x] Fix dev server 404 using python3 http.server (#16)
- [x] GEO: per-page Markdown output and `<link rel="alternate" type="text/markdown">` (#37)
- [x] Lighthouse baseline evaluation and targeted remediation (#38, #40)
- [x] Journal: record premature optimization lesson from build.mjs parallelization (#36)
- [x] Quickstart prompt with copy button on homepage (#46)
- [x] Pre-work state alignment rule (#48)
- [x] Content generalization model — SPEC 006 (#50)
- [x] Homepage agent-practice timeline (#52)
- [x] Rename brand to Agent Master Handbook (#53)
- [x] Unify site metadata into package.json (#54)
- [x] Align skills to Agent Skills standard, add frontend interaction review (#55)
- [x] Skills ecosystem guide standards and distribution expansion (#56)
- [x] Handbook traceability cleanup for skills ecosystem (#57)
- [x] Content page UX — dedupe title, heading anchors, spacing, FOUC prevention (#58)

## Next

- [ ] Content generalization Phase 2: generalize existing guides per SPEC 006
- [ ] Content generalization Phase 3: split skills into generic + project-specific
- [ ] Content generalization Phase 4: parameterize rules
- [ ] Add multi-agent collaboration guide: document how different agents (Claude Code, Cursor, Codex, Windsurf) interact with AGENTS.md and the symlink strategy
- [ ] Add external-system diagnosis playbook: recent commits → official CLI/MCP → docs → inference
- [ ] Add MCP concept article (EN+ZH)
- [ ] Add Prompt Engineering concept article (EN+ZH)
- [ ] Curate more articles: Anthropic managed agents, agent evals
- [ ] Add AI Native workflow guide (EN+ZH)
- [ ] Light/dark theme toggle (currently dark-only with prefers-color-scheme fallback)
- [x] Git conflict prevention guide (EN+ZH) (#44)
- [x] Proactive agent review guide (EN+ZH) (#45)

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
