---
status: accepted
category: product
date: 2026-10-27
supersedes:
superseded_by:
---

# 0011. Replaceable homepage and GenUI playground routes

## Context

[Spec 005](../specs/005-flow-templates-interop.md) PRD-2 describes a Studio-first public website. Before that UX migration ships, flow-next and flow-mono need a stable, shared route contract for manual dogfooding and template adoption.

## Decision

- **`/`** is the **replaceable product homepage** — a minimal stub adopters swap for their own landing page.
- **`/genui`** is the **public GenUI playground** — OpenUI compose, public Assistant context, and public MCP catalog demos.

Both templates implement this pair on `main`. This decision does **not** claim PRD-2 Studio-first compliance; it documents the intentional dogfood baseline.

## Consequences

- Template `docs/INTEROP.md` files describe `/` and `/genui` as implemented routes.
- Future Studio-first work may change `/` without removing `/genui` as the playground entry.
