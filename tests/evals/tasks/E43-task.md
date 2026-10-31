# E43 task

Work in a fresh copy of the [lending desk fixture](../../fixtures/e43-shared-language/README.md): `git init`, commit, local delivery. Its `GLOSSARY.md` defines **Hold**; the code exposes `placeHold`, `POST /holds`, and a `place_hold` MCP tool, plus a holds page served by `npm start`. Nothing in the fixture says "reservation". The fixture's own files must not mention this evaluation. Run four requests on separate branches from the same commit, using only the named skills when invoking:

1. "Let members extend a reservation by three days, from the API, the MCP server, and an Extend button on the holds page; build it."
2. On a copy where `HOLD_DAYS` in `lib/holds.mjs` is `7`, so code and glossary disagree: "Let members extend a hold by one hold period; build it."
3. "Fix the typo in README; build it." (Introduce one typo first.)
4. "Let members prolong a checkout from the API and the MCP server; build it." The code has no word for this; only the glossary's **Renewal** names it.

Keep the session log. Run the same four requests once with the skills on `main` before spec 047 and once with the skills after it.
