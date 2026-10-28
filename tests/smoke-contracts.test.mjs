import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { EXPECTED_SKILL_NAMES, validateSkills } from '../scripts/validate.mjs'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const skillsRoot = join(root, 'skills')

const contracts = [
  {
    skill: 'explore',
    file: 'SKILL.md',
    includes: ['carries over to that write', 'write only spec 001 in full', 'ship with spec 001', 'autonomous permission mode as `ship` describes', 'name the next steps and wait for the user', 'docs/specs/NNN-short-name.md', 'declined brief is not spec-ready for writing specs', "predict the user's next three answers", 'Never write the brief before confirmation', 'Write each record as \\*\\*Proposed\\*\\* and report its link', 'Feature detail flows to', 'pre-mortem', 'accepted unchanged', 'authorizes no write', 
      'do not authorize implementation',
      'to-spec',
      '\\*\\*Skip:\\*\\*',
      '\\*\\*Lite\\*\\*',
      '\\*\\*Full\\*\\*',
      'one-line reason',
      'Prefer the lighter tier',
      'kill criterion',
      'one main metric',
      '1–3 core journeys',
      'three alternatives including the status quo',
      'explicit yes before any challenge',
      'riskiest claims',
      '\\*\\*brief\\*\\*',
      '\\*\\*clearer\\*\\*',
      '\\*\\*killed\\*\\*',
      'write nothing',
      'exact text before writing',
      'durable product facts only',
      'hypotheses with a confidence',
      'same turn',
      'docs/research/YYYY-MM-DD-topic\\.md',
      'Never save transcripts',
      'spec-ready when intent is confirmed',
      'A run handed over by `start` uses the depth confirmed there',
      'Lite when missing or `unset`',
      'Decision records at Full depth',
      'its tasks as the slices inside it',
      'agent lens',
      'no agent users',
      'until the bootstrap lane reports its initial commit',
      'replaces the product sections of the baseline `PRODUCT\\.md`',
      'keep everything confirmed in conversation',
      'test the riskiest assumption',
      'instrumentation for the main metric',
      'contract-first',
      'MCP tool when the brief names agent users',
      '`candidate` stubs',
      'only after spec 001 ships',
    ],
  },
  { skill: 'grill', file: 'SKILL.md', includes: ['do not require an exhaustive interview', 'does not itself authorize implementation', 'already confirmed', 'riskiest claims', 'pre-mortem', 'six months from now', 'kill criterion', '\\*\\*clearer\\*\\*', '\\*\\*killed\\*\\*', 'all are valid'] },
  { skill: 'to-spec', file: 'SKILL.md', includes: ['reaching spec-ready, or a request to write a spec is not acceptance', 'saved with status `draft`', 'Do not show the text inline or ask before writing', 'report links to the files written', 'with status \\*\\*Proposed\\*\\*', '`candidate → draft → accepted → implemented`', '"accept the spec"', 'set its status to `accepted`', 'from \\*\\*Proposed\\*\\* to \\*\\*Accepted\\*\\*', 'docs/specs/NNN-short-name.md', 'Do not run a separate interview', 'status `candidate`', 'contract-first', 'MCP tool definitions when the product names agent users', 'errors and permissions an agent can act on', 'MCP App only when a journey needs', 'A spec is one bet', 'Its tasks are the slices inside it', 'reaches beyond this spec or is costly to reverse', 'Never put feature scope or tasks in a decision record', 'Changing an accepted spec\'s scope or a decision it links returns the spec to `draft`', 'in the project\'s decision format'], excludes: ['save only after an explicit yes', 'reaching spec-ready is not that yes'], description: 'accept the spec' },
  { skill: 'build', file: 'SKILL.md', includes: ['untracked', 'not a prerequisite', 'PRODUCT.md', 'DESIGN.md', 'GLOSSARY.md', 'ARCHITECTURE.md', 'do not open new spec or decision', 'product identity', 'flow start', 'decision 0010', 'Ordinary small fixes', 'caller expectations', 'suggest an `explore` tier', 'never start exploration unasked', 'names test seams', 'failing test at that seam before the change', 'ends in a pull request with green checks', 'authorizes these steps with no confirmation', 'committing to, pushing, or merging the default branch', 'force-pushing', 'stage only intended files', 'Exclude credentials', 'Do not amend or rewrite unrelated commits', 'local mode runs the local check suite without pushing', 'preserve unrelated working-tree changes', 'ready for review, not as a draft', 'Conventional Commits title', 'Closes #N', 'bounded monitoring', 'reported as pending, never as passing', 'at most 2 fix rounds', 'Never skip, disable, or weaken a check', 'links CI attached', 'full local check suite', 'No push and no pull request', '`Delivery:` line', 'never fall through to local mode', 'Report the pick and record it on that line', 'in its own commit on the branch being built', 'Without a Flow block, use the pick for this run only', 'requires pull requests always uses pull-request mode', 'build it local', 'build it with a PR', 'Without a task set', '\\*\\*frontier\\*\\*', 'cycle or a blocker that does not exist', 'then start with no confirmation', 'auto mode', 'drifts from its stated scope stops for the user\'s yes', 'isolated worktree', 'the host\'s concurrency limit and 2 fix rounds', 'never let two workers edit the same files', 'context pointers, not copies', 'runs only the tests for what it changed', 'written only by the orchestrator, on the spec branch', 'workers leave them untouched', 'run the full local check suite, tick its checklist entry', 'After the first integration, open a draft pull request', 'for the spec issue and each sub-issue', 'Status:\\*\\* to `done`', 'stops its dependents', 'wait for the user\'s decision', '\\*\\*Checkpoint\\*\\* once per integration batch', 'intermediate pushes are never waited on', 'when a browser tool is available', 'Checkpoints never wait for CI or the user', 'unless the user asked to wait at checkpoints', 'mark the draft ready for review and stop there', 'merging is `ship`\'s job', 'sequentially in dependency order', 'When the run begins: `--record run-start'], excludes: ['only when that delivery action is already authorized', 'plan confirmation', 'plan yes', 'deploy target', '\\*\\*waves\\*\\*', 'separate worker reviews', 'flow/notes/'] },
  { skill: 'review', file: 'SKILL.md', includes: ['untracked', 'single-agent', 'PRODUCT.md', 'DESIGN.md', 'GLOSSARY.md', 'ARCHITECTURE.md', 'product identity', 'flow start', 'decision 0010', 'Pull request', 'pr-review-contract', 'safety-critical assumption', 'confirmed findings', 'workers are unavailable', '\\*\\*review axes\\*\\*', 'Correctness:', 'Readability and simplicity:', 'Architecture:', 'Security:', 'Performance:', 'code-review-and-quality', 'name its axis', 'a spec gets one independent review, which `ship` runs on its final pull request', 'When `ship` runs the review, its request authorizes an independent worker and posting the report on the pull request', 'never an approval'] },
  { skill: 'write-agents', file: 'SKILL.md', includes: ['behavioral failure', 'architecture, types', 'Reject redundant or ineffective', 'Never claim independence'] },
  { skill: 'write-agents', file: 'SKILL-MECHANICS.md', includes: ['explicit workflow activation', 'fallback', 'architecture that eliminates'] },
  { skill: 'interview', file: 'SKILL.md', includes: ['one question per message', 'up to three independent multiple-choice questions per form', 'numbered options in text', 'without a marked guess', 'accepted unchanged', 'out of scope', 'explicit yes', 'does not authorize implementation'] },
  { skill: 'retro', file: 'SKILL.md', includes: ['do not modify', 'explicit user authorization', 'do not invent mistakes', 'Types or deterministic checks', 'single occurrence'] },
  { skill: 'flow', file: 'SKILL.md', includes: ['PRODUCT.md', 'DESIGN.md', 'GLOSSARY.md', 'ARCHITECTURE.md', 'runs no other skill', 'decision 0024', 'Do not edit adopter', 'Do not require installation', 'build` and `review`', 'Do not create `docs/specs/`', "Do not replace a project's product identity", 'flow start', 'decision 0010', 'not an always-on hook', 'set up Flow here', '<!-- BEGIN FLOW -->', '<!-- END FLOW -->', '`Delivery:`', 'phrase-to-skill table', 'Never touch text outside the markers', 'when that is the only instruction file', 'outside the Flow block', 'decision 0020', 'lib/flow-block\\.mjs', 'one definition of the block', 'only when the user asks or `start` finishes a confirmed bootstrap', 'Leave `Delivery:` unset unless the user names a mode', '--process <lite|full>', '`Process:` line', 'ask once before writing', 'name `explore` at the recorded depth as the next step and wait', 'keeps the recorded `Delivery:` and `Process:`', 'drops any other line, such as a retired `Deploy:` line'], excludes: ['--deploy', '`Deploy:` unset', 'deploy target'] },
  { skill: 'tldr', file: 'SKILL.md', includes: ["Show, don't tell", 'GenUI', 'Check alignment', 'write-humans', 'does not authorize'] },
  { skill: 'to-tasks', file: 'SKILL.md', includes: ['so `ship` can resolve it', 'and where they will be recorded', 'vertical slice', 'Tasks are not pull requests', 'sub-issue of the spec issue', '--blocked-by', '`Part of #N`', "spec's Tasks section as a checklist", 'the ready set, then wait for "build it"', 'Do not start implementation', 'the mode `build` would infer', 'write one with `to-spec` first', 'the report says the issues are public', 'A link to the spec this task belongs to'], excludes: ['wait for "ship it"', 'Never record the same tasks in both places'] },
  { skill: 'handoff', file: 'SKILL.md', includes: ['temporary directory', 'suggested-skills', 'does not authorize'] },
  { skill: 'ship', file: 'SKILL.md', includes: ['`implemented` on this unmerged branch from an earlier ship run', 'no decision record it links may still be', 'Read the spec from the branch head', 'the pull request is still a draft', 'Keep a `Closes #N` line for the spec issue once every task integrated, and for each sub-issue whose task integrated', 'name each spec or linked decision that is not accepted', 'authorizes these steps with no confirmation', 'does not authorize destructive Git operations, force-pushing, rewriting remote branches', 'production promotion or rollback unless explicitly asked', 'auto mode', 'Delivery mode', 'ship it local', 'ship it with a PR', 'changes only the finish', 'Its `Status:` must be `accepted`', 'suggest "accept the spec", and stop before building', 'run `build` first', '`build` runs it', 'one branch and pull request', 'independently shippable', 'adversarial five-axis `review` of the pull request with a separate worker', 'Post the review on the pull request', 'never an approval', 'label it single-agent on the pull request', 'new product behavior, a data-shape or public API change, or a migration is a blocking finding', 'suggests `to-spec`', 'at most 2 fix rounds', 'pending check is pending, never passing', 'Never hide, skip, disable, or weaken a failing check', 'checks are green, no findings are blocking, and branch protection is satisfied', "Never approve the agent's own pull request", 'never bypass protection \\(for example `gh pr merge --admin`\\)', 'When protection requires a human approval, stop', "set the spec's `Status:` line to `implemented` on the branch", 'Make the branch final before the last review', 'Resolve its spec from \\(a\\) the branch name', 'files under `docs/specs/`', 'the issues the work closes \\(`Closes #N`\\) and the spec each links', 'or classification is uncertain', 'If the spec cannot be resolved, say so and stop', 'work with no spec link at all', 'issues belonging to no spec', 'uncommitted or unpushed changes, or \\(local mode\\) the work sits on the default branch', 'After any push, wait for checks on the new head', 'Merge only the reviewed and checked head SHA', '--match-head-commit', "including someone else's push, review and check the new head", 'after Prepare, Review, and Fix rounds, run the full local check suite', 'Fast-forward the local default branch from the remote, merge', 'report partial delivery with the unpushed merge', 'method the repository allows', 'Closes #N', 'Delete the head branch on the remote and locally', 'fast-forward the local default branch', 'run the full local check suite on the branch', 'merge --no-ff', 'pull-request-style message', 'Never force-push or rewrite remote branches', 'Delete a branch only after its work has merged', 'No destructive reset', '### Delivery', '### Checks', '### Review', '### Merge', '### Next'], excludes: ['Wait for an explicit yes', 'Main gate', 'Plan confirmation', 'plan yes', 'Deploy:', '## Deploy', 'deploy skill', 'confirming before pushing', 'Silence or an ambiguous reply', '\\*\\*Checkpoint\\*\\* after each wave', 'at most 3 concurrent workers', 'flow/notes/', '--record run-start', '\\.\\./build/SKILL\\.md', '"send it"', '"commit and push"'], description: '^Land accepted work.*"ship it"' },
  {
    skill: 'start',
    file: 'SKILL.md',
    includes: ['Do not push or deploy unless explicitly authorized', 'Anything else is not a yes', 'GitHub repository to create', 
      'Do not automatically invoke `flow`',
      'AGENTS.md',
      'canCreateInitialCommit',
      'chore: initialize',
      'Never `reset`',
      'wait for an explicit yes',
      '\\*\\*Bootstrap lane\\.\\*\\*',
      '\\*\\*Explore lane\\.\\*\\*',
      'at the confirmed process depth',
      'the process depth, the Flow block it will write, and the hand-off to `explore` at that depth',
      'with `Process:` set to the confirmed depth',
      'plus a template bootstrap',
      'adding only the Flow block',
      'writes nothing until the bootstrap lane reports its initial commit',
      'no independent workers, run the bootstrap first, then `explore`',
      'failed bootstrap does not discard the exploration',
      'Flow block',
      'only to write the Flow block',
      'pnpm eval',
      'operator_fail_closed',
      'inferTemplateFromRequest',
      'copyTemplateInto',
      'Bootstrap at that root, not in a nested folder',
      'do not substitute a destination the user did not confirm',
    ],
  },
]

test('catalog passes validator including required adapters', () => assert.deepEqual(validateSkills(skillsRoot), []))

test('glossary keeps Flow identity, product context, and human summary apart', () => {
  const glossary = readFileSync(join(root, 'GLOSSARY.md'), 'utf8')
  assert.match(glossary, /## Product context/u)
  assert.match(glossary, /## Human summary/u)
  assert.match(glossary, /## Leading word/u)
  assert.match(glossary, /no separate `human` skill/u)
  assert.match(glossary, /`flow start` is not a leading word/u)
})

test('smoke behavior contracts hold in skill text', () => {
  for (const { skill, file, includes = [], excludes = [], description } of contracts) {
    const text = readFileSync(join(skillsRoot, skill, file), 'utf8')
    if (description) assert.match(text.match(/^description: (.*)$/mu)?.[1] ?? '', new RegExp(description, 'iu'), `${skill} description missing ${description}`)
    for (const phrase of includes) assert.match(text, new RegExp(phrase, 'iu'), `${skill}/${file} missing ${phrase}`)
    for (const phrase of excludes) assert.doesNotMatch(text, new RegExp(phrase, 'iu'), `${skill}/${file} must not contain ${phrase}`)
  }
})

test('skills do not link to sibling SKILL.md paths (isolated install safe)', () => {
  for (const name of EXPECTED_SKILL_NAMES) {
    const text = readFileSync(join(skillsRoot, name, 'SKILL.md'), 'utf8')
    assert.doesNotMatch(text, /\]\(\.\.\/[^)]+\/SKILL\.md\)/u, `${name} must reference other skills by name, not relative SKILL.md links`)
  }
})

test('every shipped skill matches the expected catalog', () => {
  const names = readdirSync(skillsRoot, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()
  assert.deepEqual(names, EXPECTED_SKILL_NAMES)
  for (const name of names) {
    const adapter = readFileSync(join(skillsRoot, name, 'agents/openai.yaml'), 'utf8')
    assert.match(adapter, /allow_implicit_invocation:\s*true/u, name)
  }
  assert.equal(names.length, 22)
})
