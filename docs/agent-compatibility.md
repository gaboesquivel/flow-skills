# Agent and host compatibility

Flow skills target the [Agent Skills](https://agentskills.io) package layout: `skills/<name>/SKILL.md` with YAML frontmatter. The [skill catalog](skills.md) lists all twelve packages and when to use each.

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
| Slash commands | `/to-spec`, `/implement`, … when the host maps skill names to commands |
| Skill picker | Explicit selection by skill name |
| Chat instruction | User names the skill in plain language where slash commands are unavailable |

## Metadata

- `disable-model-invocation: true` — intended to prevent automatic skill activation. **Observed support varies.** Cursor and several CLI agents document or honor similar fields; always confirm in your host's skill documentation.
- `skills/<name>/agents/openai.yaml` with `allow_implicit_invocation: false` — optional adapter for hosts that read it. Hosts that ignore adapter files rely on frontmatter and user invocation only.

Core skill bodies avoid naming a single vendor tool, subagent API, or filesystem layout. Hosts may still expose different tools; skills describe outcomes and fallbacks in generic terms.

## Verification status

Structural checks (`pnpm validate`, contract tests) and Agent Skills CLI listing (`tests/distribution.test.mjs`) run in CI. Recorded live slash-command or skill-picker runs in a second agent product remain open; see [smoke scenario status](../tests/smoke/2026-10-27-scenario-status.md).

| Metadata | Typical intent | Enforcement |
| --- | --- | --- |
| `disable-model-invocation: true` in SKILL.md frontmatter | User must invoke the skill explicitly | Honored in several hosts; not universal |
| `allow_implicit_invocation: false` in `agents/openai.yaml` | Same policy for adapters that read it | Optional file; ignored where unsupported |
