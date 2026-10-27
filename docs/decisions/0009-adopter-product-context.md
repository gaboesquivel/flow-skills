# 0009. Adopter product context is not Flow's identity

Status: accepted (2026-10-27)

## Context

[0007](0007-flow-product-identity.md) puts Flow's methodology identity in this repository's `PRODUCT.md`. Flow Lite then tells agents to align `PRODUCT.md`. Read together, those instructions can be taken to mean every Flow-shaped project should carry Flow's mission, principles, and tagline.

[0004](0004-portable-skill-catalog.md) and [0006](0006-flow-lite-and-flat-docs.md) also reject a bootstrap installer. There is still no `flow start` skill. Because `flow` is discoverable, a request such as "start project" or `flow start` can be mistaken for permission to scaffold a repository and write Flow's identity into it.

## Decision

- In an adopter project, `PRODUCT.md` is **that project's** product identity. Flow Lite, `implement`, and `review` may update it when the product changes. They must not replace it with Flow's tagline, mission, principles, or strategic chain.
- This repository's `PRODUCT.md` remains the only home for Flow's methodology identity.
- Do not ship `flow start`, a project initializer, or adopter instruction-file edits in this change.

## Unresolved

Whether a later, explicit, optional start skill should exist. Until that choice is made, "start project" is ordinary work in the adopter's repository, not a Flow scaffold.

## Consequences

- Root-context skills name the distinction. The glossary entry **Product context** is the short form.
- Discoverable `flow` is still not an always-on hook. See [agent compatibility](../agent-compatibility.md).

## Supersedes

Clarifies [0007](0007-flow-product-identity.md). It does not move Flow's identity out of this repository's `PRODUCT.md`.
