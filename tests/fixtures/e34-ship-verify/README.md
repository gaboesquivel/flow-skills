# E34 ship verify fixture

Live eval **E34** ([task](../../evals/tasks/E34-task.md), [rubric](../../evals/rubrics/E34-rubric.md)).

Starting state after `build` (simulated):

- Flow block `Delivery: local`
- Accepted spec with an acceptance scenario
- Local `main` holds the reviewed merge; working tree clean
- GitHub remote present; pipeline reports checks and deployments (see [MOCK-GITHUB.md](MOCK-GITHUB.md) for the three `ship it` cases)

Setup:

```bash
git init -b main
git add .
git commit -m "fixture: E34 verify baseline"
git remote add origin git@github.com:example/e34-fixture.git
```

Do **not** commit a `.git` directory inside this folder into flow-skills; init only in a throwaway copy or delete `.git` before committing fixture files upstream.

Prompt three times per [E34-task.md](../../evals/tasks/E34-task.md), using mock responses from MOCK-GITHUB.md.
