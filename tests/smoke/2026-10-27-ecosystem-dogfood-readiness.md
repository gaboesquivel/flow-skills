# Ecosystem dogfood readiness (2026-10-27)

**Task:** Close the pre-dogfood cleanup across flow-skills, flow-next, and flow-mono (workflow skill deduplication, spec 005 interop docs, verification).

**Skills followed:** None invoked by name in this pass; work followed the bounded cleanup plan and [methodology dogfood](../../docs/methodology.md#dogfood) evidence rules.

## Structural evidence

| Repository | `main` SHA | CI on merge | Notes |
| --- | --- | --- | --- |
| flow-skills | `54cdcc0` | success | [PR #10](https://github.com/gaboesquivel/flow-skills/pull/10) |
| flow-next | `e63fb72` | success | [PR #3](https://github.com/gaboesquivel/flow-next/pull/3); 23 technical skills in lockfile |
| flow-mono | `5055c2d` | success | [PR #3](https://github.com/gaboesquivel/flow-mono/pull/3); 24 technical skills in lockfile |

Local commands on starter merges: `pnpm security:check`, `pnpm qa`, `pnpm eval:offline`, `pnpm build` — all passed before merge.

flow-skills: `pnpm validate`, `pnpm test` — passed on doc branch and on `main` after merge.

## Live evidence

| Check | Outcome |
| --- | --- |
| Production `https://flow-next.vercel.app` `/`, `/genui`, `/.well-known/mcp.json` | HTTP 200 |
| Production `https://flow-mono.vercel.app` same paths | HTTP 200 |
| Vercel deployment status on merge SHAs | success (GitHub commit status) |
| `npx skills add gaboesquivel/flow-skills -l` | 15 skills listed (includes `start`) at `54cdcc0` era `main` |
| Is Agentic `flow-next.vercel.app` | 90/100 — https://is-agentic.com/scan/flow-next.vercel.app |

**Not verified:** Live AI Gateway inference on production; Operator OAuth/OIDC; embedded MCP App in an external host; second agent host slash-command run.

## Decision

**GO** for manual product dogfooding on template `main`. Spec 005 release gates remain a separate track from this readiness milestone.

## Adopter repos

No adopter product repository was initialized in this pass. Next product work should pick a real repo and optionally invoke [`start`](../../skills/start/SKILL.md) or **Use this template** on flow-next / flow-mono.
