# 021: A clean run from start to ship

Status: implemented (2026-10-28). Issue: [#111](https://github.com/gaboesquivel/flow-skills/issues/111). Decisions: [0033](../decisions/0033-shared-files-and-reviewed-head.md) (Accepted), [0034](../decisions/0034-no-ceremony-without-a-spec.md) (Accepted), [0035](../decisions/0035-spec-issue-on-acceptance.md) (Accepted), [0036](../decisions/0036-one-explore-depth.md) (Accepted). Builds on [spec 020](020-ship-verifies.md), which lands first.

## Problem Statement

A rehearsal on 2026-10-28 took a new product (Signal) from "start a Next.js project" to a shipped first spec with Flow's own skills, in local delivery mode. The skills did their jobs, but the run only stayed organized because the orchestrator stepped in at six points:

1. **The Flow block never reached the repository.** `start` wrote it into `AGENTS.md`, which the flow-next template ignores in Git, so the initial commit had no block. The adopter's `CLAUDE.md` did not import `AGENTS.md`, so a fresh session would not see the recorded delivery mode or discovery depth either.
2. **`explore` writes with no branch.** The brief, research, and decision records landed uncommitted on `main`, and reached the spec branch only because `to-spec` created it from a dirty tree.
3. **A required prompt log fights the reviewed head.** The project's instructions (the assessment's `prompts.txt`) require appending after every prompt. Each append after the review moved the head, so the `Reviewed:` trailer named an unreviewed commit, and later appends were committed directly on `main`.
4. **Task worktrees started from the wrong branch.** The host's worktree isolation cut every worker from the default branch, not the spec branch, so each worker had to notice and reset itself.
5. **A read-only reviewer changed the primary checkout.** A review worker ran `git checkout` in the orchestrator's checkout, then restored it.
6. **"Authentication out of scope" shipped public write endpoints.** Spec 001 named auth out of scope without saying where the slice runs, so the build exposed unauthenticated writes and model spend. The review caught it, but the spec should have forced the question.

Two maintainer requests from the same review:

- **A ticked task does not say which commit delivered it.** The spec's checklist reads `- [x] 01: …` with nothing to follow back to the change.
- **Drafts are published before anyone reads them.** In pull-request mode, "spec it" pushes the branch and opens a public spec issue for an unreviewed draft, and every revision is another public sync.
- **Unspecced work carries spec ceremony.** Spec 020 lands ad-hoc local work through the spec gate and the full per-axis review. A hotfix or a one-line change does not deserve that.

Four smaller frictions also showed up:

- `ship` merges "with no confirmation", but the host's auto mode refuses an agent merging its own pull request, and `ship` has no rule for that refusal.
- The spec issue's body sync and hand-edit check were hand-rolled four times.
- `explore`'s background readers have nothing to read in a project `start` just created.
- Lite's "one main metric" clashed with a brief that needed two or three metrics.

And one design problem the run exposed: **discovery depth is the wrong kind of setting.** It is recorded once per project (`Process:` on the Flow block) and asked at setup, but depth belongs to each piece of work: a new product and a small feature in the same repository need different amounts. The project-wide "Lite" was also read as "local delivery". The Full run's most useful output came from the pre-mortem; `jtbd`, `competitors`, and the approaches worker were valuable but not needed every time.

## Solution

1. **`start` leaves the agent instructions correct.** Setup (in `start` and "set up Flow here") owns the project's instruction-file layout, not just the block:
   - **One canonical, tracked file.** The block goes in the instruction file Git tracks: `AGENTS.md` when it is tracked, otherwise `CLAUDE.md` (created if needed). It never goes into a file Git ignores or a template regenerates, such as the `AGENTS.md` that flow-next ignores because Next writes its agent rules there.
   - **Imports wired.** When `CLAUDE.md` and `AGENTS.md` both exist (or `AGENTS.md` is generated at dev time), `CLAUDE.md` gets an `@AGENTS.md` import line, so Claude Code sees both. Today the helper only warns.
   - **Adopter text kept.** Everything the adopter wrote, such as a prompt-log rule, stays byte for byte; the template's copy of a kept file is reported as skipped, as today.
   - **Reported and committed.** `start` reports the layout (which file holds the block, whether it is tracked, which imports exist) and confirms the block and import are in the initial commit.
2. **`explore` commits its writes on a branch.** It writes the brief, research, and decision records on a new `explore/<slug>` branch from the default branch and commits them there. `to-spec`, run on an explore branch, renames it to the spec's branch and continues, so everything ships with spec 001.
3. **Shared files do not move the reviewed head** ([0033](../decisions/0033-shared-files-and-reviewed-head.md)). The orchestrator commits shared-file appends on the spec branch. The landing merge (local `build`, or `ship` in pull-request mode) is allowed when every commit after the reviewed SHA touches only the project's declared shared files. The `Reviewed:` trailer keeps the reviewed SHA, and nothing is committed directly on the default branch.
4. **`build` creates task worktrees itself** with `git worktree add` from the spec-branch head, outside the primary checkout, and checks that each worker's head descends from it before integrating. It does not rely on host isolation.
5. **Review workers never touch the primary checkout.** They read through `git show <sha>:<path>`, or run in their own detached worktree at the reviewed SHA.
6. **Specs state their exposure.** Every spec has an **Exposure** line saying where the slice runs and who can reach it. When authentication is out of scope and the slice can be deployed, write paths fail closed on deployment.
7. **`ship` hands a refused merge to the user.** When the host's permission policy or protection refuses the merge, `ship` stops with a ready-to-merge report: the head SHA, the checks, the review, and the exact merge command. It never retries with another method.
8. **A spec-issue helper.** `to-spec` ships `lib/spec-issue.mjs` to build the issue body with its hash marker and to check a body for hand edits.
9. **Ticked tasks link their commit.** When `build` ticks a task, the checklist line ends with the short SHA of the commit that integrated it, linked when a remote exists: `- [x] 01: Title (#N) — a1b2c3d`.
10. **No ceremony without a spec** ([0034](../decisions/0034-no-ceremony-without-a-spec.md)). "Build it" on work with no spec or task skips the spec gate and the per-axis review workers. It runs the full local suite and one self-check against the request, then lands as the mode delivers. In local mode it merges into local `main`; in pull-request mode it opens a ready pull request. The size guard still applies: new product behavior, a data-shape or public API change, or a migration stops and suggests `to-spec`.
11. **The spec issue opens at acceptance** ([0035](../decisions/0035-spec-issue-on-acceptance.md)). "Spec it" writes and commits the draft locally on the spec branch and publishes nothing. "Accept the spec" pushes the branch and opens the spec issue labelled `accepted`. "Share the draft" opens it early, labelled `draft`, for team review. `to-spec` opens a `candidate` issue only when asked.
12. **One `explore` depth** ([0036](../decisions/0036-one-explore-depth.md)). `explore` has a single default depth: confirmed intent, the riskiest assumption, a pre-mortem, a kill criterion, one main metric plus any supporting metrics the user names, core journeys, alternatives including the status quo, and the agent lens. Deeper discovery is opt-in: the user asks for `competitors` (with saved research) or `jtbd`, and `explore` may suggest one in a single line when evidence warrants it, without running it unasked. Decision records follow `to-spec`'s decision test at any depth. Setup no longer asks for or records a depth: the `Process:` line is dropped from the Flow block on the next rewrite, and `start` and "set up Flow here" ask only for delivery. Skip stays for fixes.
13. **Small `explore` rule.** Skip background readers that have nothing to read.

## User Stories

1. As a developer whose template ignores `AGENTS.md`, I run `start` and find the Flow block in my tracked `CLAUDE.md`, with an `@AGENTS.md` import and my prompt-log rule untouched, all in the initial commit.
2. As a developer, I finish `explore` and see the brief committed on an `explore/` branch, with `main` clean; "spec it" turns that branch into the spec branch.
3. As a developer whose project requires a prompt log, I say "build it": every prompt is logged, `main` receives only the reviewed merge, and its `Reviewed:` trailer names the commit the reviewers saw.
4. As a developer, I watch "build it" start four workers, and every worktree starts from the spec branch with no worker resetting itself.
5. As a developer, my checkout stays on the branch I left it on while reviewers run.
6. As a reviewer, I read a spec's Exposure line and know whether a missing login is safe.
7. As a developer whose host refuses agent self-merges, I get a report that says "ready for you to merge" with the command, and no retry.
8. As a developer, I open spec 001 after the build and follow each ticked task to the commit that delivered it.
9. As a developer, I say "build it" on a one-line fix with no spec: the suite runs, the change lands with a self-check, and no review workers start.
10. As a developer, I say "build it" on unspecced work that adds an API: `build` stops and suggests `to-spec`.
11. As a developer, I say "explore this" on a feature and get the default depth with a pre-mortem, no depth question; I say "who are the competitors" when I want research.
12. As a developer setting up Flow, I am asked only how work lands (pull requests or local).
13. As a developer, I say "spec it" and review the draft file locally; nothing is pushed or public until I say "accept the spec".
14. As a maintainer who wants comments first, I say "share the draft" and get a `draft` issue my teammates can read.
15. As a maintainer, I sync a spec issue with one helper command, and a hand-edited body is reported instead of overwritten.

## Implementation Decisions

- **`flow/lib/flow-block.mjs`** (the one home of the layout rules, used by `flow` and `start`):
  - `instructionFile(projectDir)` returns `AGENTS.md` when it exists and is not ignored (`git check-ignore -q`), otherwise `CLAUDE.md`.
  - `ensureImport(projectDir)` adds `@AGENTS.md` as the first line of `CLAUDE.md` when `AGENTS.md` exists or is ignored-but-generated and `CLAUDE.md` lacks the import; it touches nothing else in the file. It replaces today's warning.
  - `describeLayout(projectDir)` returns `{ blockFile, tracked, imports }` for the report.
  - Unit tests use a temporary Git repo: tracked `AGENTS.md`; ignored `AGENTS.md` with an adopter `CLAUDE.md`; no instruction file.
- **`start`:** the Flow block step writes the block, then `ensureImport`, and reports `describeLayout`. The boundary "edit adopter instruction files only to write the Flow block" widens to "only to write the Flow block and the `@AGENTS.md` import". The commit gate fails when the block's file is ignored. `flow`'s "set up Flow here" runs the same helper calls.
- **`explore`:** under Outcome and write gate, writes go on `explore/<slug>` and are committed with a Conventional Commits message. In a run handed over by `start`, the branch is cut after the bootstrap commit.
- **`to-spec`:** on an `explore/` branch with no spec yet, `git branch -m` it to the spec's branch name before writing.
- **`build`:**
  - Task set › Run the frontier creates `git worktree add <path> -b <task-branch> <spec-head>` per task, where `<path>` is a sibling of the primary checkout. Before integrating, it checks `git merge-base --is-ancestor <spec-head-at-start> <task-head>`.
  - Shared files: the orchestrator commits appends on the spec branch. Local mode's merge step applies 0033.
- **`ship`:** Merge applies 0033 in pull-request mode (`--match-head-commit` on the head that includes only shared-file commits after the reviewed SHA). Under Gate, a host or protection refusal stops with the ready-to-merge report.
- **`review`:** workers read with `git show`, or a detached worktree they create and remove. Never `checkout` or `switch` in a checkout they did not create.
- **`to-spec` template:** an **Exposure** line under Implementation Decisions: where it runs, who can reach it, and how writes behave when deployed without authentication.
- **`to-spec/lib/spec-issue.mjs`:**
  - CLI `body <spec-path> <owner/repo> <ref>` prints the issue body with its marker.
  - CLI `check <body-file>` exits 1 on a hand edit and prints the diff hint.
  - Both functions are exported for tests.
  - The skill text points to the helper instead of describing the hash steps.
- **`build`, Task set › Integrate:** ticking a task appends ` — <short-sha>` for the integration merge commit (a link to the commit page when a remote exists). This applies in both delivery modes, and in local mode also on the task's **Status:** `done` line.
- **`build`, Deliver ([0034](../decisions/0034-no-ceremony-without-a-spec.md)):** work that resolves to no spec or task is unspecced. It gets the full local suite and a single-agent self-check against the request and `review`'s axes; there are no review workers and no spec gate. The size guard (today `ship`'s hotfix guard) moves to `build` as the one home and applies before landing. Local mode merges into local `main` with a `Reviewed: <sha>` trailer naming the self-checked head; pull-request mode opens a ready pull request. `ship` runs no further review on unspecced work and keeps Verify (a smoke of the changed behavior).
- **`to-spec`, Spec issue ([0035](../decisions/0035-spec-issue-on-acceptance.md)):** Open moves from "spec it" to "accept the spec": push the branch, open (or reuse and relabel) the issue with `accepted`, write `Issue: #N`, commit, push, sync. "Share the draft" is the opt-in early path with `draft`; a shared draft is relabelled `accepted` on acceptance. Sync and hand-edit rules are unchanged once an issue exists. A `candidate` issue opens only on request. `to-tasks` in pull-request mode needs the spec issue, so it follows acceptance as today.
- **`ship` and `build`:** the label gate is unchanged (`accepted` on the spec issue). A spec in pull-request mode with no `Issue:` line yet is not accepted; `ship` suggests "accept the spec".
- **`explore`:**
  - Reader rule: launch only readers whose sources exist; in a run handed over by `start`, the bootstrap report replaces the status reader.
  - Depth ([0036](../decisions/0036-one-explore-depth.md)): replace "Propose a depth", the Lite and Full tiers, and the Question round's depth question with one default depth (item 12). Keep Skip for fixes. The pre-mortem runs as one read-only worker after the intent yes while the grill proceeds; `grill` skips its own pre-mortem, as today. Research is saved only when `competitors` runs, as it owns that rule.
- **Depth removal:** `flow-block.mjs` drops `Process:` on rewrite (as it dropped `Deploy:`), removes `--process`, `normalizeProcess`, and `readProcess`; `flow`'s Ask and `start`'s inputs keep only Delivery; `to-spec`'s Full-depth decision-record rule and `explore`'s "Decision records at Full depth" go. Update `GLOSSARY.md` (retire Discovery depth / Process depth with a pointer to 0036), `README.md`, `PRODUCT.md`, `docs/skills.md`, and the status lines of 0026 and 0030.

## Testing Decisions

- Unit tests: `instructionFile` with an ignored `AGENTS.md`; `spec-issue.mjs` round trip (body → check passes; edited body → check fails; CRLF and trailing spaces normalize).
- Smoke contracts (safety only):
  - the block is never written into an ignored file, and adopter text outside the block and import is never changed;
  - review workers never check out in a checkout they did not create;
  - 0033's "only declared shared files after the reviewed SHA";
  - a refused merge is never retried with another method;
  - unspecced work that is not small stops for `to-spec`;
  - "spec it" publishes nothing; the spec issue opens at acceptance or on "share the draft".
- Evals: one for `explore` committing on `explore/`, and one for `build` creating worktrees from the spec head.
- `pnpm validate` and `pnpm test` pass; `pnpm test` stays under 8 seconds.

**Acceptance scenario** (run by the maintainer in a scratch folder; every write is local, not production):

Actor: a developer with Claude Code and these skills. Starting state: an empty `/tmp/flow-021` holding only a `CLAUDE.md` that requires appending each prompt to `prompts.txt`.

1. Say "Let's start a Next.js project" with a one-line idea; answer local (no depth question is asked). → The initial commit contains `CLAUDE.md` with the Flow block, an `@AGENTS.md` import, and the unchanged prompt-log rule (`git show HEAD:CLAUDE.md`). `git check-ignore CLAUDE.md` fails, and `start`'s report names the layout. *(writes; local only)*
2. Finish `explore` with a yes to the brief. → A pre-mortem ran and no depth was asked; `git branch` shows `explore/<slug>` holding a commit with `PRODUCT.md`; `main` has no new commit and a clean tree. *(writes; local only)*
3. Say "spec it". → The explore branch is renamed to `feat/001-<slug>`, holding the brief and the draft spec, which has an Exposure line; in a pull-request-mode copy of the project nothing is pushed and no issue exists. Say "accept the spec", then "break it down". → The spec reads `accepted` and has its tasks; in the pull-request-mode copy the branch is pushed and the spec issue opens labelled `accepted`. *(writes; local, plus one issue in a scratch repository)*
4. Say "build it" on two or more tasks. → `git worktree list` shows one sibling worktree per task, each starting at the spec-branch head, and no worker reports resetting. The primary checkout's branch is unchanged after the review. *(writes; local only)*
5. After the review, the orchestrator appends to `prompts.txt`. → The landing merge on `main` carries `Reviewed: <sha>` equal to the reviewed commit. `git log <sha>..<merged-head>` before the merge lists only `prompts.txt` commits. No commit sits directly on `main`. *(writes; local only)*
6. Open the spec. → Each ticked task line ends with the short SHA of its integration merge, and `git show <sha>` shows that task's merge. *(read-only)*
7. On `main`, say "build it" for a one-line copy fix with no spec. → The suite runs, no review workers start, and the fix lands on local `main` with a `Reviewed:` trailer. Then say "build it" for an unspecced change that adds an MCP tool. → `build` stops and suggests `to-spec`; `main` is unchanged. *(writes; local only)*
8. In a pull-request-mode repository whose host refuses the agent's merge, say "ship it". → `ship` reports ready-to-merge with the SHA, checks, review, and `gh pr merge` command, and makes no second attempt. *(read-only after the refusal)*

No agent users; there is no MCP variant.

## Out of Scope

- Reducing review cost (fewer workers for re-reviews); tracked as a candidate.
- A per-project default for deeper discovery; ask for `competitors` or `jtbd` instead.
- flow-next template bugs found in the run: nested `.eve` folders are not excluded from Vitest, `portless trust` needs an interactive terminal, and `generateObject` is deprecated in `ai` 7. They belong in the flow-next repository.
- Simulating the operator in an interview.

## Further Notes

Source: the Signal demo rehearsal on 2026-10-28 in `/tmp/flow-demo`, on `feat/020-ship-verifies` at `dc50462`, and its review.

### Open assumptions

- Writing the block into `CLAUDE.md` is preferable to changing the template's `.gitignore` (`start` must not edit it).
- "Maintain the agent instructions" means the layout above (canonical file, imports, adopter text); it does not mean `start` writes project context such as commands or doc pointers into those files.
- `explore/<slug>` uses the brief's product slug for a new product, or the feature's slug otherwise.
- Issues already opened for drafts (#104, #111) stay as they are; the new rule applies from the next spec.
- Existing Flow blocks with `Process:` keep working until rewritten; skills ignore the line.
- "Lite flow" in the maintainer's request reads as any run without issues, so commit links apply in both delivery modes.
- A self-check is enough for unspecced work because the size guard keeps anything consequential out of that path.
- Declared shared files are the ones the project's instruction files tell every session to append to; `build` already names them in worker briefs.
- This branch is stacked on spec 020's branch and rebases onto `main` once [#110](https://github.com/gaboesquivel/flow-skills/pull/110) merges.

## Tasks

Sub-issues of #111. Tasks 01–05 each own different skill areas and share only this spec, so they have no blockers; each edits only its own skills' entries in the smoke contracts. 06 waits for 01–05 because the docs, contracts, and evals describe their behavior.

- [x] 01: Setup keeps agent instructions correct and asks only delivery (#117) — 3411d48
- [x] 02: `explore`: one depth and an explore branch (#113) — 1247184
- [x] 03: `to-spec`: issue at acceptance and spec-issue helper (#115) — 8521c76
- [x] 04: `build`: own worktrees, shared files, commit links, no ceremony (#116) — fa3be47
- [x] 05: `ship` and `review`: refused merge, shared files, checkout safety (#114) — 4de8efd
- [x] 06: Docs, safety contracts, and evals (#118, blocked by 01–05) — 830b56f
