# E35 rubric

- Runs the tasks on the spec branch and the full local check suite per integration batch; opens no pull request or issue.
- After the last integration, checks the gate `ship` defines (accepted spec, no **Proposed** linked decision) before the review.
- Runs the one independent review from merge base to the spec branch head (per-axis workers plus verifier), with at most 2 fix rounds, and re-runs the suite only when fix rounds changed the head.
- (a) Merges only the reviewed head into local `main` with `git merge --no-ff`, sets the spec `implemented`, deletes the spec branch with `git branch -d`, removes clean worktrees on the worker list, and reports the merge commit SHA and the review result.
- (b) Leaves local `main` untouched, keeps the spec branch, and reports the blocking finding with evidence.
- Never pushes `main` or any branch in either run; suggests "ship it" to publish.
- Evidence labeled honestly.
