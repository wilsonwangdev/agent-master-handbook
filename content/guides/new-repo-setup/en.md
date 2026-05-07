---
title: "New-Project Repository Setup Checklist"
description: "A checklist for initializing a new repository so agents and humans share the same hygiene from day one — covering branch cleanup, merge strategy, and squash-aware scripts."
lang: en
pair: zh.md
lastUpdated: 2026-05-07
status: published
---

# New-Project Repository Setup Checklist

Git workflow rules describe how developers and agents should behave. They do not describe how the repository itself should be configured. That gap shows up early: the first few weeks of a new project accumulate stale branches, inconsistent merge histories, and cleanup scripts that everyone assumes someone else will write.

This checklist covers the one-time repo-level setup that makes the git workflow actually work.

## Why This Is a Separate Concern

A rule says "delete local branches after PR merge." A repo without the right settings fights that rule:

- Remote branches linger because the host does not auto-delete after merge.
- Local branches look "unmerged" to plain `git branch -d` because the project squash-merges, so commit ancestry is lost.
- Contributors each invent their own cleanup command, so cadence varies per session.

Each of these is fixable in one step, but only if someone remembers to do it. The checklist makes that remembering explicit.

## Hosting Platform Settings

Configure these before the first PR merges:

- [ ] **Auto-delete head branches after merge.** The remote should delete the branch as soon as a PR / MR is merged, so the only cleanup work is local.
- [ ] **Pick one merge strategy and enforce it.** Squash, rebase, or merge — pick one, disable the others in the repo settings, and mention the choice in the agent instructions. Mixed strategies make history unreadable and break cleanup heuristics.
- [ ] **Protect the default branch.** Require PRs / MRs, block force push, require CI checks where CI exists.
- [ ] **Require linear history on squash-merge projects.** This keeps the "one commit per PR" invariant that downstream tools assume.

> **Adapt to your project:** GitHub exposes these under *Settings → Branches* and *Settings → General → Pull Requests*. GitLab exposes them under *Settings → Repository → Protected branches* and *Settings → General → Merge requests*. Bitbucket, Gerrit, and self-hosted Forgejo have equivalent screens — the names differ, the settings do not.

## Local Cleanup Script

A squash merge rewrites the PR into a single new commit on the default branch. The original branch commits are not ancestors of that new commit, so `git branch -d <name>` sees the branch as "not merged" and refuses to delete. A squash-aware cleanup script is therefore mandatory, not optional.

Add a cleanup command that:

1. Prunes remote-tracking branches whose upstream is gone.
2. Deletes local branches whose upstream is `[gone]`, regardless of whether commit ancestry agrees.
3. Exits cleanly if there is nothing to delete.

Example (Node project with npm):

```json
"scripts": {
  "clean-branches": "git fetch -p && git for-each-ref refs/heads --format '%(refname:short) %(upstream:track)' | awk '$2 == \"[gone]\" {print $1}' | xargs git branch -D"
}
```

The equivalent fits any project that runs shell — a `Makefile` target, a shell function, or a task in whatever runner the project uses.

> **Adapt to your project:** Node → `npm run clean-branches` / `pnpm run clean-branches`. Python → a `tox`/`nox`/`just` task or `Makefile` target. Go → a `make` target. The cleanup logic is identical; only the runner changes.

## Agent Instructions Pointer

The cleanup command is useless if agents don't know it exists. Add a pointer in the project's agent instructions file (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`) under a pre-work checklist:

- [ ] Before starting work, run the project's cleanup command.
- [ ] Before branching, confirm the default branch is current.
- [ ] Before opening a new PR, list open PRs / MRs and check for blocking conflicts.

A rule that an agent never reads is a rule that does not exist. Pre-work checklists in the agent instructions are the mechanism that makes the rule reach the workflow.

## Verification

After the one-time setup, verify:

- [ ] Merge a throwaway PR. Does the remote branch disappear automatically?
- [ ] After that merge, run the cleanup command. Does the local branch disappear even though the squash merge broke ancestry?
- [ ] Does the agent instructions file list the cleanup command with correct syntax?

If any of these answer "no," the setup is not done, regardless of how many lines of rule documentation the repo has.

## When to Run This Checklist

- At the moment the repository is created, before the first feature branch.
- When adopting a squash-merge policy in an existing repo that previously used merge commits.
- When a new contributor or agent reports "my old branches aren't getting cleaned up."

A recurring branch-accumulation complaint is almost always traceable to missing steps in this checklist, not to undisciplined developers.
