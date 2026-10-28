import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { PHRASES } from '../skills/flow/lib/flow-block.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function description(skill) {
  const text = readFileSync(join(root, 'skills', skill, 'SKILL.md'), 'utf8')
  const match = /^description:\s*(.+)$/mu.exec(text)
  assert.ok(match, `${skill} has no description`)
  return match[1].toLowerCase()
}

test('PHRASES is non-empty', () => {
  assert.ok(PHRASES.length > 0)
})

for (const [say, skill] of PHRASES) {
  const phrase = /"([^"]+)"/u.exec(say)?.[1]

  test(`PHRASES skill ${skill} exists`, () => {
    assert.ok(existsSync(join(root, 'skills', skill, 'SKILL.md')), `skills/${skill}/SKILL.md missing`)
  })

  test(`"${phrase}" appears in the ${skill} description`, () => {
    assert.ok(phrase, `no quoted phrase in ${say}`)
    assert.ok(description(skill).includes(phrase.toLowerCase()), `"${phrase}" not in ${skill} description`)
  })
}
