# 0032 — Local build lands on main; ship publishes and verifies

Status: **Accepted** (2026-10-28). Amends [0028](0028-build-and-ship.md) (no deployment verification), [0029](0029-spec-issues.md) (local `build` runs the spec review), and [0030](0030-asked-delivery-and-local-mode.md) (local `ship` merges and pushes only on request). Spec: [020](../specs/020-ship-verifies.md).

## Context

Flow's last step checks CI and a code review, then stops. Decision 0028 retired the `Deploy:` target because environments are the pipeline's job, so no skill confirms that the shipped product works, and local mode never looks at a deployment. A real assessment already showed that green CI and passing contracts can coexist with a broken product. In local mode, users also expect "build it" to leave finished work on local `main` and "ship it" to publish it, while 0030 has `build` stop at a spec branch and `ship` merge and push only on request.

## Decision

1. **Local `build` lands on local `main`.** Tasks still integrate on a spec branch. After the last integration, a passing suite, the acceptance gate, and the one independent review, `build` merges the spec branch into local `main` with `--no-ff`. It never pushes.
2. **`ship` publishes and verifies.** Local mode: "ship it" is the push request; `ship` pushes `main` when a remote exists. Pull-request mode: merge as before. Then `ship` verifies the shipped commit.
3. **Verification reads GitHub, then runs the journey.** `ship` reads GitHub deployment statuses for the commit and runs the spec's acceptance scenario against the deployed URL in a real browser, and through the MCP tool when agent users are named. With no deployment after publishing, the scenario runs locally and the deployment is reported unverified; before a merge the preview run is skipped. On production only read-only and production-safe steps run, and the URL must be one the project recognizes. A failure after publishing is reported with evidence; nothing is rolled back unless asked.
4. **Specs name the scenario.** `to-spec` requires one representative acceptance scenario with realistic data.
5. **Discovery depth and delivery stay independent** and are asked as two labelled questions.

## Alternatives

- **Presets: Lite = local, Full = pull requests.** Rejected: light discovery with pull requests and deep discovery with local delivery are both common.
- **Keep the review and merge in local `ship`.** Rejected: users expect "build it" to finish the work locally and "ship it" to publish.
- **Bring back a `Deploy:` line with platform CLIs.** Rejected for the reason 0028 gives; GitHub deployment statuses are platform-neutral.
- **Verify only with the deployment status.** Rejected: a green deployment says nothing about whether the journey works.

## Consequences

- Local `main` only ever holds reviewed work, and local "build it" takes longer.
- Every accepted spec carries a runnable journey; `ship` and humans run the same one.
- Pipelines that do not report deployments to GitHub get local verification only, and the report says so.
- Pull-request mode spends extra time verifying the preview before merge.
