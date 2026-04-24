---
name: Git Workflow
type: rule
severity: high
verified: 2026-04-24
trigger: any git branch, commit, or PR operation
---

# Git Workflow / Git 工作流

## Rule / 规则

### Branches / 分支

- Branch from `main`, name with commit prefix convention: `infra/`, `content/`, `build/`, `rule/`
- One concern per branch. Never mix unrelated changes.
- Delete local branches after PR merge or close. Run `git fetch -p` to prune stale remote refs.
- Keep local `main` in sync: `git fetch origin && git branch -f main origin/main`

从 `main` 创建分支，使用提交前缀命名：`infra/`、`content/`、`build/`、`rule/`。
一个分支一个关注点，不混合无关变更。PR 合并或关闭后删除本地分支。

### Commits / 提交

- Atomic: one logical change per commit
- Prefixed message: `infra:`, `content:`, `build:`, `rule:`, `spec:`, `ref:`, `journal:`
- Message explains why, not what

原子化：每次提交一个逻辑变更。前缀式消息，解释为什么而非做了什么。

### Pull Requests / PR

- Never push directly to `main` — always branch + PR
- One concern per PR. If a PR description needs multiple unrelated sections, split it.
- PR title follows commit prefix convention

不直接推送 `main`——始终走分支 + PR。一个 PR 一个关注点。

### Hygiene / 卫生

- After PR merge: `npm run clean-branches` to delete all merged local branches
- Before starting work: `git fetch -p && git branch -v` to see stale branches
- Prefer automated cleanup commands over manual branch deletion

PR 合并后：`npm run clean-branches` 自动清理已合并的本地分支。开始工作前检查过期分支。优先使用自动化清理命令而非手动删除。

### Post-Merge Checklist / 合并后检查清单

After every PR merge, execute these steps before starting new work:

1. `git checkout main && git pull` — sync local main
2. `npm run clean-branches` — delete merged local branches
3. Update `ROADMAP.md` — check off the completed item with PR number
4. `gh pr list --state open` — check if any open PR now has conflicts; rebase if so
5. `git branch -r | grep -v main` — verify no stale remote branches accumulate

Skipping this checklist causes: stale ROADMAP, conflicting PRs discovered late, and branch clutter that confuses future agents.

每次 PR 合并后，在开始新工作前执行以下步骤：

1. `git checkout main && git pull` — 同步本地 main
2. `npm run clean-branches` — 删除已合并的本地分支
3. 更新 `ROADMAP.md` — 勾选已完成项并标注 PR 编号
4. `gh pr list --state open` — 检查是否有 open PR 因合并产生冲突，如有则 rebase
5. `git branch -r | grep -v main` — 确认没有过期远端分支堆积

跳过此清单会导致：ROADMAP 失真、冲突 PR 被延迟发现、分支混乱影响后续 agent 工作。
