import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { EXPECTED_SKILL_NAMES } from '../scripts/validate.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const stripAnsi = (text) => text.replace(/\u001B\[[0-9;]*m/gu, '')

test('README documents Agent Skills install without default agent flag', () => {
  const readme = readFileSync(join(root, 'README.md'), 'utf8')
  assert.match(readme, /npx skills add gaboesquivel\/flow-skills/u)
  assert.doesNotMatch(readme, /-a cursor/u)
  assert.doesNotMatch(readme, /flow-skills-init/u)
  assert.match(readme, /docs\/skills\.md/u)
  assert.match(readme, /Influences and engineering philosophy/u)
  assert.match(readme, /Project start/u)
  const catalog = readFileSync(join(root, 'docs/skills.md'), 'utf8')
  assert.match(catalog, /leading word/u)
  // Counts drift; require every shipped skill in both catalogs instead.
  for (const name of EXPECTED_SKILL_NAMES) {
    assert.match(readme, new RegExp(`\`${name}\``, 'u'), `README catalog missing ${name}`)
    assert.match(catalog, new RegExp(`\\[${name}\\]\\(\\.\\./skills/${name}/SKILL\\.md\\)`, 'u'), `skill catalog missing ${name}`)
  }
})

test('skills CLI lists all bundled skills from this repository', () => {
  const run = spawnSync('npx', ['--yes', 'skills@latest', 'add', root, '-l', '-y'], {
    encoding: 'utf8',
    timeout: 120000,
    env: { ...process.env, CI: 'true' },
  })
  assert.equal(run.status, 0, stripAnsi(run.stderr || run.stdout))
  const out = stripAnsi(`${run.stdout}\n${run.stderr}`)
  assert.match(out, new RegExp(`Found ${EXPECTED_SKILL_NAMES.length} skills`, 'u'))
  for (const name of EXPECTED_SKILL_NAMES) assert.match(out, new RegExp(name, 'u'), `missing ${name} in skills CLI list`)
})
