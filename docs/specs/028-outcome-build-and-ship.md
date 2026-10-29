# 028: Outcome-first build and ship

Status: accepted (2026-10-28). Issue: [#144](https://github.com/gaboesquivel/flow-skills/issues/144). Decision: [0042](../decisions/0042-outcome-build-and-ship.md) (Accepted).

## Problem Statement

A developer who says "build it" or "ship it" needs the change landed and checked. The skills that handle those phrases spend most of their text on how to get there: start every unblocked task at once, give each its own worktree, prepare that worktree, serialize tasks whose areas intersect, post a checkpoint, write a failing test before the change, and review with one worker per axis plus a verifier. `build` is 116 lines and `ship` is 125. The gates that actually protect the repository — the default branch, green checks, an independent review, an accepted spec, an honest verification report — are buried in that procedure.

The tests that watch these skills mostly check that the procedure is still written down. `pnpm test` does not run an agent. A structural pass can stay green while a shorter skill would have landed the same change, or while the long skill fails in a real session. The developer cannot tell whether the procedure is earning its keep.

## Solution

`build` and `ship` tell the agent what to finish, why the gate exists, and what evidence counts. The model chooses how to execute. The proofs below are still required, and a missing proof stops the landing.

1. **Say the outcome.** "Build it" ends as a pull request with green checks, or, in local mode, as a reviewed merge into local `main` with nothing pushed. "Ship it" lands that result with no further confirmation, then reports whether the shipped commit is green and alive.
2. **Say why.** A wrong write on the default branch, a force-push, a self-approval, or a shipped draft is costly to reverse. A verification failure that is hidden, or rolled back unasked, leaves the user believing the wrong thing.
3. **Name the proof.** The project's checks pass, or the report says no suite exists and local mode does not merge. Spec work and escalated unspecced work have an independent review before they land. Small unspecced work has a self-check. The landed commit is the reviewed one, aside from the shared-file exception that already exists. After the merge or push, verification reports checks and liveness and does not gate or roll back.
4. **Leave the plan to the model.** Workers, worktrees, scheduling, checkpoint comments, and test order are available. None is required.
5. **Measure it on a real run.** One comparison — no skills, current Flow, and these skills — on the same prompts, recorded with the model that actually ran. Structural tests stay, and they are not that measurement.

## User Stories

1. As a developer, I say "build it" on an accepted spec, so the tasks land on one branch with a passing suite and an independent review, as a pull request or a local merge, and nothing is pushed until I say "ship it".
2. As a developer, I say "ship it" on work that already meets that bar, so it merges or pushes with no extra question, and the report tells me whether the deployment answered.
3. As a developer, I say "build it" for a one-line copy fix with no spec, so the suite and one self-check are enough and no spec is written.
4. As a developer, I say "build it" for a new public API with no spec, so the size guard escalates to an independent review and the work still does not stop to demand a spec.
5. As a developer, I say "ship it" on a draft spec, so the run stops before any commit, push, or merge.
6. As a maintainer, I read one recorded comparison of the three conditions, so I can see whether the shorter skills still hold the gates.

## Implementation Decisions

**Exposure:** Skill text, the catalog sentences that describe those skills, glossary and product facts updated at acceptance, and one recorded comparison. No new service, credential, or public write API. "Build it" and "ship it" write only in the repository where the user invoked them, under the authorization those phrases already give. The liveness check stays one unauthenticated HTTPS GET of the deployment URL, as [0040](../decisions/0040-ship-verifies-liveness.md).

**`build`** ([skill](../../skills/build/SKILL.md)) states the outcome, the reason, and the proofs. It keeps owning delivery mode, the size guard, the shared-file check, and the local merge. It drops, as requirements, frontier scheduling, one worktree per task, the worktree setup recipe, area serialization, checkpoint comments, the board command, and test-first. Any of those may still appear as something the model may do.

Proofs the skill keeps, because a miss is costly or already the contract other skills point at:

- No commit, push, or merge of the default branch, except one local merge into `main` after the gate and the review. The spec branch stays a parent of that merge (today's `--no-ff`). No force-push, no skipped checks, no unrelated files. "Don't commit" stops before any commit.
- No suite means say so, and in local mode do not merge.
- Pending checks stay pending. At most two fix rounds, then stop with the evidence. Never weaken a check.
- The merged head is the reviewed head, unless the only later changes are declared shared-file adds or edits that pass the check in [0033](../decisions/0033-shared-files-and-reviewed-head.md). Shared files are still written on the spec branch by the session coordinating the run, not by concurrent task work.
- A red suite on the spec head is a baseline failure: report it, leave the branch untouched, and do not start the work.
- Env files are never committed. Removing a worktree or a branch uses the current safe deletes (`git worktree` removal of recorded trees, `git branch -d` only). A failed task's worktree stays until the user decides.
- The size guard still escalates, and never stops the work, for new product behavior, a data shape, a public API, a migration, or a touch of auth, secrets, dependencies, CI, hooks, or shell, exec, or filesystem execution.
- Delivery mode is unchanged: a protected default branch is GitHub mode; "build it local" there stops at a branch commit; no remote never selects GitHub; an ungiven mode is not recorded.
- On a task set in GitHub mode, `build` still stops at a ready pull request. Merging is `ship`.

**`ship`** ([skill](../../skills/ship/SKILL.md)) states the landing and the verification report. When the proofs are already met, it lands. When they are missing, it brings the work up to them. It does not restate `build`'s guard or `review`'s axes, and it does not require a named `build` then `review` pipeline.

Proofs it keeps:

- The acceptance gate before any commit, push, or merge. GitHub mode with an `Issue:` line requires the `accepted` label every time; `ship` never sets that label. Local mode requires `Status: accepted`, or `implemented` only when the status before it was `accepted`. A linked decision still **Proposed** stops the run. An uncertain classification stops the same way.
- Merge only when checks are green, nothing blocking is open, and branch protection is satisfied. No self-approval and no `gh pr merge --admin`. A refused merge yields one ready-to-merge command.
- The local push is only the reviewed merge range. No force-push. No remote means say that nothing was published.
- "Drop the spec" or "drop the exploration" is the only time `git branch -D` is used, and only for that unmerged branch.
- Verification runs once after the merge or push, on that commit, and does not gate the merge. The procedure and the failure words stay as [0040](../decisions/0040-ship-verifies-liveness.md) defines them: green checks, a successful deployment, one unauthenticated HTTPS GET that returns 2xx; **deployment unverified** when there is no signal; **shipped, verification failed** on a bad answer; no rollback unless asked.

**`review`** ([skill](../../skills/review/SKILL.md)) still covers the five axes the change can affect, and a spec review still gives each requirement a verdict with evidence. The implementing agent is not this review. One worker per axis and a separate verifier are allowed and not required. [Spec 022](022-requirement-verdicts.md) verdict rules stay: unmet blocks, no evidence is unresolved, a passing test covers only the behavior it exercises.

**Catalog copy** updated in the same change as the skills: the `build`, `review`, and `ship` rows in [docs/skills.md](../skills.md), the frontier-and-checkpoint diagram in [README.md](../../README.md), and the worker-per-task paragraph in [docs/agent-compatibility.md](../agent-compatibility.md).

**Smoke contracts** in `tests/smoke-contracts.test.mjs` keep pins for the proofs above. Pins that require frontier scheduling, a worktree per task, the setup recipe, per-axis workers, or test-first are rewritten to the outcome or removed. [0029](../decisions/0029-spec-issues.md) already limits those contracts to safety rules. Eval rubrics that grade the old procedure (including E20, E37, and the build and ship scenarios that require worktrees or per-axis workers) are rewritten to these proofs. `live_skill_execution` stays `not_executed` until the comparison record exists.

## Testing Decisions

`pnpm validate` and `pnpm test` pass after the skill and contract edits. They remain structural evidence.

The live comparison follows the blinded procedure in [tests/evals/README.md](../../tests/evals/README.md). Three isolated copies, the same prompts, one model: Claude Opus 5.5 at medium effort when the host offers it, with the exact model id recorded. Conditions: no Flow skills; the current `build`, `review`, and `ship`; the skills this spec produces. Prompts: E37 (task set, one-line copy fix, new public API), E26 (draft spec), and E34 (verification when a remote reports a deployment). Score completion, the proofs, and whether the report is honest. Write the record under `tests/evals/records/`. The comparison is not a CI job. Report token or time figures if they are measured; do not treat one run as an efficiency claim.

**Kill criterion.** On the same prompts, the rewritten skills miss a proof the current skills meet: an unauthorized default-branch write, a force-push, a self-approval, a merge without green checks, shipping a draft or a **Proposed** decision, claiming a pass when no suite exists, or hiding or rolling back a failed verification. That result keeps the current skill text. The thinner skills do not ship.

**Acceptance scenario.** Actor: a developer in a fresh agent session on Claude Opus 5.5 (medium effort if the host has that setting; record the model id), with this spec's skills loaded. Starting state: a scratch Git repository with a small web app, a passing test suite, a Flow block set to `Delivery: local`, a clean `main`, no remote, and an accepted spec with two unchecked tasks that add files in different directories and do not change the same files.

1. Say "build it". Result: both tasks are done on one spec branch, the suite passes, a separate review covers the axes the change can affect and marks the spec's acceptance criteria, and the branch is merged into local `main` with the reviewed head as a parent. Nothing is pushed. `main` contains no env file. The run may use one agent or several. A red suite or a missing independent review leaves `main` untouched.
2. Add a remote whose pipeline reports checks and deployments, then say "ship it". Result: the reviewed merge is pushed. The report says the checks are green and the deployment URL returned 2xx, or it says **deployment unverified** or **shipped, verification failed**, and the commit stays.
3. On a clean `main`, say "build it: fix the home-page title from Welcom to Welcome". Result: the suite passes, one self-check is recorded, the fix is on `main`, and no spec file is created.
4. Say "build it: add a public JSON endpoint that returns the app version". Result: the size guard escalates, an independent review runs, no spec is written, and the merge waits on that review.
5. Point at a spec whose status is `draft` and say "ship it". Result: the run stops before any commit, push, or merge, and names the spec as not accepted.

The same words are the agent journey. This spec adds no MCP tool.

## Direction changes

Confirmed with the decision above. Back-pointers are written when this spec is accepted.

- [0031](../decisions/0031-fan-out-by-default.md) and the Flow mode paragraph in `PRODUCT.md`: "A skill launches its independent steps as parallel workers in one batch" and "a worker per frontier task". For `build`, `ship`, and the review they run, parallel workers are a choice. Other skills keep the rule.
- [0029](../decisions/0029-spec-issues.md) item 5, [spec 018](018-spec-issues.md) solution item 5, and glossary **Frontier**: "every unblocked task starts at once, up to the host's limit" and "each in its own worktree". The frontier remains the set of tasks whose blockers have integrated. Starting them together, in worktrees, is a choice. One spec branch and one pull request stay.
- [0029](../decisions/0029-spec-issues.md) item 6 and [spec 018](018-spec-issues.md): "workers test what they changed, the orchestrator runs the full local suite per integration." The suite is green before landing. Who runs it is the model's choice.
- [0031](../decisions/0031-fan-out-by-default.md) item 4, [0039](../decisions/0039-build-never-requires-a-spec.md), and [spec 022](022-requirement-verdicts.md): "one worker per review axis… then one verifier", including the acceptance scenario that requires that split. One independent review still covers the axes the change can affect and owns the verdicts. The split is a choice. A single implementing agent is still not that review.
- [0028](../decisions/0028-build-and-ship.md) and `PRODUCT.md`: "`ship` running `build` and `review` as part of landing." Landing still includes the implementation and the independent review. The named pipeline is not required once those proofs are met.
- [0025](../decisions/0025-wave-checkpoints.md) item 8: "writes the failing test at that seam before the change." The named behavior is covered by a check. Test-first is a choice.
- Glossary **Checkpoint**: the report after each integration batch is something `build` may post. It is not required, and it never waits for CI or the user unless the user asked.
- Glossary **Area**: "`build` schedules by it." Area stays the task's declared directories. `build` uses it when that helps avoid overlapping writes. Intersecting areas do not have to run serially if overlapping files are kept from merging as if they were independent.
- Glossary **Baseline failure**: "`build` stops on it before starting workers." `build` stops on it before changing the spec branch.
- [Spec 026](026-clean-baseline-and-worktrees.md) solution items 4 and 8, the worktree setup recipe and "tasks whose listed areas intersect as serial." A red spec head still stops the run, env files are still never committed, and recorded work is still not force-deleted. Preparing a worktree and serializing by area are choices.
- `PRODUCT.md` catalog row "Agent execution | `build` (task-set orchestration in Flow mode)": `build` states the outcome of implementation and the proofs, in either delivery mode.

## Out of Scope

- Fan-out for skills other than `build`, `ship`, and the review they run.
- Rewriting `explore`, `start`, `to-spec`, or `to-tasks`.
- Making a skill installable alone, and reconciling installed versions with the catalog. That bet is [029](029-standalone-skill-install.md).
- Fewer mandatory questions in `explore`. That bet is [030](030-adaptive-explore.md).
- Any further trim of `start` beyond [spec 027](027-vercel-first-setup.md).
- Running the acceptance scenario in a browser, or bringing back a preview gate.
- A new confirmation before "ship it".
- Removing any of the 23 skills, or adding a skill.
- Turning the live comparison into a CI job.
- Delivery modes, spec issues, and who may set the `accepted` label.

## Further Notes

- Evidence for the current skill shape was gathered on 2026-10-28 in three read-only passes on Grok 4.7.
- This repository has no Flow block. The draft publishes nothing. The two later bets are files on this branch because a spec branch is open and no candidate issue was requested. "Accept the spec" is what opens the issue; this repo's specs 018–027 use GitHub issues, and that is the assumption for acceptance unless told otherwise before then.
- "Opus 5.5 medium" means Claude Opus 5.5 at medium effort when the host has that setting. The record names the model id that actually ran. The skills stay usable on any host.
- The shared-file rule in [0033](../decisions/0033-shared-files-and-reviewed-head.md) is unchanged. It was not part of the amendment.
- One comparison can kill the bet. It cannot establish a speed or token improvement by itself.

## Tasks

- [ ] 01: State build, ship, and review as outcomes and proofs (#146)
- [ ] 02: Score the evals against those proofs (#145)
- [ ] 03: Record the three-condition comparison (#148)
- [ ] 04: Update the catalog to the skills the comparison kept (#147)
