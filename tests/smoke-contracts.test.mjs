import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { validateSkills } from '../scripts/validate.mjs'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const skillsRoot = join(root, 'skills')
const bootstrapSnippet = readFileSync(join(root, 'bootstrap/AGENTS.snippet.md'), 'utf8')

const contracts = [
  { skill: 'explore', file: 'SKILL.md', includes: ['do not authorize implementation', 'requirements'] },
  { skill: 'requirements', file: 'SKILL.md', includes: ['to-spec', 'does not authorize coding'] },
  { skill: 'implement', file: 'SKILL.md', includes: ['untracked', 'authorized'] },
  { skill: 'review', file: 'SKILL.md', includes: ['untracked', 'single-agent'] },
  { skill: 'prototype', file: 'SKILL.md', includes: ['browser UI is optional', 'authorization'] },
  { skill: 'verify', file: 'SKILL.md', includes: ['Do not claim completion', 'limitations'] },
  { skill: 'grill', file: 'SKILL.md', includes: ['do not require an exhaustive interview'] },
  { skill: 'research', file: 'SKILL.md', includes: ['Neither a background agent', 'limitations'] },
  { skill: 'write-for-agents', file: 'SKILL-MECHANICS.md', includes: ['explicit workflow activation', 'fallback'] },
  { skill: 'doctor', file: 'SKILL.md', includes: ['Bootstrap-only', 'Read-only'] },
]

const failureContracts = [
  { skill: 'ship', file: 'SKILL.md', includes: ['Failure handling', 'blocked', 'not applicable', 'Never report Ship as complete'] },
  { skill: 'extract', file: 'SKILL.md', includes: ['cannot be safely determined', 'Never silently discard', 'Do not push unless'] },
  { skill: 'doctor', file: 'SKILL.md', includes: ['Do not claim success', 'do not install'] },
  { skill: 'council', file: 'SKILL.md', includes: ['Never claim independent execution', 'Read-only by default', 'do not fabricate'] },
]

test('catalog passes validator including required adapters', () => assert.deepEqual(validateSkills(skillsRoot), []))

test('smoke behavior contracts hold in skill text', () => {
  for (const { skill, file, includes = [], excludes = [] } of contracts) {
    const text = readFileSync(join(skillsRoot, skill, file), 'utf8')
    for (const phrase of includes) assert.match(text, new RegExp(phrase, 'iu'), `${skill}/${file} missing ${phrase}`)
    for (const phrase of excludes) assert.doesNotMatch(text, new RegExp(phrase, 'iu'), `${skill}/${file} must not require ${phrase}`)
  }
})

test('failure-path contracts hold for delivery and advisory skills', () => {
  for (const { skill, file, includes } of failureContracts) {
    const text = readFileSync(join(skillsRoot, skill, file), 'utf8')
    for (const phrase of includes) assert.match(text, new RegExp(phrase, 'iu'), `${skill}/${file} missing ${phrase}`)
  }
})

test('bootstrap promises explicit activation only', () => {
  assert.match(bootstrapSnippet, /Activate specialized Flow workflows only when requested/iu)
  assert.match(bootstrapSnippet, /direct\/sequential fallbacks/iu)
})

test('every skill directory ships an explicit-activation adapter', () => {
  const names = readdirSync(skillsRoot, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
  assert.equal(names.length, 25)
  for (const name of names) {
    const adapter = readFileSync(join(skillsRoot, name, 'agents/openai.yaml'), 'utf8')
    assert.match(adapter, /allow_implicit_invocation:\s*false/u, name)
  }
})
