# 005: Flow Templates — Interoperability and Release Contract

**Status:** Proposed (canonical contract for migration)  
**Repositories:** [gaboesquivel/flow-next](https://github.com/gaboesquivel/flow-next), [gaboesquivel/flow-mono](https://github.com/gaboesquivel/flow-mono)  
**References:** [003-flow-templates-baseline-v2.md](003-flow-templates-baseline-v2.md) (historical baseline), [gaboesquivel/flow-starter](https://github.com/gaboesquivel/flow-starter), alignment decisions 02–33 (Flow ecosystem interview, 2026)

## Problem statement

Flow needs two independently deployable, agent-first Next.js templates that share a precise interoperability, security, and verification contract. [Spec 003](003-flow-templates-baseline-v2.md) shipped an initial baseline; implementation on `main` still diverges from the agreed architecture (single Eve agent, direct provider chat, static Operator secret, legacy MCP test posture, Playwright, `node:test`, vendored workflow skills, and failed CI on vendored skill lint). Without a normative spec that separates product, protocol, and release requirements, template work will continue to drift and claim completion without evidence.

## Solution

Adopt this document as the **authoritative interoperability contract** for flow-next (reference implementation) and flow-mono (independent reproduction). Preserve spec 003 unchanged as historical context. Implement migration in focused pull requests after this spec is accepted.

Requirement levels in this document:

| Level | Meaning |
| --- | --- |
| **Product requirement (PRD)** | User-visible or adopter-facing behavior the template must provide. |
| **Protocol requirement (PROTO)** | Standards-based contracts (MCP, OpenUI, OAuth/OIDC, HTTP) hosts and clients may rely on. |
| **Implementation recommendation (REC)** | Preferred patterns; may change without breaking the contract if behavior and PROTO remain satisfied. |
| **Release acceptance (REL)** | Evidence required before calling a template release-ready. |
| **External dependency (EXT)** | Configuration or verification that cannot be fully provisioned from source alone. |

---

## Relationship to spec 003

**Spec 003 remains valid historical evidence.** It is not deleted or rewritten.

**Spec 005 supersedes** the following for **new work** (implementation must converge here):

| Spec 003 section | What 005 replaces |
| --- | --- |
| §3 Two default agents | Two **authoritative Eve agents** (Assistant, Operator), shared domain tools, Operator inherits public capabilities — see PRD below |
| §4 GenUI and MCP Apps | MCP `2026-07-28`, MCP Apps extension, OpenUI-only GenUI, Studio-first UX — see PROTO and PRD |
| §5 Enterprise UX | Studio-first website, persistence rules, offline demo — see PRD |
| §6 Repository structures | flow-mono limited to `apps/web` and `packages/ui` only (`packages/ts` removed unless demonstrated need) |
| §7 Development scripts | Vitest (not Playwright); skills install via `pnpm setup` with skip; exclude vendored skills from app lint |
| §8 Security defaults | Vercel-first Gateway OIDC for inference; Operator OAuth/OIDC (not static secret); cost and WAF boundaries |
| §10 Verification | Offline vs live vs release gates; no browser automation in CI |
| §11–§12, flow-skills acceptance | Optional `start` skill authorized by [decision 0010](../decisions/0010-optional-start-skill.md); does not supersede [0009](../decisions/0009-adopter-product-context.md) |

**Spec 003 provisions that remain in force** (not superseded):

- §1 Principles (agent-first, standards-first, secure by default, working examples, no Flow methodology in templates)
- §2 Shared technology stack direction (Node 24, Next.js 16, Eve, OpenUI, MCP, Vercel-first) — refined by exact-version and Vitest requirements here
- §9 Agent discoverability (OpenAPI, MCP metadata, `llms.txt`, Is Agentic — with stricter non-leak rules for Operator)
- Out of scope: no default database, Redis, or end-user authentication product; no bundled Flow Skills methodology

---

## Current observed baseline (evidence)

Recorded at spec authoring. **Code is authoritative; READMEs may lag.**

| Repository | `main` SHA (2026-10-27) | Verified gaps |
| --- | --- | --- |
| flow-next | `6fd5cb3` | One `defineAgent`; `/api/chat` and `/api/operator/chat` use `@ai-sdk/anthropic`; Operator uses `OPERATOR_SECRET` + HMAC cookie; MCP tests use `protocolVersion: "2025-03-26"`; tests use `node:test`; Playwright in CI; `oxlint .` fails on `.agents/.agents/skills/shadcn/**` (CI run `40542444379`) |
| flow-mono | `109d416` | Same runtime gaps; `packages/ts` present (tsconfig presets only); `docs/INTEROP.md` stub; operator MCP toolset does not inherit public tool implementations; same oxlint CI failure (`40542451884`) |

**Unverified in this pass:** live Vercel deployments, Operator OIDC with a real IdP, MCP `2026-07-28` against production SDKs, embedded MCP App in an external host, Is Agentic scores, WAF and Gateway budget enforcement, performance baselines.

---

## Product requirements (PRD)

### PRD-1 Two Eve agents

Implement two **authoritative** Eve agents with distinct authorization boundaries:

**Assistant (public, unauthenticated)**

- Chat, Studio composition, OpenUI actions, and **public** MCP tools only.
- No Operator-only tools, diagnostics, or protected data.
- Live inference via **Vercel AI Gateway** when credentials are available.
- Deterministic demos when credentials are unavailable (no silent failure posing as live inference).

**Operator (protected)**

- Provider-agnostic **OAuth/OIDC** for web console and protected chat.
- Dedicated diagnostics-first web console and protected chat.
- **Inherits** permitted public capabilities (same domain tool implementations; not duplicate competing behaviors).
- Adds explicitly allowlisted operational and diagnostic tools.
- All sensitive HTTP routes verify authorization **server-side**; fail closed without valid authorization configuration.

Reuse domain-level tools and capability definitions between web, Eve, and MCP transports.

### PRD-2 Studio-first experience

The public website is **Studio-first**, not chat-first.

- Polished responsive GenUI canvas with integrated public Assistant conversation.
- General-purpose examples (forms, tables, dashboards, comparisons) — not a fictional product.
- Browser-local session and canvas persistence; clear/reset controls.
- Accessible interactions; consistent light/dark styling.
- Transparent provider failures with Retry and explicit offline-demo fallback.
- **Must not** persist Operator credentials, diagnostic secrets, or sensitive auth state in Studio browser storage.

### PRD-3 Synthetic demo data tool

Provide a shared typed Eve tool **`generate_demo_data`** (and equivalent MCP exposure where appropriate):

- Pinned `@faker-js/faker` or justified equivalent.
- Zod validation; fixed reference dates; deterministic seeds; optional locales.
- Small allowlisted dataset schemas; strict row/output limits.
- Realistic relationships between records; no external mutations or arbitrary code execution.
- Usable from Studio and MCP App examples without returning unnecessarily large payloads to the model.

### PRD-4 Developer experience (templates)

- **Curated technical skills** in templates; Flow owns methodology in flow-skills.
- Remove overlapping **workflow** skills from template bundles (`implement`, `retro`, `to-spec`, and equivalent duplicates from upstream catalogs).
- Retain distinct framework/runtime expertise even when the same author publishes workflow skills.
- `pnpm setup` installs curated technical skills automatically with an **explicit skip** mechanism.
- Keep `pnpm skills:install` and `pnpm skills:update`.
- Preserve pinned skill provenance and upstream attribution.
- **Exclude** vendored skill source from application linting and formatting (`oxlint` / `oxfmt` scope).
- Builds, CI, and production runtime **must not** depend on installing development skills.

### PRD-5 Dependency and toolchain discipline

- **Exact direct dependency versions** in package manifests (no caret/tilde on direct deps unless explicitly documented exception).
- Node **24**; pinned pnpm; frozen lockfiles.
- `pnpm test` runs **Vitest** for application tests.

### PRD-6 flow-mono shape

- `apps/web` and `packages/ui` only.
- Remove `packages/ts` unless a concrete need is demonstrated in a reviewed change.

### PRD-7 flow-skills `start` skill (later increment)

After this spec is accepted and templates converge, ship an optional **`start`** skill per [decision 0010](../decisions/0010-optional-start-skill.md). **Not part of this spec’s first PR.**

---

## Protocol requirements (PROTO)

### PROTO-1 MCP

Target **MCP core `2026-07-28`** and the **official MCP Apps** extension.

- Verify selected official SDK versions in the **first implementation PR** that migrates MCP; stop and report if the published SDK cannot negotiate `2026-07-28`.
- Stateless Streamable HTTP requests unless the standard requires otherwise for a documented compatibility path.
- Supported version negotiation and justified legacy-host compatibility.
- Correct protocol metadata and required HTTP headers.
- Deterministic, cacheable tool/resource discovery.
- Separate **public** and **protected** MCP endpoints.
- Typed input/output validation (e.g. Zod at boundaries).
- Safe **text fallback** for hosts without MCP Apps.
- Authorization enforced at the protocol boundary for protected endpoints.
- **Do not** treat obsolete JSON-RPC one-shot initialize tests as proof of `2026-07-28` compliance.
- Public tool catalog is an **explicit subset** of the Operator catalog; Operator **inherits** public tools without duplicating implementations.

MCP Apps:

- Official MCP Apps SDK APIs; `ui://` resources; supported tool metadata; scoped CSP; host-native interaction.
- Prefer **app-only** tools for UI-specific actions that do not need model visibility.
- Maintain an explicit **host compatibility matrix**; no proprietary compatibility protocols.

### PROTO-2 OpenUI Lang

**OpenUI Lang is the sole generated-UI language.** Do not introduce JSON component trees or another generated UI DSL.

JSON is permitted only where standards require it (MCP, A2A readiness, OAuth metadata, OpenAPI, tool arguments, typed application data).

- Official OpenUI parser/compiler and registry APIs.
- Zod-validated component contracts; shadcn rendering.
- Incremental streaming and efficient refinements.
- Validated, explicitly registered actions; no arbitrary model-generated JavaScript.
- Preserve last valid canvas on errors; safe recovery and Retry behavior.
- Avoid passing large UI datasets through the model when the app can retrieve or compute them directly.

### PROTO-3 Authentication boundaries

**Vercel AI Gateway** and **Vercel-managed OIDC for model access** are distinct from **Operator user authentication**.

| Boundary | Requirement |
| --- | --- |
| Model access | Prefer Vercel integrations over static provider secrets; local offline dev without credentials; local live dev via linked Vercel project; reject accidental direct-provider keys in normal local dev and CI; documented non-Vercel override for portability; eliminate redundant direct Anthropic (or other) runtime paths for normal chat/agents |
| Assistant | Login-free; public |
| Operator web | Validate configured OIDC issuer and identity; short-lived sessions; appropriate cookie flags; origin/CSRF protection |
| Operator MCP | OAuth resource-server requirements: protected-resource metadata, bearer-token validation, issuer/audience/scope checks, compatible client discovery |
| Discovery and errors | Do not leak protected tool names, data, or operational diagnostics through public discovery or error responses |

Prefer managed, standards-compliant identity over a custom authorization server.

### PROTO-4 A2A readiness

Keep agent/domain contracts **A2A-ready**. Do **not** implement A2A endpoints, Agent Cards, task infrastructure, or extra discovery routes until a concrete use case requires them.

---

## Implementation recommendations (REC)

- Configure Operator IdP outside the repository (EXT); wire issuer, client, and test identity in Vercel env.
- Use Vercel WAF rate limits, AI Gateway project budgets, and application-level request-size, token, and execution limits.
- Authenticated Operator tools; scoped MCP App permissions and CSP; safe logging and structured errors; secret and dependency checks in CI.
- Do not add Redis, a database, or an end-user authentication product by default.
- Document external Vercel configuration that source alone cannot provision (see EXT).
- Measure performance with Vercel Observability and AI Gateway before setting regression thresholds; use a stable task corpus on real deployments.

---

## Release acceptance (REL)

A template is **not release-ready** until there is **evidence** for:

| Gate | Evidence |
| --- | --- |
| REL-1 | Actual Vercel deployment (not only local build) |
| REL-2 | Working public Studio and live Assistant |
| REL-3 | Protected Operator web and MCP access with configured OIDC |
| REL-4 | MCP discovery, tools, and resources on deployed URLs |
| REL-5 | Actual embedded MCP App in at least one compatible host |
| REL-6 | Unsupported-host text fallback exercised |
| REL-7 | Is Agentic assessment with preserved scan output |
| REL-8 | WAF and Gateway budget enforcement documented or demonstrated |
| REL-9 | Manual browser verification recorded |
| REL-10 | Observability and live evaluation results from trusted CI |

Distinguish **candidate deployment** from **verified release**. Define promotion or rollback handling where applicable.

**Do not report success because code or tests were added.** Report what was actually exercised.

---

## External configuration and verification (EXT)

Cannot be fully guaranteed from template source alone:

- Vercel project link, environment variables, and deployment URLs.
- AI Gateway budget and Vercel OIDC for model access in CI.
- Operator OIDC issuer, client registration, and dedicated test identity for protected flows.
- WAF rules and rate limits.
- MCP App host for embedded UI verification.
- Is Agentic and third-party host availability.

Missing live credentials must **fail live jobs explicitly**, not pass as offline success. **Never** expose privileged credentials to untrusted pull-request code.

---

## Verification strategy

### Offline (credential-free)

Must pass on every PR and on fresh clone:

- `pnpm setup` (with skills skip path documented).
- Lint and formatting (application source only; vendored skills excluded).
- Strict TypeScript; production build.
- **Vitest:** unit and contract tests; API routes; Eve tools; MCP request/response behavior; OAuth and role isolation; OpenUI compilation, streaming, and actions; faker determinism and bounds; failure and recovery.
- Deterministic Eve/GenUI smoke tests.
- Security checks (`security:check` or equivalent).
- No-key Studio functionality.

**Remove Playwright**, associated scripts, and browser CI jobs.

### Live (trusted `main` only)

GitHub Actions orchestrates live evaluations against **deployed** Vercel applications:

- Prefer Vercel-managed OIDC for model access; avoid provider API keys in CI.
- Dedicated test identity for protected OAuth flows.
- Strict request and inference limits.
- Test public and protected agents, MCP, GenUI generation, authorization boundaries, and error recovery.

### Performance (after REL baselines)

Capture when observability is available: time to first token, time to first usable OpenUI render, total generation latency, token usage, tool overhead, error/timeout rates, usage and cost by agent. Establish baselines before regression thresholds.

---

## Migration order and PR strategy

Dependency sequence (split into smaller PRs as needed):

1. **flow-skills:** This spec and decision 0010 (accepted before template architecture migration).
2. **flow-next:** CI cleanup, technical skills curation, Vitest, dependency exactness, oxlint ignore for vendored skills.
3. **flow-next:** Two Eve agents and unified AI Gateway runtime.
4. **flow-next:** Operator OAuth/OIDC and cost/security boundaries.
5. **flow-next:** Modern MCP interoperability and official MCP Apps.
6. **flow-next:** Studio, OpenUI improvements, `generate_demo_data`, safe actions.
7. **flow-next:** Live deployment tests, observability, release evidence.
8. **flow-mono:** Reproduce validated implementation incrementally; minimal monorepo; local `docs/INTEROP.md` parity.
9. **flow-skills:** Optional `start` skill, catalog and verification (fifteenth skill).
10. **flow-starter:** Extract proven patterns; archive only after both templates verified.

Each PR: establish repo state and contracts; write or update tests before claiming behavior complete; run checks; adversarial review; update owning docs only; report commits, checks, failures, and unverified assumptions.

---

## Assumptions and risks

| ID | Assumption | If false |
| --- | --- | --- |
| A-1 | Official MCP SDK can implement `2026-07-28` | Stop migration PR; report SDK gap; adjust PROTO with a new decision |
| A-2 | Operator IdP is external configuration | Do not bundle a custom auth server in templates |
| A-3 | `packages/ts` has no demonstrated runtime need | Remove in flow-mono during shape PR |
| A-4 | Interview decisions 02–33 remain accepted constraints | Escalate genuine incompatibility; do not silently broaden scope |

---

## flow-skills acceptance (this increment)

- Ship spec 005 and decision 0010; update indexes and root context; **do not** add the `start` skill until step 9 above.
- Validator continues to enforce **fourteen** skills until `start` ships.
- Spec 003 file content unchanged.

---

## Out of scope

- Template application code in this spec’s first PR.
- A2A server implementation.
- Redis, database, or end-user authentication product as defaults.
- New Flow workflow skills in templates.
- Rewriting [decision 0009](../decisions/0009-adopter-product-context.md).

---

## Testing decisions

- Contract tests for flow-skills: catalog count, `flow`/`implement`/`review` boundaries for initialization and [0010](../decisions/0010-optional-start-skill.md).
- Template verification remains in flow-next and flow-mono per offline/live/REL sections above.

---

## Further notes

- Handoff referenced `004-flow-templates-interop.md`; [004-pr-alignment-review.md](004-pr-alignment-review.md) already occupies sequence 004 in this repository.
- Cross-template interoperability prose should live in each template’s `docs/INTEROP.md` after migration; flow-next is the reference for normative tool names and env matrices until flow-mono catches up.
