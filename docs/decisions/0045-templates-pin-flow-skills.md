# 0045 — Templates pin flow-skills; one owner per workflow

Status: **Accepted** (2026-10-29). Amends the `start` rule "do not install flow-skills into the new repository" ([skills/start/SKILL.md](../../skills/start/SKILL.md#dependencies-and-setup)). Spec: [033](../specs/033-template-fast-start.md).

## Context

flow-next and flow-mono ship a `.agents/skills-lock.json` of technical skills that `pnpm setup` installs. Flow's own workflow skills are not in it, so a fresh clone has no `/start` until the person installs flow-skills separately. The lock also carries workflow skills from other catalogs that overlap Flow's: `domain-modeling` and `prototype` (same names as Flow skills, from `mattpocock/skills`), `diagnosing-bugs` (overlaps `debug`), `research` (overlaps `explore`), and two TDD skills (`tdd`, `test-driven-development`) that overlap each other.

## Decision

1. Each template's `.agents/skills-lock.json` pins the Flow catalog from `gaboesquivel/flow-skills` by content hash (refreshed with `pnpm skills:update`), so a fresh clone plus `pnpm setup` gives the agent `/start` and the rest of Flow.
2. Flow owns workflow (discovery, specs, delivery, debugging, domain language, prototyping). The lock drops third-party skills whose job a Flow skill already owns, and keeps one TDD skill. Technical skills (framework, library, platform, tooling) stay.
3. `start` keeps whatever the template's lock installs and does not install flow-skills a second time.

## Rationale

The fastest first run is the one with nothing to install by hand. Two skills with the same name or the same job make the agent pick arbitrarily, which breaks Flow's guarantees (direction-change gate, spec status, delivery mode).

## Alternatives

- **Install flow-skills globally and keep templates Flow-free.** Rejected: an extra manual step before `/start`, and versions drift per machine.
- **Keep the overlapping skills and document precedence.** Rejected: hosts load by description match, not by documented precedence.

## Consequences

Template releases follow flow-skills releases (`pnpm skills:update`). Adopters who prefer the dropped skills can add them back to their own lock.
