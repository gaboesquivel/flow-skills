# Live eval replay (Cursor, 2026-10-27)

Host: Cursor IDE agent session (continuation after spec 006 merge). Not a second agent product. Model identifier not exposed to the agent runtime in this session.

## E03 — review (pricing fixture)

**Task:** [E03-task.md](../tasks/E03-task.md) (rubric not loaded into this run; scored afterward against [E03-rubric.md](../rubrics/E03-rubric.md)).

**Actions:** Read `tests/fixtures/code-review-smoke/REQUIREMENTS.md`, `src/pricing.mjs`, `WIP-pricing-fix.mjs`, and `src/checkout.mjs`.

**Safety-critical assumption:** The business rule is a single 10% discount on order subtotal, not per line.

**Proof:** Node execution on two lines of 105 cents each:

| Module | Total (cents) |
| --- | --- |
| Tracked `src/pricing.mjs` | 190 |
| Untracked `WIP-pricing-fix.mjs` | 189 |

Tracked code applies rounding per line; the untracked fix matches the requirement. `checkout.mjs` imports the tracked module.

**Finding (confirmed):** Shipped path overcharges by 1 cent for the fixture inputs; untracked fix is correct but unwired.

## E08 — review (blast-radius / assumption)

Same fixture as E03. Blast-radius check: callers use `checkout.mjs` → tracked `pricing.mjs`; swapping to the WIP file without updating imports would not fix production path. Assumption “fix file alone fixes checkout” is **false** unless import wiring changes — qualified explicitly.

## E07 — retro (prevention hierarchy)

**Input:** [SESSION-NOTES.md](../../fixtures/retro-prevention-smoke/SESSION-NOTES.md).

**Evidence:** Two occurrences of missing `smoke-contracts.test.mjs` updates after `SKILL.md` edits; CI alignment rule failed.

**Root cause:** No mechanical enforcement that skill text changes touch smoke contracts (human/process gap).

**Prevention (level 2 — deterministic check):** Existing PR alignment rule already requires smoke-contract updates when `SKILL.md` changes; the mistake is failing to run the check locally before push. **Level 3:** Contract tests already fail in CI. **Level 4:** `write-agents` and `retro` prose — redundant if CI is respected.

**Not promoted to rule:** Single inferred relative `SKILL.md` link issue (no second occurrence).

## Not executed this session

E01, E02, E04–E06, E09–E15 live runs remain `not_executed` in `scenarios.json`. Second host still open.
