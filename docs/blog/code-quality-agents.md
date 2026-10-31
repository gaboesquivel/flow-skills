# Does Code Quality Still Matter When Agents Write the Code?

**Draft, 2026-10-31.** Not published. Scope and source rules: [spec 051](../specs/051-code-quality-article.md). Sources and their limits: [research note](../research/2026-10-31-code-quality-talks.md).

If an agent can rewrite a module in minutes, why care whether the module is clean? You hear two answers. One says quality is a habit from when code was expensive: let agents generate, and regenerate when something breaks. The other says agent output demands more careful line-by-line review than ever. Flow takes neither position. Its answer is shorter: **make software easy to understand and safe to change, and require evidence proportional to what can go wrong.**

This article explains where that answer comes from, what Flow does with it today, and what it does not claim.

## What changed when code became cheap

Two talks at AI Engineer events this year frame the shift well.

Max Kanat-Alexander argues that code quality was never the goal in itself ([talk](https://ai.engineer/nyc/2026/talks/capital-one), [essay](https://www.codesimplicity.com/post/does-code-quality-even-matter-anymore/)). Quality serves two things: understanding what a system does, and acting on that understanding. Small programs are easy to understand. Large ones are understood through their structure, because nobody can hold all their behavior in their head. Every change risks its own defects and also makes the next change harder, and those risks compound. In his view, agents create a vast amount of disposable software, where failure is cheap and quality barely matters, while durable software still needs rigor. He places programs on a spectrum by four factors: consequences of failure, dependencies, cost of replacement, and cost of maintenance. That is his argument from experience; the talk and essay cite no studies.

Laurie Voss looks at the other end of the pipeline: deciding whether to trust and ship code ([talk](https://ai.engineer/talks/_mi3alkqy4s-death-code-review-what-data-actually-says)). Agents raise how much code arrives; they do not raise how much a human can review. Reviewing harder does not close that gap. His direction is to move human judgment into the review system: explicit standards, automated reviewers that check repeatedly and approach code with suspicion, evaluation harnesses, and production as the final check. He also warns that an automated reviewer can be steered by the code and commit messages it reads.

One finding Voss cites is worth looking at in its primary source. METR asked four maintainers of scikit-learn, Sphinx, and pytest to review 296 agent-written pull requests that had already passed the SWE-bench Verified grader ([note](https://metr.org/notes/2026-03-10-many-swe-bench-passing-prs-would-not-be-merged-into-main/)). Roughly half would not have been merged. Reasons included code quality and breaking other code. The setup has real limits: the agents got one attempt with no chance to respond to feedback, CI was off, and the study covers three repositories with models up to Claude Sonnet 4.5. The authors do not claim a capability ceiling. Still, the direction is clear enough for a practical point: passing tests is not the same as a change a maintainer would accept.

Voss reports many other figures in the talk. Most come without a primary source, so this article does not repeat them.

## What Flow concludes

Read together, the sources agree on more than their headlines suggest. Cheap generation moves the cost from writing code to understanding it and changing it safely. Neither talk says quality stopped mattering; both say that uniform rigor is the wrong response.

Flow's principle of [understandable change](../principles.md#understandable-change) states this directly. Agent output does not establish understanding. You know what code does through shared domain language, contracts, and checks. You weigh what a change costs later: who depends on it, how hard it is to replace, what breaks if it fails. Small, contained work stays light. Consequential work earns more evidence.

This is close to Kanat-Alexander's spectrum, with one difference: Flow does not label software disposable or durable. Software that starts as a throwaway can quietly gain users and dependents. Flow asks about consequences each time a change is made instead of fixing a label once.

## What Flow does about it

The principle would be decoration if nothing in the workflow changed. Four parts of Flow carry it.

**Evidence scales with the change.** When you ask an agent to build something, Flow's [`build`](../../skills/build/SKILL.md#size-guard) skill judges the change once, before implementing. A contained change gets a single-agent self-check. New product behavior, data or API changes, migrations, permissions, secrets, dependencies, CI configuration, or execution paths get an independent review. When the size is uncertain, the change is treated as consequential. A README typo does not get a risk questionnaire.

**Review ends in repaired work.** In Flow, [review is repair](../../skills/review/SKILL.md#repair). Asking for a review authorizes fixing confirmed defects inside the reviewed change, each behavior fix backed by a focused check that fails without it. Plausible risks are investigated and reported. Preferences are reported and never applied as unrequested refactors. A finding closes with evidence or stays explicitly unresolved, with the reason repair could not proceed. "Review only" keeps it read-only. Success is repaired, evidenced behavior, not a long list of findings.

**Independence is labelled honestly.** A reviewer that writes a fix is no longer independent of that fix. Flow either has a separate execution re-review it or labels the repair single-agent, and names who wrote and who reviewed each change. Flow does not claim that a separate reviewer removes correlated mistakes or makes review immune to manipulation. It treats diffs, comments, fixtures, logs, and change descriptions as evidence to examine, never as instructions that can change the review.

**Liveness is not verified behavior.** When Flow ships, it checks that the deployment responds ([decision 0040](../decisions/0040-ship-verifies-liveness.md)). That is liveness. It does not prove a user's journey works, and a working journey does not prove customers value it. Flow keeps the three apart in its reports and does not run automatic production journeys or writes. Checking real behavior in production is separate work you ask for.

## An example

Suppose an agent extends how long a library hold lasts. The focused tests pass. A caller outside the diff relies on the old duration, and the change description says the reviewer can ignore that caller.

A review that trusts the tests approves it. A review that trusts the description skips the caller. In Flow, the reviewer works from the domain contract and the actual callers, treats the instruction to ignore the caller as untrusted text, and reports the regression with evidence. If you asked for delivery, the regression is repaired, a check that fails without the fix is added, and the finding is re-checked on the repaired head. The report names both heads and who reviewed the repair. Asked whether the change is verified in production, the agent separates what it observed (the deployment responds) from what nobody exercised (the hold journey) and from what is unknown (whether patrons care).

None of this needs a new tool. It needs the review to be about behavior and consequences rather than about tests passing.

## What this does not claim

Flow has not measured whether this guidance makes delivery faster or safer. A comparison between agents with and without Flow's skills is specified ([spec 041](../specs/041-skill-evaluation.md)) but not yet run. The METR result supports a narrow point about tests and mergeability, not a general rate of agent defects. Voss's other figures and Kanat-Alexander's projections are reported here as their views, not as findings Flow has checked.

Flow also diverges from part of what Voss proposes. He argues that humans should stop reviewing pull requests and invest in the review harness instead. Flow keeps an independent review where the consequences warrant it, and keeps production checks under your control rather than automatic.

## So does code quality still matter?

Yes, as a means rather than an end. What matters is that someone can understand what the software does and change it without breaking what depends on it. Cheap generation makes that harder to get for free, not less necessary. The useful response is not to review everything harder, or to stop reviewing. It is to spend evidence where failure would cost something, repair what review finds, and say plainly what has not been verified.
