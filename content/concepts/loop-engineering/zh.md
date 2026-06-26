---
title: "循环工程"
description: "设计自主 Agent 执行循环的学科——用系统替代亲手提示，让 Agent 自我迭代、自我验证。"
lang: zh
pair: en.md
lastUpdated: 2026-06-26
status: published
---

# 循环工程

循环工程（Loop Engineering）是用系统替代你亲手提示 Agent 的学科。你设计让它自己跑的循环，而不是一次一次地打字。

## 定义

提示词工程问的是「我该对模型说什么」，Harness 工程问的是「Agent 需要什么环境」，循环工程问的是「Agent 怎么在没有我的情况下持续运转」。

由 [Addy Osmani](https://addyosmani.com/blog/loop-engineering/) 命名并定义。Anthropic Claude Code 负责人 Boris Cherny 的表述一针见血：「我不再亲手提示 Claude。我写循环来提示 Claude，让它自己弄清楚要做什么。」PSPDFKit 创始人 Peter Steinberger 说得更直白：「你不该再亲手提示 coding agent 了，你该设计循环来提示 agent。」

循环工程涵盖：

- **自主执行**：Agent 按计划运行，自己发现问题、自己动手
- **自我验证**：写的和查的分离——一个 Agent 写代码，另一个 Agent 审查
- **状态持久化**：记忆存在磁盘上（markdown、Linear、AGENTS.md），而非随对话消失
- **并行协调**：用 worktree 隔离并行 Agent 的工作区，避免冲突
- **递归目标**：定义停止条件，Agent 迭代直到完成，而非直到 token 用完

## 五个构建块

Osmani 识别出五个原语，加一个贯穿全程的要素：

1. **自动化** — 按计划运行，自行发现和分类任务
2. **工作树** — 隔离的代码检出，让并行 Agent 互不干扰
3. **技能** — 将项目知识写下来，Agent 直接读取而不是靠猜
4. **插件 / 连接器** — 基于 MCP 连接真实工具（Issue 系统、CI、Slack）
5. **子智能体** — 独立 Agent 分别负责探索、实现和验证

再加上**状态**——一个独立于任何单次对话的 markdown 文件或看板，记录什么做完了、什么待处理。Agent 在每次运行之间会遗忘，但仓库不会。

完整拆解（含 Codex 和 Claude Code 的具体示例）见 [Addy Osmani 的定义性文章](https://addyosmani.com/blog/loop-engineering/)。

## 与其他学科的关系

循环工程位于 Harness 工程之上一层。Harness 装备单次 Agent 运行——工具、规则、上下文。循环则在时间维度上编排多次运行：按时触发、派生子智能体、喂入状态、决定下一步。

- **Harness 工程**：构建单个 Agent 运行的环境。循环工程编排大量此类运行。
- **上下文工程**：设计每次推理的信息载荷。循环工程管理跨步骤的状态，让每次运行都能接上前文。
- **MCP**：提供连接器，让循环能够触及真实工具（Linear、GitHub、Slack）——把一个只会报告的 Agent 变成一个能实际执行操作的循环。

## 来源

- [Loop Engineering — Addy Osmani](https://addyosmani.com/blog/loop-engineering/)（定义性文章）
- [The Art of Loop Engineering — LangChain](https://www.langchain.com/blog/the-art-of-loop-engineering)（swyx 的 loopcraft）
- [Boris Cherny 关于 loop-first 开发](https://x.com/rohanpaul_ai/status/2063289804708835412)
- [Peter Steinberger 关于不再亲手提示 Agent](https://x.com/steipete/status/2063697162748260627)
