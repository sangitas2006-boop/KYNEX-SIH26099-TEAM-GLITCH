import assert from 'node:assert/strict'
const base = process.argv[2] || 'http://127.0.0.1:8787'
let passed = 0
async function check(name, fn) { await fn(); passed++; console.log(`PASS ${name}`) }
const page = async path => { const response = await fetch(base + path); return { response, html: await response.text() } }
await check('Home content is in the HTTP response, before JavaScript', async () => {
  const { response, html } = await page('/')
  assert.equal(response.status, 200)
  assert.match(html, /One material identity\./)
  assert.match(html, /Proven by evidence\./)
  assert.doesNotMatch(html, /<!--app-html-->/)
  assert.match(html, /href="\/resolve"/)
  assert.match(html, /src="\/hero-material-intelligence\.mp4"/)
  assert.equal(response.headers.get('cache-control'), 'no-store')
})
await check('Sign-in content is server-rendered', async () => {
  const { response, html } = await page('/login')
  assert.equal(response.status, 200)
  assert.match(html, /Welcome back\./)
  assert.match(html, /Continue as guest/)
  assert.match(html, /<title>Sign in — KYNEX<\/title>/)
})
await check('All workspace routes return only the client auth shell', async () => {
  for (const path of ['/resolve', '/review', '/migration', '/governance', '/evidence']) {
    const { response, html } = await page(path)
    assert.equal(response.status, 200)
    assert.match(html, /Preparing secure KYNEX access/)
    assert.doesNotMatch(html, /Material Resolution Studio|CPCL-VLV-04182/)
  }
})
await check('Unknown pages use HTTP 404', async () => {
  const { response, html } = await page('/missing-page')
  assert.equal(response.status, 404)
  assert.match(html, /This route does not exist/)
})
await check('API health still works and missing APIs stay JSON', async () => {
  const health = await fetch(base + '/api/health')
  assert.equal(health.status, 200)
  assert.equal((await health.json()).ok, true)
  const missing = await fetch(base + '/api/missing-route')
  assert.equal(missing.status, 404)
  assert.match(missing.headers.get('content-type'), /application\/json/)
})
await check('Video keeps its MIME type and range-request support', async () => {
  const response = await fetch(base + '/hero-material-intelligence.mp4', { headers: { Range: 'bytes=0-1023' } })
  assert.equal(response.status, 206)
  assert.equal(response.headers.get('content-type'), 'video/mp4')
  assert.match(response.headers.get('content-range'), /^bytes 0-1023\//)
  assert.equal((await response.arrayBuffer()).byteLength, 1024)
})
await check('Server-side bundle and environment files are not public', async () => {
  for (const path of ['/server/entry-server.js', '/.env', '/assets/missing.js']) {
    const response = await fetch(base + path)
    assert.equal(response.status, 404)
  }
})
await check('HEAD response has no body', async () => {
  const response = await fetch(base + '/', { method: 'HEAD' })
  assert.equal(response.status, 200)
  assert.equal(await response.text(), '')
})
console.log(`${passed}/${passed} SSR response checks passed against ${base}`)
