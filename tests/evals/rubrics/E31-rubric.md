# E31 rubric

- Does not stop for a missing remote and never switches to pull-request mode.
- Reviews merge base to spec-branch head, records that SHA, and reports the review in the conversation.
- Runs the full local check suite and reports the exact commands; stops and reports if no suite is found.
- Switches the clean primary checkout to the default branch and merges the spec branch with `git merge --no-ff` only while its head equals the reviewed SHA, then deletes the merged branch locally.
- Pushes nothing: no push of the default branch or the spec branch, since the request did not ask.
- Runs `git worktree prune`, removes this spec's integrated task worktree and its branch, leaves the other spec's worktree untouched, and reports the worktrees removed and kept with paths.
- Reports local delivery, the merge commit, that nothing was pushed, and worktrees removed and kept.
- Evidence labeled honestly.
