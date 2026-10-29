# E26 ship draft gate fixture

Disposable Git repository for live eval **E26** ([task](../../evals/tasks/E26-task.md), [rubric](../../evals/rubrics/E26-rubric.md)).

Starting state:

- Flow block with `Delivery: github`
- Spec `Status: draft` with an `Issue:` line (tasks published as issues; no pull request)
- One linked decision still **Proposed**

Setup (from this directory):

```bash
git init -b main
git add .
git commit -m "fixture: E26 draft spec gate"
```

Do not commit a nested `.git` into flow-skills; `pnpm validate` rejects `.git` under `tests/fixtures/`. Delete `.git` here before committing fixture files upstream, or init only in a throwaway copy.

Prompt: **ship it** (invoke only `ship`).

Expected: name the draft spec and **Proposed** decision, suggest "accept the spec", stop before branch, commit, push, pull request, review, or merge.
