# Live run: Flow mode skills in Claude Code (2026-10-28)

Host: Claude Code 2.1.309 (CLI bundled with the desktop app), headless `-p` runs. Each scratch project installed the catalog from GitHub at `fbc623e` with `npx skills add gaboesquivel/flow-skills -a claude-code -y` (21 skills). Prompts used plain phrases only, no slash commands. Tool access was limited per run as listed.

## Results

| Prompt | Tools allowed | Skill loaded | Outcome |
| --- | --- | --- | --- |
| "Let's start a Next.js project called habit-loop: a habit tracker for remote teams." | Skill, Read, Glob, Grep | `start` | Pass. Stated template, name, slug, host, destination, and GitHub plan; waited for a yes. No files written. |
| Resumed: "Yes, go ahead. …" | Skill, Read, Glob, Grep, Write, Edit, Bash, Agent | `start`, then `explore` | Pass with finding. A worker bootstrapped flow-next while the main session explored. Setup, QA (166 tests), build, eval, dev server, MCP, and identity checks passed; committed `chore: initialize habit-loop`. Finding: flow-next ignores `AGENTS.md`, so the Flow block was written but not committed. The bootstrap also excluded `.claude/` from lint and format, and the template carried 23 broken `.agents/skills/` links. |
| "Explore this: a CLI that turns GitHub pull request comments into a weekly team digest." | Skill, Read, Glob, Grep | `explore` | Pass. Classified a new product, proposed Lite with a reason, stated a hypothesis with confidence, asked one question with a guess. |
| "Set up Flow here." | Skill, Read, Glob, Grep, Bash (node, ls, cat) | `flow` | Pass. Ran the block helper through the installed skill path; one block in `AGENTS.md`; warned that Claude Code needs `@AGENTS.md` in `CLAUDE.md`. |
| "Ship it." (scratch repo, one uncommitted change, no remote) | Skill, Read, Glob, Grep, read-only git, gh | `ship` | Pass. Found no remote, pushed nothing, asked where the work should go. |

## Limitations

- Headless runs; the explore lane ended after its first question.
- Task-set `ship` and local delivery mode were not exercised here; spec 013's own delivery is the task-set dogfood.
- One host only.
