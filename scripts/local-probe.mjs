/**
 * One bounded, local-only inference probe against Ollama, with a full trace (spec 049).
 *   node scripts/local-probe.mjs --model qwen2.5-coder:0.5b --prompt-file p.txt [--system-file s.txt] --out trace.json
 *     [--endpoint http://127.0.0.1:11434] [--timeout-ms 300000] [--num-predict 512] [--num-ctx 32768]
 * A fixture-derived inference probe, not a host or skill evaluation. Never executes the model's output.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const LOOPBACK = new Set(['127.0.0.1', '[::1]', 'localhost'])

export function checkEndpoint(endpoint) {
  let url
  try { url = new URL(endpoint) } catch { throw new Error(`endpoint is not a URL: ${endpoint}`) }
  if (url.protocol !== 'http:' || !LOOPBACK.has(url.hostname)) throw new Error(`endpoint is not loopback http: ${endpoint}`)
  return url.origin
}

export function checkModel(model) {
  if (!model || /(^|[:-])cloud$/iu.test(model)) throw new Error(`model is not a local model: ${model}`)
  return model
}

export async function probe({ endpoint, model, system, prompt, timeoutMs = 300_000, numPredict = 512, numCtx, fetchImpl = fetch, now = Date.now }) {
  const origin = checkEndpoint(endpoint)
  checkModel(model)
  const messages = [...(system ? [{ role: 'system', content: system }] : []), { role: 'user', content: prompt }]
  const request = { model, messages, stream: false, options: { temperature: 0, seed: 0, num_predict: numPredict, ...(numCtx ? { num_ctx: numCtx } : {}) } }
  const trace = { endpoint: `${origin}/api/chat`, request, timeoutMs, startedAt: new Date(now()).toISOString() }
  const started = now()
  try {
    const response = await fetchImpl(trace.endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(request), redirect: 'error', signal: AbortSignal.timeout(timeoutMs) })
    trace.status = response.status
    const text = await response.text()
    let body
    try { body = JSON.parse(text) } catch { return { ...trace, elapsedMs: now() - started, outcome: 'failure', error: response.ok ? 'malformed response' : `HTTP ${response.status}`, raw: text } }
    if (!response.ok) return { ...trace, elapsedMs: now() - started, outcome: 'failure', error: `HTTP ${response.status}: ${body?.error ?? 'no error message'}`, response: body }
    if (typeof body?.message?.content !== 'string') return { ...trace, elapsedMs: now() - started, outcome: 'failure', error: 'no message content', response: body }
    return { ...trace, elapsedMs: now() - started, outcome: 'completed', truncated: body.done_reason === 'length', response: body }
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError'
    return { ...trace, elapsedMs: now() - started, outcome: 'failure', error: timedOut ? `timeout after ${timeoutMs} ms` : [error?.message ?? String(error), error?.cause?.code].filter(Boolean).join(': ') }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: {
    model: { type: 'string' }, 'prompt-file': { type: 'string' }, 'system-file': { type: 'string' }, out: { type: 'string' },
    endpoint: { type: 'string', default: 'http://127.0.0.1:11434' }, 'timeout-ms': { type: 'string', default: '300000' },
    'num-predict': { type: 'string', default: '512' }, 'num-ctx': { type: 'string' },
  } })
  if (!values.model || !values['prompt-file'] || !values.out) {
    console.error('usage: node scripts/local-probe.mjs --model <local model> --prompt-file <file> --out <trace.json> [--system-file <file>]')
    process.exit(2)
  }
  const positive = (name) => {
    const value = Number(values[name])
    if (!Number.isInteger(value) || value <= 0) { console.error(`--${name} must be a positive integer`); process.exit(2) }
    return value
  }
  const options = {
    endpoint: values.endpoint, model: values.model,
    prompt: readFileSync(values['prompt-file'], 'utf8'), system: values['system-file'] ? readFileSync(values['system-file'], 'utf8') : undefined,
    timeoutMs: positive('timeout-ms'), numPredict: positive('num-predict'), numCtx: values['num-ctx'] ? positive('num-ctx') : undefined,
  }
  let trace
  try { trace = await probe(options) } catch (error) {
    trace = { endpoint: options.endpoint, model: options.model, outcome: 'rejected', error: error.message }
    writeFileSync(values.out, `${JSON.stringify(trace, null, 2)}\n`)
    console.error(`rejected: ${error.message} -> ${values.out}`)
    process.exit(2)
  }
  writeFileSync(values.out, `${JSON.stringify(trace, null, 2)}\n`)
  console.log(`${trace.outcome}${trace.error ? `: ${trace.error}` : ''} (${trace.elapsedMs} ms) -> ${values.out}`)
  process.exit(trace.outcome === 'completed' ? 0 : 1)
}
