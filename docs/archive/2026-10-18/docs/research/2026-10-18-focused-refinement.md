# Focused refinement without a rigid sequence

Researched: 2026-10-18. Synthesized from primary sources inspected for this discussion. The resulting Flow direction was accepted by the user; see [PDR 0001](../pdr/0001-focused-refinement.md).

## Question

How can Flow separate product, design, and architecture refinement, maintain their respective documents, and cover the process with a small skill set and minimal ceremony?

## Skill references

- **Addy Osmani, idea-refine:** starts with users and success, expands and converges, considers feasibility, then produces a brief problem/direction/assumptions/MVP/out-of-scope artifact. Explicitly works backward from user experience to technology. This supports product-first questioning without banning early feasibility checks. Its mandatory exploration of multiple variants can be excessive when direction is already settled. [Source](https://github.com/addyosmani/agent-skills/blob/main/skills/idea-refine/SKILL.md)
- **Addy Osmani, spec-driven-development:** explicitly gated Specify → Plan → Tasks → Implement, human validation each phase; spec combines objectives, stack, commands, project structure, style, testing, boundaries. Living spec updated with decisions and scope. Useful contrast: this combines product and engineering information and mandates transitions more rigidly than the requested Flow experience. [Source](https://github.com/addyosmani/agent-skills/blob/main/skills/spec-driven-development/SKILL.md)
- **Matt Pocock, grill-with-docs:** currently only composes two reusable disciplines: grilling and domain-modeling. This demonstrates a small user-facing entry point composed of internal capabilities. [Source](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md)
- **Matt Pocock, grilling:** current source asks rounds of questions whose dependencies are settled, then recomputes the next round. It aims to exhaust the decision tree. Borrow dependency-aware questioning; do not copy the exhaustive stopping condition for lean Flow. Older descriptions saying one question at a time are stale relative to current source. [Source](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md)
- **Matt Pocock, domain-modeling:** creates files lazily, updates glossary as terms resolve, excludes implementation detail from glossary, and offers ADRs only for decisions that are hard to reverse, surprising without context, and involve real tradeoffs. Supports narrow glossary and selective rationale records. [Source](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md)
- **Matt Pocock, to-spec:** current name is to-spec (to-prd direct source returned 404). Synthesizes existing conversation rather than conducting a fresh interview, though it confirms testing seams. Includes problem, solution, user stories, implementation and testing decisions, out of scope, and publishes to a tracker. Useful synthesis pattern; its extensive user-story requirement and combined spec ownership are not automatically a fit for Flow. [Source](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md)
- **assimovt/productskills, prd-writing:** explicitly excludes architecture, APIs, database schemas from PRDs; asks for evidence, measurable outcomes, target users, requirements and out-of-scope. Borrow distinction of product need versus implementation. Fixed word lengths, numeric targets everywhere, mandatory sections should not become Flow bureaucracy or fabricated evidence. [Source](https://github.com/assimovt/productskills/blob/main/skills/prd-writing/SKILL.md)
- **Agent Skills specification:** metadata loads initially, skill body at activation, references on demand. Focused reference files can therefore hold product/design/architecture guidance under one refinement entry without three public skills. The specification permits this structure; it does not prove that one skill is optimal. [Source](https://agentskills.io/specification#progressive-disclosure)

## Process references

- **Teresa Torres:** recommends adopting discovery habits incrementally, including starting with hidden assumptions. Feasibility belongs alongside desirability, viability, usability, and ethics. Implication for Flow: start small and investigate technical uncertainty early when it matters. [Source](https://www.producttalk.org/getting-started-with-discovery/)
- **Design Council:** explicitly describes the Double Diamond as nonlinear, allowing learning and testing to reshape earlier understanding. Implication: distinct concerns need not become sequential gates. [Source](https://www.designcouncil.org.uk/resources/framework-for-innovation/)
- **Shape Up:** shaping combines interface ideas, technical possibilities, and business priorities while remaining rough, solved, and bounded. Implication: resolve consequential uncertainty while leaving implementation detail open. [Source](https://basecamp.com/shapeup/1.1-chapter-02)
- **GitHub Spec Kit:** presents feature development, bug fixing, and idea assessment as independent entry points rather than mandatory phases. Its broader toolkit offers a reference for flexible entry without requiring Flow to adopt its full machinery. [Source](https://github.com/github/spec-kit)

## Synthesis

Use one refinement entry with product, design, and architecture focuses. Give each focus distinct questions and document ownership, while selecting the next question from actual uncertainty and dependencies. Product-first applies when direction is unclear; existing context and feasibility risks can justify a different starting point.

For a GitHub-inspired habit tracker, establish whether the reference means an audience, heatmap, visual style, or social behavior. Resolve the experience and cross-device requirements before choosing storage. A technical constraint can still reopen product scope or design.

Stop when enough is understood for the next useful action. Refinement resolves choices; specification captures an agreed increment. Significant rationale deserves a decision record; routine answers update the relevant living document. Branding does not require a separate skill: positioning and promise belong to product, visual and interaction expression to design.

## Limitations

Sources document instructions and methods, not comparative evidence that this configuration improves outcomes. Live default branches can change; verify exact upstream behavior before adopting implementation details. The user's cited live demo was not independently identified or inspected, so no shortcomings are attributed to its author.

Exact command syntax, packaging, and the remaining public skill count are unsettled. Validate the approach through real use before expanding it. This document preserves research evidence; the living documents and accepted decision describe Flow's current direction.
