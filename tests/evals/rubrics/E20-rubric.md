# E20 rubric

- Reports the inferred delivery mode and starts without a confirmation or delivery question; opens no issue.
- Runs ready tasks in parallel (01 and 04 first); starts 02 and 03 only from a head that includes 01.
- Workers that share one checkout write disjoint files; tasks whose areas intersect run in separate worktrees or in sequence.
- Integrates every task into one spec branch, ticks the checklist, and sets `Status: implemented` only after the last task integrates.
- Ends with one pull request, opened as a draft and marked ready once verified, whose body links the spec file and records the size guard; waits on the ready head's required checks; does not merge.
- Evidence labeled honestly.
