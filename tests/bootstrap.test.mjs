import assert from 'node:assert/strict'
import test from 'node:test'
import { START, END, hash, prepareBootstrap } from '../scripts/init/bootstrap.mjs'

test('bootstrap preserves exact surrounding bytes and repeats identically', () => {
  const input = `# Project  \n\n${START}\nold\n${END}\n\nKeep trailing spaces  \n`
  const result = prepareBootstrap(input, 'new', hash('old'))
  assert.equal(result.content, input.replace('\nold\n', '\nnew\n'))
  assert.equal(prepareBootstrap(result.content, 'new', result.hash).content, result.content)
})

test('bootstrap appends without trimming existing content', () => {
  const input = '# Project  \n\n'
  assert.ok(prepareBootstrap(input, 'new').content.startsWith(input))
  assert.match(prepareBootstrap(undefined, 'new').content, /^# Agents/u)
})

for (const [label, value] of [
  ['missing end', START], ['missing start', END], ['reversed', `${END}\nKEEP\n${START}`],
  ['duplicate', `${START}\na\n${END}\n${START}\nb\n${END}`],
]) test(`bootstrap rejects ${label}`, () => assert.throws(() => prepareBootstrap(value, 'new'), /Malformed/u))

test('bootstrap refuses unknown local customization', () => {
  assert.throws(() => prepareBootstrap(`${START}\ncustom\n${END}`, 'new', hash('old')), /local changes/u)
})
