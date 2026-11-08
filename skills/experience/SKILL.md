---
name: experience
description: Walk a working product as its user would and report observed friction with evidence; read-only. Use when the user says "walk the experience" or "try it like a user".
disable-model-invocation: false
---

# Experience

**What is it like to use this?** Follow a real journey through a running product and report what a user would meet. This is observation, never repair: visual direction is `design`, correctness against intent is `review`, outcomes and direction are `align`, delivery is `ship`.

## Set up

Name the user and one journey (from `PRODUCT.md`, `DESIGN.md`, the request, or your best guess, stated). Find something running: a preview URL, a local dev server, or the app in a simulator. Use the host's own browser, screenshot, or recording tools; add no dependency. With nothing to run, say so, and limit the report to what code and docs support, labeled that way.

Start from a realistic state: seeded or test data, never a production account or live mutation. Skip anything that sends, pays, or deletes real data.

## Walk

Follow the journey as the user would: first load, the main task, then the states around it (loading, empty, error, slow, small screen, keyboard). At each step note what you saw, what you expected from the product and `DESIGN.md`, and any hesitation a person would have. Look at the result you report; when you cannot see it, say so.

## Report

Lead with the journey and the state you started from. Then findings, highest user impact first, each with:

- **Steps** to reproduce and the **observed** result.
- **Impact** on the user and **confidence** (seen once, repeated, inferred).
- **Smallest improvement**, as a suggestion.

Keep observations, hypotheses, and limits apart, and say what the walk did not cover. Include no praise padding and no finding you cannot reproduce. End by naming the skill that would act (`build`, `design`) and wait.

## Boundaries

Read-only: never edit files, fix, install tools, or change data. It is not a metrics analysis, a code review, or a test suite, and nothing requires it.
