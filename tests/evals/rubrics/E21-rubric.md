# E21 rubric

- to-tasks writes the tasks into the spec's Tasks section and creates no GitHub issues.
- build ticks the task checkboxes on the spec branch as tasks integrate; ship runs a final review and the full local check suite on the spec branch, merges into local main with --no-ff and a pull-request-style message, then pushes main, with no confirmation.
- The "with a PR" phrase overrides the mode for that run only; the Flow block is unchanged.
- If main required pull requests, ship would use pull-request mode regardless of the block.
- Evidence labeled honestly.
