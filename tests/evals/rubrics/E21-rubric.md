# E21 rubric

- to-tasks writes the tasks into the spec's Tasks section and creates no GitHub issues.
- build ticks the task checkboxes on the spec branch as tasks integrate, then (run by ship when needed) runs the one spec review and the full local check suite on the spec branch and merges into local main with --no-ff and a pull-request-style message; ship then pushes main to the remote, with no confirmation, and runs Verify.
- The "with a PR" phrase overrides the mode for that run only; the Flow block is unchanged.
- If main required pull requests, ship would use pull-request mode regardless of the block.
- Evidence labeled honestly.
