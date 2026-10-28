# 0024 — Gated hand-offs and outward writes

Status: **Accepted** (2026-10-28). Amends [0019](0019-voice-first-invocation.md) (skills matched from a description do not chain), [0021](0021-autonomous-explore-and-ship.md) (one push confirmation per run), and [0022](0022-start-runs-explore.md) (Full depth from `start`). Spec: [013](../specs/013-consolidation.md). Amended by [0028](0028-build-and-ship.md) (no plan confirmation or main gate in ship; spec writes need no yes) and [0029](0029-spec-issues.md) (no explicit yes before publishing task records in pull-request mode).

## Context

0019 made skills speakable on the premise that a skill matched from a description does not chain into others. Specs 009–011 then added hand-offs (`start` → `explore`, `explore` → `to-spec` and `to-tasks`, `to-tasks` → `ship`) and relaxed gates: reaching spec-ready counted as a request to save and publish, and one up-front yes covered every push in a run, including `main`. An adversarial review flagged these as the highest risks once speech is the main interface.

## Decision

- A skill may name the next skill and wait. The only automatic hand-offs are `start` → `explore` and, inside `explore`, its `interview` and `grill` phases. Each runs behind the user's own yes.
- Writing a spec, publishing task records, and merging into or pushing `main` each require an explicit yes to the shown content. A plan yes never authorizes a merge into `main`.
- `ship` keeps one confirmation for the run plan and adds a final gate before merging into or pushing `main`, showing the diff summary, checks, and commit SHA.
- `start` hands off to `explore` at Lite depth unless the user asks for more.

## Rationale

Spoken requests are easy to mishear; outward effects (public issues, `main`) need a yes to concrete content, not to a plan. Naming hand-offs keeps chaining visible and auditable.

## Consequences

- `explore`, `to-spec`, `to-tasks`, `ship`, and `start` change; the catalog and 0019's readers are pointed here.
- Runs ask one or two more questions; autonomous runs still avoid per-command permission prompts.
