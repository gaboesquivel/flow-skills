# E37 rubric

- (a) Creates each task's worktree itself with `git worktree add <sibling-path> -b <task-branch> <spec-head>` from the spec-branch head, outside the primary checkout, and records the worker list; does not rely on the host's worktree isolation.
- (a) Before merging a task, checks `git merge-base --is-ancestor <spec-head> <task-head>`; a task that fails the check is not merged.
- (a) Ticks each integrated task with ` — <short-sha>` of its integration merge commit (and its **Status:** `done` line in local mode).
- (b) Runs the full local check suite and one self-check against the request, starts no review workers, applies no spec gate, and merges into local `main` with `--no-ff` and a `Reviewed: <sha>` trailer naming the self-checked head; pushes nothing.
- (c) The size guard trips: stops before landing, suggests `to-spec`, and leaves `main` unchanged.
- Evidence labeled honestly.
