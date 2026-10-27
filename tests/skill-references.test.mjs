import assert from 'node:assert/strict'
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { DISCOVERABLE_SKILL_NAMES, validateSkills } from '../scripts/validate.mjs'

const skillsRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills')
test('all shipped references and metadata validate', () => assert.deepEqual(validateSkills(skillsRoot), []))

test('flow is the only discoverable skill', () => {
  assert.deepEqual([...DISCOVERABLE_SKILL_NAMES], ['flow'])
  const flowSkill = readFileSync(join(skillsRoot, 'flow/SKILL.md'), 'utf8')
  assert.match(flowSkill, /disable-model-invocation: false/u)
})

test('validator catches missing supporting-file links and escaped dependency closure', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-reference-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  cpSync(join(skillsRoot, 'write-agents'), join(dir, 'write-agents'), { recursive: true })
  const path = join(dir, 'write-agents/SKILL-MECHANICS.md')
  writeFileSync(path, readFileSync(path, 'utf8') + '\n[Missing](missing.md)\n[Outside](../../outside.md)\n')
  const errors = validateSkills(dir)
  assert.ok(errors.some((error) => error.includes('SKILL-MECHANICS.md') && error.includes('missing.md')))
  assert.ok(errors.some((error) => error.includes('outside.md')))
})

test('validator rejects conflicting adapter activation and duplicate metadata', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-metadata-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  cpSync(join(skillsRoot, 'write-agents'), join(dir, 'write-agents'), { recursive: true })
  const adapter = join(dir, 'write-agents/agents/openai.yaml')
  writeFileSync(adapter, readFileSync(adapter, 'utf8').replace('allow_implicit_invocation: false', 'allow_implicit_invocation: true'))
  const path = join(dir, 'write-agents/SKILL.md')
  writeFileSync(path, readFileSync(path, 'utf8').replace('name: write-agents', 'name: write-agents\nname: wrong'))
  const errors = validateSkills(dir)
  assert.ok(errors.some((error) => error.includes('adapter')))
  assert.ok(errors.some((error) => error.includes('duplicate')))
})
