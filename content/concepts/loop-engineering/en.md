---
title: "Loop Engineering"
description: "The discipline of designing autonomous agent execution loops — replacing yourself as the prompter with a system that prompts, verifies, and iterates on its own."
lang: en
pair: zh.md
lastUpdated: 2026-06-26
status: published
---

# Loop Engineering

Loop engineering is replacing yourself as the person who prompts the agent. You design the system that does it instead.

## Definition

Where prompt engineering asks "what should I say to the model?" and harness engineering asks "what environment does the agent need?", loop engineering asks "how does the agent keep going without me?"

Coined and defined by [Addy Osmani](https://addyosmani.com/blog/loop-engineering/), with key articulations from Anthropic's Boris Cherny ("I don't prompt Claude anymore. I have loops running that prompt Claude") and PSPDFKit's Peter Steinberger ("You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents").

Loop engineering encompasses:

- **Autonomous execution**: Agents run on schedules, discover work, and act without human prompting
- **Self-verification**: Separating the agent that writes from the agent that checks — the maker and checker split
- **State persistence**: Memory lives on disk (markdown, Linear boards, AGENTS.md), not in ephemeral context
- **Parallel coordination**: Worktrees isolate concurrent agent work so they don't collide
- **Recursive goals**: Defining stopping conditions so agents iterate until done, not until the token window ends

## The Five Building Blocks

Osmani identifies five primitives, plus one cross-cutting concern:

1. **Automations** — scheduled tasks that do discovery and triage by themselves
2. **Worktrees** — isolated checkouts so parallel agents don't step on each other
3. **Skills** — codified project knowledge the agent reads instead of guessing
4. **Plugins / Connectors** — MCP-based bridges to real tools (issue trackers, CI, Slack)
5. **Sub-agents** — separate agents for ideation, implementation, and verification

Plus **State** — a markdown file or board that lives outside any single conversation and tracks what's done and what's next. The agent forgets between runs; the repo doesn't.

For the full breakdown with concrete examples across Codex and Claude Code, see [Addy Osmani's definitive article](https://addyosmani.com/blog/loop-engineering/).

## Relationship to Other Disciplines

Loop engineering sits one floor above harness engineering. The harness equips a single agent run — tools, rules, context. The loop keeps poking agents on a schedule, spawning helpers, feeding itself state, and deciding what to do next.

- **Harness Engineering**: Builds the environment one agent runs inside. Loop engineering orchestrates many such runs over time.
- **Context Engineering**: Designs the information payload per inference step. Loop engineering manages state across steps so each run starts informed.
- **MCP**: Provides the connectors that let the loop touch real tools (Linear, GitHub, Slack) — turning an agent that *reports* findings into a loop that *acts* on them.

## Sources

- [Loop Engineering — Addy Osmani](https://addyosmani.com/blog/loop-engineering/) (definitive)
- [The Art of Loop Engineering — LangChain](https://www.langchain.com/blog/the-art-of-loop-engineering) (swyx's loopcraft)
- [Boris Cherny on loop-first development](https://x.com/rohanpaul_ai/status/2063289804708835412)
- [Peter Steinberger on not prompting agents](https://x.com/steipete/status/2063697162748260627)
