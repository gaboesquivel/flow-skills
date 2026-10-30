# 041 — Skill evaluation against real delivery

Status: accepted (2026-10-30).

## Problem Statement

Flow's main metric is idea → prod ([PRODUCT.md Success](../../PRODUCT.md#success)). `pnpm metrics` reports it for linked changes, and `tests/evals/` records structural contracts, live runs, and optional comparisons between skill versions. However, nothing shows whether a skill makes delivery faster than an agent working with no skills at all. Without that, skill edits are justified by shorter wording or intuition rather than by results, and a skill that adds turns, retries, or cost goes unnoticed.

## Solution

Evaluate skills against real delivery in three layers, without adding infrastructure:

1. **CI stays fast.** PR CI runs only the existing structural tests, fixtures, and `pnpm eval:check`. Skill behavior testing (live runs and with/without comparisons) runs on demand only, never in PR CI.
2. **Measure real usage.** Extend `pnpm metrics` so each linked change reports the skills it invoked, its starting prompt, its shipped result (merge or deploy), elapsed time, user turns, CI failures, and rework, plus cost where the host log exposes it. Anything the logs cannot provide is reported as `unknown`, never as zero.
3. **Compare against no skills.** When a skill's value is uncertain, or someone proposes a meaningful change to a skill, run the same task twice: once with Flow and once without any skills. Both runs use the same model, the same host, and isolated copies of the same project state. Each comparison is recorded under `tests/evals/records/`.

A skill change is justified by observed results: a lower idea → prod time, or fewer turns, retries, or less cost, with no more delivery failures or unauthorized actions.

## User Stories

1. As a maintainer, I run `pnpm metrics` and see, per change, which skills ran and what the change cost in time, turns, CI failures, and rework, so I can find the skills that slow delivery.
2. As a maintainer who wants to change a skill, I run one with-Flow and one without-Flow comparison on a representative task, so I can see whether the skill earns its place.
3. As a reviewer, I see `unknown` where the host log has no data, so I never read missing data as a good result.
4. As a contributor, my PR's CI time is unchanged by this work.

## Implementation Decisions

- **Real usage lives in `scripts/metrics.mjs`.** Reuse its session-log join (Claude Code `~/.claude/projects`). Add per-change fields for skills invoked, CI failures on the PR, rework (commits after the first review or CI failure; this definition is provisional), and cost if the log records it. Add a per-skill rollup: number of changes, and median idea → prod and user turns. Other hosts stay unlinked, as they are today.
- **Unknown is explicit.** Every field the logs cannot produce prints `unknown`, and medians exclude those changes.
- **A no-skill comparison is a new condition in the existing blinded-comparison procedure** ([tests/evals/README.md](../../tests/evals/README.md#blinded-comparisons)). The baseline condition is "no Flow skills installed" rather than "previous skill version". The record names the model, host, starting commit, and isolation method, and reports the same fields `pnpm metrics` reports, plus authorization breaches. One run per condition is enough to start; repeat when the difference is small or noisy.
- **Isolation.** Each condition runs in its own clone or worktree created from the same commit, with skills disabled in the baseline (for example, no `.claude/skills` link and no globally installed Flow skills). Never use the active workspace.
- No new decision record: this extends spec 034's measurement and spec 006's evaluation model and does not choose among new alternatives.

## Testing Decisions

- Extend `tests/metrics.test.mjs` with fixture session logs: a change with skill invocations and cost, one without cost (reports `unknown`), and one with a CI failure followed by a fix commit (counted once as a failure, with rework > 0).
- `pnpm eval:check` keeps validating records; the comparison record needs no schema change unless a field turns out to be required.

**Acceptance scenario.** A maintainer evaluates `build` on flow-skills.

1. On `main`, the maintainer runs `pnpm metrics --limit 30`. For each linked merged PR, the output lists the skills invoked, minutes to merge, user turns, CI failures, rework, and cost or `unknown`. A per-skill table shows `build` with a count and medians.
2. A PR whose first CI run failed and was then fixed shows 1 CI failure and rework of at least 1. Its rerun is not counted as a second change, and changes that are unlinked or have unknown fields are excluded from the medians.
3. The maintainer picks a representative small task from an existing dogfooding session. They create two worktrees from the same commit: one with Flow skills linked, one with none.
4. With the same model and host, they give both worktrees the same starting prompt and drive each run to merge on a throwaway branch, or to a ready PR when merging is not possible.
5. They write `tests/evals/records/2026-MM-DD-build-vs-no-skills.md` with elapsed time, user turns, retries, CI failures, unauthorized actions, cost or `unknown`, and limitations. `pnpm eval:check` passes.
6. The record states whether `build` lowered idea → prod without more failures, or that the evidence is insufficient for a conclusion.

## Out of Scope

- New orchestration infrastructure, eval runners, or hosted dashboards.
- Exhaustive benchmarks and mandatory cross-host matrices.
- Skill behavior testing in PR CI, whether required or optional. It runs only when a maintainer asks for it.
- Speculative skill rewrites. Skill edits that follow from these results get their own specs.

## Further Notes

- First validation: use the existing dogfooding sessions in `pnpm metrics`, and run one controlled comparison for a representative skill (assumed to be `build`, since it carries most of the delivery work).
- Open assumptions: Claude Code session logs record skill invocations reliably enough to attribute changes; cost appears in the logs (otherwise it stays `unknown`); the rework definition above is good enough to start with.
- Success: lower median idea → prod; no increase in delivery failures or unauthorized actions; fewer unnecessary user turns, retries, and cost.
