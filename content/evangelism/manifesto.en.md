---
title: "The AI Native Manifesto"
description: "A declaration of principles for AI Native software engineering — where AI agent collaboration is a first-class architectural concern, not an afterthought."
lang: en
pair: manifesto.zh.md
lastUpdated: 2026-05-07
status: published
---

# The AI Native Manifesto

Software engineering is being rewritten. Not by replacing developers, but by changing how development happens — from a solo human activity to a collaborative practice between humans and AI agents.

## What AI Native Means

AI Native is not about using AI as a tool. It's about building systems, workflows, and organizations where AI agent collaboration is a first-class architectural concern.

An AI Native project:

- Is structured so that agents can understand and navigate it without human narration
- Treats agent readability as equal to human readability
- Automates the automatable, and designs clear boundaries for human judgment
- Evolves through recorded failures, not just successful features
- Uses specifications as shared contracts between humans and agents

## Principles

### 1. Structure Is Interface

For agents, your project structure IS the API. Clear directories, predictable naming, and co-located context are not nice-to-haves — they are the interface through which agents understand your system.

### 2. Minimal Human-in-the-Loop

Design workflows where human intervention is the exception, not the rule. This doesn't mean removing humans — it means being intentional about where human judgment adds irreplaceable value.

### 3. Specs Over Tribal Knowledge

Unwritten conventions are invisible to agents. If a decision matters, write it down as a spec. Specs are the shared memory between human sessions and agent sessions.

### 4. Atomic and Traceable

Every change should be small enough to understand in isolation and labeled clearly enough to be useful as historical context. Agents learn from git history — make it worth reading.

### 5. Failure as Input

Failures are not just incidents to resolve — they are training data for the system's evolution. Record them, analyze them, and encode the lessons into the project's structure.

### 6. Standards Over Custom

Use established protocols (MCP for tool invocation, conventional commit formats, standard directory layouts) over custom solutions. Standards reduce the context an agent needs to operate.

## The Goal

The goal of AI Native engineering is not to remove humans from the loop. It is to create environments where the collaboration between humans and agents is so well-structured that both can do their best work — humans on judgment, creativity, and direction; agents on execution, consistency, and scale.
