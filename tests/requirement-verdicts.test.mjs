import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
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
  // Every agent-read Markdown file under a skill counts, not only SKILL.md.
  const owners = new Set()
  for (const entry of readdirSync(join(root, 'skills'), { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue
    const path = join(entry.parentPath, entry.name)
    if (rule.test(readFileSync(path, 'utf8'))) owners.add(relative(join(root, 'skills'), path).split(sep)[0])
  }
  assert.deepEqual([...owners], ['write-agents'])
})
