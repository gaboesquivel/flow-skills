# Source and continuity

## Imported source

[Compare GitHub Issues Skills — shared ChatGPT conversation](https://chatgpt.com/share/6ad4e692-0e88-83e8-8c6c-98ecbc2edce2), read on 2026-10-18.

This workspace contains a synthesis, not a verbatim transcript. The visible shared conversation compares task planning approaches and develops a proposal for Flow. Its user message establishes the desired blend of engineering rigor, lean composability, worktree safety, lightweight product discovery, and maintained product/design/architecture documents.

The current user instruction establishes the bootstrapping approach: build Flow Skills using the emerging process, with prompts, memory captured in files, and available tools until the skills exist.

## Proposal status

The six-stage, eight-capability model was an earlier assistant proposal. On 2026-10-18 the user accepted one refinement entry with product, design, and architecture focuses, replacing the separate Explore-stage proposal and leaving the final skill count open. See [PDR 0001](pdr/0001-focused-refinement.md). Other inherited proposals remain provisional unless explicitly adopted.

The root layout was created at the user’s request. Decision records begin with choices made in this project; they do not retroactively imply acceptance of the imported assistant recommendations.

## Nilo gap

The user refers to prior Nilo and Flow work. The supplied shared conversation does not contain a separate Nilo definition, decision history, or documentation set. Its property-search examples are illustrative and have not been assigned to Nilo. Import additional Nilo material when provided and reconcile it against this working foundation.

## Referenced influences

These are references mentioned in the source conversation, not independently audited dependencies:

- [Addy Osmani's agent skills](https://github.com/addyosmani/agent-skills): desired influence on rigor and verification.
- [Matt Pocock's skills](https://github.com/mattpocock/skills): desired influence on composability, issue planning, and worktree safety.
- [ProductSkills](https://github.com/assimovt/productskills): product discovery and scope techniques.
- [Teresa Torres / Product Talk](https://www.producttalk.org/2023/11/benefits-of-opportunity-solution-trees/): outcome, opportunity, solution, and assumption thinking.

Claims in the shared chat about current upstream skill names, command flags, and supported integrations need fresh verification before implementation depends on them.

## Follow-up research

[Focused refinement research](research/2026-10-18-focused-refinement.md) preserves primary-source findings from 2026-10-18, their implications, and limits. Specific findings there were checked during the discussion; the original shared chat remains historical context.

## New capability discussion

On 2026-10-18 the user proposed explain/why, research-producing exploration, brainstorming, and disposable prototypes as ways to retain and retrieve reasoning. [The proposal](ideas/2026-10-18-exploration-and-explanation.md) and [research](research/2026-10-18-exploration-and-explanation.md) preserve the discussion. Command packaging remains proposed and does not yet amend PDR 0001.
