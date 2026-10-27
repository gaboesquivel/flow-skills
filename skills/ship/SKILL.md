---
name: ship
description: Verify, commit, push, and validate delivery using evidence from actual checks and configured deployment.
disable-model-invocation: true
---

# Flow Ship

## Purpose

Complete the current authorized development task through a bounded delivery pipeline.

Test → Fix → Commit → Push → Deploy → Verify.

The command authorizes ordinary commits and pushes of the current intended task, subject to repository permissions and existing release safeguards.

It does not authorize destructive Git operations, security bypasses, or unrelated changes.

## Preflight

Inspect:

- Current branch and worktree.
- Git status and diff.
- Existing staged changes.
- Task scope.
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

Push the authorized current branch to its intended remote.

Respect branch protection.

Never force-push.

Never delete or rewrite remote branches.

Do not promote to production through a separate manual operation unless explicitly authorized.

If the remote cannot be safely determined, stop and report the required decision.

## Deploy

Determine whether a deployment is expected for the pushed commit.

Use the project's existing integration (for example Vercel CLI, GitHub Actions, or documented release scripts) when available.

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
