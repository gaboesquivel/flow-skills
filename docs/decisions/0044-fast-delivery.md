# 0044 — Fast delivery: checks once, liveness only, review when it pays

Status: **Accepted** (2026-10-29). Amends [0042](0042-outcome-build-and-ship.md) (an independent review before every spec landing), [0043](0043-workers-when-they-pay.md) (item 2: checks between task integrations), [0040](0040-ship-verifies-liveness.md) (without a deployment, the remote default branch matching the shipped commit is the liveness proof), [0022](0022-start-runs-explore.md) (`start` restates and confirms everything before writing), [0029](0029-spec-issues.md) and [0035](0035-spec-issue-on-acceptance.md) (the spec issue body mirrors the file and syncs after each change; acceptance is a separate step), [0036](0036-one-explore-depth.md) (grill and pre-mortem at every non-Skip depth), [0038](0038-direction-changes-are-confirmed-and-recorded.md) (the scan of unmerged branches for pending direction changes), and [0027](0027-progress-board-skill.md) (board recording during builds). Supersedes [0033](0033-shared-files-and-reviewed-head.md) (the shared-file exception). Spec: [031](../specs/031-fast-delivery.md).

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
