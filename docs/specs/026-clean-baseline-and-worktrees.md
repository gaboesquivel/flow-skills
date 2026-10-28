# 026: A clean baseline and ready worktrees

Status: implemented (2026-10-28). Issue: [#130](https://github.com/gaboesquivel/flow-skills/issues/130). Builds on [spec 021](021-demo-findings.md). Related: spec 025 (in flight on `feat/025-build-without-a-spec`; it stops `explore` writing specs and candidates unasked, so item 6 here applies only when a candidate is asked for).

## Problem Statement

A second rehearsal on 2026-10-28 (demo 2) ran Signal from "start a Next.js project" to a shipped spec 001 with the skills at `72acd1f`, in local mode, with the agent playing both user and orchestrator. Spec 021 fixed every demo 1 intervention, and the measured parallelism matched the skills' claims. The run still needed one stop, and it showed gaps that cost time on every build:

1. **The first build gate is red before any task runs.** `start` runs its checks in "Bootstrap order", then writes the Flow block. The block's phrase table is an unaligned Markdown table, which fails the template's `oxfmt --check`, so the initial commit's suite is red. The flow-next bug where Vitest collects nested `agents/*/.eve` runtimes (out of scope here) made it red a second way.
2. **`build` has no rule for a red baseline.** Its suite rule is "on a failure, bisect to the task that caused it". When the spec head is already red, no task caused it, and the orchestrator has to stop and ask.
3. **Task worktrees are not ready to run.** `build` creates sibling worktrees with `git worktree add`, but nothing prepares them. Every worker reinstalls dependencies (~35 s each), has no env file, and sees failures from missing generated outputs (`mcp-app/dist`) that are not its fault.
4. **Root context has no owner in a task set.** Workers stay in their area, and the orchestrator only integrates. ARCHITECTURE, GLOSSARY, and DESIGN were stale until the review flagged them, which cost a fix round.
5. **Candidate stubs land on `main` while the spec is open.** `to-spec` commits local-mode candidates on the default branch, so `main` diverges before review, and the spec's links to them are dead on its own branch until the merge.
6. **Shared-file appends have no home before `build`.** Decision 0033's rule lives in `build` and `ship`. During `explore` and "spec it", prompt-log appends sit uncommitted and ride along through branch renames and switches.
7. **Areas are a proxy for file overlap.** `to-tasks` gives each task one directory, and `build` schedules by area. Vertical slices also add files outside it (pages under `app/`), so disjoint areas do not prove that two workers never touch the same file.
8. **`start` has smaller frictions.**
   - Renames break formatting (for example `"signal": {` in `tool-catalog.ts`), and only the root docs are formatted.
   - Stage 3 runs `qa` and `build` together, though both build the same outputs.
   - The `http_mcp` row accepts `/api/mcp`, which returns 406 to a plain GET.
9. **Verify cannot mark a production-only step.** The scenario's production-write step needed `next start`, which the template blocks until `eve build` runs. Verify has no wording for a step the local setup cannot produce, so the step went unresolved without a stated reason.

## Solution

1. **`start` verifies after its last write.** It writes the Flow block and import, formats every file the bootstrap wrote or renamed with the project's formatter, then runs the stage-3 checks. The commit gate fails on a red suite, as it does for any essential check.
2. **The helper writes a table formatters accept, and recognizes a formatted one.** The `flow` helper emits the phrase table with aligned columns. On a re-run it treats a block that differs only in table spacing as Unchanged, so the formatter and the helper do not fight.
3. **`build` checks the baseline first.** Before starting the first frontier, it runs the full local check suite once on the spec head. When that suite is red, it stops with a **baseline failure** report naming the failing checks, starts no workers, and leaves the spec branch untouched. When a batch fails later and bisect lands on no task, it reports a baseline failure the same way.
4. **`build` prepares each worktree.** After `git worktree add`, the orchestrator runs the project's documented setup in the worktree: the install command from the instruction file's command table or the lockfile's package manager, plus any build step the test command depends on. It copies ignored env files the primary checkout has (such as `.env.local`), never committing them. Workers start from a ready worktree, and the brief says so.
5. **The orchestrator aligns root context once per task set.** After the last integration and before the review, it runs `flow`'s alignment over the integrated change and commits it on the spec branch. The review still flags anything stale.
6. **Candidates ride with the spec.** When `to-spec` writes a local-mode `candidate` stub during a spec's run, it commits the stub on that spec's branch, so it lands with the spec. A candidate written on its own, with no spec branch open, is still committed on the default branch.
7. **One shared-file rule, applied from the first write.** `build`'s Shared files section stays the one home. `explore` and `to-spec` link to it: they commit pending shared-file appends on the branch they write to, in their own commit, before switching or renaming branches.
8. **Areas name every directory a task changes.** A task's `Area:` line may list several directories, such as `lib/feedback/connect, app/opportunities`. `build` treats tasks whose listed areas intersect as serial. Before integrating, it checks that no two concurrent task branches changed the same file.
9. **`start` cleanup.**
   - Format renamed files along with the baseline docs (item 1).
   - Run `build` after `qa` and `eval` in stage 3, not alongside them.
   - The `http_mcp` row checks `/.well-known/mcp.json`, or `/api/mcp` with an MCP `Accept` header.
10. **Verify names production-only steps.** When the scenario step needs a production build that the local setup cannot produce, Verify marks it `unresolved` with the command that failed and its error, and the report lists it under Next.

## User Stories

1. As a developer who just ran `start`, I run `pnpm qa` on the initial commit and it passes.
2. As a developer who formats the whole repository, I re-run "set up Flow here" and the helper reports Unchanged.
3. As a developer who says "build it" on a spec whose head is already red, I get a baseline-failure report before any worker starts, naming the failing checks.
4. As a developer watching a task set, I see workers start real work at once, without each one installing dependencies or failing on missing generated files.
5. As a reviewer of a task set, I find ARCHITECTURE, GLOSSARY, and DESIGN already updated on the spec branch.
6. As a developer whose spec names later bets, I see `main` untouched until the spec lands, with the candidates arriving in the same merge.
7. As a developer whose project keeps a prompt log, I see its appends committed on the explore or spec branch and never left uncommitted across a branch switch.
8. As a developer, I see two tasks that both add pages under `app/` run one after another, or start together only when their listed areas do not intersect.
9. As a developer reading a Verify report, I see why a step was not run and what would run it.

## Implementation Decisions

- **`start`:** reorder "Bootstrap order":
  1. renames;
  2. setup and baseline docs;
  3. the Flow block and import;
  4. format every written and renamed file;
  5. qa, eval, and the identity scan, then build;
  6. the dev server, then the HTTP checks.

  The commit gate keeps its rule; the reorder makes it see the block. Update the Verification table's `http_mcp` row.
- **`flow/lib/flow-block.mjs`:** align the phrase table's columns with a pure function. The Unchanged check compares blocks after collapsing runs of spaces inside table rows and normalizing separator dashes. Keep the CLI output (`Wrote` / `Unchanged`) and the layout report. Unit tests: aligned output passes a formatter-style check; a re-aligned block reads as Unchanged; a changed `Delivery:` still writes.
- **`build` › Task set:**
  - **Baseline.** Step 1 (Plan) runs the full local check suite on the spec head before the frontier, and a red result stops as above. Integrate › Suite adds: "When bisect finds no task, it is a baseline failure: stop and report; do not send it to a worker."
  - **Worktree setup.** Run the frontier gains the setup step and env copy. A worker list entry records whether setup passed. A setup failure blocks only that task, with evidence.
  - **Alignment.** Finish gains the alignment step before the review in both modes (local: before Deliver › Local mode's review; GitHub mode: before marking the pull request ready).
  - **Areas.** Area intersection uses every listed directory, and integration checks file overlap with `git diff --name-only <spec-head>...<task-head>` across tasks that ran together. An overlap returns the later task to its worker as a fix round.
- **`to-tasks`:** `Area:` may list several comma-separated directories, still coarse and never file paths. Templates and the rule text change to match.
- **`to-spec`:** the candidate rule in its opening paragraph changes as Solution item 6 says. Its spec-branch commits stage pending shared-file appends as `build`'s Shared files describes.
- **`explore`:** its explore-branch commit links to `build`'s Shared files for pending appends.
- **`ship` › Verify:** step 4 (Record) adds the production-only wording; no new gate.
- **Smoke contracts (safety only):**
  - `build` stops on a red baseline and never sends one to a worker;
  - env files copied into worktrees are never committed;
  - the Flow block helper still never touches text outside its markers and the import.
- **Evals:** one for `build` reporting a baseline failure with no workers started, and one for `start` whose initial commit passes the project's lint.
- **Docs:** update `docs/skills.md` rows for `start`, `build`, `to-tasks`, and `to-spec`, and `GLOSSARY.md` for **Baseline failure** and the multi-directory **Area**.

**Exposure:** none. These changes ship in the public `skills/` tree and its helpers; there is no service and no write path to expose.

## Testing Decisions

- Unit tests for the helper's table alignment and spacing-insensitive Unchanged check.
- Smoke contracts and evals as listed; `pnpm validate` and `pnpm test` pass, and `pnpm test` stays under 8 seconds.
- The template's `.eve` collection bug is not ours to test; the acceptance run uses a flow-next version with it fixed, or notes it as a known baseline failure, which item 3 must then report.

**Acceptance scenario** (run by the maintainer in a scratch folder; every write is local, not production):

Actor: a developer with Claude Code and these skills. Starting state: an empty `/tmp/flow-026` holding only a `CLAUDE.md` that requires appending each prompt to `prompts.txt`.

1. Say "Let's start a Next.js project", answer local, and confirm. → `pnpm qa` passes on the initial commit, and `node <flow>/lib/flow-block.mjs <dir> local` after `pnpm format` prints `Unchanged`. *(writes; local only)*
2. Finish `explore` with a yes to the brief, then say "spec it" on a spec that names one later bet. → `git log main` shows only the initial commit, and `prompts.txt` appends are committed on the explore branch, then the spec branch. The candidate stub sits on the spec branch. *(writes; local only)*
3. Break it down into tasks where two of them add files under `app/`. → Their `Area:` lines name both directories, and `build` runs them one after another. *(writes; local only)*
4. On a copy whose spec head has a failing test, say "build it". → A baseline-failure report names the test, no worktree is created, and the spec branch is unchanged. *(writes nothing)*
5. On the clean project, say "build it". → Each worker's first log line is task work, not a dependency install, and no worker reports a missing `mcp-app/dist`. ARCHITECTURE, GLOSSARY, and DESIGN change on the spec branch before the review, and the review reports no stale root docs. *(writes; local only)*
6. Say "ship it". → Verify marks a production-only step `unresolved` with the failing command and lists it under Next. *(read-only after landing)*

There are no agent users and no MCP variant.

## Out of Scope

- The flow-next bugs, which belong in that repository: nested `.eve` collected by Vitest, `next start` needing `eve build`, and the MCP manifest advertising the wrong host behind Portless.
- Reducing review cost for fix rounds; a candidate since spec 021.
- Signal's product findings (navigation between journeys, seed timestamps in metrics, `ai_unavailable` shapes).
- Running a model key in rehearsals.

## Further Notes

Source: demo 2 on 2026-10-28 in `/tmp/flow-021`, skills at `72acd1f`. Each finding was re-checked against `main` at `c2ee70f`; none was fixed there.

### Open assumptions

- The project's install and pre-test build commands can be read from the instruction file's command table or `package.json` scripts; with neither, setup is skipped and the brief says so.
- Copying ignored env files into a worktree is acceptable because worktrees are siblings on the same machine, and the files stay ignored.
- An aligned phrase table satisfies the common Markdown formatters (oxfmt, Prettier). Other formatters fall under the spacing-insensitive Unchanged check.
- Spec 025 lands first or alongside. If it does not, item 6 also covers the candidates `explore` currently writes for a new product.
