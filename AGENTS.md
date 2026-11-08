# Working on Flow Skills

## Read when relevant

- Product purpose, scope, or priorities: `PRODUCT.md`. Current skill catalog: `docs/skills.md`.
- Principles or workflow: `docs/principles.md` and the relevant section of `docs/methodology.md`.
- Document ownership or locating context: `docs/README.md`.
- Project terminology: `GLOSSARY.md`.
- Bounded work and rationale: `docs/specs/`, `docs/decisions/`.
- Source evidence (maintainer): `docs/references.md` and `docs/research/`.
- Experience or technical changes: root `DESIGN.md` or `ARCHITECTURE.md` when present; create only when useful.
- Root context alignment and Flow setup: `skills/sync-docs/SKILL.md`.

Load only what the task needs. `docs/archive/` is historical evidence, never current instructions or authority.

## Working practices

Develop Flow through its own practices using conversation and available tools. This repository maintains its own skill source under `skills/`; dogfood those skills when useful. `.claude/skills` links to `skills/`, so Claude Code sessions here load the working-tree source. Notice recurring friction, preserve useful proposals and rationale, and update owning documents when adopted. Edit skill source directly; preserve applicable source notices. When writing or editing agent-consumed context (`skills/**`, `AGENTS.md`, adapter metadata), apply [`write-agents`](skills/write-agents/SKILL.md) so changes meet the same authoring bar the catalog ships. Work through its Tools rule: CLIs, MCP, and APIs first, and the maintainer only for the steps it reserves. Several sessions often work here at once. Claude Code owns worktrees and sessions: work in the current checkout, and start an isolated one with `claude -w` (worktrees land under the ignored `.claude/worktrees/`) only when another session is writing the same checkout or paths. Follow [`write-agents` Sessions](skills/write-agents/SKILL.md#sessions) for shared runtime state and sibling work. The plugin's [guard hook](hooks/guard.mjs) blocks the destructive cases (force-pushes, pushes to `main`, `--no-verify`, admin merges, and removing or resetting another session's worktree), and its [SessionStart report](hooks/wip.mjs) lists work in flight when a session opens. PR descriptions also name the active spec and exact review head. Run checks only on request, before opening a PR, or when fixing a PR after review. CI runs them on every PR.

Use [Conventional Commits](https://www.conventionalcommits.org) for commit messages and PR titles: `type(scope): summary`, with the skill or area as scope (for example `fix(start): …`, `docs(decisions): …`). Add a body when the reason is not obvious from the summary.

## Distribution maintenance

Flow ships as a Claude Code plugin ([decision 0062](docs/decisions/0062-claude-code-first.md)) from its own marketplace ([`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json)): [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json), the `skills/` tree, the hooks in [`hooks/hooks.json`](hooks/hooks.json) (PreToolUse guard, SessionStart work-in-flight report), and [`agents/flow-reviewer.md`](agents/flow-reviewer.md). The Cursor plugin ([decision 0064](docs/decisions/0064-cursor-plugin.md), [`.cursor-plugin/plugin.json`](.cursor-plugin/plugin.json), [`hooks/cursor-hooks.json`](hooks/cursor-hooks.json)) runs the same scripts. The same `skills/` tree installs on any [Agent Skills](https://agentskills.io) host with `npx skills add gaboesquivel/flow-skills`, without the hooks. Consumers reach skills by talking to their agent; no skill must be named explicitly. This repository does not ship a bootstrap installer or require changes to adopter instruction files. Keep `plugin.json` and `package.json` versions in step; `pnpm validate` checks the plugin manifest, hooks, and agent frontmatter.

| Task | Command |
| --- | --- |
| Policy checks | `pnpm validate` |
| Tests | `pnpm test` |
| Delivery metrics (time to close PR, CI failures and wait, skill words) | `pnpm metrics [--repo owner/name] [--limit N]` |
| Context cost (what agents load, total SKILL.md words, skill install drift) | `pnpm context [--repo path] [--json]` ([`scripts/context.mjs`](scripts/context.mjs)) |
| Guard hook tests | `node --test tests/guard.test.mjs` |
| Website (`site/`) | `pnpm --dir site install`, then `pnpm --dir site dev` or `pnpm --dir site qa` |

The website in `site/` renders skills and docs from this repository at build time: edit the source Markdown, never copy it into `site/` ([spec 032](docs/specs/032-prism-website.md)).

Release checklist: [docs/RELEASE.md](docs/RELEASE.md). Host notes: [docs/agent-compatibility.md](docs/agent-compatibility.md).

Maintain useful context without waiting for a note-taking request. Respect explicit requests to discuss without edits. Before editing shared documents, read their current contents and preserve other chats' contributions.

## Maintain context

- Distinguish accepted direction, proposals, assumptions, and evidence. Recommendations and archived decisions are not automatically adopted.
- Keep intent, documentation, and implementation aligned. Check affected context when behavior changes; do not rewrite intent merely to match code. If established decisions conflict with the task, check existing authorization and ask only about unresolved changes.
- Keep one authoritative home for each fact; link instead of copying. Document intent, constraints, and useful navigation rather than restating readily discoverable code. Create files only for meaningful content.
- Apply project-specific meanings and surface conflicts. When a meaning is resolved, update `GLOSSARY.md` and affected current documents together. Loading the glossary alone does not require an edit.
- Preserve durable findings with sources and limitations in research, indexed in `docs/references.md`; distinguish historical and candidate sources from adopted influences. Avoid transcripts.
- Record significant rationale in a numbered decision record under `docs/decisions/` and update current context; a choice earns one only under [`to-spec`](skills/to-spec/SKILL.md)'s test ([decision 0063](docs/decisions/0063-decision-record-threshold.md)). Routine clarification needs no decision record.
- Record bounded increments in `docs/specs/` when the work warrants a durable artifact.
- Keep personal motivations and private context out of project documents. Use concise, professional language.
