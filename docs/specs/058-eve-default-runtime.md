# 058: Eve as Flow's default agent runtime

**Status:** accepted (2026-11-02)

**Repositories:** [flow-next](https://github.com/gaboesquivel/flow-next), [flow-mono](https://github.com/gaboesquivel/flow-mono), [flow-skills](https://github.com/gaboesquivel/flow-skills)

**Decision:** [0061](../decisions/0061-eve-default-agent-runtime.md)

## Problem Statement

Flow's Next.js starters already ship Eve agents, MCP tools, and AI SDK chat routes, but adopters cannot see from the repository alone how those pieces fit together, how to inspect agent runs locally, or how Flow Skills relate to Eve's runtime. Spec [005](005-flow-templates-interop.md) names authoritative Eve agents as the target; the templates need a small, documented Eve-first foundation without a parallel Flow agent framework or a replacement product UI.

## Solution

Treat [Vercel Eve](https://vercel.com/eve) as the default **agent runtime** in both starters. Flow Skills stay the methodology for how teams build; Eve owns durable sessions, typed tools, observability, and Next.js integration via `withEve`. Keep the Vercel AI SDK on lightweight HTTP routes where a full agent loop adds no value. Document architecture, security, observability, and local development in each starter; align env examples and agent instructions.

## User Stories

1. As a developer cloning a starter, I read one document that explains Eve agents, MCP tools, sidebar chat, and where Flow Skills live.
2. As a developer running locally, I open Eve traces during `eve dev` without building a custom dashboard.
3. As an operator, protected surfaces stay fail-closed without `OPERATOR_SECRET`, and synthetic data tools on the Operator agent require explicit approval once per session.

## Implementation Decisions

- **Two Eve apps:** `agents/assistant` (public capabilities) and `agents/operator` (protected diagnostics). Each uses `defineAgent`, `agent/instructions.md`, and typed tools under `agent/tools/` that re-export shared implementations from `lib/agent-tools/`.
- **Next.js:** `withEve(nextConfig, { eveRoot })` at the app root; `pnpm build:agents` runs `eve build` per agent before production start.
- **Dual surfaces by design:** Streamable HTTP MCP at `/api/mcp` registers the same GenUI behaviors as Eve tools for protocol interop (MCP Apps preview, fixed tool names in [INTEROP](https://github.com/gaboesquivel/flow-next/blob/main/docs/INTEROP.md)). Eve MCP channels are not required for this increment; migrating MCP to `mcpChannel()` remains a later bet.
- **AI SDK:** `/api/chat` and `/api/operator/chat` use `streamText` via Gateway or an explicit local Anthropic override only—no second agent framework.
- **Flow Skills:** Committed under `.agents/skills/` for IDE and host agents; Eve agents load product behavior from `instructions.md` and tools, not a copied methodology tree.
- **Observability:** Add conservative `agent/instrumentation/otel.ts` in each Eve app (redact prompts and tool I/O outside development). Document `eve dev` `/traces`, Vercel Agent Runs when deployed, and optional OpenTelemetry export per Eve's bundled docs.
- **Models:** `EVE_AGENT_MODEL`, `EVE_OPERATOR_MODEL`, and Gateway-backed defaults in `lib/ai/models.ts`. Document optional local models by authoring a direct `LanguageModel` in `agent.ts` (for example an OpenAI-compatible local endpoint); no mandatory paid inference.
- **Dependency:** Pin `eve` with a semver range in `package.json`; Eve remains preview—upgrade deliberately using `node_modules/eve/docs`.

**Exposure:** Public Assistant MCP and `/api/chat` stay unauthenticated. Operator routes and `/api/mcp/operator` require `OPERATOR_SECRET` (≥16 characters) and fail closed when unset. No new authenticated product UI.

## Testing Decisions

Structural checks only for this increment: starter lint and typecheck when ready; existing Vitest smoke for Eve tools (`evals/eve-smoke.test.ts`). No live model evals or paid CI.

**Acceptance scenario**

Actor: a developer with a fresh clone and no Gateway key. Starting state: `OPERATOR_SECRET` unset.

1. They open `docs/agents.md` and can name the two Eve apps, the MCP path, and where Flow Skills live.
2. They run `pnpm qa` (or read CI scope) and see Eve tool smoke tests listed under `pnpm eval`.
3. They set `OPERATOR_SECRET` to a 16+ character value and reach `/api/mcp/operator` with the secret; without it, operator MCP returns unauthorized.
4. In `agents/operator`, they run `eve dev`, invoke `generate_demo_data`, and see an approval prompt before the first call in a session (unverified in this delivery if no local model credentials).

## Appetite

One focused increment across three repositories: documentation plus small agent and env alignment. First verifiable slice: `docs/agents.md` and corrected Assistant instructions on both templates. Observed elapsed time: not measured.

## Direction changes

None. Reinforces spec 005's Eve agent direction without claiming spec 005 release gates.

## Out of Scope

- Flow Factory, Flow Signal, or other repositories.
- Replacing custom MCP registration with Eve `mcpChannel()` (candidate for a follow-on spec).
- Operator OAuth/OIDC (spec 005 PROTO-3).
- Custom trace dashboards or telemetry collectors.
- Mandatory cloud inference or new chat product UI.

## Further Notes

Official Eve documentation: [vercel.com/eve](https://vercel.com/eve), [github.com/vercel/eve](https://github.com/vercel/eve), and `node_modules/eve/docs/` in each starter.

## Tasks

- [x] flow-skills: spec 058 and decision 0061
- [x] flow-next: `docs/agents.md`, otel policy, instructions, env example, README link
- [x] flow-mono: same content with monorepo paths
