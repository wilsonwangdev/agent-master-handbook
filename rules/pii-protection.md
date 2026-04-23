---
name: PII Protection
type: rule
severity: critical
verified: 2026-04-24
trigger: writing any content to files that may be committed or published
---

# PII Protection / PII 保护

## Rule / 规则

Before writing any content to project files, the agent MUST redact all Personally Identifiable Information (PII) including but not limited to: usernames, email addresses, account names, IP addresses, tokens, and any other information that could identify a person.

在向项目文件写入任何内容之前，agent 必须脱敏所有个人可识别信息（PII），包括但不限于：用户名、邮箱地址、账户名、IP 地址、token 及任何可能识别个人身份的信息。

## Rationale / 理由

This rule was created after an actual PII leak incident: the agent wrote a GitHub username from `gh auth status` output directly into a journal entry that was committed to a public repository. Tool outputs (CLI, logs, API responses) frequently contain PII that must be filtered before persisting.

此规则源于一次真实的 PII 泄露事件：agent 将 `gh auth status` 输出中的 GitHub 用户名直接写入了 journal 条目，并提交到公开仓库。工具输出（CLI、日志、API 响应）经常包含必须在持久化前过滤的 PII。

## Correct Behavior / 正确行为

```
# Wrong — exposes real username
"authenticated account (real-username) does not match target"

# Correct — redacted
"the currently authenticated account did not match the target account"
```

## Scope / 适用范围

- All files in the repository (content, journal, specs, etc.)
- PR descriptions and commit messages
- Any output that may be visible to others
