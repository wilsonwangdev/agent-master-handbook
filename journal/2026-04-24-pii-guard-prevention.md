---
date: 2026-04-24
type: prevention
status: resolved
---

# PII Guard: From Incident to Prevention / 从事件到预防的 PII 防护

## Incident Chain / 事件链

1. Agent wrote a username from `gh auth status` into a journal file (PII leak)
2. File was committed and pushed to a public repository
3. Agent fixed the file content but failed to rewrite git history — PII remained in commit diffs
4. Required git rebase + force push to fully remove PII from remote

1. Agent 将 `gh auth status` 中的用户名写入 journal 文件（PII 泄露）
2. 文件被提交并推送到公开仓库
3. Agent 修复了文件内容但未重写 git 历史——PII 仍存在于提交 diff 中
4. 需要 git rebase + force push 才能从远程完全清除 PII

## Prevention Implemented / 已实施的预防措施

Followed Karpathy's principles: minimum code, no unnecessary tools, surgical change.

遵循 Karpathy 原则：最小代码、不引入不必要的工具、外科手术式变更。

- `.gitguard`: pattern file listing strings that must not appear in commits / 模式文件，列出不得出现在提交中的字符串
- `.githooks/pre-commit`: scans staged files against `.gitguard` patterns, blocks commit on match / 扫描暂存文件，匹配时阻止提交
- `npm run setup`: configures `core.hooksPath` for collaborators / 为协作者配置 hooks 路径
- `rules/pii-protection.md`: agent-facing rule for PII handling / 面向 agent 的 PII 处理规约
- `CLAUDE.md`: updated with safety section / 更新了安全章节

## Why Not a Heavier Tool / 为什么不用更重的工具

Tools like gitleaks or detect-secrets are designed for secret scanning at scale. This project's threat model is simpler: agent accidentally copying PII from tool output. A grep-based hook with a manually maintained pattern file is sufficient, zero-dependency, and easy for agents to understand and maintain.

gitleaks 或 detect-secrets 等工具是为大规模密钥扫描设计的。本项目的威胁模型更简单：agent 意外复制工具输出中的 PII。基于 grep 的 hook 配合手动维护的模式文件已经足够，零依赖，且 agent 易于理解和维护。
