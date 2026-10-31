# Decision records

Significant product, design, architecture, infrastructure, or process choices live here as numbered **decision records**. Routine implementation choices do not need a record.

| Record | Status | Topic |
| --- | --- | --- |
| [0001-curated-distribution.md](0001-curated-distribution.md) | Superseded (maintenance/install details) | Initial curated distribution shape |
| [0002-local-skill-ownership.md](0002-local-skill-ownership.md) | Accepted (install path superseded by 0004) | Local source and composition policy |
| [0003-skill-naming.md](0003-skill-naming.md) | Superseded by 0004 | Twenty-five-skill catalog (historical) |
| [0004-portable-skill-catalog.md](0004-portable-skill-catalog.md) | Accepted (parts superseded by 0006, 0013, and 0019) | Portable catalog and Agent Skills install |
| [0005-misc-tldr-skill.md](0005-misc-tldr-skill.md) | Accepted | Misc group and `tldr` visual recap skill |
| [0006-flow-lite-and-flat-docs.md](0006-flow-lite-and-flat-docs.md) | Accepted (invocation split superseded by 0019) | Flow Lite `flow` skill and flat specs/decisions docs |
| [0007-flow-product-identity.md](0007-flow-product-identity.md) | Accepted (amended by 0049) | Official Flow identity in PRODUCT.md |
| [0008-leading-words-and-visual-summaries.md](0008-leading-words-and-visual-summaries.md) | Accepted (leading words redefined by 0019) | Leading words in the catalog; visual summaries stay in `tldr` |
| [0009-adopter-product-context.md](0009-adopter-product-context.md) | Accepted | Adopter `PRODUCT.md` is that product; no `flow start` |
| [0010-optional-start-skill.md](0010-optional-start-skill.md) | Accepted | Optional `start` skill authorized (shipped on catalog PR); does not supersede 0009 |
| [0011-homepage-and-genui-playground.md](0011-homepage-and-genui-playground.md) | Accepted | `/` replaceable homepage; `/genui` public GenUI playground (dogfood baseline) |
| [0012-start-bootstrap-lib.md](0012-start-bootstrap-lib.md) | Accepted | `start` bootstrap helpers under `skills/start/lib/` with executable tests |
| [0013-restore-engineering-skills.md](0013-restore-engineering-skills.md) | Accepted (`handoff` added by 0014; `simplify`, `security`, `performance` retired by 0019) | Restore `council`, `ship`, `prototype`, `simplify`, `security`, `performance`, and `debug` |
| [0014-handoff-skill.md](0014-handoff-skill.md) | Accepted | Explicit `handoff` skill for a fresh agent |
| [0015-tasks-and-domain-modeling.md](0015-tasks-and-domain-modeling.md) | Accepted | `to-tasks` rename; restore `domain-modeling` for glossary practice |
| [0016-start-in-place.md](0016-start-in-place.md) | Accepted | `start` bootstraps at a root holding only agent setup and infers the template |
| [0017-claude-code-skill-coexistence.md](0017-claude-code-skill-coexistence.md) | Accepted (`simplify` retired by 0019) | Coexist with Claude Code built-ins; keep `simplify` name and document overlaps |
| [0018-interview-extracts-intent.md](0018-interview-extracts-intent.md) | Accepted | `interview` extracts the user's intent (adapted from `interview-me`), not customer discovery |
| [0019-voice-first-invocation.md](0019-voice-first-invocation.md) | Accepted (amended by 0028, 0048) | Talking is the interface: model-invocable skills, spoken leading words, host coexistence |
| [0020-flow-mode.md](0020-flow-mode.md) | Accepted (amended by 0030) | Flow mode: project instruction block, `to-tasks` hand-off, `ship` task-set orchestration, local and pull-request delivery modes |
| [0021-autonomous-explore-and-ship.md](0021-autonomous-explore-and-ship.md) | Accepted (amended by 0028) | Explore and ship create docs files and GitHub issues, group pull requests, and suggest the host's autonomous mode |
| [0022-start-runs-explore.md](0022-start-runs-explore.md) | Accepted (amended by 0039, 0044) | Speakable `start` runs `explore` beside the bootstrap; spec 001 full, later slices as candidates |
| [0023-agent-first.md](0023-agent-first.md) | Accepted (amended by 0049) | Agent-first, API-first becomes an official principle; explore and to-spec apply it |
| [0024-gated-hand-offs.md](0024-gated-hand-offs.md) | Accepted (amended by 0028, 0029) | Named hand-offs; explicit yes before spec writes, task publishing, and merging or pushing `main`; `start` explores at Lite (depth amended by 0026) |
| [0025-wave-checkpoints.md](0025-wave-checkpoints.md) | Accepted (amended by 0028, 0029, 0031, 0042) | `ship` runs task sets in waves with a draft pull request, preview checkpoints, and a `Deploy:` target |
| [0026-process-depth.md](0026-process-depth.md) | Accepted (amended by 0029, 0030; superseded in part by 0036) | Lite or Full process recorded in the Flow block; `start` is Flow setup plus bootstrap; spec–decision boundary; "Flow Lite" label retired |
| [0027-progress-board-skill.md](0027-progress-board-skill.md) | Accepted (amended by 0029, 0044) | Read-only `board` skill derived from git, with a `ship` run overlay |
| [0028-build-and-ship.md](0028-build-and-ship.md) | Accepted (amended by 0029, 0030, 0032, 0042, 0044) | `build` opens a pull request with green checks; `ship` lands accepted specs and hotfixes with no confirmation; spec acceptance; `Deploy:` retired |
| [0029-spec-issues.md](0029-spec-issues.md) | Accepted (amended by 0030, 0031, 0032, 0034, 0035, 0042, 0044; spec-issue rules superseded by 0044) | One issue per spec with tasks as sub-issues and one pull request; the spec file is the source of truth; frontier builds, one review per spec, automatic merge, tests that never sleep |
| [0030-asked-delivery-and-local-mode.md](0030-asked-delivery-and-local-mode.md) | Accepted (amended by 0032, 0036, 0037, 0039, 0044) | Depth and delivery asked together once; local mode keeps the spec branch, needs no remote, pushes only on request; clean task worktrees removed on integration (local landing and push changed by 0032) |
| [0031-fan-out-by-default.md](0031-fan-out-by-default.md) | Accepted (amended by 0042, 0043, 0044, 0053) | Skills run independent steps as parallel workers by default; per-axis spec review; tasks declare an area |
| [0032-local-build-lands-ship-verifies.md](0032-local-build-lands-ship-verifies.md) | Accepted (amended by 0033, 0034, 0040, 0044) | Local `build` reviews and merges into local `main`; `ship` publishes, then verifies the shipped commit's deployment with the spec's acceptance scenario; specs require one; discovery depth and delivery asked as independent questions (verification changed by 0040) |
| [0033-shared-files-and-reviewed-head.md](0033-shared-files-and-reviewed-head.md) | Superseded by 0044 | Shared-file appends are committed on the spec branch and do not move the reviewed head |
| [0034-no-ceremony-without-a-spec.md](0034-no-ceremony-without-a-spec.md) | Accepted (amended by 0039, 0044) | Unspecced work gets the local suite and one self-check, no spec gate or review workers; `build` owns the size guard |
| [0035-spec-issue-on-acceptance.md](0035-spec-issue-on-acceptance.md) | Superseded by 0044 | "Spec it" publishes nothing; the spec issue opens at "accept the spec", or early on "share the draft" |
| [0036-one-explore-depth.md](0036-one-explore-depth.md) | Accepted (amended by 0044) | One `explore` depth with a pre-mortem; `competitors` and `jtbd` on request; setup asks only for delivery |
| [0037-git-for-delivery-github-for-github-mode.md](0037-git-for-delivery-github-for-github-mode.md) | Accepted (amended by 0044) | Thinking skills need nothing, the delivery chain needs Git, GitHub mode needs GitHub; no repository offers `git init`; `Delivery: github` or `local` |
| [0038-direction-changes-are-confirmed-and-recorded.md](0038-direction-changes-are-confirmed-and-recorded.md) | Accepted (amended by 0044, 0052) | A goal that contradicts an accepted decision, spec, or `PRODUCT.md` fact stops for a yes; new record on the yes, back-pointers on Status lines at acceptance |
| [0039-build-never-requires-a-spec.md](0039-build-never-requires-a-spec.md) | Accepted (amended by 0042, 0044) | The size guard escalates review instead of stopping; specs only on request; "build it" after `explore` builds the brief; "build it local" on a protected repository stops at a branch commit |
| [0040-ship-verifies-liveness.md](0040-ship-verifies-liveness.md) | Accepted (amended by 0044, 0048) | `ship` verifies only that the shipped commit's checks are green and its deployment answers; no scenario, browser, or preview run |
| [0041-align-skill.md](0041-align-skill.md) | Accepted | Read-only `align` skill checks the product against its vision, problems, metrics, and roadmap |
| [0042-outcome-build-and-ship.md](0042-outcome-build-and-ship.md) | Accepted (amended by 0044) | `build` and `ship` state outcomes, reasons, and proofs; workers, scheduling, and test order are choices |
| [0043-workers-when-they-pay.md](0043-workers-when-they-pay.md) | Accepted (amended by 0044, 0053) | Workers only where they pay; one green run per head; re-review covers the fix |
| [0044-fast-delivery.md](0044-fast-delivery.md) | Accepted (amended by 0048, 0052, 0053) | Checks once at PR time, review when it pays; one delivery shape, inferred mode, no spec issue, parallel by default, zero lost work, shipped means deployed |
| [0045-templates-pin-flow-skills.md](0045-templates-pin-flow-skills.md) | Accepted | Template skills locks pin flow-skills; Flow owns workflow, overlapping third-party workflow skills dropped |
| [0046-measurement-assistance.md](0046-measurement-assistance.md) | Accepted | Read-only `measure` skill; measurement defined in `explore`, made actionable in `to-spec`; assistance, not analytics or a ship gate |
| [0047-trusted-review-and-local-record-checks.md](0047-trusted-review-and-local-record-checks.md) | Accepted | `context-review` runs base-commit code with the head as data; API outages do not block; record index checks move to `pnpm validate`; the `alignment` job is removed |
| [0048-delivery-phrases-are-approvals.md](0048-delivery-phrases-are-approvals.md) | Accepted | "Push it", "build it", and "ship it" are approvals with narrow triggers; build reviews, checks, and verifies the branch; light liveness at every depth |
| [0049-agent-does-the-work.md](0049-agent-does-the-work.md) | Accepted | The agent does the work: CLI, MCP, API, then browser; hands the user only sign-in, secrets, payment, consent, or permission changes, once |
| [0050-github-governance-preset.md](0050-github-governance-preset.md) | Accepted | One GitHub governance preset: protected default branch, squash only, required checks, no bypass; `start` applies it |
| [0051-design-skill.md](0051-design-skill.md) | Accepted | `design` compares rendered visual directions, the user chooses, and `DESIGN.md` records the approved one |
| [0052-git-first-coordination.md](0052-git-first-coordination.md) | Accepted | Git-first independent-session ownership, worktree boundaries and best-effort discovery |
| [0053-delivery-appetite-and-scope.md](0053-delivery-appetite-and-scope.md) | Accepted | Bounded delivery appetite, scope protection and economical parallelism |

## Rules

- **Accepted** records are historical evidence: the body never changes. Only the Status line and index row gain `Superseded by`, `Superseded in part by`, or `Amended by` pointers, added when the superseding spec is accepted ([0038](0038-direction-changes-are-confirmed-and-recorded.md)).
- Superseding or amending a decision creates a new record linked to the previous one (`supersedes` / `superseded_by`, or `Supersedes` / `Amends` on its Status line).
- `PRODUCT.md`, `DESIGN.md`, and `ARCHITECTURE.md` reflect the **current** accepted position.
- Legacy `docs/adr/` or `docs/pdr/` folders, if present, are historical unless the project migrates them explicitly.

## Filename

`NNNN-short-slug.md` — four-digit sequence, kebab-case slug.

## Template

```markdown
---
status: proposed | accepted | superseded | rejected
category: product | design | architecture | infrastructure | process
date: YYYY-MM-DD
supersedes:
superseded_by:
---

# Title

## Context

## Decision

## Rationale

## Alternatives

## Consequences
```
