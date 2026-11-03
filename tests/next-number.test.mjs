import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { nextNumbers } from '../scripts/next-number.mjs'

const skill = new URL('../skills/to-spec', import.meta.url).pathname

test('next number skips numbers claimed on any branch', () => {
  const names = ['docs/specs/033-a.md', 'docs/specs/033-b.md', 'docs/specs/034-c.md', 'docs/specs/README.md', 'docs/decisions/0046-x.md', 'docs/decisions/0045-y.md']
  assert.deepEqual(nextNumbers(names), { specs: '035', decisions: '0047' })
})

test('the installed to-spec skill numbers an adopter repository from its own folder', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'next-number-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const repo = join(dir, 'app')
  const git = (...args) => execFileSync('git', ['-C', repo, ...args], { stdio: 'ignore' })
  mkdirSync(join(repo, 'docs', 'specs'), { recursive: true })
  execFileSync('git', ['init', '-q', '-b', 'main', repo])
  git('config', 'user.email', 'n@test.invalid')
  git('config', 'user.name', 'N')
  git('config', 'commit.gpgsign', 'false')
  writeFileSync(join(repo, 'docs', 'specs', '004-a.md'), '# a\n')
  git('add', '.')
  git('commit', '-qm', 'a')
  git('switch', '-qc', 'spec/007-b')
  writeFileSync(join(repo, 'docs', 'specs', '007-b.md'), '# b\n')
  git('add', '.')
  git('commit', '-qm', 'b')
  git('switch', '-q', 'main')
  // Installed copy, reached through a linked skills folder, run from a subdirectory of the adopter repository.
  cpSync(skill, join(dir, 'installed', 'to-spec'), { recursive: true })
  mkdirSync(join(repo, '.claude'))
  symlinkSync(join(dir, 'installed'), join(repo, '.claude', 'skills'))
  const out = execFileSync(process.execPath, [join(repo, '.claude', 'skills', 'to-spec', 'scripts', 'next-number.mjs')], { cwd: join(repo, 'docs'), encoding: 'utf8' })
  assert.match(out, /Next spec: 008/u)
  assert.match(out, /Next decision: 0001/u)
})
