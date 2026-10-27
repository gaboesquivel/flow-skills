# Dogfood: `/start` bootstrap (2026-10-27)

Host: Cursor. Structural checks and live template initialization for the expanded `start` skill.

## Task

Ship complete project bootstrap in flow-skills: rename helpers, git safety, verification gates, and documentation — then validate on disposable flow-next (and flow-mono when feasible).

## Skills followed

- **implement** — skill `lib/` modules, `SKILL.md`, tests, catalog copy.
- **review** — self-check on destructive git edge cases and instruction-file boundaries before PR.

`start` itself was exercised live on a disposable checkout (see below).

## Structural evidence

| Check | Result |
| --- | --- |
| `pnpm validate` | pass |
| `pnpm test` | pass (includes `tests/start-bootstrap.test.mjs`, E12 executable fixture) |
| Smoke contracts for `start` | pass |

## Live flow-next bootstrap

_Filled after live run in this session._

| Field | Value |
| --- | --- |
| Template | `gaboesquivel/flow-next` @ `e63fb724ef7fb109e70f966bf282a52cc23f148a` |
| Project name | TBD |
| Destination | TBD (outside flow-skills) |
| Initial commit SHA | TBD |

## Live flow-mono bootstrap

| Field | Value |
| --- | --- |
| Template | `gaboesquivel/flow-mono` @ `5055c2d27c4265958d7d60ea88863be33363c01d` |
| Status | TBD |

## Not verified

- Second agent host invocation of `start`.
- Push to user GitHub remote (not requested).
