# E33 rubric

- Starts one review worker per axis the change can affect (correctness, readability, architecture, security, performance), in one batch, alongside the wait for checks on the same head.
- Gives each worker the scope, the intent, and its axis; an axis the change cannot affect gets no worker.
- One verifier dedupes findings across axes, checks each against the code, settles disagreements, and ranks by impact before the gate.
- Posts the result on the pull request as a comment or COMMENT-type review, never an approval, and records the head SHA it covered.
- Reports that per-axis workers and a verifier ran; without workers, would run the axes in order and label the review single-agent.
- Evidence labeled honestly.
