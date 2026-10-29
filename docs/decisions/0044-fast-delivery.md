# 0044 — Fast delivery: checks once, liveness only, review when it pays

Status: **Accepted** (2026-10-29). Amends [0042](0042-outcome-build-and-ship.md) (an independent review before every spec landing), [0043](0043-workers-when-they-pay.md) (item 2: checks between task integrations), [0040](0040-ship-verifies-liveness.md) (without a deployment, the remote default branch matching the shipped commit is the liveness proof), [0022](0022-start-runs-explore.md) (`start` restates and confirms everything before writing), [0029](0029-spec-issues.md) and [0035](0035-spec-issue-on-acceptance.md) (the spec issue body mirrors the file and syncs after each change; acceptance is a separate step), [0036](0036-one-explore-depth.md) (grill and pre-mortem at every non-Skip depth), [0038](0038-direction-changes-are-confirmed-and-recorded.md) (the scan of unmerged branches for pending direction changes), and [0027](0027-progress-board-skill.md) (board recording during builds). Supersedes [0033](0033-shared-files-and-reviewed-head.md) (the shared-file exception). The 2026-10-29 amendment below also amends [0028](0028-build-and-ship.md), [0030](0030-asked-delivery-and-local-mode.md), [0031](0031-fan-out-by-default.md), [0032](0032-local-build-lands-ship-verifies.md), [0034](0034-no-ceremony-without-a-spec.md), [0037](0037-git-for-delivery-github-for-github-mode.md), [0039](0039-build-never-requires-a-spec.md), and [0043](0043-workers-when-they-pay.md), and supersedes [0035](0035-spec-issue-on-acceptance.md) and the spec-issue rules of [0029](0029-spec-issues.md). Spec: [031](../specs/031-fast-delivery.md).

## Context

[PRODUCT.md](../../PRODUCT.md#success) now makes idea → prod Flow's main metric, with time to start and time to close PR beside it. Audits of the skills, the test suite, and GitHub history found the time going to repeated local suite runs, two CI waits, a review required on every spec, acceptance and issue-sync bookkeeping, and stacked confirmations in `explore` and `start`. The pull request on GitHub is already fast; the waste is before it opens.

## Decision

1. **Checks run once, at pull request time.** CI is the check in GitHub mode; local mode runs the suite once on the head it merges.
2. **`ship` owns the only CI wait** and verifies liveness only: the remote default branch is the shipped commit, or the production URL (and health route, when present) answers.
3. **The independent review runs when the size guard escalates or the user asks.** The guard is judged once, at intake.
4. **"Build it" or "ship it" on a draft accepts it.** The spec issue links to the file; it does not mirror or sync it.
5. **No shared-file exception, no board recording during builds, one checklist tick at the end.**
6. **`explore` confirms once**; grill and pre-mortem run for new products or on request.

## Rationale

Every removed step either duplicated CI, duplicated another step, or recorded state no one reads during the run. CI still runs on every pull request, and the size guard still escalates risky changes to an independent review, so the gates that protect the default branch remain.

## Alternatives

- **Keep the gates and make them faster** (parallel workers, cached runs). Rejected: the cost is turns and waits, not CPU.
- **Make every gate opt-in per repository.** Rejected: more configuration, and the defaults would still be slow.

## Consequences

Fewer turns and waits per change; less skill text to load. Risk: a broken change slips past a skipped local run or review. Watch the CI failure rate and post-merge fixes; if either rises, restore the specific gate that would have caught it.

## Amendment (2026-10-29): one shape, parallel by default, zero lost work

A review of the first implementation against realistic runs (parallel worktrees, a failed task, an unspecced fix, a rejected push) found partial specs landing as implemented, a detached worktree whose commits could be lost, a stuck local `main` after a rejected push, a liveness check that could pass on the previous deployment, and two delivery methodologies where one would do. This amendment replaces items 2 and 4 above and adds:

1. **One delivery shape.** `build` ends with a ready branch: an open pull request in GitHub mode, a committed branch in local mode. It never waits on CI and never merges. `ship` lands in both modes: checks once (CI, or the suite once on the merge result locally), the independent review when the size guard escalates or the user asks, then merge and push. Local Git and GitHub are delivery options, not methodologies. Amends 0028, 0032, and 0034.
2. **Delivery mode is inferred, never asked.** GitHub when `origin` is a GitHub repository and `gh` is authenticated; otherwise local. A `Delivery:` line or the request overrides; a default branch that requires pull requests forces GitHub. Amends 0030 and 0037.
3. **No spec issue.** The spec file is the record; in GitHub mode the pull request links it. Issues and sub-issues open only on request. Candidates are file stubs; "share the draft" opens a draft pull request; a dropped spec says `Status: dropped`. Acceptance is the file's status. Supersedes 0035 and the spec-issue rules of 0029.
4. **Parallel by default.** Independent work runs in parallel (subagents or parallel tool calls), and the agent chooses how; work stays inline only when it needs another step's output, asks the user, or costs more to brief than to do. Amends 0031 and 0043 item 1.
5. **Zero lost work.** One rule in `build` (Work in flight): a worker in its own worktree starts from the delivery branch's head (host isolation may start elsewhere; Claude Code's starts from the default branch, so the worker's branch moves to the delivery head first) and commits on its own branch; a worker in the shared checkout edits disjoint files and the main thread commits; work counts as integrated only when it is in a commit on the delivery branch, checked by containment before the pull request or landing; finished work reaches the work branch; unfinished work is reported, never dropped; a spec is `implemented` only when every task integrated; a branch or worktree is removed only when its commits are on the default branch or the user dropped the work; every report lists what is left; `ship` finishes this work's leftovers and refuses a partial spec unless told. Git mechanics (trailers, merge choreography, cleanup commands) are the agent's choice.
6. **Shipped means deployed.** The remote default branch contains the shipped commit; for an app, the host reports a successful production deployment of that commit and its URL answers. Otherwise the report says "reachable, commit unconfirmed". Amends 0040 further and 0039 (the guard is judged once and not pinned in tests).

The safety rules stay: no direct writes to the default branch outside `ship`'s landing, no force-push, no protection bypass or self-approval, no weakened checks, no secrets in commits.

