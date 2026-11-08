---
name: research
description: Investigate a question or a competitive landscape from sources and record a dated, sourced note another session can decide from. Use when the user says "research X", "competitors for X", or "research X, just tell me here".
disable-model-invocation: false
---

# Research

**"Research X"** answers a question from evidence and leaves a note someone who missed the conversation can decide from; **"competitors for X"** is the same job as a competitive brief. The request authorizes the note.

## What the request asks

- **"Research X"** or **"competitors for X"** in a project: write or update the note, then link it.
- **"Just tell me here"**, or no known project destination: answer in chat in the same shape.
- **"Should we research…?"**, a quoted phrase, or a hypothetical: discuss whether research would change the decision; write nothing.

## Investigate

Start from the decision the research serves; infer it and say so when unnamed. Read the project context it touches and existing notes first: update a current note on the same question rather than duplicating it, keeping superseded findings readable with their dates. Then look externally, preferring primary sources (official docs, repositories, the product itself).

For a competitive brief, establish the intended user, the job they are doing, and the realistic substitutes: the status quo or a manual workaround, direct products, and open-source tools, host features, APIs, or integrations. Compare only distinctions that could change the choice, in a table when it is a genuine comparison; no generic feature matrix or exhaustive list.

## Rules of evidence

- Every material finding links a direct source, and time-sensitive ones carry the date read.
- Separate **observed** (you read or ran it), **claimed** (a vendor or author says so), and **inferred** (your reasoning).
- Never invent a source. A feature you did not find is "not found in <source>", never absent.
- Implications are proposals. A note never adopts a recommendation, edits `PRODUCT.md`, or starts setup or delivery; name the skill that would (`explore`, `sync-docs`, `to-spec`) and stop.

## The note

Use the project's research convention (Flow Skills: `docs/research/`, indexed in `docs/references.md`); without one, write a single `docs/research/YYYY-MM-DD-topic.md` and no index, taxonomy, or tree. As short as complete:

- **Question** and the decision it informs; the date and what was inspected.
- **Findings**, each sourced and labeled observed, claimed, or inferred; for a brief, the user, job, substitutes, and distinguishing differences.
- **Limits and unknowns**: what was not read or failed to load, and what would change the conclusion.
- **Implications**: the strongest alternative and what the findings suggest for the decision.

Write only the note and an existing index, on a non-default branch (the current one, else one named for the research; `write-agents` Sessions); commit and report the path as a link, opening it where the host supports that.
