# 031: Fast delivery

Status: implemented (2026-10-29; amended 2026-10-29). Landed in [#158](https://github.com/gaboesquivel/flow-skills/pull/158). Issue: [#157](https://github.com/gaboesquivel/flow-skills/issues/157). Decision: [0044](../decisions/0044-fast-delivery.md) (Accepted). Amended by [spec 035](035-delivery-phrases.md) (build owns the CI wait and verifies the branch).

## Goal

Streamline development and remove ceremony while following good product, lean startup, and engineering practices. Every cut below removes a step that repeats a practice or records state no one reads; none removes the practice itself. CI still checks every pull request, risky changes still get an independent review, every spec still has an acceptance scenario, and new products still name their riskiest assumption, kill criterion, and main metric ([PRODUCT.md](../../PRODUCT.md#success)).

## Problem Statement

A developer using Flow wants a change live in minutes. Today the process costs rounds, not minutes. On one change, `build` can run the full local suite four times (a baseline, between task integrations, after each fix round, and before the merge). `build` and `ship` each wait for CI, and each require an independent review. A spec needs a separate "accept the spec" turn, a spec issue whose body is re-synced after every file change, and checklist ticks, board recording, and a shared-file exception tracked along the way. `explore` asks for two explicit yeses around a grill and a pre-mortem, even for a feature. `start` restates everything and runs 11 verification checks, including a dev server and HTTP smoke tests, before its first commit.

The repository's own tests add the same drag. 219 wording pins in `tests/smoke-contracts.test.mjs` fail when skill prose is reworded, and a CI rule fails any pull request that edits a skill without also editing that file; it changed in 51 of 101 commits. About 11 tests re-run checks `pnpm validate` already runs, and one test downloads `skills@latest` from npm on every run.

GitHub data shows the pull request itself is already fast (median 4.4 min open → merge). The waste sits before the pull request opens, and in CI failures (19% of runs).

## Assumption

Running checks once at pull request time, waiting for CI once, and verifying only that the change is live keeps shipped changes as safe as today (CI failure rate and post-merge fixes do not rise) while moving the [PRODUCT.md metrics](../../PRODUCT.md#success) toward their targets.

## Solution

1. **Checks once, at pull request time.** In GitHub mode `build` runs no local suite: it pushes and opens the pull request, and CI is the check. In local mode `build` runs the suite once, on the head it merges. No baseline run, no runs between task integrations, no re-run after a fix round beyond CI on the new head.
2. **One CI wait, owned by `ship`.** `build` returns once the pull request is open. `ship` waits for checks once, on the head it merges, and fixes red checks (at most two rounds).
3. **Ship verifies liveness only.** After landing, `ship` reports whether the change is live and does not gate or roll back:
   - flow-skills and other repositories without a deployment: the remote default branch's head is the shipped commit.
   - Apps (flow-next, flow-mono): the production URL answers, and the database health endpoint answers when the template exposes one.
   No acceptance scenario runs on the deployment.
4. **Review when it pays.** The size guard is judged once, at intake. Small changes get a self-check. The independent review runs when the guard escalates or the user asks ("review it"); it is no longer required for every spec. Review verdicts cover the acceptance scenario only; other unmet requirements are findings.
5. **Acceptance folds into delivery.** "Build it" or "ship it" on a draft spec accepts it in the same commit. "Accept the spec" still works on its own.
6. **The spec issue links, it does not mirror.** In GitHub mode the spec issue opens at acceptance with a link to the spec file and its status label. No body copy, no hash, no sync after each change. Tasks stay a checklist in the spec file; sub-issues open only on request.
7. **Less bookkeeping.** Delete the shared-file exception, board recording during builds, and per-task status ticks (the checklist is ticked once, in the last commit). A landed commit must be the reviewed head only when a review ran.
8. **One confirmation in `explore`.** Show the brief once and ask once. The grill and pre-mortem run for new products, or when the user asks. The decisions reader checks the current branch only; no scan of every unmerged branch. This fleshes out candidate [030](030-adaptive-explore.md).
9. **`start` gets to a deploy fast.** When template and name are clear from the request, start without a restatement. Bootstrap verification is setup, the identity scan, the `.gitignore` check, and the template's `qa`; the first green Vercel deployment is the done signal. Dev server and HTTP smoke checks leave `start`; the template's CI covers them.
10. **One home per rule.** The delivery-mode question lives in `build` and is asked only by `flow`, `start`, or the first delivery skill that needs it; other skills point to it in one line. The outside-Git rule is one inline line in each delivery skill, not a link.
11. **A lean test suite.**
    - Delete the wording pins in `tests/smoke-contracts.test.mjs` (keep at most 10–15 keyword checks for safety rules such as no force-push and no self-approval), `tests/requirement-verdicts.test.mjs`, `tests/retro-prevention-fixture.test.mjs`, `tests/evals-verify-report.test.mjs` with `tests/evals/lib/verify-report.mjs`, `tests/fixtures-eval-smoke.test.mjs`, and the README wording test.
    - Delete the rule in `scripts/check-pr-alignment.mjs` that requires a smoke-contracts change for every skill change, and have it call `validate`'s functions instead of duplicating them.
    - Delete tests that re-run `pnpm validate` on the real repository; keep every negative fixture test, merged into one `tests/validate.test.mjs`. Merge the 21 `flow-phrases` tests into one.
    - Move `npm pack` and the `skills` CLI listing (pinned version) to a release-only script.
    - CI runs one cell (ubuntu, Node 22) on pull requests and on `main`; the OS × Node matrix runs on release tags.

## Amendment (2026-10-29)

A review of the first implementation against realistic runs led the maintainer to widen this spec within the same pull request ([decision 0044, amendment](../decisions/0044-fast-delivery.md#amendment-2026-10-29-one-shape-parallel-by-default-zero-lost-work)). It replaces items 1 (local mode), 3, and 6 above:

- **One shape.** `build` ends with a ready branch (a pull request in GitHub mode); `ship` lands in both modes, running the local suite once on the merge result in local mode.
- **Inferred delivery.** No delivery question; the remote and `gh` access decide, and a `Delivery:` line overrides.
- **No spec issue.** The pull request links the spec file; issues and sub-issues only on request; candidates are files; "share the draft" opens a draft pull request.
- **Parallel by default**, with the agent choosing how.
- **Zero lost work** (build's Work in flight): workers in their own worktree start from the delivery head and commit on their branch, workers in the shared checkout leave commits to the main thread, and nothing counts as integrated until a commit on the delivery branch contains it; unfinished work reported and kept, no partial spec marked implemented or shipped unasked, and every report lists what is left.
- **Checklist:** each task's line is ticked as it integrates, replacing item 7's single tick, so a partial ship shows what landed.
- **Delivery fallback:** a GitHub `origin` without `gh` access stops instead of falling back to local mode.
- **Shipped means deployed:** the default branch contains the commit and, for apps, the host reports that commit's production deployment as successful before the URL check.

**Validation (2026-10-29).** One real parallel Claude Code run integrated into this pull request through [#159](https://github.com/gaboesquivel/flow-skills/pull/159):
- **Setup:** two subagents ran in native worktree isolation and committed on their own branches; one worked in the shared checkout with no commits.
- **Base finding:** native isolation started both worktrees from `main`, not the delivery branch, so they were moved to the delivery head before editing. That is now a rule in Work in flight.
- **Integration:** both branches merged and their containment was confirmed; the shared-checkout changes were committed by the main thread; validate passed and 130/130 tests passed; CI passed on #159.
- **Squash-only repository:** this repository allows only squash or rebase merges, so worker commits are not ancestors after landing. Cleanup therefore relies on the pull request having merged, as Work in flight allows.
- **Second run:** a [second live run](../../tests/evals/records/2026-10-29-parallel-workflow-live.md) delivered the post-merge reconciliation with three workers while #158 squash-landed mid-run; worker commits were cherry-picked onto the new base and containment confirmed by patch equivalence, which Work in flight now names.

## User Stories

1. As a maintainer, I say "build it" for a one-line skill fix, so a pull request opens with no local suite run, CI checks it once, and "ship it" merges and reports that `main` is the shipped commit.
2. As a maintainer, I say "spec it" then "build it", so the spec is accepted in the build's commit with no separate acceptance turn, and the spec issue links to the file.
3. As a maintainer, I reword a skill sentence, so CI passes without editing a test file or adding the `alignment-exempt` label.
4. As a developer, I say "start a Next.js project called Acme", so the project is set up and deployed to Vercel in under 5 minutes, without a restatement round.
5. As a developer, I explore a feature, so I answer my questions and confirm the brief once.

## Implementation Decisions

- Skill text changes in `build`, `ship`, `review`, `to-spec`, `to-tasks`, `explore`, `start`, `flow`, and `board`; `write-agents` keeps the Workers rule.
- `skills/to-spec/lib/spec-issue.mjs` shrinks to building the link body, or retires if a one-line `gh` call suffices; `tests/spec-issue.test.mjs` follows.
- `ship`'s liveness check: `git ls-remote origin <default>` equals the shipped SHA; for apps, one unauthenticated `GET` to the production URL and to the template's health route when present.
- **Exposure:** none deployed. Skills run inside the user's agent session; CI and test changes affect this repository only.

## Testing Decisions

Behavior tests stay: `board`, `flow-block`, `start-bootstrap`, `pr-alignment`, `context-review`, `start-preset`, and the validate negative fixtures. Skill prose is not pinned beyond the short safety keyword list. The real test of this spec is the metrics: idea → prod, time to start, and time to close PR, plus CI failure rate, compared before and after on the dogfood repositories.

**Acceptance scenario.** A maintainer on flow-skills `main`, with this spec shipped and a clean tree:

1. Says "build it: fix the typo 'recieve' in skills/grill/SKILL.md". A branch and pull request open; no local test command runs in the session.
2. CI runs one cell and passes in under a minute; no smoke-contracts edit or `alignment-exempt` label was needed.
3. Says "ship it". `ship` waits for checks once, merges, and reports that `origin/main` contains the merge commit.
4. The session log shows under 15 minutes from the first prompt to step 3's report, with one user confirmation or fewer.

## Direction changes

- `PRODUCT.md` Flow mode paragraph: "build it" ends in a pull request after integration; "ship it" lands "when the implementation and the independent review are done" and verifies the shipped commit. New position: the independent review is required only when the size guard escalates or the user asks, and verification is liveness only. Updated at acceptance.

## Out of Scope

- The measurement script that joins session logs, git, GitHub, and deployment data (its own spec).
- Making flow-next and flow-mono Vercel-ready; those templates own it. This spec only makes `start` use the deployment as its done signal.
- Changes to thinking skills (`grill`, `debug`, `council`, and the rest).

## Further Notes

Evidence from this session's audits: skills total about 16,700 words, and "ship it" loads about 3,500 words (`ship`, `build`, `review`); `pnpm test` runs 196 tests in about 5 s, so the suite cost is churn, not runtime. GitHub baseline over 60 PRs: open → merge median 4.4 min (p90 20 min), first commit → merge median 7.4 min (p90 60 min), CI failure rate 19%.

Open assumptions: the decision record lists the Accepted decisions this amends; acceptance verifies each back-pointer, including whether `start`'s restatement gate traces to [0022](../decisions/0022-start-runs-explore.md).
