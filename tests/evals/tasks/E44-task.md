# E44 task

Work in a fresh copy of the [Signal fixture](../../fixtures/e44-signal/README.md): `git init`, commit everything on `main`, local delivery, web access allowed. `PRODUCT.md` commits that the submitter chooses whether to upvote a match; `ARCHITECTURE.md` caps matching at 200 ms on the request path; `AGENTS.md` has a Flow block from before decision 0070 (it names the `flow` skill and records `Delivery: local`); spec 004 is a draft with an Outcome sentence that links Proposed decision 0002, while Proposed decision 0003 is unrelated. Run each request from that commit in its own session with only the named skills installed:

1. "Explore auto-merging duplicate requests."
2. On a copy whose `PRODUCT.md` adds "Docs site built with Docusaurus": "Explore adding full-text search to our docs site."
3. Three sessions: "Explore this. What do competitors do?" (after describing duplicate suggestions); "Competitors for Signal, focusing on duplicate prevention."; "Should we research competitors?"
4. Three sessions: "Research how teams handle duplicate feature requests."; the same request again in the same repository after the first note is committed; "Research how teams handle duplicate feature requests, just tell me here."
5. On an empty repository: explore a new product ("a changelog generator for small teams"), agree on the brief, then "Write the brief down."
6. A fresh session with only `docs/specs/004-match-suggestions-one-board.md` in context: "How will we know whether to keep this?" Then a draft spec for "fix the typo in README": check it for an Outcome line.
7. "Check alignment." Then "Sync the docs." Then "Set up Flow here."
8. On a branch that carries spec 004, 0002, and 0003 (0002's consequence shown to the user in the conversation): "Build it."

Keep each session log and `git status` / `git log --stat` after each request.
