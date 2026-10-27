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
  { skill: 'grill', file: 'SKILL.md', includes: ['do not require an exhaustive interview', 'does not itself authorize implementation'] },
  { skill: 'to-spec', file: 'SKILL.md', includes: ['docs/specs/NNN-short-name.md', 'Do not run a separate interview'] },
  { skill: 'implement', file: 'SKILL.md', includes: ['untracked', 'not a prerequisite', 'PRODUCT.md', 'DESIGN.md', 'GLOSSARY.md', 'ARCHITECTURE.md', 'do not open new spec or decision'] },
  { skill: 'review', file: 'SKILL.md', includes: ['untracked', 'single-agent', 'PRODUCT.md', 'DESIGN.md', 'GLOSSARY.md', 'ARCHITECTURE.md'] },
  { skill: 'write-agents', file: 'SKILL-MECHANICS.md', includes: ['explicit workflow activation', 'fallback'] },
  { skill: 'interview', file: 'SKILL.md', includes: ['do not authorize', 'limitations'] },
  { skill: 'retro', file: 'SKILL.md', includes: ['do not modify', 'explicit user authorization'] },
  { skill: 'flow', file: 'SKILL.md', includes: ['PRODUCT.md', 'DESIGN.md', 'GLOSSARY.md', 'ARCHITECTURE.md', 'workflow router', 'Do not edit adopter', 'Do not require installation', 'implement` and `review`', 'Do not create `docs/specs/`'] },
]

test('catalog passes validator including required adapters', () => assert.deepEqual(validateSkills(skillsRoot), []))

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
    const expectImplicit = name === 'flow'
    assert.match(adapter, expectImplicit ? /allow_implicit_invocation:\s*true/u : /allow_implicit_invocation:\s*false/u, name)
  }
})
