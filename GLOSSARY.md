# Flow glossary

Working meanings for Flow's product-engineering practice. Include only project-specific concepts and distinctions that affect decisions; [the methodology](docs/methodology.md#maintain-shared-language) describes how this vocabulary evolves.

## Agentic product engineering

The practice of combining product judgment, design, and software engineering to direct AI agents across discovery, delivery, and learning, with people accountable for decisions, quality, and outcomes. This describes how products are developed; the resulting product need not contain AI agents.

## Agentic Product Engineer

A practitioner who uses product and engineering expertise to decide what is worth building, guide AI agents in building it, and evaluate whether it creates value. Agents can help investigate and challenge direction as well as execute work; the practitioner retains accountability.

## Flow Lite

The [`flow`](skills/flow/SKILL.md) skill: keep `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` aligned with meaningful changes. Not a workflow router. Hosts may surface it when supported; other Flow skills stay manually invoked.

## Flow skill

A portable `skills/<name>/SKILL.md` package in the Flow Skills distribution. Except Flow Lite (`flow`), skills run only when the user explicitly invokes them. Skills may read local supporting files without imposing a mandatory workflow. The [skill catalog](docs/skills.md) groups skills for navigation; groups do not enforce invocation order.

## Decision record

A numbered document under `docs/decisions/` that preserves the context, decision, and rationale for a significant choice. Accepted records are historical evidence; superseding creates a new record. Current product, design, and architecture documents reflect the accepted position today.

## Specification

A numbered document that captures a bounded increment of work. Default path in Flow's own repository: `docs/specs/NNN-short-name.md`. Adopter projects may use their own conventions.

## Exploration

An activity that opens possibilities through browsing references, comparing approaches, sketching, or trying prototypes. It can begin without a bounded question and may include research.

## Research

An evidence-seeking activity directed at a question. It may happen within exploration; its findings can inform specs and decisions without committing to a direction.

## Intent

What we want to learn or achieve. Intent gives work its purpose; a spec or conversation may carry it without a separate tracker.

## Validation board

A shared representation of hypotheses, risky assumptions, experiments, evidence, and decisions across iterations. Flow does not ship a validation-board product; the term describes a possible practice, not a required folder structure.
