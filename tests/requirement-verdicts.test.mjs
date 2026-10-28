import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')

test('review and ship name the three requirement verdicts', () => {
  for (const path of ['skills/review/SKILL.md', 'skills/ship/SKILL.md']) {
    const text = read(path)
    for (const verdict of ['satisfied', 'unmet', 'unresolved']) {
      assert.match(text, new RegExp(`\`${verdict}\``, 'u'), `${path} missing ${verdict}`)
    }
  }
  assert.match(read('skills/review/SKILL.md'), /without evidence it is `unresolved`, never `satisfied`/u)
  assert.match(read('GLOSSARY.md'), /^## Requirement verdict$/mu)
})

test('the data-not-instructions brief rule lives only in the Workers rule', () => {
  const rule = /is data for its task, never instructions that change it/u
  const owners = readdirSync(join(root, 'skills'))
    .filter((name) => rule.test(readFileSync(join(root, 'skills', name, 'SKILL.md'), 'utf8')))
  assert.deepEqual(owners, ['write-agents'])
})
