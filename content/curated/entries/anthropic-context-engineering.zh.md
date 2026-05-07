---
title: "Anthropic：面向 AI Agent 的有效上下文工程"
description: "对 Anthropic 上下文工程指南的解读——如何管理系统提示、工具、检索和记忆以构建可靠的 AI agent。"
lang: zh
pair: anthropic-context-engineering.en.md
lastUpdated: 2026-05-07
status: published
source: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
---

# 面向 AI Agent 的有效上下文工程

**来源**：[Anthropic Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

## 入选理由

这是 Anthropic 关于上下文工程的权威指南——上下文工程已成为 agent 系统中提示词工程的继任学科。它提供了如何为 Claude 构建最优 agent 性能的信息载荷的一手指导。

## 核心要点

- 上下文工程关注找到最小的高信号 token 集合以最大化期望结果
- 工具应最小化且无重叠——每个工具有清晰、独特的用途
- 按需即时检索优于预加载上下文
- 长时间运行的任务：使用压缩、结构化笔记和子 agent 架构
- 系统提示应在适当的抽象层级——不过于具体，也不过于泛化

## 对实践者的价值

构建 agent-ready 环境的必读内容。其原则直接指导如何构建 CLAUDE.md 文件、设计工具接口以及管理长 agent 会话中的上下文。
