# 0057 — Draft workspace, checks on ready

Status: **Accepted** (2026-10-31). Amends [0025](0025-wave-checkpoints.md) (`build`, not `ship`, opens the draft pull request), [0034](0034-no-ceremony-without-a-spec.md) and [0044](0044-fast-delivery.md) (`build` ends at a pull request that is ready only when verified), [0048](0048-delivery-phrases-are-approvals.md) (CI runs on the ready head, not on every push), and [0050](0050-github-governance-preset.md) (`flow-skills` no longer requires `context-review`; branch previews are not automatic). Spec: [048](../specs/048-delivery-lifecycle.md).

## Context

`build` opens a ready pull request and waits on CI. Pull request workflows run on every push, drafts included. Vercel builds a preview for every branch push. The starters install a pre-commit hook. Most of these runs verify heads nobody merges: 39 of 54 recent `flow-skills` deployments were previews. GitHub records a job skipped by a condition as a check run with conclusion `skipped`, which branch protection can count as passing.

## Decision

1. **One draft pull request per spec is the workspace.**
   - `build` creates it, or reuses the open one, early on `spec/<number>-<slug>`.
   - Workers use isolated worktrees and local branches.
   - One integration owner pushes to the delivery branch after checking its remote head, and never force-pushes.
2. **Drafts run nothing.**
   - Pull request workflows skip their jobs while the pull request is a draft.
   - Vercel branch deployments are off, `main` excepted (`git.deploymentEnabled`).
   - Previews are explicit.
3. **Ready runs the checks.**
   - `build` marks the pull request ready when implementation and focused checks are complete.
   - `ready_for_review` and later pushes run the repository's required deterministic checks.
4. **`ship` counts only checks that ran.**
   - A required check counts when its latest result on the merged head is `success`.
   - `skipped`, `neutral`, pending, missing, or stale results stop the merge.
   - A deterministic script enforces this.
5. **No git hooks.** Secret and security checks run in ready-PR CI and in GitHub's push protection.

## Alternatives

- **Keep ready pull requests and CI on every push.** Rejected: it pays for verification of heads that are still changing.
- **Path or label filters instead of draft state.** Rejected: they add conventions to remember. Draft state is already the signal for work in progress.
- **An `ignoreCommand` script for Vercel.** Rejected: Vercel still starts a build to run it. `deploymentEnabled` is native configuration.
- **Keep a minimal secret-file pre-commit hook.** Rejected: agents bypass or trip on hooks, and CI plus push protection already cover it at merge time.

## Consequences

A draft shows no CI signal, so `build` runs focused checks locally before marking the pull request ready. Repositories that require the `Vercel` check (such as `gaboesquivel.com`) must keep branch deployments, or require a CI check instead, before adopting item 2. GitHub-side blocking still depends on an active ruleset. `ship`'s script holds the line when protection is off, but does not replace it.
