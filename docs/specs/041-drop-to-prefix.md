# 041 — Drop the `to-` prefix from skill names

Status: draft (2026-10-29). Decision: [0052](../decisions/0052-skill-names-without-to-prefix.md) (Proposed).

## Problem Statement

`to-spec` and `to-tasks` are the only catalog skills with a prefix. Users typing slash commands or scanning the catalog meet `/to-spec` beside `/build` and `/ship`: longer to type, and the prefix says nothing the name doesn't.

## Solution

A straight rename, not a workflow change: `to-spec` → `spec`, `to-tasks` → `tasks`, everywhere current. Naming rule for the catalog: one short, recognizable action word whenever possible; no prefix unless it adds meaning ([0052](../decisions/0052-skill-names-without-to-prefix.md)).

## User Stories

1. As a Flow user, I want to type `/spec` and `/tasks`, so that commands are as short as the rest of the catalog.
2. As a Flow user, I want "spec it", "share the draft", "accept the spec", and "break it down" to keep working unchanged.
3. As an adopter upgrading with `npx skills add gaboesquivel/flow-skills`, I want the release notes to tell me the old directories are renamed, so that I am not left with duplicate or stale copies.

## Implementation Decisions

- **Rename** `skills/to-spec/` → `skills/spec/` and `skills/to-tasks/` → `skills/tasks/` with `git mv`; set frontmatter `name`. Keep `ATTRIBUTION.md` and its upstream URL (the source path stays `to-spec`; it records origin).
- **References in current context**: every skill's `SKILL.md` that names either skill, `scripts/validate.mjs` skill list, `skills/flow/lib/flow-block.mjs` phrase map, `README.md`, `PRODUCT.md`, `GLOSSARY.md`, `docs/skills.md`, `docs/methodology.md`, `docs/agent-compatibility.md`, `docs/references.md` where it describes current skills, eval rubrics, `tests/`, and `site/` sources (`site/components/*/sections.tsx`); regenerate `site/content/generated/content.json` rather than editing it.
- **Leave as history**: `docs/archive/`, `docs/research/`, accepted decisions, and implemented specs keep the old names. Decisions [0003](../decisions/0003-skill-naming.md) and [0015](../decisions/0015-tasks-and-domain-modeling.md) get an `Amended by [0052]` back-pointer at acceptance.
- **Release**: a note in the next release naming both renames and the reinstall step ([docs/RELEASE.md](../RELEASE.md)).
- **Exposure**: the public website's skill pages move from `/skills/to-spec` and `/skills/to-tasks` to `/skills/spec` and `/skills/tasks`; read-only pages, no writes. Old paths redirect permanently to the new ones so existing links keep working.

## Testing Decisions

Existing seams cover it: `pnpm validate` (catalog list, frontmatter names, links) and `pnpm test` (Flow block, board). A repository grep for `to-spec` and `to-tasks` outside the history paths above returns nothing.

**Acceptance scenario**

Actor: a maintainer in Claude Code on this repository after the rename lands.

1. `ls skills` lists `spec` and `tasks`, no `to-*` directories.
2. Typing `/spec` loads the spec skill; saying "break it down" loads `tasks`.
3. `grep -rnE '\bto-(spec|tasks)\b'` outside `docs/archive`, `docs/research`, accepted decisions, implemented specs, and `ATTRIBUTION.md` returns no matches.
4. `pnpm validate` and `pnpm test` pass.
5. On the site preview, `/skills/spec` renders the skill; `/skills/to-spec` redirects to it.
6. The Flow block written by `flow` maps "spec it" and "share the draft" to `spec`, "break it down" to `tasks`.

## Out of Scope

- Any change to what the skills do, their phrases, or the workflow.
- Renaming other skills. The pasted examples `to-build`, `to-ship`, and `implement` do not exist in the current catalog (`build`, `ship` are already unprefixed).

## Further Notes

Open assumptions:

- `tasks` vs. a host built-in: Claude Code may expose a `/tasks` command. If it shadows the skill, document the collision per [0017](../decisions/0017-claude-code-skill-coexistence.md) or pick another name before acceptance.
- `spec` and `tasks` are nouns more than verbs; chosen for recognizability over strict verb form (see 0052 Alternatives).
- No compatibility aliases under the old names; the redirect covers web links only.
