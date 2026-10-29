import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { resolvePreset } from '../skills/start/lib/preset.mjs'

const skillRoot = join(import.meta.dirname, '../skills/start')

const filesUnder = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? filesUnder(path) : [path]
  })

test('resolvePreset defaults to minimal', () => {
  assert.deepEqual(resolvePreset({ request: 'start a Next.js project' }), { ok: true, preset: 'minimal' })
})

test('resolvePreset selects neon from an explicit request', () => {
  assert.deepEqual(resolvePreset({ request: 'start with Neon and Drizzle' }), { ok: true, preset: 'neon' })
  assert.deepEqual(resolvePreset({ request: 'start with a database' }), { ok: true, preset: 'neon' })
  assert.deepEqual(resolvePreset({ explicit: 'neon' }), { ok: true, preset: 'neon' })
})

test('resolvePreset rejects an unknown preset', () => {
  assert.equal(resolvePreset({ explicit: 'postgres' }).ok, false)
})

test('start does not call Vercel or Neon', () => {
  const source = filesUnder(skillRoot)
    .filter((path) => path.endsWith('.md') || path.endsWith('.mjs'))
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n')
  assert.doesNotMatch(source, /api\.vercel\.com|console\.neon\.tech|vercel link|neonctl|NEON_API_KEY|VERCEL_TOKEN/u)
})
