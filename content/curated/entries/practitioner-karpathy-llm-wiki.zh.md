---
title: "Andrej Karpathy：LLM Wiki"
description: "对 Karpathy LLM Wiki gist 的解读——一种由 LLM 增量构建持久、互联 Markdown 知识库的架构，而非在查询时重新推导答案。"
lang: zh
pair: practitioner-karpathy-llm-wiki.en.md
lastUpdated: 2026-05-09
status: published
source: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
---

# Andrej Karpathy：LLM Wiki

**来源**：[gist.github.com/karpathy/442a6bf555914893e9891c11519de94f](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)

## 入选理由

Karpathy 发布新架构思路时很少不会引发一波实现浪潮，这篇 gist 也不例外——数周内就有几十个开源项目试图将其工程化。提案本身很短但有重量：不同于传统 RAG 的切片检索，让 LLM 增量维护一份持久的 Markdown wiki，让综合、交叉引用与矛盾消解提前完成，而非查询时重新推导。

## 核心要点

- 三层结构：不可变的原始来源、由 LLM 维护的互联 Markdown wiki 页面、以及控制 LLM 行为的 schema 文件（CLAUDE.md / AGENTS.md）
- 三种操作：**ingest**（处理新来源）、**query**（回答并把好答案回填入 wiki）、**lint**（周期性检查矛盾与缺口）
- Wiki 是累积性产物，而非检索缓存

## 对实践者的价值

这为 agent 记忆描绘了与主流"检索更多切片"方向不同的终局状态——在你重度投入向量基础设施之前值得先考虑一下。建议先读 gist 本身，再看评论区的社区讨论：来源追溯、陈旧性、以及 "wiki" 是否是合适的术语都尚未定论，值得自己形成判断。
