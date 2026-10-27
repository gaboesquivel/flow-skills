import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export function collectDocLinkErrors(docsRoot) {
  const errors = []
  for (const file of listMarkdownFiles(docsRoot)) {
    const text = readFileSync(file, 'utf8').replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gmu, '')
    const refs = [...text.matchAll(/\]\(([^)]+)\)/gu)].map((match) => match[1])
    for (let ref of refs) {
      if (/^(?:[a-z]+:|#)/iu.test(ref)) continue
      ref = ref.split('#')[0]
      if (!ref) continue
      const resolved = resolve(dirname(file), ref)
      if (!existsSync(resolved)) errors.push(`${relative(docsRoot, file)}: missing target ${ref}`)
    }
  }
  return errors
}

function listMarkdownFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listMarkdownFiles(path))
    else if (entry.name.endsWith('.md')) out.push(path)
  }
  return out
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const docsRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs')
  const errors = collectDocLinkErrors(docsRoot)
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1 }
  else console.log('All documentation markdown links resolve.')
}
