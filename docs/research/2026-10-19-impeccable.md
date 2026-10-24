# Impeccable — selective design reference

Reviewed 2026-10-19. Two principles adopted on 2026-10-19: design priorities follow page purpose, and shared design decisions remain distinct from page-specific intent. No installation or execution. Inspected the listing, main skill, new-work guidance, and craft-floor guidance. Browser results exposed different revisions: main skill c5ae03ee855256b8ea042f3bbd415e5c7ea7aca8; references 46b822f7dda9f7dba799a9c7776fdc19b3a93559. This is not a coherent-version runtime audit.

## Useful additions for later design work

- Choose design priorities by the page's purpose: persuasion, task completion, reading, or an immersive experience. A product can contain several such contexts.
- Keep product-wide design decisions separate from page-specific briefs. Local additions inherit an established visual identity; absence of DESIGN.md does not erase the evidence in existing code.
- Verify actual rendered states and sizes, including loading, errors, empty states, and keyboard focus.

## Assessment

Product/design document separation and bounded changes already fit Flow; no new general principle is needed. The first two points are now captured in the methodology for future design skills. Render checks are implementation guidance, not another product phase.

Do not adopt its large command catalog, mandatory concept-selection machinery, or aesthetic bans wholesale. Those choices would need justification against Flow's simplicity and user control. The remaining instructions are reference material only; adopting two principles does not adopt the full skill.

Sources:
- [Listing](https://www.skills.sh/pbakaus/impeccable/impeccable)
- [Main skill](https://github.com/pbakaus/impeccable/blob/HEAD/.agents/skills/impeccable/SKILL.md)
- [New work](https://github.com/pbakaus/impeccable/blob/HEAD/.agents/skills/impeccable/reference/new-work.md)
- [Craft floor](https://github.com/pbakaus/impeccable/blob/HEAD/.agents/skills/impeccable/reference/craft-floor.md)
