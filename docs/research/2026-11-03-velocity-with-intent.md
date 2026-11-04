# Velocity with intent: sources and audit check

Inspected 2026-11-03 against `main` at `f483ec3`, flow-next and flow-mono at their latest `main`. Supports the verification, spec-sizing, and [boundary](../decisions/0067-flow-boundaries.md) decisions of that date.

## Sources

All three by Addy Osmani, read 2026-11-03; paraphrased.

- [Comprehension debt](https://addyosmani.com/blog/comprehension-debt/) (2026-03-14): the gap between how much code exists and how much any person understands. Velocity and test metrics stay green while it grows, so passing tests are necessary, not sufficient.
- [The Intent Debt](https://addyosmani.com/blog/intent-debt/) (2026-06-05): missing rationale, goals, and constraints. Agents fill the gaps with plausible guesses, so intent belongs in artifacts they can read. He credits the three-debt framing to Margaret-Anne Storey.
- [The Orchestration Tax](https://addyosmani.com/blog/orchestration-tax/) (2026-05-24): the person is the serial resource all agent output passes through, so more agents lengthen the review queue. Scale parallelism to review capacity.

What Flow takes: keep understanding and rationale by design, size parallel work to what a person can judge, and do it without new artifacts.

## Audit check

A maintainer audit named eight bottlenecks. Each was checked against code; two did not hold.

| Finding | Result | Evidence |
| --- | --- | --- |
| A. `start`'s `qa` gate is expensive | **Not confirmed** for `qa` | `pnpm qa`: flow-next 3.9 s to about 8 s across two runs, flow-mono about 9 s, after install. Waiting on a deployment is a design concern, not measured |
| B. Testing rules overprescribe | Confirmed | `build` Tests; [0056](../decisions/0056-contract-first-tests.md) |
| C. Deep review triggers too often | Confirmed | Size guard listed "new product behavior" as High |
| D. Hard spec length | Confirmed | `collectSpecLengthErrors` in `scripts/validate.mjs` |
| E. Task slicing limits parallelism | Confirmed | "Prefer the fewest" and coarse areas in `to-tasks` |
| F. First-MVP model unclear | Confirmed | `explore` New product specs |
| G. CI duplicates work | **Not material** | Last 30 runs per starter: median about 65 s on push and 66–73 s on pull requests. flow-next already builds the MCP bundle once; flow-mono repeats a 3 s build in a parallel job |
| H. Plugin and starter drift | Partly confirmed | `start`, `flow`, and the docs assumed a starter path. Core delivery skills name no starter or Vercel |

## Limits

Local timings are one or two runs on the maintainer's machine with a warm pnpm store, install scripts skipped, and the template's small test suites; CI and a real project will be slower. `pnpm setup` and deployment time were not measured. No live agent run tested these skill changes.
