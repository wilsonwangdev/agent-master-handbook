# Skills

Reusable agent skills following the [Agent Skills specification](https://agentskills.io/specification).

Each skill is a directory containing a `SKILL.md` entry point with YAML frontmatter. The format is designed for runtimes that implement the specification. In this repository, skills are tested primarily with Claude Code and written to remain portable to other implementations where possible.

## Structure

```
skills/
  <skill-name>/
    SKILL.md          # Required: frontmatter + instructions
    scripts/          # Optional: executable helpers
    references/       # Optional: supporting docs
```

## Installation

This repository is the canonical source for these skills.

To use a skill, copy the `<skill-name>/` directory into the skill location supported by your runtime.

Examples of official runtime docs:
- [Claude Code skills](https://code.claude.com/docs/en/slash-commands)
- [GitHub Copilot skills](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/create-skills)
- [Cursor Rules documentation](https://cursor.com/docs/rules)

## Quality Gate

A skill can only be added here when it meets ALL of the following:

1. Follows the Agent Skills standard (`SKILL.md` with YAML frontmatter)
2. Has been tested in at least one mainstream agent environment
3. Solves a real, recurring need — not a one-off task
4. Does not duplicate functionality available through standard tool capabilities
5. Is Layer 2 compliant: works in any repository without modification
