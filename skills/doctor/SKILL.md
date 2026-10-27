---
name: doctor
description: Diagnose Flow Skills installation and project conventions without modifying the environment.
disable-model-invocation: true
---

# Flow Doctor

## Purpose

Report whether Flow Skills and project conventions appear correctly installed. **Read-only** — do not install packages, edit files, or run destructive commands.

## Invocation

/doctor

## Checks

Inspect and report on:

1. **Bootstrap** — `AGENTS.md` (or equivalent) contains `flow-skills:bootstrap` markers and expected navigation.
2. **Manifest** — `.flow-skills/manifest.json` records installation mode, bundled version, bootstrap hash, skill location, and hashes when init was used. Bootstrap-only mode does not claim skills were installed.
3. **Skills on disk** — skill directories recorded in the manifest are present at its `skillsDirectory`; check recorded content hashes where tools allow. Report manifest skill names that no longer exist in the current distribution as **retired** directories the installer preserved for explicit review. Without a manifest, inspect the project's actual skill location and report the evidence available.
4. **Broken references** — entrypoints and supporting files resolve their required local links within the installed distribution.
5. **Decision layout** — if skills or docs mention decision records, new consequential records should use `docs/decisions/`; an absent directory is normal until a record is needed.
6. **Stale conventions** — skills or AGENTS still instruct writing new ADRs/PDRs instead of `docs/decisions/`.

## Output

### Summary
Healthy, warnings, or missing setup.

### Findings
Bullet list with severity (error | warning | info).

### Suggested actions
Minimal user-visible steps; do not execute them automatically.

## Restrictions

Do not modify the repository or global agent configuration.

Do not install packages, pull remote skill catalogs, or run git writes.

Do not claim success for checks that were not performed.
