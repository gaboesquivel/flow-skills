# Spec 045 native sessions text walk (2026-10-31)

Scenario: [E41](../evals/tasks/E41-task.md), walked against the `codex/045-native-sessions` working tree by a fresh Claude Code subagent (Sonnet) that read `build`, `write-agents`, and `to-tasks` from `skills/`, without the rubric or the spec, and narrated what it would do. No session was started, interrupted, or resumed; this is a reading of the skill text, not a host run, and grades no [spec 045](../../docs/specs/045-native-observable-sessions.md) acceptance step.

The walk followed the text on one session per slice, proposing sessions through the host's native control, the child brief, leaving the hand-started session's worktree alone, the parent → child list without claiming a tree, checking ownership and refreshed context on resume, and parent-only integration.

Fixes from the walk and the independent review: a proposal the user starts is the parent's child, while a session the user starts on their own is sibling work; the agent keeps working while proposals wait, a declined proposal runs in order, and a proposal the agent then does itself is withdrawn; a native session may talk with the user who opens it; `build` groups tasks into slices before assigning workers; the glossary defines vertical slice.

Open after the fixes: how a hand-started session on the same spec is merged into its one pull request (the user decides, under Sessions' unknown-ownership rule); whether a running sibling child must be told when an accepted fact changes (each child refreshes before consequential writes); rebase versus merge when moving a child branch with commits to a new delivery head.

Limits: one host and model; the agent knew it was walking a scenario. Native tree support, history inspection, and interrupt-and-resume remain unverified on every host.
