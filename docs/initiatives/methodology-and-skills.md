# Develop Flow's methodology and skills

Status: distribution remediation and skill naming refactor implemented (2026-10-27); ongoing methodology validation remains. Initial plan captured 2026-10-20.

## Outcome and scope

Develop a lean, coherent methodology and supporting skills that help solo founders and small technical teams keep product intent, decisions, and delivery aligned. Use Flow's own development to expose ambiguity and friction, while recognizing that experience here does not establish effectiveness in other projects.

[PRODUCT.md](../../PRODUCT.md) owns capabilities and open product choices; [the methodology](../methodology.md) owns current practices. This initiative owns development work and its evaluation. Website planning remains in the [website initiative](website.md). The [initialization experiment](initialization.md) owns the generic prompt trial on an existing repository.

## Current work and next steps

- **Naming (2026-10-27):** twenty-five skills with short technical names; see [decision 0003](../decisions/0003-skill-naming.md). Added `explore` and `requirements`; renamed legacy directories; retired `handoff` from the catalog.
- **Review and proposed remediation (2026-10-27):** [distribution review](../research/2026-10-27-distribution-review.md) records confirmed defects, legacy workflow conflicts, catalog dispositions, and a six-step remediation sequence with acceptance evidence. The subsequent implementation follows [decision 0002](../decisions/0002-local-skill-ownership.md); current evidence and remaining limitations are recorded in [remediation verification](../../tests/smoke/2026-10-27-remediation.md).
- **Current research focus (2026-10-20):** study product discovery and Lean Startup practices before defining Flow's product skills and workflow. The [Founder Playbook and Booklib comparison](../research/2026-10-20-lean-startup-skill-comparison.md) records mechanisms, limitations, and questions for that discussion. Connect this work to the existing discovery, metrics, refinement, and validation-board ideas; skill names and workflow composition remain open.
- **Established:** apply the practices manually through conversation and repository documents. Maintain [shared terminology](../../GLOSSARY.md), including agentic product engineering and the distinction between ideas and initiatives. The glossary convention was adopted on 2026-10-20 from the [context and evaluation idea](../ideas/context-and-evaluation.md).
- **Next:** observe whether agents recover the intended meanings in fresh sessions, identify real contradictions, and update affected context without creating unnecessary documents or questions. Record concrete findings here as they occur.
- **Then:** use those findings to define the smallest useful skill behavior and evaluate existing skills for reuse. Include glossary consumption wherever terminology matters and active maintenance where concepts change. Domain-modeling is now a local skill with supporting-reference composition; further consolidation depends on observed use.
- **Distribution (2026-10-27):** locally maintained skills, an offline bundled installer, and unified decisions. Automated checks: `pnpm validate` and `pnpm test`. Host-neutral behavior scenarios: [tests/smoke/README.md](../../tests/smoke/README.md). Example init fixture: [tests/fixtures/example-project](../../tests/fixtures/example-project/).
- **When adapting further:** try changes on real work, compare with manual practice, and revise before expanding. Edit `skills/` as local source; preserve [attribution](../../ATTRIBUTION.md) when material originated elsewhere—no remote sync or catalog imports.

These are development priorities, not a required workflow for every product task. Other candidate capabilities remain in the [idea index](../ideas/README.md); this plan does not silently adopt their packaging or start their implementation.

## Terminology evaluation cases

| Scenario | Expected behavior |
|---|---|
| An agent encounters “Agentic Product Engineer” | Uses Flow's meaning without assuming the product must contain AI or require a particular tool stack. |
| Someone records an idea, or groups several experiments in an initiative | Preserves the distinction between a possibility and intentional work; permits several experiments within an initiative. |
| Discussion conflicts with a documented meaning | Identifies the conflict, checks context, and clarifies the consequential uncertainty before changing the meaning. |
| A meaning is resolved or changed | Updates the glossary and affected current artifacts together while preserving historical evidence. |
| An ordinary technical term appears, or existing language already fits | Uses established knowledge and leaves the glossary unchanged. |

These are evaluation cases, not completed tests. Useful evidence includes correct context recovery, consistent downstream usage, and the effort required to maintain it. If the glossary grows without resolving ambiguity, prune or relocate entries while preserving relevant rationale and ideas. If a dedicated skill adds no benefit over shared instructions, retain the practice without a separate skill.

## Evidence and limitations

Structural remediation is covered by `pnpm validate`, `pnpm test`, and [remediation smoke notes](../../tests/smoke/2026-10-27-remediation.md). Live cross-host agent behavior remains partially evaluated; see the smoke matrix for open scenarios. The glossary and maintenance instructions are present. [Source assessment and adoption boundaries](../research/2026-10-20-domain-language.md).
