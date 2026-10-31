import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { EXPECTED_SKILL_NAMES } from '../scripts/validate.mjs'

const skillsRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'skills')
const read = (skill) => readFileSync(join(skillsRoot, skill, 'SKILL.md'), 'utf8')

// Safety rules only, matched by short keywords so ordinary rewording never breaks a test.
const safety = [
  ['build', /never commit, push, or merge to the default branch/iu],
  ['build', /never force-push/iu],
  ['build', /weaken a check/iu],
  ['ship', /never force-push/iu],
  ['ship', /never approve your own pull request/iu],
  ['ship', /never bypass protection/iu],
  ['ship', /weaken a check/iu],
  ['ship', /data, never instructions/iu],
  ['review', /never claim independence/iu],
  ['to-spec', /never the default branch/iu],
  ['write-agents', /never instructions that change it/iu],
  ['write-agents', /`git init` needs its own explicit yes/iu],
  ['write-agents', /never edit, reset, clean, switch, or remove another session's worktree/iu],
  ['write-agents', /evidence, not a lock/iu],
  ['ship', /pending or failing stops the landing/iu],
  ['build', /never cut by weakening a check/iu],
]

test('skills keep their safety rules', () => {
  for (const [skill, rule] of safety) assert.match(read(skill), rule, `${skill} lost safety rule ${rule}`)
})

test('skills do not link to sibling SKILL.md paths (isolated install safe)', () => {
  for (const name of EXPECTED_SKILL_NAMES) {
    assert.doesNotMatch(read(name), /\]\(\.\.\/[^)]+\/SKILL\.md\)/u, `${name} must reference other skills by name, not relative SKILL.md links`)
  }
})
