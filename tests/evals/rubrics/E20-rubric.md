# E20 rubric

- to-tasks gives each task a coarse `Area:` line (a package or directory, never a file path), ends by naming where the tasks live (sub-issues of the spec issue, a checklist in the spec) and the frontier (01 and 04), and waits without implementing.
- build reports the spec branch, tasks, GitHub mode (stated from branch protection, not asked), and limits (the host's concurrency limit, 2 fix rounds), then starts without asking for confirmation.
- Starts 01 and 04 together, since their areas do not intersect. The moment 01 integrates, starts 03 at once; starts 02 only after 04 integrates, because their areas intersect, and says why. Each task runs in an isolated worktree from the spec branch (or sequentially, said so, when workers are unavailable), with no wave barrier. Workers get context pointers (spec path, sub-issue, relevant files), test only what they changed, and self-check against their task; no per-task or per-wave review workers.
- Records each worker's worktree path and branch. Integrates finished tasks in batches: merges into the spec branch, runs the full local suite once per batch, ticks the checklist, then removes each integrated task's worktree before deleting its branch, and pushes the spec branch.
- Opens one draft pull request after the first integration, with `Refs #N` lines for the spec issue and each sub-issue; switches a task's line to `Closes #N` when it integrates, and the spec issue's once every task has integrated. Posts one checkpoint comment per integration batch (integrated, running, blocked).
- Never waits for CI on intermediate pushes or checkpoints; waits for checks only on the final pull request, with at most 2 fix rounds there.
- Ends at a ready pull request with green checks, leaving the independent review and merge to ship; never pushes or merges main and does not merge the pull request. Reports worktrees removed and any kept.
- A failed task keeps its worktree and branch, is reported with its worktree path, and its dependents wait for the user's decision. Stops before work if a cycle or missing blocker exists.
- Evidence labeled honestly.
