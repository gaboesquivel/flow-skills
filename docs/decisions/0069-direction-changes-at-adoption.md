# 0069 — Direction changes gate at adoption, not discussion

Status: **Accepted** (2026-11-08). Spec: [069](../specs/069-product-peer-explore.md). Amends [0038](0038-direction-changes-are-confirmed-and-recorded.md) (item 1: when the gate applies) and [0044](0044-fast-delivery.md) (item 6: a request that already authorizes writing an agreed brief needs no second confirmation).

## Context

0038 made `explore` stop at any goal that contradicts an Accepted decision, spec, or `PRODUCT.md` fact. That also stops a peer from examining "what if we merged duplicates automatically?" or running a bounded experiment, though nothing is being adopted. The cost of a wrong adoption sits at acceptance and implementation, where the commitment text changes.

## Decision

1. **Surface in discussion, gate at adoption.** During `explore`, name the existing commitment (file and statement) when it matters and let the hypothetical or bounded experiment proceed. A prototype or implementation discrepancy never creates a product promise.
2. **A draft spec that changes a commitment** states the current statement, the proposed replacement, and the observable consequence, marked as a proposal. It is resolved before the spec is accepted or built, unless the user already chose the new direction with that consequence understood; that authorization is used once.
3. **At adoption** the affected owner document changes through the existing acceptance step. A numbered record is written only where [0063](0063-decision-record-threshold.md) applies; changing an Accepted decision still gets one (0038 item 2).
4. Items 2 and 3 of 0038 are unchanged.

## Alternatives

- **Keep the gate in `explore`.** Rejected: it blocks cheap, reversible learning and makes the peer defend the status quo.
- **Gate nowhere until `build`.** Rejected: acceptance is where the old text is superseded and back-pointers are written.

## Consequences

An agent may discuss and prototype against a commitment without a yes; adopting or shipping the change still needs one. A killed experiment leaves no record.
