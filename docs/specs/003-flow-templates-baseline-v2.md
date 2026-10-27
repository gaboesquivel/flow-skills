# 003: Flow Templates — Shared Technical Baseline v2

**Status:** Approved direction — implementation pending  
**Repositories:** [gaboesquivel/flow-next](https://github.com/gaboesquivel/flow-next), [gaboesquivel/flow-mono](https://github.com/gaboesquivel/flow-mono)  
**References:** [gaboesquivel/gaboesquivel.com](https://github.com/gaboesquivel/gaboesquivel.com), [gaboesquivel/flow-starter](https://github.com/gaboesquivel/flow-starter) (`simple`)

## Problem statement

Flow needs independent, agent-first application templates that demonstrate real capabilities without bundling Flow Skills or methodology. Two shapes are required: a single Next.js app and a minimal Turborepo, sharing one technical and security contract.

## Solution

Ship **flow-next** and **flow-mono** as GitHub template repositories that implement the baseline below. **flow-skills** supplies optional portable initialization and template selection only; templates remain fully usable via **Use this template** with no Flow runtime dependency.

## 1. Principles

1. **Agent-first:** Every application exposes useful capabilities to humans and AI agents from day one.
2. **Standards-first:** Prefer Eve, OpenUI Lang, MCP and MCP Apps over custom protocols.
3. **Secure by default:** Public and private capabilities have independently enforced boundaries.
4. **Enterprise discipline, minimal complexity:** Apply SAP-inspired consistency, accessibility, interoperability and predictability without SAP dependencies.
5. **Working examples:** Every included capability must be demonstrable and tested. No decorative scaffolding or fictional business features.
6. **Independent templates:** No Flow Skills, development-agent workflows, or Flow-specific documentation within the starters.

## 2. Shared technology

| Category | Baseline |
|---|---|
| Runtime | Patched Node.js 24 LTS |
| Package manager | pnpm, exact version and frozen lockfile |
| Framework | Next.js 16 App Router, React 19 |
| Language | TypeScript `strict: true` |
| Styling | Tailwind 4, shadcn `base-nova`, Lucide |
| Themes | next-themes, shared light/dark tokens |
| Schemas | Zod |
| URL state | nuqs |
| Async state | TanStack Query |
| Agent runtime | **Eve** |
| Model access | Vercel AI Gateway |
| Generated UI | **OpenUI Lang** |
| Agent interoperability | **MCP Streamable HTTP** |
| Embedded UI | **Official MCP Apps** |
| Testing | Vitest, Eve evaluations, MCP contract tests |
| Quality | Oxlint, Oxfmt, Ultracite |
| Development | Portless |
| Deployment | Vercel-first |
| Discoverability | OpenAPI, MCP metadata, Is Agentic readiness |

Use exact validated dependency versions. Apply security updates promptly through reviewed changes.

## 3. Two default agents

### Assistant — Public

The application's public interface for conversation, capability discovery and navigation.

- Branded web chat and MCP App.
- OpenUI Lang-generated, interactive components.
- Public MCP tools and resources.
- Read-only application information and safe actions.
- A useful demo that explains and demonstrates the starter's real capabilities.
- No account registration or login.
- Execution, token, request and cost limits.

### Operator — Protected

The private engineering and operational interface.

- Protected web chat and GenUI experience.
- Protected MCP server and tools.
- Application diagnostics, configuration status and health checks.
- Explicit allowlisted capabilities and execution limits.
- Evaluations covering authorization and tool behavior.
- Disabled or fail-closed when owner access is not configured.

**Security boundary:** No public end-user authentication system. Operator requires server-verified owner access for every protected surface. Access control is enforced independently of prompts and UI visibility.

Public Assistant must never access Operator's private tools or data.

## 4. GenUI and MCP Apps

**OpenUI Lang is the canonical generated-UI format.**

- Define a typed component registry using the official OpenUI APIs.
- Validate generated structures and actions against declared contracts.
- Render with the existing shadcn design system.
- Support streaming, loading, errors and empty states.
- Avoid arbitrary generated JavaScript or uncontrolled component execution.
- Reuse capability definitions across browser chat, Eve tools and MCP where appropriate.

**MCP Apps use the official extension specification.**

- Declare `ui://` resources and tool-linked metadata.
- Use the official MCP Apps SDK and message protocol.
- Package a branded, responsive Assistant experience.
- Support a protected Operator experience.
- Restrict CSP, network access and executable actions.
- Provide structured/text fallbacks when the host cannot display embedded UI.

The application must not invent an additional proprietary GenUI protocol.

## 5. Enterprise UX conventions

Inspired by SAP Fiori principles without adopting SAP components.

- Role-appropriate interfaces for Assistant and Operator.
- Consistent navigation, component behavior, terminology and feedback.
- Responsive and keyboard-accessible experiences.
- Semantic colors, accessible contrast and predictable states.
- Neutral visual identity, restrained typography and consistent spacing.
- Light and dark themes in browser and MCP App.
- Meaningful structured errors with actionable recovery guidance.

Start with a polished welcome page, theme switcher, chat and interactive GenUI demonstration—not a full fictional product.

## 6. Repository structures

### flow-next

Single Next.js application with local components, providers, API routes, Eve integration, MCP, MCP App, GenUI runtime and evaluations.

### flow-mono

Turborepo with:

- `apps/web` — the same functional Next.js and agentic experience.
- `packages/ui` — shared shadcn components, primitives, styling and tokens.

No additional shared packages initially. Application-owned agent logic and GenUI orchestration remain within the application unless real cross-application reuse justifies extraction.

## 7. Development scripts

| Script | Contract |
|---|---|
| `pnpm setup` | Check prerequisites and create missing `.env.local` non-destructively |
| `pnpm setup:portless` | Explicit proxy and trust setup |
| `pnpm dev` | Start development through Portless |
| `pnpm dev:app` | Start Next.js directly |
| `pnpm build` | Production build |
| `pnpm lint` | Oxlint and Oxfmt checks |
| `pnpm lint:fix` | Fix lint and formatting issues |
| `pnpm format` | Format source |
| `pnpm check-types` | TypeScript validation |
| `pnpm test` | Vitest |
| `pnpm qa` | Lint, types and tests |
| `pnpm eval` | Agent evaluations, including offline smoke cases |
| `pnpm agentic:check` | Evaluate deployed public agent readiness |

Keep script names and semantics equivalent across both repositories.

## 8. Security defaults

- Patched runtime and framework dependencies.
- Exact dependency versions and committed lockfiles.
- pnpm installation-script approvals and release-age policies.
- Secret scanning and dependency auditing in CI.
- No committed credentials or secrets required for local development.
- Deterministic, credential-free demonstrations.
- Explicit enablement of paid inference, with spending protections.
- Public endpoint rate limiting at the deployment boundary.
- Operator authorization verified on the server.
- Structured input validation and output constraints.
- No arbitrary command execution, filesystem writes or unrestricted network tools.
- Explicit CSP and permissions for MCP Apps.
- Protected Vercel previews and appropriate public endpoint exceptions.

Do not add a database, end-user authentication framework, or Redis merely to satisfy the starter architecture.

## 9. Agent discoverability

Both deployed templates expose truthful, usable machine-readable surfaces:

- OpenAPI specification.
- MCP tool discovery and Streamable HTTP endpoints.
- Relevant `.well-known` metadata.
- `llms.txt` and meaningful Markdown representations.
- Sitemap, canonical metadata and server-rendered public content.
- Structured HTTP errors and documented API contracts.

Use **Is Agentic** to evaluate public readiness. Address applicable failures and preserve actual scan evidence. Readiness scoring is not a security certification.

Private Operator endpoints remain protected and must not leak privileged capabilities through public discovery.

## 10. Verification

Both templates must pass:

- Fresh-clone installation and production build.
- Lint, strict typecheck and Vitest.
- Public and protected chat contract tests.
- Eve tool smoke evaluations.
- OpenUI Lang generation and component-validation tests.
- MCP initialization, discovery, tool invocation and resource tests.
- MCP App loading and tool/UI communication checks.
- Unauthorized Operator access and public-to-private isolation tests.
- Credential-free demo and provider-unavailable behavior.
- Vercel deployment verification.
- Is Agentic readiness assessment on the deployed public application.

Run `pnpm qa`, `pnpm build`, appropriate agent evaluations and security checks in GitHub Actions. Verify MCP App behavior in at least one compatible host before calling the starter release-ready.

## 11. Repository and initialization conventions

- Conventional Commits.
- Lightweight staged-file pre-commit lint/format checks without automatic rewrites.
- No mandatory pre-push hook.
- Minimal technical README.
- Only framework-required or generated agent instructions.
- No bundled Flow Skills or custom agent methodology.
- Explicit Vercel configuration.
- GitHub template repositories.
- Flow Skills optionally handles clean Git initialization and project, package and Portless naming.

Both templates must work independently through GitHub's **Use this template** workflow.

## 12. Implementation ownership

| Agent | Responsibility |
| --- | --- |
| **flow-next** | Build and verify the complete single-app technical baseline. |
| **flow-mono** | Deliver the same capabilities in a minimal Turborepo structure, reusing shared UI only where warranted. |
| **flow-skills** | Implement portable project initialization and template selection without introducing runtime dependencies or changing Flow Lite into a workflow router. |

All agents follow this specification as the common contract and report verified behavior separately from untested claims.

## flow-skills acceptance criteria

- Documented way to choose **flow-next** vs **flow-mono** and apply naming (project, packages, Portless) without modifying template source for Flow methodology.
- Initialization does not install Flow Skills into generated projects unless the user explicitly adds them later.
- Flow Lite remains context alignment only; no template pipeline or mandatory skill sequence.
- Validator and contract tests continue to enforce fourteen-skill boundaries and no init requirement in the distribution itself.

## Out of scope

- Flow Factory orchestration changes unless required for template CI or deployment smoke.
- Bundling Flow Skills or Flow documentation inside template repositories.
- End-user authentication products, databases, or Redis as starter defaults.

## Testing decisions

- Template verification lives in **flow-next** and **flow-mono** per section 10.
- flow-skills changes prove initialization paths with structural or smoke tests where feasible without coupling to template runtime code.
