# 0052 — Skill names without the `to-` prefix

Status: **Accepted** (2026-10-29). Spec: [041](../specs/041-drop-to-prefix.md). Amends [0003](0003-skill-naming.md) and [0015](0015-tasks-and-domain-modeling.md) (names `to-spec`, `to-tasks`).

## Context

Two catalog skills carry a `to-` prefix inherited from upstream: `to-spec` (adapted from mattpocock/skills) and `to-tasks` (renamed from `to-tickets` in [0015](0015-tasks-and-domain-modeling.md)). Every other skill is one short word or a short compound: `start`, `explore`, `grill`, `build`, `review`, `ship`, `retro`. The prefix adds no meaning, breaks the pattern, and lengthens slash commands. Users reach skills by phrase ("spec it", "break it down"), so the name matters most where it is typed or read: slash commands, the catalog, the website.

## Decision

Name skills with one short, recognizable action word whenever possible; add a prefix or second word only when it carries meaning (`domain-modeling`, `write-agents`, `write-humans` keep theirs). Rename `to-spec` to `spec` and `to-tasks` to `tasks`. Trigger phrases and behaviour do not change.

## Alternatives

- **Keep `to-spec` and `to-tasks`.** Preserves upstream lineage and existing installs, at the cost of an inconsistent catalog and longer commands.
- **Verb forms (`specify`, `slice`).** More strictly verbs, but less recognizable than the artifact names users already say ("spec it", "tasks").

## Consequences

- Directory names, frontmatter `name`, the validator's skill list, the Flow block phrase map, current docs, and the website use `spec` and `tasks`.
- Accepted decisions, implemented specs, research, and archive keep the old names as historical evidence.
- Existing installs keep the old directories until the adopter reinstalls; the release notes name the rename.
- `tasks` may collide with a host built-in command; recorded per [0017](0017-claude-code-skill-coexistence.md) if confirmed.
