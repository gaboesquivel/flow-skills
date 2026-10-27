import { createHash } from 'node:crypto'

export const START = '<!-- flow-skills:bootstrap -->'
export const END = '<!-- /flow-skills:bootstrap -->'
export const hash = (value) => createHash('sha256').update(value).digest('hex')

export function prepareBootstrap(existing, snippet, priorHash) {
  const content = snippet.trim()
  const contentHash = hash(content)
  const block = `${START}\n${content}\n${END}`
  const starts = existing?.split(START).length - 1 || 0
  const ends = existing?.split(END).length - 1 || 0
  if (starts !== ends || starts > 1 || (starts && existing.indexOf(START) > existing.indexOf(END))) {
    throw new Error('Malformed Flow bootstrap markers in AGENTS.md; repair them before installing. No files changed.')
  }
  if (starts) {
    const begin = existing.indexOf(START)
    const end = existing.indexOf(END)
    const currentHash = hash(existing.slice(begin + START.length, end).trim())
    if (currentHash !== contentHash && currentHash !== priorHash) {
      throw new Error('The Flow bootstrap block has local changes; reconcile them before installing. No files changed.')
    }
    return { content: existing.slice(0, begin) + block + existing.slice(end + END.length), hash: contentHash }
  }
  const prefix = existing === undefined ? '# Agents\n\n' : existing + (existing.endsWith('\n') ? '\n' : '\n\n')
  return { content: prefix + block + '\n', hash: contentHash }
}
