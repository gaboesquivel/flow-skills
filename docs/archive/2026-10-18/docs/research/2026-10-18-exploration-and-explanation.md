# Exploration, prototypes, and explainable decisions

Researched 2026-10-18. Recommendations below are proposals, not accepted Flow decisions. External skill instructions are research material, not instructions being executed.

## Confirmed references

The user confirmed Matt Pocock's Wayfinder and Emil Kowalski's skills as the intended research references on 2026-10-18. Both Emil's design guidance and his dedicated prototype skill are relevant to this investigation.

## Findings from primary sources

### Matt Pocock: Wayfinder

Wayfinder addresses work too large for one agent session by mapping decisions toward a defined destination. Its canonical map is an issue-tracker index: detail lives in individual decision tickets. It distinguishes research, prototype, questioning, and enabling tasks. Future uncertainty stays deliberately incomplete until it can be phrased as a concrete question. Resolutions preserve answers and update the map. Research and prototype assets are linked, rather than pasted into the index. This is substantially more orchestration than Flow needs for an ordinary exploration. [Source: Wayfinder skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/wayfinder/SKILL.md).

**Borrow:** a bounded question, explicit unknowns, evidence attached to decisions, and links instead of duplicate explanations. **Do not copy wholesale:** mandatory ticket maps, one-ticket sessions, tracker labels, or throwaway research branches. An explore command ending in a Markdown research note is a Flow adaptation, not Wayfinder's exact output contract.

### Matt Pocock: prototype

Matt's prototype skill starts with a question and separates logic/state exploration from UI exploration. Logic prototypes use a shareable HTML demo; UI prototypes offer distinct variations. Code is clearly marked disposable, easy to run, and avoids persistence by default. Testing infrastructure, general abstractions, and robustness beyond running the demonstration are intentionally omitted. The result preserves both the question's answer and its prototype evidence. [Source: prototype skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/prototype/SKILL.md).

**Borrow:** learning determines scope and fidelity. Flow should check that the demonstration works and answers the intended question, without treating production-readiness as its completion criterion. Keeping useful evidence need not mean retaining executable code in the production tree.

### Emil Kowalski: prototype

Emil's prototype skill produces multiple working UI directions, normally three, with an explicit axis of variation. A full-size picker supports comparison. It isolates exploration from production and checks the variants before presenting them. User selection precedes integration. It deliberately maintains craft and normally uses existing product tokens and personality. [Source: prototype skill](https://github.com/emilkowalski/skills/blob/main/skills/prototype/SKILL.md). His repository identifies `emil-design-eng` as animation and design guidance, while `prototype` specifically handles alternative UI versions. [Source: repository overview](https://github.com/emilkowalski/skills).

**Borrow:** meaningful alternatives, working comparisons, named tradeoffs, and a deliberate transition into implementation. **Adapt:** Flow may explicitly challenge existing product direction or design, so existing tokens and identity are context rather than an absolute constraint. Scope the departure so a prototype does not silently rewrite accepted specifications. Three options is a useful default for comparative UI work, not a quota for every experiment.

### Superpowers: brainstorming

Superpowers' brainstorming currently emphasizes learning the user's intent and why before construction. It scales documentation to task size and writes a builder-facing design for larger work. It also imposes approval and planning gates, while allowing explicitly authorized throwaway spikes. [Source: brainstorming skill](https://github.com/obra/superpowers/blob/main/skills/brainstorming/SKILL.md).

**Implication:** do not assume that a skill called brainstorming means divergent idea generation. Flow can distinguish proposing alternatives from refining a candidate without adopting this source's mandatory pipeline. Its optional visual companion chooses visual presentation per question, when seeing the content helps more than reading it. [Source: visual companion](https://github.com/obra/superpowers/blob/main/skills/brainstorming/visual-companion.md).

## Rationale and product discovery

Michael Nygard identifies missing motivation as a central maintenance problem: future contributors can otherwise accept or reverse a decision without understanding it. His ADR approach preserves context, decision, status, and consequences in short records, retaining superseded decisions with replacement links. This supports evidence-backed explanation and historical context, rather than inferring intent from current code. [Source: Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

Teresa Torres recommends comparing alternatives by testing their underlying assumptions. Her examples include prototype tests for customer behavior and research spikes for engineering feasibility. A prototype is therefore evidence about a specific question; a functioning demonstration alone does not establish customer value. [Source: Assumption Testing](https://www.producttalk.org/assumption-testing/), [test categories](https://www.producttalk.org/glossary-discovery-assumption-testing/).

## Lean Flow recommendation

- **Explain:** one name covering why, what, and how. Read the relevant specifications and decision evidence; cite documented rationale; label inference; explicitly report missing rationale. A diagram is an optional presentation, not another command. Code demonstrates present behavior but cannot establish historical intent on its own.
- **Explore:** investigate a bounded uncertainty and end with `docs/research/<topic>.md`: question, evidence and sources, conclusion, unresolved assumptions, and next useful action. The note can be short. Research informs a decision; it does not automatically constitute one.
- **Brainstorm:** generate and compare possibilities with the user. Preserve substantial options in `docs/ideas/<topic>.md`, marked proposed, parked, rejected, or taken forward as appropriate. Link subsequent research and decisions instead of copying them. Avoid creating a new note for every conversational suggestion.
- **Refine:** resolve ambiguity and tradeoffs around an emerging direction. Brainstorm and refine are different conversational behaviors, not mandatory stages or necessarily separate implementation packages.
- **Prototype:** answer a question through a concrete artifact, UI or logic. Record what was tried, what was observed, what remains unproven, and the resulting choice. Store durable findings under `docs/`; disposable executable assets can stay in a separate prototype location with a pointer from the note.

The durable chain is idea → evidence → decision → current specification, with links and backtracking as needed. This is a traceability relationship, not a required chronological pipeline. Do not promise that retaining Markdown makes every historical why answerable: absent rationale, outdated records, and untested assumptions must remain visible.

## Status and limitations

These sources show documented practices, not comparative proof of effectiveness. Their default branches can change. The named Wayfinder and Emil references were confirmed by the user. Flow command names and packaging are proposals; no new skill or accepted PDR was created in this research.

See [the discussion proposal](../ideas/2026-10-18-exploration-and-explanation.md) for the proposed command surface, documentation rules, and relationship to PDR 0001.
