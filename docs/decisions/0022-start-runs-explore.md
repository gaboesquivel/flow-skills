# 0022 — Start runs explore alongside the bootstrap

Status: **Accepted** (2026-10-28). Amends [0010](0010-optional-start-skill.md) (no discovery during initialization) and [0019](0019-voice-first-invocation.md) (`start` explicit-only). Related: [0020](0020-flow-mode.md), [0023](0023-agent-first.md). Spec: [011](../specs/011-start-with-explore.md). Amended by [0024](0024-gated-hand-offs.md) (`start` explores at Lite depth). Amended by [0039](0039-build-never-requires-a-spec.md). Amended by [0044](0044-fast-delivery.md) (`start` confirms only what the request leaves unclear).

## Context

`start` produces a verified repository but forbids product discovery and must be invoked by name. Founders describe their idea in the same breath as "start a Next.js project", and that context is lost while the bootstrap runs. Dogfooding explore showed that the first slice changes later plans, so specifying every slice up front is waste.

## Decision

- `start` is speakable. Plain requests such as "let's start a Next.js project" load it. Before writing anything it states the template, name, and destination and waits for an explicit yes.
- After the yes, a worker runs the bootstrap while the main session runs `explore` at Full depth on the user's description. Hosts without workers run them in sequence.
- Explore writes only after the bootstrap's initial commit. Its brief replaces the product sections of the baseline `PRODUCT.md`.
- Explore writes spec 001 (the first vertical slice) in full, and later slices as `candidate` stubs. Slice 1 must test the riskiest assumption and ship the main metric's instrumentation.

## Rationale

The bootstrap is mechanical and slow; the conversation is the valuable part and can run beside it. The pre-write confirmation preserves the safety reason 0019 kept `start` explicit. One full slice plus stubs follows the lean practice of keeping one slice ready and the rest as bets.

## Alternatives

- **Keep `start` silent on discovery** (0010 as written). Rejected: loses the founder's context at the moment it is richest.
- **Explore first, then bootstrap.** Rejected as the default: it delays a working repository until the conversation ends. The fallback runs the bootstrap first instead, so the repository exists when explore writes.
- **Full specs for every slice.** Rejected: specs after slice 1 go stale.

## Consequences

- `start`, `explore`, and `to-spec` change; `start`'s safety rules and bootstrap library are unchanged.
- The validator's explicit-only set no longer includes `start`.
- `docs/agent-compatibility.md` and the catalog describe the new behavior.
