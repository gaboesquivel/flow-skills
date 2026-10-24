# Shared domain language for Flow

Reviewed 2026-10-20. The user adopted a focused glossary and terminology maintenance as manual practice and a responsibility of future Flow skills. Skill packaging remains open.

## Sources and assessment

- [Matt Pocock — domain-modeling](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md): distinguishes consuming vocabulary from actively refining concepts, examines concrete scenarios and implementation conflicts, and captures resolved meanings. Supports terminology maintenance during ordinary work.
- [Matt Pocock — GLOSSARY-FORMAT](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/GLOSSARY-FORMAT.md): favors short project-specific definitions and explicit naming choices, excluding generic programming concepts. Supports a small root glossary here.
- [Matt Pocock — grill-with-docs](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md): composes interviewing and domain modeling. Supports considering composition rather than assuming every practice needs a standalone command.
- [Eric Evans — DDD Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf), Ubiquitous Language, printed page 3: connects shared language to the domain model and its use in communication and implementation. A glossary supports this discipline; maintaining a word list alone does not establish domain-driven design.

Pocock's files were inspected on the live main branch, without a pinned revision or execution benchmark. Evans is the primary conceptual reference for DDD; the reviewed Pocock files are a practical agent-workflow adaptation, not evidence of his complete views on DDD. No upstream skill was installed or executed.

## Application and boundaries

Flow's domain is the practice it supports: product exploration, intentional work, learning, and supporting skills. Agentic product engineering belongs because its meaning determines the role Flow serves; idea and initiative belong because confusing them changes scope and commitment. Generic definitions of agents, APIs, RAG, or DDD do not belong merely because they appear in discussion.

Use one glossary for the current shared vocabulary. Do not infer bounded contexts from documentation folders or introduce aggregates, repositories, context maps, or other architecture patterns without a product need. This adopts shared language and concept refinement, not a complete architecture prescription.

## Documentation reconciliation

- Created root [GLOSSARY.md](../../GLOSSARY.md); preserved the archived glossary unchanged. Its older distinction between Flow and Flow Skills and its design-decision convention remain historical, not automatically restored.
- Moved idea/initiative meanings from the documentation guide into the glossary; the guide retains ownership and relationship rules.
- Moved the role definitions out of website planning. The [role assessment](2026-10-20-agentic-product-engineering.md) retains the fuller framing and the website retains presentation choices.
- Updated the [context idea](../ideas/context-and-evaluation.md) from an unresolved glossary proposal to adopted practice, and linked the [development initiative](../initiatives/methodology-and-skills.md). Design-decision placement, alignment mechanisms, and evaluation proposals remain preserved with their existing status.

The [methodology](../methodology.md#maintain-shared-language) owns current practice. No research or idea was rejected by this consolidation, and no skill implementation was authorized by it.
