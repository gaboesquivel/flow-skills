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
- Task records. In pull-request mode each spec task has an issue; in local mode, a checkbox in the spec's Tasks section. Create missing ones with `to-tasks` where the set is already recorded; a one-run override changes only the finish, never where tasks live. Ad-hoc changes need none.
- Repository verification scripts in package.json, Makefile, or CI config.
- Available Git remote.
- Deploy target (see Deploy).

Do not assume every push creates a deployment.

Do not mix unrelated work into the commit.

If the working tree contains changes with unclear ownership, preserve them and avoid staging them blindly.

## Delivery mode

Read the `Delivery:` line in the project's Flow block (`AGENTS.md` or `CLAUDE.md`). When it is missing or `unset`, infer: pull-request mode if `main` requires pull requests (for example branch protection or rulesets visible through `gh`), local mode only when you can confirm it does not. When protection cannot be determined (no access, unauthenticated CLI), pick pull-request mode or ask; never fall through to local mode. State the pick and ask the user to confirm the inferred delivery mode; once confirmed, record it on that line without touching anything outside the block's markers. Without a Flow block, use the pick for this run only. "Ship it local" or "ship it with a PR" overrides only the finish for one run; task records stay where they are. A `main` that requires pull requests always uses pull-request mode.

- **Pull-request mode:** tasks are GitHub issues; the work lands through one pull request (see Push).
- **Local mode:** no pull requests or issues. Run a final `review` and the full local check suite on the spec branch, merge it into local `main` with `git merge --no-ff` and a pull-request-style message (summary, tasks, checks), then push `main`.

## Task set

"Ship it" on a spec's task set (issues in pull-request mode, the spec's Tasks section in local mode) makes this session the orchestrator on one spec branch. Without a task set, ship the current work as the rest of this skill describes.

1. **Plan.** Read every task and its blocking edges. Stop before any work on a cycle or a blocker that does not exist. The **ready set** is the tasks whose blockers have all integrated.
2. **Confirm once.** State the spec branch, the tasks, the delivery mode, the deploy target, whether to wait at checkpoints, the merge plan, and the limits: at most 3 concurrent workers and 2 fix rounds per task. One explicit yes covers the run, including its pushes on that branch (checkpoint pushes too), the draft pull request and checkpoint comments, and, in local mode, the merge into and push of `main`. A task that drifts from its stated scope stops for a new yes.
3. **Build** in **waves**: a wave is the ready set when it starts and ends when each of its tasks has integrated, failed, or been blocked. Start one worker per task in the wave in an isolated worktree from the spec branch, up to the concurrency limit. Serialize tasks that touch overlapping areas; never let two workers edit the same files. Each worker implements its task with `implement` and runs its checks.
   - **Notes.** Before the first wave of a set with more than one task, a worker writes notes on the spec, tasks, and relevant code to `<git common dir>/flow/notes/<spec>.md` (find the directory with `git rev-parse --path-format=absolute --git-common-dir`); notes are never committed. Give each task worker the absolute path to the notes, not a copy.
   - **Shared files.** Files the project's instructions tell every session to append to (for example a prompt log) are written only by the orchestrator, on the spec branch; the orchestrator names them in each worker's brief, and workers leave them untouched.
4. **Review.** A separate worker reviews each task's change for correctness and security against the task. The full five-axis `review` runs on each wave's combined change at the checkpoint, before pushing, and once on the final change (the pull request, or the spec branch in local mode); the push that opens the draft comes before the first wave review. Task findings go back to the implementing worker as fix rounds until the gates pass or the round limit is reached; a wave finding goes to the worker of the task that owns the affected files, or to the orchestrator when it spans tasks.
5. **Integrate.** Merge each passing task into the spec branch. In pull-request mode, push the spec branch and open a draft pull request after the first task integrates. When tasks live in the spec (local mode), tick the task's checkboxes and set its **Status:** to `done` on the spec branch as it integrates. A conflict goes back to the later task's worker as a fix round. A failed or stuck task stops its dependents, which wait for the user's decision and are not runnable until then: report it with evidence and keep the rest of the wave moving.
6. **Checkpoint** after each wave. Run the wave `review` and its fix rounds, then push the spec branch, get the preview for that exact commit from the deploy target (see Deploy), and post: wave number; tasks integrated, failed, or blocked with one-line reasons, noting dependents that wait for the user's decision; checks and review results; commit SHA; preview URL; screenshots of changed screens when a browser tool is available, otherwise say there are none. Report a pending or failed preview as such. Pull-request mode posts the checkpoint as a pull request comment; local mode reports it in the conversation. The next wave is the ready set after the checkpoint; it waits for the user's go unless the run confirmation said not to wait.
7. **Finish** by delivery mode once no runnable task remains, reporting dependents still waiting for the user's decision. In pull-request mode, after the final `review`, mark the draft ready for review before merging.

Gates: checks green, no blocking review findings, branch protection respected. Without independent workers, run the ready tasks sequentially in the same order on the spec branch, write the notes as the orchestrator, label reviews single-agent, and say so.

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

Before the first push, state the branch, remote, commit SHA, a one-line summary, and the pull request and merge plan (in local mode, the merge into and push of `main`). Wait for an explicit yes. Silence or an ambiguous reply is not a yes. That yes covers the run's later pushes on the same branch.

Push the authorized current branch to its intended remote.

Respect branch protection.

Never force-push.

Never delete or rewrite remote branches.

Do not promote to production through a separate manual operation unless explicitly authorized.

If the remote cannot be safely determined, stop and report the required decision.

In pull-request mode, the work lands through one pull request with a Conventional Commits title and a `Closes #N` line per task issue; for a task set it is the draft opened after the first task integrates, marked ready at the end. Merge only when checks pass and the user authorized merging; then fast-forward local `main` from the remote. Update the branch from `main` only when the pull request is behind or conflicts. Local mode finishes as described under Delivery mode.

## Deploy

Read the `Deploy:` line in the Flow block, beside `Delivery:`. When it is missing or `unset`, infer from repository configuration (for example `vercel.json` or a `.vercel` directory means `vercel`); without a recognizable configuration, propose `none`. State the pick with the delivery mode and, once confirmed, record it on that line without touching anything outside the block's markers. Without a Flow block, use the pick for this run only. `Deploy: none` means no deployment: checkpoints carry no preview. In local mode, report a preview only if the target builds one without a pull request.

For the recorded target, defer to the platform's own deploy skill, CLI, or integration (for example `deploy-to-vercel`, GitHub Actions, or documented release scripts) rather than restating platform steps here.

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
For a task set: waves and checkpoints posted, tasks integrated, tasks blocked and why, and the limits used.

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
