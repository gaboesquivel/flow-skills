# Parallel workflow live run (2026-10-29)

## Scope

A real delivery under the parallel-first rule ([Workers](../../../skills/write-agents/SKILL.md#workers)) and `build`'s [Work in flight](../../../skills/build/SKILL.md#work-in-flight), after [spec 031](../../../docs/specs/031-fast-delivery.md). The work delivered was this reconciliation itself: retiring superseded eval scenarios, reconciling spec and decision statuses with [decision 0044](../../../docs/decisions/0044-fast-delivery.md), and a documentation sweep. Partial coverage for [E40](../rubrics/E40-rubric.md); not a graded E40 run.

## Conditions

- Host: Claude Code desktop, model `claude-opus-5-5`, main thread plus three subagents launched in one message.
- Delivery branch at launch: `031-fast-delivery` at `32a6a9e`; GitHub mode (pull request [#158](https://github.com/gaboesquivel/flow-skills/pull/158) open).
- Workers were told only to follow Work in flight literally, not how.

| Worker | Placement | Files |
| --- | --- | --- |
| Evals | host worktree | `tests/evals/**`, `scripts/check-evals.mjs`, `tests/validate.test.mjs` |
| Specs and decisions | host worktree | `docs/specs/**`, `docs/decisions/**` |
| Docs | shared checkout | root docs, `docs/*.md`, `skills/**` |

## Observations

- **Worktree base.** Both worktree workers found their worktree on `main` (`cd88295`), not the delivery head, moved their branch to `32a6a9e` with a clean tree before editing, and committed on their own branch (`6eef3aa`, `41ea827`). No detached heads. The rule added after the first validation works when read literally.
- **Shared checkout.** The docs worker edited one file and made no commits, as the rule says. Its one edit was wrong: it followed spec 031 item 7 (one tick at the end) instead of the amendment that replaces it. The main thread reverted the edit and fixed the root cause: decision 0044's amendment did not say it replaced item 5's single tick.
- **Delivery branch landed mid-run.** Another session squash-merged #158 at 14:11 UTC, one minute after launch, and switched the shared checkout to `main`. The main thread's next commit landed on local `main`. It moved that commit to a new delivery branch from `origin/main`, reset local `main` to its remote, and lost nothing.
- **Integration after squash.** Merging the worker branches into the new branch conflicted in 11 files, because their base `32a6a9e` was not an ancestor of the squash commit. Cherry-picking each worker commit applied cleanly. `git cherry` showed each one as patch-equivalent (`-`), which serves as containment proof where ancestry cannot.
- **Stale base caught on review.** The evals worker retired E27 against `32a6a9e`. The squash added a commit that restored `ship`'s stop on a still-Proposed linked decision, so the main thread rewrote E27 instead.
- **Validation.** `pnpm validate` and `pnpm test` ran once on the integrated head before the pull request (see its description).

## Findings

1. Native worktree isolation starts from the default branch. The Work in flight rule handles this; keep it.
2. When the delivery branch squash-lands while workers run, ancestry checks fail. Integrate by cherry-picking onto the new base and confirm containment by patch equivalence. Work in flight already allows cleanup once the pull request merged; containment wording covers commits, not ancestry.
3. A shared checkout is shared with other sessions, not just with workers. Before committing, check which branch is checked out.
4. Workers given a spec with amendments can apply a replaced item. Amendments should name what they replace at the place the original rule lives.

## Limitations

One run, one host. E40's dependent task and unfinished task were not exercised here; the [spec 031 validation](../../../docs/specs/031-fast-delivery.md) covered a failed task in throwaway repositories. Timing: about 5 minutes from launch to the last worker report.
