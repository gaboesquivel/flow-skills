# Flow principles

Status: working draft, updated 2026-10-19. Themes reflect the discussion; wording and implementation remain open for refinement.

## Validation

Make assumptions explicit and use evidence to decide whether to continue, change direction, or stop. Measurement supports validation rather than standing as a separate principle.

Identify the consequential uncertainty, the smallest useful test, and how its results will inform the next decision before increasing investment. Combine quantitative and qualitative evidence as appropriate; distinguish what was observed from what was inferred.

## Observability

Make product and system behavior understandable from day one.

Plan the signals needed to see what people and agents attempt, where they succeed or struggle, and how the system behaves. Connect technical diagnostics to product feedback so failures, delays, and usage patterns can inform product decisions. Collect evidence in context; technical health alone does not establish customer value.

## Agentic

Build for agents and humans, with an API-first approach.

Treat agent use as a first-class product interaction. Make relevant capabilities discoverable and usable through clear interfaces, including APIs, CLIs, and MCP where appropriate, alongside useful human experiences. Design permissions, errors, and results so an agent can act within the user's authority and understand the outcome.

## Lean

Use the least effort needed to learn or deliver something worthwhile.

Test consequential uncertainty, limit concurrent scope, and prefer small experiments to speculative feature accumulation. Keep documentation and process proportionate. Reuse capabilities where they fit; avoid adding tools, interfaces, or ceremonies without a clear purpose.

## Velocity

Move quickly with intent, and use feedback to correct direction.

Shorten the path from an assumption to useful evidence and a decision. Progress may mean shipping, narrowing scope, changing direction, or stopping. Challenge purpose and evidence when it matters; let small tasks proceed with minimal ceremony.

## Room for exploration

Open exploration may begin with curiosity rather than a formal hypothesis. When it becomes a product commitment, make its intent and validation approach explicit. Apply these principles with judgment rather than as a checklist for every action.

The [methodology](methodology.md) describes optional practices. [References](references.md) preserve influences and research. Shipped [skills](../skills/) include discoverable Flow Lite (`flow`) and otherwise manual packages; none enforce this draft as a mandatory workflow. This draft is not a finalized skill specification.
