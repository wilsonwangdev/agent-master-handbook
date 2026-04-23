---
date: 2026-04-24
type: process-failure
status: resolved
---

# Repeated PR Scope Creep Despite Existing Rules / 尽管已有规约仍重复出现 PR 范围蔓延

## What Happened / 发生了什么

PR #8 mixed four unrelated concerns (base path fix, font upgrade, dev command, journal entry) and had to be closed and re-split into PRs #9-#12. This is the second time this happened (first was PR #1). Additionally, stale local branches were not cleaned before starting new work, violating the git workflow rule.

PR #8 混合了四个无关关注点（路径修复、字体升级、dev 命令、journal 条目），不得不关闭并重新拆分为 #9-#12。这是第二次发生（第一次是 PR #1）。此外，开始新工作前未清理过期本地分支，违反了 git 工作流规约。

## Root Cause / 根因

CLAUDE.md had the rules but lacked enforcement timing. "One concern per PR" was stated as a principle, not as a pre-work checkpoint. The agent followed a pattern of: write code → realize scope is mixed → close and re-split. The correct pattern is: plan PR boundaries → then write code.

CLAUDE.md 有规则但缺少执行时机。"一个 PR 一个关注点"被表述为原则而非工作前检查点。Agent 遵循的模式是：写代码 → 发现范围混合 → 关闭并重新拆分。正确的模式是：规划 PR 边界 → 然后写代码。

## Fix / 修复

Updated CLAUDE.md Git Workflow section with explicit "Before starting any work" checklist:
1. Clean stale branches
2. Plan PR boundaries — list each concern as a separate PR BEFORE coding
3. Single-sentence test for each planned PR

更新了 CLAUDE.md Git Workflow 部分，加入明确的"开始任何工作前"检查清单。

## Evolution / 进化记录

- Rules without enforcement timing are suggestions, not constraints / 没有执行时机的规则是建议而非约束
- The pre-work checklist must be at the top of the workflow section, not buried in bullet points / 工作前检查清单必须在工作流部分的顶部，而非埋在要点列表中
- Agent self-discipline requires procedural prompts, not just declarative rules / Agent 自律需要程序性提示，而非仅声明性规则
