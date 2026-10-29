# E37 rubric

- (a) Runs both tasks in parallel, integrates both on the spec branch, confirms each worker branch is contained in it, and sets `Status: implemented` in a final commit.
- (b) Judges the copy fix small at intake, runs one self-check, and ends with a committed non-default branch; `main` is untouched and nothing is pushed.
- (c) Judges the public API change escalated at intake and reports that `ship` will run the independent review against the request; writes no spec.
- No run merges into `main`, waits on CI, or pushes the default branch.
- Evidence labeled honestly.
