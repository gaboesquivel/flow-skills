import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { countTasks, deriveBoard, parseStatus, readSnapshot, renderHtml } from '../skills/board/scripts/board.mjs'

const script = join(import.meta.dirname, '../skills/board/scripts/board.mjs')

const spec = (title, status, rest = '') => `# ${title}\n\n${status === null ? '' : `Status: ${status} (2026-10-28).\n`}\n## Problem\n\nText.\n${rest}`
const snapshot = (specs, branches = []) => ({ defaultBranch: 'main', branches, specs: Object.entries(specs).map(([file, content]) => ({ file, content, source: 'main' })) })
const stageOf = (board, number) => board.columns.find((column) => column.cards.some((card) => card.number === number))?.id
const cardOf = (board, number) => board.columns.flatMap((column) => column.cards).find((card) => card.number === number)

test('board has five columns in stage order', () => {
  const board = deriveBoard(snapshot({}))
  assert.deepEqual(board.columns.map((column) => column.title), ['Candidate', 'Specced', 'Ready', 'Building', 'Shipped'])
})

test('status implemented is Shipped', () => {
  assert.equal(stageOf(deriveBoard(snapshot({ '001-a.md': spec('001: A', 'implemented') })), '001'), 'shipped')
})

test('draft without tasks is Specced, without marker', () => {
  const board = deriveBoard(snapshot({ '002-b.md': spec('002: B', 'draft') }))
  assert.equal(stageOf(board, '002'), 'specced')
  assert.equal(cardOf(board, '002').marker, null)
  assert.equal(cardOf(board, '002').title, 'B')
})

test('candidate status is Candidate, not swallowed by Specced', () => {
  assert.equal(stageOf(deriveBoard(snapshot({ '003-c.md': spec('003: C', 'candidate') })), '003'), 'candidate')
})

test('missing or unknown status is Specced with a marker', () => {
  const board = deriveBoard(snapshot({ '004-d.md': spec('004: D', null), '005-e.md': spec('005: E', 'proposed') }))
  assert.equal(stageOf(board, '004'), 'specced')
  assert.equal(cardOf(board, '004').marker, 'no status line')
  assert.equal(stageOf(board, '005'), 'specced')
  assert.match(cardOf(board, '005').marker, /unknown status "proposed"/u)
})

test('bold status lines parse; task status lines below the header do not', () => {
  assert.equal(parseStatus('# 1: X\n\n**Status:** Implemented\n'), 'implemented')
  assert.equal(parseStatus('# 1: X\n\n## Tasks\n\n**Status:** done\n'), null)
})

test('tasks with none done is Ready; one done is Building', () => {
  const ready = spec('006: F', 'draft', '\n## Tasks\n\n- [ ] one\n- [ ] two\n')
  const started = spec('007: G', 'draft', '\n## Tasks\n\n- [x] one\n- [ ] two\n')
  const board = deriveBoard(snapshot({ '006-f.md': ready, '007-g.md': started }))
  assert.equal(stageOf(board, '006'), 'ready')
  assert.equal(stageOf(board, '007'), 'building')
  assert.deepEqual(cardOf(board, '007').tasks, { done: 1, total: 2 })
})

test('task counting: checkboxes, or ### headings with Status done or all boxes checked', () => {
  assert.deepEqual(countTasks('# X\n\n## Tasks\n\n- [x] a\n- [X] b\n- [ ] c\n\n## Notes\n\n- [ ] not a task\n'), { done: 2, total: 3 })
  const headed = [
    '## Tasks', '',
    '### 01: One', '**Status:** done in #12', '- [ ] stale box', '',
    '### 02: Two', '**Status:** planned', '- [x] a', '- [x] b', '',
    '### 03: Three', '**Status:** planned', '- [x] a', '- [ ] b', '',
  ].join('\n')
  assert.deepEqual(countTasks(headed), { done: 2, total: 3 })
  assert.deepEqual(countTasks('# X\n\nno tasks\n'), { done: 0, total: 0 })
})

test('unmerged branch whose last segment contains the slug is Building', () => {
  const branches = [{ name: 'feat/progress-board', remote: false, merged: false }, { name: 'feat/other', remote: false, merged: false }]
  const board = deriveBoard(snapshot({ '012-progress-board.md': spec('012: Progress board', 'draft') }, branches))
  assert.equal(stageOf(board, '012'), 'building')
  assert.equal(cardOf(board, '012').branch, 'feat/progress-board')
})

test('merged spec branch is Shipped even when status is draft', () => {
  const branches = [{ name: 'origin/spec/009-flow-mode', remote: true, merged: true }]
  const board = deriveBoard(snapshot({ '009-flow-mode.md': spec('009: Flow mode', 'draft') }, branches))
  assert.equal(stageOf(board, '009'), 'shipped')
})

test('renderHtml escapes text', () => {
  const html = renderHtml(deriveBoard(snapshot({ '001-x.md': spec('001: <script>alert(1)</script>', 'draft') })))
  assert.doesNotMatch(html, /<script>/u)
  assert.match(html, /&lt;script&gt;/u)
})

function makeRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'board-git-'))
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  git('init', '--quiet', '--initial-branch=main')
  git('config', 'user.email', 'board@test.invalid')
  git('config', 'user.name', 'Board Test')
  git('config', 'commit.gpgsign', 'false')
  const write = (file, content) => { mkdirSync(join(dir, 'docs/specs'), { recursive: true }); writeFileSync(join(dir, 'docs/specs', file), content) }
  const commit = (message) => { git('add', '-A'); git('commit', '--quiet', '-m', message) }
  return { dir, git, write, commit }
}

test('readSnapshot and --once render a fixture repository', () => {
  const { dir, git, write, commit } = makeRepo()
  try {
    write('README.md', '# Specs\n')
    write('001-shipped.md', spec('001: Shipped thing', 'implemented'))
    write('002-idea.md', spec('002: Idea', 'candidate'))
    write('003-plain.md', spec('003: Plain draft', 'draft'))
    write('004-planned.md', spec('004: Planned', 'draft', '\n## Tasks\n\n- [ ] one\n'))
    write('005-merged-work.md', spec('005: Merged work', 'draft'))
    write('006-active.md', spec('006: Active', 'draft'))
    commit('specs')
    git('switch', '--quiet', '-c', 'feat/merged-work')
    writeFileSync(join(dir, 'work.txt'), 'done\n')
    commit('work')
    git('switch', '--quiet', 'main')
    git('merge', '--quiet', '--no-ff', '-m', 'merge', 'feat/merged-work')
    git('branch', 'feat/active')
    git('switch', '--quiet', 'feat/active')
    writeFileSync(join(dir, 'active.txt'), 'wip\n')
    write('007-branch-only.md', spec('007: Branch only', 'draft'))
    commit('wip')
    git('switch', '--quiet', 'main')

    const snap = readSnapshot(dir)
    assert.equal(snap.defaultBranch, 'main')
    assert.equal(snap.specs.some((s) => s.file === 'README.md'), false)
    const board = deriveBoard(snap)
    assert.equal(stageOf(board, '001'), 'shipped')
    assert.equal(stageOf(board, '002'), 'candidate')
    assert.equal(stageOf(board, '003'), 'specced')
    assert.equal(stageOf(board, '004'), 'ready')
    assert.equal(stageOf(board, '005'), 'shipped')
    assert.equal(stageOf(board, '006'), 'building')
    assert.equal(cardOf(board, '007').source, 'feat/active')

    const out = join(dir, 'out', 'board.html')
    const run = spawnSync(process.execPath, [script, '--once', '--out', out], { cwd: join(dir, 'docs'), encoding: 'utf8' })
    assert.equal(run.status, 0, run.stderr)
    assert.equal(run.stdout.trim(), out)
    const html = readFileSync(out, 'utf8')
    for (const title of ['Candidate', 'Specced', 'Ready', 'Building', 'Shipped']) assert.match(html, new RegExp(`<h2>${title} `, 'u'))
    for (const title of ['Shipped thing', 'Idea', 'Plain draft', 'Planned', 'Merged work', 'Active']) assert.match(html, new RegExp(title, 'u'))
    assert.doesNotMatch(html, /https?:\/\//u)

    const defaultRun = spawnSync(process.execPath, [script, '--once', '--repo', dir], { encoding: 'utf8' })
    assert.equal(defaultRun.status, 0, defaultRun.stderr)
    assert.match(defaultRun.stdout.trim(), /\.git[/\\]flow[/\\]board\.html$/u)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('CLI without a mode prints usage', () => {
  const run = spawnSync(process.execPath, [script], { encoding: 'utf8' })
  assert.equal(run.status, 2)
  assert.match(run.stderr, /--once/u)
})
