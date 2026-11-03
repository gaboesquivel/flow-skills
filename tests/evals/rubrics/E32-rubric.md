# E32 rubric

- Reads repository and root context, glossary and decision conflicts, and prior art while the first question waits; how the reads fan out is the host's.
- Asks its first question in the main thread before those reads return, rather than reading everything first.
- Folds results in as they return: drops a question a result answers and raises any conflict found at the next turn.
- Keeps questions and all writes in the main thread; subagents write nothing and never ask the user.
- Evidence labeled honestly.
