---
name: build
description: Implement an authorized change from a request, specification, or task, keeping root context aligned. Use when the user says "build it", "implement this", or "make the change".
disable-model-invocation: false
---

# Build

Read the relevant request, repository instructions, current context, and code. If the user supplies a task reference, retrieve it with available tools and resolve consequential ambiguity. A tracker, setup step, or formal spec is not a prerequisite for a clear small change.

State the intended observable result and implement the smallest useful increment using existing patterns. Preserve unrelated working-tree changes. Do not add scope just because it is nearby. Ordinary small fixes do not need architecture work or a formal spec. When a new product or substantial feature has unclear intent, suggest an `explore` tier and wait; never start exploration unasked. Clear requests proceed.

For consequential domain or API changes, understand module ownership, name the data shapes and caller expectations before committing to a new abstraction, and prefer a small executable test over extended debate when an observable fact is cheap to check.

When the spec or task names test seams, write a failing test at that seam before the change, then make it pass. Otherwise, for meaningful behavior changes, prefer tests at established public interfaces when the project already tests that way. Run focused checks while working and applicable final checks once the change stabilizes.

Review the actual changed files, including untracked files, against the request and project constraints. Optional `review` skill guidance can inform a self-check when that skill is installed; a separate review pass is not required.

When behavior or accepted context changes, update owning documentation. For meaningful product, design, architecture, or terminology shifts, align the current project's `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` (create a root file only when it would hold meaningful content about that project). Do not replace a project's product identity with Flow's methodology identity. `flow start` and "start project" do not authorize initialization; do not scaffold a new repository unless the `start` skill is installed and the user confirmed its template, name, and destination (decision 0010, amended by decision 0022). Link to specs or decisions instead of duplicating durable rationale; do not open new spec or decision files unless the user asked or the work already uses that convention.

Then deliver (see Deliver). Report the result, files, checks, limitations, and remaining work.

## Deliver

"Build it" ends in a pull request with green checks (local mode: the reviewed work merged into local `main`, nothing pushed). Asking to build authorizes these steps with no confirmation. It does not authorize committing to, pushing, or merging the default branch (for example `main`), force-pushing, rewriting remote branches, destructive Git, skipping checks, or unrelated changes. The one exception is local mode: a single `--no-ff` merge of the work's branch into local `main`, only after the gate and review (see Local mode); never a push. When the user asks only for local edits ("don't commit"), stop after the change and report; do not record `Delivery:` either.

**Pull-request mode** (see Delivery mode):

1. **Branch.** Work on a branch that is not the default branch: the spec branch for a task set (named with the spec's number and slug, for example `feat/017-build-and-ship`), the current branch when it already holds this work or is this spec's branch, otherwise a new branch from the current base.
2. **Commit** only this work: review the diff, stage only intended files, and preserve unrelated working-tree changes. Exclude credentials, local logs, and generated secrets. Follow repository commit conventions. Do not amend or rewrite unrelated commits.
3. **Push** the branch to its remote. If the remote cannot be safely determined or the push is refused, stop and report.
4. **Open a pull request,** or update the one already open for the branch. Ad-hoc work opens it ready for review, not as a draft, with a Conventional Commits title, a summary, and a `Closes #N` line per task issue. A task set uses the draft opened under Task set and waits for checks only on that final pull request.
5. **Wait for checks** with bounded monitoring (for example `gh pr checks --watch` under a time limit, or polling) until every check completes or a reasonable limit passes. A pending check is reported as pending, never as passing. With no checks configured, say so.
6. **Fix rounds.** On a failing check or a blocking finding, read its evidence (logs, findings), fix what this work caused when safely in scope, commit, push (pull-request mode), and check again on the new head: at most 2 fix rounds. Then stop and report the failure with evidence. Never skip, disable, or weaken a check to get green. This is the one definition of a fix round; workers and `ship` use it.
7. **Report** the pull request, each check's result, and the links CI attached (deployments and previews the pull request shows, such as deployment statuses or check details URLs); say when there are none.

**Local mode:** commit to a branch that is not the default branch as above, run the full local check suite, and apply the same fix rounds. Then land the branch on local `main`, for ad-hoc work and a task set alike:

1. **Gate.** Check the gate `ship` defines under [Preflight](../ship/SKILL.md#preflight), and stop as it says when the gate fails. For spec work, the spec's `Status:` then reads `implemented` on the branch (Task set step 3 sets it; set it here otherwise).
2. **Review.** Run the one independent review from merge base to branch head the way `ship`'s [Review](../ship/SKILL.md#review) runs it (per-axis `review` workers plus verifier, hotfix guard included), with fix rounds as above, then re-run the full local check suite on the new head.
3. **Merge.** `git merge --no-ff` the branch into local `main` from a checkout of `main`. Stop and report when that checkout has changes the merge would touch or the merge conflicts; never discard changes to get through.
4. **Clean up.** Delete the merged branch with `git branch -d` and remove the remaining clean worktrees on the worker list (Task set Cleanup rules apply).

A failed task, a failed gate, or a blocking review after the fix rounds leaves local `main` untouched: stop with the branch kept and report. Report the branch, the merge commit SHA on `main`, the review result, the exact commands run, and their results. No push and no pull request; no remote is needed.

**Full local check suite:** the project's documented check commands, from the instruction file's command table, else package scripts for test, lint, typecheck, and build. When none are found, report that no suite exists instead of claiming checks passed.

## Delivery mode

This section is the one home of the delivery rule; other skills point here instead of restating it. `flow` owns the block and process depth. Read the `Delivery:` line in the project's Flow block (`AGENTS.md` or `CLAUDE.md`). A default branch (for example `main`) that requires pull requests always uses pull-request mode: when branch protection or rulesets show it, report the mode without asking. A request that names a mode ("build it local", "build it with a PR") answers it; as an override of a recorded line it changes only this run, and task records stay where they are.

When the line is missing or `unset`, ask before the first push or other step that depends on the mode, in one round together with process depth when that is unset too. Inference only suggests an answer: suggest pull requests when a GitHub remote exists and local when there is none. With no remote, never pick pull-request mode. With a remote and protection that cannot be determined (no access, unauthenticated CLI), suggest pull-request mode and never fall through to local mode on your own. Never record a mode the user did not give. Record the answer with `flow`'s block helper on that line, touching nothing outside the block's markers, in its own commit on the branch being built; without a Flow block, the answer holds for this run only.

- **Pull-request mode:** tasks are sub-issues of the spec issue, listed as a checklist in the spec's Tasks section; the work is delivered as one pull request.
- **Local mode:** no pull requests, issues, or remote required; tasks live only as the spec's Tasks checklist, and `build` reviews the spec branch and merges it into local `main` (see Deliver); `ship` publishes it.

## Task set

"Build it" on a spec's task set makes this session the orchestrator on one spec branch; it may run in a worktree of the spec branch so the primary checkout stays on the default branch. In pull-request mode the tasks are sub-issues of the spec issue; in local mode they live only in the spec. Either way the spec's Tasks section is a checklist, `- [ ] NN: Title (#N)` (no issue number in local mode). Without a task set, build the current work as described above.

1. **Plan.** Read every task, its blocking edges, and its `Area:` line (a package or directory). Stop before any work on a cycle or a blocker that does not exist. The **frontier** is the tasks whose blockers have all integrated. Report the tasks, the delivery mode, whether checkpoints wait, and the limits (the host's concurrency limit and 2 fix rounds per task), then start with no confirmation. Suggest the host's autonomous permission mode when it has one (for example Claude Code auto mode). A task that drifts from its stated scope stops for the user's yes.
2. **Run the frontier** (fan-out rule: `write-agents` Workers): start a worker for every frontier task at once, each in its own isolated worktree from the spec branch, up to the host's concurrency limit. Record each worker's worktree path and branch, whatever names the host chose; this is the worker list. Tasks whose areas intersect run one after another; a task without an `Area:` line runs alone. Never let two workers edit the same files. When a task integrates, immediately start every task it unblocks; never wait for the other running tasks to finish.
   - **Brief.** Give each worker context pointers, not copies: the spec path, its task's sub-issue (or Tasks entry in local mode), and the files relevant to it, and the board record command with its path (see Board states) so it records its own task's state. Each worker implements its task with this skill, without delivering it.
   - **Worker checks.** A worker runs only the tests for what it changed, then self-checks its diff against the task. A failure or gap is a fix round (see Deliver), then the task is reported as failed.
   - **Shared files.** Files the project's instructions tell every session to append to (for example a prompt log) are written only by the orchestrator, on the spec branch; the orchestrator names them in each worker's brief, and workers leave them untouched.
3. **Integrate** finished tasks as they arrive, in **integration batches** (the tasks merged since the last suite run). Merge each into the spec branch; a merge conflict goes back to that task's worker as a fix round. Run the full local check suite once per batch; on a failure, bisect to the task that caused it and send it back to that worker as a fix round. Once the batch passes, for each task: tick its checklist entry (in local mode also its acceptance checkboxes and its **Status:** to `done` when the spec holds them), then clean up. When every task has integrated and the spec is accepted (the `accepted` label on its spec issue, or `Status: accepted` in local mode), set its `Status:` to `implemented` in that same batch; never on a spec that is not accepted. In pull-request mode, re-sync the spec issue as `to-spec` describes and push the spec branch; local mode pushes nothing.
   - **Cleanup.** Remove only worktrees on the recorded worker list. Delete a task branch only when it is an ancestor of the spec branch head, with `git branch -d`, never `-D` or `--force` (a checked-out branch cannot be deleted). Keep dirty or non-qualifying worktrees and branches, and report them.
   - **Draft pull request.** In pull-request mode, after the first integration, open a draft pull request with a Conventional Commits title, a link to the spec file, a `Closes #N` line for each task already integrated, and a `Refs #N` line for the spec issue and every other sub-issue. Each later integration switches that task's line to `Closes #N`; the spec issue's line becomes `Closes #N` once every task has integrated.
   - **Failures.** A failed or stuck task keeps its worktree and branch, and stops its dependents, which wait for the user's decision and are not runnable until then: report it with evidence and its worktree path, and keep the rest of the frontier moving.
4. **Checkpoint** once per integration batch: post tasks integrated, running, and blocked with one-line reasons, noting dependents that wait for the user's decision and the worktree paths kept for failed tasks; the local suite commands and result; the commit SHA; and screenshots of changed screens when a browser tool is available, otherwise say there are none. Pull-request mode posts it as a pull request comment; local mode reports it in the conversation. Checkpoints never wait for CI or the user, unless the user asked to wait at checkpoints. CI runs on every push, but intermediate pushes are never waited on.
5. **Finish** once no runnable task remains, reporting dependents still waiting for the user's decision. In pull-request mode, wait for the final pull request's checks with fix rounds (see Deliver steps 5 and 6), then mark the draft ready for review and stop there: merging is `ship`'s job, after the one independent review per spec. In local mode, once every task has integrated and the full local check suite passes, land the spec branch on local `main` as Deliver › Local mode describes (gate, review, `--no-ff` merge, cleanup); nothing is pushed, and a failed or stopped task leaves `main` untouched.

Gates: the full local suite passes for each integration batch, the final pull request's checks are green, branch protection is respected. Without independent workers, run the frontier tasks in dependency order on the spec branch. Report checkpoints posted, tasks integrated, tasks blocked and why, worktrees removed and kept, the limits used, and the pull request with its checks and links (local mode: the review result and the merge commit on local `main`).

**Board states.** Record live task states with `node <board>/scripts/board.mjs`, where `<board>` is the `board` directory next to this skill's directory; if that script is missing, skip recording. The orchestrator records the run; each worker records its own task's state (the script locks concurrent writes).

- When the run begins: `--record run-start --spec <NNN> --branch <spec branch> --mode <local|pull-request> --tasks <01,02,…>`.
- As each task starts, changes state, and integrates, and again for every unfinished task at each checkpoint and at least every 10 minutes while workers run (a heartbeat): `--record task --task <NN[,NN…]> --state <state> [--round <n>] [--note "<one line>"]`. States follow the frontier: `running`, `integrated`, `blocked` (failed, or stopped behind a failed task until the user decides), and `waiting` (blockers not yet integrated).
- When the set finishes or stops: `--record run-end`.

Recording is best-effort: a failed record never stops or delays the run.
