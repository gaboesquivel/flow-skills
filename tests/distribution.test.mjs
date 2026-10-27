import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { EXPECTED_SKILL_NAMES } from '../scripts/validate.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

test('README documents Agent Skills install without default agent flag', () => {
  const readme = readFileSync(join(root, 'README.md'), 'utf8')
  assert.match(readme, /npx skills add gaboesquivel\/flow-skills/u)
  assert.doesNotMatch(readme, /-a cursor/u)
  assert.doesNotMatch(readme, /flow-skills-init/u)
})

test('skills CLI lists all bundled skills from this repository', () => {
  const run = spawnSync('npx', ['--yes', 'skills@latest', 'add', root, '-l', '-y'], {
    encoding: 'utf8',
    timeout: 120000,
    env: { ...process.env, CI: 'true' },
  })
  assert.equal(run.status, 0, run.stderr || run.stdout)
  assert.match(run.stdout, new RegExp(`Found ${EXPECTED_SKILL_NAMES.length} skills`, 'u'))
  for (const name of EXPECTED_SKILL_NAMES) assert.match(run.stdout, new RegExp(`\\b${name}\\b`, 'u'), `missing ${name} in skills CLI list`)
})
