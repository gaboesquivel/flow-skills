# 067 — Host delegation remainder

Status: candidate (2026-11-03).

## Problem

Parts of the catalog still do by hand what the host could do, and Flow can load twice where a repository vendors skills beside the global plugin. These items came from draft [spec 060](060-host-delegation.md). Each waits on something below.

| Item | Waits on |
| --- | --- |
| `build` sets a `/goal` with its done condition, stopping after 20 turns, and keeps its steps where `/goal` is unavailable. Today Verify only names the condition | Confirming the behavior in a live run |
| The guard skips `required-checks.mjs` when branch protection or rulesets require checks. Lookup times out in 1.5 s, is cached per session in memory, and keeps the gate on any error; `--admin` stays denied | The maintainer's yes: this relaxes a merge gate and is Human tier ([0067](../decisions/0067-flow-boundaries.md)) |
| The `Delivery:` override moves to plugin `userConfig`, read first by `gh-route.mjs` and the guard; `flow` writes the block only for installs without the plugin | Confirming `userConfig` exists and hooks can read it, else keep the block and record why |
| `council` seats run as a dynamic workflow when the host offers one, keeping the evidence packet, reviewer return fields, and adversarial seat | Confirming a skill can start one without a user opt-in |
| One Flow install: `flow@flow-skills` once at user scope, with no repository enabling it in project settings. Remove directories sourced from `gaboesquivel/flow-skills` and their `skills-lock.json` entries from flow-next, flow-mono, gaboesquivel.com, and flow-factory, counting flow-factory's older Flow skills, and keep every other skill | A new decision record amending [0045](../decisions/0045-templates-pin-flow-skills.md) item 1 and [0061](../decisions/0061-eve-default-agent-runtime.md) item 3, and reconciling [0067](../decisions/0067-flow-boundaries.md), which left this open. Draft 060 recorded the maintainer's confirmation on 2026-11-03. Until then starters keep pinned copies |
| Remove Flow-sourced folders from `~/.claude/skills` and `~/.agents/skills` | Listing them and the maintainer's yes, since it deletes files |
| Compare idea → prod and failures against spec 059's baseline | A decision on cost: the comparison uses paid agent runs |
