# Flow methodology

Current practices. Official identity and the eight principles live in [PRODUCT.md](../PRODUCT.md). The [principles](principles.md) draft elaborates optional themes; this document describes application, not a mandatory sequence or skill pipeline.

## Clarify intent

Combine focused questions, research, suggested directions, and exploration of alternatives. Reuse known context. Establish the intended outcome, consequential assumptions, existing evidence, and how the next test will inform a decision.

When commercial context affects the decision, use the known customer, buyer, business model, distribution, and evidence of maturity to guide refinement. Ask only for missing context that matters to the current uncertainty. Optional product-discovery skills do not block delivery work.

Record bounded increments in `docs/specs/` when durable scope helps; record significant rationale in `docs/decisions/`. Small clear changes may need only conversation and code.

## Observe and revisit

Use One Metric That Matters (OMTM) when a measurable focus can guide the current product decision. Explain the uncertainty it addresses, define the population, calculation, time window, and data source, and establish a baseline or mark it unknown. Set a justified target and review point with the intended decision response; retain supporting evidence and guardrails. Early discovery may need qualitative evidence before a useful metric can be selected.

Identify relevant product and system signals while planning the work. Assess findings against the intended outcome, record limitations, and decide whether to continue, change direction, or stop. Update affected context when a decision changes.

Keep implementation correctness and evidence of customer value distinct. A working feature does not establish that it improved the intended outcome. Specific growth frameworks remain [proposals under assessment](research/2026-10-19-productskills-and-lean.md#business-context-growth-and-skill-boundaries).

## Design for the purpose

Choose design priorities from what people need to do on each page or screen: decide and act, complete a task, understand information, or explore an experience.

Keep shared visual decisions in DESIGN.md and page-specific intent in a small brief when needed. These practices are adapted from [Impeccable](research/2026-10-19-impeccable.md).

## Maintain connected context

Keep product intent, experience design, and architecture distinct while allowing findings in one to inform the others. Use the [documentation guide](README.md) for ownership and [AGENTS.md](../AGENTS.md) for maintenance rules. Source assessments live in [research](research), indexed in [references](references.md).

After meaningful changes, align root documents with [`flow`](../skills/flow/SKILL.md) (Flow Lite) or equivalent manual edits. Implementation work may update owning docs per [implement](../skills/implement/SKILL.md).

## Write context for agents and humans

Use progressive disclosure: short routing in adopter instruction files when the project chooses to have them; root documents summarize their own concern; specs and decisions hold durable detail.

Documentation should preserve intent, constraints, and information that is difficult to rediscover. Avoid exhaustive trees and descriptions that duplicate readily discoverable code. Shared documents must remain readable by humans.

Assess documentation impact during implementation and review. Code establishes observed behavior; accepted documentation establishes intended behavior and constraints. When they diverge, identify which needs correction rather than silently treating either as justification to change the other.

## Documentation responsibilities

These apply to manual work and skill use. They are not a fixed sequence.

| Activity | Documentation responsibility |
|---|---|
| Exploration | Preserve worthwhile possibilities; link evidence when saving artifacts. |
| Planning | Capture bounded scope in a spec when the work warrants it. |
| Execution | Update root context and specs when behavior or accepted intent changes. |
| Review | Record findings and update decisions or root docs when conclusions matter. |

Create only the artifacts the work needs.

## Dogfood

Use this when changing Flow. Apply the skills already in the catalog, in proportion to the work, on a realistic task. Prefer this repository first. Record the run next to the other smoke notes: the task, which skills were actually followed, what happened, and what was not run.

Keep the two kinds of evidence apart:

- **Structural checks** — `pnpm validate`, `pnpm test`, contract tests, and (on pull requests) deterministic alignment in CI. They show that skill text, links, package metadata, and documentation path rules match the catalog.
- **Live agent verification** — a person or agent used a skill in a host. Name the host, the date, and what was observed. A structural pass is not a live run. One agent is not an independent review. Optional LLM context review in CI follows the same [pr-review-contract](pr-review-contract.md) as the `review` skill but is not a substitute for human judgment on consequential changes.

Do not add a dogfood skill, a required pipeline, or a second copy of the product statement for the record.

Latest recorded run: [2026-10-27 start bootstrap](../tests/smoke/2026-10-27-start-bootstrap.md).

## Maintain shared language

Use [GLOSSARY.md](../GLOSSARY.md) for project-specific meanings. Apply discipline through discussion and examples, informed by [domain language research](research/2026-10-20-domain-language.md). When terms or consequential naming choices need active refinement, invoke the [`domain-modeling`](../skills/domain-modeling/SKILL.md) skill explicitly.

Add a term when local meaning or ambiguity cannot be safely inferred. Record a meaning when resolved and update affected documentation and skill instructions when present. Loading the glossary does not require editing it; routine clarification does not require a decision record.
