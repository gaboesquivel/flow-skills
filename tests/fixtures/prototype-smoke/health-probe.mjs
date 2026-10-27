/** Disposable probe — not production code. */
const expectJson = process.argv.includes('--json')
const body = expectJson ? '{"status":"ok"}' : 'ok'
console.log(JSON.stringify({ suggestedBody: body, note: 'Compare formats without deploying a server' }))
