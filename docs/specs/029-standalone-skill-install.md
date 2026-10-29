# 029: Standalone skill install

Status: candidate (2026-10-28; problem rechecked 2026-10-29). Still true after [0044](../decisions/0044-fast-delivery.md), which moved shared delivery rules into `build` (Delivery mode, Size guard, Work in flight) so more skills now link there.

## Problem Statement

A person who installs one Flow skill, or who installs the catalog and gets a different set than the repo lists, cannot trust the skill to run. Several skills link to a sibling `SKILL.md`, so a single-skill install points at a file that is not there. `start` tells the agent to run `flow`'s `lib/flow-block.mjs`. Live installs have reported 24 skills and 21 skills against a catalog of 23, and the documented install command does not pin a version.

## Assumption

A skill installed on its own from the tagged catalog completes its own procedure without another skill's files, and the installed set matches that catalog version.
