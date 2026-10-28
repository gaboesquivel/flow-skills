# 020: Local build lands, ship publishes and verifies

Status: draft (2026-10-28). Issue: [#104](https://github.com/gaboesquivel/flow-skills/issues/104). Decision: [0032](../decisions/0032-local-build-lands-ship-verifies.md) (Proposed). Builds on [spec 019](019-delivery-choice.md).

## Problem Statement

**Nothing checks that the shipped product works.** [Decision 0028](../decisions/0028-build-and-ship.md) retired the `Deploy:` target: environments are the pipeline's job, and skills only report the links a pull request shows. In pull-request mode `ship` merges once checks are green and the review passes. In local mode nothing looks at a deployment at all. Green CI, a passing build, and passing contract tests have already been mistaken for a working product in a real assessment. No skill runs the product's main journey on the running application.

**Specs do not name a journey to run.** `to-spec`'s Testing Decisions describe "what good tests mean here". They do not require a representative end-to-end scenario with realistic data, so there is nothing concrete for anyone to run after shipping.

**Local mode splits the work in the wrong place.** Today local `build` stops at a spec branch, and `ship` reviews it, merges it into local `main`, and pushes only when asked ([decision 0030](../decisions/0030-asked-delivery-and-local-mode.md)). Users expect "build it" to leave finished work on their local `main`, and "ship it" to publish it and confirm it works.

**Two settings read as one.** In a demo rehearsal, "Lite" was read as "local". Discovery depth (`Process:`) and delivery (`Delivery:`) are independent: Lite discovery with pull requests and Full discovery with local delivery are both valid. The setup questions do not say so.

## Solution

1. **Every spec names one acceptance scenario.** `to-spec` writes one representative end-to-end journey with realistic data in Testing Decisions: the steps a user takes on the real application, the observable result of each, and the same journey through the agent interface when the spec names agent users.
2. **Local `build` ends on local `main`.** Tasks still run in worktrees and integrate on the spec branch. When the last task integrates and the full local suite passes, `build` checks the gate (accepted spec, or a hotfix-sized change), runs the one independent review, and merges the spec branch into local `main` with `--no-ff`. It never pushes.
3. **`ship` publishes, then verifies.** In local mode, "ship it" is the request to push: `ship` pushes `main` when a remote exists. In pull-request mode it merges as today. Either way, it then verifies the shipped commit.
4. **Verify = deployment status + acceptance scenario.** `ship` reads the GitHub deployment statuses for the shipped commit, waits for them with bounded monitoring, and runs the spec's acceptance scenario against the deployed URL in a real browser, and through the MCP tool when the spec names agent users. It records what it observed, with screenshots. With no deployment, it runs the scenario on the local application and reports the deployment as unverified.
5. **Setup asks two independent questions.** `flow`, `start`, and `explore` present discovery depth and delivery as separate choices, one line each on what it controls.

## User Stories

1. As a developer in local mode, I say "build it" on an accepted spec and end with the work reviewed and merged on my local `main`, with nothing pushed.
2. As a developer in local mode, I say "ship it" and `main` is pushed, the deployment for that commit is found, and the spec's journey is run on it, with screenshots.
3. As a developer in local mode with no remote, I say "ship it" and the journey runs on my local app; the report says nothing was published.
4. As a developer in pull-request mode, I say "ship it" and the journey runs on the pull request's preview before merge, and on the production deployment after merge.
5. As a product owner, I read the spec and see exactly which journey proves it works, with the data it uses.
6. As a developer whose app has agent users, I see the journey also run through the MCP tool, not just a successful handshake.
7. As a developer, a deployment never appears or the journey fails: `ship` says so with evidence, reports the work as shipped but not verified, and does not roll back.
8. As a developer setting up Flow, I am asked discovery depth and delivery as two separate questions and can pick Lite with pull requests.
9. As a developer in local mode, a task fails or the review blocks: nothing reaches local `main`.

## Implementation Decisions

**`to-spec`** ([skill](../../skills/to-spec/SKILL.md)): Testing Decisions gains a required **acceptance scenario**: actor, starting state and realistic data, numbered steps with the observable result of each, and the agent-interface variant when agent users are named. A spec without one is not ready to accept; "accept the spec" names what is missing.

**`build`** ([skill](../../skills/build/SKILL.md)):
- Deliver › Local mode and Task set › Finish: after the last integration and a passing full suite, check the gate, run `review` as `ship` runs it today (per-axis workers plus verifier, fix rounds as Deliver defines), then `git merge --no-ff` the spec branch into local `main`, set the spec `implemented`, delete the spec branch, and remove remaining clean worktrees.
- The default-branch rule changes for local mode only: "build it" authorizes this one merge into local `main`, never a push. Pull-request mode is unchanged: `build` ends at a ready pull request.
- The gate is the one `ship` defines (accepted spec and linked decisions, or hotfix-sized with no spec); `build` links to it rather than restating it.

**`ship`** ([skill](../../skills/ship/SKILL.md)):
- Local mode: preflight confirms local `main` holds the merged work and the tree is clean (runs `build` first when it does not); pushes `main` when a remote exists; then Verify. The local review moves to `build`.
- Pull-request mode: unchanged through review and checks; before merge, Verify against the pull request's preview deployment when one exists (a failed scenario is a blocking finding with fix rounds); after merge, Verify the shipped commit.
- New **Verify** section, the one home of the rule: find deployments for the commit (`gh api repos/{owner}/{repo}/deployments?sha=<sha>`, then each deployment's statuses), wait with bounded monitoring, take the environment URL, run the acceptance scenario with the host's browser tool, run the agent variant through the product's MCP tool, and record each step's observed result with screenshots. Post it on the pull request (pull-request mode) or report it (local mode). No deployment: run on the local dev server and report "deployment unverified". After a merge or push, a failure reports **shipped, verification failed** with evidence and suggests a hotfix; never roll back unless asked.
- Output gains a **Verification** section.

**Setup wording**: [`flow`](../../skills/flow/SKILL.md) Ask, [`start`](../../skills/start/SKILL.md) inputs 5–6, and [`explore`](../../skills/explore/SKILL.md) Question round label the two questions **Discovery depth** and **Delivery**, each with one line on what it controls, and say they are independent. The Flow block lines and helper are unchanged.

**Context**: update `GLOSSARY.md` (Delivery mode, Local mode, Process depth; add Acceptance scenario and Verification), `README.md`, `docs/skills.md`, `PRODUCT.md` where it states the modes, the status lines of decisions 0028 and 0030, and the decision and spec indexes.

## Testing Decisions

**Acceptance scenario (this spec):** In a scratch clone of a small app with a remote and a preview-deploying pipeline (or the `/tmp/flow-demo` Signal project, which is the live run):
1. Write and accept a spec whose Testing Decisions name a three-step journey.
2. Say "build it" in local mode: the review runs, the spec branch merges into local `main`, nothing is pushed (`git status -sb` shows `main` ahead of `origin/main`).
3. Say "ship it": `main` is pushed, the deployment for that SHA is found, the journey runs in a browser, and the report lists each step's observed result with screenshots.
4. Repeat 3 with no remote: no push, the journey runs on the local dev server, the report says "deployment unverified".
5. Break one step of the journey and ship again: the report says "shipped, verification failed" with the failing step, and nothing is reverted.

- **Smoke contracts, safety rules only:** local `build` merges into `main` only after the gate and review; `build` never pushes the default branch; `ship` never rolls back unless asked.
- **Evals:** a task/rubric pair for `ship` Verify (deployment found, none found, scenario fails) and one for local `build` landing on `main` (passes; review blocks and `main` is untouched).
- `pnpm validate` and `pnpm test` pass; `pnpm test` stays under 8 seconds.

## Out of Scope

- Platform-specific deploy CLIs or a `Deploy:` line (0028 stands: read what GitHub reports).
- Rollback or production promotion.
- Coupling discovery depth and delivery into presets (considered and rejected; see 0032).
- New test frameworks; the scenario runs with the host's browser and MCP tools.

## Further Notes

Source: the Signal demo rehearsal on 2026-10-28, where the operator's expectation ("build merges to local, ship pushes and verifies deployment") differed from `main` at `b88a58c`, and the Astra review of the same date (P1: realistic scenario verification).

### Open assumptions

- Pull-request mode verifies twice: the preview before merge (as a gate) and production after merge (report only). If that is too slow, keep only the post-merge run.
- GitHub deployment statuses are the platform-neutral signal; pipelines that deploy without reporting to GitHub show as "deployment unverified".
- Moving the local review into `build` makes "build it" slower in local mode; that is the price of `main` only ever holding reviewed work.
- "Ship it" in local mode counts as the explicit push request decision 0030 requires.
