---
name: requirements
description: Capture explicit product requirements, scope, and acceptance criteria without writing an implementation spec.
disable-model-invocation: true
---

# Requirements

Synthesize what is already known from conversation, briefs, and repository context. Do not run an open-ended interview when the material already answers the question.

Produce a concise requirements summary:

- Problem and intended outcome.
- Users and primary jobs to be done.
- Functional requirements and meaningful constraints.
- Non-goals and deferred scope.
- Observable acceptance criteria at product or initiative level.
- Accepted decisions to preserve; proposals and assumptions labeled clearly.
- Material uncertainties that block planning or implementation.

Update owning documents (`PRODUCT.md`, initiative files, or equivalent) only when the user authorizes a durable change. Do not duplicate the same facts across multiple files.

This skill captures **what** must be true for success. Use [to-spec](../to-spec/SKILL.md) for a bounded increment specification with seams and stories. Use [grill](../grill/SKILL.md) when consequential uncertainty still needs focused questioning. Use [grill-with-docs](../grill-with-docs/SKILL.md) when terminology or decision records should change with the answers.

Request explicit approval before substantial implementation when scope or direction is still a proposal. Requirements work does not authorize coding by itself.
