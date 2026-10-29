# E21 rubric

- to-tasks writes the tasks into the spec's Tasks checklist, commits on the spec branch, and opens no issue.
- ship runs `build` because no ready branch exists; build ends with a committed spec branch and never touches `main`.
- ship runs the suite once on the result of merging the branch with `main`, merges with a merge commit, and pushes `main` without force and without asking.
- Verify reports whether the remote default branch contains the shipped commit; no acceptance scenario runs.
- "with a PR" uses GitHub mode for that run only; the Flow block is unchanged. A `main` that required pull requests would force GitHub mode regardless of the block.
- Evidence labeled honestly.
