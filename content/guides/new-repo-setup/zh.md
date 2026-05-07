---
title: "新项目仓库初始化检查清单"
description: "一份用于新仓库初始化的清单，让 agent 和人类从第一天起就共享同一套卫生约定——涵盖分支清理、合并策略与 squash 感知脚本。"
lang: zh
pair: en.md
lastUpdated: 2026-05-07
status: draft
---

# 新项目仓库初始化检查清单

git workflow 规则描述的是人和 agent 该怎么操作，不是仓库本身该怎么配置。这个断层会在项目初期很快暴露：前几周里堆积的过期分支、参差不齐的合并历史、每个人都以为别人会写的清理脚本。

这份清单覆盖的是一次性的、仓库层面的初始化，让 git workflow 真正能跑起来。

## 为什么这是一个独立关注点

规则说"PR 合并后删除本地分支"。没有正确设置的仓库会和规则对着干：

- 远端分支在合并后仍然存在，因为 host 没有开启自动删除。
- 项目采用 squash 合并，commit ancestry 被破坏，`git branch -d` 会认为本地分支"未合并"。
- 每个贡献者都发明自己那一套清理命令，节奏因会话而异。

这些问题每一个都能一步解决，但必须有人记得去做。清单的价值就是把"记得去做"显式化。

## 托管平台设置

在第一个 PR 合并之前配置：

- [ ] **合并后自动删除 head 分支。** 远端应在 PR / MR 合并后立即删除分支，把清理工作压缩到只剩本地。
- [ ] **选定一种合并策略并强制执行。** squash、rebase 或 merge，任选其一，在仓库设置里禁用其他选项，并在 agent 指令中说明选择。混合策略会让 history 无法阅读，并破坏清理脚本的启发式。
- [ ] **保护默认分支。** 要求走 PR / MR，禁止 force push，在有 CI 的地方要求 CI 通过。
- [ ] **在 squash-merge 项目里要求线性历史。** 这维持了"每个 PR 一个 commit"的不变式，下游工具多半依赖它。

> **适配说明：** GitHub 的位置在 *Settings → Branches* 和 *Settings → General → Pull Requests*。GitLab 在 *Settings → Repository → Protected branches* 和 *Settings → General → Merge requests*。Bitbucket、Gerrit、自建 Forgejo 都有对应界面——名字不同，设置相同。

## 本地清理脚本

squash 合并会把整个 PR 压成一个新的 commit 并落到默认分支上，原分支上的 commit 不再是这个新 commit 的祖先，所以 `git branch -d <name>` 会把分支视为"未合并"而拒绝删除。因此 squash 感知的清理脚本不是可选项，而是必需品。

加一条清理命令，做到：

1. 清理上游已消失的远程追踪分支。
2. 删除 upstream 标记为 `[gone]` 的本地分支，不管 commit ancestry 怎么说。
3. 没有可删除分支时干净退出。

示例（使用 npm 的 Node 项目）：

```json
"scripts": {
  "clean-branches": "git fetch -p && git for-each-ref refs/heads --format '%(refname:short) %(upstream:track)' | awk '$2 == \"[gone]\" {print $1}' | xargs git branch -D"
}
```

任何能跑 shell 的项目都能套同样的逻辑——一个 `Makefile` target、一个 shell function、或者项目里任何 task runner 的任务。

> **适配说明：** Node → `npm run clean-branches` / `pnpm run clean-branches`。Python → `tox` / `nox` / `just` 任务或 `Makefile` target。Go → `make` target。清理逻辑一致，只有 runner 不同。

## Agent 指令入口

只要 agent 不知道命令存在，清理命令就是摆设。把入口写进项目的 agent 指令文件（`AGENTS.md`、`CLAUDE.md`、`.cursorrules`）的 pre-work checklist 里：

- [ ] 开始工作前，运行项目的清理命令。
- [ ] 开分支前，确认默认分支是最新的。
- [ ] 提交新 PR 前，列出 open PR / MR 并检查是否存在阻塞冲突。

一条 agent 从来不会读的规则等同于不存在。agent 指令里的 pre-work checklist 就是把规则真正接入工作流的机制。

## 验证

一次性设置完成后验证：

- [ ] 合并一个临时 PR。远端分支会自动消失吗？
- [ ] 合并之后运行清理命令。即使 squash 合并破坏了 ancestry，本地分支会被删除吗？
- [ ] agent 指令文件里是否以正确语法列出了清理命令？

任何一项回答"否"就代表设置没做完，无论仓库写了多少行规则文档。

## 何时运行这份清单

- 仓库创建的那一刻，在第一个 feature 分支之前。
- 一个原本使用 merge commit 的老仓库改用 squash 合并策略时。
- 一位新贡献者或新 agent 反馈"我的旧分支没被清理掉"时。

"分支一直堆积"的反馈几乎总是能追到这份清单里漏掉的步骤，而不是贡献者不自律。
