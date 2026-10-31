# Flow principles

Status: elaboration, updated 2026-10-31. The eight official principles live in [PRODUCT.md](../PRODUCT.md#principles). The themes below are optional methodology judgment; they do not replace that list.

## Validation

Make assumptions explicit and use evidence to decide whether to continue, change direction, or stop. Measurement supports validation rather than standing as a separate principle.

Identify the consequential uncertainty, the smallest useful test, and how its results will inform the next decision before increasing investment. Combine quantitative and qualitative evidence as appropriate; distinguish what was observed from what was inferred.

## Observability

Make product and system behavior understandable from day one.

Plan the signals needed to see what people and agents attempt, where they succeed or struggle, and how the system behaves. Connect technical diagnostics to product feedback so failures, delays, and usage patterns can inform product decisions. Collect evidence in context; technical health alone does not establish customer value.

## Agentic

Elaborates the official **Agent-first, API-first** principle ([decision 0023](decisions/0023-agent-first.md)). Build for agents and humans, with an API-first approach.

Treat agent use as a first-class product interaction. Make relevant capabilities discoverable and usable through clear interfaces, including APIs, CLIs, and MCP where appropriate, alongside useful human experiences. Design permissions, errors, and results so an agent can act within the user's authority and understand the outcome. Contracts are tested first and UI is checked in the preview ([`build`](../skills/build/SKILL.md#tests) Tests, [decision 0056](decisions/0056-contract-first-tests.md)). Flow's own agent works the same way: it uses those interfaces first and hands people only what needs them ([`write-agents`](../skills/write-agents/SKILL.md#tools) Tools).

## Understandable change

Make software easy to understand and safe to change; require evidence proportional to what can go wrong.

Agent output does not establish understanding. Know what the code actually does, through shared domain language, contracts, and checks, and weigh what a change costs later: who depends on it, how hard it is to replace, what breaks if it fails. Small, contained work stays light; consequential work earns more evidence. A responding deployment is liveness, not verified behavior, and verified behavior is not customer value.

## Lean

Use the least effort needed to learn or deliver something worthwhile.

Test consequential uncertainty, limit concurrent scope, and prefer small experiments to speculative feature accumulation. Keep documentation and process proportionate. Reuse capabilities where they fit; avoid adding tools, interfaces, or ceremonies without a clear purpose.

## Velocity

Move quickly with intent, and use feedback to correct direction.

Shorten the path from an assumption to useful evidence and a decision. Progress may mean shipping, narrowing scope, changing direction, or stopping. Challenge purpose and evidence when it matters; let small tasks proceed with minimal ceremony.

## Room for exploration

Open exploration may begin with curiosity rather than a formal hypothesis. When it becomes a product commitment, make its intent and validation approach explicit. Apply these themes with judgment rather than as a checklist for every action.

The [methodology](methodology.md) describes optional practices. [References](references.md) preserve influences and research. Shipped [skills](../skills/) are reached by talking to the agent; none enforce these themes as a mandatory workflow.
