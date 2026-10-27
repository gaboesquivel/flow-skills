# 0008. Leading words and visual summaries

Status: accepted (2026-10-27)

## Context

Readers need a visual grasp of technical material, and skills need compact anchors so behavior stays recognizable. Matt Pocock's [writing-for-agents](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md) skill calls those anchors **leading words**. A same-day draft proposed a fifteenth skill, `human`, beside `tldr` and `write-humans`.

`tldr` already answered "show me" with diagrams and tables. `write-humans` already drafts prose. [PRODUCT.md](../../PRODUCT.md) says to prefer extending a skill over catalog growth.

## Decision

- Do **not** ship `human`. Extend `tldr` so a human summary, "show me", or session recap is visual: host generative UI (GenUI) when that session actually provides it; otherwise Mermaid, Markdown tables, and a short statement. Chart only stated quantities. Presentation does not authorize implementation.
- Keep `write-humans` for prose.
- Record one leading word per skill in the [skill catalog](../skills.md). The word must appear in that skill's description or body. Leading words are not a second catalog and not an invocation order.
- Define **Human summary** and **Leading word** in [GLOSSARY.md](../../GLOSSARY.md).

## Consequences

- The catalog stays at fourteen skills. `flow` stays the only discoverable skill.
- A draft `skills/human/` package is not part of the distribution.

## Supersedes

Does not extend the skill list in [0005](0005-misc-tldr-skill.md) or the fourteen-skill count in [0006](0006-flow-lite-and-flat-docs.md). It extends `tldr`'s behavior only. Portable install, Flow Lite, explicit activation for every other skill, and flat specs/decisions remain in force.
