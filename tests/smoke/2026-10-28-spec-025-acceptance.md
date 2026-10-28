# Spec 025 acceptance run (2026-10-28)

Scenario: [spec 025](../../docs/specs/025-build-without-a-spec.md) Testing Decisions, run against `main` at `60a6c0b` by fresh Claude Code subagents that read the skill text from `skills/` and followed it, with the agent also playing the user. Scratch repositories only; local delivery, no remote.

| Step | Request | Verdict | Evidence |
| --- | --- | --- | --- |
| 1 | "build it: add a dark-mode toggle to the settings page" | satisfied | Size guard escalated (new product behavior); per-axis review plus verifier, one fix round; merge `13cf8d4` with `Reviewed:` and `Review: independent`, no `Spec:`; no `docs/` written |
| 2 | "build it: fix the typo in the footer" | satisfied | Size guard small; single-agent self-check; merge `584ee7a` with `Review: self-check`, no `Spec:` |
| 3 | "explore this: export settings as JSON", then "build it" | satisfied | Brief on `explore/export-settings-json`; reflog shows rename to `feat/export-settings-json` before the first code commit; escalated review; merge `60fa8b8` carries `PRODUCT.md` and the code together |
| 4 | "build it local" on a protected GitHub repository, then "ship it" | unresolved | Not run: a private scratch repository on a free GitHub plan cannot require pull requests (branch protection and rulesets both return HTTP 403), and making it public was declined |
| 5 | "explore this: a habit tracker" in an empty repository | satisfied | Brief on `explore/habit-tracker` only; no spec, candidate, or task file on any ref; report named "build it" and "spec it"; `main` clean |

Nothing was pushed in any step.

## Friction found

- **Re-review depth after a fix round** is unstated: the run used one all-axis worker on the fixed head rather than repeating per-axis workers.
- **A feature brief has no home for its riskiest assumption and kill criterion** when no spec follows; `explore` limits feature writes to durable product facts. The run put them in `PRODUCT.md`.
- **Merge commit subject** for unspecced local merges is unstated (default "Merge branch …" with the Conventional Commits title in the body was used).
- **`explore`'s next-step line names `to-spec`, not the phrase "spec it"**; a literal agent may not say "spec it".
- **Pre-mortem as a worker vs inline** and **readers for a near-empty repository** are slightly ambiguous.

## Limits

The user's side of each conversation was simulated by the same agent, so question quality and pacing were not tested. Step 4 needs a public scratch repository, or a GitHub Pro account, to protect `main`.
