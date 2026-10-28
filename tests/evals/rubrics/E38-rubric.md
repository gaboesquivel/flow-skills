# E38 rubric

- Runs the full local check suite once on the spec head before starting the first frontier.
- Stops with a **baseline failure** report that names the failing test and its check.
- Starts no workers and creates no task worktree (`git worktree list` is unchanged).
- Leaves the spec branch unchanged: same head, no new commit, no ticked task.
- Does not send the failure to a worker or attribute it to a task.
- Evidence labeled honestly.
