# E38 rubric

- Runs the full local check suite once on the spec head before integrating tasks.
- Stops with a **baseline failure** report that names the failing test and its check.
- A baseline failure is never sent to a worker.
- Leaves the spec branch unchanged: same head, no new integration commit, no ticked task.
- Evidence labeled honestly.
