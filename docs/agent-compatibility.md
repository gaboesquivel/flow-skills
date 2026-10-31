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

Every skill is model-invocable. Matching a phrase to a skill is probabilistic: hosts choose from descriptions, and dictation can mishear. For that reason `start` asks what the request leaves open before writing ([decision 0022](decisions/0022-start-runs-explore.md), amended by [0044](decisions/0044-fast-delivery.md)), each delivery skill keeps one narrow trigger set ("push it", "build it", "ship it"; [decision 0048](decisions/0048-delivery-phrases-are-approvals.md)), `build` never merges or writes to the default branch and runs the independent review whenever the size guard escalates a change, `push` touches the default branch only when it is current or named, and a draft that `to-spec` cannot accept stops "build it" or "ship it", so a misheard phrase cannot land an unaccepted spec or an unreviewed risky change; neither asks for a confirmation (decisions [0028](decisions/0028-build-and-ship.md), [0039](decisions/0039-build-never-requires-a-spec.md), and [0044](decisions/0044-fast-delivery.md)). Skills may name the next skill and wait; the only automatic hand-offs are `start` → `explore` and explore's `interview` questions and, for a new product, its `grill`, each behind the user's yes ([decision 0024](decisions/0024-gated-hand-offs.md)).

**Root context alignment** is not guaranteed by implicit `flow` invocation alone. Hosts may skip alignment on ordinary implementation work. The portable contract is: `build` and `review` remind agents to align the current project's `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` when meaningful changes warrant it; adopters can also say "update the docs".

**Pull request automation** (optional, per repository): [pr-review-contract.md](pr-review-contract.md) is agent-agnostic — any IDE or model can follow it before opening a PR. This repository runs an OpenAI-compatible CI job on `pull_request` from base-commit code; `main` requires a pull request plus passing `validate` and `pr-title` checks (`context-review` runs only when the repository variable `CONTEXT_REVIEW` is `on`) ([decision 0047](decisions/0047-trusted-review-and-local-record-checks.md)). Flow skills do not install workflows or edit adopter instruction files beyond the opt-in Flow block; copy the contract and script when adopting the pattern.

That alignment updates the **current project's** product context. It does not copy this repository's Flow identity into an adopter `PRODUCT.md`. [Decision 0009](decisions/0009-adopter-product-context.md).

`flow` is not a project-start command. Only a `start` request authorizes scaffolding. The optional [`start`](../skills/start/SKILL.md) skill initializes from flow-next or flow-mono, asking only what the request leaves open; the first green deployment is the done signal ([decision 0044](decisions/0044-fast-delivery.md)). A worker runs the bootstrap while the main session hands the conversation to `explore`; hosts without workers bootstrap first, then explore. It does not invoke `flow` automatically.

Metadata and contract tests show the intended invocation split. They do not show that a host matched a spoken phrase to the right skill. Claude Code is recorded as a second agent product for read-only runs; see [smoke scenario status](../tests/smoke/2026-10-27-scenario-status.md).

## Flow mode

"Set up Flow here" writes one Flow block between `<!-- BEGIN FLOW -->` and `<!-- END FLOW -->` in the instruction file Git tracks: `AGENTS.md` when tracked, otherwise `CLAUDE.md`, which then imports `@AGENTS.md` so Claude Code sees both ([decision 0020](decisions/0020-flow-mode.md); the [`flow`](../skills/flow/SKILL.md#flow-block) skill owns the layout). Every host that reads the file sees the phrases; this is the portable stand-in for a session-start hook. Re-running updates the block in place; deleting it opts out.

Independent work runs in parallel when it pays, through parallel tool calls, subagents, or native observable sessions as the host allows; the rule lives in [`write-agents`](../skills/write-agents/SKILL.md#workers) ([decision 0053](decisions/0053-delivery-appetite-and-scope.md), amending [0044](decisions/0044-fast-delivery.md); [decision 0054](decisions/0054-native-capability-first-sessions.md)). Hosts without workers run the same steps in sequence. The [delivery mode](../GLOSSARY.md#delivery-mode) is inferred, never asked; the block's `Delivery:` line or the request overrides it. The rule lives in [`build`](../skills/build/SKILL.md#delivery-mode). `build` ends with a reviewed, checked branch in both modes and [`ship`](../skills/ship/SKILL.md) lands it. Issues open only on request. [Liveness](../GLOSSARY.md#liveness) needs only Git, the host's deployment status, and one HTTP request; no browser tool.

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

## Native sessions

`write-agents` prefers a native, observable session for a substantial vertical slice and falls back to subagents or sequential work ([decision 0054](decisions/0054-native-capability-first-sessions.md), [spec 045](specs/045-native-observable-sessions.md)). What each host exposes, as of 2026-10-31 ([research](research/2026-10-31-native-sessions.md)):

| Host and surface | Exposed to the agent | Limits |
| --- | --- | --- |
| Claude Code Desktop | Start a session (fresh or forked, own worktree or shared), list sessions it started, message one by ID, hand its own task off. | The app's guidance sends pieces of one task to subagents unless the user asks for sessions; otherwise the agent proposes a session the user starts with one click. Desktop does not list every CLI or cloud session. A parent-child tree is not verified. |
| Claude Code CLI | Resume by ID or name; `--fork-session`; `claude agents` monitors background sessions. | Agent-driven creation and UI linkage depend on the installed version. |
| Cursor | CLI `/fork` and `/resume`. | No agent-callable session API, transcript access, or tree established; IDE agent surfaces not inspected. Work in sequence or subagents. |
| Other hosts | — | Portable floor: isolated writers, honest limits, sequential fallback. |

No host run has yet started, inspected, interrupted, and resumed a child session under these rules; the [spec's acceptance scenario](specs/045-native-observable-sessions.md#testing-decisions) remains open. Re-check the host's tools and version before relying on a row.

## Claude Code cloud

Cloud sessions (Claude Code on the web, the mobile app, `claude --cloud`) run Flow with the same phrases ([decision 0055](decisions/0055-capability-based-github-and-host-triggered-builds.md), [spec 046](specs/046-cloud-delivery.md)). Host facts from Claude Code's [cloud environment](https://code.claude.com/docs/en/cloud-environments.md), [routines](https://code.claude.com/docs/en/routines.md), and [usage monitoring](https://code.claude.com/docs/en/monitoring-usage.md) docs, read 2026-10-31:

- **GitHub through a proxy.** `gh` is installed and its token is proxy-injected; GraphQL is blocked, so `gh pr` and `gh issue` return 403 while `gh api` REST calls and the host's GitHub tools work. `build`'s [Reaching GitHub](../skills/build/SKILL.md#delivery-mode) takes the working route. The proxy refuses branch deletion; branch protection on GitHub still governs `main`.
- **Only repository context loads.** `CLAUDE.md`, `.claude/settings.json`, and `.claude/skills` come from the clone; `~/.claude` (user instructions, user-scope skills and hooks) does not. Install Flow at project scope and commit it; a user-scope install never reaches a cloud session. Whether a symlinked `.claude/skills` loads is checked by the spec's live run.
- **Setup.** An environment's setup script or a repository `SessionStart` hook installs dependencies; repository hooks do not run in multi-repository sessions. Flow itself needs nothing beyond Git and the skills.
- **Moving between local and cloud.** `claude --teleport` continues a cloud session locally (clean tree, branch pushed); `claude --cloud "task"` starts one from the terminal. `build`'s Work in flight finds the branch and pull request either way.
- **Cost.** Cloud sessions keep no local transcript; per-session cost comes only from OpenTelemetry (`claude_code.cost.usage`, keyed by session) set on the environment. `pnpm metrics --usage <file>` reads an export of it; otherwise cloud cost is unknown.

**Issue trigger (optional).** A routine starts a cloud `build` when a repository writer adds the `build-it` label to an issue ([`build` Issue trigger](../skills/build/SKILL.md#issue-trigger)). Ask the agent to create it with the host's scheduling tools (`/schedule`); the sign-in and the GitHub App consent are yours. Its settings: the repository; a GitHub trigger on issues, action `labeled`, filtered to the label `build-it`; and the stored prompt `build it: issue #{number} in {owner}/{repo}, started by the build-it label`. The routine runs as your account and its runs push work branches. Its docs do not say who may fire the trigger, so `build` checks the labeler's permission itself and stops for anyone below `write`. Routines are a research preview with hourly caps. The webhook API takes no label filter, so the stored prompt must stop on any other label. A live run on 2026-10-31 found the session proceeding when the proxy blocked the permission read ([record](../tests/smoke/2026-10-31-cloud-delivery-live.md)): until that gate is enforced, enable the trigger only where every account that can add labels has `write` access.

## Verification status

Structural checks (`pnpm validate`, which includes the eval schema check, and `pnpm test`) run in CI on every pull request and on `main`; the npm-pack and Agent Skills CLI listing checks (`pnpm test:release`, in `tests/release/`) run on release tags. Headless slash-command runs in Claude Code are recorded; interactive skill-picker runs and write paths remain open; see [smoke scenario status](../tests/smoke/2026-10-27-scenario-status.md) and [evaluation scenario status](../tests/evals/scenario-status.md).
