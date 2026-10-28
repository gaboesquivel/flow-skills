# Agent and host compatibility

Flow skills target the [Agent Skills](https://agentskills.io) package layout: `skills/<name>/SKILL.md` with YAML frontmatter. The [skill catalog](skills.md) lists every package, the leading word for each, and when to use each.

## Installation

| Mechanism | Notes |
| --- | --- |
| `npx skills add gaboesquivel/flow-skills` | Primary path where the [skills CLI](https://github.com/vercel-labs/skills) is supported. Choose agent and scope in the installer; Flow does not default to one product. |
| Host skill UI | Some IDEs import a Git URL or local folder directly; behavior matches that host's skill loader. |
| Manual copy | Copy `skills/*` into the host's expected skills directory. You are responsible for paths and updates. |

Flow does not modify adopter `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or similar files, except the opt-in Flow block below.

## Invocation

| Host style | How users run Flow |
| --- | --- |
| Talking or dictation | Say a skill's [leading word](../GLOSSARY.md#leading-word) ("interview me", "spec it", "ship it"); hosts that honor descriptions match the skill. This is the primary interface ([decision 0019](decisions/0019-voice-first-invocation.md)). |
| Slash commands | `/flow`, `/to-spec`, `/build`, … when the host maps skill names to commands |
| Skill picker | Explicit selection by skill name |

Every skill is model-invocable. Matching a phrase to a skill is probabilistic: hosts choose from descriptions, and dictation can mishear. For that reason `start` confirms template, name, and destination before writing ([decision 0022](decisions/0022-start-runs-explore.md)), `build` never pushes `main` and its size guard sends larger [unspecced work](../GLOSSARY.md#unspecced-work) through an independent review (by `build` in local mode, by `ship`, which re-applies the guard, in GitHub mode), and [`ship`](../skills/ship/SKILL.md) lands only accepted specs, so a misheard "build it" or "ship it" cannot land an unaccepted spec or an unreviewed unspecced feature; neither asks for a confirmation (decisions [0028](decisions/0028-build-and-ship.md), [0034](decisions/0034-no-ceremony-without-a-spec.md), and [0039](decisions/0039-build-never-requires-a-spec.md)). Skills may name the next skill and wait; the only automatic hand-offs are `start` → `explore` and explore's `interview` and `grill` phases, each behind the user's yes, and `ship` running `build` and `review` as part of landing ([decision 0028](decisions/0028-build-and-ship.md); [decision 0024](decisions/0024-gated-hand-offs.md)).

**Root context alignment** is not guaranteed by implicit `flow` invocation alone. Hosts may skip alignment on ordinary implementation work. The portable contract is: `build` and `review` remind agents to align the current project's `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` when meaningful changes warrant it; adopters can also say "update the docs".

**Pull request automation** (optional, per repository): [pr-review-contract.md](pr-review-contract.md) is agent-agnostic — any IDE or model can follow it before opening a PR. This repository adds a deterministic checker (`scripts/check-pr-alignment.mjs`) and an OpenAI-compatible CI job on `pull_request`. `main` requires a pull request plus passing `alignment`, `validate`, and `context-review` checks when the review API key is configured; see [spec 004](specs/004-pr-alignment-review.md). Flow skills do not install workflows or edit adopter instruction files beyond the opt-in Flow block; copy the contract and scripts when adopting the pattern.

That alignment updates the **current project's** product context. It does not copy this repository's Flow identity into an adopter `PRODUCT.md`. [Decision 0009](decisions/0009-adopter-product-context.md).

`flow` is not a project-start command. Only a confirmed `start` run authorizes scaffolding. The optional [`start`](../skills/start/SKILL.md) skill initializes from flow-next or flow-mono after the user confirms template, name, and destination: template isolation, renamed Portless identity, verification (`pnpm setup`, `pnpm qa`, `pnpm build`, `pnpm eval`, Portless dev smoke), baseline product docs, the project Flow block, and an initial Git commit only after essential checks pass. A worker runs the bootstrap while the main session hands the conversation to `explore`; hosts without workers bootstrap first, then explore. It does not invoke `flow` automatically.

Metadata and contract tests show the intended invocation split. They do not show that a host matched a spoken phrase to the right skill. Claude Code is recorded as a second agent product for read-only runs; see [smoke scenario status](../tests/smoke/2026-10-27-scenario-status.md).

## Flow mode

"Set up Flow here" writes one Flow block between `<!-- BEGIN FLOW -->` and `<!-- END FLOW -->` in the instruction file Git tracks: `AGENTS.md` when tracked, otherwise `CLAUDE.md`, which then imports `@AGENTS.md` so Claude Code sees both ([decision 0020](decisions/0020-flow-mode.md); the [`flow`](../skills/flow/SKILL.md#flow-block) skill owns the layout). Every host that reads the file sees the phrases; this is the portable stand-in for a session-start hook. Re-running updates the block in place; deleting it opts out.

Skills fan out by default; the rule lives in [`write-agents`](../skills/write-agents/SKILL.md#workers) ([decision 0031](decisions/0031-fan-out-by-default.md)). "Build it" on a spec's task set runs the [frontier](../GLOSSARY.md#frontier) as isolated workers (for example subagents), each in a Git worktree `build` creates itself from the spec-branch head rather than the host's worktree isolation, scheduled by [area](../GLOSSARY.md#area), and removes each clean task worktree once it integrates; hosts without workers run the tasks sequentially on the spec branch. GitHub mode's spec issue and sub-issues need GitHub issue access; without it the skills keep files only and say so. The block's `Delivery:` line (`github` or `local`) picks the finish: GitHub mode needs GitHub access, and local mode needs only Git ([requirements](../PRODUCT.md#install-and-catalog)): `build` reviews and merges into local `main`, and "ship it" pushes `main` when a remote exists (decisions [0030](decisions/0030-asked-delivery-and-local-mode.md) and [0032](decisions/0032-local-build-lands-ship-verifies.md)). The rule lives in [`build`](../skills/build/SKILL.md#delivery-mode). In GitHub mode, "ship it" or "land it" then runs the one independent review of the spec, one worker per axis plus a verifier (labelled single-agent on a host without separate workers), merges, and syncs the result; a required human approval stops it. Verification runs the acceptance scenario with the host's browser tool; without one, `ship` checks what HTTP requests can and marks the remaining steps unverified.

A task-set run reports a [checkpoint](../GLOSSARY.md#checkpoint) after each integration batch and does not wait unless asked; CI is waited on only for the final pull request (decisions [0025](decisions/0025-wave-checkpoints.md) and [0029](decisions/0029-spec-issues.md)). Screenshots of changed screens need a browser tool from the host; without one, the checkpoint says so.

**Dogfooding in this repository.** `.claude/skills` is a symlink to `skills/`, so Claude Code sessions here load the working-tree skills; `pnpm validate` fails if the link breaks. Other hosts read the source tree directly or install it with the skills CLI.

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

Hosts offer no portable skill priority. To make your phrases reliable, you may copy the phrase table from [`flow-block.mjs`](../skills/flow/lib/flow-block.mjs) (`PHRASES`, the single source) into your own user-level instructions (for example `~/.claude/CLAUDE.md`), or opt the project into Flow mode so the block carries it. Flow never writes user-level files. The table maps phrases to skills; it does not chain them.

## Verification status

Structural checks (`pnpm validate`, contract tests, `pnpm eval:check`) and Agent Skills CLI listing (`tests/distribution.test.mjs`) run in CI. Headless slash-command runs in Claude Code are recorded; interactive skill-picker runs and write paths remain open; see [smoke scenario status](../tests/smoke/2026-10-27-scenario-status.md) and [evaluation scenario status](../tests/evals/scenario-status.md).
