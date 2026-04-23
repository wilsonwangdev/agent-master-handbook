---
date: 2026-04-24
type: workflow-adaptation
status: resolved
---

# Agent Adapted to Branch Protection / Agent 适应分支保护策略

## What Happened / 发生了什么

After successfully creating the repo and pushing the initial commit via `gh repo create --push`, a subsequent `git push origin main` was rejected by environment policy — direct pushes to the default branch bypass PR review.

在通过 `gh repo create --push` 成功创建仓库并推送初始提交后，后续的 `git push origin main` 被环境策略拒绝。原因：直接推送到默认分支绕过了 PR 审查流程。

## Adaptation / Agent 的适应过程

1. Recognized this as a workflow policy constraint, not a technical failure / 识别到这不是技术故障，而是工作流策略约束
2. Switched to branch+PR workflow: `git checkout -b content/phase2-seed` / 立即切换到分支+PR 工作流
3. Pushed to feature branch and created PR via `gh pr create` / 推送到特性分支并通过 `gh pr create` 创建 PR
4. The PR itself becomes a human review boundary / PR 本身成为了人类审查的边界点

## Evolution / 进化记录

- Default to branch+PR workflow even for new repos / 即使是新仓库，也应默认使用分支+PR 工作流
- `gh repo create --push` is for initial commit only; subsequent changes go through PRs / `gh repo create --push` 适用于初始提交，后续变更应走 PR 流程
- Aligns with AI Native principles: atomic changes + reviewable change records / 与 AI Native 原则一致：原子化变更 + 可审查的变更记录
- Branch naming should follow commit prefix convention (`content/`, `infra/`, `build/`) / 分支命名约定应与提交前缀一致
