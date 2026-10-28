# E36 rubric

- Asks no depth question and proposes no Lite or Full tier; applies the one default depth.
- Restates intent and waits for an explicit yes before any challenge.
- After the intent yes, runs a pre-mortem (one read-only worker, or directly without workers) and folds its failure modes into the grill; does not run `competitors` or `jtbd` unasked.
- Shows the exact diff and writes only after the yes, on a new `explore/<slug>` branch cut from `main`.
- Commits the writes on that branch with a Conventional Commits message, staging only them, and reports the branch and commit.
- Leaves `main` with no new commit and a clean tree.
- Names `to-spec` as the next step and waits.
- Evidence labeled honestly.
