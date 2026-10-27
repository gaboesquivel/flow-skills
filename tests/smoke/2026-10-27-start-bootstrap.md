# Dogfood: `/start` bootstrap (2026-10-27)

Host: Cursor. Structural checks plus live disposable initialization using the new `start` skill modules and procedure.

## Task

Expand `start` so `/start` renames a template, verifies setup/QA/build/eval/startup, writes baseline product docs, and creates one independent initial commit when checks pass.

## Skills followed

- **implement** — `skills/start/lib/*`, `SKILL.md`, tests, catalog copy.
- **review** — self-check on git safety, instruction-file boundaries, and commit gating before PR.

Live bootstrap followed the `start` verification table (not a separate host skill invocation).

## Structural evidence

| Check | Result |
| --- | --- |
| `pnpm validate` | pass |
| `pnpm test` | pass (`tests/start-bootstrap.test.mjs`, E12 executable fixture) |

## Live flow-next (`Acme Radar`)

| Field | Value |
| --- | --- |
| Template | `gaboesquivel/flow-next` @ `e63fb724ef7fb109e70f966bf282a52cc23f148a` |
| Destination | `/tmp/start-dogfood-acme-radar` |
| Portless | `https://acme-radar.localhost:1355` |
| Commands | `pnpm setup`, `pnpm qa`, `pnpm build`, `pnpm eval` — all pass |
| HTTP smoke | `/`, `/genui`, `/.well-known/mcp.json` → 200; `POST /api/mcp/operator` without secret → 503 (fail closed) |
| Baseline docs | `oxfmt --write` on root docs before `pnpm qa` (format check) |
| Initial commit | `55c4122ca514f6d2e121e56ebdc29545aab1922f` (`chore: initialize acme-radar`) |
| Remotes | none (fresh `git init` after removing template `.git`) |

## Live flow-mono (`Acme Mono`)

| Field | Value |
| --- | --- |
| Template | `gaboesquivel/flow-mono` @ `5055c2d27c4265958d7d60ea88863be33363c01d` |
| Destination | `/tmp/start-dogfood-acme-mono` |
| Rename + stale scan | pass (17 allowlisted files) |
| `pnpm setup` + `pnpm qa` | pass after `oxfmt` on baseline root docs |
| `pnpm build` | pass (`/tmp/start-dogfood-acme-mono`, 2026-10-27 follow-up) |
| `pnpm eval` | offline GenUI **102/102** pass; Eve `eval --tag smoke` requires `--agent` (not run) |
| Portless HTTP smoke | not run (flow-next path covered startup + HTTP) |

## Not verified

- Push to user GitHub remote.
- Second agent host invocation of `start`.
- flow-mono Portless startup + HTTP table (same as flow-next checks).
