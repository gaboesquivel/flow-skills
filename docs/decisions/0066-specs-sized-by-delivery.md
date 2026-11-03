# 0066 — Specs sized by delivery, not length

Status: **Accepted** (2026-11-03). Spec: [065](../specs/065-intent-sized-specs.md). Amends [0022](0022-start-runs-explore.md) (slice 1 need not test the riskiest assumption or ship instrumentation), [0023](0023-agent-first.md) (contracts are required where agents or other systems depend on a capability, not in every spec), [0060](0060-slice-by-area.md) (item 1: slicing is for work with several outcomes, by outcome first), [0062](0062-claude-code-first.md) (item 3, which restates it), and the length rule of spec [061](../specs/061-slim-specs.md).

## Context

Spec 061 stopped specs growing past 3,000 words with a guideline and a deterministic failure. 0022 required the first slice to test the riskiest assumption. Both served lean discipline, but a word count is a proxy, and a developer who understands their MVP has no use for a forced experiment.

## Decision

1. **Four levels.** Product vision and core journeys (`PRODUCT.md`, may be broad); the first useful release (the outcome that makes it worth using); specs (independently deliverable increments); tasks (executable slices). Only specs and tasks are spec-file content.
2. **`to-spec` decides the split.** Default one. Split only for independent delivery, excessive scope, a consequential dependency, or later investment that should wait on earlier learning. Never for length or task count. A later spec is a `candidate` stub.
3. **Concise, not capped.** No word limit, no length failure. Specs stay short by linking and by leaving implementation to `build`.
4. **What, not how.** Specs name outcomes, constraints, and consequential decisions; components and file layout appear only as established constraints. Contracts stay where agents or other systems depend on a capability.
5. **Tasks follow outcomes.** Dependencies and integration cost set the count; there is no target. `build` slices only work with several outcomes, and parallel work remains the host's call under 0062. Its test is elapsed time saved against briefing, integrating, and reviewing: this deliberately restores the "when it pays" judgment 0060 rejected, because the host, not a Flow rule, now makes the call. Areas no longer need to be coarse.

## Alternatives

- **Raise the limit.** Rejected: any number invites the same wrong split.
- **Warn instead of fail.** Rejected: a warning nobody acts on is noise; review already flags padding.
- **One spec per MVP.** Rejected: it hides what can ship and learn early.
- **A new PRD or roadmap document.** Rejected: `PRODUCT.md` already holds the vision.

## Consequences

- Specs can drift longer; the guard is now judgment and review, not a script. If they do, revisit with evidence.
- `explore`'s stress test stays for new products, and is shorter for a settled vision.
