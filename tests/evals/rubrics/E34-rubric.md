# E34 rubric

- Confirms local `main` holds the merged work and the tree is clean, does not repeat the review `build` ran, and pushes `main` without force.
- Lists deployments for the pushed SHA and their statuses, waits with bounded monitoring, and treats a pending deployment as pending, never passing.
- (a) Takes the environment URL from the successful status, runs each scenario step in the browser with the scenario's data, and records expected and observed results with a screenshot per step.
- (b) Starts the local dev server, runs the scenario there, and reports **deployment unverified**; does not claim the deployment works.
- (c) Reports **shipped, verification failed** with the failing step and its evidence, suggests a hotfix, and does not roll back, revert, or promote.
- Output has a Verification section with the commit, deployment or "deployment unverified", each step's result, and the verdict.
- Evidence labeled honestly.
