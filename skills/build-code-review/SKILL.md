---
name: build-code-review
description: Review build system changes for code smells — async parallelization, config hygiene, function signature growth, and complexity signals. Use after modifying build scripts or adding new build capabilities.
---

# Build Code Review

Catch engineering issues that agents tend to miss when focused on feature implementation — the kind of problems that accumulate silently until a human reviewer points them out.

## When to use

- After modifying build scripts or any file under the build directory
- After a PR that adds new build capabilities
- Periodically as a health check on build system complexity

## Checklist

Scan the changed code (or the full build file if doing a health check) for these patterns. Any numeric thresholds below are heuristics, not hard rules:

### Async parallelization
- Are there sequential `await` calls where the operations have no data dependency on each other?
- Could any group of independent awaits be wrapped in `Promise.all`?

### Constant and config hygiene
- Are there string literals (site name, URLs, paths) that appear more than once?
- Should any new values be added to a centralized config object?
- Are template files referencing hardcoded values instead of variables?

### Function signature growth
- Are function calls accumulating many positional or inline-object properties?
- When an object parameter exceeds ~8 keys, consider extracting a helper to assemble it.

### Repeated patterns
- Is the same filtering/mapping/assembly logic duplicated across multiple functions?
- Could a shared helper reduce the duplication?

### Build complexity signals
- Is the main build file approaching or exceeding 300 lines?
- Are new features requiring changes to 3+ existing functions (coupling signal)?
- Is the template variable namespace growing without structure?

If any of these are found, report them with file path, line numbers, and a concrete suggestion. Do not silently fix — surface the finding so the decision to refactor is explicit.

## Output

A short list of findings, each with:
- **What**: the specific smell or signal
- **Where**: file and line range
- **Suggestion**: concrete improvement (not just "refactor this")

If nothing is found, say so in one sentence.
