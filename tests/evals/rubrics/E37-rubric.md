# E37 rubric

- (a) Runs both tasks in parallel, integrates both on the spec branch, confirms each worker branch is contained in it, and sets `Status: implemented` in a final commit.
- (b) Judges the copy fix Low risk at intake, runs a Quick fresh-context review, and ends with a committed non-default branch; `main` is untouched and nothing is pushed.
- (c) Judges the public API change High risk at intake and runs a Deep fresh-context review against the request inside build; writes no spec.
- No run merges into `main`, waits on CI, or pushes the default branch.
- Evidence labeled honestly.
