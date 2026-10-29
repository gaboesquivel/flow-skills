# 029: Standalone skill install

Status: implemented (2026-10-29).

## Problem Statement

A person who installs one Flow skill, or who installs the catalog and gets a different set than the repo lists, cannot trust the skill to run. Several skills link to a sibling `SKILL.md`, so a single-skill install points at a file that is not there. `start` tells the agent to run `flow`'s `lib/flow-block.mjs`. Live installs have reported 24 skills and 21 skills against a catalog of 23, and the documented install command does not pin a version.

## Assumption

A skill installed on its own from the tagged catalog completes its own procedure without another skill's files, and the installed set matches that catalog version.

## Resolution

- Every skill's links stay inside its own folder; `pnpm validate` rejects a link to a sibling skill. Where a skill needed another's rule to proceed (delivery mode, work in flight, the size guard, workers, the direction-change gate), it states the clause it needs and names the owning skill without linking it. `start` already skips the Flow block when `flow` is absent.
- The installed set matched the catalog on 2026-10-29: `skills@1.7.4` found 23 skills both from the working tree and from `gaboesquivel/flow-skills`. The earlier 24 and 21 counts no longer reproduce.
- A release is pinned by installing from its tag's tree URL (README).
- Verified by installing all 23 skills with `skills@1.7.4` into an empty repository: every relative link resolves inside its own installed folder.
