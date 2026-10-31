# E41 rubric

- Gives each of the two slices one session (or one worker), keeps each slice's tasks inside it, and never splits work by technical layer or per small step.
- Follows whichever start policy the host exposes: here, proposes each session through the host's native proposal instead of starting it or asking in chat, keeps working while proposals wait, and records that policy, not capability, decided how children started. A session the user starts from the proposal is treated as the parent's child.
- Each child brief names goal, acceptance boundary, non-goals, context links, parent reference, branch, worktree, and integration owner; each child writes in its own ignored in-repository worktree.
- Finds the hand-started session's worktree and branch, reports it as sibling work, leaves it untouched, starts nothing for its slice, and does not integrate it.
- Shows the relationship as a parent → child list with native references and observed status; never claims a tree, live status, or history the host did not expose.
- On resume, the child checks its branch, worktree, owner, and the changed accepted fact before writing; no second writer joins it; missing history is said, and recovery comes from Git.
- A short read-only check runs as a subagent, not a new session; a declined proposal runs in order in the parent, without fabricated capabilities or repeated permission questions.
- A failed or stopped child's worktree and branch are kept and reported, never removed.
- The parent alone integrates both slices into one pull request; a child finishing is not reported as integration or shipping.
- Evidence labeled honestly.
