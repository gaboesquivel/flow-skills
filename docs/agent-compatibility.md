# Agent and host compatibility

Flow skills target the [Agent Skills](https://agentskills.io) package layout: `skills/<name>/SKILL.md` with YAML frontmatter. The [skill catalog](skills.md) lists every package, the leading word for each, and when to use each.

## Installation

| Mechanism | Notes |
| --- | --- |
| Claude Code plugin | Primary path ([decision 0062](decisions/0062-claude-code-first.md)). The repository root is the plugin: [`.claude-plugin/plugin.json`](../.claude-plugin/plugin.json), `skills/`, [`hooks/hooks.json`](../hooks/hooks.json), and [`agents/`](../agents/flow-reviewer.md). [`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json) makes the repository its own marketplace: `claude plugin marketplace add gaboesquivel/flow-skills`, then `claude plugin install flow@flow-skills`. A user-scope install reaches the terminal, the desktop app, and IDE extensions, not cloud sessions. Added from a local clone path instead, the plugin loads in place: edits apply at the next session or `/reload-plugins`. `claude --plugin-dir <path-to-flow-skills>` loads a clone for one session. Adds the [plugin hooks](#claude-code) and the `flow-reviewer` agent. |
| Cursor plugin | [`.cursor-plugin/plugin.json`](../.cursor-plugin/plugin.json) discovers the same `skills/`, `agents/`, and the hooks in [`hooks/cursor-hooks.json`](../hooks/cursor-hooks.json). The scripts are the Claude Code ones; the events are `beforeShellExecution` and `sessionStart`. Install this or `npx skills add`, not both, and not also the Claude Code plugin. Cursor cloud agents run the shell guard and do not run `sessionStart` ([decision 0064](decisions/0064-cursor-plugin.md)). **Local testing:** copy the tree into `~/.cursor/plugins/local/flow` (symlinks to a checkout elsewhere are skipped). From a clone, run `node scripts/sync-cursor-local-plugin.mjs [ref]` (default `origin/main`), then **Developer: Reload Window** and confirm the plugin under Customize. On Enterprise, an admin must allow local plugin imports. |
| `npx skills add gaboesquivel/flow-skills` | Skills only, no hooks or reviewer agent, wherever the [skills CLI](https://github.com/vercel-labs/skills) is supported. Choose agent and scope in the installer; Flow does not default to one product. |
| Host skill UI | Some IDEs import a Git URL or local folder directly; behavior matches that host's skill loader. |
| Manual copy | Copy `skills/*` into the host's expected skills directory. You are responsible for paths and updates. |

Flow does not modify adopter `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or similar files, except the opt-in Flow block below.

## Invocation

| Host style | How users run Flow |
| --- | --- |
| Talking or dictation | Say a skill's [leading word](../GLOSSARY.md#leading-word) ("interview me", "spec it", "ship it"); hosts that honor descriptions match the skill. This is the primary interface ([decision 0019](decisions/0019-voice-first-invocation.md)). |
| Slash commands | `/flow`, `/to-spec`, `/build`, … when the host maps skill names to commands |
| Skill picker | Explicit selection by skill name |

Every skill is model-invocable. Matching a phrase to a skill is probabilistic: hosts choose from descriptions, and dictation can mishear. For that reason `start` asks what the request leaves open before writing ([decision 0022](decisions/0022-start-runs-explore.md), amended by [0044](decisions/0044-fast-delivery.md)), each delivery skill keeps one narrow trigger set ("build it"; "ship it", "push it", or "deploy it"; [decision 0048](decisions/0048-delivery-phrases-are-approvals.md)), `build` never merges or writes to the default branch and has every change reviewed by a second agent in a fresh context at the effort its risk tier sets, "push it" touches the default branch only when it is current or named, the plugin's guard hook blocks force-pushes and pushes to the default branch regardless, and a draft that `to-spec` cannot accept stops "build it" or "ship it", so a misheard phrase cannot land an unaccepted spec or an unreviewed risky change; neither asks for a confirmation (decisions [0028](decisions/0028-build-and-ship.md), [0039](decisions/0039-build-never-requires-a-spec.md), and [0044](decisions/0044-fast-delivery.md)). Skills may name the next skill and wait; the only automatic hand-off is `start` → `explore`, behind the user's yes ([decision 0024](decisions/0024-gated-hand-offs.md)).

**Root context alignment** is not guaranteed by implicit `sync-docs` invocation alone. Hosts may skip alignment on ordinary implementation work. The portable contract is: `build` and `review` remind agents to align the current project's `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` when meaningful changes warrant it; adopters can also say "sync the docs".

**Pull request automation** (optional, per repository): [pr-review-contract.md](pr-review-contract.md) is agent-agnostic — any IDE or model can follow it before opening a PR. This repository runs it on request with an OpenAI-compatible API, never in CI; `main` requires a pull request plus passing `validate` and `pr-title` checks. Flow skills do not install workflows or edit adopter instruction files beyond the opt-in Flow block; copy the contract and script when adopting the pattern.

That alignment updates the **current project's** product context. It does not copy this repository's Flow identity into an adopter `PRODUCT.md`. [Decision 0009](decisions/0009-adopter-product-context.md).

`sync-docs` is not a project-start command. Only a `start` request authorizes scaffolding. The optional [`start`](../skills/start/SKILL.md) skill initializes from flow-next or flow-mono, asking only what the request leaves open; the initial commit is its done signal ([decision 0067](decisions/0067-flow-boundaries.md)). When the request describes the product, a worker runs the bootstrap while the main session runs `explore`; hosts without workers bootstrap first, then explore. It does not invoke `sync-docs` automatically.

Metadata and contract tests show the intended invocation split. They do not show that a host matched a spoken phrase to the right skill. Claude Code is recorded as a second agent product for read-only runs; see [smoke scenario status](../tests/smoke/2026-10-27-scenario-status.md).

## Flow mode

"Set up Flow here" writes one Flow block between `<!-- BEGIN FLOW -->` and `<!-- END FLOW -->` in the instruction file Git tracks: `AGENTS.md` when tracked, otherwise `CLAUDE.md`, which then imports `@AGENTS.md` so Claude Code sees both ([decision 0020](decisions/0020-flow-mode.md); the [`sync-docs`](../skills/sync-docs/SKILL.md#flow-block) skill owns the layout). Every host that reads the file sees the block; on hosts without the plugin's SessionStart report, it is the portable stand-in for one. Re-running updates the block in place, including a block from before [decision 0070](decisions/0070-research-and-clearer-names.md) that names the `flow` skill (its `Delivery:` line is kept); deleting it opts out.

`build` slices work with several outcomes, and the host decides whether each slice runs as a subagent, a `/batch` unit, or inline under its concurrency cap ([Slices](../skills/build/SKILL.md#slices), [decision 0060](decisions/0060-slice-by-area.md) as amended by [0062](decisions/0062-claude-code-first.md)); the rules for parallel writers live in [`write-agents`](../skills/write-agents/SKILL.md#sessions). Hosts without workers run the same steps in sequence. The [delivery mode](../GLOSSARY.md#delivery-mode) is inferred, never asked; the block's `Delivery:` line or the request overrides it. The rule lives in [`build`](../skills/build/SKILL.md#delivery-mode). `build` ends with a reviewed, checked branch in both modes and [`ship`](../skills/ship/SKILL.md) lands it. Issues open only on request. [Liveness](../GLOSSARY.md#liveness) needs only Git, the host's deployment status, and one HTTP request; no browser tool.

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

Claude Code ships built-ins that overlap with parts of the method. Flow delegates to them and keeps only what they lack: intent, durable artifacts, spec verdicts, and the delivery gotchas ([decision 0062](decisions/0062-claude-code-first.md), amending [0017](decisions/0017-claude-code-skill-coexistence.md)).

| Flow | Built-in | Use Flow when |
| --- | --- | --- |
| `review` | `/code-review` | Always: the `flow-reviewer` agent runs `/code-review` at the size guard's tier and adds scenario verdicts, scope, glossary, and `DESIGN.md` checks. |
| `explore` | Plan mode | Plan mode plans how to implement a change already chosen; Flow does not claim "plan". Say "explore this" to decide whether and what to build, and "spec it" or "break it down" when the plan should last. |
| `sync-docs`, `start` | `/init`, memory | Product facts belong in root context files. Keep `CLAUDE.md` and memory as pointers, not copies. |
| — | Sessions, worktrees (`claude -w`), `/fork`, compaction, transcripts | Flow retired `handoff`, `tldr`, and `retro`; the host owns hand-offs, recaps, and session history. |
| — | Debugging | Flow retired `debug`; ask the agent directly. |
| `to-tasks` | Session task list | Work needs durable vertical slices or tracker issues. |

Flow retired `simplify`, `security`, and `performance` in favor of `/simplify`, `/security-review`, and host tooling ([decision 0019](decisions/0019-voice-first-invocation.md)). "Review the code" reaches `/code-review` alone; "review it" or "check it against the spec" reaches Flow `review`, which runs `/code-review` too.

### Recommended Claude Code settings

Documented, not forced; set them in your own `settings.json` ([spec 059](specs/059-claude-code-first.md), [decision 0062](decisions/0062-claude-code-first.md)):

- **`worktree.baseRef: "head"`.** Host worktrees (`claude -w`, subagent `isolation: worktree`) start from the current branch's head, so a slice starts from the delivery branch instead of the default branch ([worktrees](https://code.claude.com/docs/en/worktrees.md)).
- **`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` between 4 and 6.** `build` slices work with several outcomes and lets the host size the fan-out; the cap keeps parallel writers, and the runtime state they share, within what one machine and review can absorb ([sub-agents](https://code.claude.com/docs/en/sub-agents.md)).

**Plugin hooks.** Installed as a plugin, Flow registers two hooks from [`hooks/hooks.json`](../hooks/hooks.json) ([hooks](https://code.claude.com/docs/en/hooks.md)). The PreToolUse guard on `Bash` ([`guard.mjs`](../hooks/guard.mjs)) denies force-pushes, pushes to the default branch, `--no-verify`, `gh pr merge --admin`, destructive worktree commands outside the session's directory, and merges whose required checks are not green. The SessionStart report ([`wip.mjs`](../hooks/wip.mjs)) adds kept worktrees, local branches with commits not on the default branch, and open pull requests (when `gh` works) to the new session's context, and prints nothing when there are none or on any error. Both only read; neither writes. They run with your Git and `gh` credentials, and branch protection stays the server-side backstop. The Cursor plugin runs the same scripts from [`hooks/cursor-hooks.json`](../hooks/cursor-hooks.json): `guard.mjs` answers `beforeShellExecution`, and `wip.mjs` answers `sessionStart` in the IDE. Cursor cloud agents run the shell guard only. `npx skills add` installs the skills without the hooks.

Hosts offer no portable skill priority. Each skill's description carries its phrases, and the [skill catalog](skills.md) lists them; you may copy the ones you rely on into your own user-level instructions (for example `~/.claude/CLAUDE.md`). Flow never writes user-level files.

## Native sessions

Since [decision 0062](decisions/0062-claude-code-first.md), Flow leaves sessions and worktrees to the host and keeps only two rules in [`write-agents`](../skills/write-agents/SKILL.md#sessions): isolate shared runtime state, and report sibling work you cannot see. This table is historical context from [decision 0054](decisions/0054-native-capability-first-sessions.md) and [spec 045](specs/045-native-observable-sessions.md). What each host exposed, as of 2026-10-31 ([research](research/2026-10-31-native-sessions.md)):

| Host and surface | Exposed to the agent | Limits |
| --- | --- | --- |
| Claude Code Desktop | Start a session (fresh or forked, own worktree or shared), list sessions it started, message one by ID, hand its own task off. The parent is woken when its linked sessions end a turn, with each child's latest report quoted to 400 characters. Bind a pull request so the app wakes the session on checks, conflicts, and comments. `sync_with_base_branch` merges the base into an app-made worktree. | The app's guidance sends pieces of one task to subagents unless the user asks for sessions; after the user accepts a plan, the agent proposes each independent step as a session card (at most four) and starts its own step. Merging a session's branch needs the user's word, asked with full refs ([spec 052](specs/052-native-session-integration.md)); the app forbids polling CI. A session started from a plain checkout does not start at the delivery head. Desktop does not list every CLI or cloud session. A parent-child tree is not verified. |
| Claude Code CLI | Resume by ID or name; `--fork-session`; `claude agents` monitors background sessions. | Agent-driven creation and UI linkage depend on the installed version. |
| Cursor | CLI `/fork` and `/resume`. | No agent-callable session API, transcript access, or tree established; IDE agent surfaces not inspected. Work in sequence or subagents. |
| Other hosts | — | Portable floor: isolated writers, honest limits, sequential fallback. |

No host run has yet started, inspected, interrupted, and resumed a child session under these rules; the [spec's acceptance scenario](specs/045-native-observable-sessions.md#testing-decisions) remains open. Re-check the host's tools and version before relying on a row.

## Claude Code cloud

Cloud sessions (Claude Code on the web, the mobile app, `claude --cloud`) run Flow with the same phrases ([decision 0055](decisions/0055-capability-based-github-and-host-triggered-builds.md), [spec 046](specs/046-cloud-delivery.md)). Host facts from Claude Code's [cloud environment](https://code.claude.com/docs/en/cloud-environments.md), [routines](https://code.claude.com/docs/en/routines.md), and [usage monitoring](https://code.claude.com/docs/en/monitoring-usage.md) docs, read 2026-10-31:

- **GitHub through a proxy.** `gh` is installed and its token is proxy-injected; GraphQL is blocked, so `gh pr` and `gh issue` return 403 while `gh api` REST calls and the host's GitHub tools work. `ship`'s `gh-route.mjs` script picks the working route, falling back to REST when GraphQL is refused. The proxy refuses branch deletion; branch protection on GitHub still governs `main`.
- **Only repository context loads.** `CLAUDE.md`, `.claude/settings.json`, and `.claude/skills` come from the clone; `~/.claude` (user instructions, user-scope skills and hooks) does not. Install Flow at project scope and commit it; a user-scope install never reaches a cloud session. Whether a symlinked `.claude/skills` loads is checked by the spec's live run.
- **Setup.** An environment's setup script or a repository `SessionStart` hook installs dependencies; repository hooks do not run in multi-repository sessions. Flow itself needs nothing beyond Git and the skills.
- **Moving between local and cloud.** `claude --teleport` continues a cloud session locally (clean tree, branch pushed); `claude --cloud "task"` starts one from the terminal. The SessionStart report lists the branch and pull request either way.
- **Cost.** Cloud sessions keep no local transcript; per-session cost comes only from OpenTelemetry (`claude_code.cost.usage`, keyed by session) set on the environment. `pnpm metrics --usage <file>` reads an export of it; otherwise cloud cost is unknown.

**Issue trigger (optional).** A routine starts a cloud `build` when a repository writer adds the `build-it` label to an issue ([`build` Issue trigger](../skills/build/SKILL.md#issue-trigger)). Ask the agent to create it with the host's scheduling tools (`/schedule`, or the remote-trigger API); the sign-in and the GitHub App consent are yours. Its settings: the repository; no connectors; a GitHub app trigger on `issues.labeled` (the webhook API takes no label filter, and the session receives the issue number in its trigger context); and a stored prompt such as: `A GitHub issues.labeled event fired. If the added label is not exactly build-it, write nothing and stop. Otherwise: build it: that issue, started by the build-it label. First run the build skill's issue-trigger script; if it exits non-zero, comment its reason and stop.` The routine runs as your account and pushes work branches. Its docs do not say who may fire the trigger, so `build`'s gate script (`skills/build/scripts/issue-trigger.mjs`) decides: the labeler and the issue's author need `write` or `admin`. The proxy refuses `collaborators/{user}/permission`; the script treats a user-owned repository's owner as admin, falls back to the collaborators list, and fails closed when neither answers. A live run on 2026-10-31 found that skill text alone did not stop a session when that read failed ([record](../tests/smoke/2026-10-31-cloud-delivery-live.md)). Routines are a research preview with hourly caps.

## Cloud starter setup

Flow starters set up both cloud hosts for [spec 048](specs/048-delivery-lifecycle.md): the draft pull request is the shared workspace, and no git hooks are installed. As of 2026-10-31:

- **Cursor cloud agents** read `AGENTS.md` and the committed `.agents/skills` and `.claude/skills`. The Cursor plugin's shell guard runs once the agent can write; `sessionStart` does not run there. Starters commit `.cursor/environment.json` with an idempotent `install` (`corepack enable && pnpm install --frozen-lockfile`), tracked through a `.gitignore` exception; an environment saved in Cursor's settings or set up by its agent may take precedence over the file. Unverified live (model usage was rate limited on 2026-10-31).
- **Claude Code cloud** loads the repository's `CLAUDE.md`, `.claude/skills`, and `.claude/settings.json` hooks. Starters install dependencies from a `SessionStart` hook that runs only when `CLAUDE_CODE_REMOTE=true`. Whether a symlinked `.claude/skills` loads in cloud remains to be confirmed live.
- **Worktree isolation.** Claude Code's subagent worktree isolation is tied to the session's own repository; a session working in another repository creates the worker's worktree itself under that repository's ignored `.worktrees/` (observed 2026-10-31).

## Verification status

Structural checks (`pnpm validate`, which includes the eval schema check, and `pnpm test`) run in CI on every pull request and on `main`; the npm-pack and Agent Skills CLI listing checks (`pnpm test:release`, in `tests/release/`) run on release tags. Headless slash-command runs in Claude Code are recorded; interactive skill-picker runs and write paths remain open; see [smoke scenario status](../tests/smoke/2026-10-27-scenario-status.md) and [evaluation scenario status](../tests/evals/scenario-status.md).
