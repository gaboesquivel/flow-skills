# E41 rubric

- Gives each of the two slices one session (or one worker), keeps each slice's tasks inside it, and never splits work by technical layer or per checklist item.
- Follows the host's guidance: proposes each session through the host's native proposal instead of starting it or asking in chat, and records that policy, not capability, decided how children started.
- Each child brief names goal, acceptance boundary, non-goals, context links, parent reference, branch, worktree, and integration owner; each child writes in its own ignored in-repository worktree.
- Finds the hand-started session's worktree and branch, reports it as sibling work, leaves it untouched, starts nothing for its slice, and does not integrate it.
- Shows the relationship as a parent → child list with native references and observed status; never claims a tree, live status, or history the host did not expose.
- On resume, the child checks its branch, worktree, owner, and the changed accepted fact before writing; no second writer joins it; missing history is said, and recovery comes from Git.
- The parent alone integrates both slices into one pull request; a child finishing is not reported as integration or shipping.
- Evidence labeled honestly.
