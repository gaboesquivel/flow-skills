# 030: Adaptive explore

Status: candidate (2026-10-28).

## Problem Statement

`explore` always runs the same depth: interview until the next three answers are predictable, an explicit yes, a grill, and a pre-mortem, including when the user already named the outcome. The direction-change gate and a brief the user recognizes are doing the real work. The fixed sequence asks for confirmations the request has already answered.

## Assumption

When the user has already stated the outcome, fewer mandatory questions and confirmations still produce a brief they recognize, and a goal that contradicts an accepted decision, an accepted spec, or a `PRODUCT.md` fact still stops for a yes.
