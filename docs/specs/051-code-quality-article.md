# 051 — First article: code quality when agents write the code

Status: draft (2026-10-31). Was candidate (2026-10-31), split from [spec 050](050-understandable-changes.md), which has landed (#214).

## Problem Statement

Product-minded engineers who direct coding agents hear two opposite claims: code quality no longer matters because agents rewrite code cheaply, or agents make careful line-by-line review more necessary than ever. Flow has a position on this, [understandable change](../principles.md#understandable-change): make software easy to understand and safe to change, and require evidence proportional to what can go wrong. That position exists only as a principle paragraph and skill text (`review` Repair, `build` intake). No source explains why Flow holds it, what it rests on, or where the evidence stops, and Flow has no place for that kind of writing.

## Solution

One draft article in the repository, plus the research note it rests on.

- **Article.** Working title: **Does Code Quality Still Matter When Agents Write the Code?** It argues Flow's position for a reader who directs agents, not for Flow maintainers: cheap generation moves the cost from writing code to understanding and changing it; agent output does not establish understanding; evidence should match the consequence of failure; review should end in repaired, verified work rather than a findings list; a responding deployment is liveness, not verified behaviour or customer value. It describes what Flow does today (spec 050 as merged) and keeps three things visibly apart: what the sources report, how Flow interprets it, and what remains a proposal or open question.
- **Research note.** A short note on the two talks and the essay: claims, the studies they cite, what was verified, and limits. The article links to it instead of quoting at length.

The assumption under test: a source-backed article that keeps reported practice, Flow's interpretation, and proposals apart is useful to product-minded engineers directing agents. This draft proves the article can be written to that standard; whether readers find it useful needs publication, which is out of scope.

## Implementation Decisions

**Files and owners.**

- `docs/blog/README.md`: minimal index stating that the folder holds articles explaining Flow's positions, that articles describe and link to their owners (`PRODUCT.md`, `docs/principles.md`, skills) and never define behaviour, and listing the article with its status.
- `docs/blog/code-quality-agents.md`: the article. First line after the title marks it **Draft** with the date and links this spec. One authoritative source; no copies elsewhere.
- `docs/research/2026-MM-DD-code-quality-talks.md`: the research note, in the existing research format (sources table with what each documents and its limits, then the design inference).
- `docs/references.md`: a new section, or rows under an existing one, indexing the three sources as candidate influences, linking the note. Inclusion is not adoption.
- `docs/README.md`: one row for `blog/` ("Articles explaining Flow's positions; they link to owners and define nothing").

**Article shape (about 1,200–1,800 words).** Open with the reader's question. Then: what changed when generation became cheap (sources, reported); what Flow concludes (the principle, linked); what Flow does about it in practice: proportional evidence, review as repair with single-agent labelling, liveness versus verified behaviour versus value, each linked to its owner; what this does not claim (no measured improvement from Flow, no claim that separate review removes correlated mistakes or prompt injection); and a short close. Concrete example: reuse the hold-extension review from spec 050's acceptance scenario (a passing test suite, an affected caller outside the diff, a change description asking the reviewer to ignore it) rather than inventing a new one.

**Source rules.** Sources: Max Kanat-Alexander ([talk](https://www.youtube.com/watch?v=bU5gDVyu_28), [transcript](https://ai.engineer/nyc/2026/talks/capital-one), [essay](https://www.codesimplicity.com/post/does-code-quality-even-matter-anymore/)); Laurie Voss ([talk](https://www.youtube.com/watch?v=_mi3alkqy4s), [transcript](https://ai.engineer/talks/_mi3alkqy4s-death-code-review-what-data-actually-says)). Read the transcripts and essay, not summaries. A study the talks report is a lead: a number stays in the article only when traced to its primary study, cited there, with its population and limit; otherwise drop it or state it as "reported by" with no figure. Quote sparingly and attribute; paraphrase otherwise. Mark each attributed claim with its speaker so reported claims cannot read as Flow's.

**Drafting material.** Prose recovered from the conversation "Analyze Flow Principle Fit" (`6ae642fa-b4cc-83e8-a85b-46e9170fe2d6`) may be reused as drafting material only. It is not in this machine's Claude Code session logs; if it cannot be retrieved, draft from the sources and spec 050 without it.

**Writing.** Apply [`write-humans`](../../skills/write-humans/SKILL.md) to the article and the note. Plain, concise, professional; no personal motivations or private context ([AGENTS.md](../../AGENTS.md)).

**Exposure:** no deployable behaviour. The site renders only the curated `DOCS` list in `site/scripts/build-content.mjs`, so `docs/blog/` is not published by this spec; nothing is pushed beyond the spec branch, and nothing is deployed.

No decision record: creating `docs/blog/` and writing one article chooses among no alternatives that reach beyond this spec. Publishing and site routing, if wanted later, get their own spec.

## Testing Decisions

No code, so no tests. `pnpm validate` covers links and policy before a PR. Review is against the source rules above.

**Acceptance scenario.** Actor: the maintainer, reviewing the branch. Starting state: `main` with spec 050 merged; the two talks, transcripts, and essay reachable online.

1. The maintainer opens `docs/blog/code-quality-agents.md`. → The draft marker, date, and link to this spec are at the top; the article answers the title question for someone directing agents, in the shape above.
2. They pick every numeric claim in the article. → Each cites its primary study with population and limit in the research note; any number that could not be traced is absent.
3. They pick three statements at random. → Each is visibly one of: attributed to a named source, Flow's interpretation linked to its owner (`docs/principles.md`, `review`, `build`, `ship`), or labelled as a proposal or open question.
4. They compare the article's description of review against `skills/review/SKILL.md` Repair and decision 0040. → It matches the merged behaviour: scoped repair, "review only" stays read-only, single-agent labelling, liveness without automatic production journeys. It claims no measured improvement.
5. They open the research note and `docs/references.md`. → The note records sources, what was checked and when, and limits; the index links it and marks the sources as influences under assessment, not adopted.
6. They run the site build or read `DOCS` in `site/scripts/build-content.mjs`. → No blog page is generated.

## Out of Scope

- Publishing: site routes, navigation, feeds, social posts, or any statement that a blog has launched.
- Changing `docs/principles.md`, skills, or spec 050 guidance. If drafting exposes a gap in the guidance, record it as a proposal, not an edit.
- A second article or a series plan.
- Measuring the article's reach or effect.

## Further Notes

- Appetite (assumed, not agreed): one session for the research note and a complete first draft. If the sources take longer, ship the note and an outline before cutting source rigour.
- Open assumptions: the talk transcripts on ai.engineer stay reachable; the cited studies are public enough to trace; `docs/blog/` is the right home rather than `docs/research/`.
