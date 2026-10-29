import assert from 'node:assert/strict'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { EXPECTED_SKILL_NAMES } from '../../scripts/validate.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

const stripAnsi = (text) => text.replace(/\u001B\[[0-9;]*m/gu, '')

test('skills CLI lists all bundled skills from this repository', () => {
  const run = spawnSync('npx', ['--yes', 'skills@1.7.4', 'add', root, '-l', '-y'], {
    encoding: 'utf8',
    timeout: 120000,
    env: { ...process.env, CI: 'true' },
  })
  assert.equal(run.status, 0, stripAnsi(run.stderr || run.stdout))
  const out = stripAnsi(`${run.stdout}\n${run.stderr}`)
  assert.match(out, new RegExp(`Found ${EXPECTED_SKILL_NAMES.length} skills`, 'u'))
  for (const name of EXPECTED_SKILL_NAMES) assert.match(out, new RegExp(name, 'u'), `missing ${name} in skills CLI list`)
})
