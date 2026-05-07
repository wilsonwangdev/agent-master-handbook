---
title: "Context Engineering"
description: "The discipline of designing the complete information payload sent to an LLM — system prompts, tools, retrieval results, memory, and conversation history — to optimize agent behavior across multi-turn tasks."
lang: en
pair: zh.md
lastUpdated: 2026-05-07
status: published
---

# Context Engineering

Context engineering is the discipline of designing and managing the complete information payload sent to an LLM — system prompts, tools, examples, retrieval results, memory, and conversation history — to optimize agent behavior across multiple turns and long-horizon tasks.

## Definition

Where prompt engineering focuses on crafting discrete instructions, context engineering architects the entire information flow that shapes agent behavior. It asks: "What should the agent know at each step?" rather than "What should we say to the model?"

Context engineering encompasses:

- **Token budget allocation**: Finding the smallest set of high-signal tokens that maximize desired outcomes
- **Information lifecycle**: Deciding what enters context, when it's summarized, and when it's evicted
- **Retrieval strategy**: Just-in-time retrieval over pre-loading — fetch what's needed when it's needed
- **Memory architecture**: Persistent storage, compaction, and structured note-taking across long tasks
- **Attention management**: Positioning critical information where the model's attention mechanism will weight it appropriately

## Core Principles

### From Anthropic

Anthropic's guidance on effective context engineering emphasizes:

- Minimal, non-overlapping tools — each tool should have a clear, distinct purpose
- Just-in-time retrieval over pre-loading context
- Diverse canonical examples that demonstrate expected behavior
- System prompts at the right abstraction level
- For long tasks: compaction (summarizing history), structured note-taking, and sub-agent architectures

Source: [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

### From Manus

Manus's practical approach highlights:

- KV-cache optimization through stable prefixes for significant latency and cost reduction
- File systems as persistent memory beyond the context window
- Preserving failure traces so agents can learn from mistakes
- Avoiding few-shot brittleness through controlled variation in examples

Source: [Context Engineering for AI Agents: Lessons from Building Manus](https://www.manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)

## Context Rot

A fundamental constraint in context engineering is context rot — the degradation of model attention as context length grows. As more tokens accumulate, earlier information receives less attention weight, leading to forgotten instructions or degraded performance.

Mitigation strategies:

- **Compaction**: Periodically summarize conversation history, preserving key decisions and discarding noise
- **Sub-agent delegation**: Offload subtasks to fresh contexts that aren't burdened by accumulated history
- **Strategic positioning**: Place critical instructions at the beginning and end of context, where attention is strongest

## Relationship to Harness Engineering

Context engineering is a core component of harness engineering. While harness engineering builds the structural environment (CLAUDE.md, specs, directory layout), context engineering ensures that the right information flows to the agent at the right time within that structure.

A well-harnessed repository naturally supports good context engineering: clear file organization means agents retrieve relevant files efficiently, atomic commits mean history is parseable, and specs provide high-signal context for decision-making.
