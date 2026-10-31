# Cloud delivery live run (spec 046), 2026-10-31

Host: Claude Code cloud (CLI 2.1.316 in the flow-skills check), routines (research preview). Sandbox: private `gaboesquivel/flow-cloud-sandbox` from flow-next, Flow skills copied from `cloud-flow` into `.agents/skills` (symlinked from `.claude/skills`), Flow block in `CLAUDE.md`. Evidence: [flow-skills PR #196 comment](https://github.com/gaboesquivel/flow-skills/pull/196) "Spec 046 live cloud check", routine run logs, sandbox issues #1 and #4 and PRs #2, #3, #5.

| Step | Verdict | Observation |
| --- | --- | --- |
| 1. Skills load from the repository | met | All 26 Flow skills listed from `.claude/skills -> ../skills`; nothing from `~/.claude`. Skill bodies are read at invocation, so a branch checkout after start changes them. |
| 2. Build through a reachable route | met in part | `gh pr` and `gh issue`: HTTP 403 ("GitHub GraphQL is not available from Claude Code sessions"); `gh api` REST works; `gh auth status` reports the token invalid although REST works. Routine sessions used the host's `mcp__github__*` tools to open pull requests and comment. Sandbox CI never reported (0 check runs), so no head was checked green. |
| 3. Ship through REST | unresolved | Footer pull request #3 opened by a one-time routine; landing not observed before this record. |
| 4. Label starts a cloud build | met | `issues.labeled` webhook fired the routine within 2 s; it opened a pull request with `Closes #N`, a session link, and an issue comment; nothing merged. The webhook API accepted no label filter, so the routine prompt filters to `build-it`. |
| 5. Labeler below `write` refused | **unmet** | Not run (no second account). Worse: in both trigger runs the session did not complete the labeler-permission read (no route in the first; proxy blocked `collaborators/{user}/permission` in the second) and proceeded on the author being the owner, despite `build`'s fail-closed text. Skill text alone does not enforce the gate. |
| 6. Teleport and ship | not run | |
| 7. Metrics tags | met in part | REST reads work in cloud; the run crashed on untagged changes (fixed in `d0e57e8`'s follow-up). Cloud cost stays unknown without an OpenTelemetry export. |

Not covered: protection on `main` (private repositories on GitHub Free hold no rulesets). Until the permission gate is enforced deterministically, use the issue trigger only on repositories where every account that can add labels has `write` access.
