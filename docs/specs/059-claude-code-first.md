# 059 — Claude Code first

Status: implemented (2026-11-03).

Decision: [0062](../decisions/0062-claude-code-first.md) (Accepted).

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
5. They say "ship it". The merge goes through the gate. `liveness.mjs` reports `live` or `pushed, no deployment reported`.
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
- Results: [Flow vs no skills, 2026-11-03](../../tests/evals/records/2026-11-03-build-vs-no-skills.md). Final catalog: 13 skills, 9,182 SKILL.md words. The rerun found and fixed one regression (the work-in-flight report now names changed areas).

## Tasks

Sequencing note (2026-11-03): task 02's baseline worktrees are pinned to the pre-spec commit 89562c0, so later skill edits on this branch cannot change what it measures. Tasks 03–07 proceeded while 02 waited on CLI sign-in; 02 still runs against 89562c0, and 08 compares against it.


- [x] 01: Guard hook in a plugin shell
- [x] 02: Baseline: current Flow vs no skills
- [x] 03: Hand the session and worktree layer to the host
- [x] 04: Move GitHub and merge procedure into scripts
- [x] 05: Review on `/code-review`
- [x] 06: Merge the discovery skills (on-trial `jtbd`, `competitors`, `write-humans` tied with no skill and were removed)
- [x] 07: Retire host-covered skills and sweep the catalog
- [x] 08: Rerun the comparison and close

### 01: Guard hook in a plugin shell

**What to build:** Flow installs as a Claude Code plugin. Its PreToolUse guard blocks force-pushes, pushes to the default branch, `--no-verify`, `gh pr merge --admin`, destructive worktree commands outside the session's directory, and merges whose required checks are not green. No skill changes.

**Area:** .claude-plugin, hooks, tests, scripts

**Blocked by:** None (can start immediately)

- [x] Every deny and allow fixture in Testing Decisions passes (`node --test tests/guard.test.mjs`)
- [x] Each deny gives a reason. Unparseable commands are allowed. The hook never writes and exits within 2 seconds.
- [x] `pnpm validate` checks `plugin.json` and `hooks.json`
- [x] Installing the plugin from this branch blocks `git push --force` in a live session (acceptance step 3)

### 02: Baseline: current Flow vs no skills

**What to build:** spec 041's comparison runs on one representative small task: current Flow against no skills, with the same model and host, in isolated worktrees from the same commit. This is the yardstick for every later cut.

**Area:** tests/evals

**Blocked by:** None (can start immediately)

- [x] The record in `tests/evals/records/` gives elapsed time, user turns, retries, CI failures, unauthorized actions, cost or `unknown`, and limitations
- [x] `pnpm eval:check` passes
- [x] It runs before any skill edit on this branch lands

### 03: Hand the session and worktree layer to the host

**What to build:** a new session prints work in flight (kept worktrees, unmerged branches, open pull requests) through a SessionStart hook. `write-agents` and `build` stop describing worktrees, sessions, integration owners, worker mechanics, progress notes and prompt logs. Two rules stay: isolate shared runtime state, and report sibling work you can't see. `build` keeps slicing by area and lets the host size the fan-out under a concurrency cap.

**Area:** hooks, skills/write-agents, skills/build, docs/agent-compatibility.md

**Blocked by:** 01 (shares the hook configuration), 02

- [x] Opening a session in a repository with a kept worktree and an open pull request lists both (acceptance step 2). The hook is silent on errors.
- [x] The recommended settings are documented: `worktree.baseRef: "head"`, and a subagent concurrency cap of 4–6
- [x] `write-agents` Sessions is about 150 words. Workers, the Repository rule, prompt logs and progress notes are gone, and the `git init` offer is one line.
- [x] `build` drops Work in flight, the Task set merge mechanics and the rule that an inline slice must name a reason

### 04: Move GitHub and merge procedure into scripts

**What to build:** `ship` merges through the gate and reports liveness from a script. Route selection between `gh` and REST is a script. `ship` absorbs `push`. The prose for the pull request lifecycle, Reaching GitHub, merge mechanics and the five liveness states shrinks to "run it". Desktop auto-merge is preferred, and the `gh` merge path stays for CLI and cloud.

**Area:** skills/ship, skills/push, skills/build, scripts

**Blocked by:** 02, 03 (both edit `build`)

- [x] `liveness.mjs` reports each of the five states against fixtures, and "ship it" ends with its output (acceptance step 5)
- [x] `gh-route.mjs` infers the delivery mode and falls back to REST when GraphQL is refused (fixture test)
- [x] "Push it" still pushes a branch and reports liveness, now through `ship`
- [x] `build` Pull request and Delivery mode each fit a few lines that point to the scripts

### 05: Review on `/code-review`

**What to build:** "review it" and `build`'s Verify run a Flow reviewer agent. It calls `/code-review` at the size-guard tier and adds per-step scenario verdicts, the scope check, glossary naming and the DESIGN.md UI checks. It keeps the three-round cap and the Important/Nit/Pre-existing labels. The generic axes and effort mechanics leave `review`.

**Area:** agents, skills/review

**Blocked by:** 02

- [ ] Reviewing a branch with one unmet scenario step reports `unmet` with evidence, plus `/code-review`'s findings (not yet run live)
- [x] The tiers map to `/code-review` levels: Quick → low, Standard → medium, Deep → high
- [ ] `review` is about 350 words, and `pnpm validate` checks the agent frontmatter (2026-11-03: 421 words; validation checks the agent frontmatter)

### 06: Merge the discovery skills

**What to build:** `explore` absorbs `interview` and `grill`. A new `product` skill merges `align` and `measure`. `design` absorbs prototype's UI variants. `jtbd`, `competitors` and `write-humans` each stay only if they beat no skill on one scenario.

**Area:** skills/explore, skills/interview, skills/grill, skills/align, skills/measure, skills/design, skills/prototype, skills/jtbd, skills/competitors, skills/write-humans, tests/evals

**Blocked by:** 02

- [x] "Interview me", "grill this", "are we building the right thing" and "measure our progress" still reach the right behavior through the merged skills
- [x] Each on-trial skill has a recorded comparison against no skill, and the losers are removed
- [x] What stays: the direction-change gate, a guess on each question, pre-mortem and kill criterion, the journey-to-capability map, the gap taxonomy, and alternatives rendered in context

### 07: Retire host-covered skills and sweep the catalog

**What to build:** `handoff`, `tldr`, `debug`, `retro` and `board` leave the catalog, and `board.mjs` stays as a script. `to-spec` ships `next-number`. The Flow block drops PHRASES and the no-Node fallback. References to removed skills and sections are cleaned up across the catalog. The catalog docs, PRODUCT.md and AGENTS.md describe the plugin and the new catalog, and the total SKILL.md word count is enforced.

**Area:** skills, scripts, docs, tests, PRODUCT.md, AGENTS.md, README.md, GLOSSARY.md

**Blocked by:** 03, 04, 05, 06

- [x] `pnpm validate` and `pnpm test` pass with the new `EXPECTED_SKILL_NAMES`
- [x] `pnpm context` reports at most 10,000 SKILL.md words, and validation fails above that
- [x] No skill links a removed skill or section (`check-doc-links` and a grep stay clean)
- [x] `to-spec` numbering works from the installed skill

### 08: Rerun the comparison and close

**What to build:** task 02's comparison reruns with the rebuilt Flow, and the full acceptance scenario is walked through on flow-skills.

**Area:** tests/evals, docs/specs

**Blocked by:** 07

- [x] The record shows idea → prod and failures no worse than task 02's Flow run, or says the spec doesn't ship
- [x] Every acceptance scenario step has a verdict

Acceptance verdicts (2026-11-03):

1. Satisfied: [`tests/evals/records/2026-11-03-build-vs-no-skills.md`](../../tests/evals/records/2026-11-03-build-vs-no-skills.md), rounds 1–2.
2. Satisfied: `node hooks/wip.mjs` on flow-skills listed both kept worktrees, the unmerged `spec/060-host-delegation` branch with its changed areas, and open pull request #230, matching `git worktree list` and `gh pr list`.
3. Satisfied: the record's live guard check denied `git push --force` and the remote stayed put.
4. Satisfied: "build it" on spec 061 (two disjoint areas) named two slices from its `Area:` lines, ran them in parallel, reviewed each acceptance step with a verdict, and opened #235 ready with green checks.
5. Satisfied: after #233 merged, `liveness.mjs` reported `pushed, no deployment reported` for `main` at `22d5423`.
6. Satisfied: the record's step 6 gate (idea → prod and failures no worse, skill words under 10,000).
