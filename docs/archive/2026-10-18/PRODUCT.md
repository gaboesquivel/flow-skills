# Flow Skills — Product

Status: working definition; refinement direction accepted on 2026-10-18.

## Confirmed direction

Flow Skills supports Agentic Product Engineering across product exploration, design, engineering, and delivery. It should help people decide what is worth building and keep that intent connected to implementation.

The intended audience is solo developers, small technical teams, startup founders, and people running internal organizational experiments.

The user wants:

- A lean, clean, efficient process with professional rigor.
- Addy-inspired formality and verification, Matt-inspired composability and worktree safety, and lightweight product discovery inspired by Teresa Torres and ProductSkills.
- Product and design thinking before engineering commitments.
- Shared conventions that keep PRODUCT.md, DESIGN.md, and ARCHITECTURE.md current as relevant decisions change.
- To build Flow Skills using the process itself, initially with human prompts, persistent documentation, and available tools.

These are design inputs and user preferences, not validated market research.

## Intended outcome

A person and an agent can move from an uncertain product idea to a verified increment while preserving the connection between user value, experience, technical decisions, and implementation across sessions.

Candidate success signals, with targets still undefined:

- A fresh session can identify current intent and unresolved questions from a small set of documents.
- Work can be traced to an outcome and acceptance criteria.
- Significant decisions carry rationale and their consequences appear in the living documents.
- Small changes remain small; discovery and documentation effort scale with uncertainty.

## Refinement direction

Flow has one refinement entry point with product, design, and architecture focuses. It selects a useful starting focus from the request and existing context; users can also choose a focus explicitly. These are distinct concerns, not mandatory sequential gates.

Product refinement owns users, problems, desired outcomes, positioning, the product promise, and scope. User-visible requirements such as offline use or cross-device continuity belong here; their technical mechanisms belong in ARCHITECTURE.md. Visual identity and interaction specifications belong in DESIGN.md.

Start with product questions when an idea is underspecified. Reuse established context and skip questions already answered. Address technical feasibility early when it could invalidate the direction, and revisit any focus when new evidence warrants it.

Refinement resolves enough uncertainty for the next useful action: an experiment, prototype, feature specification, or implementation increment. It does not require exhaustive questioning or completion of every document.

Refine explores and resolves choices. Specify captures agreed scope and acceptance criteria for a particular increment. Durable project direction belongs here; feature-specific detail belongs with the feature specification.

See [PDR 0001](docs/pdr/0001-focused-refinement.md) for rationale and [the research](docs/research/2026-10-18-focused-refinement.md) for references.

## Remaining workflow proposals

Specify, Plan, Build, Review, and Ship remain proposed workflow activities following or interleaved with refinement. Decision handling and alignment are shared responsibilities; their packaging and the final skill count remain open. Exploration is part of refinement rather than a required extra public skill.

Lightweight discovery connects outcomes, opportunities, alternatives, and assumptions to a useful test. Full discovery ceremonies are optional. Planning would use GitHub feature issues with vertical sub-issues and dependencies; review would consider product outcomes, engineering quality, and alignment. See [the workflow](docs/workflow.md).

## Boundaries

Flow should avoid mandatory research ceremonies, decision records for every small edit, and duplicated task tracking. It should retain decisions and reusable knowledge rather than every intermediate thought.

Automated semantic consistency is not an established capability. The initial approach is explicit review with evidence; deterministic checks may later validate mechanical conventions.

## Open questions

- What Nilo documentation and lessons should be carried into Flow? The supplied chat does not establish Nilo's product or architecture.
- How should the remaining workflow activities be packaged while keeping the public skill set small?
- Which agent environments and distribution formats should the first version support?
- What is the smallest useful skill contract and first real evaluation?
- Which repository will hold feature specifications and implementation tasks?
- What evidence will demonstrate that Flow improves outcomes without adding process overhead?
