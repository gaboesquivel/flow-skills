# 0019 — Voice-first invocation

Status: **Accepted** (2026-10-28). Partially supersedes [0004](0004-portable-skill-catalog.md), [0006](0006-flow-lite-and-flat-docs.md), [0008](0008-leading-words-and-visual-summaries.md), [0013](0013-restore-engineering-skills.md), and [0017](0017-claude-code-skill-coexistence.md). Amended by [0024](0024-gated-hand-offs.md) (named, gated hand-offs). Amended by [0028](0028-build-and-ship.md) (ship lands with no confirmation). Amended by [0047](0047-delivery-phrases-are-approvals.md) (one trigger set per delivery skill; Flow claims "push it" and "deploy it").

## Context

[PRODUCT.md](../../PRODUCT.md) says ordinary language should be the complete user interface to Flow and that skills are optional conveniences. The catalog does the opposite. Every skill except `flow` sets `disable-model-invocation: true`, and `scripts/validate.mjs` fails the build otherwise. A plain request reaches a Flow skill only when the user types its slash command or names it. [0017](0017-claude-code-skill-coexistence.md) records the effect in Claude Code: "review this" reaches the built-in, not Flow.

The primary way the maintainer works is speech: talking to the agent or dictating with voice-to-text. Leading words were meant to be what a user says to reach a skill ("interview me" uses `interview`). [0008](0008-leading-words-and-visual-summaries.md) instead defined them as agent-facing anchors, so the catalog lists phrases nobody says, such as "Label unresolved assumptions".

Manual-only invocation came from [0001](0001-curated-distribution.md), which rejected auto-invocation for context bloat and unintended workflows. That risk belonged to the retired router, which chained skills. A skill matched from a description does not chain, and every skill already states what it does not authorize.

Hosts give portable skills no priority mechanism; the model chooses from descriptions. Vercel's [`deploy-to-vercel`](https://github.com/vercel-labs/agent-skills/tree/main/skills/deploy-to-vercel) writes its description around spoken phrases ("deploy my app", "push this live"), deploys previews by default, and asks before pushing. Its [plugin](https://github.com/vercel/vercel-plugin) adds priority and path or command patterns, but only through its own hooks, which a portable skill cannot rely on.

## Decision

1. **Talking is the primary interface.** Ordinary language, including dictated speech, reaches every Flow skill. Slash commands remain optional shortcuts.
2. **Skills are model-invocable by default.** Only `start` stays explicit-only, because it creates a repository.
3. **A leading word is the user's phrase.** Redefine it as the short phrase a user says to reach a skill. Each `description` states what the skill does, then "Use when the user says …" with two or three dictation-safe variants: short, common words that survive speech recognition. The body keeps using that phrase as its behavior anchor.
4. **Flow owns intent and durable artifacts; the host owns execution.** Do not claim generic host verbs:
   - "Plan this" belongs to the host's plan mode. Flow's phrases are "spec it" (`to-spec`) and "break it down" (`to-tasks`).
   - "Review the code" belongs to the host's code review. Flow `review` answers alignment phrases such as "check it against the spec" or "are we aligned".
   - "Build it" and "ship it" may reach `implement` and `ship`; no Claude Code built-in claims them.
5. **`ship` confirms and hands off deployment.** Model invocation is allowed. Before pushing, `ship` states what it will commit and push and waits for a yes. Deployment defers to the platform's own skill or configuration when present (for example `deploy-to-vercel`) and prefers preview over production unless asked.
6. **Retire `simplify`, `security`, and `performance`.** They are generic, overlap host built-ins, and as model-invocable skills would compete with them on every request. Product-thinking skills are where Flow differs from host built-ins.
7. **Users control priority, not Flow.** [Agent compatibility](../agent-compatibility.md) documents an optional phrase-to-skill table users may paste into their own user-level instructions (for example `~/.claude/CLAUDE.md`). Flow never writes it. It resolves names only and does not chain skills.

## Rationale

Voice is the intended interface, and in current hosts only model-invocable skills with phrase-shaped descriptions can be reached by voice. Ceding generic verbs avoids a contest Flow cannot win portably and keeps Flow on intent work no built-in covers. Confirmation before pushing addresses misrecognized dictation better than manual-only invocation, which blocks voice entirely.

## Alternatives

- **Keep explicit-only invocation.** Rejected: contradicts the product promise and blocks voice.
- **Claim generic verbs with broad descriptions.** Rejected: unreliable against built-ins and surprising to users.
- **Collide on built-in names to shadow them.** Rejected: works on one host, fragments portability ([0017](0017-claude-code-skill-coexistence.md)).
- **Keep `ship` explicit-only.** Rejected: "ship it" is a natural spoken phrase; confirmation before pushing covers the risk.

## Consequences

- `validate.mjs`, `agents/openai.yaml` adapters, and contract tests enforce the new split: `start` explicit, every other skill implicit.
- Every `description` is rewritten with trigger phrases; [skill catalog](../skills.md) leading words become those phrases; [GLOSSARY.md](../../GLOSSARY.md) updates **Leading word**.
- Remove `skills/simplify/`, `skills/security/`, and `skills/performance/`; catalog drops to twenty-one skills.
- Update PRODUCT.md, README, agent compatibility, and every statement that skills require explicit invocation. State the skill count only where the validator list lives.
- Context cost rises: about twenty descriptions load in every session. Keep each to two sentences.
- Triggering is probabilistic. Acceptance needs a live smoke record: fifteen to twenty dictated plain phrases in Claude Code, with the skill each reached. Structural checks cannot establish it.
