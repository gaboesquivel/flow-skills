# 067 — Host delegation remainder

Status: candidate (2026-11-03).

## Problem

Parts of the catalog still do by hand what the host could do, and Flow can load twice where a repository vendors skills beside the global plugin. These items came from draft [spec 060](060-host-delegation.md). Each waits on something below.

| Item | Waits on |
| --- | --- |
| The guard skips `required-checks.mjs` on branches whose protection requires checks; a failed lookup keeps the gate; `--admin` stays denied | The maintainer's yes: a Git hook change is Human tier and relaxes a merge gate |
| The `Delivery:` override moves to plugin `userConfig`, read by `gh-route.mjs` and the guard | Confirming `userConfig` exists and hooks can read it, else keep the Flow block |
| `council` seats run as a dynamic workflow when the host offers one | Confirming a skill can start one without a user opt-in |
| One Flow install: remove vendored Flow skills from flow-next, flow-mono, gaboesquivel.com, and flow-factory, keeping other skills | The maintainer's go-ahead for each repository. Confirmed direction (2026-11-03): [0061](../decisions/0061-eve-default-agent-runtime.md) item 3 changes, and the starters stop committing Flow skills. Until then starters keep pinned copies, refreshed for specs 064 to 066 |
| Remove Flow-sourced folders from `~/.claude/skills` and `~/.agents/skills` | Listing them and the maintainer's yes, since it deletes files |
| Compare idea → prod and failures against spec 059's baseline | A decision on cost: the comparison uses paid agent runs |
