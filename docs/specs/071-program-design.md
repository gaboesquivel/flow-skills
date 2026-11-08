# 071 — Product evidence and program design before code

Status: draft (2026-11-08). Appetite: one session.

## Problem

Engineers reach consequential product and architecture choices only after an agent has written code. `explore` asks about users, workarounds, and alternatives, but gives no concrete move when a proposed feature has weak evidence anyone needs it. `to-spec` permits a sketch "when it resolves a material uncertainty" without saying when that is or where to stop, so a spec either skips the choice (the agent picks silently in `build`) or over-designs. Evidence: [program design research](../research/2026-11-08-program-design.md) (Kent C. Dodds workshops, Dex Horthy interview); illustrative methods, not measured impact on Flow.

## Solution

Sharpen two existing owners; no new skill, stage, gate, command, or template.

- **`explore`.** With weak evidence, find one actual occurrence (when it last happened, what the person did, what it cost), existing evidence first. When plausible alternatives differ materially, name the continuing responsibility each introduces. When a first-release cut is genuinely hard, name the basic expectation whose absence makes the product unusable even if its differentiator works. No questionnaire, no Kano scoring.
- **`to-spec`.** A program-design trigger inside Decisions: two plausible implementations satisfy the happy path but assign decision authority, state changes, data ownership, or failure handling differently, and it matters. Then trace one representative operation in the smallest form that exposes the choice, name the trade-off (unsettled is an open question), and stop once a maintainer can see it and the first slice can exercise it. An established pattern is reused. The decision-record threshold, `ARCHITECTURE.md`'s role, and `design`'s scope are unchanged; `to-tasks` already requires demonstrable vertical slices.

## Decisions

- The trigger lives in the spec's Decisions section, not a separate skill: the research note found no evidence the existing spec cannot carry it, and a skill would add an invocation and handoff.

## Acceptance

**Acceptance scenario.** A maintainer reads the edited skills against three cases:

1. A copy fix: `explore` asks nothing; `to-spec`'s trigger does not fire (no two plausible implementations differ materially), so it proceeds directly.
2. A feature following an established repo pattern: the trigger is settled by the pattern, which the spec links and reuses.
3. Flow Signal suggests an existing request before a duplicate is filed, used by a widget and an MCP caller (illustrative only). The trigger fires: the spec names whether a match can cast a vote or the submitter must choose, whether both callers share one operation enforcing it, and whether submission proceeds or waits when matching is unavailable (feedback capture versus duplicate prevention), leaving the last as an open question rather than picking; the first slice exercises it. It does not design every function or list a file tree.

## Out of Scope

Changes to `to-tasks`, `design`, `ARCHITECTURE.md` guidance, the decision-record rule, or Flow Signal.

## Tasks

- [x] 01: Weak-evidence and program-design guidance. Area: skills/explore, skills/to-spec.
