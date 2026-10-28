# 025: Build without a spec

Status: draft (2026-10-28). Decisions: [0039](../decisions/0039-build-never-requires-a-spec.md) (Proposed). Amends [decision 0034](../decisions/0034-no-ceremony-without-a-spec.md) and [decision 0022](../decisions/0022-start-runs-explore.md).

## Problem Statement

Users want to talk to their agent and land changes with little friction, in either delivery mode, and reach for a spec only when the work is a bet worth tracking. Today that works only for small fixes:

- **The size guard forces a spec.** [`build`](../../skills/build/SKILL.md#unspecced-work) stops any unspecced change that adds product behavior, changes a data shape or public API, needs a migration, or touches a risky area, and suggests `to-spec`. `ship` stops on the same guard. Most features trip it.
- **"Explore this", then "build it", always ends in a spec.** `explore` confirms a brief on an `explore/<slug>` branch, and the next "build it" hits the guard. The user wanted a commit or a pull request.
- **`explore` writes spec 001 unasked** for a new product, with its tasks and later bets as candidate stubs.
- **A protected default branch leaves no local option.** It forces GitHub mode, so "build it local" cannot produce a plain commit without a pull request.
- **The trigger phrases are a trap.** "Build it", "implement this", and "make the change" reach `build`, so the human docs currently advise avoiding them to stay out of Flow's ceremony.

## Solution

Delivery mode decides how work lands; the user decides whether there is a spec.

1. **Escalate, never stop.** Unspecced work that trips the size guard gets the one independent review against the request, then lands as the mode does. Small unspecced work keeps the suite and one self-check. `build` may suggest "spec it" in one line.
2. **Build from the brief.** After `explore`, "build it" uses the confirmed brief as the request and renames `explore/<slug>` to the work branch. No spec, no tasks.
3. **Specs on request only.** `explore` on a new product ends with the brief and names "spec it". No skill writes a spec, candidate, or tasks unasked.
4. **Local commit in a protected repository.** When the default branch requires pull requests, "build it local" commits on a branch and stops. "Ship it" later opens and lands the pull request.
5. **Human docs say so.** README, `docs/skills.md`, `GLOSSARY.md`, and `PRODUCT.md` explain that Flow is Git-based, how local and GitHub delivery differ, and how to work without a spec in both.

## User Stories

1. As a developer in local mode, I want "build it" on a feature with no spec to end in a reviewed merge into local `main`, so that I land work without writing a spec.
2. As a developer in GitHub mode, I want the same request to end in one ready pull request, so that my team reviews it as usual.
3. As a developer who just explored an idea, I want "build it" to build the brief, so that exploring does not commit me to a spec.
4. As a developer whose change touches authentication or dependencies, I want an independent review before it lands, so that risk still gets scrutiny without a spec.
5. As a developer on a protected repository, I want "build it local" to leave a commit on a branch, so that I can work offline and open the pull request later.
6. As a developer starting a new product, I want `explore` to stop at the brief, so that I choose when the first spec is written.
7. As a developer who does want a spec, I want "spec it" to work exactly as today, so that tracked bets keep their gate.

## Implementation Decisions

- **Size guard (`build` › Unspecced work).** Keep the one home and its category list, and check it at intake and again before landing. Change the outcome: tripped or uncertain means the one independent review from merge base to head, run as `ship`'s Review runs it but against the request (and brief, when there is one) instead of spec requirements, so it gives no requirement verdicts. Not tripped means the self-check. Neither stops the work. Local mode: `build` runs the review before its merge, with `Reviewed: <sha>` and no `Spec:` trailer. GitHub mode: `build` opens the ready pull request; `ship` runs the review on it, as for spec work.
- **`ship`.** Unspecced work no longer stops on the guard. It runs the review when `build`'s guard result says escalated and none was posted on the reviewed head; otherwise the self-checked head stands in, as today. The report names which path ran.
- **`review`.** The Spec bullet's "Unspecced work gets no independent review" becomes: small unspecced work gets the self-check; escalated unspecced work gets the one independent review without requirement verdicts.
- **Brief as request.** When the current branch is `explore/<slug>` with a confirmed brief and no spec, `build` treats the brief as the request and renames the branch to `feat/<slug>` (`git branch -m`) before its first commit. Spec work keeps `to-spec`'s rename.
- **`explore` new product.** Replace "New product specs" with: end at the confirmed brief and name "spec it" (spec 001 testing the riskiest assumption, later bets as candidates) as the next step; write them only on the user's yes. `start`'s hand-off to `explore` is unchanged.
- **Delivery mode (`build`).** Keep "requires pull requests always uses GitHub mode" for landing. Add: a per-run local request on such a repository commits on a branch, runs the suite and the self-check or review, and stops with no merge, push, or pull request; report the branch. "Ship it" on that branch delivers it in GitHub mode.
- **Smoke contracts.** Replace `'A change that is not small stops the work and suggests \`to-spec\`'` (build) and ship's `size guard … applies; when it trips, stop and suggest \`to-spec\`` with phrases for escalation (`never stops the work`, `gets the one independent review`). Keep the category list, `at intake, before implementing, and again before landing`, and the uncertain-size rule. Add a phrase for the protected-repository local stop.
- **Docs.** `GLOSSARY.md` Unspecced work; `docs/skills.md` rows for `build`, `ship`, `explore`; README "Work without a spec" (drop the advice to avoid "build it"); `PRODUCT.md` if its catalog text mentions the stop; decisions index row for 0039 and the amended-by notes on 0034 and 0022 at acceptance.
- **Touched files.** `skills/build/SKILL.md`, `skills/ship/SKILL.md`, `skills/review/SKILL.md`, `skills/explore/SKILL.md`, `tests/smoke-contracts.test.mjs`, the docs above.

**Exposure:** skill text running in the user's local agent host; nothing is deployed and there is no authentication surface. Writes are Git commits on work branches and the existing local-mode merge into local `main`; nothing is pushed except by "ship it", as today.

## Testing Decisions

`pnpm validate` and `pnpm test` cover links, numbering, and the wording contracts. Behavior is checked by the acceptance scenario on scratch repositories; there is no runtime code to unit-test.

**Acceptance scenario.** Actor: a developer in a fresh agent session. Starting state: a scratch Git repository with a small app, a passing test suite, a Flow block with `Delivery: local`, and no specs.

1. Say "build it: add a dark-mode toggle to the settings page." Result: no spec or task is written; the size guard reports product behavior and escalates; the independent review runs; the work merges into local `main` with `Reviewed: <sha>` and no `Spec:` trailer. Writes to the scratch repository only (not production-safe).
2. Say "build it: fix the typo in the footer." Result: self-check only, merged into local `main`. Writes to the scratch repository only.
3. Say "explore this: export settings as JSON", confirm the brief, then "build it". Result: no spec; the branch is renamed from `explore/<slug>` to `feat/<slug>`; the brief and code merge together. Writes to the scratch repository only.
4. In a scratch GitHub repository with `Delivery: github` and a protected `main`, say "build it local: add a footer link". Result: a commit on a branch, no push, no pull request; the report names the branch. Then "ship it". Result: one pull request opened, reviewed, and merged. Writes to the scratch GitHub repository only.
5. In an empty scratch repository, say "explore this: a habit tracker" and confirm the brief. Result: `PRODUCT.md` holds the brief; no spec or candidate file exists; the report names "spec it". Writes to the scratch repository only.

No agent interface beyond the skills themselves.

## Out of Scope

- Changing the spec path: "spec it", acceptance, tasks, and the spec gate are unchanged.
- Changing `explore`'s depth or questions for features and fixes.
- Unprotected GitHub-mode repositories with "build it local": the existing per-run override (merge into local `main`) stays.

## Further Notes

Assumptions to confirm before acceptance:

- Escalated unspecced work in GitHub mode is reviewed by `ship`, not `build`, matching spec work. The alternative is `build` posting the review on the pull request before it is marked ready.
- The work branch for brief-driven builds is `feat/<slug>`; a fix-classified brief would use `fix/<slug>`.
- Decision 0038 (spec 024, unmerged) is Proposed on another branch, which is why this record is 0039.
