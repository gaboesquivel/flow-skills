# 060 — Host delegation, round two

Status: draft (2026-11-03).

Decision: [0063](../decisions/0063-decision-record-threshold.md) (Proposed). Depends on [spec 059](059-claude-code-first.md).

## Problem Statement

Spec 059 moved worktrees, sessions, review and the PR lifecycle to Claude Code, but the catalog still does by hand some jobs the host already does:

- `build` describes looping until done in prose instead of setting `/goal`.
- The guard checks required checks on every merge, even where branch protection already enforces them.
- `council` runs its own fan-out instead of a dynamic workflow.
- The Flow block in CLAUDE.md holds a `Delivery:` override that plugin user config can hold.

The repo also records a decision for choices that are cheap to reverse, about 60 records in 10 days.

The bet: **delegating these jobs to Claude Code keeps idea → prod and safety no worse than spec 059's Flow, measured against its baseline.**

## Solution

- **`build` Verify sets a `/goal`** with the done condition: focused checks pass, `flow-reviewer` reports no Important finding, and the PR is ready. Stop after 20 turns. Where `/goal` isn't available, `build` keeps its existing steps.
- **The merge gate defers to branch protection.** The guard skips `required-checks.mjs` when the base branch's protection or rulesets require status checks. It still gates merges on unprotected branches, and still denies `--admin`.
- **`council` runs its seats as a dynamic workflow** when the host offers one, and as subagents otherwise. The evidence packet, the six reviewer return fields and the adversarial seat stay.
- **The `Delivery:` override moves to plugin user config.** `flow` writes the CLAUDE.md block only for installs without the plugin. `gh-route.mjs` and the guard read the plugin config first, then the block.
- **One Flow install: the plugin, at user scope.** flow-skills ships `.claude-plugin/marketplace.json`, and the maintainer installs `flow@flow-skills` once globally. Vendored Flow skills are removed everywhere:
  - globally from `~/.claude/skills` and `~/.agents/skills`
  - from `.agents/skills` and `skills-lock.json` in flow-next, flow-mono, gaboesquivel.com and flow-factory

  Each repo keeps its non-Flow skills untouched. No repo enables the plugin in project settings.
- **Decision-record threshold** ([0063](../decisions/0063-decision-record-threshold.md)). A choice gets a record only when it chose among real alternatives and is costly to reverse or reaches beyond one spec. `to-spec` and AGENTS.md say so.

## User Stories

1. As a maintainer saying "build it", I see a `/goal` set with the done condition, and the session keeps going until the condition is met or 20 turns pass.
2. As a maintainer merging on a protected branch, `gh pr merge` isn't delayed by the guard's gate. On an unprotected branch it still is.
3. As a maintainer saying "ask the council", the seats run in parallel through the host, and I get the same packet-based synthesis.
4. As a plugin user, I set local delivery in the plugin's config, and no block is written into my CLAUDE.md.
5. As the maintainer on any of my repos, the only Flow skills that load are the plugin's (`flow:build` and so on). No stale copy shadows them, and every other skill in the repo is still there.
6. Failure case: the protection lookup fails (no `gh`, or the network is down), so the guard keeps the gate. It fails closed for merges.

## Implementation Decisions

- **Protection lookup:** `gh api repos/{o}/{r}/branches/{base}/protection/required_status_checks` and rulesets for the base. Cache per session in memory only. Time out in 1.5 s, and on any error keep the gate.
- **Plugin config:** a `userConfig` entry `delivery` (`github` | `local`) in `plugin.json`. Verify the field against the plugins reference before building; if it doesn't exist, keep the block and record why.
- **`/goal` condition** lives in one sentence in `build`'s Outcome, which already holds the done condition.
- **Cleanup per repo:** remove only the directories whose `skills-lock.json` source is `gaboesquivel/flow-skills`, plus their lock entries. flow-factory's older Flow skills (`implement`, `to-tickets`, and others) count as Flow. Each repo gets one PR. AGENTS.md or CLAUDE.md say Flow comes from the plugin; the Flow block stays until the plugin config replaces it.
- **Global cleanup:** delete Flow-sourced folders from `~/.claude/skills` and `~/.agents/skills`, after listing them and getting the user's yes, since it deletes files. Keep agent-browser, treg, lead-signals, recruit, make-ugc, skill-creator, find-skills and the rest.
- **Exposure:** nothing deployable. Hooks run locally.

## Testing Decisions

- Guard fixtures with a stubbed `gh`: a protected base with required checks skips the gate; an unprotected base gates; a failed lookup gates; `--admin` is always denied.
- `gh-route` fixtures: the config value overrides the block, and the block overrides inference.

**Acceptance scenario.** A maintainer on flow-skills, with the plugin installed and spec 059's baseline recorded:

1. "Build it" on a small spec sets a `/goal`. The session stops once the condition holds, with no "continue" typed.
2. "Ship it" on PR to protected `main` merges without the guard's gate. The same merge in a scratch repo without protection is gated.
3. "Ask the council" on a decision returns the synthesis with one reviewer return per seat and the adversarial seat present.
4. On flow-next, flow-mono, gaboesquivel.com and flow-factory, a fresh session lists Flow skills only as `flow:*`, and each repo's other skills are unchanged (diff of `.agents/skills` shows only Flow folders removed). `pnpm validate` in flow-skills no longer warns about shadowing copies in `~/.claude/skills`.
5. Setting `delivery: local` in plugin config makes `gh-route.mjs` report local mode, and `flow` writes no block.
6. Rerunning spec 059's comparison shows idea → prod and failures no worse than 059's Flow run. If not, the record says so and this spec doesn't ship.

## Appetite

Two days of agent work after spec 059 lands. The first slice is the merge-gate change, which is guard-only and testable offline. If time runs out, the `council` workflow gives way first.

## Direction changes

Confirmed by the maintainer on 2026-11-03: [0061](../decisions/0061-eve-default-agent-runtime.md) item 3 changes. Flow Skills are no longer committed under `.agents/skills/` in the starters; Flow comes from the plugin installed at user scope.

## Out of Scope

- Removing or consolidating non-Flow skills in any repo; for example, gaboesquivel.com keeps all of its other skills.

- More word trims (`build` to ~800, a spec template loaded on demand, `write-agents` reduced). They're deferred until the baseline shows where the cost is.
- Moving rules to `.claude/rules`, and permission-rule replacements for the guard.
- GitHub automation: a `claude-code-action` workflow for the issue trigger, OTel metrics, and Managed Code Review.
- Pruning evals and replacing the wording pins.

## Further Notes

- Gated on evidence: this spec doesn't merge before spec 059's task 02 baseline is recorded.
- Open assumptions:
  - Plugin `userConfig` exists and can be read from hooks.
  - Dynamic workflows can be started from a skill without the `ultracode` keyword; otherwise `council` asks the user to opt in.
