# 070 — Explore as a product-engineering partner

Status: draft (2026-11-08). Appetite: one session. Decision: [0070](../decisions/0070-research-and-clearer-names.md).

## Problem

Flow's value includes helping someone find that an existing tool already solves the problem, decline a request that works against the product, or run a cheap experiment before building. After [spec 069](069-product-peer-explore.md), `explore` reads like a peer but still falls short of that:

- It compares alternatives "only when the comparison could change a decision", which assumes the agent already knows what exists. A mature native feature or open-source tool can go unmentioned while the conversation designs a build.
- Interview choreography remains: predict the user's next three answers, give a guess with every question, re-ask "whatever you think" as a forced choice.
- An explicit "research X" or "competitors for X" has no owner. [Spec 059](059-claude-code-first.md) removed `competitors` after one read-only comparison in which it and no skill each scored 10/15 on constraints, insight, and usefulness ([record](../../tests/evals/records/2026-11-03-build-vs-no-skills.md)). That justified removing a standalone analysis prompt. It did not test whether `explore` proactively considers alternatives, whether an explicit request produces a durable research artifact, or whether another session can decide from it.
- `PRODUCT.md` has no account of alternatives and differentiation, Flow's own included.
- A spec says what to build and how to prove it works, not how anyone will know whether to keep it. "Did it land?" has no stated observation or decision to look for.
- Skill names blur jobs. `product` checks fit and evidence; `flow` writes documents and shares the plugin's name. "Check alignment" and "sync the docs" do not map to either name.
- `build` says it accepts "any **Proposed** direction-change record the branch adds", so an unrelated proposal sharing the branch could be accepted by "build it".

## Solution

Sharpen existing owners, add one skill, rename two. No hook, phrase parser, research service, analytics platform, or startup import.

- **`explore`** establishes the product goals, experience commitments, and architectural constraints before its first substantive recommendation: `PRODUCT.md`, `DESIGN.md`, and `ARCHITECTURE.md` (short ones whole, long ones by goals, commitments, boundaries, and the sections the idea touches), the glossary when a project meaning could change the decision, and referenced records selectively. It carries that through the conversation rather than rereading every turn; a missing document is normal and creates no task. When a proposal diverges from accepted direction it names the commitment, explains the consequence in product terms, and asks the question that separates an experiment from a pivot. Residual choreography gives way to judgment; challenge, pre-mortems, and targeted questions stay where they improve the decision. Ordinary sessions and native Plan keep the usual progressive disclosure.
- **Alternatives are normal discovery.** For a new product, substantial feature, pivot, or build-versus-buy choice, `explore` establishes how the problem is solved today before recommending a build: project evidence and existing research first, external search when that is missing, stale, or too weak. Realistic alternatives include the status quo or a manual workaround, direct products, and open-source tools, libraries, host features, APIs, MCP servers, or capabilities already in the project, compared on what matters to this decision. Valid outcomes include adopt, integrate, test an assumption, defer, stop, and build a differentiated slice. A copy fix needs none of this; research in support of a conversation stays in chat.
- **`research`** (new) answers an explicit research request. "Research X" creates or updates a sourced note in the project's research home; "competitors for X" produces a competitive brief through the same skill; "just tell me here" answers in chat; "should we research…?" is discussion. Notes state the question, findings with direct sources and dates, observed capability apart from vendor claim and inference, limits and unknowns, and implications, without adopting a recommendation. A write is scoped to the note and any existing index.
- **`PRODUCT.md` alternatives.** A new or materially repositioned product records the alternatives its user would realistically choose (aim for three when the landscape supports them; fewer, with the limit stated, is valid), why they might choose this product for the job, and which parts are supported versus hypothesis. Dated comparison detail lives in the research note. Flow's own `PRODUCT.md` gets this section from a verified note.
- **Outcome in the spec.** An idea selected as an initiative carries one sentence from `explore` into its spec: the outcome that should change for whom, the evidence that will be looked at, and the decision it informs. Reuse an existing metric definition; prefer an existing observation, benchmark, manual sample, or query. Missing instrumentation is in scope only when the decision depends on it. Before shipping, `build` proves the behavior and that the observation can be obtained; afterwards `align` judges the outcome, keeping unknowns explicit. A typo or internal cleanup carries none.
- **Names.** `product` becomes `align` ("check alignment", "are we building the right thing", "did it land"), read-only as before. `flow` becomes `sync-docs` ("sync the docs", "update the docs", "set up Flow here"); `flow` stays the plugin and project name, and bare "sync" triggers nothing. The block helper refreshes an old block that names the `flow` skill on the next setup or sync, keeping delivery settings and adopter text.
- **Acceptance scope.** "Build it" accepts the identified work and the linked, disclosed changes whose consequences the user has seen; an unrelated Proposed record on the branch gets no approval. `ship` and `to-spec` use the same rule.
- **Catalog.** One phrase, the outcome, and whether it writes, per skill, plus a short distinction among native Plan, `explore`, `research`, `align`, and `sync-docs`.

## Decisions

- Recorded in [0070](../decisions/0070-research-and-clearer-names.md): add `research`, rename `product` → `align` and `flow` → `sync-docs`, and carry an outcome sentence from initiative to spec. Amends [0062](../decisions/0062-claude-code-first.md) (catalog) and builds on [0041](../decisions/0041-align-skill.md), [0046](../decisions/0046-measurement-assistance.md), and [0068](../decisions/0068-experience-skill.md)'s new-skill test.
- **Acceptance scope** clarifies [0069](../decisions/0069-direction-changes-at-adoption.md) item 2 and [0048](../decisions/0048-delivery-phrases-are-approvals.md) (a phrase approves identified work); it chooses no new direction, so it is a bullet here.
- **Migration.** Natural phrases carry over through descriptions. Explicit slash paths change (`/flow:product` → `/flow:align`, `/flow:flow` → `/flow:sync-docs`; unprefixed on Agent Skills hosts); no alias skill is kept, since an alias would advertise two identical skills. The Flow block is rewritten from known lines, so its pointer updates on the next write and `Delivery:` carries over. Plugin version stays at release time ([RELEASE.md](../RELEASE.md)).
- **Skill words** stay within the 10,000-word budget by trimming existing skills.

## Acceptance

Scenario: a maintainer of Signal, a feedback board whose `PRODUCT.md` says submitters choose whether to upvote a suggested duplicate, and whose `ARCHITECTURE.md` says matching runs on the request path within 200 ms.

1. "Explore auto-merging duplicate requests." The agent reads the commitment and constraint first, explains that automatic merging moves the choice from submitter to system and adds request-path work, and asks whether the user wants to change who decides or test how accurately the choice can be predicted. Nothing is written.
2. "Explore adding full-text search to our docs site," where the host framework already ships search. The agent names the existing option and can recommend reuse or stopping, with no quota of three names.
3. "Explore this. What do competitors do?" stays in chat. "Competitors for Signal, focusing on duplicate prevention" writes a sourced brief under `docs/research/` and links it. "Should we research competitors?" writes nothing.
4. "Research how teams handle duplicate feature requests" writes a note that names the question, sources, limits, and implications; repeating it updates that note; "research X, just tell me here" stays in chat.
5. An agreed new-product brief records two or three credible alternatives and a differentiation hypothesis; with two, it says why no third was found.
6. A fresh session given only the accepted spec answers "How will we know whether to keep this?" and names the minimum observation. A typo spec has no outcome line.
7. "Check alignment" writes nothing. "Sync the docs" updates the affected accepted context. Running the block helper on an old block that names the `flow` skill and records `Delivery: local` rewrites only the pointer and keeps the delivery line and adopter text.
8. "Build it" on a branch with one disclosed linked decision and one unrelated Proposed record accepts only the linked one.

Invariants: `pnpm validate` and `pnpm test` pass; skill words stay within budget; no hook changes.

## Out of Scope

A hook, phrase parser, research service, analytics platform, dashboard, alias skills, a second spec or decision type, edits to adopter repositories, paid evaluation, release, and version bumps.

## Tasks

One delivery; no task split.
