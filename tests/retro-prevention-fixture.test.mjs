import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const retro = readFileSync(join(root, 'skills/retro/SKILL.md'), 'utf8')
const session = readFileSync(join(root, 'tests/fixtures/retro-prevention-smoke/SESSION-NOTES.md'), 'utf8')

test('retro skill text requires evidence and prevention hierarchy', () => {
  assert.match(retro, /do not invent mistakes/u)
  assert.match(retro, /Architecture/u)
  assert.match(retro, /Types or deterministic checks/u)
  assert.match(retro, /Executable tests/u)
  assert.match(retro, /Agent guidance/u)
  assert.match(retro, /root cause/u)
  assert.match(retro, /single occurrence/u)
})

test('retro fixture documents a repeated mistake class for manual replay', () => {
  assert.match(session, /smoke-contracts/u)
  assert.match(session, /twice/u)
})
