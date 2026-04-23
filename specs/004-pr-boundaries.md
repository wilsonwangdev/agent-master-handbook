---
id: "004"
title: "PR Boundaries and Review Standards"
status: accepted
created: 2026-04-24
---

# SPEC 004: PR Boundaries and Review Standards

## PR Boundary Definition

A PR has one clear boundary: it should be mergeable or revertable as a single unit without affecting unrelated functionality.

### Tests for a well-bounded PR

1. **Single sentence**: Can you describe what this PR does in one sentence without "and"? If not, split it.
2. **Revert safety**: If this PR is reverted, does only the intended feature/fix disappear? If reverting would break unrelated things, the PR has leaked scope.
3. **Review coherence**: Can a reviewer understand the full PR without context from other pending PRs? If it depends on another PR being merged first, declare that dependency explicitly.

### PR types and their expected scope

| Prefix | Scope | Example boundary |
|--------|-------|-----------------|
| `infra:` | One infrastructure concern (CI, hooks, settings) | "Add husky pre-commit hook" not "Add hooks + CI + submodules" |
| `content:` | One content piece or a coherent set of related pieces | "Add context-engineering concept EN+ZH" |
| `build:` | One build system change | "Redesign site CSS" |
| `rule:` | One or more related rules from the same incident | "Add PII protection rule and journal entry" |
| `spec:` | One specification document | "Add PR boundary spec" |

## Review Standards

A PR is ready to merge when:

- [ ] Passes `npm run build`
- [ ] No PII in any file (pre-commit hook should catch this)
- [ ] Commit messages are atomic and prefixed
- [ ] One concern — no unrelated changes
- [ ] Bilingual content has both languages (or is explicitly marked draft)
- [ ] If it modifies CLAUDE.md, the changes are consistent with existing sections
- [ ] Dependencies on other PRs are declared and already merged

## Merge Strategy

**Squash and merge** — the only enabled merge method on this repository.

### Rationale

- One PR = one concern. Squash produces one commit on main per PR, keeping history clean.
- Intermediate commits within a PR (iterations, fixes, rebases) are development process, not project history. They don't belong on main.
- Agents reading `git log` get one line per logical change — maximum signal, minimum noise.
- Enforced at the repository level (GitHub settings: only "Squash and merge" enabled) so there is no decision to make at merge time.

### Squash commit message

Use the PR title as the commit message. GitHub auto-fills this when squash is selected. The PR body is preserved in the squash commit description for traceability.

## Merge Order and Dependencies

When multiple PRs are open, determine merge order by:

1. **Declare dependencies in PR description**: "Depends on #N" or "Merge after #N"
2. **Infrastructure before content**: PRs that change build/tooling should merge before PRs that depend on those tools
3. **Independent PRs can merge in parallel**: If two PRs touch no common files and have no logical dependency, order doesn't matter
4. **Conflict resolution**: The later PR rebases onto main after the earlier one merges

## Labeling Dependencies

Use this format in PR descriptions:

```
## Dependencies
- Merge after #2 (uses clean-branches script defined there)
```

If no dependencies: omit the section entirely.
