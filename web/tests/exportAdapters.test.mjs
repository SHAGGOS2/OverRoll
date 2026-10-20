import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { barPortraitFit } from '../src/cardDesign.ts'
import { fragpunkPortraitFrames } from '../src/portraitFrames.ts'
import { pvzCharacters, pvzSideColors, pvzSideSingular } from '../src/pvzCatalog.ts'
import { readPerkText, selectedPerkGroup } from '../src/overwatchText.ts'

function extract(file, functions = [], variables = []) {
  const source = fs.readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8')
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX), parts = []
  function visit(n) {
    if (ts.isFunctionDeclaration(n) && functions.includes(n.name?.text)) parts.push(n.getText(tree))
    if (ts.isVariableDeclaration(n) && variables.includes(n.name.getText(tree))) parts.push(`const ${n.name.getText(tree)} = ${n.initializer.getText(tree)}`)
    ts.forEachChild(n, visit)
  }
  visit(tree)
  return ts.transpileModule(parts.join('\n'), { compilerOptions: { target: ts.ScriptTarget.ES2023 } }).outputText
}
function run(file, fn, extras, globals) {
  const code = extract(file, [fn, ...extras.functions ?? []], extras.variables ?? [])
  return vm.runInNewContext(`${code}; ${fn}()`, globals)
}
const read = (path) => JSON.parse(fs.readFileSync(new URL(`../public/${path}`, import.meta.url)))
function assertLocal(options) {
  assert(options.cards.length > 0)
  for (const card of options.cards) {
    assert.equal(typeof card.name, 'string'); assert.equal(typeof card.role, 'string')
    const urls = [card.portrait, card.icon, ...(card.details ?? []).map((d) => d.image), ...(card.alternatives ?? []).map((d) => d.image)].filter(Boolean)
    for (const url of urls) assert(fs.existsSync(new URL(`../public/${url.replace(/^\//, '')}`, import.meta.url)), url)
  }
}

test('all eleven game adapters and OW role-only mode export valid local resources', async () => {
  const players = [{ name: 'Javo', roles: {}, side: 'plants' }], asset = (path) => path, saveImage = assertLocal
  const heroes = read('data/heroes.json').heroes
  await run('App.tsx', 'generateTeamImage', { variables: ['roleLabels'] }, { saveImage, perkText: (_hero, perk) => perk, asset, players, picks: [{ hero: heroes[0], role: heroes[0].role, perks: [...heroes[0].minorPerks, ...heroes[0].majorPerks].slice(0, 2) }], cardDesign: 'classic', rolesOnly: false, stadium: false })
  await run('App.tsx', 'generateTeamImage', { variables: ['roleLabels'] }, { saveImage, perkText: (_hero, perk) => perk, asset, players, picks: [{ hero: null, role: 'support', perks: [] }], cardDesign: 'classic', rolesOnly: true, stadium: false })
  const tf2Code = extract('App.tsx', [], ['tf2Classes'])
  const tf2Classes = vm.runInNewContext(`${tf2Code};tf2Classes`)
  for (const mercenary of tf2Classes) await run('App.tsx', 'generateTf2TeamImage', { variables: ['tf2GroupLabels', 'tf2GroupColors'] }, { saveImage, cardDesign: 'bars', asset, tf2Players: players, tf2Picks: [{ mercenary }] })
  await run('PvzModule.tsx', 'generateImage', {}, { saveImage, cardDesign: 'bars', perkText: (_hero, perk) => perk, asset, players, picks: [{ character: pvzCharacters[0] }], pvzSideColors, pvzSideSingular })
  const definitions = vm.runInNewContext(`${extract('RosterModule.tsx', [], ['rosterGameDefinitions'])};rosterGameDefinitions`)
  for (const game of definitions) {
    const catalog = read(`assets/games/${game.id}/catalog.json`).heroes.map((h) => ({ ...h, portrait: `assets/games/${game.id}/${h.portrait.split('/').pop()}` }))
    const hero = catalog[0], pick = { hero, candidates: catalog.slice(0, 3), teamupKey: 'pair' }
    if (game.supportsLoadouts) {
      const items = read('assets/games/thefinals/loadouts.json')[hero.role]
      pick.loadout = { specialization: items.specializations[0], weapon: items.weapons[0], gadgets: items.gadgets.slice(0, 3) }
    }
    await run('RosterModule.tsx', 'generateTeamImage', { functions: ['roleDefinition', 'rosterPickCandidates', 'finalsIcon', 'slugifyFinalsItem'] }, { game, cardDesign: 'bars', barPortraitFit, fragpunkPortraitFrames, gameId: game.id, baseUrl: '/', players, picks: [pick], asset, saveImage, activeTeamups: () => [{ key: 'pair', name: 'Team-Up', complete: true }], teamupPartnerKey: () => catalog[1].key, heroByKey: (key) => catalog.find((h) => h.key === key) })
  }
})

test('Overwatch image exports use selected-language names for both perks and Stadium powers', async () => {
  const hero = read('data/heroes.json').heroes.find((hero) => hero.key === 'cassidy')
  const before = JSON.stringify(hero)
  for (const locale of ['en-us', 'ja-jp', 'zh-cn']) {
    const catalog = read(`data/overwatch-texts/${locale}.json`)
    for (const stadium of [false, true]) {
      const perks = stadium ? hero.stadiumPowers.slice(0, 4) : [hero.minorPerks[0], hero.majorPerks[0]]
      const expected = perks.map((perk) => readPerkText(catalog, locale, hero.key, selectedPerkGroup(hero, perk, stadium), perk).name)
      let exported
      await run('App.tsx', 'generateTeamImage', { variables: ['roleLabels'] }, {
        saveImage: (options) => { exported = options; assertLocal(options) }, asset: (path) => path,
        players: [{ name: 'Javo' }], picks: [{ hero, role: hero.role, perks }], cardDesign: 'bars', rolesOnly: false, stadium,
        perkText: (hero, perk) => readPerkText(catalog, locale, hero.key, selectedPerkGroup(hero, perk, stadium), perk),
      })
      assert.deepEqual(Array.from(exported.cards[0].details, (detail) => detail.label), expected)
      assert.equal(exported.design, 'bars')
    }
  }
  assert.equal(JSON.stringify(hero), before)
})
