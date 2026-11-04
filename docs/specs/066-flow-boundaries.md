# 066 — Flow boundaries

Status: implemented (2026-11-03). Appetite: one session. Decision: [0067](../decisions/0067-flow-boundaries.md). Evidence: [research note](../research/2026-11-03-velocity-with-intent.md).

## Problem

Flow is now a globally installed plugin, yet its documents still read as if a project begins with `start` and a starter. `start` is done only at a green deployment, connects a host, and always runs `explore`, so initialization, discovery, and delivery are one act. `flow` stops and waits when a repository has no product brief, which blocks plain doc alignment in an unrelated project. Nothing states who owns what between the plugin, starters, project scripts, and the host. The methodology also names no defence against the human cost of agent speed: understanding and rationale that erode while checks stay green.

The audit also blamed `start`'s `pnpm qa` gate and starter CI. Measured, neither is a bottleneck ([evidence](../research/2026-11-03-velocity-with-intent.md#audit-check)), so both stay.

## Solution

`start` ends at the initial commit. Discovery runs beside it only when the request describes a product; deployment belongs to delivery. Flow's value stands alone in any repository, and four owners are stated once. Critical thinking is selective, at the points where it pays, not a new phase.

## Decisions

- [0067](../decisions/0067-flow-boundaries.md) amends [0022](../decisions/0022-start-runs-explore.md) and [0051](../decisions/0051-design-skill.md), and changes `PRODUCT.md`'s Time to start metric, which ended at the first green deploy.
- The mission and principles 4 and 5 state velocity with intent, composable skills, what-not-how, and proportional evidence, as the maintainer's brief directed.
- `start` keeps `qa`, the identity scan, the ignore check, staged-secret blocking, and the governance preset.
- No starter change now. Starters pin Flow skills, so they refresh their pin after these specs ship; whether they should vendor Flow at all is a [candidate question](../decisions/0067-flow-boundaries.md#consequences).

## Acceptance

Scenario: a developer with the plugin installed globally.

1. In a template clone they say "start a Next.js project" with no product description. Bootstrap commits, and `start` is done with no deployment wait. Where the guard blocks the default-branch push, it hands over the one command and reports push and governance as pending, and says no deployment is connected. It offers `explore` once.
2. With a product description in the request, `explore` runs alongside and writes only after the initial commit.
3. A failed check or a staged secret still blocks the commit.
4. In an unrelated repository with no `PRODUCT.md` brief and no starter, "update the docs" aligns what exists and names `explore` once, without waiting. `explore`, `to-spec`, `build`, and `review` each work there alone.
5. The methodology states the four owners and `start`'s boundary; `PRODUCT.md` and the catalog link to it and agree. `pnpm validate` and `pnpm test` pass.

## Out of Scope

- Changing the bootstrap's check list or commit gate.
- Starter CI and scripts.
- Skill, hook, or manifest changes for Cursor: the same skills apply.
- A guard exception for the initial push.

## Tasks

- [x] 01: End `start` at the initial commit, and stop `flow` blocking on a missing brief. Area: skills/start, skills/flow, tests/evals.
- [x] 02: State the four owners and selective critical thinking. Area: PRODUCT.md, docs/methodology.md, docs/principles.md, skills/build.
- [x] 03: Record the decision and the audit evidence, and align the catalog and site copy. Area: docs, README.md, site/components/methodology.
