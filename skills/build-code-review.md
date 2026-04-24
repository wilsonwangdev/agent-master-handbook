# Build Code Review

Proactively review recent changes to the build system for code smells and refactoring signals.

## Purpose

Catch engineering issues that agents tend to miss when focused on feature implementation — the kind of problems that accumulate silently until a human reviewer points them out.

## When to use

- After modifying `build/build.mjs` or any file under `build/`
- After a PR that adds new build capabilities
- Periodically as a health check on build system complexity

## Checklist

Scan the changed code (or the full build file if doing a health check) for these specific patterns:

### Async parallelization
- Are there sequential `await` calls where the operations have no data dependency on each other?
- Could any group of independent awaits be wrapped in `Promise.all`?

### Constant and config hygiene
- Are there string literals (site name, URLs, paths) that appear more than once?
- Should any new values be added to the `SITE` config object in `build.mjs`?
- Are template files referencing hardcoded values instead of `{{variables}}`?

### Function signature growth
- Are `render()` calls or any function calls accumulating many positional or inline-object properties?
- When an object parameter exceeds ~8 keys, consider extracting a helper (like `seoVars()`) to assemble it.

### Repeated patterns
- Is the same filtering/mapping/assembly logic duplicated across multiple functions?
- Could a shared helper reduce the duplication?

### Build complexity signals
- Is `build.mjs` approaching or exceeding 300 lines?
- Are new features requiring changes to 3+ existing functions (coupling signal)?
- Is the template variable namespace growing without structure?

If any of these are found, report them with file path, line numbers, and a concrete suggestion. Do not silently fix — surface the finding so the decision to refactor is explicit.

## Output

A short list of findings, each with:
- **What**: the specific smell or signal
- **Where**: file and line range
- **Suggestion**: concrete improvement (not just "refactor this")

If nothing is found, say so in one sentence.
