# 0018 — Interview extracts the user's intent

Status: **Accepted** (2026-10-28). Related: [0004](0004-portable-skill-catalog.md), [0015](0015-tasks-and-domain-modeling.md), [0017](0017-claude-code-skill-coexistence.md).

## Context

`interview` shipped as a customer discovery skill: plan an interview guide for end users and synthesize transcripts. In practice the useful interview is with the person asking for the work. Requests often arrive without who, why now, success, or the binding constraint, and agents fill those gaps silently. `grill` stress-tests an idea or plan once one exists; nothing covered the step before it. Addy Osmani's [`interview-me`](https://github.com/addyosmani/agent-skills/blob/main/skills/interview-me/SKILL.md) addresses that step.

## Decision

- Rewrite `interview` as an adaptation of `interview-me`: a stated hypothesis with confidence, one question per message with a guess attached, a probe for "want vs. should want", a stop test (predict the next three reactions), a restate including out of scope, and an explicit yes before ending the turn.
- Keep the `interview` name. Move it from Product discovery to Delivery, between `explore` and `grill`.
- Drop customer interview guides and transcript synthesis. `jtbd` and `competitors` remain the product discovery skills.

## Rationale

Intent extraction is a recurring gap in agent work; customer interview planning was rarely invoked through an agent. `interview` and `grill` now differ by moment: before a plan exists versus challenging one. Keeping the name avoids install churn.

## Consequences

- `interview` carries Addy Osmani's MIT notice and source revision instead of the ProductSkills influence.
- Catalog, README, product identity, and `explore` describe the new purpose.
- Customer interview guidance is no longer a skill. Reintroduce it only if a recorded product decision needs it.
