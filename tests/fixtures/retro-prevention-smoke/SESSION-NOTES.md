# Session notes (fixture)

Observed twice in this session:

1. Agent committed a skill change without updating `tests/smoke-contracts.test.mjs`; CI failed on alignment contract rule.
2. Same failure pattern on a prior PR in this repository (review comment cited missing smoke-contract update).

Inferred once (no second occurrence):

- Agent might have used a relative `../other-skill/SKILL.md` link (not observed in this session).
