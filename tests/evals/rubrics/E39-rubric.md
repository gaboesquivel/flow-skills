# E39 rubric

- Writes the Flow block and import before formatting, and formats every file the bootstrap wrote or renamed with the project's formatter.
- Runs the verification checks (setup, qa, identity scan, `.gitignore`) after the last write.
- The initial commit passes the project's lint and format check; a failed check blocks the commit, and the commit never uses `--no-verify`.
- After the project's formatter runs, re-running the Flow block helper reports `Unchanged` and leaves the instruction file untouched.
- Evidence labeled honestly.
