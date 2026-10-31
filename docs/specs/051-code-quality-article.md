# 051 — First article: code quality when agents write the code

Status: candidate (2026-10-31). Split from [spec 050](050-understandable-changes.md); flesh out after 050 lands.

## Problem

Readers have no article explaining Flow's position on quality when agents generate code cheaply: make software easy to understand and safe to change, and require evidence proportional to what can go wrong. Flow has no blog source yet.

## Assumption it tests

A source-backed article that describes Flow's implemented review-as-repair and proportional-rigor guidance (spec 050), and keeps current practice, Flow's interpretation, and proposals clearly apart, is useful to product-minded engineers directing coding agents.

## Starting material

- Working title: **Does Code Quality Still Matter When Agents Write the Code?** Single Markdown source under `docs/blog/`, visibly marked draft, with a minimal `docs/blog/README.md` index.
- A concise research note on both talks under `docs/research/`, indexed in `docs/references.md`; the article links to it rather than copying transcripts.
- Sources: Max Kanat-Alexander ([talk](https://www.youtube.com/watch?v=bU5gDVyu_28), [transcript](https://ai.engineer/nyc/2026/talks/capital-one), [essay](https://www.codesimplicity.com/post/does-code-quality-even-matter-anymore/)); Laurie Voss ([talk](https://www.youtube.com/watch?v=_mi3alkqy4s), [transcript](https://ai.engineer/talks/_mi3alkqy4s-death-code-review-what-data-actually-says)). Reported studies are leads, not verified findings; trace any retained number to its primary study.
- Recovered draft prose from the conversation "Analyze Flow Principle Fit" (`6ae642fa-b4cc-83e8-a85b-46e9170fe2d6`) is drafting material only.

Site routing, navigation, and publishing stay separate; the article does not imply a launched blog or measured improvement.
