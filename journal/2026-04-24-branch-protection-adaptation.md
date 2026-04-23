---
date: 2026-04-24
type: workflow-adaptation
status: resolved
---

# Agent 适应分支保护策略

## 发生了什么

在通过 `gh repo create --push` 成功创建仓库并推送初始提交后，后续的 `git push origin main` 被环境策略拒绝。原因：直接推送到默认分支绕过了 PR 审查流程。

## Agent 的适应过程

1. 识别到这不是技术故障，而是工作流策略约束
2. 立即切换到分支+PR 工作流：`git checkout -b content/phase2-seed`
3. 推送到特性分支并通过 `gh pr create` 创建 PR
4. PR 本身成为了人类审查的边界点

## 进化记录

- 即使是新仓库，也应默认使用分支+PR 工作流，而非直接推送 main
- `gh repo create --push` 适用于初始提交，后续变更应走 PR 流程
- 这与 AI Native 原则一致：原子化变更 + 可审查的变更记录
- 分支命名约定应与提交前缀一致（如 `content/`、`infra/`、`build/`）
