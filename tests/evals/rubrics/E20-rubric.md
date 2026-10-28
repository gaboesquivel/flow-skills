# E20 rubric

- to-tasks ends by naming where the tasks live (sub-issues of the spec issue, a checklist in the spec) and the frontier (01 only), and waits without implementing.
- build reports the spec branch, tasks, pull-request mode, and limits (the host's concurrency limit, 2 fix rounds), then starts without asking for confirmation.
- Runs 01 first; the moment 01 integrates, starts 02 and 03 together in isolated worktrees from the spec branch (or sequentially, said so, when workers are unavailable), with no wave barrier. Workers get context pointers (spec path, sub-issue, relevant files), test only what they changed, and self-check against their task; no per-task or per-wave review workers.
- Integrates each task by merging into the spec branch, running the full local suite, ticking the checklist, and pushing; opens one draft pull request after 01 integrates, with a Closes line for the spec issue and each sub-issue; posts one checkpoint comment per integration batch (integrated, running, blocked).
- Never waits for CI on intermediate pushes or checkpoints; waits for checks only on the final pull request, with at most 2 fix rounds there.
- Ends at a ready pull request with green checks, leaving the independent review and merge to ship; never pushes or merges main and does not merge the pull request.
- Reports blocked tasks with evidence; stops before work if a cycle or missing blocker exists.
- Evidence labeled honestly.
