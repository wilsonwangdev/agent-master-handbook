---
date: 2026-04-24
type: judgment-failure
status: resolved
---

# Premature Parallelization of Build Pipeline / 构建管线的过早并行化

## What Happened / 发生了什么

During a code review of `build.mjs`, the user pointed out that 7 sequential `await` calls in `main()` had no data dependency on each other. The agent immediately refactored them into `Promise.all`, along with parallelizing template loading, asset copying, and RSS generation.

The refactoring was technically correct. But the entire build processes 20 Markdown files in 0.19 seconds. The parallelization had zero measurable impact on build time.

在对 `build.mjs` 的代码审查中，用户指出 `main()` 中 7 个串行 `await` 调用之间没有数据依赖。Agent 立即将它们重构为 `Promise.all`，同时并行化了模板加载、资源复制和 RSS 生成。

重构在技术上是正确的。但整个构建只处理 20 个 Markdown 文件，耗时 0.19 秒。并行化对构建时间的影响为零。

## Root Cause / 根因

The agent conflated "this is a valid observation" with "this needs immediate action." When a human reviewer points out a code smell, the agent's instinct is to fix everything at once rather than assess whether the fix has measurable value at current scale.

This is a pattern: agents tend to over-correct when issues are pointed out, treating every signal as an urgent refactoring target.

Agent 将"这是一个有效的观察"与"这需要立即行动"混为一谈。当人类审查者指出代码异味时，agent 的本能是一次性修复所有问题，而不是评估修复在当前规模下是否有可衡量的价值。

这是一种模式：agent 在被指出问题后倾向于过度修正，将每个信号都当作紧急重构目标。

## What Was Changed / 做了什么改变

The parallelization was kept in #32 because it does express correct intent (these operations are independent). But the lesson is recorded here for future reference.

Other changes in the same PR — constant extraction into `SITE` config object, `seoVars()` helper, template variable deduplication — had genuine value because they reduced merge conflict surface and code repetition. These were not premature.

并行化保留在 #32 中，因为它确实表达了正确的意图（这些操作是独立的）。但教训记录在此供未来参考。

同一 PR 中的其他改动——常量提取到 `SITE` 配置对象、`seoVars()` 辅助函数、模板变量去重——具有真实价值，因为它们减少了合并冲突面和代码重复。这些不属于过早优化。

## Rule for Future / 未来规则

Before refactoring for performance, verify the improvement is measurable at current scale:

- If the entire operation takes < 1 second, parallelization is cosmetic
- Constant extraction and deduplication have value regardless of scale (they reduce conflict and repetition)
- Record the signal for future action when scale grows, rather than acting immediately

在为性能进行重构之前，验证改进在当前规模下是否可衡量：

- 如果整个操作耗时 < 1 秒，并行化只是装饰性的
- 常量提取和去重无论规模如何都有价值（减少冲突和重复）
- 当规模增长时再行动，而不是立即行动——先记录信号
