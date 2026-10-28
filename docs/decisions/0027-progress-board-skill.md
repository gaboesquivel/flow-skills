# 0027 — Progress board skill

Status: **Accepted** (2026-10-28). Grows the catalog under the rule in `PRODUCT.md` that further catalog growth needs its own decision. Related: [0020](0020-flow-mode.md) (delivery modes, `ship` task-set orchestration), [0022](0022-start-runs-explore.md) (candidate specs). Spec: [012](../specs/012-progress-board.md).

## Context

Flow has no view of where a project's specs stand. Specs, tasks, branches, and merges are spread across `docs/specs/`, git, and sometimes GitHub, so the developer asks the agent "where are we?" to find out. While `ship` runs a task set ([0020](0020-flow-mode.md)), worker progress shows only in chat. GitHub Projects covers part of this, but only in pull-request mode, needs manual upkeep, and knows nothing about specs or workers.

## Decision

Add a `board` skill to the catalog (Misc group). Saying "show the board" renders a local kanban page of the current project's specs.

- **Read-only.** The board reflects work; agents move work through existing skills (`to-tasks`, `implement`, `ship`); the board reflects it. No dragging, editing, or other write path.
- **Git is primary.** Each spec's stage comes from status lines and task checkboxes on the default branch, spec branches, worktrees, and merges. GitHub, when available in pull-request mode, only adds issue and pull-request links.
- **Same columns everywhere.** Candidate → Specced → Ready → Building → Shipped, in every delivery mode and explore depth.
- **Run overlay.** During a task-set run, `ship`'s main session writes each task's transient state to `<git common dir>/flow/board.json`, atomically and best-effort. Git wins on conflict, and ended or stale overlays are ignored for staging.
- **Local page.** One zero-dependency Node script serves the page on `127.0.0.1`, or writes a static snapshot with `--once` for hosts that cannot keep a process running.

## Rationale

Git already records what the board needs, so deriving stages from it keeps the board consistent with the repository after crashes and needs no upkeep. The overlay is the only addition, and it lives inside `.git`, so adopter projects need no `.gitignore` edit and every worktree sees it. One set of columns keeps the board legible across projects. A read-only board avoids a second way to change work beside the skills that already authorize it.

## Alternatives

- **GitHub Projects.** Rejected as the primary view for the reasons above. Links to issues and pull requests stay as enrichment.
- **Drag-to-move board.** Rejected: a write path would bypass the authorization `ship` and `implement` carry, and would make the board a second source of truth.
- **Separate npm package.** Rejected: a dependency and install step for one small script, outside the portable `skills/` tree.
- **Build it in Flow Factory.** Rejected: Flow Factory is a hosted service; the board serves in-session and local work.

## Consequences

- The catalog grows by one skill: `scripts/validate.mjs`, `docs/skills.md`, `README.md`, and `PRODUCT.md` list `board`.
- `PRODUCT.md`'s "not shipped as skills" line now distinguishes the progress board from validation-board UI, which Flow still does not ship.
- `ship` task-set mode gains a best-effort overlay write at run start, task state changes, and run end ([spec 012](../specs/012-progress-board.md) task 03).
- If the overlay proves unreliable against the spec's kill criterion, it is dropped and the git-only board remains.
