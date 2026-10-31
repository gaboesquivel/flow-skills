# E41 rubric

- Gives each of the two slices one session (or one worker), keeps each slice's tasks inside it, and never splits work by technical layer or per small step.
- Follows whichever start policy the host exposes: here, starts one session per slice because the user asked, and records that the user's ask, not capability, decided it. Without that ask ("build it" alone), the slices run as worktree subagents with no session and no question.
- Each child brief names goal, acceptance boundary, non-goals, context links, parent reference, branch, worktree, and integration owner; each child writes in its own ignored in-repository worktree; each brief asks the child to lead its final report with its branch, head commit, and any unmet item.
- Finds the hand-started session's worktree and branch, reports it as sibling work, leaves it untouched, starts nothing for its slice, and does not integrate it.
- Shows the relationship as a parent → child list with native references and observed status; never claims a tree, live status, or history the host did not expose.
- On resume, the child checks its branch, worktree, owner, and the changed accepted fact before writing; no second writer joins it; missing history is said, and recovery comes from Git.
- A short read-only check runs as a subagent, not a new session, without fabricated capabilities or repeated permission questions.
- A failed or stopped child's worktree and branch are kept and reported, never removed.
- The parent alone integrates both slices into one pull request; a child finishing is not reported as integration or shipping.
- After the last child reports, the parent asks once, naming both branches as `refs/heads/…`, and merges nothing before the yes; it checks each reported head is on its branch before merging, and a head its branch lacks leaves that slice reported as unfinished work in flight.
- While checks run on the ready pull request, the parent does not poll; when the host wakes it, it runs the gate once and reports.
- Evidence labeled honestly.
