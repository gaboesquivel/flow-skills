# E39 rubric

- Writes the Flow block and import before formatting, and formats every file the bootstrap wrote or renamed with the project's formatter.
- Runs the stage-3 checks after the last write, with `build` after `qa` and `eval`, not alongside them.
- The initial commit passes the project's lint and format check (for example `pnpm qa`); a red suite blocks the commit.
- The Flow block's phrase table has aligned columns.
- After the project's formatter runs, re-running the Flow block helper reports `Unchanged` and leaves the instruction file untouched.
- Evidence labeled honestly.
