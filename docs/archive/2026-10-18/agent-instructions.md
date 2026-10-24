# Working on Flow Skills

Flow Skills is being developed through its own emerging process. Until skills exist, use conversation and available tools; describe manual work accurately.

## Read when relevant

- For project-specific terminology or naming changes, read GLOSSARY.md.
- For product direction, scope, requirements, or priorities, read PRODUCT.md.
- For design specifications, interactions, or presentation conventions, read DESIGN.md.
- For architecture specifications, skill boundaries, integrations, or implementation structure, read ARCHITECTURE.md.
- For refinement, workflow changes, or activity handoffs, read docs/workflow.md.
- For inherited context, provenance, or Nilo references, read docs/context.md.
- For significant decision changes, consult the relevant records in docs/pdr/ or docs/adr/.

## Glossary rule

Keep GLOSSARY.md limited to project-specific meanings and a few essential distinctions agents could otherwise miss. Rely on pretrained knowledge for standard terminology. When the glossary is loaded, apply it and update affected entries as meanings are resolved or changed; loading alone does not require an edit. Keep product direction in PRODUCT.md, design specifications in DESIGN.md, and architecture specifications in ARCHITECTURE.md.

## Maintain context

Keep confirmed user direction distinct from proposals, assumptions, and observed evidence. Prior assistant recommendations remain proposals until adopted. Update the affected living documents when the user settles a choice or the implementation changes what is true.

Record significant rationale in a PDR or ADR; ordinary clarifications can update the living document directly. If work conflicts with an accepted decision, check whether the current user instruction already authorizes the change. Ask only when the conflict remains unresolved.

Keep temporary investigations in work/. Store reusable conclusions in the relevant document; preserve substantial research with sources in docs/research/ when it supports a durable decision or the user requests it. Feature specifications and tasks should use GitHub Issues once a repository is configured; until then, record unresolved scope in PRODUCT.md without inventing issue references or a duplicate tracker.

Preserve unrelated changes and worktrees. Use isolated worktrees when parallel implementation requires isolation; sequential documentation work does not require one.
