---
status: accepted
category: product
date: 2026-10-27
supersedes:
superseded_by:
---

# 0010. Optional `start` skill authorized

## Context

[0009-adopter-product-context.md](0009-adopter-product-context.md) (accepted, immutable) states that an adopter's `PRODUCT.md` is that product's identity, that `flow` is not project initialization, and that this repository must not ship `flow start` or adopter instruction-file edits **in that change**. The same record left **unresolved** whether a later, explicit, optional start skill should exist.

The Flow ecosystem alignment interview (decisions 02–33) and [spec 005](../specs/005-flow-templates-interop.md) require a way for adopters to choose `flow-next` or `flow-mono`, initialize a project, and create product-specific root docs **without** copying Flow's methodology identity or mandating a Flow pipeline.

## Decision

- **Authorize** a future, **optional**, **manually invoked** skill named **`start`** in flow-skills (not `flow start` as a leading word or discoverable alias for Flow Lite).
- The skill **may** help select `flow-next` or `flow-mono`, initialize from the chosen template, handle naming and Git initialization as appropriate, and create project-specific `PRODUCT.md`, `DESIGN.md`, `ARCHITECTURE.md`, and `GLOSSARY.md` for **that** product.
- The skill **must not** copy Flow's product identity into adopter documentation; **must not** edit adopter `AGENTS.md` or equivalent; **must not** introduce a mandatory Flow runtime or implicit orchestration; **must** remain agent- and UI-agnostic.
- **Shipping** the skill is a **separate increment** (catalog growth to fifteen skills, tests, and docs). This decision does not add the skill by itself.
- Until `start` ships, `flow`, `implement`, and `review` continue to **refuse** unauthorized scaffolding. Discoverable `flow` remains alignment only.

## Rationale

GitHub **Use this template** remains valid without the skill. A dedicated optional skill reduces mistaken "start project" invocations of Flow Lite and documents the approved initializer behavior in one place, consistent with [0009](0009-adopter-product-context.md)'s product-context rules.

## Alternatives

- Leave initialization entirely to GitHub templates and adopter work (status quo before skill ships).
- Bundle initialization into Flow Lite (`flow`) — rejected; conflates alignment with scaffolding.

## Consequences

- Update [PRODUCT.md](../../PRODUCT.md), [GLOSSARY.md](../../GLOSSARY.md), [agent-compatibility.md](../agent-compatibility.md), and boundary text in `flow`, `implement`, and `review` skills to reference this decision instead of an "open" initializer question.
- [0009](0009-adopter-product-context.md) is **not** edited and **not** superseded; this record **resolves** its unresolved paragraph only.
- Validator skill count stays **fourteen** until the `start` skill directory exists.
- **Update (2026-10-27):** `skills/start/` ships on `main`; the validator expects **fifteen** skills including optional `start`.
