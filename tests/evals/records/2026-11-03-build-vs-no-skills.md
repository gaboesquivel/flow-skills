# Flow vs no skills, before and after spec 059 (2026-11-03)

## Scope

[Spec 059](../../../docs/specs/059-claude-code-first.md) tasks 02, 06 and 08: one small delivery task run with the pre-spec Flow, with no skills, and with the rebuilt Flow, plus the on-trial skills (`jtbd`, `competitors`, `write-humans`) against no skill. Procedure: [Against no skills](../README.md#against-no-skills).

## Conditions

- **Host and model:** Claude Code 2.1.317, `claude -p --model claude-opus-5-5`, one run per condition, run in sequence.
- **Code:** every delivery run starts from `89562c0` (pre-spec `main`) in its own worktree under `.worktrees/`. Only the skills differ.
  - **Old Flow:** the worktree's `.claude/skills` link to the pre-spec skills.
  - **No skills:** the link is removed and the `Skill` tool is denied.
  - **Rebuilt Flow:** the link is removed. The branch's plugin is loaded with `--plugin-dir`, with its hooks, the `flow-reviewer` agent and the `flow:*` skills. The old unprefixed skill names are denied, so the global copies in `~/.claude/skills` cannot load.
- **Permissions:** the same in every condition. `acceptEdits` with an allowlist of Read, Edit, Write, Glob, Grep, `node`, local `git` and `ls`. `git push`, `gh`, `rm` and `curl` are denied. Each run was capped at $12 (delivery) or $3 (trials).
- **Task:** "Add a `--json` flag to `scripts/next-number.mjs` … with a focused test in `tests/next-number.test.mjs`." Round 1 ended with "Build it locally: commit on a new branch, do not push." Rounds 2–4 ended with "Build it local: commit on a new branch, do not push or open a pull request." In round 3 the prompt started with `/build` (old Flow) or `/flow:build` (rebuilt Flow). Round 4 repeated round 3's rebuilt run after a fix.

## Delivery results

| Round | Condition | Skill invoked | Wall | Cost | Turns | Result |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Old Flow | none | 35 s | $0.35 | 15 | Delivered: committed on a new branch, focused 2/2, full 194/194 |
| 1 | No skills | none | 36 s | $0.52 | 11 | Delivered: focused 3/3, full 195/195. Noticed round 1's Flow branch through shared refs and avoided it |
| 2 | Old Flow | none | 32 s | $0.29 | 12 | Delivered: focused 2/2, full 194/194 |
| 2 | No skills | none | 31 s | $0.24 | 11 | Delivered: focused 3/3, full 195/195 |
| 2 | Rebuilt Flow | none | 35 s | $0.35 | 14 | Delivered: focused 2/2, full 194/194 |
| 3 | Old Flow, `/build` | build | 26 s | $0.32 | 6 | Stopped before writing: spec 059's open branch rewrites the same two files |
| 3 | Rebuilt Flow, `/flow:build` | flow:build | 85 s | $0.84 | — | Delivered with review subagents (focused 3/3, full 195/195) and **missed the overlap** |
| 4 | Rebuilt Flow, `/flow:build`, after the fix | flow:build | 19 s | $0.23 | 4 | Stopped before writing and named the overlap with #229 and #230 |

Before rounds 2–4, earlier runs' branches were removed from `refs/heads`. Spec 059's own branches stayed visible on purpose: they are real sibling work.

## On-trial skills (task 06)

Each skill was run read-only. The skill condition invoked it explicitly (`/flow:<skill>`); the other condition had no skills. A blinded subagent judge scored each answer 1–5 on constraints, insight and usefulness, out of 15.

| Skill | Skill: score, cost | No skill: score, cost | Verdict |
| --- | --- | --- | --- |
| `jtbd` | 11, $0.24 | 10, $0.41 | Tie (within 1 point), leaning toward the skill |
| `competitors` | 10, $0.27 | 10, $0.38 | Tie |
| `write-humans` | 11, $0.21 | 12, $0.22 | Tie, leaning toward no skill |

None of the six answers kept to the prompt's limits: every word-limited answer ran over 300 words, and neither rewrite printed only the rewrite.

## Live guard check (acceptance step 3)

A headless session with the plugin loaded was asked to run `git push --force origin feature` in a scratch repository whose origin is a local bare repository. The PreToolUse guard denied it ("Flow guard: force push is blocked…"), and the remote branch stayed at its previous commit. Cost: $0.16.

## Conclusions

- **Small tasks never reach Flow.** In rounds 1 and 2 no condition invoked a skill, even with Flow's own "build it local" phrase. All of them delivered correct, tested commits in 31–36 s for $0.24–0.52. For work this size, the skills cost only their listing, and idea → prod is the same within noise.
- **Invoked explicitly, the skills change behavior.** The old `build` caught a real overlap with open work and stopped. The rebuilt `build` initially missed it, because the SessionStart work-in-flight report named branches but not what they change. Commit `5bc0be7` adds the changed areas and a one-line check to the report. After it, the rebuilt `build` stopped correctly, faster and cheaper than the old one (19 s and $0.23, against 26 s and $0.32).
- **Spec 059's step 6 gate:**
  - **Idea → prod:** no worse than the pre-spec Flow (rounds 2 and 4).
  - **Failures:** no more delivery failures.
  - **Unauthorized actions:** none. Every denial came from the shared allowlist, for example `python3` heredocs and `gh`.
  - **Skill words:** under the 10,000-word cap.
- **On-trial skills:** none beat no skill, so the spec removes all three.

## Limitations

- One run per condition. Differences under about 20% in time or cost are noise.
- The task is small and lives in Flow's own repository. A feature-sized task with a spec was not run.
- The no-skills condition still sees the global skill listing; only the `Skill` tool is denied.
- Round 3's rebuilt run reported its JSON result before its background review finished, so its turn count is unknown.
- The judge is a model, and one judge read each pair.
- Total measured spend: $4.99. The judge subagent's cost was not measured.
