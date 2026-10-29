# 0051 — Design skill for visual direction

Status: **Proposed** (2026-10-29). Spec: [039](../specs/039-design-skill.md).

## Context

Flow names design as agent work in the products built with it ([PRODUCT.md](../../PRODUCT.md#experience)) and keeps `DESIGN.md` as a root context file, but no skill owns choosing a visual direction. Adopter apps such as meta-cto (Signal) keep the template's look and a `DESIGN.md` with no identity. Visual choices are made ad hoc during `build`, or outside Flow, and are not recorded where the next agent looks. `prototype` covers in-app visual variants but stops at answering a question; it does not record an identity, and `flow` aligns `DESIGN.md` without choosing what goes in it.

## Decision

Add `design`, a portable, optional skill for Flow-based apps ("design this"): read product and design context, state a short brief, render two to four distinct directions in context, recommend one, let the user choose, and record only the approved direction and its canonical assets in `DESIGN.md` on the work's branch, setting token values in the app's existing theme so record and code agree. Restyling components and pages stays with `build`. Neighbors keep their jobs: `explore` owns product discovery, `prototype` interaction and logic experiments (its UI guidance renders in-app variants for `design`), `build` applies it to components and pages, `review` checks rendered UI against `DESIGN.md`, and `flow` keeps `DESIGN.md` aligned. `start` stays fast: its baseline `DESIGN.md` says no identity is chosen yet, and it names `design` only as an optional step after the first deployment.

## Rationale

Choosing a direction before building is cheaper than reworking surfaces after: rendered alternatives, a human choice, existing tokens respected, one source for shared assets, and old marks retired everywhere. A skill makes them reachable by phrase without a mandatory phase: no skill requires `design`, and work that fits an existing `DESIGN.md` skips it.

## Alternatives

- **Extend `prototype`.** Rejected: a prototype is disposable and answers one question; identity is durable and recorded. Mixing them would blur `prototype`'s throwaway boundary.
- **Fold into `explore`.** Rejected: explore asks in proportion and ends in a product brief; visual exploration needs rendered alternatives and a separate approval.
- **Adopt a third-party design skill (for example Impeccable).** Rejected as a whole: its command catalog and mandatory concept machinery exceed Flow's minimal process ([research](../research/2026-10-19-impeccable.md)); its page-purpose and shared-versus-local principles are already in the [methodology](../methodology.md#design-for-the-purpose).
- **No skill; document the practice only.** Rejected: the practice already existed in the methodology and was not applied until the maintainer ran it by hand.

## Consequences

The catalog grows to 26 skills. Templates pick `design` up on their next `pnpm skills:update` and should drop any third-party skill whose job it duplicates ([0045](0045-templates-pin-flow-skills.md)).
