#!/usr/bin/env node
// Copy this repository's Cursor plugin into ~/.cursor/plugins/local/flow for IDE testing.
// Cursor does not load symlinks that point outside that folder; re-run after you change the tree.
//   node scripts/sync-cursor-local-plugin.mjs [git-ref]
// Default ref: origin/main. Validates the copy with validate.mjs.
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = fileURLToPath(import.meta.url)
const repoRoot = execFileSync('git', ['-C', resolve(here, '..'), 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
const ref = process.argv[2] ?? 'origin/main'
const dest = join(homedir(), '.cursor', 'plugins', 'local', 'flow')

mkdirSync(dest, { recursive: true })
const archive = execFileSync('git', ['-C', repoRoot, 'archive', ref], { maxBuffer: 64 * 1024 * 102644 })
const tar = spawnSync('tar', ['-x', '-C', dest], { input: archive, stdio: ['pipe', 'inherit', 'inherit'] })
if (tar.status !== 0) process.exit(tar.status ?? 1)

const manifest = join(dest, '.cursor-plugin', 'plugin.json')
if (!existsSync(manifest)) {
  console.error(`sync failed: ${manifest} missing`)
  process.exit(1)
}

const validate = spawnSync(process.execPath, [join(dest, 'scripts', 'validate.mjs')], { encoding: 'utf8' })
process.stdout.write(validate.stdout ?? '')
if (validate.status !== 0) {
  process.stderr.write(validate.stderr ?? '')
  process.exit(validate.status ?? 1)
}
console.log(`Cursor local plugin: ${dest}`)
console.log('Reload Cursor (Developer: Reload Window), then check Customize → Plugins.')
