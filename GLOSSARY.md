# Flow glossary

Working meanings for Flow's product-engineering practice. Include only project-specific concepts and distinctions that affect decisions; [the methodology](docs/methodology.md#maintain-shared-language) describes how this vocabulary evolves.

## Agentic product engineering

The practice of combining product judgment, design, and software engineering to direct AI agents across discovery, delivery, and learning, with people accountable for decisions, quality, and outcomes. This describes how products are developed; the resulting product need not contain AI agents.

## Agentic Product Engineer

A practitioner who uses product and engineering expertise to decide what is worth building, guide AI agents in building it, and evaluate whether it creates value. Agents can help investigate and challenge direction as well as execute work; the practitioner retains accountability.

## Flow skill

A portable `skills/<name>/SKILL.md` package in the Flow Skills distribution. Skills run only when the user explicitly invokes them; they may read local supporting files and optional linked skills without imposing a mandatory workflow. A practice can exist before a skill supports it, and a practice does not necessarily require its own skill. The [skill catalog](docs/skills.md) groups skills for navigation (delivery, product discovery, writing, misc); groups do not enforce invocation order.

## Decision record

A numbered document under `docs/decisions/` that preserves the context, decision, and rationale for a significant choice. Accepted records are historical evidence; superseding creates a new record. Current product, design, and architecture documents reflect the accepted position today.

## Specification

A numbered document that captures a bounded increment of work. Default path in Flow's own repository: `docs/specs/NNN-short-name.md`. Adopter projects may use their own conventions.

## Idea

A possibility worth preserving: a problem, feature, approach, or question. Recording an idea does not commit to pursuing it.

## Exploration

An activity that opens possibilities through browsing references, comparing approaches, sketching, or trying prototypes. It can begin without a bounded question and may include research.

## Research

An evidence-seeking activity directed at a question. It may happen within exploration or an initiative; its findings can inform ideas and decisions without committing to a direction.

## Intent

What we want to learn or achieve. Intent gives work its purpose; an initiative organizes the work deliberately undertaken to pursue it.

## Initiative

Work deliberately undertaken toward an outcome, with a purpose, boundaries, and a way to assess findings. An initiative can contain multiple experiments and delivery tasks; it is not synonymous with a single assumption test or an idea.

## Validation board

A shared representation of hypotheses, risky assumptions, experiments, evidence, and decisions across iterations. In Flow, its human and agent views represent the same information; it is distinct from a delivery task board.
