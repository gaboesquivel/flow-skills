# Judgment and experience: sources and limits

Inspected 2026-11-04 against `main` at `6a7efdd`. Supports [spec 068](../specs/068-experience-judgment.md) and [decision 0068](../decisions/0068-experience-skill.md).

## Sources

- **Heitor Lessa** and **Gregor Hohpe**: two talks ([Lessa](https://www.youtube.com/watch?v=SXg08HPpKr8), [Hohpe](https://www.youtube.com/watch?v=F8X9_Dp3ZUk)). Not watched or transcribed for this change. Their lessons come from the maintainer's earlier review, summarized in the work brief: question whether a feature is worth building before implementing it, require evidence over confident summaries, fix recurring friction at its source (Lessa); an architect amplifies other people's judgment, models exist to answer questions, scout the real system, and keep inherent complexity understandable (Hohpe). Treat them as the maintainer's reading, not verified claims about the talks.
- **Guillermo Rauch**, read 2026-11-04:
  - [rauchg/skills](https://github.com/rauchg/skills) (MIT): `ui-recording-timeline` turns a screen recording of a UI into an inspectable paint timeline; the agent judges which changes are real, a script does the repeatable processing. Requires `ffmpeg` and `uv`.
  - [rauchg/gdp-ts](https://github.com/rauchg/gdp-ts): a library, linter, and skill applying Ghosts of Departed Proofs so authorization bugs fail at compile time.
  - Not read: [skills.sh/rauchg](https://skills.sh/rauchg), [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills), and his interviews beyond the [First Round interview](../research/2026-10-19-iteration-and-documentation.md).

## What Flow takes

The principle, never the tool or wording: make hard-to-see behavior observable evidence ("make quality observable"), and encode guarantees where a mistake is costly (already `build`'s contract-first rule, [0056](../decisions/0056-contract-first-tests.md)). The experience skill and the other edits are Flow's own interpretation and are not attributed to any of the three.

## Limits

Single read of two small repositories; no run of either skill; no evaluation of whether `experience` improves outcomes, which the next real exercise should show.
