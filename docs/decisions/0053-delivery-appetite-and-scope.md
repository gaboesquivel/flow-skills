# 0053 — Delivery appetite and scope protection

Status: **Proposed** (2026-10-31). Spec: [043](../specs/043-defensive-delivery.md). Proposes amending [0044](0044-fast-delivery.md), amendment item 4 (parallel-by-default scheduling), which amended [0043](0043-workers-when-they-pay.md) and [0031](0031-fan-out-by-default.md). Preserves [0048](0048-delivery-phrases-are-approvals.md), protection requirements and issues-on-request.

## Context

The retrospective reports a three-hour target expanding into a full-day effort. Scope changes, ambitious increments and coordination overhead are candidate contributors, not measured causal allocations. Flow needs to defend accepted scope against additions from both the user and the agent without making small changes ceremonial.

## Decision

For substantial work, recover or ask for the delivery appetite, acceptance boundary, first useful increment and non-goals; capture material cost limits when relevant. Ask only consequential missing questions. Keep these constraints in the increment's spec or linked issue, not as permanent product attributes. A time target is not a completion guarantee.

When a proposed addition changes the boundary, recommend defer, replace, reject or explicit expansion and identify the trade-off. Existing authorization stands; only unresolved consequential changes need a user decision. Correctness, security and required delivery checks are not optional scope to discard at the deadline.

Choose parallel work when expected elapsed-time benefit exceeds briefing, startup, collision and integration costs. Independent review remains independent when required. Waves are optional scheduling descriptions, never mandatory approval or test gates. Tasks stay inside specs unless a separate tracking surface is requested.

Use multiple specs for independently useful increments or bets dependent on later learning. Record significant cross-cutting choices here; routine implementation decisions stay in specs. Preserve final-head verification and repository check policy, without mandatory frequent tests or baseline experiments.

## Rationale

Delivery speed depends on selecting a tractable outcome and limiting coordination costs, not simply increasing worker count. Explicit trade-offs protect intent without silently omitting approved requirements.

## Alternatives

- Parallelize every ready task: can reduce latency but pays coordination cost even for trivial work.
- A fixed timebox, interview or worker cap for every change: simple to enforce but poorly matched to different projects.
- A new decision registry or mandatory issue per task: duplicates existing authoritative documents.

## Consequences

Agents must challenge consequential scope expansion and report incomplete work candidly. Small fixes retain a direct path. Budget telemetry may be unavailable and must remain unknown rather than fabricated. Human judgment is still needed for meaningful trade-offs.

Publishing this record does not accept it. Accept with 043, update affected historical status lines/index entries and current owner docs together, and leave other policies unchanged.
