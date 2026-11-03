# Review of a branch with one unmet step (2026-11-03)

Closes spec 059's open check ("reviewing a branch with one unmet scenario step reports `unmet` with evidence, plus `/code-review`'s findings"), run under [spec 062](../../../docs/specs/062-trim-build-review.md).

## Conditions

- Host: Claude Code desktop, model Opus 5.5. The reviewer was a fresh general-purpose subagent briefed with [`agents/flow-reviewer.md`](../../../agents/flow-reviewer.md) at `main` (`9e30ee3`), tier Standard, round 1. It had the Skill tool.
- Fixture: a scratch Git repository outside this one. Spec `001-greeting` (accepted) has two acceptance steps:
  1. `greet("Ada")` returns `Hello, Ada!`.
  2. A padded name is trimmed, and `greet("")` throws `name required`.
- Branch `spec/001-greeting` implements step 1 with one passing test and leaves step 2 out. Its commit is titled `feat:` and reformats the function.

## Result

| Expected | Observed |
| --- | --- |
| Step 2 is `unmet`, with evidence | `unmet`. The reviewer ran `greet("  Ada  ")` and got `"Hello,   Ada  !"`. It ran `greet("")` and got `"Hello, !"`, with no throw. |
| Step 1 is `satisfied`, with evidence | `satisfied`, citing `tests/greet.test.mjs:5-7` and the test run (1 pass) |
| `/code-review`'s findings are included | `/code-review medium main...spec/001-greeting` ran through the Skill tool with five findings. They were folded into 2 Important, 1 Nit and 1 Pre-existing. |
| Read-only, no approval | No files changed, no branch switched, nothing posted |

Pass. The two missing behaviors came back as Important findings, each naming its bug class.

## Limitations

- One run, one model and one tiny fixture.
- The reviewer was a general-purpose subagent following the agent file, not the plugin-installed `flow-reviewer` agent.
- The fixture was removed with the scratchpad, so this record is the evidence.
