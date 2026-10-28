---
name: ship
description: Verify, commit, push, and check the configured deployment with evidence, confirming before pushing; lands a spec's task set on one branch. Use when the user says "ship it", "commit and push", or "send it".
disable-model-invocation: false
---

# Ship

## Purpose

Complete the current authorized work (one task or a related group; see Preflight) with evidence: test, fix, commit, push, deploy, verify. Given a spec's task set, `build` runs it (see its Task set), then ship lands the pull request or spec branch it delivered.

Asking to ship authorizes ordinary commits and pushes of that work, subject to repository permissions, existing release safeguards, and the gates under Push. Requests often arrive by voice, so confirm what you heard before anything leaves the machine.

It does not authorize destructive Git operations, security bypasses, or unrelated changes.

Before a multi-step run, suggest the host's autonomous permission mode when it has one (for example Claude Code auto mode) so file writes, issues, and pushes do not stop for each permission prompt. Skill gates still apply.

## Preflight

Inspect:

- Current branch and worktree.
- Git status and diff.
- Existing staged changes.
- Task scope. Related work shares one branch and pull request: an exploration's research, spec, and root-context changes, or a spec's tasks. Split only large, independently shippable work or work that needs separate review.
- Delivery mode, inferred and recorded as `build` describes.
- Task records. In pull-request mode each spec task has an issue; in local mode, a checkbox in the spec's Tasks section. Create missing ones with `to-tasks` where the set is already recorded; a one-run override ("ship it local", "ship it with a PR") changes only the finish, never where tasks live. Ad-hoc changes need none.
- Repository verification scripts in package.json, Makefile, or CI config.
- Available Git remote.
- Deploy target (see Deploy).

Do not assume every push creates a deployment.

If the working tree contains changes with unclear ownership, preserve them and avoid staging them blindly.

## Task set

"Ship it" on a spec's task set: if `build` has not delivered it yet, run `build` on the set first (its Task set owns plans, waves, notes, worker limits, checkpoints, and board states), then land the result as Push describes.

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

**Plan confirmation.** Before the first push, state the branch, remote, the work commit's SHA when one exists, a one-line summary, the delivery mode, the pull request and merge plan (in local mode, the merge into and push of `main`), and side effects: titles of task records to create, and the `Deploy:` line when it is recorded. Wait for an explicit yes. Silence or an ambiguous reply is not a yes. One explicit yes covers the run's pushes on that branch, except `main` (see Main gate).

**Main gate.** Before merging into or pushing `main`, show the diff summary, checks, and commit SHA, then wait for another explicit yes. A plan yes never authorizes a merge into `main`.

Push the authorized current branch to its intended remote.

Respect branch protection.

Never force-push or rewrite remote branches. Delete a branch only after its work has merged into `main` (below).

Do not promote to production or roll back through a separate manual operation unless explicitly authorized.

If the remote cannot be safely determined, stop and report the required decision.

In pull-request mode, the work lands through one pull request with a Conventional Commits title and a `Closes #N` line per task issue; for a task set it is the pull request `build` opened and marked ready. When every task of a spec has integrated, set the spec's `Status:` line to `implemented` on the spec branch before merging, so the spec reads as done after the branch is deleted. Merge only when checks pass and the main gate is passed; delete the pull request's head branch on the remote and locally (for example `gh pr merge --delete-branch`), then fast-forward local `main` from the remote (no further yes). Update the branch from `main` only when the pull request is behind or conflicts. In local mode, run a final `review` and the full local check suite on the spec branch, merge it into local `main` with `git merge --no-ff` and a pull-request-style message (summary, tasks, checks), then push `main` and delete the merged spec branch locally and, if it was pushed, on the remote.

## Deploy

Read the `Deploy:` line in the Flow block, beside `Delivery:`. When it is missing or `unset`, infer from repository configuration (for example `vercel.json` or a `.vercel` directory means `vercel`); without a recognizable configuration, propose `none`. State the pick with the delivery mode and, once confirmed, record it on that line without touching anything outside the block's markers. Without a Flow block, use the pick for this run only. `Deploy: none` means no deployment: checkpoints carry no preview. In local mode, report a preview only if the target builds one without a pull request.

For the recorded target, defer to the platform's own deploy skill, CLI, or integration (for example `deploy-to-vercel`, GitHub Actions, or documented release scripts) rather than restating platform steps here.

Deploy a preview, not production, unless the user explicitly asks for production.

Identify the deployment associated with the actual commit SHA.

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
- Report the exact failing stage and evidence.
- Suggest the smallest corrective action.

If no deployment is expected for this product, report deployment as not applicable and assess completion against the requested delivery. If deployment was requested but is unconfigured or blocked, report partial delivery.

## Output

### Delivery
Completed, partial, or blocked.

### Checks
Commands executed and observed results.

### Commit
Actual SHA, subject, and branch; for a task set, the pull request or local merge SHA.

### Tasks
For a task set: what `build` reported (waves and checkpoints posted, tasks integrated, tasks blocked and why).

### Push
Remote and branch confirmation.

### Deployment
URL, platform, and status when available; otherwise state that none is configured.

### Verification
What was tested and the outcome.

### Next
Only if something remains unresolved.

## Restrictions

No destructive reset, secret exposure, or unnecessary documentation ceremony. Never report Ship as complete when required verification failed.
