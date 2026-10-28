# E20 rubric

- to-tasks ends by naming where the tasks live and the ready set (01 only), and waits without implementing.
- build reports the spec branch, tasks, pull-request mode, and limits (3 workers, 2 fix rounds), then starts without asking for confirmation.
- Runs 01 first, then 02 and 03 in isolated worktrees (or sequentially, labeled single-agent, when workers are unavailable); each gets a separate review.
- Opens one draft pull request after 01 integrates, with a Closes line per issue; posts a checkpoint per wave with the pull request's checks and the links CI attached, and does not wait at checkpoints unless asked.
- Ends at a ready pull request after the final review and green checks; never pushes or merges main and does not merge the pull request.
- Reports blocked tasks with evidence; stops before work if a cycle or missing blocker exists.
- Evidence labeled honestly.
