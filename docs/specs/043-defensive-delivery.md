# 043 — Defensive, budget-aware delivery discipline

Status: **accepted** (2026-10-31)  
Repository: `gaboesquivel/flow-skills`  
Priority: **P1 — after coordination contract**  
Dependency: spec 042 conventions; can be drafted in parallel but integrate after coordination.

## Problem

The maintainer reported that during Signal a roughly three-hour first-MVP target expanded into repeated product bets, large pull requests, expensive evaluations, extra user decisions, and extensive integration work. Flow's existing exploration and spec rules did not consistently challenge *new user scope* or *agent-invented scope* against a binding delivery constraint. Some historical decisions prescribe competing worker and wave behavior.

## Outcome

Flow behaves as a proactive, respectfully adversarial product-engineering partner: help clarify intent early; explicitly defend the delivery boundary while executing; challenge new features/decisions, overengineering and unrequested work; avoid silently dropping accepted requirements. Budget limits influence scope, not correctness or required CI/security controls.

## Behavioral contract

- For a **new project or substantial feature** establish outcome, user/agent beneficiary, proof, first valuable increment, delivery appetite/target (time), relevant model/eval/infra cost budget when material, and explicit non-goals. Recover known information and ask only the one or two consequential missing questions; always suggest a reasonable default. A time budget is a target and constraint, not a guarantee.
- For a **small understood change** do not force an interview, spec, new issue, or budget questionnaire; infer and execute with proportionate verification.
- Record a bounded timebox and acceptance boundary in the *increment's spec or linked issue*, not as a global product attribute. Long-lived product goals/OMTM remain in `PRODUCT.md`. Store start/end evidence when observable, mark unavailable telemetry 'not measured' rather than invent elapsed time or cost.
- When new scope appears mid-flight, perform a **scope trade-off**: recommend *defer, replace, reject, or explicitly expand budget*. Name which acceptance criterion or constraint changes; require an explicit user decision only when consequential. Protect against the user expanding scope, and against an agent silently inventing abstractions or side projects. Do not scold, nag or block minor implementation choices.
- A correctness, security or deployment blocker is not optional feature creep: resolve within the scope when possible, or report that the original delivery cannot safely ship on time.
- Verify actual diff against accepted intent and declared non-goals; flag unrelated refactors, dependencies, infrastructure, UI surfaces, test harnesses and new specs. Equally flag missing approved behavior. Do not replace human judgment with a brittle changed-file count.
- Preserve verification time and cost budgets. Follow the repository’s check policy. Use focused tests when needed to resolve implementation uncertainty; do not prescribe repeated runs. Preserve final-head verification and rerun affected checks when changes invalidate the evidence. Risk-proportionate independent review, not per-task/per-wave repetition. For AI: use capped cheap fixtures and offline evaluations by default; expensive live models, historical stress tests and external-provider operations only when justified by the decision they enable. Surface expected consumption and user approval if a new consequential spend is needed.
- Make reproducible, testable proofs, not long ceremonies. Prefer *what and evidence* over dictated execution mechanism.

## Artifact policy

- **Spec** for a bounded, verifiable delivery bet when durable scope helps; not required for straightforward fixes. It may contain optional task slices. No mandatory multi-spec cascade.
- **Multiple specs** only when increments independently provide useful proof, can be safely shipped separately, exceed a delivery appetite, or depend on learning from an earlier bet. Later uncertain bets are not automatically candidate files; preserve promising ideas in the issue/backlog only if genuinely worth triaging.
- **Decision record** only for a choice between real alternatives that reaches beyond one spec or is expensive to reverse. Current truth stays in owner docs; `docs/decisions` preserves sparse historical *why*, with amendment/supersession links. Never make a second registry.
- **Task** only when delegation, dependencies, independently verifiable slices, or recovery benefit. A task need not equal a PR, worktree, issue, or wave.
- **Wave** is an optional scheduling description, never a mandatory checkpoint/gate. Favor ready tasks; parallelize where elapsed-time benefit exceeds context, worker startup, collision and integration costs. One integration owner. Keep work sequential when interfaces are unstable.
- **GitHub Issue** opens only on request and can track accepted or worthwhile deferred work without duplicating a spec. A session is not an issue.
- **PR** integrates one coherent deliverable with reviewed evidence, not a task or worker by default.

## Required skill changes

- `interview`, `start`, `explore`: high-value questions; time appetite, non-goals and first verified slice; concise hypothesis and useful default; no redundant confirmations; user-directed choices only.
- `to-spec`, `to-tasks`: bounded increments, split criterion, task granularity, sparse decisions, realistic acceptance, budget + exposure and measurement where relevant; avoid prescriptive file-by-file implementation lists.
- `build`, `ship`: scope and budget guard, safe CI/review gates, clear partial/shipped evidence, adaptive parallelism and limited expensive evals.
- `review`: compare diff, acceptance and evidence; include unintended additions and silently omitted outcomes; right-size risk and reviewer independence.
- `retro`, `measure`: report intent-to-shipped, delivery reliability, and cost per shipped feature with evidence quality; identify repeated mistakes, cheaper deterministic prevention first.
- Human documentation: `PRODUCT.md` goals and indicators, `docs/methodology.md` one clear active policy, `docs/README.md` artifact decision tree, relevant old decision back-pointers.

## Acceptance scenario

1. A three-hour MVP request elicits only missing consequential constraints; the agent recommends one verifiable minimal slice, states non-goals and preserves test/ship time.
2. Two hours into work the user asks for a dashboard. Agent identifies conflict and recommends defer/swap; it does not launch the dashboard without an explicit changed contract.
3. A worker proposes broad refactoring unrelated to acceptance. Agent rejects or defers it, while allowing justified small prefactoring needed to deliver.
4. A security/CI problem is discovered near the deadline: agent never weakens checks, declares shipped, or hides the delay.
5. A clear one-line fix proceeds without creating a spec, tasks, decision record, issue, or interview.
6. Parallelizing an otherwise trivial update demonstrably adds overhead; agent proceeds inline. For independent heavy slices the agent can parallelize safely.
7. Review explicitly catches out-of-scope additions *and* an unmet accepted requirement.

## Non-goals

No mandatory three-hour default for every project; no new skill or task tracker; no rigid worker cap or one-format interview; no continuous cost-monitoring daemon; no large evaluation harness for the methodology.

## Historical cases and references

Use Signal's Oct 30 log/PR history, including rapid first API/MCP slice followed by additional independently worthwhile—but later—bets, large PRs and repeated CI/eval work. Existing Flow decisions 0025, 0026, 0029, 0031, 0042–0044, 0048 have amendments; resolve operative policy in current skills and human methodology, preserve historical rationale, and do not reinterpret an old accepted but amended decision as a current command.

## Tasks

- [ ] 01: Capture consequential delivery constraints with minimal questions. **Area:** skills, docs. **Blocked by:** landed 042. Proof: substantial work records appetite, proof and non-goals; a small fix needs no interview.
- [ ] 02: Defend scope during delivery and review, including agent-invented additions and omitted requirements. **Area:** skills, docs. **Blocked by:** 01. Proof: the dashboard/refactor/blocker scenarios receive distinct, proportionate responses.
- [ ] 03: Align artifact granularity and economical parallelism. **Area:** skills, docs, repository root. **Blocked by:** 02. Proof: tasks need no extra issues/PRs/waves, and current docs agree with the accepted policy.

## Decision and delivery

Proposed decision: [0053](../decisions/0053-delivery-appetite-and-scope.md). Accept with this implementation, not when publishing the planning documents. Update affected historical pointers and current owner docs together. Preserve 0048's final-head review/check and build/ship contract.

One bounded PR after 042 lands. Walk through the acceptance scenarios; add executable regression tests only where a real mechanism exists. Follow repository check policy. No mandatory baseline experiment, new eval harness or ecosystem rollout. Report unmeasured cost and elapsed time honestly. The Signal retrospective is reported evidence, not a fresh independent log/PR audit; see 042's evidence boundary.
