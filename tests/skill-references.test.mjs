import assert from 'node:assert/strict'
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { validateSkills } from '../scripts/validate.mjs'

const skillsRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills')
test('all shipped references and metadata validate', () => assert.deepEqual(validateSkills(skillsRoot), []))

test('validator catches missing supporting-file links and escaped dependency closure', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-reference-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  cpSync(join(skillsRoot, 'write-for-agents'), join(dir, 'write-for-agents'), { recursive: true })
  const path = join(dir, 'write-for-agents/SKILL-MECHANICS.md')
  writeFileSync(path, readFileSync(path, 'utf8') + '\n[Missing](missing.md)\n[Outside](../../outside.md)\n')
  const errors = validateSkills(dir)
  assert.ok(errors.some((error) => error.includes('SKILL-MECHANICS.md') && error.includes('missing.md')))
  assert.ok(errors.some((error) => error.includes('outside.md')))
})

test('validator rejects conflicting adapter activation and duplicate metadata', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-metadata-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  cpSync(join(skillsRoot, 'write-for-agents'), join(dir, 'write-for-agents'), { recursive: true })
  const adapter = join(dir, 'write-for-agents/agents/openai.yaml')
  writeFileSync(adapter, readFileSync(adapter, 'utf8').replace('allow_implicit_invocation: false', 'allow_implicit_invocation: true'))
  const path = join(dir, 'write-for-agents/SKILL.md')
  writeFileSync(path, readFileSync(path, 'utf8').replace('name: write-for-agents', 'name: write-for-agents\nname: wrong'))
  const errors = validateSkills(dir)
  assert.ok(errors.some((error) => error.includes('adapter')))
  assert.ok(errors.some((error) => error.includes('duplicate')))
})
