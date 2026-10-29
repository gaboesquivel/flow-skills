# Working on Flow Skills

## Read when relevant

- Product purpose, scope, or priorities: `PRODUCT.md`. Current skill catalog: `docs/skills.md`.
- Principles or workflow: `docs/principles.md` and the relevant section of `docs/methodology.md`.
- Document ownership or locating context: `docs/README.md`.
- Project terminology: `GLOSSARY.md`.
- Bounded work and rationale: `docs/specs/`, `docs/decisions/`.
- Source evidence (maintainer): `docs/references.md` and `docs/research/`.
- Experience or technical changes: root `DESIGN.md` or `ARCHITECTURE.md` when present; create only when useful.
- Root context alignment and Flow setup: `skills/flow/SKILL.md`.

Load only what the task needs. `docs/archive/` is historical evidence, never current instructions or authority.

## Working practices

Develop Flow through its own practices using conversation and available tools. This repository maintains its own skill source under `skills/`; dogfood those skills when useful. `.claude/skills` links to `skills/`, so Claude Code sessions here load the working-tree source. Notice recurring friction, preserve useful proposals and rationale, and update owning documents when adopted. Edit skill source directly; preserve applicable source notices. When writing or editing agent-consumed context (`skills/**`, `AGENTS.md`, adapter metadata), apply [`write-agents`](skills/write-agents/SKILL.md) so changes meet the same authoring bar the catalog ships. Run what the work needs while implementing; the full checks run once when shipping (CI on every PR).

Use [Conventional Commits](https://www.conventionalcommits.org) for commit messages and PR titles: `type(scope): summary`, with the skill or area as scope (for example `fix(start): …`, `docs(decisions): …`). Add a body when the reason is not obvious from the summary.

## Distribution maintenance

Flow ships a portable `skills/` tree for the [Agent Skills](https://agentskills.io) ecosystem. Consumers install with `npx skills add gaboesquivel/flow-skills` and reach skills by talking to their agent; no skill must be named explicitly. This repository does not ship a bootstrap installer or require changes to adopter instruction files.

| Task | Command |
| --- | --- |
| Policy checks | `pnpm validate` |
| Tests | `pnpm test` |

Release checklist: [docs/RELEASE.md](docs/RELEASE.md). Host notes: [docs/agent-compatibility.md](docs/agent-compatibility.md).

Maintain useful context without waiting for a note-taking request. Respect explicit requests to discuss without edits. Before editing shared documents, read their current contents and preserve other chats' contributions.

## Maintain context

- Distinguish accepted direction, proposals, assumptions, and evidence. Recommendations and archived decisions are not automatically adopted.
- Keep intent, documentation, and implementation aligned. Check affected context when behavior changes; do not rewrite intent merely to match code. If established decisions conflict with the task, check existing authorization and ask only about unresolved changes.
- Keep one authoritative home for each fact; link instead of copying. Document intent, constraints, and useful navigation rather than restating readily discoverable code. Create files only for meaningful content.
- Apply project-specific meanings and surface conflicts. When a meaning is resolved, update `GLOSSARY.md` and affected current documents together. Loading the glossary alone does not require an edit.
- Preserve durable findings with sources and limitations in research, indexed in `docs/references.md`; distinguish historical and candidate sources from adopted influences. Avoid transcripts.
- Record significant rationale in a numbered decision record under `docs/decisions/` and update current context. Routine clarification needs no decision record.
- Record bounded increments in `docs/specs/` when the work warrants a durable artifact.
- Keep personal motivations and private context out of project documents. Use concise, professional language.
