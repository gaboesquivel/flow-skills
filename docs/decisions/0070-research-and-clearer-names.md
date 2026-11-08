# 0070 — A research skill, clearer names, and an outcome in every initiative spec

Status: **Proposed** (2026-11-08). Spec: [070](../specs/070-product-engineering-partner.md). Amends [0062](0062-claude-code-first.md) (catalog: `product` and `flow` renamed, `research` added after spec 059 removed `competitors`). Builds on [0041](0041-align-skill.md), [0046](0046-measurement-assistance.md), and [0068](0068-experience-skill.md) (the new-skill test).

## Context

Flow should help a person discover that something already solves the problem, decline work against the product, or test cheaply before building. Three gaps stand in the way.

- **No owner for an explicit research request.** [Spec 059](../specs/059-claude-code-first.md) removed `competitors` after one read-only comparison in which it and no skill each scored 10/15 ([record](../../tests/evals/records/2026-11-03-build-vs-no-skills.md)). That run judged a one-off answer's constraints, insight, and usefulness. It did not test proactive consideration of alternatives in `explore`, a durable artifact from an explicit request, or whether another session can decide from that artifact.
- **Names that hide jobs.** `product` checks fit and evidence, read-only; `flow` writes root documents and shares the plugin's name. Users say "check alignment" and "sync the docs".
- **No outcome sentence.** A spec proves the behavior works, not how anyone will judge whether to keep it, so "did it land?" has nothing to look for.

## Decision

1. **Add `research`.** One skill for "research X" (a sourced note in the project's research home), "competitors for X" (a competitive brief), and "just tell me here" (chat). It passes 0068's test: a recognizable job; source discipline beyond ordinary reasoning (dated findings, observed capability apart from vendor claim and inference, no absence claimed from a failed search); a durable artifact another session can decide from; `explore` keeps research it does for a conversation in chat and so does not cover the artifact; optional; and about 450 words. A research write never adopts a recommendation or edits `PRODUCT.md`.
2. **Rename `product` to `align`** ("check alignment", "are we building the right thing", "did it land"), restoring 0041's name for the same read-only job. **Rename `flow` to `sync-docs`** ("sync the docs", "update the docs", "set up Flow here"); `flow` stays the plugin and project name. No alias skills: natural phrases carry over, explicit slash paths change, and the Flow block's pointer is rewritten on its next write.
3. **An initiative spec carries one outcome sentence**: what should change for whom, the evidence that will be looked at, and the decision it informs. It references an existing metric definition rather than copying it (0046). Delivery proof (the behavior works and the observation can be obtained) stays distinct from outcome evidence, which `align` judges after shipping. A typo or internal cleanup carries none.

## Alternatives

- **Restore `competitors` as it was.** Rejected: it tied with no skill as an answer generator; the gap is the artifact and the general research request, and a competitive brief is one use of research.
- **Fold research into `explore`.** Rejected: `explore` is write-free discussion, and folding a write path into it would weaken that guarantee.
- **Keep the old names and improve descriptions.** Rejected: `flow` as a skill and a plugin (`/flow:flow`) and `product` as a check both mislead; descriptions alone did not reach "check alignment".
- **Keep alias skills for the old names.** Rejected: two identical skills in every listing cost words and confuse invocation.
- **A metrics section or dashboard in every spec.** Rejected: one sentence answers "how will we know"; instrumentation enters scope only when the decision depends on it.

## Consequences

- The catalog grows to 15 skills; words stay within the 10,000 budget by trimming.
- Users with saved `/flow:product` or `/flow:flow` habits must use the new paths; phrases are unaffected.
- `explore` looks for existing alternatives on substantial work, which costs a search on those decisions and saves a build when something already fits.
- Whether the research artifact and the alternatives step change decisions is unmeasured; spec 070's outcome line names the observation.
