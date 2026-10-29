# 033: Template fast start

**Status:** implemented (2026-10-29)

**Repositories:** [flow-next](https://github.com/gaboesquivel/flow-next), [flow-mono](https://github.com/gaboesquivel/flow-mono), flow-skills

**Decision:** [0045](../decisions/0045-templates-pin-flow-skills.md) (Accepted)

## Problem Statement

A developer who clones flow-next or flow-mono to start a product cannot get from clone to a green Vercel production deployment without manual fixes. Checked on fresh clones of both `main` branches (2026-10-29):

- **Template skills unreadable.** Every `.agents/skills/<name>` entry is a symlink to itself, because the `skills` CLI runs inside `.agents/` and vendors into `.agents/.agents/skills/`; no agent can open any template skill. `pnpm setup` also refetches every skill from upstream, dirtying a fresh clone's lock.
- **No Flow in the clone.** `.agents/skills-lock.json` has no flow-skills, so `/start` is missing until flow-skills is installed separately.
- **Conflicting workflow skills.** The lock ships `domain-modeling` and `prototype` under the same names as Flow skills, plus `diagnosing-bugs`, `research`, `tdd`, and `test-driven-development`, which overlap `debug`, `explore`, and each other.
- **flow-next setup crashes.** `tooling/setup/setup.mjs` calls `copyFileSync` without importing it, so `pnpm setup` throws on any clone without `.env.local`.
- **flow-mono setup does not install.** It prints "Run pnpm install" instead of installing, and expects an `apps/web/.env.example` that does not exist.
- **flow-mono Neon deploys fail.** `apps/web/scripts/vercel-build.mjs` runs `pnpm db:migrate` when `DATABASE_URL` is set, and no package defines `db:migrate`.
- **`start` refuses a template clone.** It stops on a destination with Git commits, which every clone and every GitHub "Use this template" repository has.
- **CI repeats work.** flow-next CI builds the MCP App twice (`pnpm test`, then `pnpm build`); `eval:offline` runs as its own step beside `qa`.

## Solution

Clone either template (or create a repository from it), run `/start`, and reach a green production deployment in under 5 minutes of machine time, with minimal configuration.

1. `pnpm setup` on a fresh clone installs dependencies and the skills lock (now including Flow), writes `.env.local`, and finishes without edits.
2. `/start` in that clone defines the product with `explore`, renames identity in place, and commits `chore: initialize <slug>` on top of the template history.
3. `pnpm dev` serves the app locally; `pnpm build` passes with no secrets set.
4. Importing the repository in Vercel (Git integration) needs no settings beyond the defaults Vercel detects, and the first production deployment is green. Neon stays optional (`FLOW_PRESET=neon`).

## User Stories

1. As a developer, I clone flow-next, run `pnpm setup`, and get a working local app and the Flow skills without editing any file.
2. As a developer, I run `/start` in my clone of a template and get a renamed, committed project instead of a refusal.
3. As a developer, I import the repository in Vercel and the first production build succeeds with no environment variables set.
4. As a developer who chose Neon, the deployment migrates the database instead of failing on a missing script.
5. As an agent, I see one skill per workflow job, so `/domain-modeling`, `/prototype`, and debugging resolve to Flow.

## Implementation Decisions

- **Skills layout.** Run the `skills` CLI from the repository root (`pnpm dlx skills@1.7.4`), so the lock is the root `skills-lock.json`, skills are committed under `.agents/skills/`, and Claude Code reads them through `.claude/skills/` links. Drop the `.agents/` package and its install; `pnpm setup` restores skills only when `.agents/skills/` is missing.
- **Skills lock** ([0045](../decisions/0045-templates-pin-flow-skills.md)). Both locks add the Flow catalog from `gaboesquivel/flow-skills` and drop `domain-modeling`, `prototype`, `diagnosing-bugs`, `research`, and one of the two TDD skills (keep `test-driven-development`). Regenerate with `pnpm skills:update`; the committed tree matches the lock.
- **Setup parity.** Both `tooling/setup/setup.mjs` install root dependencies when `node_modules` is missing, create every `.env.local` they need from an example or empty, and fail with a clear message only for Node < 24 or a missing pnpm. Fix flow-next's missing `copyFileSync` import.
- **Builds without secrets.** `pnpm build` passes with `.env.local` empty; AI routes read keys at request time and answer with an actionable error when none are configured. On Vercel, AI Gateway uses the project's OIDC token, so no key is required for the deployment to be green.
- **flow-mono migrations.** `vercel-build.mjs` runs the migration script that exists (add `db:migrate` to the package that owns Drizzle, or call `drizzle-kit migrate` directly); without `DATABASE_URL` it skips, as now.
- **Vercel defaults.** flow-next deploys from the repository root with its `vercel.json`. flow-mono keeps `apps/web` as the Vercel root directory, which Vercel's monorepo import detects; README states it in one line. No other project setting is required.
- **CI once per head.** One job: install, `security:check`, `qa`, `eval:offline`, `build`, with each artifact built once (the MCP App bundle built by `test` is reused by `build`, or `build` skips it when present). No step duplicates another. Vercel's Git integration builds previews; CI keeps `build` because the template must stay green without Vercel.
- **`start` in a template clone** (flow-skills). When the destination is a checkout of flow-next or flow-mono with a clean tree (template package name and files present), `start` treats it as the destination: rename in place, run setup, commit on top of the template history, and remove an `origin` that points at the template (never rewrite history). The existing copy path stays for other destinations. `start` no longer installs or forbids flow-skills; it keeps whatever the template lock installed.
- **Preserved.** Agent-first features, MCP and MCP App, Eve, GenUI, the Operator surface, and the security checks and pre-commit hooks keep their current behavior.

**Exposure:** Each template deploys publicly on Vercel. Agent and Operator write paths keep their current authentication and fail closed when `OPERATOR_SECRET` or provider credentials are unset on a deployment; this spec adds no new route or write path.

## Testing Decisions

- Template unit tests (`pnpm qa`) and the existing setup preset test (`tooling/setup/data-preset.test.mjs`) cover setup behavior; add a test for the missing-`.env.local` path in flow-next and for the migration call in flow-mono.
- `start`'s existing `lib/` tests cover destination assessment; add a case for a clean template checkout.
- A skills-lock check in each template's `qa` fails when the lock lists two skills with the same name or a dropped overlapping skill.

**Acceptance scenario.** Actor: a developer with Node 24, pnpm, `gh`, and a Vercel account linked to GitHub. Starting state: no local copy, no Vercel project. Timings recorded per template.

1. `gh repo create <me>/acme-notes --private --template gaboesquivel/flow-next --clone` → a local repository with the template history.
2. `pnpm setup` → exits 0; `.env.local` exists; `.agents/skills/` contains `start`, `explore`, `ship`, and no `prototype` or `domain-modeling` from another source. Record the time.
3. `/start` "a notes app for small teams" → `explore` runs; identity renamed to `acme-notes`; `pnpm qa` passed; one `chore: initialize acme-notes` commit; no remote points at `gaboesquivel/flow-next`; pushed to `<me>/acme-notes`.
4. `pnpm dev` → the home page loads at `https://acme-notes.localhost`.
5. Import `<me>/acme-notes` in Vercel with defaults → the first production deployment is green and the home page answers. Time from step 1 to this point is under 5 minutes of machine time (excluding the person's answers in `explore`).
6. Repeat steps 1–5 with flow-mono (`acme-mono`) → same results; Vercel root directory `apps/web` was auto-detected.
7. Repeat step 2 with `FLOW_PRESET=neon` on one template → Neon provisioned after an explicit yes; the next deployment runs migrations and stays green.

## Direction changes

- `skills/start/SKILL.md` (Dependencies and setup): "do not install flow-skills into the new repository" becomes "the template lock installs Flow; `start` does not install it again" ([0045](../decisions/0045-templates-pin-flow-skills.md)).
- `skills/start/SKILL.md` (Obtain template): "Stop when the destination … already has Git commits" gains an exception for a clean checkout of the template itself.

## Tasks

- [x] Measure baseline clone-to-setup times on fresh clones of both templates.
- [x] flow-next: skills lock, setup fix, single MCP App build in CI.
- [x] flow-mono: skills lock, setup parity, migration script.
- [x] flow-skills: `start` in a template clone; keep the template's Flow install.
- [x] Run the acceptance scenario on both templates and record times.

## Results

Delivered in gaboesquivel/flow-skills#163, gaboesquivel/flow-next#8, and gaboesquivel/flow-mono#5 (2026-10-29). Times on fresh clones of the PR branches, warm pnpm store:

| Step | flow-next | flow-mono |
| --- | --- | --- |
| Baseline `pnpm setup` before the fix | crashed (6s) | 48s, refetched skills, dirty tree, broken skill links |
| clone + `pnpm setup` | 7s | 12s |
| `start` bootstrap in place (installed libs; all four checks passed; `chore: initialize`) | 8s | 10s |
| Vercel install + build commands, local | 30s | 28s |
| Vercel Git deployment, wall (build) | 2m35s (76s) preview; 1m45s (100s) production | 2m04s (74s) preview; 2m55s (73s) production |

Clone to a live deployment is about 3 minutes of machine time, excluding the person's answers during `explore`. Production of merged `main` answers 200 on `/` and `/genui` for both templates.

Not run: steps 1 and 5 against a newly created GitHub repository and Vercel project (creating them was refused by the session's tool permissions), and step 7 (Neon) against real accounts; the preset and migration paths are covered by unit tests only. Fixes found while validating: flow-mono's `.gitignore` dropped Flow's `build` skill, and the preset tests used the template name as a fixture, which failed `start`'s identity scan.

## Out of Scope

- New hosting targets, a deploy skill, or a Vercel CLI deploy path; Git integration stays the only deploy route.
- Changing Eve, GenUI, MCP, or Operator behavior.
- Spec 005's full interoperability contract.
- Pinning a flow-skills release tag for single-skill installs ([029](029-standalone-skill-install.md)).

## Further Notes

- Deliver as one pull request per repository (flow-next, flow-mono, flow-skills), each with its validation results and measured times from the acceptance scenario.
- Baseline timings were not yet measured; the first task records them on fresh clones before any change, so the improvement is visible.
- Assumption: Vercel's monorepo import detects `apps/web` for flow-mono without manual selection. If it does not, add a root `vercel.json` rather than a documented manual step.
- Assumption: the deployed AI routes stay green without provider keys because AI Gateway authenticates with Vercel OIDC.
