import assert from 'node:assert/strict'
import test from 'node:test'
import { createRouletteAudio } from '../src/rouletteAudio.ts'

function setup({ suspended = false, rejectResume = false } = {}) {
  const nodes = [], sources = [], parameters = []
  let created = 0, closed = 0, resumed = 0
  function param() {
    const events = [], result = { value: 0, events }
    for (const kind of ['setValueAtTime', 'exponentialRampToValueAtTime', 'setTargetAtTime', 'cancelScheduledValues']) result[kind] = (...values) => {
      assert(values.every(Number.isFinite), kind)
      if (kind === 'exponentialRampToValueAtTime') assert(values[0] > 0)
      events.push({ kind, values }); return result
    }
    parameters.push(result); return result
  }
  function node(kind) {
    const result = { kind, connections: [], disconnected: false, connect(target) { assert(target); this.connections.push(target) }, disconnect() { this.disconnected = true } }
    nodes.push(result); return result
  }
  function source(kind) {
    const result = Object.assign(node(kind), { start(at) { this.started = at }, stop(at = context.currentTime) { this.stopAt = at } })
    sources.push(result); return result
  }
  const context = {
    state: suspended ? 'suspended' : 'running', currentTime: 0, sampleRate: 48000, destination: {},
    createGain() { return Object.assign(node('gain'), { gain: param() }) },
    createBuffer(channels, length) { assert.equal(channels, 1); const samples = new Float32Array(length); return { getChannelData() { return samples } } },
    createBiquadFilter() { return Object.assign(node('filter'), { frequency: param(), Q: param() }) },
    createBufferSource() { return source('noise') },
    createOscillator() { return Object.assign(source('oscillator'), { frequency: param() }) },
    resume() { resumed++; if (rejectResume) return Promise.reject(new Error('Blocked')); this.state = 'running'; return Promise.resolve() },
    close() { closed++; this.state = 'closed'; return Promise.resolve() },
  }
  const audio = createRouletteAudio(() => { created++; return context })
  return { audio, nodes, sources, parameters, context, get created() { return created }, get closed() { return closed }, get resumed() { return resumed },
    advance(time) { context.currentTime = time; for (const source of sources) if (source.stopAt <= time) source.onended?.() },
    get active() { return sources.filter((source) => !source.disconnected) } }
}

test('roulette audio is lazy, shares one context and immediately respects mute, zero volume and live volume changes', () => {
  const h = setup()
  h.audio.start(); h.audio.tick(.2); h.audio.win(); h.audio.select()
  for (const volume of [0, -1, NaN, Infinity]) { h.audio.configure(true, volume); h.audio.start() }
  assert.equal(h.created, 0)
  h.audio.configure(true, .35); h.audio.start()
  assert.equal(h.created, 1); assert.equal(h.nodes[0].gain.value, .35 * .65)
  h.audio.tick(.2); h.audio.select(false)
  assert.equal(h.created, 1)
  h.audio.configure(true, 2)
  assert.equal(h.nodes[0].gain.events.at(-1).values[0], .65)
  h.audio.configure(false, .5)
  assert.equal(h.active.length, 0)
  const count = h.sources.length
  h.audio.win(); h.audio.tick(.7)
  assert.equal(h.sources.length, count)
  h.audio.dispose(); assert.equal(h.closed, 1)
})

test('pointer clicks are bounded during fast spins and soften in pitch as the wheel slows', () => {
  const h = setup(); h.audio.configure(true, 1); h.audio.start()
  h.audio.tick(0)
  const first = h.sources.filter((source) => source.kind === 'oscillator').at(-1).frequency.events[0].values[0]
  const count = h.sources.length
  for (let i = 1; i < 55; i++) { h.context.currentTime = i / 1000; h.audio.tick(.1) }
  assert.equal(h.sources.length, count)
  h.context.currentTime = .06; h.audio.tick(1)
  const last = h.sources.filter((source) => source.kind === 'oscillator').at(-1).frequency.events[0].values[0]
  assert(last < first)
  h.advance(.2)
  assert.equal(h.active.length, 1) // Only the spin bed remains.
  h.audio.dispose(); assert.equal(h.active.length, 0)
})

test('the result fades out the spin and plays one short rising chime; all voices disconnect after their tails', () => {
  const h = setup(); h.audio.configure(true, .5); h.audio.start()
  const bed = h.sources[0]
  assert(bed.loop); assert.equal(bed.stopAt, 3.7)
  assert(bed.buffer.getChannelData(0).every((value) => Number.isFinite(value) && value >= -1 && value <= 1))
  h.context.currentTime = 3.6; h.audio.win()
  assert(Math.abs(bed.stopAt - 3.67) < 1e-9)
  const notes = h.sources.filter((source) => source.kind === 'oscillator')
  assert.equal(notes.length, 8)
  assert.deepEqual(notes.filter((_, index) => index % 2 === 0).map((note) => note.frequency.events[0].values[0]), [523.25, 659.25, 783.99, 1046.5])
  assert(notes.every((note) => note.started >= 3.6 && note.stopAt < 4.6))
  h.advance(4.6); assert.equal(h.active.length, 0)
  assert(h.nodes.slice(1).every((node) => node.disconnected))
  h.audio.dispose(); assert(h.nodes[0].disconnected)
})

test('restarting and leaving the page cancel current and future voices without leaking contexts', () => {
  const h = setup(); h.audio.configure(true, .7); h.audio.win()
  const old = [...h.sources]
  h.audio.start()
  assert(old.every((source) => source.disconnected))
  h.audio.dispose(); h.audio.dispose()
  assert.equal(h.active.length, 0); assert.equal(h.closed, 1)
  const count = h.sources.length
  h.audio.configure(true, 1); h.audio.win(); h.audio.start(); h.audio.select()
  assert.equal(h.sources.length, count)
})

test('blocked or unsupported audio never throws or leaves scheduled sound running', async () => {
  const unavailable = createRouletteAudio(() => { throw new Error('Unavailable') })
  unavailable.configure(true, 1)
  assert.doesNotThrow(() => { unavailable.start(); unavailable.tick(.5); unavailable.win(); unavailable.select(); unavailable.dispose() })
  const h = setup({ suspended: true, rejectResume: true }); h.audio.configure(true, .5)
  h.audio.start(); await Promise.resolve()
  assert.equal(h.resumed, 1); assert.equal(h.active.length, 0)
  h.audio.dispose()
})
