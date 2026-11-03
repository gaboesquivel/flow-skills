# 059 — Claude Code first

Status: draft (2026-11-03).

Decision: [0062](../decisions/0062-claude-code-first.md) (Proposed).

## Problem Statement

Flow restates what Claude Code now does natively. 21,524 SKILL.md words load across 26 skills. About 1,350 of them cover worktrees and sessions, about 1,000 cover the pull request lifecycle and merging, and about 600 cover review passes that `/code-review` already runs. The rules that must always hold are prose, and Flow ships no hooks. A maintainer pays for this in tokens and in rules the model may skip. An adopter gets a heavier catalog than the work needs, with no evidence it beats running with no skills ([spec 041](041-skill-evaluation.md) has not run its comparison).

The bet: **Flow rebuilt on Claude Code's built-ins, with hooks and about half the words, delivers at least as fast and as safely as today's Flow.**

## Solution

Flow becomes a Claude Code plugin:

- **Skills**, cut to the judgment the host lacks.
- **One guard hook** that blocks the unsafe Git and merge operations.
- **A SessionStart report** of work in flight.
- **A reviewer agent** that runs `/code-review` and adds spec verdicts.
- **A few scripts** for deterministic procedures.

Worktrees, sessions, subagent sizing, PR monitoring, review passes, looping, handoffs and logging all move to the host.

## User Stories

1. As a maintainer, I install the Flow plugin. A `git push --force`, a push to `main`, a commit with `--no-verify` or a `gh pr merge --admin` is blocked with a reason, whatever the model decided.
2. As a maintainer, I say "build it" on a multi-area spec. Claude slices by area and decides how to fan out within the concurrency cap. No skill text tells it how to manage worktrees.
3. As a maintainer, "build it" ends with a `/goal`-style condition: focused checks pass, the reviewer reports no Important finding, and the pull request is ready. Review runs `/code-review` at the size guard's tier, plus the spec's scenario verdicts.
4. As a maintainer starting a session, I see kept worktrees, unmerged branches and open pull requests without asking.
5. As an adopter on another host, I can still install the skills with `npx skills add` and get the methodology without enforcement.
6. Failure case: when a hook can't parse a command, it allows it and logs nothing. It fails open for parsing and closed only for the patterns it matches. Branch protection stays the server-side backstop.

## Implementation Decisions

- **Plugin layout:** `.claude-plugin/plugin.json` at the repository root. `skills/` stays where it is, and new `hooks/hooks.json`, `agents/` and `scripts/` directories are added. `npx skills add` keeps working from `skills/`.
- **Guard hook** (`hooks/guard.mjs`, PreToolUse on `Bash`) denies with `permissionDecision: "deny"` and a reason:
  - force-push in any form (`--force`, `-f`, `--force-with-lease`, a `+ref`)
  - push to the default branch
  - `--no-verify`
  - `gh pr merge --admin`
  - `git worktree remove`, `reset --hard` or `clean -f` outside the session's working directory
  - `gh pr merge` while `required-checks.mjs` fails on the head

  It is pure Node with no dependencies, and it reads the default branch from `git symbolic-ref refs/remotes/origin/HEAD`.
- **SessionStart hook** (`hooks/wip.mjs`): prints `git worktree list`, branches with commits not on the default branch, and open pull requests when `gh` works. It stays silent on errors.
- **Scripts** that move out of prose:
  - `liveness.mjs`: the 5 liveness states now described in `ship`
  - `gh-route.mjs`: infer the delivery mode and pick the GitHub route, including the REST fallback when GraphQL is refused
  - `next-number.mjs`: promoted into `to-spec`
  - Kept: `required-checks.mjs`, `issue-trigger.mjs`, `board.mjs`, `flow-block.mjs`, `start/lib/*`
- **Reviewer agent** (`agents/flow-reviewer.md`): runs `/code-review <tier>` on the head. It adds per-step scenario verdicts (satisfied, unmet, unresolved), the scope check, glossary naming and the DESIGN.md UI checks. It keeps 0058's three-round cap and Important/Nit/Pre-existing labels.
- **Recommended adopter settings**, documented and not forced: `worktree.baseRef: "head"`, and `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` set between 4 and 6.
- **Catalog after the cut:**
  - **Skills:** `explore` (absorbs `interview` and `grill`), `to-spec`, `to-tasks`, `build`, `review`, `ship` (absorbs `push`), `flow`, `start`, `domain-modeling`, `design` (absorbs prototype's UI variants), `product` (merges `align` and `measure`), `council`, `write-agents`.
  - **Removed:** `handoff`, `tldr`, `debug`, `retro`, `board`, `prototype`, `push`. `board.mjs` stays as a script.
  - **On trial:** `jtbd`, `competitors` and `write-humans` stay only if each beats no skill on one scenario.
- **What is removed** from `write-agents`, `build`, `ship` and `review`:
  - **`write-agents`:** Sessions, apart from about 150 words on isolating runtime state and reporting unknowns. Also Workers, the Tools ladder detail, the Repository rule, prompt logs and progress notes.
  - **`build`:** Work in flight, the Task set mechanics, the Pull request lifecycle, Reaching GitHub, and the worker mandate in Slices.
  - **`ship`:** the merge mechanics.
  - **`review`:** the effort mechanics and the generic axes.
  - **Everywhere:** the 15 repeated `git init` lines become one line.
- **What stays:** the spec lifecycle and acceptance, slices with `Area:` and blockers, the size guard and the Human tier, the scope guard, the test policy, data changes, the direction-change gate, shared language, context freshness, the prevention ladder, and the delivery phrases as approvals.
- **Flow block:** drop the PHRASES table and the no-Node fallback. The block keeps the `Delivery:` override and a pointer.
- **Exposure:** nothing deployable. The hooks run on the adopter's machine with the user's own Git and `gh` credentials. They only deny and never write.

## Testing Decisions

**Behavior and checks:**

- `tests/guard.test.mjs` feeds the hook PreToolUse JSON fixtures and asserts deny or allow. Run it with `node --test tests/guard.test.mjs`.

  | Command | Expected |
  | --- | --- |
  | `git push --force origin spec/059-x` | deny |
  | `git push origin HEAD:main` | deny |
  | `git commit -m x --no-verify` | deny |
  | `gh pr merge 12 --admin` | deny |
  | `git push origin spec/059-x` | allow |
  | `git commit -m "fix: --no-verify docs"` | allow (quoted message) |
  | an unparseable heredoc | allow |

- Invariants:
  - The hook never writes.
  - It exits within 2 seconds.
  - A deny always gives a reason.
- `pnpm validate` updates `EXPECTED_SKILL_NAMES` and checks `plugin.json`, `hooks.json` and the agent frontmatter.
- `pnpm context` reports total SKILL.md words, and validation fails above 10,000.
- No new live-model checks in CI. The comparison runs on demand, as spec 041 describes.

**Acceptance scenario.** A maintainer on flow-skills, with the plugin installed from this branch:

1. Before any skill edit, they run spec 041's comparison on one representative small task (current Flow vs no skills, same model and host, isolated worktrees). They record it in `tests/evals/records/2026-11-DD-build-vs-no-skills.md`, with elapsed time, user turns, CI failures, unauthorized actions, and cost or `unknown`.
2. They start a new session. The SessionStart report lists the kept worktrees and open pull requests that `git worktree list` and `gh pr list` show.
3. They ask Claude to run `git push --force origin HEAD`. The hook blocks it with a reason, and nothing is pushed.
4. On a spec with two disjoint areas, they say "build it". Claude names two slices. Fan-out is the host's choice, and no inline reason is required. The review uses `/code-review` at the size-guard tier plus scenario verdicts. The pull request opens ready with green checks.
5. They say "ship it". The merge goes through the gate. `liveness.mjs` reports `deployed` or `pushed, no deployment reported`.
6. They rerun step 1's comparison with the rebuilt Flow. The record shows idea → prod and failures no worse than step 1's Flow run, and `pnpm context` reports at most 10,000 skill words. If it is worse, the record says so and the spec doesn't ship.

## Appetite

One week of maintainer-directed agent work. The first slice that can be verified is the guard hook with its tests and `plugin.json`, which ships no skill changes. Then come the baseline comparison, the cut to the worktree and session layer, review on `/code-review`, the catalog merges, and the rerun. If time runs out, the catalog merges (`explore`, `product`, the skills on trial) give way first, and the hook and the session-layer cut stay. Start and end: not measured.

## Direction changes

Confirmed by the maintainer on 2026-11-03 and recorded in [0062](../decisions/0062-claude-code-first.md):

- **PRODUCT.md principle 6 and Definition:** "Portable by design" and "agent-agnostic" become "Claude Code first, portable where it's free".
- **[0060](../decisions/0060-slice-by-area.md) item 2:** "every slice runs as a worker" becomes the host deciding, within a concurrency cap.
- **[0017](../decisions/0017-claude-code-skill-coexistence.md):** coexisting with built-ins becomes delegating to them.
- **[0004](../decisions/0004-portable-skill-catalog.md):** distribution adds a Claude Code plugin with hooks, and `npx skills add` remains for skills only.

## Out of Scope

- Agent teams and dynamic workflows as dependencies.
- Managed Code Review setup and GitHub Actions changes.
- Rewriting the flow-next and flow-mono starters, beyond pointing them at the plugin later.
- Changes to the site (`site/`), other than what renders automatically from the edited Markdown.
- Hooks for testing or formatting. Tests stay in the `/goal` condition and CI.

## Further Notes

- Evidence:
  - The Claude Code docs fetched on 2026-11-03: worktrees, sub-agents, workflows, goal, hooks, code-review, memory and skills.
  - An audit of every SKILL.md at 89562c0.
- Open assumptions:
  - Plugin hooks load reliably in desktop, CLI and cloud sessions.
  - `claude plugin eval` is available for the on-trial skills. The docs and the host disagree, so fall back to spec 041's manual comparison.
  - The cloud has no documented auto-merge, so `ship` keeps a `gh` merge path.
  - The word estimates come from an audit, not a measurement.
- Next: "break it down" for tasks, then "build it".
