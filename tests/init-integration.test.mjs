import assert from 'node:assert/strict'
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { hashTree, install } from '../scripts/init/install.mjs'

const distributionRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'flow-install-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}
function manifest(dir) { return JSON.parse(readFileSync(join(dir, '.flow-skills/manifest.json'), 'utf8')) }
function copyDistribution(dir) {
  for (const path of ['skills', 'bootstrap', 'package.json']) cpSync(join(distributionRoot, path), join(dir, path), { recursive: true })
}

test('CLI installs offline, verifies all content, preserves custom instructions and repeats identically', (t) => {
  const dir = fixture(t)
  writeFileSync(join(dir, 'AGENTS.md'), '# Project\n\nKeep me.  \n')
  const run = () => spawnSync(process.execPath, [join(distributionRoot, 'scripts/init/cli.mjs'), '--local'], {
    cwd: dir, encoding: 'utf8', timeout: 10000, env: { ...process.env, PATH: '', npm_config_offline: 'true' },
  })
  const first = run()
  assert.equal(first.status, 0, first.stderr)
  const installed = manifest(dir)
  assert.equal(installed.flowSkillsVersion, JSON.parse(readFileSync(join(distributionRoot, 'package.json'))).version)
  for (const [name, expected] of Object.entries(installed.skills)) {
    assert.equal(hashTree(join(dir, installed.skillsDirectory, name)), expected)
    assert.equal(expected, hashTree(join(distributionRoot, 'skills', name)))
  }
  assert.ok(readFileSync(join(dir, 'AGENTS.md'), 'utf8').startsWith('# Project\n\nKeep me.  \n'))
  const before = hashTree(dir)
  assert.equal(run().status, 0)
  assert.equal(hashTree(dir), before)
})

test('customized skill blocks the entire upgrade and preserves project bytes', (t) => {
  const dir = fixture(t)
  install({ projectRoot: dir, distributionRoot })
  writeFileSync(join(dir, '.agents/skills/flow/custom.md'), 'Local work')
  const before = hashTree(dir)
  assert.throws(() => install({ projectRoot: dir, distributionRoot }), /local changes/u)
  assert.equal(hashTree(dir), before)
})

test('upgrade migrates unmodified renamed skills and removes them from disk', (t) => {
  const dir = fixture(t)
  install({ projectRoot: dir, distributionRoot })
  const oldName = 'grilling'
  const newName = 'grill'
  const oldDir = join(dir, '.agents/skills', oldName)
  const newDir = join(dir, '.agents/skills', newName)
  assert.ok(existsSync(newDir))
  mkdirSync(oldDir, { recursive: true })
  cpSync(newDir, oldDir, { recursive: true })
  writeFileSync(join(oldDir, 'SKILL.md'), readFileSync(join(oldDir, 'SKILL.md'), 'utf8').replace(/^name: grill/mu, 'name: grilling'))
  const manifestPath = join(dir, '.flow-skills/manifest.json')
  const prior = manifest(dir)
  prior.skills[oldName] = hashTree(oldDir)
  delete prior.skills[newName]
  writeFileSync(manifestPath, JSON.stringify(prior, null, 2) + '\n')
  const { migrated, manifest: next } = install({ projectRoot: dir, distributionRoot })
  assert.deepEqual(migrated, [oldName])
  assert.equal(existsSync(oldDir), false)
  assert.ok(existsSync(newDir))
  assert.equal(next.skills[oldName], undefined)
  assert.ok(next.skills[newName])
})

test('upgrade removes managed retired catalog skills and preserves customized ones', (t) => {
  const dir = fixture(t)
  install({ projectRoot: dir, distributionRoot })
  const managedRetired = 'setup-matt-pocock-skills'
  const managedDir = join(dir, '.agents/skills', managedRetired)
  mkdirSync(managedDir, { recursive: true })
  writeFileSync(join(managedDir, 'SKILL.md'), '---\nname: setup-matt-pocock-skills\ndescription: legacy\n---\n')
  const manifestPath = join(dir, '.flow-skills/manifest.json')
  const prior = manifest(dir)
  prior.skills[managedRetired] = hashTree(managedDir)
  writeFileSync(manifestPath, JSON.stringify(prior, null, 2) + '\n')
  const { retired, manifest: next } = install({ projectRoot: dir, distributionRoot })
  assert.deepEqual(retired, [managedRetired])
  assert.equal(next.skills[managedRetired], undefined)
  assert.equal(existsSync(join(managedDir, 'SKILL.md')), false)

  const customizedRetired = 'legacy-custom-skill'
  const customizedDir = join(dir, '.agents/skills', customizedRetired)
  mkdirSync(customizedDir, { recursive: true })
  writeFileSync(join(customizedDir, 'SKILL.md'), '---\nname: legacy-custom-skill\ndescription: legacy\n---\n')
  const prior2 = manifest(dir)
  prior2.skills[customizedRetired] = hashTree(customizedDir)
  writeFileSync(manifestPath, JSON.stringify(prior2, null, 2) + '\n')
  writeFileSync(join(customizedDir, 'local.md'), 'customized')
  const second = install({ projectRoot: dir, distributionRoot })
  assert.deepEqual(second.retired, [customizedRetired])
  assert.ok(existsSync(join(customizedDir, 'local.md')))
})

test('upgrade replaces unmodified managed content and records bundled version', (t) => {
  const dir = fixture(t)
  const source = fixture(t)
  copyDistribution(source)
  install({ projectRoot: dir, distributionRoot: source })
  const skill = join(source, 'skills/flow/SKILL.md')
  writeFileSync(skill, readFileSync(skill, 'utf8') + '\nNew release behavior.\n')
  const pkg = JSON.parse(readFileSync(join(source, 'package.json')))
  pkg.version = '0.2.0'
  writeFileSync(join(source, 'package.json'), JSON.stringify(pkg))
  install({ projectRoot: dir, distributionRoot: source })
  assert.equal(manifest(dir).flowSkillsVersion, '0.2.0')
  assert.equal(hashTree(join(dir, '.agents/skills/flow')), hashTree(join(source, 'skills/flow')))
})

test('malformed bootstrap blocks installation before any skill writes', (t) => {
  const dir = fixture(t)
  writeFileSync(join(dir, 'AGENTS.md'), '<!-- /flow-skills:bootstrap -->\nKEEP\n<!-- flow-skills:bootstrap -->')
  const before = hashTree(dir)
  assert.throws(() => install({ projectRoot: dir, distributionRoot }), /Malformed/u)
  assert.equal(hashTree(dir), before)
})

test('unmanaged conflicts and invalid target preserve existing files', (t) => {
  const dir = fixture(t)
  mkdirSync(join(dir, 'custom/flow'), { recursive: true })
  writeFileSync(join(dir, 'custom/flow/SKILL.md'), 'Existing skill')
  const before = hashTree(dir)
  assert.throws(() => install({ projectRoot: dir, distributionRoot, skillsDir: 'custom' }), /unmanaged/u)
  assert.throws(() => install({ projectRoot: dir, distributionRoot, skillsDir: '../outside' }), /relative/u)
  assert.equal(hashTree(dir), before)
})

test('explicit target and bootstrap-only mode report actual installation state', (t) => {
  const dir = fixture(t)
  install({ projectRoot: dir, distributionRoot, skipSkills: true })
  assert.equal(manifest(dir).mode, 'bootstrap-only')
  assert.equal(manifest(dir).flowSkillsVersion, null)
  assert.deepEqual(manifest(dir).skills, {})
  assert.equal(existsSync(join(dir, '.agents')), false)
  install({ projectRoot: dir, distributionRoot, skillsDir: 'agent-config/skills' })
  assert.equal(manifest(dir).skillsDirectory, 'agent-config/skills')
  const prior = manifest(dir)
  install({ projectRoot: dir, distributionRoot, skipSkills: true })
  assert.deepEqual(manifest(dir).skills, prior.skills)
  assert.equal(manifest(dir).skillsDirectory, prior.skillsDirectory)
})

test('installation refuses symlink destinations', (t) => {
  const dir = fixture(t)
  const outside = fixture(t)
  symlinkSync(outside, join(dir, '.agents'))
  assert.throws(() => install({ projectRoot: dir, distributionRoot }), /symbolic link/u)
  assert.deepEqual(readdirSync(outside), [])
  assert.equal(existsSync(join(dir, 'AGENTS.md')), false)
})

test('conflicting metadata path fails without changing existing files', (t) => {
  const dir = fixture(t)
  writeFileSync(join(dir, '.flow-skills'), 'A conflicting user file')
  const before = hashTree(dir)
  assert.throws(() => install({ projectRoot: dir, distributionRoot }))
  assert.equal(hashTree(dir), before)
})

test('CLI rejects unknown flags without writing', (t) => {
  const dir = fixture(t)
  const result = spawnSync(process.execPath, [join(distributionRoot, 'scripts/init/cli.mjs'), '--wrong'], { cwd: dir, encoding: 'utf8', timeout: 10000 })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /Unknown argument/u)
  assert.deepEqual(readdirSync(dir), [])
})

// Permissions cannot simulate write failure for root or on Windows.
test('write failure rolls back copied skills and bootstrap', { skip: process.platform === 'win32' || process.getuid?.() === 0 }, (t) => {
  const dir = fixture(t)
  const metadata = join(dir, '.flow-skills')
  mkdirSync(metadata)
  writeFileSync(join(dir, 'AGENTS.md'), '# Preserve me\n')
  const before = hashTree(dir)
  chmodSync(metadata, 0o555)
  try {
    assert.throws(() => install({ projectRoot: dir, distributionRoot }), /EACCES|EPERM/u)
    assert.equal(hashTree(dir), before)
    assert.equal(existsSync(join(dir, '.agents')), false)
  } finally { chmodSync(metadata, 0o755) }
})

test('installer rejects source overlap and reserved metadata targets', (t) => {
  const dir = fixture(t)
  assert.throws(() => install({ projectRoot: distributionRoot, distributionRoot, skillsDir: 'skills' }), /overlap/u)
  assert.throws(() => install({ projectRoot: distributionRoot, distributionRoot, skillsDir: 'skills/..nested' }), /overlap/u)
  assert.throws(() => install({ projectRoot: dir, distributionRoot, skillsDir: '.git' }), /metadata/u)
  assert.deepEqual(readdirSync(dir), [])
})
