# E21 rubric

- `tasks` writes the tasks into the spec's Tasks checklist, commits on the spec branch, and opens no issue.
- ship runs `build` because no verified branch exists; build checks the spec branch once and never touches `main`.
- ship reruns the suite on the merge result only when `main` moved since build checked it, merges with a merge commit, and pushes `main` without force and without asking.
- Liveness reports whether the remote default branch contains the shipped commit; no acceptance scenario runs.
- "with a PR" uses GitHub mode for that run only; the Flow block is unchanged. A `main` that required pull requests would force GitHub mode regardless of the block.
- Evidence labeled honestly.
