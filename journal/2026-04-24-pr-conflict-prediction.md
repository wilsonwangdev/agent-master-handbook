---
date: 2026-04-24
type: process-failure
status: resolved
---

# PR Conflict Not Predicted During Split / PR 拆分时未预测到冲突

## What Happened / 发生了什么

PR #9 (base path fix) and #10 (typography) both modified `build/templates/base.html`. After #9 merged, #10 had a merge conflict. This was predictable — both PRs were created from the same base and touched the same file — but the agent didn't check for file overlap when planning the split.

PR #9（路径修复）和 #10（字体）都修改了 `build/templates/base.html`。#9 合并后 #10 产生冲突。这是可预测的——两个 PR 从同一基础创建且修改了同一文件——但 agent 在规划拆分时没有检查文件重叠。

## Fix / 修复

Added step 4 to CLAUDE.md pre-work checklist: check file overlap between planned PRs, declare dependency and merge order if overlap exists.

在 CLAUDE.md 工作前检查清单中增加第 4 步：检查计划 PR 之间的文件重叠，如有重叠则声明依赖和合并顺序。

## Evolution / 进化记录

- File overlap analysis is trivial: `git diff --name-only main..branch` for each planned PR, then intersect / 文件重叠分析很简单：对每个计划 PR 执行 `git diff --name-only`，然后取交集
- When splitting a mixed PR, the split itself needs the same rigor as creating new PRs / 拆分混合 PR 时，拆分本身需要与创建新 PR 同样的严谨性
