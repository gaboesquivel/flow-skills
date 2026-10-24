# Flow Skills

Status: direction established; skill design and implementation remain open.

## Purpose and audience

Flow Skills is an open-source Lean Startup methodology for the agentic era and a collection of skills for solo founders and small technical teams building useful, commercially viable products. It connects discovery, strategy, design, engineering, launch, and learning within a repository that humans and agents share.

## Problem

AI makes it easy to add features faster than founders establish whether they matter. Combining existing skills also leaves founders to reconcile workflows, terminology, and documentation.

Flow helps founders choose worthwhile work, test assumptions, and preserve decision context while retaining control of their workflow. Broader demand for Flow itself remains unvalidated.

## Capabilities

- Collaborative refinement through focused questions, research, and suggested directions, leading to initiatives linked to assumptions and validation approaches.
- Product and commercial discovery connected to experience design and engineering, with room for open exploration and disposable prototypes.
- Guidance for API-first products serving agents and humans, with suitable CLI and MCP interfaces and system observability that informs product decisions from day one.
- A validation board inspired by Lean Startup Machine: hypotheses, risky assumptions, experiments, evidence, and decisions across iterations. A dynamic human view and Markdown for agents should represent the same information.
- Repository-agnostic initialization that inspects existing code and documents, asks about consequential unknowns, and establishes minimal context without imposing a technology stack. The [initialization experiment](docs/initiatives/initialization.md) owns the trial and its limitations.
- Repository context covering current product, design, architecture, and [project-specific language](GLOSSARY.md), supported by research and significant decision rationale. Maintain shared meanings across discussion, documentation, and implementation. Preserve ideas as possibilities and initiatives as intentional work; their [relationships](docs/README.md#ideas-and-initiatives) do not impose a mandatory pipeline.
- A skill for understanding and questioning Flow's methodology and influences.
- Two writing skills: `writing-for-humans` for clear, natural communication and `writing-for-agents` for effective instructions and context. [Scope and open packaging choices](docs/ideas/writing.md).

Skills should be clear, concise, composable, and editable. Reuse existing work where useful; technology-specific skills may remain external. The process must work for a solo founder without requiring a separate process-management system.

## Approach and open choices

### Business context and measurable outcomes

Discovery should connect business intent, customer problems, product decisions, implementation, and evidence of outcomes. Strategic work remains optional and proportionate to the decision; it must not introduce a mandatory business-planning phase.

Reuse known context about customers and buyers, product and delivery model, revenue model, distribution, and maturity. These are overlapping dimensions: a product can be a B2B developer tool delivered as an API with usage-based pricing. Distinguish supported findings, assumptions, and unknowns; company stage alone does not establish the maturity of a particular product or initiative.

Keep durable product and business context in PRODUCT.md. Initiative-specific hypotheses, tests, and findings belong with the initiative or eventual validation-board record. Avoid a separate strategy document or canvas unless use demonstrates a need.

Include **One Metric That Matters (OMTM)** as a way to focus measurement on the most important current product or business uncertainty. Select it from the actual business context and evidence of maturity, and revisit it when the question changes. Supporting diagnostics and guardrails remain useful. Record a product-wide focus here when selected; initiative-specific measurements belong with the initiative. No OMTM has yet been selected for Flow itself.

Candidate complementary approaches include AARRR as a diagnostic lens, an optional North Star metric, and decision-driven market analysis. A North Star expresses enduring customer value; OMTM focuses the current learning or improvement effort. Detailed skill packaging remains open. See [product discovery research](docs/research/2026-10-19-productskills-and-lean.md#business-context-growth-and-skill-boundaries), the [OMTM assessment](docs/research/2026-10-19-productskills-and-lean.md#lean-analytics-and-one-metric-that-matters), and [skill ideas](docs/ideas/business-discovery-and-product-metrics.md).

### Design and implementation

Establish the methodology, evaluate it through use, and implement incrementally. No skills are implemented yet. Apply the [principles](docs/principles.md) through the [methodology](docs/methodology.md).

The [methodology and skill-development initiative](docs/initiatives/methodology-and-skills.md) tracks this work. Use Flow's practices manually on Flow itself, including a focused glossary and active clarification of domain concepts. Future skills should consume the same glossary and maintain it when meanings change; whether domain modeling needs a dedicated skill or composes into other skills remains open.

Still open:

- Skill names, boundaries, composition, supported environments, evaluation, and distribution.
- Whether business discovery belongs within product discovery, how discovery relates to initiative refinement, and whether product metrics warrants a separate specialist skill.
- Initiative format and validation criteria.
- Board format, synchronization of its views, and the need for a separate business canvas.
- Applicable Is Agentic readiness checks and acceptance criteria.
- A separate marketing skill category.
- Which [repository conventions](docs/README.md) become defaults for products using Flow.
