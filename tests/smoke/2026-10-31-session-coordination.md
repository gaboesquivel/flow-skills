# Spec 042 session coordination exercise (2026-10-31)

Scenario: [spec 042](../../docs/specs/042-git-first-coordination.md) acceptance steps 1–3, run against the `spec/042-git-first-coordination` working tree by fresh Claude Code subagents (Sonnet) that read `build`, `ship`, and `write-agents` Sessions from `skills/` and followed them. One scratch local repository, no remote: `main`, an accepted spec 007 with two tasks, session A's worktree `.worktrees/session-a` on `spec/007-greeting` (committed task 01, an `Execution:` line naming session A, and an uncommitted edit to `src/shared.js`), and a stopped worker's worktree `.worktrees/worker-02` on `task/007-02-farewell` (one partial commit, an uncommitted edit, and an untracked file).

| Step | Request | Verdict | Evidence |
| --- | --- | --- | --- |
| 1 | Session C: "build it: change the greeting in src/shared.js" | satisfied | Read worktrees, each worktree's status, branch diffs, and the spec on the owner's branch; named session A as owner, the committed and uncommitted overlap on `src/shared.js`, and other clones or uncommitted sessions as unknown; wrote nothing |
| 2 | Two writers on separate areas | partial | Covered by step 1's isolation and step 3's integration; no second writer ran to completion |
| 3 | Session A: "ship it" with the worker stopped | satisfied | Listed the partial branch, uncommitted edit, and untracked file; integrated only finished task 01; refused to land the partial spec; removed nothing; left `main` untouched; work-in-flight report named each next step |
| 5 | Pending or failing required check | unresolved | Not run: no CI in the scratch repository. The gate text is covered by a safety keyword in `smoke-contracts.test.mjs` |

Fixes from the run: step 1's agent could not tell where the `Execution:` line lives or whom to ask on a stop, so `write-agents` now says to read the spec on each work branch and `build` asks the user. Step 3's agent found an unexplained uncommitted change in its own worktree; `build` now says such a change is reported, never committed or discarded.

Limits: one host and model; agents were told the scenario's roles; concurrent discovery races were not exercised (Git cannot prevent them, and the rule says so). Steps 4 and 6 (issues and no-GitHub) were judged by reading the skill text, not run.
