# Flow glossary

Working meanings for Flow's product-engineering practice. Include only project-specific concepts and distinctions that affect decisions; [the methodology](docs/methodology.md#maintain-shared-language) describes how this vocabulary evolves.

## Flow

The lightweight, human-led product engineering methodology defined in this repository's [PRODUCT.md](PRODUCT.md). Distinct from the flow-skills distribution, Flow Factory orchestration, application templates (flow-next, flow-mono), and an adopter project's own product. See [Product context](#product-context).

## Agentic product engineering

The practice of combining product judgment, design, and software engineering to direct AI agents across discovery, delivery, and learning, with people accountable for decisions, quality, and outcomes. This describes how products are developed; the resulting product need not contain AI agents.

## Agentic Product Engineer

A practitioner who uses product and engineering expertise to decide what is worth building, guide AI agents in building it, and evaluate whether it creates value. Agents can help investigate and challenge direction as well as execute work; the practitioner retains accountability.

## Product context

An adopter project's own product identity, normally in that project's `PRODUCT.md`, with design, architecture, and glossary beside it when they earn a file. Flow Lite aligns product context. It does not copy Flow's mission or principles into it. [Decision 0009](docs/decisions/0009-adopter-product-context.md).

## Flow Lite

The [`flow`](skills/flow/SKILL.md) skill: keep the current project's `PRODUCT.md`, `DESIGN.md`, `GLOSSARY.md`, and `ARCHITECTURE.md` aligned with meaningful changes. Not a workflow router and not project initialization. Hosts may surface it when supported; that is not an always-on guarantee. Other Flow skills stay manually invoked.

## Flow skill

A portable `skills/<name>/SKILL.md` package in the Flow Skills distribution. Except Flow Lite (`flow`), skills run only when the user explicitly invokes them. Skills may read local supporting files without imposing a mandatory workflow. The [skill catalog](docs/skills.md) groups skills for navigation; groups do not enforce invocation order.

## Human summary

A visual presentation for a person. Prefer generative UI (GenUI) when the host actually provides it; otherwise Mermaid, tables, and a short statement. The [`tldr`](skills/tldr/SKILL.md) skill owns this, including session recaps and "show me". [`write-humans`](skills/write-humans/SKILL.md) drafts prose. There is no separate `human` skill. [Decision 0008](docs/decisions/0008-leading-words-and-visual-summaries.md).

## Leading word

A compact, familiar concept that recruits existing model associations to guide behavior. Following Matt Pocock's terminology in [writing-for-agents](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md), a leading word anchors both how an agent executes instructions and how it recognizes relevant instructions. Prefer established concepts over invented vocabulary. The [skill catalog](docs/skills.md) records one leading word per Flow skill, and that word appears in the skill. `flow start` is not a leading word and not a skill. A separate optional skill **`start`** may ship later for template initialization ([decision 0010](docs/decisions/0010-optional-start-skill.md)); it is not Flow Lite. Source limits: [writing research](docs/research/2026-10-19-writing.md#matt-pocock-writing-for-agents). [Decision 0008](docs/decisions/0008-leading-words-and-visual-summaries.md).

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
