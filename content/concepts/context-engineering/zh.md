---
title: "上下文工程"
description: "设计和管理发送给 LLM 的完整信息载荷——系统提示、工具、检索结果、记忆和对话历史——以优化 agent 在多轮任务中的行为。"
lang: zh
pair: en.md
lastUpdated: 2026-05-07
status: published
---

# 上下文工程

上下文工程是设计和管理发送给 LLM 的完整信息载荷的学科——包括系统提示、工具、示例、检索结果、记忆和对话历史——以优化 agent 在多轮交互和长周期任务中的行为。

## 定义

提示词工程关注如何撰写离散的指令，而上下文工程架构的是塑造 agent 行为的整个信息流。它问的是："agent 在每一步应该知道什么？"而非"我们应该对模型说什么？"

上下文工程涵盖：

- **Token 预算分配**：找到最小的高信号 token 集合以最大化期望结果
- **信息生命周期**：决定什么进入上下文、何时摘要、何时淘汰
- **检索策略**：按需即时检索，而非预加载——在需要时获取所需内容
- **记忆架构**：跨长任务的持久存储、压缩和结构化笔记
- **注意力管理**：将关键信息放置在模型注意力机制会给予适当权重的位置

## 核心原则

### 来自 Anthropic

Anthropic 关于有效上下文工程的指导强调：

- 最小化、无重叠的工具——每个工具应有清晰、独特的用途
- 按需即时检索，而非预加载上下文
- 多样化的典型示例，展示期望行为
- 适当抽象层级的系统提示
- 长任务场景：压缩（摘要历史）、结构化笔记和子 agent 架构

来源：[Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

### 来自 Manus

Manus 的实践方法强调：

- 通过稳定前缀优化 KV-cache，显著降低延迟和成本
- 将文件系统作为超越上下文窗口的持久记忆
- 保留失败痕迹，使 agent 能从错误中学习
- 通过示例的可控变化避免 few-shot 脆性

来源：[Context Engineering for AI Agents: Lessons from Building Manus](https://www.manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)

## 上下文腐化

上下文工程的一个基本约束是上下文腐化（Context Rot）——随着上下文长度增长，模型注意力退化。随着更多 token 累积，早期信息获得的注意力权重降低，导致指令遗忘或性能下降。

缓解策略：

- **压缩**：定期摘要对话历史，保留关键决策，丢弃噪声
- **子 agent 委派**：将子任务分配给不受累积历史负担的新上下文
- **策略性定位**：将关键指令放在上下文的开头和结尾，注意力最强的位置

## 与 Harness 工程的关系

上下文工程是 harness 工程的核心组成部分。Harness 工程构建结构化环境（CLAUDE.md、specs、目录布局），而上下文工程确保正确的信息在正确的时间流向 agent。

一个良好 harness 化的仓库天然支持好的上下文工程：清晰的文件组织意味着 agent 能高效检索相关文件，原子化提交意味着历史可解析，specs 为决策提供高信号上下文。
