import { readFile, stat } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { resolve, relative, extname, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const pageTitles = {
  '/': 'KYNEX — Material Identity Resolution Platform',
  '/login': 'Sign in — KYNEX',
  '/resolve': 'Resolve a Material — KYNEX',
  '/review': 'Review Queue — KYNEX',
  '/migration': 'Migration Preview — KYNEX',
  '/governance': 'Governance & Audit — KYNEX',
  '/evidence': 'Evidence & Method — KYNEX',
}
const mime = { '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.glb': 'model/gltf-binary', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.json': 'application/json', '.txt': 'text/plain' }
const escapeHtml = value => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const safeJson = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')

async function serveStatic(req, res, root, pathname) {
  const file = resolve(root, '.' + pathname)
  const rel = relative(root, file)
  if (!rel || rel.startsWith('..' + sep) || rel === '..' || rel.includes(':')) return false
  let info
  try { info = await stat(file) } catch { return false }
  if (!info.isFile() || extname(file) === '.html') return false
  const headers = { 'content-type': mime[extname(file)] || 'application/octet-stream', 'x-content-type-options': 'nosniff', 'accept-ranges': 'bytes', 'cache-control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate' }
  let start = 0, end = info.size - 1, status = 200
  if (req.headers.range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range)
    if (!match || (!match[1] && !match[2])) { res.writeHead(416, { 'content-range': `bytes */${info.size}` }); res.end(); return true }
    start = match[1] ? Number(match[1]) : Math.max(0, info.size - Number(match[2]))
    end = match[1] && match[2] ? Math.min(Number(match[2]), end) : end
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= info.size) { res.writeHead(416, { 'content-range': `bytes */${info.size}` }); res.end(); return true }
    status = 206
    headers['content-range'] = `bytes ${start}-${end}/${info.size}`
  }
  headers['content-length'] = String(Math.max(0, end - start + 1))
  res.writeHead(status, headers)
  if (req.method === 'HEAD' || info.size === 0) res.end()
  else createReadStream(file, { start, end }).on('error', () => res.destroy()).pipe(res)
  return true
}

export async function createWebHandler({ server, dev, root }) {
  const clientRoot = resolve(root, 'dist/client')
  let vite, renderProduction, productionTemplate
  if (dev) {
    const { createServer } = await import('vite')
    vite = await createServer({ root, appType: 'custom', server: { middlewareMode: true, hmr: { server } } })
    server.on('close', () => { void vite.close() })
  } else {
    productionTemplate = await readFile(resolve(clientRoot, 'index.html'), 'utf8')
    renderProduction = (await import(pathToFileURL(resolve(root, 'dist/server/entry-server.js')).href)).render
  }
  return async function handleWeb(req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { allow: 'GET, HEAD' }); res.end(); return }
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    if (pathname.includes('\0') || pathname.includes('\\')) { res.writeHead(400); res.end(); return }
    if (vite) {
      await new Promise((done, reject) => {
        const finished = () => { res.off('finish', finished); done() }
        res.once('finish', finished)
        vite.middlewares(req, res, error => { res.off('finish', finished); error ? reject(error) : done() })
      })
      if (res.writableEnded) return
    } else if (await serveStatic(req, res, clientRoot, pathname)) return
    if (extname(pathname)) { res.writeHead(404); res.end('Not found'); return }
    const canonicalPath = pathname.replace(/\/+$/, '') || '/'
    if (canonicalPath !== pathname) { res.writeHead(308, { location: canonicalPath }); res.end(); return }
    try {
      const template = vite ? await vite.transformIndexHtml(req.url, await readFile(resolve(root, 'index.html'), 'utf8')) : productionTemplate
      const render = vite ? (await vite.ssrLoadModule('/src/entry-server.tsx')).render : renderProduction
      const appHtml = render(canonicalPath)
      // Only publishable configuration is exposed. No sessions or service-role keys.
      const config = { supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '', supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '' }
      const runtime = `<script>window.__KYNEX_CONFIG__=${safeJson(config)}</script>`
      const title = pageTitles[canonicalPath] || 'Page Not Found — KYNEX'
      const html = template.replace('<!--app-html-->', appHtml).replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`).replace('<link rel="canonical" href="/" />', `<link rel="canonical" href="${escapeHtml(canonicalPath)}" />`).replace('</head>', `${runtime}</head>`)
      res.writeHead(pageTitles[canonicalPath] ? 200 : 404, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin-when-cross-origin' })
      res.end(req.method === 'HEAD' ? undefined : html)
    } catch (error) {
      vite?.ssrFixStacktrace(error)
      console.error('[KYNEX SSR]', error)
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' }); res.end('Unable to render KYNEX. Please try again.')
    }
  }
}
