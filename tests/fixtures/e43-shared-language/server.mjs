import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'

const port = Number(process.env.PORT ?? 3043)
createServer(async (req, res) => {
  try {
    const page = await readFile(new URL('./public/holds.html', import.meta.url))
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(page)
  } catch {
    res.writeHead(500).end()
  }
}).listen(port, () => console.log(`http://localhost:${port}`))
