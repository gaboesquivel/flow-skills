import assert from 'node:assert/strict'
import test from 'node:test'
import { checkEndpoint, checkModel, probe } from '../scripts/local-probe.mjs'

const reply = (status, body) => async () => ({ ok: status < 400, status, text: async () => body })

test('local endpoints are accepted, remote ones rejected', () => {
  assert.equal(checkEndpoint('http://127.0.0.1:11434'), 'http://127.0.0.1:11434')
  assert.equal(checkEndpoint('http://localhost:11434/'), 'http://localhost:11434')
  assert.equal(checkEndpoint('http://[::1]:11434'), 'http://[::1]:11434')
  for (const remote of ['https://ollama.com', 'http://10.0.0.5:11434', 'http://127.0.0.1.example.com:11434', 'https://127.0.0.1:11434', 'not a url']) {
    assert.throws(() => checkEndpoint(remote), /endpoint/u)
  }
})

test('cloud model selections are rejected', () => {
  assert.equal(checkModel('qwen2.5-coder:0.5b'), 'qwen2.5-coder:0.5b')
  for (const cloud of ['gpt-oss:120b-cloud', 'qwen3-coder:cloud', 'qwen3-coder:Cloud', '']) assert.throws(() => checkModel(cloud), /local model/u)
})

test('a remote endpoint or cloud model fails before any request', async () => {
  let calls = 0
  const fetchImpl = async () => { calls += 1 }
  await assert.rejects(probe({ endpoint: 'https://ollama.com', model: 'qwen2.5-coder:0.5b', prompt: 'x', fetchImpl }))
  await assert.rejects(probe({ endpoint: 'http://127.0.0.1:11434', model: 'qwen3-coder:cloud', prompt: 'x', fetchImpl }))
  assert.equal(calls, 0)
})

test('a completed reply keeps the request and response', async () => {
  let sent
  const fetchImpl = async (url, init) => { sent = { url, init }; return reply(200, JSON.stringify({ message: { content: 'fixed' }, done_reason: 'stop' }))() }
  const trace = await probe({ endpoint: 'http://127.0.0.1:11434', model: 'm', system: 's', prompt: 'p', fetchImpl })
  assert.equal(sent.url, 'http://127.0.0.1:11434/api/chat')
  assert.equal(sent.init.redirect, 'error')
  assert.deepEqual(JSON.parse(sent.init.body).messages.map((m) => m.role), ['system', 'user'])
  assert.equal(JSON.parse(sent.init.body).options.num_predict, 512)
  assert.equal(trace.outcome, 'completed')
  assert.equal(trace.truncated, false)
})

test('timeouts and malformed replies are recorded as failures', async () => {
  const timeout = async () => { throw Object.assign(new Error('aborted'), { name: 'TimeoutError' }) }
  const timedOut = await probe({ endpoint: 'http://127.0.0.1:11434', model: 'm', prompt: 'p', timeoutMs: 5, fetchImpl: timeout })
  assert.equal(timedOut.outcome, 'failure')
  assert.match(timedOut.error, /timeout after 5 ms/u)
  const malformed = await probe({ endpoint: 'http://127.0.0.1:11434', model: 'm', prompt: 'p', fetchImpl: reply(200, '<html>') })
  assert.equal(malformed.outcome, 'failure')
  assert.equal(malformed.error, 'malformed response')
  assert.equal(malformed.raw, '<html>')
})

test('error statuses and truncated replies are recorded', async () => {
  const jsonError = await probe({ endpoint: 'http://127.0.0.1:11434', model: 'm', prompt: 'p', fetchImpl: reply(500, JSON.stringify({ error: 'model not found' })) })
  assert.equal(jsonError.outcome, 'failure')
  assert.equal(jsonError.error, 'HTTP 500: model not found')
  const htmlError = await probe({ endpoint: 'http://127.0.0.1:11434', model: 'm', prompt: 'p', fetchImpl: reply(502, '<html>') })
  assert.equal(htmlError.error, 'HTTP 502')
  assert.equal(htmlError.raw, '<html>')
  const cut = await probe({ endpoint: 'http://127.0.0.1:11434', model: 'm', prompt: 'p', timeoutMs: 9, fetchImpl: reply(200, JSON.stringify({ message: { content: 'par' }, done_reason: 'length' })) })
  assert.equal(cut.outcome, 'completed')
  assert.equal(cut.truncated, true)
  assert.equal(cut.timeoutMs, 9)
})

test('a refused connection keeps its cause', async () => {
  const refused = async () => { throw new TypeError('fetch failed', { cause: { code: 'ECONNREFUSED' } }) }
  const trace = await probe({ endpoint: 'http://127.0.0.1:11434', model: 'm', prompt: 'p', fetchImpl: refused })
  assert.equal(trace.error, 'fetch failed: ECONNREFUSED')
})
