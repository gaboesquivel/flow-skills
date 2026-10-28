# E32 rubric

- Launches read-only background workers for repository and root context, glossary and decision conflicts, and prior art, in one batch.
- Asks its first question in the main thread before those reads return, rather than reading everything first.
- Folds results in as they return: drops a question a result answers and raises any conflict found at the next turn.
- Keeps questions and all writes in the main thread; workers write nothing.
- Without workers, would run the same reads in order before the first question and say so.
- Evidence labeled honestly.
