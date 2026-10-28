import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { buildSpecIssueBody, checkSpecIssueBody } from '../skills/to-spec/lib/spec-issue.mjs'

const helper = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'to-spec', 'lib', 'spec-issue.mjs')
const spec = [
  '# 001: Example',
  '',
  'Status: draft (2026-10-28). Decision: [0001](../decisions/0001-x.md#context).',
  '',
  'See [the site](https://example.com), [below](#notes), and [glossary](../../GLOSSARY.md).   ',
  '',
  '## Notes',
  '',
].join('\n')

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'spec-issue-'))
  mkdirSync(join(root, 'docs', 'specs'), { recursive: true })
  writeFileSync(join(root, 'docs', 'specs', '001-example.md'), spec)
  return root
}

const args = { specPath: 'docs/specs/001-example.md', repo: 'o/r', ref: 'feat/001-example' }

test('body copies the file with a header, rewritten links, and a marker', () => {
  const root = fixture()
  try {
    const body = buildSpecIssueBody({ root, ...args })
    const lines = body.split('\n')
    assert.equal(lines[0], '> Copied from [`docs/specs/001-example.md`](https://github.com/o/r/blob/feat/001-example/docs/specs/001-example.md); edit the file, this body is overwritten.')
    assert.match(body, /\]\(https:\/\/github\.com\/o\/r\/blob\/feat\/001-example\/docs\/decisions\/0001-x\.md#context\)/u)
    assert.match(body, /\]\(https:\/\/github\.com\/o\/r\/blob\/feat\/001-example\/GLOSSARY\.md\)/u)
    assert.match(body, /\]\(https:\/\/example\.com\)/u)
    assert.match(body, /\]\(#notes\)/u)
    assert.match(body, /\n\n<!-- flow-spec sha256:[0-9a-f]{64} -->\n$/u)
    assert.doesNotMatch(body, /[ \t]\n/u)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('round trip passes; CRLF and trailing spaces are not a hand edit', () => {
  const root = fixture()
  try {
    const body = buildSpecIssueBody({ root, ...args })
    const clean = checkSpecIssueBody(body)
    assert.equal(clean.edited, false)
    assert.equal(clean.expected, clean.actual)
    const webEdited = `${body.replace(/\n/gu, '  \r\n')}\r\n\r\n`
    assert.equal(checkSpecIssueBody(webEdited).edited, false)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('a hand edit or a missing marker is reported', () => {
  const root = fixture()
  try {
    const body = buildSpecIssueBody({ root, ...args })
    const edited = checkSpecIssueBody(body.replace('## Notes', '## Notes\n\nA teammate wrote this.'))
    assert.equal(edited.edited, true)
    assert.notEqual(edited.expected, edited.actual)
    const unmarked = checkSpecIssueBody('Some body without a marker')
    assert.deepEqual({ edited: unmarked.edited, expected: unmarked.expected }, { edited: true, expected: null })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('CLI body and check agree, and check exits 1 on a hand edit', () => {
  const root = fixture()
  try {
    const body = spawnSync(process.execPath, [helper, 'body', args.specPath, args.repo, args.ref], { cwd: root, encoding: 'utf8' })
    assert.equal(body.status, 0, body.stderr)
    assert.equal(body.stdout, buildSpecIssueBody({ root, ...args }))
    const file = join(root, 'body.md')
    writeFileSync(file, body.stdout)
    assert.equal(spawnSync(process.execPath, [helper, 'check', file], { encoding: 'utf8' }).status, 0)
    writeFileSync(file, body.stdout.replace('# 001: Example', '# 001: Renamed'))
    const edited = spawnSync(process.execPath, [helper, 'check', file], { encoding: 'utf8' })
    assert.equal(edited.status, 1)
    assert.match(edited.stderr, /Edited by hand/u)
    assert.equal(spawnSync(process.execPath, [helper, 'nope'], { encoding: 'utf8' }).status, 2)
    const missing = spawnSync(process.execPath, [helper, 'check', join(root, 'missing.md')], { encoding: 'utf8' })
    assert.equal(missing.status, 2)
    assert.match(missing.stderr, /Cannot read/u)
    const outside = spawnSync(process.execPath, [helper, 'body', '../escape.md', args.repo, args.ref], { cwd: root, encoding: 'utf8' })
    assert.equal(outside.status, 2)
    assert.match(outside.stderr, /inside the repository root/u)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('body rejects paths outside root or not Markdown, and malformed repo or ref', () => {
  const root = fixture()
  const outside = mkdtempSync(join(tmpdir(), 'spec-issue-outside-'))
  try {
    writeFileSync(join(outside, 'secret.md'), 'secret')
    writeFileSync(join(root, 'notes.txt'), 'text')
    symlinkSync(join(outside, 'secret.md'), join(root, 'docs', 'specs', 'link.md'))
    const build = (overrides) => () => buildSpecIssueBody({ root, ...args, ...overrides })
    for (const specPath of ['../x.md', join(outside, 'secret.md'), 'docs/specs/link.md', 'docs/../../x.md']) {
      assert.throws(build({ specPath }), /inside the repository root|ENOENT/u, specPath)
    }
    assert.throws(build({ specPath: 'notes.txt' }), /\.md file/u)
    for (const repo of ['o', 'o/r/x', 'o/r x', 'o/r)', 'https://github.com/o/r']) assert.throws(build({ repo }), /owner\/name/u, repo)
    for (const ref of ['a b', 'a..b', '../x', 'feat/x)', 'a:b', '/x', 'x/', 'x.lock', 'a//b']) assert.throws(build({ ref }), /git branch name/u, ref)
    assert.doesNotThrow(build({ ref: 'feat/001-example.v2' }))
  } finally {
    rmSync(root, { recursive: true, force: true })
    rmSync(outside, { recursive: true, force: true })
  }
})
