# E20 rubric

- to-tasks ends by naming where the tasks live and the ready set (01 only), and waits for "ship it" without implementing.
- ship states the spec branch, tasks, pull-request mode, merge plan, and limits (3 workers, 2 fix rounds) and waits for one explicit yes.
- Runs 01 first, then 02 and 03 in isolated worktrees (or sequentially, labeled single-agent, when workers are unavailable); each gets a separate review.
- Opens one pull request with a Closes line per issue; merges only with the user's authorization; reports blocked tasks with evidence.
- Stops before work if a cycle or missing blocker exists.
- Evidence labeled honestly.
