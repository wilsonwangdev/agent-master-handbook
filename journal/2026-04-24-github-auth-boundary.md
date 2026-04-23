---
date: 2026-04-24
type: auth-boundary
status: resolved
---

# Agent Encountered GitHub Auth Boundary / Agent 遇到 GitHub 认证边界

## What Happened / 发生了什么

When attempting to create a remote repository via `gh` CLI:
1. `gh auth status` showed an expired token
2. The currently authenticated account did not match the target account

通过 `gh` CLI 创建远程仓库时发现：
1. `gh auth status` 显示 token 已失效
2. 当前认证账户与目标账户不一致

## Root Cause / 根因

GitHub tokens expire, and users may switch between multiple GitHub accounts. Agents cannot and should not handle authentication credentials autonomously.

GitHub token 有过期机制，且用户可能在多个 GitHub 账户间切换。Agent 无法也不应该自行处理认证凭证。

## Resolution / 解决方式

This is a correct HITL boundary / 这是一个正确的 HITL 边界：
- Agent diagnoses the issue and provides the exact fix command / Agent 诊断问题并给出精确的修复命令
- Human performs the authentication (credential security) / 人类执行认证操作（涉及凭证安全）
- Agent resumes workflow after authentication / Agent 在认证完成后继续工作流

## Evolution / 进化记录

- Auth status checks should be a prerequisite before any remote operation / 认证状态检查应作为远程操作的前置步骤
- `gh auth status` is the standard way to detect auth issues / `gh auth status` 是检测认证问题的标准方式
- On auth failure, agent should immediately recognize it as a HITL boundary / 遇到认证失败时，agent 应立即识别为 HITL 边界

## Post-Incident: PII Leak / 事后发现：PII 泄露

**This journal entry originally contained a leaked username from `gh auth status` output.** The agent failed to redact PII before writing to a file that would be committed to a public repository. This violation led to the creation of `rules/pii-protection.md`.

**本条目最初包含了从 `gh auth status` 输出中泄露的用户名。** Agent 未能在写入将提交到公开仓库的文件前脱敏 PII。此违规导致了 `rules/pii-protection.md` 的创建。
