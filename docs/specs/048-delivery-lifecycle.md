# 048 — Delivery lifecycle: one draft workspace, checks on ready

Status: **draft** (2026-10-31)  
Repositories: `gaboesquivel/flow-skills`, `gaboesquivel/flow-next`, `gaboesquivel/flow-mono`  
Decision: [0057](../decisions/0057-draft-workspace-ready-checks.md) (Proposed)  
Builds on: [0044](../decisions/0044-fast-delivery.md), [0048](../decisions/0048-delivery-phrases-are-approvals.md), [0050](../decisions/0050-github-governance-preset.md), [0052](../decisions/0052-git-first-coordination.md), [0055](../decisions/0055-capability-based-github-and-host-triggered-builds.md); [spec 046](046-cloud-delivery.md) (cloud delivery)

## Problem Statement

The maintainer pays for work that proves nothing. `build` opens a ready pull request and waits on CI, so every push while the work is still moving runs the full check suite. Draft pull requests also run CI. Vercel builds a preview for every branch push: since 2026-10-30 18:00 UTC, 39 of 54 `flow-skills` deployments were previews nobody opened. Both starters install a `simple-git-hooks` pre-commit guard that agents bypass or trip over, while the same protection already runs in CI. Agents working on one spec open extra branches and pull requests, so integration happens in several places. Cloud agents start without tracked instructions in the starters (no root `AGENTS.md`, no Cursor environment), so they cannot load the methodology the starters ship.

## Solution

One delivery branch and one draft pull request per spec are the shared workspace. Agents work in isolated worktrees and one integration owner pushes to the branch. Drafts cost nothing: no CI runner, no automatic preview. When implementation and its focused checks are done, `build` marks the pull request ready; that event runs the repository's required deterministic checks once on the ready head, and every later commit runs them again. `ship` merges only when each required check actually ran and passed on the head it merges; a check that was skipped because the pull request was a draft never counts. Production still deploys automatically from `main`. Git hooks are gone; secret and security checks run in ready-PR CI. The starters carry tracked agent instructions and the smallest cloud setup for Claude Code and Cursor, and bundle the current Flow skills.

## User Stories

1. As the maintainer, I say "spec it"; I get a draft spec on `spec/<number>-<slug>` and nothing is implemented.
2. As the maintainer, I say "build it"; one draft pull request opens early on `spec/<number>-<slug>` (or the existing one is reused), and pushes to it start no CI runner and no Vercel build.
3. As an integration owner with two workers, each worker commits in its own worktree on a local branch; I integrate their commits onto the delivery branch after checking that the remote head is the one I last saw, and I never force-push. No worker opens a remote branch or pull request.
4. As the maintainer, when the build is done the pull request turns ready and the required checks run on that head; a new commit runs them again.
5. As the maintainer, I say "ship it" while a required check is skipped, pending, missing, or failing on the head; `ship` stops and names each check and its state.
6. As the maintainer, I merge; production deploys from `main` with no extra CI run on `main`.
7. As the maintainer, I need a preview for a design review; I ask for one and `build` deploys it explicitly.
8. As a cloud agent (Claude Code or Cursor) opening a starter-based repository, I load its `AGENTS.md`, its Flow skills, and its dependencies from the frozen lockfile without a different methodology.
9. Unspecced change: "build it" for a typo still works on a short descriptive branch with one pull request, under the same draft and ready rules.

## Implementation Decisions

**One owner per rule.**

- `build` owns the lifecycle: the branch convention, creating or reusing the draft pull request, integration, marking it ready, and waiting on the ready head's checks.
- `ship` owns the merge gate.
- `write-agents` Sessions owns worktrees and ownership, and links to `build` for the lifecycle.
- `to-spec` Share the draft and `start` link to these rules instead of restating them.

**Branch and pull request.**

- **Naming:**
  - A spec delivers on `spec/<number>-<slug>`, the spec file's own number and slug.
  - Unspecced work keeps a short descriptive branch.
- **One remote branch and one pull request per spec:**
  - `build` reuses an open pull request for the branch.
  - Otherwise it opens a draft after the first commit.
  - Workers' local branches stay local.

**Ready.** `build` marks the pull request ready once implementation, review, and focused checks are complete: `gh pr ready`, or REST `PATCH pulls/{n}` with `draft: false`. It then waits on the required checks of that head.

**Merge gate (deterministic).** `skills/ship/scripts/required-checks.mjs <owner/repo> <pr>` reads the pull request, the required check contexts, and the check runs and commit statuses for its head SHA, all through `gh api` REST.

- **Required contexts** come from active rulesets and classic branch protection. When neither is active, every check reported on the head is treated as required, and the script says so.
- **Ready** means all of the following:
  - the pull request is not a draft;
  - each required context's latest result on the head is completed with conclusion `success`.
- **Never ready:** `skipped`, `neutral`, `cancelled`, pending, missing, and failing results.
- **Exit codes:** `0` when ready, `1` otherwise. A JSON report names each context and its state.
- **When it runs:** `ship` runs it before merging, and so does `build` before reporting checks green.

**CI.** The same rule applies in every repository's pull request workflows:

- trigger on `opened`, `synchronize`, `reopened`, and `ready_for_review`, plus `edited` for the title check;
- add the job condition `github.event_name != 'pull_request' || !github.event.pull_request.draft`;
- keep tag and `workflow_dispatch` triggers and repository-specific required check names;
- no `main` push runs and no model calls.

GitHub records a skipped job as a check run with conclusion `skipped`, and protection may count it as passing. `ready_for_review` replaces it with a real run on the same head, and the merge gate never counts `skipped`.

**Vercel.** Each project's `vercel.json` sets `"git": { "deploymentEnabled": { "**": false, "main": true } }`. The files are:

- `flow-skills/site/vercel.json` (project root `site`);
- `flow-next/vercel.json`;
- `flow-mono/apps/web/vercel.json` (project root `apps/web`).

Vercel deploys a branch when any matching rule is true, so `main` keeps production. A preview is an explicit `vercel deploy` from the branch, and branch liveness otherwise reports `pushed, no deployment reported`.

**No git hooks.** In the starters:

- remove `simple-git-hooks`, `prepare`, `hooks:pre-commit`, and their configuration;
- remove the unreferenced gitleaks staged-scan scripts;
- have `pnpm setup` remove a previously installed simple-git-hooks hook, so an old clone does not call a missing script.

Ready-PR CI keeps `security:check` (tracked secret-file check and dependency audit). GitHub secret scanning with push protection stays in the governance preset.

**Cloud setup (starters).**

- **Tracked instructions:** a short root `AGENTS.md` (commands, tool order, where product context and skills live) and `CLAUDE.md` importing it.
- **Cursor:** `.cursor/environment.json` with an idempotent `install` from the frozen lockfile, tracked through a `.gitignore` exception.
- **Claude Code cloud:** a `SessionStart` hook in `.claude/settings.json` runs the same install when `CLAUDE_CODE_REMOTE` is `true`.
- **Constraints:** no Docker and no secrets.
- **Skills:** refreshed through `pnpm skills:update` after this spec lands, so the starters pin the same `flow-skills` content.

**Exposure:** no deployed behaviour changes. Production deployment from `main` is preserved; only automatic branch previews stop.

## Testing Decisions

Fixture-driven unit tests cover `required-checks.mjs`: success, skipped on a draft, skipped on a ready head, pending, failure, a result for an older SHA, a missing required check, and no active protection. Contract pins in `tests/smoke-contracts.test.mjs` cover the draft and ready wording that `build` and `ship` depend on. Starter changes run `pnpm test:changed` plus lint and types, and a node test covers the stale-hook removal. No model evaluation runs; live evidence comes from this spec's own delivery pull requests, not from extra commits or deployments.

**Acceptance scenario.** The maintainer delivers this spec across the three repositories.

1. "spec it" writes this file on `spec/048-delivery-lifecycle` and opens no implementation. Observable: one commit, status `draft`.
2. "build it" opens one draft pull request in `flow-skills`. Two or more commits are pushed while it is a draft. Observable:
   - the CI and `pr-title` jobs report `skipped` with no runner time;
   - Vercel lists no deployment for the branch.
3. A worker's commit from a separate worktree is integrated by the owner onto the delivery branch. Observable: the commit is on the one pull request, with no extra remote branch or pull request.
4. `required-checks.mjs` runs against the draft head. Observable: exit 1, with each required check `skipped` and the pull request `draft`.
5. The pull request is marked ready. Observable: `validate (ubuntu-latest, 22)` and `pr-title` run on the head, and `required-checks.mjs` exits 0 once they pass.
6. A required check fails on a ready head. Observable: `required-checks.mjs` exits 1 naming it, and `ship` stops. GitHub-side blocking needs the "Flow main" ruleset active; it is `disabled` in all three repositories today, so this step is `unresolved` until the maintainer enables it.
7. A fresh clone of each starter runs `pnpm install && pnpm setup`. Observable: `.git/hooks` holds samples only and a commit runs no hook.
8. "ship it" merges each pull request. Observable:
   - no CI run on `main`;
   - the Vercel production deployment for the merge commit is ready and liveness reports `live`.
9. The starters' `skills-lock.json` `flow-skills` hashes match `flow-skills` `main` after the refresh.
10. A Claude Code cloud session and a Cursor cloud agent open a starter. Observable: each loads `AGENTS.md` and the Flow skills, and installs from the lockfile. This is `unresolved` while model usage is rate limited; the configuration is checked statically.

## Direction changes

- **`skills/start/SKILL.md`:**
  - Old position: "pre-commit keeps only the staged-secret guard".
  - New position: no git hooks; the guard runs in ready-PR CI.

## Out of Scope

- Flow Factory, a coordinator, or a custom MCP server.
- Another workflow system.
- CI-based model evaluation.
- Re-enabling the disabled "Flow main" rulesets; this is the maintainer's call while hosts are rate limited.
- Repositories outside the three named, including `gaboesquivel.com`, which requires the `Vercel` check and would need its own change before disabling branch deployments.

## Further Notes

Before and after counts and the delivery report go in the pull request bodies. Cost or build savings are "not yet measured" until a comparable window has passed after merge.
