/**
 * Thin wrapper over the `to-spec` skill's copy, which owns the logic so it works when installed alone.
 *   node scripts/next-number.mjs   (pnpm next-number; run `git fetch` first for current remotes)
 */
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { run } from '../skills/to-spec/scripts/next-number.mjs'

export { FOLDERS, nextNumbers, recordPaths } from '../skills/to-spec/scripts/next-number.mjs'

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run(resolve(dirname(fileURLToPath(import.meta.url)), '..'))
