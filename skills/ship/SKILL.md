---
name: ship
description: Verify, commit, push, and check the configured deployment with evidence, confirming before pushing; lands a spec's task set on one branch. Use when the user says "ship it", "commit and push", or "send it".
disable-model-invocation: false
---

# Ship

## Purpose

Complete the current authorized work (one task or a related group; see Preflight) with evidence: test, fix, commit, push, deploy, verify. Given a spec's task set, orchestrate it instead (see Task set).

Asking to ship authorizes ordinary commits and pushes of that work, subject to repository permissions, existing release safeguards, and the confirmation below. Requests often arrive by voice, so confirm what you heard before anything leaves the machine.

It does not authorize destructive Git operations, security bypasses, or unrelated changes.

Before a multi-step run, suggest the host's autonomous permission mode when it has one (for example Claude Code auto mode) so file writes, issues, and pushes do not stop for each permission prompt. Elsewhere, continue with ordinary prompts. The skill's own confirmations still apply.

## Preflight

Inspect:

- Current branch and worktree.
- Git status and diff.
- Existing staged changes.
- Task scope. Related work shares one branch and pull request: an exploration's research, spec, and root-context changes, or a spec's tasks. Split only large, independently shippable work or work that needs separate review.
- Delivery mode (see below).
- Task records. In pull-request mode each spec task has an issue; in local mode, a checkbox in the spec's Tasks section. Create missing ones with `to-tasks`. Ad-hoc changes need none.
- Repository verification scripts in package.json, Makefile, or CI config.
- Available Git remote.
- Deployment configuration (Vercel, container platform, static host, or documented manual process).

Do not assume every push creates a deployment.

## Delivery mode

Read the `Delivery:` line in the project's Flow block (`AGENTS.md` or `CLAUDE.md`). When it is missing or `unset`, infer: pull-request mode if `main` requires pull requests (for example branch protection or rulesets visible through `gh`), local mode otherwise. State the pick; once the user confirms, record it on that line without touching anything outside the block's markers. Without a Flow block, use the pick for this run only. "Ship it local" or "ship it with a PR" overrides the mode for one run. A `main` that requires pull requests always uses pull-request mode.

- **Pull-request mode:** tasks are GitHub issues; the work lands through one pull request (see Push).
- **Local mode:** no pull requests or issues. Run a final `review` and the full local check suite on the branch, merge it into local `main` with `git merge --no-ff` and a pull-request-style message (summary, tasks, checks), tick the spec's task checkboxes, then push `main`.

## Task set

"Ship it" on a spec's task set (issues in pull-request mode, the spec's Tasks section in local mode) makes this session the orchestrator on one spec branch. Without a task set, ship the current work as the rest of this skill describes.

1. **Plan.** Read every task and its blocking edges. Stop before any work on a cycle or a blocker that does not exist. The **ready set** is the tasks whose blockers have all integrated.
2. **Confirm once.** State the spec branch, the tasks, the delivery mode, the merge plan, and the limits: at most 3 concurrent workers and 2 fix rounds per task. One explicit yes covers the run, including its pushes on that branch. A task that drifts from its stated scope stops for a new yes.
3. **Build.** Start one worker per ready task in an isolated worktree from the spec branch, up to the concurrency limit. Serialize tasks that touch overlapping areas; never let two workers edit the same files. Each worker implements its task with `implement` and runs its checks.
4. **Review.** A separate worker reviews each task's change with `review`. Blocking findings go back to the implementing worker until the gates pass or the round limit is reached.
5. **Integrate.** Merge each passing task into the spec branch and recompute the ready set. A conflict goes back to the later task's worker as a fix round. A failed or stuck task stops its dependents: report it with evidence and keep the rest of the set moving.
6. **Finish** by delivery mode once no runnable task remains. In pull-request mode, `review` checks the final pull request once before merging.

Gates: checks green, no blocking review findings, branch protection respected. Without independent workers, run the ready tasks sequentially in the same order on the spec branch, label reviews single-agent, and say so.

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

In pull-request mode, open one pull request with a Conventional Commits title and a `Closes #N` line per task issue. Merge only when checks pass and the user authorized merging; then fast-forward local `main` from the remote. Update the branch from `main` only when the pull request is behind or conflicts. Local mode finishes as described under Delivery mode.

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
Actual SHA, subject, and branch; for a task set, the pull request or local merge SHA.

### Tasks
For a task set: tasks integrated, tasks blocked and why, and the limits used.

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
