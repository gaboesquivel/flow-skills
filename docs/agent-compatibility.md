# Agent and host compatibility

Flow skills target the [Agent Skills](https://agentskills.io) package layout: `skills/<name>/SKILL.md` with YAML frontmatter. The [skill catalog](skills.md) lists all fourteen packages, the leading word for each, and when to use each.

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
| Slash commands | `/flow`, `/to-spec`, `/implement`, … when the host maps skill names to commands |
| Skill picker | Explicit selection by skill name |
| Host suggestion | **`flow` only** — some hosts may surface Flow Lite after context work; not guaranteed |
| Chat instruction | User names the skill in plain language where slash commands are unavailable |

All skills except `flow` require explicit user invocation in Flow's design.

**Root context alignment** is not guaranteed by implicit `flow` invocation alone. Hosts that only task-match skills may skip alignment on ordinary implementation work. The portable contract is: `implement` and `review` remind agents to align the current project's `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` when meaningful changes warrant it; adopters can also invoke `/flow` or rely on host surfacing when supported. Always-on alignment without those mechanisms requires host-specific hooks (for example always-loaded project instructions), which Flow skills do not modify.

That alignment updates the **current project's** product context. It does not copy this repository's Flow identity into an adopter `PRODUCT.md`. [Decision 0009](decisions/0009-adopter-product-context.md).

`flow` is not a project-start command. `flow start` and "start project" do not authorize scaffolding or instruction-file edits. An initializer is an open product decision; it is not implemented.

Metadata and contract tests show the intended invocation split. They do not show that a host surfaced `flow` during ordinary edits. A second agent product has not been recorded; see [smoke scenario status](../tests/smoke/2026-10-27-scenario-status.md).

## Metadata

Dual policy ([decision 0006](decisions/0006-flow-lite-and-flat-docs.md)):

| Skill | `disable-model-invocation` | `allow_implicit_invocation` (adapter) |
| --- | --- | --- |
| `flow` | `false` | `true` |
| All others | `true` | `false` |

**Observed support varies.** Confirm behavior in your host's skill documentation. Hosts that ignore adapter files rely on frontmatter and user invocation only.

Core skill bodies avoid naming a single vendor tool, subagent API, or filesystem layout. Hosts may still expose different tools; skills describe outcomes and fallbacks in generic terms.

## Verification status

Structural checks (`pnpm validate`, contract tests) and Agent Skills CLI listing (`tests/distribution.test.mjs`) run in CI. Recorded live slash-command or skill-picker runs in a second agent product remain open; see [smoke scenario status](../tests/smoke/2026-10-27-scenario-status.md).
