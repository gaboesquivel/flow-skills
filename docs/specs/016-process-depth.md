# 016: Process depth

Status: implemented (2026-10-28). Decision: [0026](../decisions/0026-process-depth.md). Builds on [spec 011](011-start-with-explore.md) and [spec 015](015-wave-checkpoints.md).

## Problem Statement

A founder who runs `start` gets the project's goals captured by `explore`; a developer who says "set up Flow here" in an existing project gets only the Flow block. Neither can say once how much process the project wants: `explore` asks for a depth every run, "Lite" also names the `flow` skill, and Full depth does not say which choices deserve a decision record. Specs, slices, and decisions have no stated boundary.

## Solution

1. **`Process:` line.** The Flow block gains `Process: lite | full | unset` after `Deploy:`. Re-running keeps the recorded value unless the user names a new one.
2. **Setup asks once.** "Set up Flow here" and `start`'s pre-write confirmation ask Lite or Full (Lite recommended) and record it. When `PRODUCT.md` has no brief, `flow` names `explore` as the next step and waits; `start` hands off to `explore` at the recorded depth.
3. **`explore` reads it.** New work defaults to the recorded depth; `unset` means Lite. The user can still override per run.
4. **Spec–decision boundary.** `to-spec` states the rule: a spec is one bet with tasks as its slices; a decision record needs real alternatives and reach beyond one spec. At Full depth, `explore` proposes a decision record for each choice among alternatives, starting with the chosen approach, and writes each only after a yes to the shown text.
5. **Naming.** Current docs call `flow` context alignment; Lite and Full mean process depth only.

## User Stories

1. As a developer adopting Flow in an existing repository, I say "set up Flow here", pick Lite, and am pointed at `explore` to capture goals my `PRODUCT.md` lacks.
2. As a founder, I say "start a Next.js project, full process" and the confirmation, the Flow block, and the exploration all use Full.
3. As a developer, I explore a new feature months later and `explore` proposes the project's recorded depth without asking me again.
4. As a developer on a Full project, I see one decision record proposed for the approach we chose, with the rejected approaches as alternatives.
5. As a developer on a Lite project, a schema choice that affects only this spec stays in the spec, not in `docs/decisions/`.

## Implementation Decisions

- `flow-block.mjs` gains `PROCESS_DEPTHS`, `normalizeProcess`, `readProcess`, and a `--process <lite|full>` CLI flag, mirroring `Delivery:`. The block stays under 25 lines.
- `flow` owns the block definition; `start` writes it with the confirmed process value; `explore` reads it; `to-spec` owns the spec–decision rule.
- Process depth never changes delivery mode, deploy target, or any gate from [0024](../decisions/0024-gated-hand-offs.md).

## Testing Decisions

- Unit tests for the `Process:` line: default `unset`, keep-unless-overridden, normalization, invalid values ignored, CLI flag.
- Smoke contracts updated for `flow`, `start`, `explore`, and `to-spec` wording.

## Out of Scope

- Renaming the `flow` skill id or `explore`'s Skip tier.
- Editing historical decisions and specs that say "Flow Lite".
- Changes to `ship`.

## Tasks

Recorded as GitHub issues (pull-request mode):

- [x] [#61](https://github.com/gaboesquivel/flow-skills/issues/61) `flow`: `Process:` line in the Flow block; setup asks Lite or Full.
- [x] [#62](https://github.com/gaboesquivel/flow-skills/issues/62) `explore`, `to-spec`: recorded process depth and the spec–decision boundary.
- [x] [#63](https://github.com/gaboesquivel/flow-skills/issues/63) `start`: ask Lite or Full and explore at the recorded depth (blocked by #61).
- [x] [#64](https://github.com/gaboesquivel/flow-skills/issues/64) Docs alignment and the Flow Lite label (blocked by #61–#63).
