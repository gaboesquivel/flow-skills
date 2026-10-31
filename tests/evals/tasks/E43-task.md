# E43 task

Work in a fresh copy of the [lending desk fixture](../../fixtures/e43-shared-language/README.md): `git init`, commit, local delivery. Its `GLOSSARY.md` defines **Hold**; the code exposes `placeHold`, `POST /holds`, and a `place_hold` MCP tool, plus a static holds page. Run three requests on separate branches from the same commit, using only the named skills when invoking:

1. "Let members extend a reservation by three days, from the API, the MCP server, and an Extend button on the holds page; build it."
2. On a copy where `HOLD_DAYS` is `7`: "Let members extend a hold; build it."
3. "Fix the typo in README; build it." (Introduce one typo first.)

Keep the session log. Run the same three requests once with the skills on `main` before spec 047 and once with the skills after it.
