---
date: 2026-05-08
type: process-failure
status: resolved
---

# Branching from a Stale Local Branch Polluted Two PRs / 基于过期本地分支创建新分支污染了两个 PR

## What Happened / 发生了什么

Started work on the AEO baseline (#69) and `llms-full.txt` (#70) without first switching to `main`. The starting branch (`content/promote-stable-drafts`) had two local commits whose contents had already been squash-merged to `main` as PR #68 — the local commits and the squashed commit shared no SHA, so `git fetch -p` couldn't recognize the equivalence. Both feature branches were created via `git checkout -b` from this stale branch, so PR #69 carried 3 commits instead of 1, and PR #70 inherited the same 2 orphan commits on top of its own.

Reviewer noticed the polluted commit history. Fix required rebasing both PRs and force-pushing.

开始 #69 与 #70 工作时未先切到 `main`。起始分支 `content/promote-stable-drafts` 有两个本地提交，其内容已通过 PR #68 squash-merge 进 `main`——本地提交与 squash 后的提交 SHA 不同，`git fetch -p` 无法识别等价性。两个 feature 分支都从这个过期分支 `git checkout -b`，导致 PR #69 携带 3 个提交而非 1 个，PR #70 在其之上继承了同样的 2 个孤儿提交。

## Root Cause / 根因

CLAUDE.md's pre-work checklist instructs `git fetch -p` and `npm run clean-branches`, but the working directory's HEAD was never explicitly required to be on `main` before `git checkout -b`. The agent ran `git fetch -p` (which correctly detected `origin/content/promote-stable-drafts` was deleted) and concluded "remote is clean", then branched from wherever HEAD happened to be — a stale local branch.

The rule "branch from `main`" existed but was implicit. The procedural check was missing. Squash-merge makes this failure invisible to most local-state inspections: `git log` shows commits that look unmerged, but they have already landed under different SHAs.

CLAUDE.md 的工作前检查清单要求 `git fetch -p` 和 `npm run clean-branches`，但未明确要求在 `git checkout -b` 之前 HEAD 必须在 `main`。Agent 跑了 `git fetch -p`（正确识别出 `origin/content/promote-stable-drafts` 已删除）后判断"远端是干净的"，然后从 HEAD 当前所在的分支——过期的本地分支——切出新分支。

"从 main 切分支"这条规则存在但隐式。程序性检查缺失。Squash-merge 让这种失败对大多数本地状态检查不可见：`git log` 看起来还有未合并的提交，但它们已以不同 SHA 落地。

## Fix / 修复

Both PRs were rebased onto `origin/main`:

- PR #69: `git rebase --onto origin/main <last-orphan-commit> infra/aeo-baseline` then `git push --force-with-lease`. Reduced from 3 commits to 1.
- PR #70: After PR #69 merged, `git rebase --onto origin/main infra/aeo-baseline build/llms-full` then `git push --force-with-lease`. GitHub auto-retargeted the PR base from `infra/aeo-baseline` to `main`. Lighthouse ran (it was previously skipped because the workflow only triggers on PRs targeting `main`).

两个 PR 都 rebase 到了 `origin/main`：

- PR #69：`git rebase --onto origin/main <最后一个孤儿提交> infra/aeo-baseline`，然后 `git push --force-with-lease`。从 3 个提交减到 1 个。
- PR #70：在 PR #69 合并后，`git rebase --onto origin/main infra/aeo-baseline build/llms-full`，然后 `git push --force-with-lease`。GitHub 自动将 PR 基线从 `infra/aeo-baseline` 重定向到 `main`。Lighthouse 触发（此前被跳过，因为工作流仅在以 `main` 为目标的 PR 上运行）。

## Prevention / 预防

Update CLAUDE.md "Before starting any work" checklist to make `git checkout main` explicit, not implicit:

- Step 3 already says `git checkout main && git pull` — this is correct, but it sits between other steps and an agent may run earlier steps from a different branch and forget to actually switch before creating a new branch.
- Add an explicit assertion before `git checkout -b`: verify HEAD is on `main` (not just that `main` is up to date).

A complementary safeguard: after `git fetch -p`, if the current branch's upstream was pruned (`[gone]`), the agent should treat that branch as definitely not a valid base for new work, even if local commits look unmerged.

更新 CLAUDE.md "开始任何工作前"清单，让 `git checkout main` 显式而非隐式：

- 第 3 步已经说 `git checkout main && git pull`——这是对的，但它夹在其他步骤之间，agent 可能在其他分支上跑前面的步骤，然后在创建新分支前忘记真正切换过去。
- 在 `git checkout -b` 之前加一条显式断言：验证 HEAD 在 `main` 上（不只是 `main` 已最新）。

补充一道安全网：`git fetch -p` 之后，如果当前分支的 upstream 已被 prune（`[gone]`），即使本地提交看起来未合并，agent 也应将该分支视为绝不可作为新工作的起点。

## Evolution / 进化记录

- Squash-merge breaks SHA-based "is this commit merged" reasoning. Identity-based reasoning (branch upstream gone) is more reliable. / Squash-merge 破坏了基于 SHA 的"提交是否合并"判断。基于身份的判断（分支 upstream 已删除）更可靠。
- "Remote is clean" ≠ "I am on the right branch". The two checks are independent. / "远端干净" ≠ "我在对的分支上"。两项检查相互独立。
- A pre-work checklist that lists steps without enforcing ordering or final-state assertions can be partially executed and still feel complete. / 一份只列步骤、不强制顺序或终态断言的工作前清单，可以被部分执行却仍感觉完整。
- This is the third PR-hygiene failure recorded (PR #1 scope creep, PR #8 four-concerns mix, this one). The pattern: rules exist, but the procedural touch-points where rules must fire are under-specified. / 这是记录的第三次 PR 卫生失败（PR #1 范围蔓延、PR #8 四关注点混合、本次）。模式：规则存在，但规则必须触发的程序性触点定义不足。
