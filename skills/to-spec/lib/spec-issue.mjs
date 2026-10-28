// Spec issue body: a one-way copy of the spec file with a hash marker (decisions 0029, 0035).
// Usage (from the repository root):
//   node spec-issue.mjs body <spec-path> <owner/repo> <ref>   prints the issue body
//   node spec-issue.mjs check <body-file|->                  exits 1 when the body was edited by hand
import { createHash } from 'node:crypto'
import { readFileSync, realpathSync } from 'node:fs'
import { join, posix } from 'node:path'
import { fileURLToPath } from 'node:url'

const MARKER = /^<!-- flow-spec sha256:([0-9a-f]{64}) -->[ \t]*$/mu

// LF endings, trailing whitespace trimmed per line, trailing blank lines removed: a web-editor round trip is not a hand edit.
export const normalizeBody = (text) => String(text).replace(/\r\n?/gu, '\n').split('\n').map((line) => line.trimEnd()).join('\n').replace(/\n+$/u, '')

export const hashBody = (text) => createHash('sha256').update(normalizeBody(text)).digest('hex')

// Relative Markdown links resolve against the spec's folder and point at the file on `ref`.
export function rewriteLinks(text, { specPath, repo, ref }) {
  const base = `https://github.com/${repo}/blob/${ref}`
  return text.replace(/\]\((?![a-z][a-z0-9+.-]*:|#|\/)([^)\s]+)\)/giu, (_, target) => {
    const [path, hash] = target.split('#')
    const resolved = posix.normalize(posix.join(posix.dirname(specPath), path))
    return `](${base}/${resolved}${hash ? `#${hash}` : ''})`
  })
}

export function buildSpecIssueBody({ root = '.', specPath, repo, ref }) {
  if (!specPath || !repo || !ref) throw new Error('specPath, repo, and ref are required')
  const path = specPath.replaceAll('\\', '/')
  const text = readFileSync(join(root, path), 'utf8')
  const header = `> Copied from [\`${path}\`](https://github.com/${repo}/blob/${ref}/${path}); edit the file, this body is overwritten.`
  const content = normalizeBody(`${header}\n\n${rewriteLinks(text, { specPath: path, repo, ref })}`)
  return `${content}\n\n<!-- flow-spec sha256:${hashBody(content)} -->\n`
}

// `expected` is the marker's hash (null when there is no marker); `actual` hashes everything above it.
export function checkSpecIssueBody(body) {
  const text = normalizeBody(body)
  const markers = [...text.matchAll(new RegExp(MARKER.source, 'gmu'))]
  const last = markers.at(-1)
  const above = last ? text.slice(0, last.index) : text
  const expected = last ? last[1] : null
  const actual = hashBody(above)
  return { edited: expected !== actual, expected, actual }
}

const isMain = () => {
  try {
    return Boolean(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
  } catch {
    return false
  }
}

if (isMain()) {
  const [command, ...args] = process.argv.slice(2)
  if (command === 'body' && args.length === 3) {
    const [specPath, repo, ref] = args
    process.stdout.write(buildSpecIssueBody({ root: process.cwd(), specPath, repo, ref }))
  } else if (command === 'check' && args.length === 1) {
    const { edited, expected, actual } = checkSpecIssueBody(readFileSync(args[0] === '-' ? 0 : args[0], 'utf8'))
    if (edited) {
      console.error(expected
        ? `Edited by hand: marker sha256:${expected}, content sha256:${actual}.`
        : 'Edited by hand: no flow-spec marker.')
      console.error('Diff it against `body` output for the spec, carry wanted edits into the file, and ask before overwriting.')
      process.exit(1)
    }
    console.log(`Unedited: sha256:${actual}`)
  } else {
    console.error('Usage: spec-issue.mjs body <spec-path> <owner/repo> <ref> | check <body-file|->')
    process.exit(2)
  }
}
