# 013: Consolidation after Flow mode

Status: draft (2026-10-28). Decision: [0024](../decisions/0024-gated-hand-offs.md). Evidence: [adversarial review and live runs](../../tests/smoke/2026-10-28-flow-mode-live.md).

## Problem Statement

Specs 009–011 shipped in one day and made every skill speakable. An adversarial review of the result found that three write gates are loose (explore publishes specs and issues, to-tasks publishes issues, and one up-front yes in `ship` covers merging and pushing `main`), that docs still say skills never chain although they now hand off, that the delivery-mode rule and the phrase table live in several places and have drifted, and that `start` defaults to Full exploration. A live bootstrap also showed that the flow-next template ignores `AGENTS.md`, so the Flow block `start` writes is never committed. Skill text grew 28% in a day.

## Solution

1. **Gate every outward write.** Show the content and get an explicit yes before: writing a spec, publishing task records (GitHub issues or spec Tasks), and merging into or pushing `main` (a second gate showing the final diff summary, checks, and commit SHA). A plan yes never authorizes a merge. Side effects `ship` needs (creating task records, recording `Delivery:`) are listed in its confirmation, and the `Delivery:` line lands in a named commit.
2. **Name the hand-offs.** Skills may hand off to the next skill only by naming it and waiting for the user, except the documented hand-offs (`start` → `explore`, `explore` → `interview` → `grill`), each behind its own yes. Docs that say skills never chain say this instead.
3. **One home per rule.** The delivery-mode rule lives in `ship`; the phrase table lives in the `flow` block helper and is checked against skill descriptions by a test; the autonomous-mode note lives in `ship` and `explore` points to it. Other documents link.
4. **Lighter defaults.** `start` hands off to explore at Lite depth unless the user asks for more. Skill text shrinks where rules were duplicated.
5. **Honest evidence.** Record today's live runs. Spec 009's task-set dogfood is this spec's own delivery. Smoke contracts cover safety gates and defining behavior, not every sentence.
6. **Template fix.** flow-next tracks `AGENTS.md` (Next.js upserts its own block and keeps other content), so the Flow block is committed.

## Testing Decisions

- Smoke contracts for each gate: spec write, task publishing, the second `main` gate, and "a plan yes does not authorize merging".
- A test that every phrase in the Flow block's table appears in its skill's description.
- `pnpm validate`, `pnpm test`, `pnpm eval:check`, and the alignment check pass.
- Total `SKILL.md` word count does not grow.

## Out of Scope

- New skills or new delivery features.
- Live runs of every eval scenario.

## Tasks

Recorded as GitHub issues (pull-request mode; this repository's `main` requires pull requests).
