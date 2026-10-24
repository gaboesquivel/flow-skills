# Flow Skills — Design

Status: refinement experience accepted on 2026-10-18; other experience conventions remain provisional.

## Experience direction

Flow is currently a conversational workflow supported by Markdown documents. No visual interface, brand system, component library, or design tokens have been selected.

The user wants the experience to remain lean and professional. The following conventions are an initial interpretation of that direction:

- Begin with the user problem and desired outcome.
- Make the next useful action clear without requiring every stage for every change.
- Increase rigor when uncertainty or consequence warrants it.
- Consider journeys, interaction alternatives, accessibility, and existing design constraints during specification.
- Use prototypes when they resolve a meaningful uncertainty.
- Present evidence, assumptions, proposals, and accepted choices distinctly.
- Ask for decisions when needed; proceed with routine work within the user's authorization.

## Refinement experience

Use one entry point with optional product, design, or architecture focus. Illustrative syntax is `/refine …`, `/refine product …`, `/refine design …`, and `/refine architecture …`; these are not installed commands and exact syntax remains to be validated.

Each focus asks questions appropriate to the uncertainty being resolved. Infer answers from existing context when possible, make recommendations with reasons, and ask only questions that materially affect the next action. Move between focuses as dependencies require; a user with existing direction or designs can start from that context.

Design refinement covers user journeys, interactions, visual identity, accessibility, and shared experience conventions. Product positioning and the brand promise remain in PRODUCT.md.

For a “GitHub-inspired habit tracker,” clarify whether the reference means a heatmap, a developer audience, visual styling, or social accountability when the distinction matters. Establish how habits are recorded and represented. Ask about cross-device continuity before selecting a storage mechanism. A visual reference leaves interaction decisions to resolve.

Prototypes and experiments are valid refinement outputs. Stop when the next useful action is clear and remaining uncertainty is explicit.

## Documentation experience

PRODUCT.md owns product direction and requirements. This document owns design specifications, including shared interaction and presentation conventions. ARCHITECTURE.md owns architecture specifications and technical tradeoffs.

Keep documents concise and complementary. Reference the authoritative location rather than copying its content. Living documents explain the current position; decision records explain why significant choices were made.

For Flow itself, experience includes prompts, stage transitions, outputs, and recovery from incomplete context. Specific prompt formats and handoff formats are not yet designed.

## Unresolved design work

Validate focus selection, transitions, and how the skill reports unresolved assumptions and presents consequential choices. Establish concrete templates only when repeated use shows they help.
