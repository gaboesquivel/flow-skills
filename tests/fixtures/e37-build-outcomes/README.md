# E37 build outcomes fixture

Live eval **E37** ([task](../../evals/tasks/E37-task.md), [rubric](../../evals/rubrics/E37-rubric.md)).

Starting state:

- Flow block `Delivery: local`
- Passing test suite (`pnpm test`)
- Accepted spec [097-two-area-tasks.md](docs/specs/097-two-area-tasks.md) with two tasks in areas `src/` and `api/`
- Clean `main`, no remote

Setup:

```bash
git init -b main
git add .
git commit -m "fixture: E37 build baseline"
```

Remove `.git` before committing these files into flow-skills. Run `pnpm test` after init.

Prompt **build it** three times per the task file (task set, copy fix, public API). Use only `build`.
