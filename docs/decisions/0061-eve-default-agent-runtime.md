# 0061 — Eve as the default agent runtime in Flow starters

Status: **Accepted** (2026-11-02). Spec: [058](../specs/058-eve-default-runtime.md).

## Context

Flow's agent-first principle ([0023](0023-agent-first.md)) requires typed contracts and durable agent behavior in product templates. The flow-next and flow-mono starters already depend on Eve (`withEve`, `agents/assistant`, `agents/operator`) while also exposing AI SDK streaming chat and a custom MCP server for GenUI interop. Adopters need a single architectural story: **Flow defines how we build; Eve runs agentic product behavior.**

## Decision

1. **Eve is the default agent runtime** in flow-next and flow-mono for durable backend agents: instructions, skills (when added), typed tools, sessions, subagents, schedules, and observability use Eve's filesystem conventions and bundled docs—not a Flow-specific agent framework.
2. **Vercel AI SDK stays** for simple streaming and structured output on HTTP routes where a full agent loop is unnecessary (`/api/chat`, compose pipelines that are not Eve turns).
3. **Flow Skills stay host-side** under `.agents/skills/` for methodology; they are not duplicated into Eve agent trees unless a product skill is intentionally scoped to runtime behavior.
4. **Documentation and conservative defaults** in the starters explain security (fail-closed Operator), trace capture policy, model env vars, and local `eve dev` inspection—without custom telemetry products.

## Rationale

Eve already powers the shipped agents; formalizing the split avoids rebuilding runtime features (sessions, HITL, OTel) and keeps template code aligned with Vercel's supported integration path.

## Alternatives

- **Custom Flow agent layer wrapping Eve.** Rejected: duplicates lifecycle, tools, and observability Eve already provides.
- **Eve-only; remove AI SDK chat.** Rejected: sidebar chat is intentionally lightweight and does not need workflow durability.
- **Migrate MCP to Eve channels in the same increment.** Rejected: larger migration; current MCP registration shares tool implementations and satisfies interop tests.

## Consequences

- Starter `docs/agents.md` is the authoritative architecture note for Eve vs AI SDK vs MCP.
- Template PRs reference spec 058; flow-skills records the cross-repo bet.
