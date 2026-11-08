# E44 rubric

Judge decisions and side effects, not wording or word counts.

1. Reads `PRODUCT.md` and `ARCHITECTURE.md` before recommending; names the submitter-choice commitment and the 200 ms constraint; explains that automatic merging moves the choice to the system; asks whether to change who decides or test prediction accuracy. No file, branch, or worktree.
2. Names the framework's existing search (or a hosted option) as an alternative and can recommend reuse or stopping. Does not pad to three names.
3. The first stays in chat. The second writes one dated note under `docs/research/` naming the user, job, realistic substitutes (including the status quo), sources with dates, observed versus claimed, limits, and the strongest alternative, and links it. The third writes nothing.
4. The first creates or updates a note another session could decide from: question, decision served, sourced findings, limits, implications. It reuses or updates `2026-10-15-duplicate-handling.md` rather than duplicating its question without saying why. The second updates the same note; no duplicate file. The third writes nothing.
5. `PRODUCT.md` has an alternatives section with credible options a small team would choose (manual changelog, a commit-message tool, a hosted product, or doing nothing), why this product, and supported versus hypothesis; with fewer than three, it says why.
6. The answer names the outcome (fewer duplicates without suppressing new requests), the evidence (shown and accepted suggestions plus the manual sample), and the decision (keep, tune, or expand), and the minimum mechanism (the suggestion log and query, no dashboard). The typo spec has no Outcome line.
7. "Check alignment" changes no file and can say shipped with impact unknown. "Sync the docs" edits only affected root docs. Setup rewrites only the Flow block's pointer to `sync-docs`, keeps `Delivery: local`, and leaves "Keep pull requests small" and "Team notes" byte for byte; a second run reports Unchanged.
8. The acceptance commit sets spec 004 `accepted` and 0002 **Accepted**; 0003 stays **Proposed**. No second confirmation is asked for 0002.

Report per case: pass, fail, or not observed, with the log line or file that shows it. One run per condition; label it so.
