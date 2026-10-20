import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { validatePerkCatalog } from '../src/overwatchText.ts'

const source = fs.readFileSync(new URL('../src/useOverwatchText.ts', import.meta.url), 'utf8')
const tree = ts.createSourceFile('useOverwatchText.ts', source, ts.ScriptTarget.Latest, true)
const parts = []
for (const statement of tree.statements) {
  if (ts.isVariableStatement(statement) || ts.isFunctionDeclaration(statement) && statement.name?.text === 'loadPerkCatalog') parts.push(statement.getText(tree).replace(/^export /, ''))
}
const code = ts.transpileModule(parts.join('\n'), { compilerOptions: { target: ts.ScriptTarget.ES2023 } }).outputText
const payload = JSON.parse(fs.readFileSync(new URL('../public/data/overwatch-texts/en-us.json', import.meta.url)))

test('locale loading shares requests, separates caches, and retries after a failed payload', async () => {
  const requests = []
  let fail = false
  const load = vm.runInNewContext(`${code};loadPerkCatalog`, {
    AbortController, setTimeout, clearTimeout, validatePerkCatalog,
    fetch: async (url, options) => {
      requests.push({ url, options })
      if (fail) return { ok: false }
      return { ok: true, json: async () => payload }
    },
  })
  const first = load('/', 'en-us'), shared = load('/', 'en-us')
  assert.equal(first, shared)
  const catalog = await first
  assert.equal(await load('/', 'en-us'), catalog)
  assert.equal(requests.length, 1)
  assert.equal(requests[0].url, '/data/overwatch-texts/en-us.json')
  assert.equal(requests[0].options.cache, 'no-store')
  await load('/preview/', 'en-us')
  await load('/', 'ja-jp')
  assert.equal(requests.length, 3)
  fail = true
  await assert.rejects(load('/', 'de-de'))
  fail = false
  assert.equal(Object.keys(await load('/', 'de-de')).length, 612)
  assert.equal(requests.length, 5)
})
