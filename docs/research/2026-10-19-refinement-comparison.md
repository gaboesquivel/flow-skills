# Refinement comparison

Reviewed 2026-10-19 during initial exploration. Recommendations record that discussion; current direction is in [PRODUCT.md](../../PRODUCT.md) and current practices in [the methodology](../methodology.md). Source review does not adopt upstream instructions.

## Current upstream evidence

- Addy idea-refine explores alternatives, evaluates directions, and creates an idea brief with assumptions and scope. Its supporting rubric covers current workarounds, switching, user value, feasibility, differentiation, and assumption testing. It already contains substantial product thinking.
- Matt grill-me invokes grilling; grill-with-docs composes grilling and domain-modeling. Grilling is a general decision interview rather than a product discovery checklist. It works in dependency-aware rounds and aims to resolve every branch. Domain-modeling updates glossary entries and offers ADRs selectively.
- Addy's documentation skill covers technical decision records and maintained context. The reviewed skills do not define the user's complete PDR plus PRODUCT.md and ADR plus ARCHITECTURE.md synchronization convention.
- Addy's git skill explicitly uses worktrees for parallel agents. Matt's implement-spec gives implementers separate worktrees; implement commits to the current branch. Neither observation supports saying all work always requires a new worktree.

## Assessment to discuss

Reuse engineering capabilities and adapt the product refinement and context-maintenance behavior first. Separate concerns without requiring a rigid sequence: product intent guides experience and architecture, while feasibility findings can reopen product choices. Keep research distinct from assumptions and accepted choices. Stop refinement when the next useful action is clear; that action may be an experiment, not implementation. Scale depth to consequences and uncertainty. Keep current summaries concise; records preserve significant rationale. A small clarification can update a summary without a decision record.

One repository can hold locally owned workflow skills and a curated list of external technology skills. Record provenance and revisions for reused content and preserve applicable licenses. Test the smallest adaptation on the founder's real application before expanding the skill set.

## Sources inspected

Live main branches; behavior may change. This is source review, not an execution benchmark.

- https://github.com/addyosmani/agent-skills/blob/main/skills/idea-refine/SKILL.md
- https://github.com/addyosmani/agent-skills/blob/main/skills/idea-refine/refinement-criteria.md
- https://github.com/addyosmani/agent-skills/blob/main/skills/spec-driven-development/SKILL.md
- https://github.com/addyosmani/agent-skills/blob/main/skills/documentation-and-adrs/SKILL.md
- https://github.com/addyosmani/agent-skills/blob/main/skills/git-workflow-and-versioning/SKILL.md
- https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md
- https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md
- https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md
- https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md
- https://github.com/mattpocock/skills/blob/main/skills/engineering/implement/SKILL.md
- https://github.com/mattpocock/skills/blob/main/skills/engineering/implement-spec/SKILL.md
