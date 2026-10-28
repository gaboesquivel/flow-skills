# Agent and host compatibility

Flow skills target the [Agent Skills](https://agentskills.io) package layout: `skills/<name>/SKILL.md` with YAML frontmatter. The [skill catalog](skills.md) lists all twenty-four packages, the leading word for each, and when to use each.

## Installation

| Mechanism | Notes |
| --- | --- |
| `npx skills add gaboesquivel/flow-skills` | Primary path where the [skills CLI](https://github.com/vercel-labs/skills) is supported. Choose agent and scope in the installer; Flow does not default to one product. |
| Host skill UI | Some IDEs import a Git URL or local folder directly; behavior matches that host's skill loader. |
| Manual copy | Copy `skills/*` into the host's expected skills directory. You are responsible for paths and updates. |

Flow does not modify adopter `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or similar files.

## Invocation

| Host style | How users run Flow |
| --- | --- |
| Talking or dictation | Say a skill's [leading word](../GLOSSARY.md#leading-word) ("interview me", "spec it", "ship it"); hosts that honor descriptions match the skill. This is the primary interface ([decision 0019](decisions/0019-voice-first-invocation.md)). |
| Slash commands | `/flow`, `/to-spec`, `/implement`, … when the host maps skill names to commands |
| Skill picker | Explicit selection by skill name |

Every skill is model-invocable. Matching a phrase to a skill is probabilistic: hosts choose from descriptions, and dictation can mishear. For that reason `start` confirms template, name, and destination before writing ([decision 0022](decisions/0022-start-runs-explore.md)), and `ship` confirms before pushing.

**Root context alignment** is not guaranteed by implicit `flow` invocation alone. Hosts may skip alignment on ordinary implementation work. The portable contract is: `implement` and `review` remind agents to align the current project's `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` when meaningful changes warrant it; adopters can also say "update the docs".

**Pull request automation** (optional, per repository): [pr-review-contract.md](pr-review-contract.md) is agent-agnostic — any IDE or model can follow it before opening a PR. This repository adds a deterministic checker (`scripts/check-pr-alignment.mjs`) and an OpenAI-compatible CI job on `pull_request`. `main` requires a pull request plus passing `alignment`, `validate`, and `context-review` checks when the review API key is configured; see [spec 004](specs/004-pr-alignment-review.md). Flow skills do not install workflows or edit adopter instruction files; copy the contract and scripts when adopting the pattern.

That alignment updates the **current project's** product context. It does not copy this repository's Flow identity into an adopter `PRODUCT.md`. [Decision 0009](decisions/0009-adopter-product-context.md).

`flow` is not a project-start command. Only a confirmed `start` run authorizes scaffolding. The optional [`start`](../skills/start/SKILL.md) skill initializes from flow-next or flow-mono after the user confirms template, name, and destination: template isolation, renamed Portless identity, verification (`pnpm setup`, `pnpm qa`, `pnpm build`, `pnpm eval`, Portless dev smoke), baseline product docs, the project Flow block, and an initial Git commit only after essential checks pass. A worker runs the bootstrap while the main session hands the conversation to `explore`; hosts without workers bootstrap first, then explore. It does not invoke `flow` automatically.

Metadata and contract tests show the intended invocation split. They do not show that a host matched a spoken phrase to the right skill. Claude Code is recorded as a second agent product for read-only runs; see [smoke scenario status](../tests/smoke/2026-10-27-scenario-status.md).

## Metadata

Policy ([decision 0019](decisions/0019-voice-first-invocation.md), amended by [0022](decisions/0022-start-runs-explore.md)):

| Skill | `disable-model-invocation` | `allow_implicit_invocation` (adapter) |
| --- | --- | --- |
| All skills | `false` | `true` |

Each model-invocable description ends with `Use when the user says "…"` and two or three trigger phrases; the validator enforces the form.

**Observed support varies.** Confirm behavior in your host's skill documentation. Hosts that ignore adapter files rely on frontmatter and user invocation only.

Core skill bodies avoid naming a single vendor tool, subagent API, or filesystem layout. Hosts may still expose different tools; skills describe outcomes and fallbacks in generic terms.

## Claude Code

Claude Code ships built-in skills that overlap with parts of the catalog. Flow owns intent and durable artifacts; built-ins own execution and output formats ([decision 0017](decisions/0017-claude-code-skill-coexistence.md)).

| Flow | Built-in | Use Flow when |
| --- | --- | --- |
| `review` | `/code-review` | Intent and root-context alignment matter, not only correctness bugs. |
| — | Plan mode | Flow does not claim "plan". Say "spec it" or "break it down" when the plan should last. |
| `flow`, `start` | `/init`, memory | Product facts belong in root context files. Keep `CLAUDE.md` and memory as pointers, not copies. |
| `handoff` | Automatic compaction | A fresh agent needs a standalone document. |
| `to-tasks` | Session task list | Work needs durable vertical slices or tracker issues. |

Flow retired `simplify`, `security`, and `performance` in favor of `/simplify`, `/security-review`, and host tooling ([decision 0019](decisions/0019-voice-first-invocation.md)). Flow avoids generic verbs: "review the code" reaches `/code-review`; "check it against the spec" reaches Flow `review`.

Hosts offer no portable skill priority. To make your phrases reliable, you may paste a table like this into your own user-level instructions (for example `~/.claude/CLAUDE.md`). Flow never writes it, and it maps phrases to skills without chaining them:

```markdown
When I say these phrases, use the named Flow skill:
- "interview me" → interview
- "grill me" → grill
- "spec it" → to-spec
- "break it down" → to-tasks
- "build it" → implement
- "check it against the spec" → review
- "ship it" → ship
- "update the docs" → flow
- "tldr" → tldr
- "hand off" → handoff
```

## Verification status

Structural checks (`pnpm validate`, contract tests, `pnpm eval:check`) and Agent Skills CLI listing (`tests/distribution.test.mjs`) run in CI. Headless slash-command runs in Claude Code are recorded; interactive skill-picker runs and write paths remain open; see [smoke scenario status](../tests/smoke/2026-10-27-scenario-status.md) and [evaluation scenario status](../tests/evals/scenario-status.md).
