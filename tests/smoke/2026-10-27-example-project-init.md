# Smoke evidence — example project init

Date: 2026-10-27

## Automated

- `pnpm validate` — pass (full catalog; count is not a product invariant).
- `pnpm test` — pass (bootstrap, install, package pack, reference closure).
- `node scripts/init/cli.mjs --skip-skills` run twice on `tests/fixtures/example-project` — verification OK; preamble preserved; single bootstrap block.
- `tests/init-integration.test.mjs` — offline CLI install copies bundled skills under `.agents/skills/`, merges bootstrap, writes manifest hashes.

## Manual (Cursor)

Bootstrap preservation on [example-project](../fixtures/example-project) matches `init-integration` expectations (preamble kept, single bootstrap block). Full scenario matrix: [scenario status](./2026-10-27-scenario-status.md).
