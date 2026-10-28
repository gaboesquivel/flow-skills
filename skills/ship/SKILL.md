---
name: ship
description: Verify, commit, push, and check the configured deployment with evidence, confirming before pushing. Use when the user says "ship it", "commit and push", or "send it".
disable-model-invocation: false
---

# Ship

## Purpose

Complete the current authorized work (one task or a related group; see Preflight) with evidence: test, fix, commit, push, deploy, verify.

Asking to ship authorizes ordinary commits and pushes of that work, subject to repository permissions, existing release safeguards, and the confirmation below. Requests often arrive by voice, so confirm what you heard before anything leaves the machine.

It does not authorize destructive Git operations, security bypasses, or unrelated changes.

Before a multi-step run, suggest the host's autonomous permission mode when it has one (for example Claude Code auto mode) so file writes, issues, and pushes do not stop for each permission prompt. Elsewhere, continue with ordinary prompts. The skill's own confirmations still apply.

## Preflight

Inspect:

- Current branch and worktree.
- Git status and diff.
- Existing staged changes.
- Task scope. Related work shares one branch and pull request: an exploration's research, spec, and root-context changes, or a spec's tasks. Split only large, independently shippable work or work that needs separate review.
- Task issues. On GitHub, each spec task has an issue; create missing ones with `to-tasks`. Ad-hoc changes need none.
- Repository verification scripts in package.json, Makefile, or CI config.
- Available Git remote.
- Deployment configuration (Vercel, container platform, static host, or documented manual process).

Do not assume every push creates a deployment.

Do not mix unrelated work into the commit.

If the working tree contains changes with unclear ownership, preserve them and avoid staging them blindly.

## Test

Run relevant checks.

Prefer the repository's established QA commands.

For substantial application changes, run the applicable:

- Type checking.
- Linting and formatting validation.
- Unit or integration tests.
- Build checks.
- Browser or smoke verification where genuinely relevant.

Do not run expensive or unrelated checks without reason.

## Fix

Fix failures caused by the task when safely within scope.

Retest after fixes.

Use bounded retries.

If verification cannot pass, stop and report the blocker.

Never hide failed tests or skip them silently to obtain a green result.

## Commit

Review the final diff.

Stage only intended files.

Exclude credentials, local logs, generated secrets, and unrelated changes.

Use a meaningful commit message following repository conventions.

Verify the resulting commit SHA.

Do not amend or rewrite unrelated commits.

## Push

Before the first push, state the branch, remote, commit SHA, a one-line summary, and the pull request and merge plan. Wait for an explicit yes. Silence or an ambiguous reply is not a yes. That yes covers the run's later pushes on the same branch.

Push the authorized current branch to its intended remote.

Respect branch protection.

Never force-push.

Never delete or rewrite remote branches.

Do not promote to production through a separate manual operation unless explicitly authorized.

If the remote cannot be safely determined, stop and report the required decision.

On GitHub, open one pull request with a Conventional Commits title and a `Closes #N` line per task issue. Merge only when checks pass and the user authorized merging; then sync the local base branch.

## Deploy

Determine whether a deployment is expected for the pushed commit.

Defer to the platform's own deploy skill or configuration when one is present (for example `deploy-to-vercel`, GitHub Actions, or documented release scripts) rather than restating platform steps here.

Deploy a preview, not production, unless the user explicitly asks for production.

Identify the deployment associated with the actual commit SHA.

Do not confuse a previous successful deployment with the new commit.

Perform bounded status checks until success, failure, or a reasonable monitoring limit is reached.

If deployment remains pending, report it as pending rather than successful.

## Verify

After deployment (or when deployment is not configured), verify changed behavior against acceptance criteria.

Use real endpoints, CLI commands, or UI interactions as appropriate.

If the deployed application is protected or inaccessible, report the exact verification limitation.

A successful build alone is not complete application verification.

## Failure handling

On failure:

- Preserve the current repository state.
- Do not force deployment.
- Do not perform destructive rollback operations without authorization.
- Report the exact failing stage and evidence.
- Suggest the smallest corrective action.

If no deployment is expected for this product, report deployment as not applicable and assess completion against the requested delivery. If deployment was requested but is unconfigured or blocked, report partial delivery.

## Output

### Delivery
Completed, partial, or blocked.

### Checks
Commands executed and observed results.

### Commit
Actual SHA, subject, and branch.

### Push
Remote and branch confirmation.

### Deployment
URL, platform, and status when available; otherwise state that none is configured.

### Verification
What was tested and the outcome.

### Next
Only if something remains unresolved.

## Restrictions

No force push.

No destructive reset.

No unapproved production promotion or rollback.

No secret exposure.

No fabricated deploy success.

No unnecessary documentation ceremony.

Never report Ship as complete when required verification failed.
