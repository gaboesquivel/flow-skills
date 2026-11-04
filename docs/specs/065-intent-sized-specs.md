# 065 — Intent-sized specs and tasks

Status: implemented (2026-11-03). Appetite: one session. Decision: [0066](../decisions/0066-specs-sized-by-delivery.md).

## Problem

A developer who already sees the whole MVP gets squeezed by rules written against a different failure. `to-spec` says a spec "tests one assumption", caps it near 1,000 words, and `pnpm validate` fails specs from 061 on that exceed that. A word limit measures length, not whether a spec is good, and pushes people to split for the wrong reason. `explore` makes every first spec test the riskiest assumption and ship metric instrumentation, whether or not either is the real uncertainty. `to-tasks` prefers the fewest tasks and coarse areas, which hides independent work inside a shared app. The original concern in spec 061 was real: specs had grown verbose and prescriptive. Concision stays; the arbitrary failure goes.

## Solution

Four levels, only two of them documents: the product vision, the first useful release, specs, and tasks. The vision can be broad while the active work stays bounded. `to-spec` decides by itself whether an initiative is one spec or several and reports why. Specs say what and why, and leave how to `build`. Task count follows outcomes, dependencies, and integration cost; the host decides whether parallel work pays.

## Decisions

- [0066](../decisions/0066-specs-sized-by-delivery.md) amends [0022](../decisions/0022-start-runs-explore.md), [0023](../decisions/0023-agent-first.md), [0060](../decisions/0060-slice-by-area.md) item 1, [0062](../decisions/0062-claude-code-first.md) item 3, and spec [061](061-slim-specs.md)'s length rule. The stale-status check stays.
- OMTM, non-goals, Exposure, and the required acceptance scenario are unchanged. Metric instrumentation is proportional: manual or existing measurement can answer the first question.

## Acceptance

Scenario: a developer with a settled vision for an invoicing product, and a confirmed brief with four core journeys.

1. They say "spec it". `to-spec` names the first useful release, writes the active spec in full, and reports how many specs it chose and why, without asking.
2. The active spec has several independent tasks and stays one spec, because the parts only make sense delivered together. Payments, which should wait on what the beta teaches, is a `candidate` stub with its dependency named.
3. Neither spec names components or file layout, and no metric instrumentation is required when a manual count answers the question.
4. They say "break it down". The tasks follow demonstrable outcomes, with areas fine enough to show independence inside one app.
5. "Build it" runs them. Parallel work is the host's call; a small visual fix with no spec still goes straight through `build`.
6. A spec of 1,300 words passes `pnpm validate`. An `accepted` spec with every task ticked still fails.

Invariants: a draft without an acceptance scenario, or without Exposure when it adds deployable behaviour, stays `draft`. Check: `pnpm test` (`tests/validate.test.mjs`) for step 6.

## Out of Scope

- Rewriting existing specs.
- `start`, root responsibilities, and principles.
- Changing acceptance or status values.

## Tasks

- [x] 01: Teach `to-spec` to size specs by delivery, and drop the length failure. Area: skills/to-spec, scripts, tests.
- [x] 02: Align `explore`, `to-tasks`, and `build`'s Slices. Area: skills/explore, skills/to-tasks, skills/build.
- [x] 03: Record the decision and align the glossary, methodology, and catalog. Area: docs, GLOSSARY.md, README.md.
