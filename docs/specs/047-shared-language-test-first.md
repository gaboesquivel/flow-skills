# 047 — Shared language and behavior-first checks

Status: draft (2026-10-31)

## Problem Statement

Two engineering habits Flow already values are left to chance during ordinary delivery.

**Shared language.** `GLOSSARY.md` is consulted when someone invokes `domain-modeling`, which describes itself as "not for routine vocabulary lookup", and when `to-spec` and `to-tasks` write prose. `build` and `review` never check that code identifiers, test names, and agent interfaces (tool and API names) use the resolved term. An agent that meets "reservation" in a request names it `reservation` in code, although the glossary calls the concept a **hold**. The drift shows up later as a second word for one concept, or as a question the glossary already answered.

**Behavior-first checks.** [Decision 0042](../decisions/0042-outcome-build-and-ship.md) item 5 requires that a seam named in a spec or task be covered by a check that fails if the behavior is missing. Nothing helps a spec or task name that behavior and its check precisely, and `build` itself does not state the rule. The agent ends up either writing prescriptive steps instead of observable behavior, shipping a change with no test that would catch its absence, or rerunning the full suite repeatedly while it works.

## Solution

Make both habits defaults inside the skills that already do the work, in proportion to the change, with one home per rule. This adds no skill, no document type, and no ceremony.

1. **Glossary terms are the names.** A resolved `GLOSSARY.md` term names its concept everywhere: product context, specs, tasks, agent interfaces, code identifiers, and test names. When work meets a synonym or an ambiguous term that changes behavior, the agent settles it from the glossary, then from code and docs, and uses the resolved term without asking. It asks one question, with its guess, only when those sources conflict or are silent and the meaning changes the behavior. A term is added to the glossary only when it is resolved and will recur. Generic vocabulary stays out, and so do bounded contexts, aggregates, and other architecture patterns.
2. **Specs state behavior, not steps.** A spec's Testing Decisions name the observable behavior as concrete domain examples with realistic data, the invariants that must always hold, and the **focused check** that proves each: the seam and the command that runs only it. Implementation instructions belong in Implementation Decisions only when they are real constraints.
3. **Build proves behavior with a focused check.** A behavior change ships with a focused check that fails without the change and passes with it (0042 item 5, now stated in `build`). The agent runs that focused check while it works; the full suite still runs once, on the final head ([decision 0044](../decisions/0044-fast-delivery.md)). Test order stays the agent's choice (see Open decisions).
4. **Proportion.** Documentation-only, configuration, and copy changes need no new check. A prototype is disposable and needs none. A small behavior fix needs one focused check or the reproduction `debug` already requires. No change gets a new document for this practice.

## User Stories

1. As a maintainer, I ask "let members extend a reservation" in a project whose glossary defines **Hold**. The agent writes `extendHold` and a test named for holds, adds no glossary entry, and asks me nothing.
2. As a maintainer, when the glossary says a hold lasts three days and the code says seven, the agent asks one question with its guess instead of picking silently.
3. As a reviewer, I see a finding when a diff introduces a second name for a glossary concept, or when a behavior change has no check that would fail without it.
4. As a maintainer fixing a typo in docs, I get no test, glossary edit, or question.

## Implementation Decisions

Each rule gets one home; other skills link to it with a clause, never a copy.

| Rule | Home | Linked from |
| --- | --- | --- |
| Glossary terms are the names; resolving an ambiguous term during other work (item 1) | `domain-modeling`, new **Shared language** section. Its "not for routine vocabulary lookup" sentence changes: lookup is routine, and invoking the skill is for refining the model. | `to-spec` Process step 1 (replacing "use the project's domain vocabulary"), `to-tasks` step 2, `build` Outcome, `review` Readability axis |
| Behavior, examples, invariants, focused check in a spec (item 2) | `to-spec` Testing Decisions template, as a **Behavior and checks** paragraph before the acceptance scenario | `to-tasks` task template (acceptance criteria are observable behaviors, each with its focused check when one exists) |
| Focused check proves a behavior change; run it while working; proportion (items 3, 4) | `build`, a short **Behavior evidence** paragraph under Verify | `review` Correctness axis ("a check that would fail without the change"); `debug` keeps its own reproduction rule |

- **Glossary writes.** `build` and `to-spec` may add or update a resolved term in the same commit as the work that resolves it; `domain-modeling`'s format applies. Neither writes an entry for a term used once.
- **Flow's own context.** [Methodology: Maintain shared language](../methodology.md#maintain-shared-language) links to the new `domain-modeling` section instead of restating it. `GLOSSARY.md` gains **Focused check**. `PRODUCT.md` is unchanged: principle 5, "Evidence over claims", already covers it.
- **Smoke contracts.** `tests/smoke-contracts.test.mjs` pins the three homes (the glossary-names rule, the Behavior and checks paragraph, and the Behavior evidence paragraph) and the absence of a mandated test order.
- **Exposure:** none. This changes skill text only, with no deployable behavior.

## Testing Decisions

Structural pins catch a lost rule; they do not show an agent follows it. The proof is one live run on a fixture project, recorded under `tests/evals/records/` with the procedure in [tests/evals/README.md](../../tests/evals/README.md). The run compares the current skills with this spec's skills, as [spec 041](041-skill-evaluation.md) asks for a meaningful skill change.

**Fixture** (under `tests/evals/tasks/`). A small Node library-lending module with `GLOSSARY.md` defining **Hold** ("a member's claim on a copy that expires three days after it is placed; a hold can be extended once, by three days") and **Loan**, `lib/holds.mjs` with `placeHold`, and a `node --test` suite of about 20 tests in several files. A test-command line in `AGENTS.md` shows how to run one file.

**Acceptance scenario.** Actor: a maintainer talking to an agent with Flow installed, starting on a clean branch of the fixture.

1. The maintainer says "let members extend a reservation by three days; build it". → The agent asks no question. The code and the new test use **hold** (`extendHold`, `describe('extendHold')`); `reservation` appears nowhere in the diff. No spec, decision, or glossary entry is created.
2. The agent proves the change. → The diff adds a focused test that fails on the base commit and passes on the head, covering the example (expiry moves from day 3 to day 6) and the invariant (a second extension is refused). The run log shows the focused test file run while working and the full suite run once, on the final head.
3. On a second branch, the fixture's code sets a seven-day expiry against the glossary's three. The maintainer says "let members extend a hold; build it". → The agent asks exactly one question naming both values, with its guess, before changing expiry behavior.
4. The maintainer says "fix the typo in README; build it". → One commit changes the README only, with no new test, glossary edit, or question.
5. The run record compares both skill versions on user turns, questions asked, files created, full-suite runs, and whether a check that would fail without the change exists. → This spec's skills are no worse on turns and suite runs, and better on vocabulary and focused evidence. One run per condition; a small or noisy difference is reported as such.

## Downstream implications (no edits in this spec)

- **Flow Next and Flow Mono.** Their skills lock keeps one third-party TDD skill ([decision 0045](../decisions/0045-templates-pin-flow-skills.md)). Once `build` states behavior evidence, that skill overlaps it; the template repositories decide whether to drop it. Their baseline `AGENTS.md` should show how to run one test file so a focused check is cheap, and their baseline `GLOSSARY.md` stays a lazily filled file.
- **Signal** (flow-signal). As an adopter, its existing `GLOSSARY.md` terms become the names `build` and `review` hold its code to. Expect review findings where code uses older names; a rename is its own decision, not part of a feature.

## Direction changes

None. This preserves [0042](../decisions/0042-outcome-build-and-ship.md) items 1 and 5 (no mandated test order), [0044](../decisions/0044-fast-delivery.md) (checks once), [0015](../decisions/0015-tasks-and-domain-modeling.md) (one glossary, no bounded contexts), and [0045](../decisions/0045-templates-pin-flow-skills.md).

## Open decisions

1. **Check-first default.** Order-neutral, as specified: define the behavior and focused check before implementation (in the spec or task), and let the agent choose when to write the test. The alternative, "write the focused check first when practical", would make `build` prescribe test order, which amends 0042 items 1 and 5 and needs a Proposed decision record (0056). Recommendation: stay order-neutral; the user-visible outcome is the same evidence.
2. **Home of the shared-language rule.** `domain-modeling` (as specified) versus `write-agents` Owners. Recommendation: `domain-modeling`, which already owns the glossary format.

## Out of Scope

New skills; bounded contexts, aggregates, repositories, or context maps; coverage thresholds or a mandated red–green ritual; CI changes; glossary audits of existing projects; Flow Factory; edits to Flow Next, Flow Mono, or Signal.
