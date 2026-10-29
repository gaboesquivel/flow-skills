---
name: build
description: Implement an authorized change from a request, specification, or task, keeping root context aligned. Use when the user says "build it", "implement this", or "make the change".
disable-model-invocation: false
---

# Build

## Outcome

**"Build it"** finishes the authorized work with evidence:

- **GitHub mode:** an open pull request. Build runs no local suite and does not wait for CI; CI is the check, and `ship` waits on it and merges.
- **Local mode:** the suite passes once on the head it merges, then a `--no-ff` merge into local `main`; never a push.

**Why.** A wrong write on the default branch, a force-push, or a skipped check is costly to reverse.

**Proof.** GitHub mode: the pull request is open. Local mode: the suite passed on the merged head, or the report says no suite exists and nothing merged. Escalated work has an independent review; small work has a self-check (see Size guard).

Choose how to implement (one pass or several, with or without workers or worktrees). The proofs are not optional.

Read the request, repository instructions, and code. Preserve unrelated working-tree changes. Do not add scope just because it is nearby. When intent is unclear for a new product or substantial feature, suggest `explore` and wait; never start exploration unasked. When behavior or accepted context changes, update owning documentation; do not replace a project's product identity with Flow's methodology identity. Link to specs or decisions instead of duplicating rationale; do not open new spec or decision files unless the user asked or the work already uses that convention.

"Build it" on a draft spec accepts it, in the build's first commit, as `to-spec`'s accept step describes. A draft that cannot be accepted stops the build: say what is missing.

Then deliver (see Deliver). Report the result, checks, limitations, and remaining work.

## Deliver

Asking to build authorizes these steps with no confirmation. It does not authorize destructive Git, skipping checks, or unrelated changes. Never commit, push, or merge to the default branch (for example `main`), except local mode's one `--no-ff` merge into local `main`. Never force-push or rewrite remote branches. Never skip, disable, or weaken a check. When the user asks only for local edits ("don't commit"), stop after the change and report; do not record `Delivery:` either.

Outside a Git repository, offer `git init` and stop on a no.

**GitHub mode** (see Delivery mode): work on a branch that is not the default branch; commit only this work (no credentials, local logs, or generated secrets; do not amend or rewrite unrelated commits); run the self-check when the work is small; push; open a ready pull request (or update the open one) with a `Closes` line for the spec issue and the size guard's result; report it and return.

**Local mode:**

1. **Gate.** For spec work, check the gate `ship` defines under [Preflight](../ship/SKILL.md#preflight); stop when it fails.
2. **Review.** Self-check, or the independent review from merge base to head when the guard escalated or the user asked, as `ship`'s [Review](../ship/SKILL.md#review) describes, with fix rounds.
3. **Suite.** Run the suite once on the head you will merge; on red, fix (at most two rounds). With no suite found, stop and report; `main` stays untouched.
4. **Merge.** Check out `main`; any uncommitted change there stops the merge. When a remote exists, fast-forward local `main` (`git merge --ff-only`); if it cannot, stop and report. Then `git merge --no-ff` with trailers `Spec: <path>` for spec work and `Review: self-check` or `Review: independent`. When a review ran, merge only the reviewed head. Stop on conflicts; never discard changes to get through.
5. **Clean up.** Delete the merged branch with `git branch -d` and remove clean worktrees on the recorded worker list only.

A failed gate, blocking review, or red suite after fix rounds leaves local `main` untouched.

**Suite:** documented check commands from the instruction file's command table, else package scripts for test, lint, typecheck, and build. When none are found, say so instead of claiming checks passed.

### Unspecced work

Work with no spec or task is unspecced. Write a spec or tasks only when the user asks. On `explore/<slug>` with a confirmed brief, rename to `feat/<slug>` before the first commit. The build request accepts any **Proposed** direction-change record the branch adds: set it to **Accepted** with back-pointers as `to-spec`'s accept step describes. Escalated unspecced work is reviewed against the request (and brief when there is one).

### Size guard

One home; `ship` points here. Judge once, at intake, before implementing; it never stops the work. Escalate for new product behavior, data shape or public API changes, migrations, or touches to authentication or permissions; secrets or credentials handling; dependencies or lockfiles; CI, workflow, or Git hook configuration; shell, exec, or filesystem-execution paths. When the size is uncertain, treat it as escalated.

- **Small:** one single-agent self-check with fix rounds.
- **Escalated, or the user asked ("review it"):** the independent review. Local mode runs it before merging; GitHub mode leaves it to `ship`.

## Delivery mode

One home; other skills link here. `flow` owns the block. Read `Delivery:` in the Flow block. A default branch that requires pull requests always uses GitHub mode. "Build it local" on such a repository commits on a branch, runs what the work needs, and stops before Merge: no merge into `main`, no push, no pull request. "Ship it" on that branch delivers in GitHub mode. A request that names a mode answers it; never record a mode the user did not give.

When the line is missing or `unset`, ask before the first push or step that depends on mode. Suggest GitHub when a remote exists and local when there is none. With no remote, never pick GitHub mode. When protection cannot be determined, suggest GitHub mode and never fall through to local mode on your own.

- **GitHub mode:** one pull request per spec; `ship` merges it.
- **Local mode:** merge into local `main`; `ship` publishes.

Either way, tasks stay a checklist in the spec.

## Task set

"Build it" on a spec's task set integrates every task on one spec branch. You may run tasks in parallel with worktrees, run them one after another on the branch, or combine both; never let two workers edit the same files.

1. **Plan.** Read tasks, blockers, and `Area:` lines. Stop on a cycle or missing blocker. Report delivery mode and start without confirmation. A task that drifts from its stated scope stops for the user's yes.
2. **Do the work.** Implement each runnable task. When using worktrees, create them from the spec head (do not rely on the host's worktree isolation), record paths on the worker list, run setup, and never commit env files copied into worktrees. Before integrating, check ancestry and file overlap; a task that fails the check is not merged. Integrate with `git merge --no-ff`. **Cleanup:** remove only worktrees on the recorded worker list; delete task branches with `git branch -d` only, never `-D` or `--force`. A failed or stuck task keeps its worktree and branch.
3. **Finish.** In the last commit, tick the checklist (with short SHAs) and set `Status: implemented`. Then deliver as Deliver describes for the mode.

Without separate workers, run tasks in dependency order on the spec branch.
