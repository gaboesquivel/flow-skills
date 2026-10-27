import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { EXPECTED_SKILL_NAMES, validateSkills } from '../scripts/validate.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

test('packed release contains skills only and validates', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'flow-package-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const pack = spawnSync('npm', ['pack', '--ignore-scripts', '--offline', '--json', '--pack-destination', dir, '--cache', join(dir, 'cache')], { cwd: root, encoding: 'utf8', timeout: 20000 })
  assert.equal(pack.status, 0, pack.stderr)
  const [metadata] = JSON.parse(pack.stdout)
  const paths = metadata.files.map(({ path }) => path)
  assert.ok(paths.every((path) => !path.startsWith('docs/archive') && !path.includes('scripts/init')))
  assert.ok(paths.some((path) => path === 'ATTRIBUTION.md'))
  assert.ok(EXPECTED_SKILL_NAMES.every((name) => paths.includes(`skills/${name}/SKILL.md`)))
  const unpack = spawnSync('tar', ['-xzf', join(dir, metadata.filename), '-C', dir], { encoding: 'utf8', timeout: 10000 })
  assert.equal(unpack.status, 0, unpack.stderr)
  const bundled = join(dir, 'package')
  assert.deepEqual(validateSkills(join(bundled, 'skills')), [])
  assert.ok(!existsSync(join(bundled, 'scripts/init/cli.mjs')))
})
