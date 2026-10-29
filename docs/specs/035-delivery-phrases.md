# 035: Delivery phrases are approvals

Status: implemented (2026-10-29). Decision: [0047](../decisions/0047-delivery-phrases-are-approvals.md) (Accepted).

## Problem Statement

A Flow user settles intent, scope, and acceptance while planning. Delivery should then run on one spoken phrase. Today it doesn't, for four reasons:

- **The phrases overlap.** `build` answers "build it", "implement this", and "make the change"; `ship` answers "ship it", "land it", and "drop the spec". Dictated speech can land on the wrong one.
- **Build hands back unfinished work.** It stops at an open pull request with no review, no CI result, and no sign the branch deployed, so "build it, then check the branch" has nothing to check yet. `ship` does all the verifying.
- **The rules contradict each other.** On a GitHub `origin` with `gh` unauthenticated, [build](../../skills/build/SKILL.md#delivery-mode) says stop, while [0044](../decisions/0044-fast-delivery.md) item 2 says fall back to local. Draft acceptance is stated in `to-spec`, `build`, `ship`, and the catalog. An `unresolved` acceptance verdict has no defined effect on landing.
- **The main metric isn't measured.** [PRODUCT.md](../../PRODUCT.md#success) makes idea → prod the main metric, but [`scripts/metrics.mjs`](../../scripts/metrics.mjs) says it "is not computed here".

## Assumption

Treating each delivery phrase as the approval, with build doing the verifying, cuts user turns per change to the phrase alone without raising the CI failure rate or post-merge fixes. A small batch of real changes measured end to end shows whether that holds.

## Solution

Three phrases, from lightest to heaviest. Each phrase is the approval: no confirmation after it. The safety rules stay: no force-push, no protection bypass, no self-approval, no weakened checks, no secrets in commits.

| Phrase | Does | Liveness |
| --- | --- | --- |
| "push it" / "deploy it" | Commit pending work and push the current or named branch. Git integration deploys on push. No pull request, review, or CI wait. | Pushed branch |
| "build it" | Ready branch: pull request (GitHub) or committed branch (local), review with fixes, checks green | Branch |
| "ship it" | Build if the branch isn't built, then merge to the default branch | Default branch |

**Liveness** is one light check: the remote holds the commit, and when the host reports deployments, the deployment for that commit is ready and one `GET` to its URL returns 2xx. No browser, no scenario, no long wait. It reports and never gates.

**Behavioral verification** stays in `review`: acceptance scenario verdicts, plus proportional UI checks. It runs in build, once per head. Ship reuses build's checks and verdicts on the same head and reruns them only when the head changed.

## Necessary fixes

1. **Narrow triggers.** One phrase for `build` ("build it"), one for `ship` ("ship it", plus "drop the spec" for abandoning), and "push it" / "deploy it" for `push`. Amend the phrase rule and the validator check to allow one variant.
2. **Build verifies.** After the pull request opens: the size guard picks the self-check (small) or the independent review (escalated, or asked), fix rounds (at most two), checks once on the final head (CI in GitHub mode, the suite on the branch in local mode), then branch liveness. Build still never merges.
3. **Ship lands.** It runs build when the branch isn't built or its head has moved, then merges and checks default-branch liveness. Nothing is checked twice on the same head.
4. **`push` skill.** Commits only this work and pushes the current or named branch, the default branch included when named. No pull request, review, or CI wait; then liveness. It never force-pushes. *Justification:* build and ship forbid pushing outside their own flow, so without a narrow home "push it to main" conflicts with them. The skill stays thin and links to the liveness home.
5. **Acceptance evidence.** `unmet` blocks landing. Build tries to resolve each `unresolved` step (run the test, read the preview). The ones it can't resolve are listed in the pull request body and in build's report. "Ship it" lands with them listed: the user has seen them, and the phrase approves them.
6. **One delivery-mode rule.** GitHub `origin` with `gh` unavailable or unauthenticated: stop and say how to authenticate; never fall back to local. One home: build's [Delivery mode](../../skills/build/SKILL.md#delivery-mode). 0047 amends 0044 item 2.
7. **One home for draft acceptance.** `to-spec`'s Status and acceptance section. Build, ship, and the catalog link to it and do not restate it.
8. **Proportional UI checks in `review`.** Only when the diff touches UI. For small changes, a static check: labels and roles, contrast tokens, focus and keyboard, layout at phone width, heading and visual hierarchy. For escalated or new screens, the same check on the preview at phone and desktop widths. Findings rank like other findings. This is behavioral verification, never liveness.
9. **Idea → prod is measured.** `scripts/metrics.mjs` joins host session logs (first prompt of the session that produced the branch) to merge time and deployment time. It reports idea → prod per change, the user turns between the phrase and done, and the link rate the kill criterion needs (≥ 80%). Unlinkable changes are counted, not dropped.
10. **Remove duplication and stale text.** Catalog rows in [docs/skills.md](../skills.md) for build, ship, review, and to-spec shrink to what each skill does plus a link. Size guard, delivery mode, liveness, and acceptance each keep one home. Remove "never waits on CI" and "checks run once, in `ship`". Update the [PRODUCT.md](../../PRODUCT.md#success) principle line (see Direction changes).

## Follow-up experiments

Not part of landing this spec; each runs after it ships.

- **Batch of real changes.** Ship 5–8 real changes across flow-skills and flow-next with the new phrases. Record idea → prod, user turns after the phrase, CI failure rate, and post-merge fixes with `pnpm metrics`, against the 031 baseline. Restore a gate if failures rise (0044's rule).
- **Mishearing aliases.** Add dictation variants (for example "chip it") only if the batch shows misfires.
- **Preview UI check by default.** Measure whether the preview check catches issues the static check misses before extending it to small changes.

## User Stories

1. As a developer, I say "build it" on a draft spec and get an accepted spec, a reviewed pull request with green checks, and a live preview, with no question asked.
2. As a developer, I say "ship it" on that branch and the agent merges without re-reviewing or rechecking the same head, then reports main is live.
3. As a developer, I say "push it to main" for a one-line fix and it is pushed and checked live, with no pull request.
4. As a developer on a GitHub repository with `gh` logged out, I am told to authenticate; nothing merges locally behind my back.
5. As a maintainer, I run `pnpm metrics` and see idea → prod per change and the share of changes linked to a starting prompt.

## Implementation Decisions

- **Homes.** Liveness: `ship` Verify, renamed Liveness; build and push link to it. Size guard and delivery mode: `build`. Acceptance: `to-spec`. UI checks: `review`. Phrase table: `flow-block.mjs` `PHRASES`, checked against descriptions.
- **Liveness contract.** Input: remote, ref, commit. Output: `live`, `pushed, no deployment reported`, `reachable, commit unconfirmed`, `not live`, or `unverified`. It reads host deployment status (GitHub deployments or commit statuses, Vercel's own reporting) and makes at most one `GET` per URL.
- **Metrics join.** The script reads Claude Code session logs locally, maps a session to a branch through the git commands it ran, and takes the first user prompt's timestamp. Other hosts count as unlinked until an adapter exists. Read-only; nothing ships to adopters.
- **Exposure:** skill text and a maintainer script. No deployed surface, no new writes. `push` writes only to branches the user names or is on.

## Testing Decisions

Tests check behavior and contracts, not wording: phrase table against descriptions (existing check, narrowed), the liveness result states from fixtures, and the metrics join on fixture session logs and git history (link rate, unlinked count). Prior art: `tests/` fixtures for `metrics.mjs` and the board.

**Acceptance scenario.** Actor: a maintainer on flow-next (GitHub origin, Vercel git integration, `gh` authenticated), with a draft spec for a small UI change (a button label and its mobile layout).

1. The maintainer says "build it". The spec becomes `accepted` in the first commit, with no question.
2. A pull request opens linking the spec. The self-check runs, including the static UI check (label, contrast, phone width). Findings get fixed.
3. CI is green on the final head. Build reports the preview `live` for that commit and lists any `unresolved` scenario steps in the pull request body.
4. The maintainer says "ship it". No second review or CI wait on the same head. The pull request merges, and the report says production is `live` for the merge commit.
5. `pnpm metrics --repo gaboesquivel/flow-next` lists the change with idea → prod and one user turn after "build it".
6. The maintainer logs out of `gh` and says "build it" on another change. Build stops with how to authenticate; no local merge happens.

## Direction changes

- [PRODUCT.md](../../PRODUCT.md#success) principle: "checks run once when shipping, and shipping then verifies only that the change is live" → checks run once, in build; build, ship, and push each check liveness lightly.
- [Spec 031](031-fast-delivery.md) Solution 2 ("`build` returns once the pull request is open"; `ship` owns the CI wait) → build owns the CI wait.

## Out of Scope

- Permission allowlists for Claude Code and Cursor: they belong to the flow-next and flow-mono templates.
- A browser acceptance run during liveness (still rejected, [0040](../decisions/0040-ship-verifies-liveness.md)).
- Production promotion or rollback.

## Further Notes

- The user-level install at `~/.claude/skills` predates the 0044 amendment and loaded instead of this repository's `skills/` while this spec was written (it still describes spec issues). `pnpm validate` already warns about shadowed copies; refresh with `npx skills update -g` after landing.
- Source: a second-opinion review of the phrase proposal, summarized in the fixes above.
