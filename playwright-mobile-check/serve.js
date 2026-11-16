// Tiny static server for the demo pages: no dependencies, and it only ever serves files
// from inside demo/ (no "../" tricks), with nosniff so the browser trusts the content type.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, resolve, sep } from 'node:path'

const ROOT = resolve('demo')
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' }
const PORT = Number(process.env.PORT) || 4173

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  const file = normalize(join(ROOT, path.endsWith('/') ? `${path}index.html` : path))
  if (!file.startsWith(ROOT + sep) || !TYPES[extname(file)]) {
    res.writeHead(404).end('Not found')
    return
  }
  try {
    const body = await readFile(file)
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)], 'X-Content-Type-Options': 'nosniff' }).end(body)
  } catch {
    res.writeHead(404).end('Not found')
  }
}).listen(PORT, '127.0.0.1', () => console.log(`Demo on http://127.0.0.1:${PORT}`))
