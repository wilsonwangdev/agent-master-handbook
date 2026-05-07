---
title: "用 CSS 变量把一致性写成约束"
description: "为什么散落的间距和颜色数值会在 agent 协作迭代中引发风格漂移，以及如何用变量驱动的设计体系把一致性从记忆问题变成代码里的约束。"
lang: zh
pair: en.md
lastUpdated: 2026-05-07
status: published
---

# 用 CSS 变量把一致性写成约束

每一轮视觉迭代都会动一点东西——一处 margin、一条 border 颜色、一个标题字号。如果每次改动都是裸数值，下一轮迭代就没有锚点可以对照。三轮之后整个间距系统会显得任意，因为它**确实**是任意的：每个值都是相对上一个值调的，而不是对着一个尺度调的。

把 CSS 变量当作设计体系的合约来用，可以把一致性从"需要记住"的问题变成代码可以强制的约束。

## 漂移问题的本质

风格漂移不是审美失误的结果，而是审查者和作者没有共同参照所导致的自然结果。在 agent 辅助的工作流中这件事会被放大：agent 被要求"紧凑一点"，它就紧凑了若干值，下一个审查者——无论是人还是另一个 agent——没有办法判断这个新值是体系的一部分还是一次局部例外。

症状是可辨认的：

- 样式表里散落的 `1rem`、`1.25rem`、`1.5rem`、`1.75rem`，看不出什么尺度。
- 两个"轻一点"的边框颜色，十六进制值其实不一样。
- 字号靠眼睛选，不是按步长选。

孤立看每个值都说得过去，问题出在整体。

## 约束模式

词汇表声明一次，到处引用。CSS 自定义属性就是为此而生——它把命名 token 变成 margin、padding、color、border 的唯一合法值。

一个最小的间距尺度：

```css
:root {
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2.5rem;
}

.section { padding: var(--space-lg); }
.card + .card { margin-top: var(--space-md); }
```

规则不是"有时候用变量"，规则是"在 margin、padding、border-width、gap 上出现裸 `rem` 或 `px` 就是 bug"。设计里任何会重复出现的决策，都应该被变量覆盖。

## 哪些东西该进变量

凡是出现过不止一次、并且预期保持一致的量：

- **间距** —— `--space-*`。最常见的漂移源。
- **颜色** —— `--bg`、`--fg`、`--muted`、`--accent`、`--border`、`--border-bright`。按角色命名，不按具体色值命名——角色能跨色板变化存活。
- **圆角** —— `--radius-sm`、`--radius-md`。一个项目有五种不同的圆角，几乎从来不是故意的。
- **边框宽度** —— `--border-width-thin`、`--border-width-thick`。相邻两条分割线一个 1px 一个 2px 是最典型的不一致信号。
- **字号步长** —— `--text-sm`、`--text-base`、`--text-lg`。有尺度之后就别再来 `font-size: 17px`。
- **过渡时长** —— `--duration-fast`、`--duration-base`。统一的过渡时长能让动画感觉是协调的。

## 为什么这和"品牌常量单一数据源"是同一件事

同样的原则在项目元数据层也成立：品牌名、tagline、URL 放一处（比如 `package.json`），构建脚本、OG 标签、canonical URL 全部从这里读。把 "Agent Master Handbook" 复制到各个模板里，会产生和把 `1.5rem` 复制到 CSS 里完全同类的 bug——总有一份会漂走。

CSS 变量是样式层对同一原则的实现：**常量只放一处，使用方引用它**。收益也一样：未来改一行就够，而不是十五行。

## 用排版基线做锚点

有了变量来定义词汇表，尺度本身还需要一个锚点。为技术文档重新发明排版尺度，极少能做出比已有方案更好的东西。从一个已知可用的基线出发，只在编辑语气真的需要的地方做调整。

对文章型内容，[GitHub Markdown CSS](https://github.com/sindresorhus/github-markdown-css) 是业界广泛采用的参考：

- 正文字号约 16px
- 正文行高约 1.5
- 段落 margin 约 1rem
- 标题上 margin 约 1.5rem

偏离这些数值超过约 ±15% 通常说明是漂移，而不是有意为之。根据内容类型（编辑向、文档向、营销向）选一个基线，把由此推导的数值固化为变量，之后的修改就会停留在选定的尺度里。

## 如何渐进迁移

已经漂了的仓库不需要全面重写。

1. **盘点现状。** 把样式表里 margin、padding、border 用到的所有不同值列出来。
2. **聚类并命名。** 大多数数值会聚拢到 5 到 7 个规范尺寸附近。保留代表，抛弃离群。
3. **抽取尺度。** 把聚类代表声明为 CSS 变量。
4. **逐个属性替换裸值。** 先间距（漂移率最高），再边框，再颜色。
5. **禁止继续写裸值。** 加一条 lint 规则、一项 review 检查，或者如果两者都没有，在 agent 指令文件里写一句：margin/padding/border 上的裸 `rem`/`px` 视为 review finding。

最后一步是让体系稳住的关键。没有这一步，下一轮迭代会重新塞进一个 `1.125rem`，这次盘点就只是临时的。

## Review 表面

尺度存在之后，审查标准收敛成一组很小的问题：

- 这个属性是引用了变量，还是写了裸数值？
- 如果是裸数值，是否有匹配的变量本该被使用？
- 如果没有匹配的变量，该补一个，还是这真的是一次性的例外？

这些问题足够机械，可以放进 lint 规则或变更后 review skill。漂移从审美争论降级为可发现、可修复的一类问题。

## 参考

- [GitHub Markdown CSS](https://github.com/sindresorhus/github-markdown-css) —— 文章型内容的排版基线。
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) —— 自定义属性的语义与级联规则。
- [Design Tokens Community Group (W3C)](https://www.w3.org/community/design-tokens/) —— 跨工具跨平台的命名 token 形式化模型。
