---
name: board
description: Read-only progress board of the project's specs by stage, derived from git. Use when the user says "show the board", "where are we", or "show progress".
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

When the user asks "where are we" without wanting a page, run `--json` and summarize the columns in a few lines.

## Read the cards

A card shows the spec number, title, task progress (`done/total`), and matched branch. A marker such as `no status line` or `unknown status "proposed"` means the spec's status line is missing or nonstandard; the card stays in Specced unless git shows more progress. Report markers rather than fixing specs unasked.

If the script fails (not a git repository, no default branch), report the error and the command you ran.
