---
name: ship
description: Land accepted work with no confirmation, building if needed, then independent review on the pull request, green checks, merge, and sync. Use when the user says "ship it" or "land it".
disable-model-invocation: false
---

# Ship

## Purpose

"Ship it" lands the current authorized work: one change, or a spec's task set on one branch. It builds when no pull request exists, gets an adversarial review posted on the pull request, fixes findings, waits for green checks, merges, deletes the branch, and syncs the local default branch (decision 0028).

Asking to ship authorizes these steps with no confirmation, subject to repository permissions and branch protection. It does not authorize destructive Git operations, force-pushing, rewriting remote branches, security bypasses, approving its own pull request, production promotion or rollback unless explicitly asked, or unrelated changes.

Before a multi-step run, suggest the host's autonomous permission mode when it has one (for example Claude Code auto mode) so file writes, comments, and pushes do not stop for each permission prompt. The gates below still apply.

## Preflight

Inspect the current branch and worktree, Git status and diff, existing staged changes, the available remote, and the delivery mode as `build` describes under Delivery mode. If the working tree contains changes with unclear ownership, preserve them and avoid staging them blindly. A one-run override ("ship it local", "ship it with a PR") changes only the finish, never where tasks live.

Classify the work. Resolve its spec from (a) the branch name, (b) files under `docs/specs/` (or the project's spec location) that the change touches, and (c) the issues the work closes (`Closes #N`) and the spec each links.

- **Spec work:** any source points at a spec, or classification is uncertain. The spec's `Status:` must be `accepted`, and every decision record it links must be **Accepted**. Otherwise name each spec or linked decision that is not accepted, with its status, suggest "accept the spec", and stop before building, committing, or pushing anything. If the spec cannot be resolved, say so and stop the same way.
- **Hotfix:** work with no spec link at all, including work that closes only issues belonging to no spec. It ships through the same cycle; the review also judges whether it is hotfix-sized (see Review).

## Build

Run `build` first, passing this run's delivery mode, when no pull request exists for the work (pull-request mode), the pull request is still a draft, the spec's task set has runnable tasks left, the work has uncommitted or unpushed changes, or (local mode) the work sits on the default branch; it commits, pushes, opens or finishes the pull request, and waits for checks. On a spec's task set, `build` runs it (see its Task set), then ship lands the pull request it marked ready. Related work shares one branch and pull request; split only large, independently shippable work. In local mode, `build` delivers a branch with the local check suite passing.

## Prepare

Make the branch final before the last review, so the merged head is the one reviewed and checked:

1. For spec work, when every task of the spec has integrated, set the spec's `Status:` line to `implemented` on the branch, so the spec reads as done after the branch is deleted.
2. In pull-request mode, update the branch from the default branch only when the pull request is behind or conflicts; stop on conflicts that cannot be resolved within scope.
3. After any push, wait for checks on the new head.

## Review

Run an adversarial five-axis `review` of the pull request with a separate worker; ship's request authorizes that worker and posting the result. Post the review on the pull request as a comment or a COMMENT-type review, never an approval. Without a separate worker, run it directly, label it single-agent on the pull request, and let it gate the same way. In local mode, report the review in the conversation. Record the head SHA the review and checks covered.

**Hotfix guard.** For a hotfix, the review also judges size: new product behavior, a data-shape or public API change, or a migration is a blocking finding. Ship stops there and suggests `to-spec`.

## Fix rounds

On blocking findings or failing checks, fix what this work caused when safely in scope, commit, push (pull-request mode), and review and wait for checks on the new head again: at most 2 fix rounds. Wait for checks with bounded monitoring; a pending check is pending, never passing. Never hide, skip, disable, or weaken a failing check. If the gate still fails, stop and report.

## Merge

**Gate.** Merge only when checks are green, no findings are blocking, and branch protection is satisfied. Never approve the agent's own pull request and never bypass protection (for example `gh pr merge --admin`). When protection requires a human approval, stop after the review and report that an approval is needed.

**Pull-request mode:**

1. Keep a `Closes #N` line only for tasks that integrated; list the rest as `Refs #N`. Merge only the reviewed and checked head SHA, with a method the repository allows (for example `gh pr merge --match-head-commit <sha>`). If the head changed after the review, including someone else's push, review and check the new head first. The pull request carries a Conventional Commits title and a `Closes #N` line per task issue.
2. Delete the head branch on the remote and locally (for example `gh pr merge --delete-branch`), then fast-forward the local default branch from the remote.

**Local mode:** after Prepare, Review, and Fix rounds, run the full local check suite on the branch. Fast-forward the local default branch from the remote, merge the branch into it with `git merge --no-ff` and a pull-request-style message (summary, tasks, checks), push it, and delete the merged branch locally and, if it was pushed, on the remote. If the push is refused, report partial delivery with the unpushed merge.

Never force-push or rewrite remote branches. Delete a branch only after its work has merged. If the remote cannot be safely determined, stop and report.

## Failure handling

On failure, preserve the repository state, report the exact failing stage with evidence, and suggest the smallest corrective action. Ship stops on: an unaccepted spec or decision, a hotfix that is not hotfix-sized, blocking findings or red checks after the fix rounds, unresolvable conflicts, and a protection rule it cannot meet. Never report the work as shipped when a gate failed.

## Output

### Delivery
Shipped, partial, or blocked; the pull request (or local merge) and its commit SHA.

### Checks
Each check and its result, and the links CI attached; pending checks reported as pending.

### Review
Where it was posted, whether it used a separate worker or was single-agent, findings and fix rounds, and the hotfix judgment when it applies.

### Merge
Merge method and commit, the spec status set, branch deleted, and local default branch fast-forwarded; or what blocked the merge.

### Next
Only if something remains unresolved (for example "accept the spec", `to-spec`, or a required approval).

## Restrictions

No destructive reset, force-push, secret exposure, or unnecessary documentation ceremony.
