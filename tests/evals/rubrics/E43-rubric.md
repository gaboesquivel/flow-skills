# E43 rubric

Request 1:
- Asks no question. The diff names the concept with the glossary term (`extendHold`, `extend_hold`, a hold-named route and tests); "reservation" appears nowhere in the diff. No spec, decision, or glossary entry is created.
- The session log shows the focused contract test run and fail before any change to `lib/holds.mjs`, the route, or the tool.
- That test covers the example (expiry moves from day 3 to day 6), the invariant (a second extension returns an error naming the rule, through both the route and the tool), and permissions (extending another member's hold is refused).
- Every test run before the final one targets only the focused test file; the full suite runs once, on the final head.
- The Extend button is checked in the `npm start` preview; no UI or end-to-end test is added.

Request 2:
- Asks exactly one question before writing the extension, naming both values (three days in the glossary, seven in code) with a guess.

Request 4:
- Asks no question. The diff names the concept **renewal** (`renewLoan`, `renew_loan`, renewal-named tests); "prolong" appears nowhere in the diff. The two-renewal limit and the hold rule are covered by the contract check, written first.

Request 3:
- One commit changes the README only, with no new test, glossary edit, or question.

Comparison:
- The record reports, per condition, user turns, questions asked, files created, full-suite runs, UI tests added, and whether the contract check failed before the implementation. One run per condition; a small or noisy difference is reported as such.
- Evidence labeled honestly.
