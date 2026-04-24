---
date: 2026-04-24
type: process-failure
status: resolved
---

# Repeating Failed Paths Due to Missing Commit Review / 因缺少提交记录审查而重复失败路径

## What Happened / 发生了什么

When investigating Vercel Analytics, the agent did not first inspect recent commits on `origin/main`. The branch was behind remote, which should have been treated as a strong signal of prior attempts. Later inspection revealed 4 relevant commits:
- add `@vercel/analytics`
- integrate analytics in base.html
- remove `@vercel/analytics`
- simplify script

This showed the user had already tried both major approaches. The agent nonetheless re-explored those same paths.

调查 Vercel Analytics 时，agent 没有先检查 `origin/main` 的最近提交。本地分支落后远程，这本应被视为 prior attempts 的强信号。事后检查发现了 4 个相关提交，说明用户已经尝试过两种主要路线，而 agent 仍重复了这些路径。

## Root Cause / 根因

The harness required branch hygiene but did not require commit-history review as part of external-system diagnosis. There was no rule forcing the agent to treat recent commits as diagnostic evidence.

当前 harness 要求分支卫生，但未要求在外部系统诊断中审查提交历史。没有规则强制 agent 将最近提交视为诊断证据。

## Fix / 修复

- AGENTS.md now requires `git log --oneline -10` before starting work
- Added `rules/external-system-diagnosis.md` with strict order: local evidence → official tools → official docs → inference
- Tightened content admission so project-specific incidents don't drift into public site content

## Evolution / 进化记录

- `main behind remote` is not a routine state; it is a diagnostic hint / 本地 main 落后远程不是常规状态，而是诊断线索
- For external systems, recent commits often contain more truth than generic docs / 对外部系统问题，最近提交往往比通用文档包含更多真实信息
