import { createPlayerId } from '../src/playerIdentity.ts'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { sanitizePersonName, PERSON_NAME_PATTERN, PROFILE_NAME_MAX_LENGTH } from '../src/personName.ts'
import { repairOverRollStorage } from '../src/storageGuard.ts'
import { localizedPlayerName, isDefaultPlayerName } from '../src/uiLocalization.ts'

const allowed = new RegExp(`^(?:${PERSON_NAME_PATTERN})$`, 'v')
const payload = '<img src=x onerror=alert(1)>'
const plain = (value) => JSON.parse(JSON.stringify(value))

// Exercise the actual TSX entry points without starting a browser or duplicating
// their implementation. TypeScript removes types from the selected functions.
function functionsFrom(file, names, globals = {}) {
  const source = readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8')
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const functions = new Map()
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && names.includes(node.name?.text)) functions.set(node.name.text, node.getText(tree))
    ts.forEachChild(node, visit)
  }
  visit(tree)
  assert.equal(functions.size, names.length)
  const code = ts.transpileModule([...functions.values()].join('\n'), {
    compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext },
  }).outputText
  return vm.runInNewContext(`${code}\n;({${names.join(',')}})`, {
    sanitizePersonName, PROFILE_NAME_MAX_LENGTH,
    createPlayerId, crypto: { randomUUID: () => 'test-player' }, ...globals,
  })
}

test('names preserve letters, accents, digits and ordinary spaces while rejecting symbols', () => {
  for (const [input, expected] of [
    ['Javo123', 'Javo123'], ['JoséÑ9', 'JoséÑ9'], ['Jose\u0301', 'José'],
    ['  Juan Pérez-42_!🎮 ', 'Juan Pérez42 '], ['玩家７', '玩家７'],
    ['A\u202EB\u200BC\n1', 'ABC1'], ['Ana   María 42', 'Ana María 42'], ['Ana\u00a0María', 'AnaMaría'], ['😀 <> " \' / = &', ''],
  ]) assert.equal(sanitizePersonName(input), expected)
  const astralLetters = '𐐀'.repeat(30)
  assert.equal(Array.from(sanitizePersonName(astralLetters)).length, 22)
  assert.equal(sanitizePersonName('A'.repeat(50), 28).length, 28)
  const hostileObject = { toString() { throw new Error('must not coerce objects') } }
  for (const value of [undefined, null, 123, hostileObject, []]) assert.equal(sanitizePersonName(value), '')
})

test('HTML, event attributes, encoded payloads and script URLs cannot survive the name policy', () => {
  for (const value of [payload, '<script>alert(document.cookie)</script>',
    '"><svg/onload=alert(1)>', 'javascript:alert(1)', '&#x3c;img&#x3e;',
    '${alert(1)}', '\u0000\r\n\t', 'x'.repeat(1000) + '<script>']) {
    const result = sanitizePersonName(value)
    assert(allowed.test(result), result)
    assert(Array.from(result).length <= 22)
    assert.equal(sanitizePersonName(result), result)
    if (value) assert(!allowed.test(value))
  }
})

const modules = [
  ['Overwatch', 'App.tsx', ['makePlayer', 'normalizePlayers'], 'normalizePlayers', 'updatePlayerName', 'assignPlayerProfile', 'setPlayers'],
  ['TF2', 'App.tsx', ['makeTf2Player', 'normalizeTf2Players'], 'normalizeTf2Players', 'tf2UpdatePlayerName', 'tf2AssignPlayerProfile', 'setTf2Players'],
  ['PVZ', 'PvzModule.tsx', ['makePlayer', 'normalizePlayers'], 'normalizePlayers', 'updatePlayerName', 'assignProfile', 'setPlayers'],
  ['eight roster games', 'RosterModule.tsx', ['makePlayer', 'minimumPlayers', 'normalizeRosterPlayers'], 'normalizeRosterPlayers', 'updatePlayerName', 'assignProfile', 'setPlayers'],
]
const game = { defaultPlayers: 3, minPlayers: 3, maxPlayers: 12, roles: [{ id: 'hero' }] }

for (const [label, file, helpers, normalize, update, assign, setter] of modules) {
  test(`${label}: stored names, typing/paste and assigned profiles obey the same policy`, () => {
    const normalizers = functionsFrom(file, helpers)
    const stored = normalizers[normalize]([{ id: 'p1', name: payload, profileId: '', blocked: ['keep-filter'] }], game)
    assert.equal(stored[0].name, sanitizePersonName(payload))
    assert.deepEqual(plain(stored[0].blocked), ['keep-filter'])
    assert(normalizers[normalize]([], game).every((player) => allowed.test(player.name)))
    let players = [{ id: 'p1', name: 'Javo', profileId: '', blocked: ['keep-filter'] }, { id: 'p2', name: 'Other2', profileId: '' }]
    const handlers = functionsFrom(file, [update, assign], {
      [setter]: (change) => { players = change(players) },
      profiles: [{ id: 'profile1', name: payload }],
      playSound() {}, playModuleSound() {}, notify() {},
    })
    handlers[update](0, payload)
    assert.equal(players[0].name, sanitizePersonName(payload))
    assert.equal(players[1].name, 'Other2')
    handlers[update](0, 'Ana ')
    assert.equal(players[0].name, 'Ana ')
    handlers[update](0, 'Ana María 42!')
    assert.equal(players[0].name, 'Ana María 42')
    handlers[assign](0, 'profile1')
    assert.equal(players[0].profileId, 'profile1')
    assert.equal(players[0].name, sanitizePersonName(payload))
    assert.deepEqual(plain(players[0].blocked), ['keep-filter'])
  })
}

test('profile restoration and renaming cannot bypass the squad restriction', () => {
  const normalizers = functionsFrom('App.tsx', ['normalizeProfiles', 'emptyProfileHeroes'])
  assert.equal(normalizers.normalizeProfiles([{ id: 'profile1', name: payload }])[0].name, sanitizePersonName(payload, 28))
  let profiles = [{ id: 'profile1', name: 'Javo' }]
  let players = [{ id: 'p1', profileId: 'profile1', name: 'Javo' }]
  let mercenaries = [{ id: 'tf1', profileId: 'profile1', name: 'Javo' }]
  const handlers = functionsFrom('App.tsx', ['renameCurrentProfile'], { syncOtherProfile() {},
    currentProfileId: 'profile1',
    setProfiles: (change) => { profiles = change(profiles) },
    setPlayers: (change) => { players = change(players) },
    setTf2Players: (change) => { mercenaries = change(mercenaries) },
  })
  const longName = 'José'.repeat(12) + payload
  handlers.renameCurrentProfile(longName)
  assert.equal(profiles[0].name, sanitizePersonName(longName, 28))
  assert.equal(players[0].name, sanitizePersonName(longName))
  assert.equal(mercenaries[0].name, players[0].name)
})

test('startup repairs names in all eleven game stores without losing profiles, filters or roles', () => {
  const keys = ['players', 'tf2.players', 'pvz.players', 'rivals.players', 'valorant.players',
    'deadlock.players', 'lastflag.players', 'thefinals.players', 'paladins.players', 'fragpunk.players', 'apex.players']
  const data = new Map()
  const person = { id: 'keep-id', name: payload, profileId: 'keep-profile', blocked: ['keep-filter'], roles: { support: true } }
  for (const key of keys) data.set(`overroll.web.${key}`, JSON.stringify([person]))
  data.set('overroll.web.profiles', JSON.stringify([{ ...person, name: 'A'.repeat(40) + payload }]))
  const original = globalThis.window
  globalThis.window = { localStorage: {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  } }
  try {
    repairOverRollStorage()
    for (const key of keys) assert.deepEqual(JSON.parse(data.get(`overroll.web.${key}`)), [{ ...person, name: sanitizePersonName(payload) }])
    assert.equal(JSON.parse(data.get('overroll.web.profiles'))[0].name.length, 28)
    const repaired = [...data]
    repairOverRollStorage()
    assert.deepEqual([...data], repaired)
    globalThis.window.localStorage.getItem = () => { throw new Error('storage blocked') }
    globalThis.window.localStorage.setItem = () => { throw new Error('storage blocked') }
    assert.doesNotThrow(repairOverRollStorage)
  } finally {
    if (original === undefined) delete globalThis.window
    else globalThis.window = original
  }
})

test('localized defaults also contain only letters and digits, including legacy defaults', () => {
  for (const locale of ['es-mx', 'es-es', 'en-us', 'pt-br', 'fr-fr', 'de-de', 'ja-jp', 'ko-kr', 'zh-cn']) {
    const value = localizedPlayerName(locale, 12)
    assert(allowed.test(value), value)
    assert(isDefaultPlayerName(value, 12))
  }
  assert(isDefaultPlayerName('Jugador 1', 1))
  assert(isDefaultPlayerName('Player 1', 1))
  assert(!isDefaultPlayerName('Javo1', 1))
})
