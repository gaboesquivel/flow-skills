# 0063 — Decision-record threshold

Status: **Accepted** (2026-11-03). Spec: [060](../specs/060-host-delegation.md).

## Context

flow-skills wrote about 60 decision records in its first 10 days, and several reversed each other within days (0031, 0043, 0053, 0060). Records for cheap, reversible choices add reading cost and back-pointer upkeep without guarding anything.

## Decision

A choice gets a decision record only when it chose among real alternatives **and** is costly to reverse or reaches beyond one spec. Everything else goes in the spec's Decisions section. `to-spec` and AGENTS.md state the test, and reviewers flag records that don't meet it.

## Alternatives

- **Keep the current practice.** Rejected: the churn above.
- **No decision records at all.** Rejected: costly, cross-cutting choices such as 0062 still need a durable home.

## Consequences

Fewer records and fewer back-pointers. Some rationale lives only in specs, which are found by the spec index rather than the decision index.
