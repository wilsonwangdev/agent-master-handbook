---
date: 2026-04-24
type: deployment-lesson
status: resolved
---

# GitHub Pages Deployment Lessons / GitHub Pages 部署经验

## Issues Encountered / 遇到的问题

1. **Pages not enabled**: CI workflow ran before Pages was enabled in repo settings, causing deploy-pages action to 404. Agent should have instructed the user to enable Pages before merging the CI workflow PR.

2. **Base path mismatch**: Project sites serve under `/<repo-name>/` prefix. All hardcoded absolute paths (`/assets/`, `/en/`) broke on deployment. CSS didn't load, language switching 404'd.

1. **Pages 未启用**：CI 工作流在仓库设置中启用 Pages 之前就运行了，导致 deploy-pages action 返回 404。Agent 应在合并 CI 工作流 PR 前指导用户启用 Pages。

2. **基础路径不匹配**：项目站点在 `/<repo-name>/` 前缀下服务。所有硬编码的绝对路径（`/assets/`、`/en/`）在部署后失效。CSS 无法加载，语言切换 404。

## Fixes / 修复

- `BASE_PATH` env var for path prefix injection (empty for local, `/agent-master` for CI)
- All templates use `{{base}}` variable instead of hardcoded `/`

## Evolution / 进化记录

- When adding CI/CD for GitHub Pages, include a checklist: (1) enable Pages in repo settings with source=GitHub Actions, (2) verify base path handling for project sites / 添加 GitHub Pages CI/CD 时，应包含检查清单：(1) 在仓库设置中启用 Pages 并选择 source=GitHub Actions，(2) 验证项目站点的基础路径处理
- Custom build systems must handle base path from day one — it's not an edge case for GitHub Pages project sites / 自定义构建系统必须从第一天就处理基础路径——对于 GitHub Pages 项目站点这不是边缘情况

## On Build System Complexity / 关于构建系统复杂度

The custom build system (`build.mjs`) is now handling: markdown parsing, frontmatter, bilingual routing, template rendering, base path injection, and asset copying. If further requirements emerge (search, pagination, RSS), consider evaluating whether a lightweight framework (Astro, Eleventy) would reduce maintenance burden. This should be tracked as a ROADMAP item, not an immediate action.

自定义构建系统（`build.mjs`）现在处理：markdown 解析、frontmatter、双语路由、模板渲染、基础路径注入和资源复制。如果出现更多需求（搜索、分页、RSS），应评估轻量框架（Astro、Eleventy）是否能降低维护负担。这应作为 ROADMAP 项跟踪，而非立即行动。
