# 0068 — The experience skill and the new-skill test

Status: **Accepted** (2026-11-04). Spec: [068](../specs/068-experience-judgment.md). Builds on [0062](0062-claude-code-first.md) and [0067](0067-flow-boundaries.md).

## Context

Flow verifies correctness (`review`) and liveness (`ship`), and judges fit and metrics (`product`). Nothing observes a running product the way its user meets it. `review` reads diffs, `design` proposes looks, and `build` only says to verify UI in the running app. Catalog growth needs a record ([PRODUCT.md](../../PRODUCT.md)).

## Decision

1. **Add `experience`.** Optional and read-only: it walks a user journey through a running product with host-native tools and reports observed friction with reproduction steps, impact, and confidence. It is not a lifecycle stage and no skill requires it.
2. **Ownership.** `design` proposes and records visual direction; `experience` observes the real journey; `review` verifies the change against accepted intent and flags material defects in a diff; `product` judges outcomes and direction; `ship` owns delivery and liveness.
3. **Leading words.** "Walk the experience" (`experience`), "did it land" (`product`), "work backwards" (`explore`). "Map the problem" and "show me why" are not registered.
4. **A new skill must pass six questions:** a distinct recognizable job; expertise beyond ordinary reasoning; useful evidence, output, or decision; an existing skill that is insufficient; optional and proportional; benefit worth its instruction and maintenance cost. Otherwise improve an existing skill or document the principle.
5. **Not added as skills:** `land-it`, `agentic-inquiry`, `taste-lab`, `fresh-eyes`, `state-space`, `prove-the-boundary`, `build-the-factory`, `architecture-scout`. Their ideas live as practices inside `explore`, `to-spec`, `design`, `review`, and `product`.

## Alternatives

- **Fold the walk into `review`.** Rejected: review is bound to a diff and a head; a journey walk needs no change and no head, and would double review's cost on every build.
- **Fold it into `design`.** Rejected: design proposes and records; it also cannot stay read-only.
- **Fold it into `product`.** Rejected: product reads documents, code, and metrics, and never uses the product.
- **Do nothing.** Cost: experiential defects surface only when a person happens to look.

## Consequences

- One more skill (about 400 words) in the catalog, with adapter metadata and an eval scenario.
- No dependency, recording tool, or gate. Without a browser it reports the limit and what it could still establish.
