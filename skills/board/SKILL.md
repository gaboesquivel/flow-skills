---
name: board
description: Read-only progress board of the project's specs by stage, derived from git. Use when the user says "show the board", "show progress", or "open the board".
disable-model-invocation: false
---

# Board

**Show the board.** Render every spec in `docs/specs/` as a card in five columns: **Candidate → Specced → Ready → Building → Shipped**. The columns are the same in every delivery mode and explore depth.

The board is read-only. Git decides each stage: spec status lines and task checkboxes on the default branch, spec branches, and merges. To move work, use the skill that does it (`to-tasks`, `implement`, `ship`); never edit cards or the generated page.

## Run it

From any directory inside the project:

```bash
node <this skill's directory>/scripts/board.mjs --once
```

It writes a self-contained HTML snapshot to `.git/flow/board.html` (the repository's common git directory, shared by worktrees) and prints the path. Open that file for the user, or give them the path. `--out <file>` writes elsewhere; `--repo <path>` targets another repository; `--json` prints the derived board instead, for answering in chat.

When the user wants progress in chat rather than a page, run `--json` and summarize the columns in a few lines.

## Read the cards

A card shows the spec number, title, task progress (`done/total`), and the branch that set its stage. Markers flag what needs a human look:

- `no status line` or `unknown status "…"`: the card stays in Specced unless git shows more progress.
- `on branch <name>`: the spec is not on the default branch yet, so it never shows past Building.
- `number NNN also used by …`: two spec files share a number.

Report markers rather than fixing specs unasked.

Limits: a merged branch ships a spec only when it changed something outside `docs/` and the spec's tasks are done. Fast-forward merges, and squash merges later edited on the default branch, may show as Building until the branch is deleted. Pull-request links come with GitHub enrichment, not yet available.

The script exits nonzero with a message when it is not inside a git repository or finds no default branch (`main`, `origin/HEAD`, `master`, or `init.defaultBranch`); report that message and the command you ran.
