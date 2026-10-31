# 047 — Shared language and contract-first tests

Status: implemented (2026-10-31)

## Problem Statement

Two engineering habits Flow already values are left to chance during ordinary delivery.

**Shared language.** `GLOSSARY.md` is consulted when someone invokes `domain-modeling`, which describes itself as "not for routine vocabulary lookup", and when `to-spec` and `to-tasks` write prose. `build` and `review` never check that code identifiers, test names, and agent interfaces (tool and API names) use the resolved term. An agent that meets "reservation" in a request names it `reservation` in code, although the glossary calls the concept a **hold**. The drift shows up later as a second word for one concept, or as a question the glossary already answered.

**Tests at the contract.** Principle 8, "Agent-first, API-first", has products define capabilities as contracts before interfaces, and `to-spec` already writes the API shape and MCP tool definitions before any UI. Nothing turns that contract into a test before the implementation, so an agent may ship an MCP tool or API route whose errors and permissions were never exercised. [Decision 0042](../decisions/0042-outcome-build-and-ship.md) item 5 requires a check that fails if a named behavior is missing, but `build` does not state the rule, and test order is left open. The opposite failure also happens: early UI gets brittle UI tests that churn with every design change, and the full suite reruns repeatedly while the agent works.

## Solution

Make both habits defaults inside the skills that already do the work, in proportion to the change, with one home per rule. This adds no skill, no document type, and no ceremony.

1. **Glossary terms are the names.** A resolved `GLOSSARY.md` term names its concept everywhere: product context, specs, tasks, agent interfaces, code identifiers, and test names. When work meets a synonym or an ambiguous term that changes behavior, the agent settles it from the glossary, then from code and docs, and uses the resolved term without asking. It asks one question, with its guess, only when those sources conflict or are silent and the meaning changes the behavior. A term is added to the glossary only when it is resolved and will recur. Generic vocabulary stays out, and so do bounded contexts, aggregates, and other architecture patterns.
2. **Specs state behavior, not steps.** A spec's Testing Decisions name the observable behavior at the contract as concrete domain examples with realistic data, the invariants that must always hold, and the **focused check** that proves each: the seam and the command that runs only it. Implementation instructions belong in Implementation Decisions only when they are real constraints.
3. **Contracts are test-first.** When a change adds or changes a contract (an API route, an MCP tool, or the domain function behind them), `build` writes the focused contract check first, sees it fail, then implements until it passes. The check covers what an agent depends on: input, result, the errors it can act on, and permissions. One check per behavior, never per function; internals behind the contract are not tested separately unless their logic is the risk.
4. **No UI tests by default.** UI changes, especially early ones, are verified by looking at the running preview (`review`'s UI axis and liveness), not by UI or end-to-end tests. A UI test is added only when the user or spec asks for one, or when the same UI regression has come back.
5. **Focused while working, full once.** The agent runs the focused check while it works; the full suite still runs once, on the final head ([decision 0044](../decisions/0044-fast-delivery.md)).
6. **Proportion.** Documentation-only, configuration, and copy changes need no new check. A prototype is disposable and needs none. A small behavior fix needs one focused check or the reproduction `debug` already requires. No change gets a new document for this practice.

A project can set its own testing policy in `ARCHITECTURE.md`, which owns system boundaries and contracts (`write-agents` Owners). A stated policy there overrides items 3 and 4. `PRODUCT.md` stays about outcomes and does not hold test policy.

## User Stories

1. As a maintainer, I ask "let members extend a reservation" in a project whose glossary defines **Hold**. The agent adds an `extend_hold` MCP tool and an `extendHold` route handler, with a test named for holds, adds no glossary entry, and asks me nothing.
2. As an agent user of that product, I call `extend_hold` on a hold that has already been extended and get an error that says so, because the contract check covered it before the tool existed.
3. As a maintainer, when the glossary says a hold lasts three days and the code says seven, the agent asks one question with its guess instead of picking silently.
4. As a maintainer adding an "Extend" button to the holds page, I get no UI test; the agent checks the preview instead.
5. As a reviewer, I see a finding when a diff introduces a second name for a glossary concept, or when a changed contract has no check that would fail without the change.
6. As a maintainer fixing a typo in docs, I get no test, glossary edit, or question.

## Implementation Decisions

Each rule gets one home; other skills link to it with a clause, never a copy.

| Rule | Home | Linked from |
| --- | --- | --- |
| Glossary terms are the names; resolving an ambiguous term during other work (item 1) | `domain-modeling`, new **Shared language** section. Its "not for routine vocabulary lookup" sentence changes: lookup is routine, and invoking the skill is for refining the model. | `to-spec` Process step 1 (replacing "use the project's domain vocabulary"), `to-tasks` step 2, `build` Outcome, `review` Readability axis |
| Behavior, examples, invariants, focused check in a spec (item 2) | `to-spec` Testing Decisions template, as a **Behavior and checks** paragraph before the acceptance scenario, beside its existing contract-first interfaces rule | `to-tasks` task template (acceptance criteria are observable behaviors, each with its focused check when one exists) |
| Contract test-first, no UI tests by default, focused then full, proportion, `ARCHITECTURE.md` override (items 3–6) | `build`, a short **Tests** section | `review` Correctness axis ("a changed contract has a check that would fail without the change; UI tests are not expected by default"); `debug` keeps its own reproduction rule |

- **Decision record.** Item 3 prescribes test order for contracts, which amends 0042 items 1 and 5. [Decision 0056](../decisions/0056-contract-first-tests.md) records it (Accepted), with back-pointers on 0042 and spec 028.
- **Glossary writes.** `build` and `to-spec` may add or update a resolved term in the same commit as the work that resolves it; `domain-modeling`'s format applies. Neither writes an entry for a term used once.
- **Flow's own context.** [Methodology: Maintain shared language](../methodology.md#maintain-shared-language) links to the new `domain-modeling` section instead of restating it. [Principles: Agentic](../principles.md#agentic) gains one sentence linking contract-first tests to `build`. `GLOSSARY.md` gains **Focused check**. `PRODUCT.md` is unchanged: principles 5 and 8 already cover it.
- **Eval scenario.** E43 (`tests/evals/`) holds the task, rubric, and fixture for the acceptance scenario. `tests/smoke-contracts.test.mjs` stays limited to safety rules, as [spec 031](031-fast-delivery.md) left it, so these rules get no wording pins.
- **Exposure:** none. This changes skill text only, with no deployable behavior.

## Testing Decisions

Structural pins catch a lost rule; they do not show an agent follows it. The proof is one live run on a fixture project, recorded under `tests/evals/records/` with the procedure in [tests/evals/README.md](../../tests/evals/README.md). The run compares the current skills with this spec's skills, as [spec 041](041-skill-evaluation.md) asks for a meaningful skill change.

**Fixture** (`tests/fixtures/e43-shared-language/`, task and rubric in `tests/evals/`). A small Node library-lending app with:
- `GLOSSARY.md` defining **Hold** ("a member's claim on a copy that expires three days after it is placed; a hold can be extended once, by three days") and **Loan**;
- `lib/holds.mjs` with `placeHold`, a `POST /holds` route, and a `place_hold` MCP tool;
- a holds page served by `npm start`;
- a small `node --test` suite in several files;
- a test-command line in `AGENTS.md` that shows how to run one file.

**Acceptance scenario.** Actor: a maintainer talking to an agent with Flow installed, starting on a clean branch of the fixture.

1. The maintainer says "let members extend a reservation by three days, from the API, the MCP server, and an Extend button on the holds page; build it". → The agent asks no question. The code, the route, the tool, and the new test use **hold** (`extendHold`, `extend_hold`, `describe('extendHold')`); `reservation` appears nowhere in the diff. No spec, decision, or glossary entry is created.
2. The agent writes the contract check first. → The session log shows the focused test file run and fail before any change to `lib/holds.mjs`, the route, or the tool. The test covers the example (expiry moves from day 3 to day 6), the invariant (a second extension returns an error naming the rule, through both the route and the tool), and a member extending someone else's hold (refused).
3. The agent finishes. → The focused test passes, and the full suite runs once, on the final head. The Extend button is checked in the preview; the diff adds no UI or end-to-end test.
4. On a second branch, the fixture's code sets a seven-day expiry against the glossary's three. The maintainer says "let members extend a hold by one hold period; build it". The extension now depends on what a hold period is. → The agent asks exactly one question naming both values, with its guess, before writing the extension.
5. The maintainer says "fix the typo in README; build it". → One commit changes the README only, with no new test, glossary edit, or question.
6. The run record compares both skill versions on user turns, questions asked, files created, full-suite runs, UI tests added, and whether the contract check failed before the implementation. → This spec's skills are no worse on turns and suite runs, and better on vocabulary and contract evidence. One run per condition; a small or noisy difference is reported as such.

## Downstream implications (no edits in this spec)

- **Flow Next and Flow Mono.** Their skills lock keeps one third-party TDD skill ([decision 0045](../decisions/0045-templates-pin-flow-skills.md)). Once `build` owns contract test-first, that skill overlaps it; the template repositories decide whether to drop it. Their baseline `ARCHITECTURE.md` already lists the MCP and API surfaces; it should name where each surface's contract tests live and how to run one file, and should not add a UI test runner by default.
- **Signal** (flow-signal). As an adopter, its `GLOSSARY.md` terms become the names `build` and `review` hold its code to, and its MCP tools and routes get contract tests as they change. Expect review findings where code uses older names; a rename is its own decision, not part of a feature. Existing UI tests stay; the default only stops new ones.

## Direction changes

[Decision 0056](../decisions/0056-contract-first-tests.md) amends [0042](../decisions/0042-outcome-build-and-ship.md) items 1 and 5 for contracts only. This preserves [0044](../decisions/0044-fast-delivery.md) (checks once), [0015](../decisions/0015-tasks-and-domain-modeling.md) (one glossary, no bounded contexts), [0023](../decisions/0023-agent-first.md), and [0045](../decisions/0045-templates-pin-flow-skills.md).

## Settled at acceptance

1. **Home of the shared-language rule:** `domain-modeling`, which already owns the glossary format (not `write-agents` Owners).
2. **Domain logic without a contract:** a pure domain rule that no API or tool exposes yet gets a focused check in any order, not test-first, until a fixture run shows the gap.

## Out of Scope

New skills; bounded contexts, aggregates, repositories, or context maps; coverage thresholds; a red–green ritual outside contracts; UI or end-to-end test infrastructure; CI changes; glossary audits of existing projects; Flow Factory; edits to Flow Next, Flow Mono, or Signal.
