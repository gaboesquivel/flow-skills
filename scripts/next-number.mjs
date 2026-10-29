/**
 * Next free spec and decision numbers across the working tree and every local and remote branch.
 *   node scripts/next-number.mjs   (run `git fetch` first for current remotes)
 * Parallel sessions pick numbers on separate branches; validate.mjs only sees one tree.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const FOLDERS = [['specs', 3], ['decisions', 4]]

export function nextNumbers(names) {
  const result = {}
  for (const [folder, digits] of FOLDERS) {
    const used = names.map((name) => name.match(new RegExp(`^docs/${folder}/(\\d{${digits}})-.+\\.md$`, 'u'))).filter(Boolean).map((m) => Number(m[1]))
    result[folder] = String(Math.max(0, ...used) + 1).padStart(digits, '0')
  }
  return result
}

function recordPaths(repoRoot) {
  const git = (...args) => execFileSync('git', ['-C', repoRoot, ...args], { encoding: 'utf8' }).trim()
  const names = new Set()
  for (const ref of git('for-each-ref', '--format=%(refname)', 'refs/heads', 'refs/remotes').split('\n').filter(Boolean)) {
    for (const path of git('ls-tree', '-r', '--name-only', ref, '--', 'docs/specs', 'docs/decisions').split('\n')) names.add(path)
  }
  for (const [folder] of FOLDERS) {
    const dir = join(repoRoot, 'docs', folder)
    if (existsSync(dir)) for (const file of readdirSync(dir)) names.add(`docs/${folder}/${file}`)
  }
  return [...names]
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { specs, decisions } = nextNumbers(recordPaths(resolve(dirname(fileURLToPath(import.meta.url)), '..')))
  console.log(`Next spec: ${specs}\nNext decision: ${decisions}`)
}
