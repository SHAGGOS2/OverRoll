import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { normalizeCardDesign, TELEPORT_SWAP_MS, TELEPORT_DURATION_MS } from '../src/cardDesign.ts'
import { translateUiText } from '../src/uiLocalization.ts'
import { teamImageLayout, exportTeamImage } from '../src/teamImage.ts'
import { MAX_EXPORT_PIXELS } from '../src/imageExport.ts'

function load(file, react = React, window = {}) {
  const source = fs.readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2023 } }).outputText
  const exports = {}
  const dependencies = { react, './cardDesign': { TELEPORT_SWAP_MS, TELEPORT_DURATION_MS }, './uiLocalization': { translateUiText } }
  vm.runInNewContext(code, { exports, React, window, require: (name) => { assert(name in dependencies, name); return dependencies[name] } })
  return exports
}
function elements(node) {
  return React.isValidElement(node) ? [node, ...React.Children.toArray(node.props.children).flatMap(elements)] : []
}

test('stored design defaults to the existing cards and accepts only the supported alternative', () => {
  for (const value of [undefined, null, {}, [], true, 'rivals', '<script>', 'classic']) assert.equal(normalizeCardDesign(value), 'classic')
  assert.equal(normalizeCardDesign(JSON.parse(JSON.stringify('bars'))), 'bars'); assert.equal(normalizeCardDesign('horizontal'), 'horizontal')
})

test('both illustrated design choices remain selectable, labeled and translated in all nine locales', () => {
  const Options = load('CardDesignOptions.tsx').default
  for (const locale of ['es-mx', 'es-es', 'en-us', 'de-de', 'fr-fr', 'pt-br', 'ja-jp', 'ko-kr', 'zh-cn']) {
    let changed
    const element = Options({ value: 'classic', onChange: (value) => { changed = value }, locale, asset: (path) => '/' + path })
    const radios = elements(element).filter((el) => el.type === 'input')
    assert.equal(radios.length, 3); assert.equal(radios.filter((el) => el.props.checked).length, 1)
    assert.equal(radios[0].props.value, 'classic'); assert.equal(radios[1].props.value, 'bars'); assert.equal(radios[2].props.value, 'horizontal')
    radios[1].props.onChange(); assert.equal(changed, 'bars')
    radios[2].props.onChange(); assert.equal(changed, 'horizontal')
    const html = renderToStaticMarkup(element)
    assert(html.includes(translateUiText(locale, 'Barras')))
    assert(html.includes(translateUiText(locale, 'Clásico')))
    if (!locale.startsWith('es-')) assert.notEqual(translateUiText(locale, 'Diseño de fichas'), 'Diseño de fichas')
  }
})

function portraitHarness() {
  let cursor = 0, pendingEffects = [], now = 0, sequence = 0
  const cells = [], timers = new Map()
  const react = { ...React,
    useRef(value) { const index = cursor++; return cells[index] ??= { current: value } },
    useState(value) { const index = cursor++; if (!(index in cells)) cells[index] = value; return [cells[index], (next) => { cells[index] = typeof next === 'function' ? next(cells[index]) : next }] },
    useEffect(callback, deps) {
      const index = cursor++, previous = cells[index]
      if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
        previous?.cleanup?.()
        cells[index] = { deps }
        pendingEffects.push(() => { cells[index].cleanup = callback() })
      }
    },
  }
  const window = { setTimeout(fn, delay) { const id = ++sequence; timers.set(id, { fn, at: now + delay }); return id }, clearTimeout(id) { timers.delete(id) } }
  const Portrait = load('BarCard.tsx', react, window).TeleportPortrait
  let props = { src: '/assets/old.png', alt: 'Old', revision: 0, enabled: true }
  const pass = () => { cursor = 0; const element = Portrait(props); const effects = pendingEffects; pendingEffects = []; effects.forEach((run) => run()); return element }
  return {
    render(next = {}) { props = { ...props, ...next }; pass(); return pass() },
    advance(ms) {
      const end = now + ms
      for (;;) { const due = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0]; if (!due) break; now = due[1].at; timers.delete(due[0]); due[1].fn() }
      now = end; return pass()
    },
    unmount() { cells.forEach((cell) => cell?.cleanup?.()) },
    get pending() { return timers.size },
  }
}
const imageSource = (element) => elements(element).find((el) => el.type === 'img')?.props.src

test('opening bars reveals the first character and repeated generation animates even the same hero', () => {
  const view = portraitHarness()
  assert.equal(view.render().props['data-phase'], 'in')
  assert.equal(view.advance(TELEPORT_DURATION_MS).props['data-phase'], 'idle')
  assert.equal(view.render({ revision: 1 }).props['data-phase'], 'out')
  view.unmount(); assert.equal(view.pending, 0)
})

test('teleport keeps the outgoing character until compression ends, then reveals the incoming character', () => {
  const view = portraitHarness(); view.render()
  const outgoing = view.render({ src: '/assets/new.png', alt: 'New', revision: 1 })
  assert.equal(outgoing.props['data-phase'], 'out'); assert.equal(imageSource(outgoing), '/assets/old.png')
  assert.equal(imageSource(view.advance(TELEPORT_SWAP_MS - 1)), '/assets/old.png')
  const incoming = view.advance(1)
  assert.equal(incoming.props['data-phase'], 'in'); assert.equal(imageSource(incoming), '/assets/new.png')
  assert.equal(view.advance(TELEPORT_DURATION_MS - TELEPORT_SWAP_MS).props['data-phase'], 'idle')
  assert.equal(view.pending, 0)
})

test('locked or motion-disabled cards update immediately, and interrupted teleports release stale timers', () => {
  for (const option of [{ locked: true }, { enabled: false }]) {
    const view = portraitHarness(); view.render()
    const next = view.render({ src: '/assets/new.png', revision: 1, ...option })
    assert.equal(next.props['data-phase'], 'idle'); assert.equal(imageSource(next), '/assets/new.png'); assert.equal(view.pending, 0)
  }
  const view = portraitHarness(); view.render(); view.render({ src: '/assets/second.png', revision: 1 }); view.advance(100)
  view.render({ src: '/assets/third.png', revision: 2 })
  assert.equal(imageSource(view.advance(TELEPORT_SWAP_MS)), '/assets/third.png')
  view.unmount(); assert.equal(view.pending, 0)
})

test('bar cards retain accessible actions, profile, role, translated perks and Stadium powers', () => {
  const Bar = load('BarCard.tsx').default
  const base = { player: 'Javo', index: 0, name: 'Mercy', role: 'Support', roleId: 'support', roleIcon: '/assets/roles/support.png', portrait: '/assets/heroes/mercy.webp', rolesOnly: false, locked: true, blocked: 2, profile: 'Main', revision: 0, motion: false, locale: 'en-us', actions: ['Reroll', 'Filter', 'Details', 'Unlock'].map((label) => React.createElement('button', { key: label, 'aria-label': label }, label)) }
  for (const count of [0, 2, 4]) {
    const perks = Array.from({ length: count }, (_, i) => ({ name: 'Power ' + i, description: 'Description ' + i, icon: '/assets/perks/a.png', tier: 'POWER' }))
    const html = renderToStaticMarkup(React.createElement(Bar, { ...base, perks }))
    assert.equal((html.match(/<button/g) ?? []).length, 4)
    assert.equal((html.match(/class="bar-card-perk"/g) ?? []).length, count)
    assert(html.includes('Javo · Mercy')); assert(html.includes('Main')); assert(html.includes('Support'))
    const roleOnly = renderToStaticMarkup(React.createElement(Bar, { ...base, rolesOnly: true, perks }))
    assert(!roleOnly.includes('class="bar-card-perk"'))
  }
})

test('bar exports fit all squads, power counts and Deadlock candidates in one row within raster limits', () => {
  for (let count = 1; count <= 12; count++) for (const powers of [0, 2, 4, 5]) for (const alternatives of [false, true]) {
    const layout = teamImageLayout(count, powers, alternatives, 'bars')
    assert.equal(layout.columns, count); assert.equal(layout.rows, 1)
    assert(layout.width * layout.height < MAX_EXPORT_PIXELS)
    assert(48 + count * layout.cardWidth + (count - 1) * 24 <= layout.width - 48)
    assert(222 + layout.cardHeight < layout.height - 30)
  }
  assert.equal(teamImageLayout(6, 2, false).columns, 3)
})

test('horizontal exports fit twelve players, full loadouts and three candidates without exceeding raster limits', () => {
  for (let count = 1; count <= 12; count++) for (let details = 0; details <= 8; details++) for (const alternatives of [false, true]) {
    const box = teamImageLayout(count, details, alternatives, 'horizontal')
    assert.equal(box.columns, Math.min(2, count))
    assert(box.width * box.height <= MAX_EXPORT_PIXELS)
    assert(222 + (box.rows - 1) * (box.cardHeight + 24) + box.cardHeight < box.height - 30)
    assert(142 + Math.max(0, details - 1) * 36 + 25 < box.cardHeight)
  }
})

test('bar export draws the selected team to a PNG through the existing safe asset loader', async (t) => {
  const old = { document: globalThis.document, window: globalThis.window, Image: globalThis.Image }
  const labels = [], loads = [], downloads = [], polygons = []
  const ctx = new Proxy({
    createLinearGradient: () => ({ addColorStop() {} }), measureText: (label) => ({ width: label.length * 7 }),
    fillText: (label) => labels.push(label), moveTo: (x, y) => polygons.push([x, y]),
  }, { get: (object, key) => object[key] ?? (() => {}) })
  const canvas = { width: 0, height: 0, getContext: () => ctx, toBlob(callback, type) { callback(new Blob(['png'], { type })) } }
  globalThis.window = { location: { origin: 'https://over-roll.com' } }
  globalThis.Image = class {
    naturalWidth = 256; naturalHeight = 256
    set src(value) { loads.push(value); queueMicrotask(() => this.onload()) }
  }
  globalThis.document = {
    createElement(tag) { return tag === 'canvas' ? canvas : { remove() {}, click() { downloads.push(this.download) } } },
    body: { appendChild() {} },
  }
  t.mock.method(URL, 'createObjectURL', () => 'blob:png')
  t.mock.method(URL, 'revokeObjectURL', () => {})
  t.after(() => Object.assign(globalThis, old))
  for (const design of ['bars', 'horizontal']) for (const count of [1, 6, 12]) {
    const cards = Array.from({ length: count }, (_, i) => ({ player: `Jugador${i + 1}`, name: 'Mercy', role: 'Support', color: '#55e4ad', portrait: '/assets/heroes/mercy.webp', icon: '/assets/roles/support.png', locked: i === 0, details: [{ label: 'Angelic Resurrection', image: '/assets/perks/mercy_minor_01_angelic-resurrection.webp' }], alternatives: count === 12 ? [{ label: '2 · Abrams', image: '/assets/games/deadlock/abrams.png' }, { label: '3 · Bebop', image: '/assets/games/deadlock/bebop.png' }] : [] }))
    const result = await exportTeamImage({ title: 'Overwatch', accent: '#ffc84a', filename: 'bar-cards', design, cards })
    assert.equal(result.missingImages, 0)
    assert.equal(canvas.width, 0); assert.equal(canvas.height, 0)
    assert(labels.includes(`Jugador${count}`)); assert(labels.includes('Angelic Resurrection'))
    if (count === 12) { assert(labels.includes('2 · Abrams')); assert(labels.includes('3 · Bebop')) }
  }
  assert(loads.every((url) => url.startsWith('https://over-roll.com/assets/')))
  assert.deepEqual(downloads, Array(6).fill('bar-cards.png')); assert(polygons.length > 0)
})
