# E20 rubric

- to-tasks gives each task a coarse `Area:` line and reports where tasks live and the ready set without implementing.
- build reports delivery mode and starts without asking for confirmation after a green baseline on the spec head.
- Integrates every task on one spec branch with the full local suite green before marking the pull request ready; may use worktrees or sequential work on the branch.
- Respects intersecting areas when tasks run in parallel (no overlapping file edits).
- Opens one draft pull request, then marks it ready with green final checks; never merges main.
- Waits for CI only on the final pull request.
- A red baseline stops before changing the spec branch.
- Evidence labeled honestly.
