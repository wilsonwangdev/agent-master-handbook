---
title: "AGENTS.md 作为单一数据源"
lang: zh
pair: en.md
lastUpdated: 2026-04-24
status: draft
---

# AGENTS.md 作为单一数据源

一份实践指南：如何设置统一的 agent 入口文件，使其在所有主流 AI 编码工具中通用。

## 问题

每个 AI 编码工具读取不同的项目指令文件：

- Claude Code 读取 `CLAUDE.md`
- Cursor 读取 `.cursorrules`
- Windsurf 读取 `.windsurfrules`
- Codex 读取 `AGENTS.md`

维护多个独立文件意味着内容重复、版本漂移、以及不同工具间 agent 行为不一致。

## 解决方案：一个文件，多个软链接

选择一个规范文件，其余用软链接指向它：

```bash
# AGENTS.md 是规范文件（实际内容在这里）
ln -s AGENTS.md CLAUDE.md
ln -s AGENTS.md .cursorrules
ln -s AGENTS.md .windsurfrules
```

Git 正确追踪软链接——克隆仓库的协作者会得到可用的软链接。

## 为什么选 AGENTS.md 而非 CLAUDE.md

我们最初以 CLAUDE.md 作为规范文件，AGENTS.md 作为软链接。后来反转了，原因是：

- **工具中立命名**：AGENTS.md 不偏向任何特定厂商。以 AGENTS.md 作为入口的项目表明它平等支持所有 agent 工具。
- **新兴惯例**：AGENTS.md 正在成为跨生态系统的标准 agent 指令文件（OpenAI Codex、社区项目）。
- **CLAUDE.md 作为软链接仍然有效**：Claude Code 会跟随软链接，所以 `CLAUDE.md -> AGENTS.md` 对它是透明的。

## 常见错误

### 一开始选错了规范文件

我们因为 Claude Code 是主要工具而以 CLAUDE.md 开始。添加多 agent 支持时，不得不反转所有软链接并更新 README、CONTRIBUTING 等文档中的引用。从第一天就用 AGENTS.md。

### 没有更新引用

重命名规范文件时，grep 整个仓库查找旧名称的引用。内部文档（README、CONTRIBUTING）需要更新。泛指概念的内容文件（"通过 CLAUDE.md 或等效文件"）可以保留——它们描述的是行业惯例，不是这个具体文件。

### 忘记 Windows 兼容性

Windows 上的软链接需要启用开发者模式或管理员权限。在设置说明中记录这一点。或者，一些团队使用 post-checkout git hook 在 Windows 上创建副本而非软链接。

## 验证

设置完成后，验证所有路径解析到相同内容：

```bash
head -1 AGENTS.md CLAUDE.md .cursorrules .windsurfrules
# 所有文件应显示相同的第一行
```
