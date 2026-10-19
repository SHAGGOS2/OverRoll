import test from 'node:test'
import assert from 'node:assert/strict'
import { safeAssetUrl, safePngFilename, loadExportImage, canvasToPng, downloadCanvasPng, MAX_EXPORT_PIXELS } from '../src/imageExport.ts'
import { teamImageLayout, exportTeamImage } from '../src/teamImage.ts'

const origin = 'https://over-roll.com'
const source = '/assets/heroes/dmon-3d.png'
test('asset URLs accept packaged images and reject active, remote and ambiguous sources', () => {
  for (const path of [source, 'assets/roles/tank.png', `${origin}${source}`]) assert(safeAssetUrl(path, '/', origin).startsWith(`${origin}/assets/`))
  assert.equal(safeAssetUrl('assets/roles/tank.png', '/OverRoll/', origin), `${origin}/OverRoll/assets/roles/tank.png`)
  for (const bad of [undefined, null, {}, 42, '', '//evil.example/x.png', 'https://evil.example/x.png', 'http://over-roll.com/assets/x.png', 'https://u:p@over-roll.com/assets/x.png', 'javascript:alert(1)', 'data:image/svg+xml,<svg/>', 'blob:https://over-roll.com/id', '/assets/../secret.png', '/assets/%2e%2e/private.png', '/assets/x.js', '/assets/x.png?redirect=https://evil.example', '/assets/x.svg#fragment', '/assets/\\evil.png', '/assets/x\n.png', '/assets/x .png']) assert.equal(safeAssetUrl(bad, '/', origin), '', String(bad))
})

test('download names cannot contain paths, executable extensions or control characters', () => {
  for (const value of ['../../a.html', '<script>alert(1)</script>', 'x\r\n.exe', 'assets/x.svg.png', '', '💥'.repeat(100)]) {
    const result = safePngFilename(value)
    assert.match(result, /^[a-z0-9_-]+\.png$/i)
    assert(result.length <= 100)
  }
})

function setupImage(t, mode) {
  t.mock.method(globalThis, 'setTimeout', globalThis.setTimeout)
  const previousWindow = globalThis.window, previousImage = globalThis.Image
  globalThis.window = { location: { origin } }
  let instance
  globalThis.Image = class {
    naturalWidth = mode === 'oversize' ? 100000 : mode === 'empty' ? 0 : 512
    naturalHeight = 512
    removed = false
    constructor() { instance = this }
    set src(value) { this.assigned = value; if (mode !== 'timeout') queueMicrotask(() => mode === 'error' ? this.onerror?.() : this.onload?.()) }
    removeAttribute(name) { if (name === 'src') this.removed = true }
  }
  t.after(() => { globalThis.window = previousWindow; globalThis.Image = previousImage })
  return () => instance
}

test('image loader clears handlers after success', async (t) => {
  const current = setupImage(t, 'success')
  const image = await loadExportImage(`${origin}${source}`, 100)
  assert.equal(image, current()); assert.equal(image.onload, null); assert.equal(image.onerror, null)
})
for (const mode of ['timeout', 'error', 'empty', 'oversize']) test(`image loader handles ${mode} and releases pending image`, async (t) => {
  const current = setupImage(t, mode)
  await assert.rejects(loadExportImage(source, 5))
  assert.equal(current().onload, null); assert.equal(current().onerror, null); assert.equal(current().removed, true)
})

test('image loader rejects remote URLs before constructing an image', async (t) => {
  const current = setupImage(t, 'success')
  await assert.rejects(loadExportImage('https://evil.example/a.png'))
  assert.equal(current(), undefined)
})

test('PNG serialization rejects invalid dimensions, null output, incorrect MIME and tainted canvas', async () => {
  for (const canvas of [
    { width: 0, height: 100 }, { width: MAX_EXPORT_PIXELS, height: 2 },
    { width: 10, height: 10, toBlob(cb) { cb(null) } },
    { width: 10, height: 10, toBlob(cb) { cb(new Blob(['<svg/>'], { type: 'image/svg+xml' })) } },
    { width: 10, height: 10, toBlob() { throw new DOMException('tainted', 'SecurityError') } },
  ]) await assert.rejects(canvasToPng(canvas))
  const png = new Blob(['raster'], { type: 'image/png' })
  assert.equal(await canvasToPng({ width: 10, height: 10, toBlob(cb, mime) { assert.equal(mime, 'image/png'); cb(png) } }), png)
})

test('download appends and removes anchor and revokes the blob after initiation, including click errors', async (t) => {
  const previousDocument = globalThis.document
  const calls = [], timers = []
  t.mock.method(URL, 'createObjectURL', () => { calls.push('create'); return 'blob:export' })
  t.mock.method(URL, 'revokeObjectURL', () => calls.push('revoke'))
  t.mock.method(globalThis, 'setTimeout', (fn, delay) => { if (delay === 1000) timers.push(fn); return 1 })
  t.mock.method(globalThis, 'clearTimeout', () => {})
  let fail = false
  const anchor = { remove() { calls.push('remove') }, click() { calls.push('click'); if (fail) throw new Error('download unavailable') } }
  globalThis.document = { createElement() { return anchor }, body: { appendChild(node) { assert.equal(node, anchor); calls.push('append') } } }
  t.after(() => { globalThis.document = previousDocument })
  const canvas = { width: 10, height: 10, toBlob(cb) { cb(new Blob(['png'], { type: 'image/png' })) } }
  await downloadCanvasPng(canvas, '../../unsafe.html')
  assert.deepEqual(calls, ['create', 'append', 'click', 'remove'])
  assert.match(anchor.download, /^[a-z0-9_-]+\.png$/i)
  timers.shift()(); assert.equal(calls.at(-1), 'revoke')
  fail = true
  await assert.rejects(downloadCanvasPng(canvas, 'safe'))
  assert.equal(calls.at(-1), 'remove'); timers.shift()(); assert.equal(calls.at(-1), 'revoke')
})

test('every squad layout fits all cards and eight detail rows within bounded raster dimensions', () => {
  for (let count = 1; count <= 12; count++) for (let details = 0; details <= 8; details++) {
    const box = teamImageLayout(count, details, true)
    assert(box.width * box.height <= MAX_EXPORT_PIXELS)
    const lastY = 222 + (box.rows - 1) * (box.cardHeight + 24)
    assert(lastY + box.cardHeight < box.height - 30)
    assert(488 + details * 40 + 106 < box.cardHeight)
  }
})

test('export refuses oversized squads and releases its global lock after rendering errors', async (t) => {
  const previousDocument = globalThis.document
  globalThis.document = { createElement() { return { width: 0, height: 0, getContext() { return null } } } }
  t.after(() => { globalThis.document = previousDocument })
  const options = { title: 'test', accent: '#fff', filename: 'test', cards: [{ player: 'A', name: 'Hero', role: 'Role', color: '#fff' }] }
  await assert.rejects(exportTeamImage({ ...options, cards: Array(13).fill(options.cards[0]) }))
  await assert.rejects(exportTeamImage(options))
  await assert.rejects(exportTeamImage(options))
})

test('a pending export blocks additional canvas allocations', async (t) => {
  setupImage(t, 'success')
  const previousDocument = globalThis.document
  let created = 0
  globalThis.document = { createElement() { created++; return { width: 1, height: 1, getContext() { return { createLinearGradient() { throw new Error('stop after loading') } } } } } }
  t.after(() => { globalThis.document = previousDocument })
  const options = { title: 'test', accent: '#fff', filename: 'test', cards: [{ player: 'A', name: 'Hero', role: 'Role', color: '#fff', portrait: source }] }
  const first = exportTeamImage(options)
  assert.equal(await exportTeamImage(options), null)
  assert.equal(created, 1)
  await assert.rejects(first)
})
