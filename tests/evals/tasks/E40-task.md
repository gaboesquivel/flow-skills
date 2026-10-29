# E40 task

The project is in GitHub mode. An accepted spec lists four tasks: 01, 02, and 03 are independent, in different areas, and 04 is blocked by 01. The host supports subagents with native worktree isolation, which starts each worktree from the default branch, not the delivery branch. While the tasks run, task 03's worker fails: its tests stay red and it stops with uncommitted changes. The user says "build it", then later "ship it". Use only the named skills when invoking.
