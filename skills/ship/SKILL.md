---
name: ship
description: Land accepted work with no confirmation, building if needed, then independent review on the pull request, green checks, merge, and sync. Use when the user says "ship it", "land it", or "drop the spec".
disable-model-invocation: false
---

# Ship

## Purpose

"Ship it" lands the current authorized work: one change, or a spec's task set on one branch. It builds when no pull request exists, gets an adversarial review posted on the pull request, fixes findings, waits for green checks, merges, deletes the branch, and syncs the local default branch and the spec issue (decisions 0028 and 0029). It also drops a spec the user abandons.

Asking to ship authorizes these steps with no confirmation, subject to repository permissions and branch protection. It does not authorize destructive Git operations, force-pushing, rewriting remote branches, security bypasses, approving its own pull request, production promotion or rollback unless explicitly asked, or unrelated changes. The one carve-out is dropping a spec (see Abandoned specs).

Before a multi-step run, suggest the host's autonomous permission mode when it has one (for example Claude Code auto mode) so file writes, comments, and pushes do not stop for each permission prompt. The gates below still apply.

## Preflight

Inspect the current branch and worktrees, Git status and diff, existing staged changes, the available remote, and the delivery mode as `build` describes under Delivery mode; these reads are independent, so issue them as parallel tool calls, not workers. Settle the mode before the spec gate: when it is unset, ask as `build` describes; a request that names a mode answers it. If the working tree contains changes with unclear ownership, preserve them and avoid staging them blindly. A one-run override ("ship it local", "ship it with a PR") changes only the finish, never where tasks live.

Classify the work. Resolve its spec from (a) the branch name, (b) files under `docs/specs/` (or the project's spec location) that the change touches, and (c) the issues the work closes (`Closes #N`) and the spec each links.

- **Spec work:** any source points at a spec, or classification is uncertain. Read the spec from the branch head, after updating from the default branch when it is not accepted there.
  - **Pull-request mode with a spec issue** (the spec's `Issue:` line): the gate is the `accepted` label on that issue, every time; a file that says `implemented` does not pass without it. The gate follows the spec, not a one-run override: a spec with an `Issue:` line always uses the label gate, even for "ship it local". Ship never sets the `accepted` label itself. The file follows the label: when the label is set and the file still says draft, write `accepted` on its `Status:` line and promote each linked **Proposed** decision to **Accepted**, with the date, in one commit on the branch, as `to-spec` does for "accept the spec". A file that says `accepted` without the label does not pass. When GitHub cannot be reached, say so and stop; never fall back to the file status.
  - **A spec with no `Issue:` line** (local mode): its `Status:` must be `accepted`, or `implemented` on this unmerged branch when the latest status before `implemented` in the spec's history (this branch or the default branch) is `accepted`.
  - Either way, no decision record it links may still be **Proposed** after that. Otherwise name each spec or linked decision that is not accepted, with its status or label, suggest "accept the spec", and stop before building, committing, or pushing anything. If the spec cannot be resolved, say so and stop the same way.
- **Hotfix:** work with no spec link at all, including work that closes only issues belonging to no spec. It ships through the same cycle; the review also judges whether it is hotfix-sized (see Review).

## Build

Run `build` first, passing this run's delivery mode, when no pull request exists for the work (pull-request mode), the pull request is still a draft, the spec's task set has runnable tasks left, the work has uncommitted or unpushed changes, or (local mode) the work sits on the default branch; unpushed changes count in pull-request mode only, since local spec branches are never pushed. `build` commits, pushes, opens or finishes the pull request, and waits for checks. On a spec's task set, `build` runs it (see its Task set), then ship lands the pull request it marked ready. Related work shares one branch and pull request; split only large, independently shippable work. In local mode, `build` delivers a branch with the local check suite passing.

## Prepare

Make the branch final before the last review, so the merged head is the one reviewed and checked. Spec gate, `build`, Prepare, and Merge stay in order:

1. For spec work, `build` sets the spec's `Status:` line to `implemented` in its last integration push once every task has integrated. When every task has integrated and the line is still missing that status, set it on the branch, so the spec reads as done after the branch is deleted, and re-sync its spec issue as `to-spec` describes.
2. In pull-request mode, update the branch from the default branch only when the pull request is behind or conflicts; stop on conflicts that cannot be resolved within scope.
3. After any push, wait for checks on the new head.

## Review

Run the one independent review of the spec (or hotfix) here: run `review` (per-axis workers plus verifier, as `review` describes) over every task's change together, alongside the wait for checks on the same head. `build` workers only self-check against their task; there are no per-task or per-wave reviews. Ship's request authorizes these workers and posting the result. A review run without workers gates the same way; label it single-agent on the pull request (or in the local report).
- **Pull-request mode:** review the pull request and post the result as a comment or a COMMENT-type review, never an approval.
- **Local mode:** review merge base to spec-branch head and report the review in the conversation.

Record the head SHA the review and checks covered.

**Hotfix guard.** For a hotfix, the review also judges size: new product behavior, a data-shape or public API change, or a migration is a blocking finding. Ship stops there and suggests `to-spec`.

## Fix rounds

On blocking findings or failing checks, run fix rounds as `build` describes under Deliver, then review and check the new head again. Fixes to files no other fix touches go to parallel workers (fan-out rule: `write-agents` Workers). A pending check is pending, never passing. Never hide, skip, disable, or weaken a failing check. If the gate still fails after the fix rounds, stop and report.

## Merge

**Gate.** Merge automatically, with no question, when the spec passed the Preflight gate, checks are green, no findings are blocking, and branch protection is satisfied. Never approve the agent's own pull request and never bypass protection (for example `gh pr merge --admin`). When protection requires a human approval, stop after the review and report that an approval is needed.

**Pull-request mode:**

1. Keep a `Closes #N` line for the spec issue once every task integrated, and for each sub-issue whose task integrated; list the rest as `Refs #N`. Merge only the reviewed and checked head SHA, with a method the repository allows (for example `gh pr merge --match-head-commit <sha>`). If the head changed after the review, including someone else's push, review and check the new head first. The pull request carries a Conventional Commits title and a link to the spec file.
2. Delete the head branch on the remote and locally (for example `gh pr merge --delete-branch`), then fast-forward the local default branch from the remote.
3. Re-sync the spec issue as `to-spec` describes, with its file link and relative links pointing at the default branch, since the branch is gone.

**Local mode:** no remote is needed.

1. After Prepare, Review, and Fix rounds, re-run the full local check suite on the branch (the commands `build` names) unless this run's `build` verified exactly this head, and report the exact commands. With no suite found, stop and report.
2. Switch the primary checkout to the default branch when it is clean; a dirty checkout stops with a report. Fast-forward it from the remote only when one is configured.
3. Merge only while the spec-branch head still equals the reviewed SHA, with `git merge --no-ff` and a pull-request-style message (summary, tasks, checks). Then remove the spec-branch worktree, if the orchestrator used one, and delete the merged branch locally.
4. Push the default branch, and delete the branch on the remote, only when the request asks ("ship it and push"). If that push is refused, report partial delivery with the unpushed merge.

**Worktrees.** After the merge, either mode, run `git worktree prune`. Remove only worktrees on the orchestrator's recorded worker list for the spec, never ones the user created. Delete a task branch only when it is an ancestor of the reviewed spec-branch SHA, with `git branch -d` only, never `-D`. Never `--force`; keep dirty worktrees. When no worker list is available (for example a new session), remove nothing and report the spec's remaining task worktrees. Report the worktrees and branches removed, and each one that does not qualify, with its path. A failed task's worktree stays and is reported with its path.

Never force-push or rewrite remote branches. Delete a branch only after its work has merged, or when the user's request drops its spec. In pull-request mode, if the remote cannot be safely determined, stop and report.

## Abandoned specs

Only the user's own request drops a spec ("drop the spec", naming it or with it clear from context); a failed gate or another skill never does. That request authorizes closing its spec issue and sub-issues as not planned, closing its pull request without merging, deleting its unmerged branch, and removing its task worktrees and branches, nothing else. On it, in order: (1) in pull-request mode, close its spec issue and open sub-issues as not planned (for example `gh issue close --reason "not planned"`) and close its pull request without merging; (2) remove the spec-branch worktree if the orchestrator used one, then the clean task worktrees on the recorded worker list, never with `--force`, and report each dirty or unlisted worktree with its path, leaving it and its branch; (3) delete the spec branch and the branches of the removed task worktrees with `git branch -D`, which only this request authorizes because their work is being discarded, and the spec branch on the remote when it was pushed. Nothing reaches the default branch, and the issue keeps the spec's text.

## Failure handling

On failure, preserve the repository state, report the exact failing stage with evidence, and suggest the smallest corrective action. Ship stops on: an unaccepted spec or decision, a hotfix that is not hotfix-sized, blocking findings or red checks after the fix rounds, unresolvable conflicts, and a protection rule it cannot meet. Never report the work as shipped when a gate failed.

## Output

### Delivery
Shipped, partial, or blocked; the pull request (or local merge) and its commit SHA.

### Checks
Each check and its result, and the links CI attached; pending checks reported as pending.

### Review
Where it was posted, whether it used per-axis workers and a verifier or was single-agent, findings and fix rounds, and the hotfix judgment when it applies.

### Merge
Merge method and commit, the spec status set, issues closed and the spec issue re-synced, branch deleted, local default branch fast-forwarded or not (no remote), whether anything was pushed, and worktrees removed (or kept, with paths); or what blocked the merge. For a dropped spec, the issues closed as not planned and the branches and worktrees removed.

### Next
Only if something remains unresolved (for example "accept the spec", `to-spec`, or a required approval).

## Restrictions

No destructive reset, force-push, secret exposure, or unnecessary documentation ceremony.
