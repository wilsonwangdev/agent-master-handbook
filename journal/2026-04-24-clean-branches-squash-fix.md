---
date: 2026-04-24
type: tooling-fix
status: resolved
---

# clean-branches Incompatible with Squash Merge / clean-branches 与 Squash Merge 不兼容

## What Happened / 发生了什么

After merging all 5 PRs via squash merge, `npm run clean-branches` failed to delete any local branches. The `--merged` flag checks if a branch's commits are ancestors of `origin/main`, but squash merge creates new commits — the original branch commits are never on main.

5 个 PR 通过 squash merge 合并后，`npm run clean-branches` 未能删除任何本地分支。`--merged` 标志检查分支的提交是否是 `origin/main` 的祖先，但 squash merge 创建新提交——原始分支提交永远不在 main 上。

## Fix / 修复

Switched detection from `--merged` to `[gone]` upstream tracking. After `git fetch -p`, branches whose remote was deleted show `[gone]` in their tracking status. This works regardless of merge strategy.

将检测方式从 `--merged` 改为 `[gone]` 上游追踪。`git fetch -p` 后，远程已删除的分支在追踪状态中显示 `[gone]`。这与合并策略无关。

## Evolution / 进化记录

- When choosing a merge strategy (spec 004), also verify that branch cleanup tooling is compatible / 选择合并策略时，同时验证分支清理工具的兼容性
- The `[gone]` detection pattern is more robust than `--merged` for any merge strategy / `[gone]` 检测模式对任何合并策略都更健壮
