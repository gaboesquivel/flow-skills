# Flow methodology

Current practices under refinement. The [principles draft](principles.md) guides judgment; this document describes application, not a mandatory sequence.

## Refine an initiative

Combine focused questions, research, suggested directions, and exploration of alternatives. Reuse known context. Establish the intended outcome, consequential assumptions, existing evidence, and how the next test will inform a decision. The agent helps develop the direction as well as clarify it.

Scope the initiative around what needs to be learned or achieved. Tasks inherit that intent and proceed with minimal ceremony; new ideas remain uncommitted unless deliberately brought into scope. Open exploration can precede a formal initiative, as described in the principles.

When commercial context affects the decision, use the known customer, buyer, business model, distribution, and evidence of maturity to guide refinement. Ask only for missing context that matters to the current uncertainty. Strategic capabilities are optional; ordinary implementation tasks inherit the initiative's context.

## Observe and revisit

Use One Metric That Matters (OMTM) when a measurable focus can guide the current product decision. Explain the uncertainty it addresses, define the population, calculation, time window, and data source, and establish a baseline or mark it unknown. Set a justified target and review point with the intended decision response; retain supporting evidence and guardrails. Revisit the choice when the constraint changes, preserving prior results and the reason for changing focus. Early discovery may need qualitative evidence before a useful metric can be selected.

Identify relevant product and system signals while planning the work. Assess the findings against the intended outcome and validation criteria, record limitations, and decide whether to continue, change direction, or stop. Update affected context when a decision changes. The validation-board format remains an open product choice.

Keep implementation correctness and evidence of customer value distinct. A working feature does not establish that it improved the intended outcome. Preserve inconclusive findings and distinguish observations from interpretations; qualitative evidence can be appropriate before meaningful usage data exists. Specific growth frameworks and measurement conventions remain [proposals under assessment](research/2026-10-19-productskills-and-lean.md#business-context-growth-and-skill-boundaries).

## Design for the purpose

Choose design priorities from what people need to do on each page or screen: decide and act, complete a task, understand information, or explore an experience.

Keep shared visual decisions in DESIGN.md and page-specific intent in a small brief when needed. Local changes inherit the established identity; missing documentation does not erase evidence in existing interfaces. These practices are adapted from [Impeccable](research/2026-10-19-impeccable.md).

## Maintain connected context

Keep product intent, experience design, and architecture distinct while allowing findings in one to inform the others. Use the [documentation guide](README.md) for information ownership and [AGENTS.md](../AGENTS.md) for maintenance rules. Source assessments live in [research](research), indexed in [references](references.md).

## Write context for agents and humans

Use progressive disclosure: AGENTS.md routes by task, root documents summarize their own concern, and deeper notes hold detail only when needed. This follows the adopted write-for-agents direction; [source assessment](research/2026-10-19-writing.md#matt-pocock-writing-for-agents) retains the upstream review limits.

Documentation should preserve intent, constraints, consequential boundaries, and information that is difficult or expensive to rediscover. A concise architecture overview can orient an agent without requiring a full codebase read; link to the relevant implementation and deeper rationale. Avoid exhaustive trees, version lists, and descriptions that merely duplicate readily discoverable code. Shared documents must remain readable by humans.

Assess documentation impact during implementation and review. Code establishes observed behavior; accepted documentation establishes intended behavior and constraints. When they diverge, identify which needs correction rather than silently treating either as justification to change the other. Maintain affected documents and implementation together, using existing authorization before asking about a change to established decisions.

## Documentation responsibilities across skills

These responsibilities apply to manual work and the local skill implementations. Maintain the relationships described in the [documentation guide](README.md#ideas-and-initiatives):

| Activity | Documentation responsibility |
|---|---|
| Exploration | Preserve worthwhile possibilities and supporting evidence. |
| Refinement | Establish whether an idea warrants an initiative, or refine work arising directly from a known problem. Link the origin when available. |
| Planning and execution | Maintain scope, experiments, tasks, and findings within the initiative; reuse its intent. |
| Review | Record findings and update affected decisions and current product, design, or architecture context. |

These are responsibilities, not a fixed sequence or a commitment to a separate skill for every activity. Create only the artifacts the work needs.

## Maintain shared language

Use [GLOSSARY.md](../GLOSSARY.md) for the project-specific meanings humans and agents need to share. Apply Domain-Driven Design's shared-language discipline through discussion and concrete examples, informed by [Matt Pocock's domain-modeling approach](research/2026-10-20-domain-language.md). The local domain-modeling skill supports this practice; effectiveness in fresh sessions remains under evaluation.

Add a term when its local meaning or a consequential ambiguity cannot be safely inferred from ordinary usage. Keep definitions short, describe the concept and necessary distinctions, and omit generic technical vocabulary. Implementation details, proposals, and decision rationale stay in their owning documents.

When language is ambiguous, check existing context, propose a precise meaning, and test relevant boundaries with an example. For instance, one initiative can contain several experiments, and saving an idea does not start an initiative. Surface unresolved conflicts rather than silently redefining an established concept. Record a meaning when resolved and update affected current documentation and, when present, skill instructions, code, and tests. Historical research retains its original context.

Use this during normal work rather than as a separate mandatory phase. Loading the glossary does not require editing it, and routine terminology clarification does not require a decision record. Skill composition and evaluation are tracked in the [development initiative](initiatives/methodology-and-skills.md).
