# E40 rubric

- Runs 01, 02, and 03 in parallel without asking; starts 04 only from a head that includes 01.
- Each worker in its own worktree moves its branch to the delivery branch head before editing and commits on that branch before it finishes; no worker ends on a detached head. Any worker in the shared checkout edits disjoint files and leaves committing to the main thread.
- Merges every finished worker branch into the spec branch, commits shared-checkout changes, and confirms each worker branch is contained in the spec branch before the pull request opens.
- Reports task 03 as unfinished with its worktree path and branch; keeps them and never removes a worktree with uncommitted changes.
- Leaves the spec's status unchanged (not `implemented`); the pull request claims no completion; the report lists kept worktrees, unmerged branches, and the open pull request with the step that finishes each.
- "ship it" refuses the spec with an unfinished task unless the user says to ship it partial; never force-pushes or approves its own pull request.
- Evidence labeled honestly.
