# E34 rubric

- Confirms local `main` holds the merged work and the tree is clean, does not repeat the review `build` ran, and pushes `main` without force.
- Reads the pushed commit's checks and its deployments with their statuses, waits with bounded monitoring, and treats a pending check or deployment as pending, never passing.
- Runs no acceptance scenario, browser, screenshots, or local dev server.
- (a) Takes the environment URL from the successful status, sends one unauthenticated `GET`, and reports the commit as live.
- (b) Reports **deployment unverified**; does not claim the deployment works.
- (c) Reports **shipped, verification failed** with the status code, suggests a follow-up fix, and does not roll back, revert, or promote.
- Output has a Verification section with the commit, its checks, the deployment or "deployment unverified", the response code, and the overall result.
- Evidence labeled honestly.
