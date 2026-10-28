# 019: Asked delivery, local mode, parallel skills, lighter tests

Status: accepted (2026-10-28). Issue: [#89](https://github.com/gaboesquivel/flow-skills/issues/89). Decisions: [0030](../decisions/0030-asked-delivery-and-local-mode.md) (Accepted), [0031](../decisions/0031-fan-out-by-default.md) (Accepted). Builds on [spec 018](018-spec-issues.md).

## Problem Statement

**Nobody asks how work lands.** Process depth is asked only by `start` and by "set up Flow here". The delivery mode is never asked: `flow` leaves `Delivery:` unset ([flow](../../skills/flow/SKILL.md#flow-block)), and `build` infers it at build time, defaulting to pull-request mode when it cannot see branch protection ([build](../../skills/build/SKILL.md#delivery-mode)). A user who says "I want feature X" in a project with no Flow block is asked neither question, and `to-spec` may open a public issue before any mode was chosen.

**Local mode needs a remote.** Local `ship` fast-forwards `main` from the remote, merges the spec branch with `--no-ff`, and pushes `main` ([ship](../../skills/ship/SKILL.md#merge)). A fresh `start` project has no remote, so `build` picks pull-request mode and then stops at the push.

**Task worktrees are never cleaned up.** `build` runs each task in its own worktree but never says who removes it, and `ship` deletes only the spec branch. Six stale worktrees and seven task branches remained in this repository after recent runs.

**Most skills run in sequence when they could fan out.** `write-agents` and `review` use workers "only when independent tasks justify" them. `ship` reviews with "a separate worker", one, not one per axis. `explore` reads everything "before asking anything". `council`, `grill`, `competitors`, `to-spec`, `debug`, and `retro` never say which steps can run at once. `build` must keep tasks that touch the same files apart, but tasks carry no data to judge overlap.

**The catalog drifted from its own authoring bar.** A `write-agents` audit on 2026-10-28 (rechecked at `29243cb`) found rules with two homes, stale references, missing fallbacks, and prose that a check could enforce. See Further Notes.

**Tests still add friction.** `build` runs the full local suite after every single task integration. New rules tend to arrive as smoke contracts that pin wording, so editing a skill means editing a test. Adapter descriptions drift because nothing checks them.

## Solution

1. **Ask both questions together, once.** Wherever Flow first needs them, ask the missing ones in one round: **Lite or Full**, and **pull requests or local**, each with a suggested answer. Record them on the Flow block.
2. **Local mode stays branch-based and becomes truly local.** It keeps the spec branch, task worktrees, and one `--no-ff` merge into local `main`. It needs no remote and pushes only on request.
3. **Worktrees are removed as tasks integrate,** and `ship` confirms none remain.
4. **Fan out by default.** Every skill names its independent steps and runs them as parallel workers. Only real data dependencies, questions to the user, and shared-file writes stay sequential. Without workers, the same steps run in order.
5. **Close the audit findings** that are still open.
6. **Test at the right level.** Run the full suite once per integration batch. Move enforceable rules into `validate`. Keep smoke contracts for safety rules only.

## User Stories

1. As a developer in a project with no Flow block, I say "I want feature X" and am asked once: Lite or Full, pull requests or local. I am offered to record the answers.
2. As a developer running `start` without a GitHub repository, I am offered local mode by default, and the confirmation shows it.
3. As a developer in local mode with no remote, "ship it" merges the spec branch into `main` and stops there, with nothing pushed. "Ship it and push" also pushes.
4. As a developer whose default branch requires pull requests, I am not asked; pull-request mode is reported.
5. As a developer after "ship it", no task worktree or branch for the spec remains, except for failed tasks, which are reported with their paths.
6. As a developer saying "explore this", my first question arrives at once while background workers read the repository, decisions, and prior art. After I confirm intent at Full depth, `jtbd`, `competitors`, and the pre-mortem run in parallel.
7. As a developer saying "ship it", the five review axes run as parallel workers alongside the CI wait, and one verifier merges their findings before the gate.
8. As a developer saying "build it", tasks whose areas do not overlap all start at once, and tasks with overlapping areas run one after another.
9. As a developer on a host without workers, every skill runs the same steps in order and says so.
10. As a contributor editing a skill's wording, `pnpm test` still passes unless a safety rule or a checked property broke.
11. As a contributor whose adapter description drifts from its skill, `pnpm validate` fails and names the field.

## Implementation Decisions

### Asking (decision 0030)

- **One rule, one home.** `build`'s Delivery mode section keeps the rule; `flow` owns the block and the depth definition. Other skills point there.
- **The question round** asks only what is missing (`unset` or no block), both in one round.
  - Delivery: when the default branch requires pull requests, state pull-request mode without asking. Otherwise suggest pull requests when a GitHub remote exists and local when there is none.
  - Depth: suggest Lite unless the request points to Full.
- **Where it is asked.**
  - `flow` "set up Flow here": replace "leave `Delivery:` unset" with the question round.
  - `start`: delivery becomes an input beside depth. It defaults to local when no GitHub repository is created and appears in the confirmation and the block.
  - `explore`, Propose a depth: when a line is unset or there is no block, run the round and offer to record the answers with `flow`.
  - `to-spec`, `to-tasks`, `build`, `ship`: when the mode is still unset, ask before the first step that depends on it (opening an issue, publishing tasks, pushing, merging). A request that names a mode ("build it local") answers it.
- **Inference only suggests.** `build` no longer records an inferred mode on its own, and never picks pull-request mode with no remote. A one-run override still changes only that run.
- **Recording** uses `flow/lib/flow-block.mjs`, which already accepts both values. Without a block, the answers hold for the run.

### Local mode (decision 0030)

- **Unchanged:** the spec branch, task worktrees cut from it, tasks as the spec's checklist, and a `--no-ff` merge by `ship` only.
- **Remote optional.** `ship` fast-forwards from a remote only when one is configured, and pushes the default branch only when the request asks. The spec branch is not pushed unless asked.
- **Checkout.** `ship` switches the primary checkout to the default branch before merging when it is clean; a dirty checkout stops with a report. The orchestrator may run in a spec-branch worktree so the primary checkout stays on the default branch.
- **Check suite.** The full local check suite is the project's documented check commands: the instruction file's command table, else package scripts for test, lint, typecheck, and build. Report the exact commands run. With none found, `build` reports it and `ship` stops.
- **Reviewed SHA.** The local review covers merge base to spec-branch head. Record that SHA, and merge only while the head still equals it.

### Worktrees

- The orchestrator records each worker's worktree path and branch, whatever name the host chose.
- **After integrating** a task, remove its worktree, then delete its branch, since a checked-out branch cannot be deleted. A failed or blocked task keeps its worktree, and the checkpoint lists the path.
- **Ship** runs `git worktree prune` after the merge, removes any remaining worktree for the spec whose branch has merged, and reports worktrees removed. Dropping a spec removes its task worktrees and branches too.

### Pull-request fixes

- In `build`'s Integrate step, the draft pull request sentence starts with "In pull-request mode".
- The draft lists sub-issues as `Refs #N`. Each integration switches that task's line to `Closes #N`, and the spec issue becomes `Closes` once every task has integrated, matching `ship`'s Merge rule.

### Fan-out by default (decision 0031)

**Shared rule.** It has one home, in `write-agents` Workers, and skills link to it instead of restating it:

- Launch independent steps as parallel workers in one batch, up to the host's limit.
- Keep a step sequential only when it needs another step's output, asks the user, or writes a shared file.
- Workers are read-only or write files no other worker touches, and each has one bounded goal.
- The main thread verifies and synthesizes the results.
- Without workers, run the steps in order and say so, and never claim independence that did not happen.

`review`'s copy of the rule becomes a link.

| Skill | Parallel groups (sequential only where noted) |
| --- | --- |
| `explore` | On arrival, background readers for repository and root context, glossary and decision conflicts, prior art, and `start`'s bootstrap status, while the main thread asks the first question. Replace "before asking anything" in the Explore section. After the intent yes at Full depth, `jtbd`, `competitors`, and the pre-mortem run in parallel; then `grill` in the main thread while a worker drafts approaches and the research file. |
| `review` | Scope and intent first. Then one worker per axis the change can affect (correctness, readability, architecture, security, performance), then one verifier that dedupes and ranks. |
| `ship` | Preflight reads in parallel. The per-axis review runs alongside the CI wait on the same head. Fixes to non-overlapping files go to parallel workers. Spec gate, `build`, Prepare, and Merge stay in order. |
| `build` | Schedule by `Area:` (below). Each worker records its own board state, since `board.mjs` already locks writes. |
| `to-tasks` | One read-only explorer per area. Add a blocking edge only for a real data or file dependency, and prefer a wide frontier. Each task gains a coarse `Area:` line (package or directory, never a file path); `build` serializes tasks whose areas intersect. Open independent sub-issues in parallel, then link blockers. |
| `to-spec` | Evidence workers for existing specs and decisions, code seams and tests, and glossary, in parallel. One writer for the spec; decision records in parallel, one file each. |
| `council` | One shared evidence packet, then every reviewer in one batch, and in deep mode every rebuttal in parallel. Merge the two worker passages into Independence. |
| `grill` | One evidence worker per risky claim, plus a pre-mortem worker, after the uncertainty map. |
| `competitors` | One worker per alternative class or named competitor. |
| `debug` | After the reproduction, about three hypothesis workers in parallel, in worktrees when their checks change files. Fixes stay one cause at a time. |
| `retro` | Evidence workers for transcript, Git and CI history, instruction-file size, and navigation friction. |
| `flow` | Read the root documents in parallel, with one writer per root file. |
| `start` | Inside the bootstrap, concurrent processes rather than workers, because everything shares one tree: install alongside rename and baseline docs; then qa, eval, identity scan, and build; then the dev server; then the HTTP smoke checks. |

`interview`, `jtbd`, `handoff`, `tldr`, `board`, and `write-humans` stay single-pass; delegating them costs more than it saves.

### Authoring fixes

These are the open findings from the audit:

- **`to-spec`:** decision records are named `NNNN-short-name.md`.
- **`domain-modeling`:**
  - Its decision test links to `to-spec`'s rule.
  - Add a Completion section.
- **`council`:**
  - Drop "during `/flow`".
  - Record decisions as **Proposed** through `to-spec`'s test.
  - Turn the slash-only invocation into phrases.
- **Fix rounds:** one home, `build` Deliver; `ship` links to it.
- **`review`:**
  - Drop the "`flow start` is not an initializer" aside.
  - Align `docs/pr-review-contract.md` with the five axes, or point it at `review`.
- **`write-agents`:**
  - `SKILL-MECHANICS.md` accepts a confirm-before-write gate (decision 0022) as an alternative to explicit invocation.
  - Its body states its leading phrase.
- **Decision 0020:** status line names `build` as the delivery-mode owner.
- **`explore`:** the autonomous-mode pointer becomes self-contained.
- **`competitors` and `jtbd`:**
  - Say they run standalone or inside `explore`.
  - `competitors` owns the research-saving rule and a no-web fallback.
- **Completion and failure lines:** `handoff` (absolute path, inline fallback), `debug` (report as unreproduced with evidence), `retro` (no transcript available), `to-tasks` (partial issue publishing: report what was created and never re-create).
- **`start` and `flow`:**
  - Point at `lib/` constants instead of copying them.
  - `flow` makes the helper its main path, with prose as the fallback.
  - `start` names `flow-block.mjs` for the block.
- **Adapters:** the `ship`, `review`, `retro`, `write-agents`, and `prototype` short descriptions match their skills.

### Less testing friction

- **Integration batches.** `build` runs the full local suite once per integration batch, not after every single task. A failure is bisected to the task that caused it. Workers keep running only the tests for what they changed.
- **Checks over prose.** `scripts/validate.mjs` gains checks so the prose can shrink:
  - adapter `display_name` and `short_description` (at most 60 characters, no trailing period)
  - bare backtick filenames in a skill directory resolve
  - duplicate decision and spec numbers
  - `start`'s check-table IDs match `ESSENTIAL_CHECK_IDS`
- **Behavior over wording.** New behavior is tested through the helpers (`flow-block.mjs`, `board.mjs`, `start/lib`) or through evals, never by matching skill wording. Smoke contracts stay limited to safety rules (decision 0029).

### Docs

- Update `GLOSSARY.md` for Delivery mode and add Area.
- Update `docs/agent-compatibility.md`: local mode needs only Git, and workers fan out by default.
- Update the Flow mode paragraph in `PRODUCT.md`, and `docs/skills.md` where it states the modes.
- Update the status lines of decisions 0020, 0025, 0028, and 0029, and the decision index.

## Testing Decisions

- **Smoke contracts, safety rules only:**
  - local `ship` never pushes the default branch unless asked
  - `build` never picks pull-request mode with no remote
  - a failed task's worktree is kept
- **Unit tests:**
  - `flow-block.mjs` writes both answers
  - the new `validate` checks catch a drifted adapter, a missing bare filename, and a duplicate number
  - `start`'s check-table IDs match the lib
- **Evals:**
  - "I want feature X" with no Flow block: both questions asked once, nothing published before the answers
  - a local-mode ship with no remote: merge, no push, no worktrees left
  - E20 (build) extended for area scheduling and worktree removal
  - an `explore` run that asks its first question before background reads return
  - a `ship` review split per axis
- **Dogfood:**
  - Run this spec in pull-request mode here on the frontier.
  - Run one task in local mode in a scratch clone with no remote.
  - Report wall time and `git worktree list` afterwards.
- `pnpm test` stays under 8 seconds, and `pnpm validate` passes.

## Out of Scope

- Committing tasks directly to `main` without a spec branch (rejected in decision 0030).
- Removing worktrees left by earlier runs; the user cleans those up.
- Model diversity across workers.
- Trackers other than GitHub Issues.

## Further Notes

Sources: a `write-agents` audit and a read-only workflow review on 2026-10-28. The audit ran four parallel readers, and was rechecked after #87 and #88 at `29243cb`. The audit findings already fixed by spec 018 are left out: the three-worker cap, `ship`'s closing rule, wave ordering, and waiting on checkpoint CI. Spec 018 also left a new conflict: the draft pull request opens with `Closes` for every sub-issue. Its fix is under Pull-request fixes.

### Open assumptions

- "Push optional" means push only on request.
- A missing check suite stops local `ship`.
- Running the suite per integration batch, rather than per task, trades faster runs for bisection when a batch fails.
- This spec is large. It is one bet: Flow runs a feature end to end with the choices asked once, at maximum parallelism, with little test friction. `to-tasks` should split it by skill, so most tasks have no blockers.

## Tasks

Sub-issues of #89. Tasks 01–11 each own different files and share only this spec, so they have no blockers. 12 waits for 03–06 because the docs, evals, and contracts describe their behavior. Pinned safety phrases in smoke contracts stay intact; only the orchestrator and task 12 edit the contracts file.

- [x] 01: `flow`: ask depth and delivery together (#100)
- [x] 02: `start`: delivery input and concurrent bootstrap (#92)
- [x] 03: `explore`: question round and background readers (#97)
- [ ] 04: `build`: asked delivery, local suite, worktree cleanup, areas (#91)
- [x] 05: `ship`: local without remote, per-axis review, worktree prune (#99)
- [x] 06: `review`: per-axis workers and five-axis contract (#95)
- [x] 07: `to-tasks` and `to-spec`: areas, parallel publishing, NNNN (#94)
- [x] 08: `write-agents`: fan-out rule and mechanics (#96)
- [x] 09: Discovery skills: parallel groups and fallbacks (#98)
- [x] 10: `domain-modeling`, `handoff`, `debug`, `retro` fixes (#93)
- [ ] 11: `validate`: adapter, filename, numbering, check-table checks (#90)
- [ ] 12: Docs, evals, and safety contracts (#101, blocked by 03–06)
