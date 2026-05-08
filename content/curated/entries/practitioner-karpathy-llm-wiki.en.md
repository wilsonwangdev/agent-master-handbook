---
title: "Andrej Karpathy: LLM Wiki"
description: "Commentary on Karpathy's LLM Wiki gist — an architecture where an LLM incrementally builds a persistent, cross-linked markdown knowledge base instead of re-deriving answers at query time."
lang: en
pair: practitioner-karpathy-llm-wiki.zh.md
lastUpdated: 2026-05-09
status: published
source: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
---

# Andrej Karpathy: LLM Wiki

**Source**: [gist.github.com/karpathy/442a6bf555914893e9891c11519de94f](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)

## Why This Gist

Karpathy rarely publishes on new architectures without sparking a wave of implementations, and this gist is no exception — dozens of open-source projects have tried to operationalize the idea within weeks. The proposal itself is short but load-bearing: instead of traditional RAG chunk-retrieval, have an LLM incrementally maintain a persistent markdown wiki where synthesis, cross-references, and contradictions are already resolved.

## Key Ideas

- Three layers: immutable raw sources, an LLM-maintained wiki of interlinked markdown pages, and a schema file (CLAUDE.md / AGENTS.md) governing LLM behavior
- Three operations: **ingest** (process new sources), **query** (answer and file good answers back into the wiki), **lint** (periodic health checks for contradictions and gaps)
- The wiki is a compounding artifact, not a retrieval cache

## Value for Practitioners

This frames a different end state for agent memory than the prevailing "retrieve more chunks" direction — one worth considering before you invest heavily in vector infra. Read the gist first, then the community debate in the comments: provenance, staleness, and whether "wiki" is even the right term are all unresolved and worth forming your own view on.
