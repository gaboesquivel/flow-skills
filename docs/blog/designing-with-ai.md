# Designing with AI: Rules an Agent Can Follow and Check

**Draft, 2026-11-02.** Not published. Scope: [spec 056](../specs/056-lean-context-checkable-design.md). Sources and their limits: [research note](../research/2026-11-02-skills-and-agent-context.md).

Ask a coding agent to build a screen from your design and it often comes back fast, clean, and wrong. The spacing is close but not on your scale. There is a second accent color nobody chose. The empty state is missing. Nothing is broken, so the tests pass, and the screen still does not look like your product.

The designer rico describes exactly this in a recent article ([X](https://x.com/_heyrico/status/2116953958279479760)) and draws the right conclusion: the agent was not careless. The decisions that make the product feel right lived in someone's head, and the agent could not see them. A design system used to be a shared library for a team. Now it is also where you write down what good looks like, so an agent can follow it without guessing.

This article explains how Flow handles that today, what we learned when we measured our own repositories, and what we propose to change.

## What an agent needs from a design system

rico builds the system in layers, and the order is useful for anyone working with agents:

- **Primitives**: raw values for color, type, spacing, radius, shadow, and motion, in one file, with a note telling the agent to take values from there instead of inventing new ones.
- **Semantic tokens**: names that say what a value is for (`text-muted`, `status-error`) rather than what it looks like, so the agent can pick by purpose.
- **Components**: for each one, when to use it, the default variant, a good and a bad example from real code, and every state. Document only what exists; a described but unbuilt variant is one the agent will keep trying to use.
- **Blocks**: sections that came from real screens, not from a template.
- **Rules and skills**: a rule is one sentence followed by its reason. A skill is a narrow job, such as reviewing a screen for raw values and missing states.

Two of these ideas matter more than the rest. First, **a rule needs its reason**. "Use one primary button per screen" is a rule; "if everything is important, nothing is" lets the agent handle a case you never wrote down. Second, **write rules after the agent gets something wrong**. Record what it did, what you wanted, and why. That note is your next rule.

## What Flow does today

Flow keeps design in a root file, `DESIGN.md`, next to `PRODUCT.md` (what the product is for) and `GLOSSARY.md` (what its words mean). Three skills touch it.

**`design` chooses a direction.** When you say "design this", the [`design`](../../skills/design/SKILL.md) skill reads the product context and the tokens already in code, states a short brief, and renders two to four directions that differ in concept, not just color. Each is shown in context at realistic sizes: the same real screen for every direction, a mark at 16 and 32 pixels, phone and desktop widths, light and dark. The agent looks at each render before showing it. Then it recommends one, and **you choose**; the agent never selects. Only the approved direction goes into `DESIGN.md`, with its tokens set in the app's theme so the record and the code agree ([decision 0051](../decisions/0051-design-skill.md)).

**`build` follows it.** When a change fits the existing `DESIGN.md`, there is no design step at all. The agent builds within it.

**`review` checks it.** When a diff changes what users see, [`review`](../../skills/review/SKILL.md) checks consistency with `DESIGN.md`: tokens, canonical assets, usage rules, retired marks, contrast, focus, phone-width layout, and hierarchy. For new screens it also looks at the rendered preview at phone and desktop widths.

That covers choosing and following a direction. It does not yet make most rules checkable.

## Where it falls short

We audited six repositories that use Flow on 2026-11-02. The figures are estimates at four characters per token.

The clearest example is a personal portfolio site built with Flow. Its `DESIGN.md` is good. It keeps tokens in machine-readable front matter, names one accent color, and bans specific devices: gradient blobs, numbered 01/02/03 markers, eyebrow labels, a second accent. One rule is enforced by a script: a motion check that fails the build. The rest are prose. An agent can read "no second accent" and still add one; nothing fails.

The file is also large: about 9,000 tokens, read for any visual change, and a third of it describes individual pages. An agent fixing the contact page reads the homepage hero's rules too.

And it delegates. `DESIGN.md` gives roles to seven design skills, such as a polish critic and a motion source. None of them is in the repository's skill lock. They exist on one machine because they were installed by hand, alongside 34 other skills the lock does not list. A fresh clone would give the agent a different set of skills than the one the maintainer runs, and the design rules would point at nothing.

None of this is unusual. It is what happens when design guidance grows one good idea at a time and nobody measures it.

## Lessons from outside Flow

**Instructions are advisory; checks are not.** Spotify's engineering blog describes cutting the tokens Claude Code spent on bulk file reads by about 90% on average ([post](https://engineering.atspotify.com/2026/9/portal-by-spotify-cut-my-claude-code-token-usage-by-90)). Their first version was routing rules in `CLAUDE.md`. The author's verdict was that the rules were advisory, so Claude could ignore them. What worked was a hook that blocked large reads outright. The routing itself runs on a paid internal platform, which Flow will not adopt, but the lesson carries over to design: a rule the agent keeps breaking belongs in a check, not in a longer paragraph.

**A design skill can carry its own gate.** [Taste Skill](https://github.com/Leonxlnx/taste-skill), an open-source frontend skill, packages its rules with two scripts: one lints the source for banned devices, the other opens a real browser at three widths and fails on problems such as cut-off text or a missing focal point. The agent cannot call the work done until both pass. Its rules come from a study of 247 gallery sites, the author's own, and each banned device comes with what to use instead. You do not have to share its taste to borrow the shape: rules, a reason, and a gate.

Anthropic's guidance on skills points the same way from the context side. Load the short description always, the body when it is needed, and reference files only when read. Keep each body under about 500 lines ([best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)).

## What we propose

[Spec 056](../specs/056-lean-context-checkable-design.md) is a draft. None of this is in Flow yet.

First, a note on how. Flow's skills tell an agent what a good result looks like and leave the method to the agent. A skill that dictated a rule template or a folder layout would be one more thing to load and one more thing to follow by rote. So the lessons above go into Flow as outcomes and the reasons behind them, not as procedures.

**Every design rule can be followed and verified.** After `design` runs, an agent reading `DESIGN.md` should be able to tell why each rule exists and how to tell whether a screen meets it. Where a script can check a rule, the check exists or is named as work. Where only a person can judge, the rule says so. How the project writes that down is up to the project. A token the code must use, a lint that fails, and a screenshot at phone width are all good examples, and none is required.

**The core stays small; detail is there when needed.** An agent changing one page should not have to read the rules for every other page. Linked files are one way to do that. In Claude Code, path-scoped rules that load only when a matching file is touched are another.

**Measure before trimming.** A small, free script reports what each repository loads before the agent starts, what it loads on demand, which installed skills are missing from the lock, and which skills compete for the same request. `retro` would use it to back a proposal with numbers instead of taste.

The spec also states what would prove it wrong. If always-loaded and core design context in the two largest repositories does not drop by half without losing a rule the agent needs, we drop the budgets and keep the script only as a retrospective aid.

## What this does not claim

We have not measured whether checkable rules produce better screens. The evidence is that agents follow written rules better than unwritten ones and that a failing check is harder to ignore than a sentence. Both are plausible, and both are reported by practitioners, not tested by us. The token figures are estimates, not a bill. And taste is still yours: a system can tell an agent what you decided, not decide for you.

## How to start

You do not need Flow to try the core of this. Open your design document and pick the rule the agent broke most recently. Add its reason. Then ask whether a script could catch it. A grep for a banned class, a lint rule, a screenshot at phone width. If it can, write the check. If it cannot, say so in the rule. Then do the next one. Each rule you can check is one less thing to catch by eye.
