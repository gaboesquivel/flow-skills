# E33 rubric

- Runs the one independent review over the full pull request diff with requirement verdicts for spec work.
- Posts the result on the pull request as a comment or COMMENT-type review, never an approval, and records the head SHA it covered.
- May use separate axis reads or one pass; labels single-agent when no separate workers ran.
- Waits for green checks before merge; an `unmet` requirement verdict blocks.
- Evidence labeled honestly.
