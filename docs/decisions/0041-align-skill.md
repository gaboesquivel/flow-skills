# 0041 — Product alignment skill

Status: **Accepted** (2026-10-28). Grows the catalog under the rule in `PRODUCT.md` that further catalog growth needs its own decision. Related: [0005](0005-misc-tldr-skill.md) (`tldr` session alignment), [0008](0008-leading-words-and-visual-summaries.md) (visual summaries stay in `tldr`), [0009](0009-adopter-product-context.md) (adopter `PRODUCT.md` is that product).

## Context

Flow checks alignment at three scopes already: `tldr` checks a session against its goal, `review` checks a change against its spec, and `flow` keeps root docs current with the code. Nothing steps back to ask whether the product as a whole still serves its vision, users' problems, and success metrics. That question comes up after several shipped specs, when drift and accreted complexity are invisible from inside any one change.

## Decision

Add an `align` skill (Product discovery group, thinking tier). Saying "are we building the right thing" compares the product's intent (`PRODUCT.md`, `DESIGN.md`, accepted specs and decisions, roadmap) with what the code actually implements.

- **Read-only.** It reports; `flow`, `explore`, `to-spec`, or `grill` act on what it finds, only when asked.
- **What and why, not how.** Code quality stays with `review`.
- **Evidence over documents.** Code decides what is implemented; documents decide what was intended; planned work is labelled as planned.
- **Visual and short.** A journey-to-capability map, then working, missing, drift, and complexity, ending in three ranked priorities. No artifact is written.

## Alternatives

- **Extend `review`.** Rejected: review is scoped to a change and its spec, runs per-axis workers, and gates `ship`; a product-wide check would make it heavier and blur its scope.
- **Extend `tldr`.** Rejected: `tldr` summarizes named material or a session; judging the product against its metrics needs reading code and intent, which would change what "tldr" means.
- **Extend `flow`.** Rejected: `flow` edits root docs to match the product; `align` questions whether the product matches the docs, and must stay read-only.

## Consequences

- The catalog grows by one skill: `scripts/validate.mjs`, `docs/skills.md`, `README.md`, and `PRODUCT.md` list `align`.
- `align` needs no Git and writes nothing, so it joins the thinking tier.
