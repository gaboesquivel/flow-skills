# PDR 0001 — One refinement entry with distinct focuses

Status: accepted  
Date: 2026-10-18

## Context

Flow needs deliberate product, design, and architecture discussion while remaining lean. Broad refinement can jump from product intent to technology selection prematurely; separate mandatory skills can create repetitive interviews and rigid handoffs.

## Decision

Use one refinement entry with product, design, and architecture focuses and distinct owning documents. Select the starting focus from existing context or the user's explicit request. Start with product when direction is unclear, and move between focuses as dependencies or evidence require.

Stop when enough uncertainty is resolved for the next useful action. Refine explores and resolves choices; Specify captures the agreed scope and acceptance criteria for an increment. Exact command syntax and internal packaging remain open.

## Alternatives considered

- One undifferentiated refinement interview: small interface, but weak control over question focus and artifact ownership.
- Three mandatory sequential refinement skills: explicit separation, but unnecessary ceremony and delayed feasibility feedback.
- One entry with focused guidance: preserves separation while allowing flexible entry and iteration. Selected.

## Consequences

The earlier separate Explore-stage proposal is replaced by exploration within refinement. The total skill count is not fixed. Product direction, design specifications, and architecture specifications remain separately maintained; consequential findings can require updates across documents.

Significant decisions retain rationale records. Routine clarification does not require a PDR or ADR, and refinement does not require all documents to be complete.

## Acceptance and evidence

The user authorized documenting the preceding recommendation and updating the project documents on 2026-10-18. This records that direction, not implementation completion.

- [Research and sources](../research/2026-10-18-focused-refinement.md)
- [Product](../../PRODUCT.md)
- [Design](../../DESIGN.md)
- [Architecture](../../ARCHITECTURE.md)
- [Workflow](../workflow.md)
