# 0023 — Agent-first, API-first principle

Status: **Accepted** (2026-10-28). Amends [0007](0007-flow-product-identity.md) (seven official principles become eight). Related: [0022](0022-start-runs-explore.md). Spec: [011](../specs/011-start-with-explore.md).

## Context

[`docs/principles.md`](../principles.md) already describes an optional "Agentic" theme: build for agents and humans, API-first, with MCP where appropriate. No skill acts on it, so briefs and specs default to human-only products and UI-first slices. Agents increasingly use products directly, through APIs, MCP tools, and MCP Apps rendered inside agent hosts.

## Decision

- Add an official principle to `PRODUCT.md`: **Agent-first, API-first.** Every product is built for agents and people; capabilities are defined as contracts before interfaces. The "Agentic" theme in `docs/principles.md` becomes its elaboration.
- `explore` asks who the agent users are in every brief: an agent journey beside the human ones, and agent alternatives. A brief with no agent users says so.
- Slice 1 defines its capability as a typed API contract that the UI uses. When the brief names agent users, the same capability ships as an MCP tool.
- Specs use MCP Apps only when a journey needs the product's UI inside an agent host. Otherwise plain MCP tools suffice.
- `to-spec` writes interfaces contract-first: API shape, MCP tool definitions, and errors and permissions an agent can act on.

## Rationale

Asking about agent users is cheap and changes what gets built; shipping MCP for every product is not, which is why the rule is a default question and a conditional deliverable. A shared contract lets the UI, agents, and tests use one surface.

## Alternatives

- **Lens only, no principle.** Rejected: the theme already existed as optional judgment and did not change behavior.
- **Mandatory MCP everywhere.** Rejected: conflicts with minimal process for products without agent users.

## Consequences

- `PRODUCT.md`, `docs/principles.md`, and documents that count the principles change together.
- `explore` and `to-spec` gain the agent lens; spec 011 applies it to slice 1.
