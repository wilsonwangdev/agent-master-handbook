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
