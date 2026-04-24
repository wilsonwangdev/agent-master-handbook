Set up an agent-ready harness environment for this project following AI Native best practices.

## What to do

1. Create AGENTS.md as the canonical agent entry point at the project root. Include:
   - Project purpose (one paragraph)
   - Directory structure with what each folder contains
   - Build, test, and run commands
   - Commit conventions (atomic commits with prefixes like feat:, fix:, build:, etc.)
   - Pointers to specs, rules, skills, and other context files

2. Create symlinks so all major agent tools find the same file:
   - ln -s AGENTS.md CLAUDE.md
   - ln -s AGENTS.md .cursorrules
   - ln -s AGENTS.md .windsurfrules

3. Create .claude/settings.json with permission allowlists for common operations (build, test, git read commands).

4. Create a journal/ directory with a README explaining it captures agent failure records for self-evolution.

5. Create a specs/ directory for SPEC-driven decision records.

6. Create a skills/ directory with a README defining the quality gate for adding skills.

## Principles

- AGENTS.md should be under 200 lines — every line competes for context window space
- Use AGENTS.md (not CLAUDE.md) as the canonical file name — it is agent-tool-neutral
- Empty structure is better than low-quality placeholder content
- Check if community skills already exist before writing custom ones (skills.sh, cursor.directory)
- Reference https://agent-master-green.vercel.app for detailed guides on each practice