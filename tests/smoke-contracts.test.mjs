import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { EXPECTED_SKILL_NAMES, validateSkills } from '../scripts/validate.mjs'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const skillsRoot = join(root, 'skills')

const contracts = [
  { skill: 'explore', file: 'SKILL.md', includes: ['do not authorize implementation', 'to-spec'] },
  { skill: 'grill', file: 'SKILL.md', includes: ['do not require an exhaustive interview', 'does not itself authorize implementation', 'already confirmed', 'riskiest claims', 'pre-mortem', 'six months from now', 'kill criterion', '**clearer**', '**killed**', 'all are valid'] },
  { skill: 'to-spec', file: 'SKILL.md', includes: ['docs/specs/NNN-short-name.md', 'Do not run a separate interview'] },
  { skill: 'implement', file: 'SKILL.md', includes: ['untracked', 'not a prerequisite', 'PRODUCT.md', 'DESIGN.md', 'GLOSSARY.md', 'ARCHITECTURE.md', 'do not open new spec or decision', 'product identity', 'flow start', 'decision 0010', 'Ordinary small fixes', 'caller expectations'] },
  { skill: 'review', file: 'SKILL.md', includes: ['untracked', 'single-agent', 'PRODUCT.md', 'DESIGN.md', 'GLOSSARY.md', 'ARCHITECTURE.md', 'product identity', 'flow start', 'decision 0010', 'Pull request', 'pr-review-contract', 'safety-critical assumption', 'confirmed findings', 'workers are unavailable'] },
  { skill: 'write-agents', file: 'SKILL.md', includes: ['behavioral failure', 'architecture, types', 'Reject redundant or ineffective', 'Never claim independence'] },
  { skill: 'write-agents', file: 'SKILL-MECHANICS.md', includes: ['explicit workflow activation', 'fallback', 'architecture that eliminates'] },
  { skill: 'interview', file: 'SKILL.md', includes: ['one question per message', 'out of scope', 'explicit yes', 'does not authorize implementation'] },
  { skill: 'retro', file: 'SKILL.md', includes: ['do not modify', 'explicit user authorization', 'do not invent mistakes', 'Types or deterministic checks', 'single occurrence'] },
  { skill: 'flow', file: 'SKILL.md', includes: ['PRODUCT.md', 'DESIGN.md', 'GLOSSARY.md', 'ARCHITECTURE.md', 'workflow router', 'Do not edit adopter', 'Do not require installation', 'implement` and `review`', 'Do not create `docs/specs/`', "Do not replace a project's product identity", 'flow start', 'decision 0010', 'not an always-on hook'] },
  { skill: 'tldr', file: 'SKILL.md', includes: ["Show, don't tell", 'GenUI', 'Check alignment', 'write-humans', 'does not authorize'] },
  { skill: 'handoff', file: 'SKILL.md', includes: ['temporary directory', 'suggested-skills', 'does not authorize'] },
  { skill: 'ship', file: 'SKILL.md', includes: ['evidence', 'does not authorize destructive', 'Wait for an explicit yes', 'preview, not production', 'deploy skill'] },
  {
    skill: 'start',
    file: 'SKILL.md',
    includes: [
      'Do not invoke `flow`',
      'AGENTS.md',
      'canCreateInitialCommit',
      'chore: initialize',
      'Never `reset`',
      'invoke `explore` when discovery is needed',
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
    const expectImplicit = name !== 'start'
    assert.match(adapter, expectImplicit ? /allow_implicit_invocation:\s*true/u : /allow_implicit_invocation:\s*false/u, name)
  }
  assert.equal(names.length, 21)
})
