---
name: External System Diagnosis
type: rule
severity: high
verified: 2026-04-24
trigger: any issue involving external platforms (Vercel, GitHub Actions, analytics, MCP servers, third-party APIs)
---

# External System Diagnosis / 外部系统诊断

## Rule / 规则

When diagnosing issues with external systems, follow this strict order. Do not skip steps.

遇到外部系统问题时，严格按以下顺序执行，不得跳步。

### 1. Local evidence first / 先看本地证据

- `git log --oneline -10` — check recent commits for prior attempts
- `git diff main..origin/main` — if main is behind remote, someone already tried something
- Read the relevant files that were recently changed

### 2. Official tools second / 再用官方工具

- Use official CLI (`vercel`, `gh`, `npx`, etc.) to query real state
- Use MCP servers if available for the platform
- Check deployment logs, dashboard status, environment variables

### 3. Official documentation third / 然后查官方文档

- Consult the platform's official docs for the specific integration
- Check troubleshooting pages specifically

### 4. Inference last / 最后才推断

- Only after steps 1-3 fail to resolve, begin experimentation
- Each experiment should be minimal and reversible

## Rationale / 理由

This rule was created after the Vercel Analytics incident: the agent skipped reading 4 recent commits where the user had already tried both `@vercel/analytics` package and plain HTML script approaches. The agent then repeated the same failed paths. Reading the commits first would have immediately narrowed the problem space.

此规则源于 Vercel Analytics 事件：agent 跳过了用户已经尝试过两种方案的 4 个最近提交，然后重复了相同的失败路径。先读提交记录本可以立即缩小问题范围。

## Anti-Patterns / 反模式

- Jumping to documentation without checking what was already tried locally
- Guessing at solutions without using available CLI tools to query actual state
- Treating "main is behind remote" as routine instead of as a signal of prior activity
