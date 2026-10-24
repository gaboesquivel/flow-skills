# Flow workflow

Status: refinement approach accepted on 2026-10-18. Remaining activity boundaries and skill packaging are working proposals.

Refine ↔ Specify ↔ Plan ↔ Build ↔ Review ↔ Ship.

These are available activities, not mandatory gates. Learning can reopen any activity, including refinement after delivery.

## Refine

One entry point can focus on product, design, or architecture. Infer the starting focus from the request and existing context, or follow an explicit focus. Exploration is part of refinement; it does not require a separate public command.

| Focus | Resolve | Owning document |
| --- | --- | --- |
| Product | Users, problem, outcome, positioning, behavior, scope | PRODUCT.md |
| Design | Journeys, interaction, visual identity, accessibility | DESIGN.md |
| Architecture | Technical constraints, mechanisms, boundaries, tradeoffs | ARCHITECTURE.md |

Start with product when direction is unclear. Existing context can justify starting elsewhere. Follow dependencies between questions; investigate feasibility early if it could change the direction. Revisit another focus when evidence affects it.

Finish when enough uncertainty is resolved for the next useful action, with remaining assumptions explicit. That action may be an experiment, prototype, specification, or implementation increment. Exhaustive questioning and completion of all three documents are not required.

## Other activities

| Activity | Purpose | Proposed completion evidence |
| --- | --- | --- |
| Specify | Capture agreed scope and acceptance criteria for an increment | A clear feature specification referencing relevant project conventions |
| Plan | Break the specification into vertical increments | Independently verifiable slices with explicit dependencies |
| Build | Implement a selected slice safely | Working behavior and appropriate verification evidence |
| Review | Assess product, engineering, and alignment | Findings resolved or explicitly left open |
| Ship | Deliver and verify the change | Delivery evidence and relevant recovery information |

Refine resolves choices; Specify records the agreed increment. Specification should reuse the conversation rather than restart an interview, revisiting only gaps that affect readiness.

## Manual application now

Use prompts and available tools until skills exist. Update the authoritative document when durable understanding changes. Keep detailed feature scope with its specification; keep reusable project direction and conventions in the living documents.

GitHub Issues remain the proposed destination for feature specifications and tasks. No repository is configured yet and no skill execution or issue publication is implied.

## Decisions and alignment

Check relevant established decisions before implementation. Capture significant new findings during work and reconcile affected documents at review. Routine clarifications update the owning document directly; significant product or experience choices may need a PDR and significant technical choices may need an ADR. Existing user authorization can settle a change; unresolved conflicts need a human decision.

## Evaluation and development

The earlier proposed development sequence was foundations, product work, execution, then delivery. Revisit packaging through actual use rather than treating that sequence as a committed backlog.

Evaluate refinement with a vague idea, an established design, and a consequential feasibility constraint. Check whether it selects useful questions, avoids repeating known context, updates only affected documents, and stops at a useful next action. Also test decision conflicts, authorized changes, small edits without unnecessary records, and continuity in a fresh session. These evaluations have not run yet.

See [the accepted decision](pdr/0001-focused-refinement.md) and [supporting research](research/2026-10-18-focused-refinement.md).
