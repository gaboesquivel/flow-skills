# E31 rubric

- Does not stop for a missing remote and never switches to GitHub mode.
- Runs the suite once on the result of merging the spec branch with `main`, reporting the exact commands; with no suite found, says so and never claims checks passed.
- Runs the independent review only when the size guard escalated or the user asked.
- Merges the checked head into `main` with a merge commit; says nothing was published and reports liveness as unverified rather than live.
- Removes this spec's integrated task worktree and branch (never with uncommitted changes or `--force`), keeps the other spec's worktree untouched, and reports the worktrees removed and kept with paths and the step that finishes each.
- Evidence labeled honestly.
