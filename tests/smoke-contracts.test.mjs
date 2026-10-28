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
    includes: ['carries over to that write', 'Write only the first vertical slice', 'ship with spec 001', 'auto mode', 'publish its tasks as GitHub issues', 'docs/specs/NNN-short-name.md', "predict the user's next three answers", 'Never write drafts before confirmation', 'Feature detail flows to', 'pre-mortem', 'accepted unchanged', 'authorizes no write', 
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
      'handed over by `start` uses Full',
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
      'only after slice 1 ships',
    ],
  },
  { skill: 'grill', file: 'SKILL.md', includes: ['do not require an exhaustive interview', 'does not itself authorize implementation', 'already confirmed', 'riskiest claims', 'pre-mortem', 'six months from now', 'kill criterion', '\\*\\*clearer\\*\\*', '\\*\\*killed\\*\\*', 'all are valid'] },
  { skill: 'to-spec', file: 'SKILL.md', includes: ['reaching spec-ready with a brief counts as a request', 'docs/specs/NNN-short-name.md', 'Do not run a separate interview', 'status `candidate`', 'contract-first', 'MCP tool definitions when the product names agent users', 'errors and permissions an agent can act on', 'MCP App only when a journey needs'] },
  { skill: 'implement', file: 'SKILL.md', includes: ['untracked', 'not a prerequisite', 'PRODUCT.md', 'DESIGN.md', 'GLOSSARY.md', 'ARCHITECTURE.md', 'do not open new spec or decision', 'product identity', 'flow start', 'decision 0010', 'Ordinary small fixes', 'caller expectations', 'suggest an `explore` tier', 'never start exploration unasked'] },
  { skill: 'review', file: 'SKILL.md', includes: ['untracked', 'single-agent', 'PRODUCT.md', 'DESIGN.md', 'GLOSSARY.md', 'ARCHITECTURE.md', 'product identity', 'flow start', 'decision 0010', 'Pull request', 'pr-review-contract', 'safety-critical assumption', 'confirmed findings', 'workers are unavailable', '\\*\\*review axes\\*\\*', 'Correctness:', 'Readability and simplicity:', 'Architecture:', 'Security:', 'Performance:', 'code-review-and-quality', 'name its axis'] },
  { skill: 'write-agents', file: 'SKILL.md', includes: ['behavioral failure', 'architecture, types', 'Reject redundant or ineffective', 'Never claim independence'] },
  { skill: 'write-agents', file: 'SKILL-MECHANICS.md', includes: ['explicit workflow activation', 'fallback', 'architecture that eliminates'] },
  { skill: 'interview', file: 'SKILL.md', includes: ['one question per message', 'up to three independent multiple-choice questions per form', 'numbered options in text', 'without a marked guess', 'accepted unchanged', 'out of scope', 'explicit yes', 'does not authorize implementation'] },
  { skill: 'retro', file: 'SKILL.md', includes: ['do not modify', 'explicit user authorization', 'do not invent mistakes', 'Types or deterministic checks', 'single occurrence'] },
  { skill: 'flow', file: 'SKILL.md', includes: ['PRODUCT.md', 'DESIGN.md', 'GLOSSARY.md', 'ARCHITECTURE.md', 'workflow router', 'Do not edit adopter', 'Do not require installation', 'implement` and `review`', 'Do not create `docs/specs/`', "Do not replace a project's product identity", 'flow start', 'decision 0010', 'not an always-on hook', 'set up Flow here', '<!-- BEGIN FLOW -->', '<!-- END FLOW -->', '`Delivery:`', 'phrase-to-skill table', 'Never touch text outside the markers', 'when that is the only instruction file', 'outside the Flow block', 'decision 0020', 'lib/flow-block\\.mjs', 'one definition of the block', 'only when the user asks or `start` finishes a confirmed bootstrap', 'Leave `Delivery:` unset unless the user names a mode'] },
  { skill: 'tldr', file: 'SKILL.md', includes: ["Show, don't tell", 'GenUI', 'Check alignment', 'write-humans', 'does not authorize'] },
  { skill: 'to-tasks', file: 'SKILL.md', includes: ['vertical slice', 'Tasks are not pull requests', 'GitHub issues', 'exactly one place', 'Never record the same tasks in both places', "spec's Tasks section", 'the ready set, then wait for "ship it"', 'Do not start implementation', 'the mode `ship` would infer', 'write one with `to-spec` first'] },
  { skill: 'handoff', file: 'SKILL.md', includes: ['temporary directory', 'suggested-skills', 'does not authorize'] },
  { skill: 'ship', file: 'SKILL.md', includes: ['evidence', 'does not authorize destructive', 'Wait for an explicit yes', 'preview, not production', 'deploy skill', 'one branch and pull request', 'independently shippable', 'auto mode', 'Closes #N', 'pull-request mode each spec task has an issue', 'Ad-hoc changes need none', 'Without a task set', '\\*\\*ready set\\*\\*', 'cycle or a blocker that does not exist', 'One explicit yes covers the run', 'drifts from its stated scope', 'isolated worktree', 'at most 3 concurrent workers and 2 fix rounds', 'never let two workers edit the same files', 'separate worker reviews', 'stops its dependents', 'sequentially in the same order', 'single-agent', '`Delivery:` line', 'requires pull requests always uses pull-request mode', 'record it on that line', 'Ship it local', 'ship it with a PR', 'merge --no-ff', 'pull-request-style message', 'tick the task\'s checkboxes', 'Status:\\*\\* to `done`', 'fast-forward local `main`', 'final `review` and the full local check suite', 'confirm the inferred delivery mode', 'never fall through to local mode', 'overrides only the finish', 'merge into and push of `main`', 'Merge only when checks pass and the user authorized merging'] },
  {
    skill: 'start',
    file: 'SKILL.md',
    includes: ['Anything else is not a yes', 'GitHub repository to create', 
      'Do not automatically invoke `flow`',
      'AGENTS.md',
      'canCreateInitialCommit',
      'chore: initialize',
      'Never `reset`',
      'wait for an explicit yes',
      '\\*\\*Bootstrap lane\\.\\*\\*',
      '\\*\\*Explore lane\\.\\*\\*',
      'Full depth',
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
  for (const { skill, file, includes = [] } of contracts) {
    const text = readFileSync(join(skillsRoot, skill, file), 'utf8')
    for (const phrase of includes) assert.match(text, new RegExp(phrase, 'iu'), `${skill}/${file} missing ${phrase}`)
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
