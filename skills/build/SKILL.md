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

"Build it" ends in a pull request with green checks (local mode: a branch with the full local check suite passing). Asking to build authorizes these steps with no confirmation. It does not authorize committing to, pushing, or merging the default branch (for example `main`), force-pushing, rewriting remote branches, destructive Git, skipping checks, or unrelated changes. When the user asks only for local edits ("don't commit"), stop after the change and report; do not record `Delivery:` either.

**Pull-request mode** (see Delivery mode):

1. **Branch.** Work on a branch that is not the default branch: the spec branch for a task set, the current branch when it already holds this work or is this spec's branch, otherwise a new branch from the current base.
2. **Commit** only this work: review the diff, stage only intended files, and preserve unrelated working-tree changes. Exclude credentials, local logs, and generated secrets. Follow repository commit conventions. Do not amend or rewrite unrelated commits.
3. **Push** the branch to its remote. If the remote cannot be safely determined or the push is refused, stop and report.
4. **Open a pull request,** or update the one already open for the branch. Ad-hoc work opens it ready for review, not as a draft, with a Conventional Commits title, a summary, and a `Closes #N` line per task issue. A task set uses the draft opened under Task set.
5. **Wait for checks** with bounded monitoring (for example `gh pr checks --watch` under a time limit, or polling) until every check completes or a reasonable limit passes. A pending check is reported as pending, never as passing. With no checks configured, say so.
6. **Fix rounds.** On a failing check, read its logs, fix failures this work caused when safely in scope, commit, push, and wait again: at most 2 fix rounds. Then stop and report the failing check with evidence. Never skip, disable, or weaken a check to get green.
7. **Report** the pull request, each check's result, and the links CI attached (deployments and previews the pull request shows, such as deployment statuses or check details URLs); say when there are none.

**Local mode:** commit to a branch that is not the default branch as above, run the full local check suite, apply the same fix rounds, and report the branch, commit SHA, and check results. No push and no pull request.

## Delivery mode

Read the `Delivery:` line in the project's Flow block (`AGENTS.md` or `CLAUDE.md`). When it is missing or `unset`, infer: pull-request mode if the default branch (for example `main`) requires pull requests (for example branch protection or rulesets visible through `gh`), local mode only when you can confirm it does not. When protection cannot be determined (no access, unauthenticated CLI), pick pull-request mode; never fall through to local mode. Report the pick and record it on that line, touching nothing outside the block's markers, in its own commit on the branch being built. Without a Flow block, use the pick for this run only. A one-run override ("build it local", "build it with a PR") changes only how this run delivers; task records stay where they are. A default branch that requires pull requests always uses pull-request mode.

- **Pull-request mode:** tasks are GitHub issues; the work is delivered as one pull request.
- **Local mode:** no pull requests or issues; tasks live in the spec's Tasks section, and the work is delivered on a branch for `ship` to merge.

## Task set

"Build it" on a spec's task set (issues in pull-request mode, the spec's Tasks section in local mode) makes this session the orchestrator on one spec branch. Without a task set, build the current work as described above.

1. **Plan.** Read every task and its blocking edges. Stop before any work on a cycle or a blocker that does not exist. The **ready set** is the tasks whose blockers have all integrated. Report the tasks, the delivery mode, whether checkpoints wait, and the limits (at most 3 concurrent workers and 2 fix rounds per task), then start with no confirmation. Suggest the host's autonomous permission mode when it has one (for example Claude Code auto mode). A task that drifts from its stated scope stops for the user's yes.
2. **Build** in **waves**: a wave is the ready set when it starts and ends when each of its tasks has integrated, failed, or been blocked. Start one worker per task in the wave in an isolated worktree from the spec branch, up to the concurrency limit. Serialize tasks that touch overlapping areas; never let two workers edit the same files. Each worker implements its task with this skill, without delivering it, and runs its checks.
   - **Notes.** Before the first wave of a set with more than one task, a worker writes notes on the spec, tasks, and relevant code to `<git common dir>/flow/notes/<spec>.md` (find the directory with `git rev-parse --path-format=absolute --git-common-dir`); notes are never committed. Give each task worker the absolute path to the notes, not a copy.
   - **Shared files.** Files the project's instructions tell every session to append to (for example a prompt log) are written only by the orchestrator, on the spec branch; the orchestrator names them in each worker's brief, and workers leave them untouched.
3. **Review.** A separate worker reviews each task's change for correctness and security against the task. The full five-axis `review` runs on each wave's combined change at the checkpoint, before pushing, and once on the final change (the pull request, or the spec branch in local mode); the push that opens the draft comes before the first wave review. Task findings go back to the implementing worker as fix rounds until the gates pass or the round limit is reached; a wave finding goes to the worker of the task that owns the affected files, or to the orchestrator when it spans tasks.
4. **Integrate.** Merge each passing task into the spec branch. In pull-request mode, push the spec branch and open a draft pull request after the first task integrates, with a Conventional Commits title and a `Closes #N` line per task issue. When tasks live in the spec (local mode), tick the task's checkboxes and set its **Status:** to `done` on the spec branch as it integrates. A conflict goes back to the later task's worker as a fix round. A failed or stuck task stops its dependents, which wait for the user's decision and are not runnable until then: report it with evidence and keep the rest of the wave moving.
5. **Checkpoint** after each wave. Run the wave `review` and its fix rounds. In pull-request mode, push the spec branch and wait for the pull request's checks on that exact commit (see Deliver); local mode runs the local check suite without pushing. Then post: wave number; tasks integrated, failed, or blocked with one-line reasons, noting dependents that wait for the user's decision; check and review results; commit SHA; the links CI attached; screenshots of changed screens when a browser tool is available, otherwise say there are none. Report pending or failed checks as such. Pull-request mode posts the checkpoint as a pull request comment; local mode reports it in the conversation. Checkpoints do not wait: the next wave is the ready set after the checkpoint, unless the user asked to wait at checkpoints.
6. **Finish** once no runnable task remains, reporting dependents still waiting for the user's decision. In pull-request mode, after the final `review` and green checks, mark the draft ready for review and stop there: merging is `ship`'s job. In local mode, stop at the spec branch with the full local check suite passing.

Gates: checks green, no blocking review findings, branch protection respected. Without independent workers, run the ready tasks sequentially in the same order on the spec branch, write the notes as the orchestrator, label reviews single-agent, and say so. Report waves and checkpoints posted, tasks integrated, tasks blocked and why, the limits used, and the pull request with its checks and links.

**Board states.** Record live task states with `node <board>/scripts/board.mjs`, where `<board>` is the `board` directory next to this skill's directory; if that script is missing, skip recording. Only the orchestrator records; workers never do. Run records one at a time.

- When the run begins: `--record run-start --spec <NNN> --branch <spec branch> --mode <local|pull-request> --tasks <01,02,…>`.
- As each wave's tasks start, change state, and integrate, and again for every unfinished task at each checkpoint and at least every 10 minutes while workers run (a heartbeat): `--record task --task <NN[,NN…]> --state <state> [--round <n>] [--note "<one line>"]`.
- When the set finishes or stops: `--record run-end`.

Recording is best-effort: a failed record never stops or delays the run.
