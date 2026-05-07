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

- Branch from the project's default branch, named with a commit-prefix convention agreed on by the project (common prefixes: `infra/`, `content/`, `build/`, `rule/`, `fix/`, `feat/`).
- One concern per branch. Never mix unrelated changes.
- Delete local branches after PR merge or close. Run `git fetch -p` to prune stale remote refs.
- Keep the local default branch in sync: `git fetch origin && git branch -f <default> origin/<default>`.

从项目默认分支创建分支，使用项目约定的提交前缀命名（常见：`infra/`、`content/`、`build/`、`rule/`、`fix/`、`feat/`）。
一个分支一个关注点，不混合无关变更。PR 合并或关闭后删除本地分支。

### Commits / 提交

- Atomic: one logical change per commit
- Use a prefix convention (e.g. `infra:`, `content:`, `build:`, `rule:`, `spec:`, `ref:`, `journal:` — adapt to your project)
- Message explains why, not what

原子化：每次提交一个逻辑变更。前缀式消息（按项目约定调整），解释为什么而非做了什么。

### Pull Requests / PR

- Never push directly to the default branch — always branch + PR / MR
- One concern per PR. If a PR description needs multiple unrelated sections, split it.
- PR title follows the commit prefix convention

不直接推送默认分支——始终走分支 + PR / MR。一个 PR 一个关注点。

### Hygiene / 卫生

- Before starting work, sync with the remote and delete local branches whose upstreams have gone away.
- Prefer automated cleanup over manual branch deletion so the cadence is consistent across sessions.

> **Adapt to your project:** Projects should provide a cleanup command (e.g., `npm run clean-branches`, `make clean-branches`, or a shell alias) that wraps `git fetch -p` with deletion of merged/gone local branches. This repository exposes it as `npm run clean-branches`.

开始工作前：同步远端并删除上游已消失的本地分支。优先使用自动化清理命令而非手动删除。项目应当提供一条清理命令（例如 `npm run clean-branches`、`make clean-branches` 或 shell alias）。

### Pre-Work State Alignment / 开始工作前的状态对齐

PR merges happen on the remote at unknown times. Agents cannot detect them in-session. Therefore all state alignment must happen at the start of work, not "after merge."

Before creating a new branch, verify:

1. Sync with the remote and prune deleted branches (e.g., `git fetch -p` + the project's cleanup command)
2. Check out the default branch and pull the latest
3. Read the last ~10 commit messages on the default branch for recent context
4. Check the project's roadmap or task tracker — if recently merged work is not marked as done, update it now
5. List open PRs / MRs on the project's hosting platform — if any has merge conflicts, rebase it first

This catches all state drift regardless of when or by whom PRs were merged.

> **Adapt to your project:** Platform commands vary — GitHub: `gh pr list --state open`; GitLab: `glab mr list --state opened`; Bitbucket: `bb pr list`; Gerrit / self-hosted: consult the local CLI. The principle is the same: enumerate open review units, confirm none is blocked by conflicts.

PR 合并发生在远端的未知时间，agent 在会话中无法感知。因此所有状态对齐必须在开始工作时进行，而不是"合并后"。

创建新分支前，验证：

1. 同步远端并清理已删除的分支（例如 `git fetch -p` + 项目清理命令）
2. 切到默认分支并拉取最新
3. 阅读默认分支最近 10 条提交信息以获取上下文
4. 检查项目的 roadmap 或任务追踪 — 如果最近合并的工作未标记完成，立即更新
5. 列出托管平台上的 open PR / MR — 如果有任何一个存在合并冲突，先 rebase

无论 PR 何时、由谁合并，此流程都能捕捉状态漂移。

> **适配说明：** 平台命令不同 — GitHub：`gh pr list --state open`；GitLab：`glab mr list --state opened`；Bitbucket：`bb pr list`；Gerrit / 自建：查阅本地 CLI。原则一致：枚举 open review 单元，确认没有因冲突被阻塞的。
