import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { normalizePageTheme, pageThemes } from '../src/pageTheme.ts'
import { translateUiText } from '../src/uiLocalization.ts'

const code = ts.transpileModule(fs.readFileSync(new URL('../src/PageThemeOptions.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2023 } }).outputText
const exports = {}
vm.runInNewContext(code, { exports, React, require: (name) => name === './pageTheme' ? { pageThemes } : { translateUiText } })
const Options = exports.default
const elements = (node) => React.isValidElement(node) ? [node, ...React.Children.toArray(node.props.children).flatMap(elements)] : []

test('only the three approved page themes survive storage restoration; unknown values retain the original', () => {
  for (const value of [null, undefined, {}, [], 1, true, 'pink', '<script>', 'tokki" onload="x']) assert.equal(normalizePageTheme(value), 'default')
  for (const theme of pageThemes) assert.equal(normalizePageTheme(JSON.parse(JSON.stringify(theme.id))), theme.id)
})

test('three page designs and the original reset are labeled, selectable and translated in nine languages', () => {
  for (const locale of ['es-mx', 'es-es', 'en-us', 'de-de', 'fr-fr', 'pt-br', 'ja-jp', 'ko-kr', 'zh-cn']) {
    const chosen = [], element = Options({ value: 'hacker', locale, onChange: (value) => chosen.push(value) })
    const controls = elements(element), radios = controls.filter((node) => node.type === 'input')
    assert.equal(radios.length, 3); assert.equal(radios.filter((node) => node.props.checked).length, 1)
    assert.equal(radios.find((node) => node.props.checked).props.value, 'hacker')
    radios.forEach((node) => node.props.onChange())
    controls.find((node) => node.type === 'button').props.onClick()
    assert.deepEqual(chosen, ['tokki', 'hacker', 'mono', 'default'])
    const html = renderToStaticMarkup(element)
    for (const { label } of pageThemes) assert(html.includes(translateUiText(locale, label)))
    assert(html.includes(translateUiText(locale, 'Diseño original')))
  }
  const original = Options({ value: 'default', locale: 'es-mx', onChange() {} })
  assert.equal(elements(original).find((node) => node.type === 'button').props.disabled, true)
})

test('Tokki and terminal decorations are hidden from assistive technology and introduce no interactive content', () => {
  assert.equal(exports.ThemeBackdrop({ theme: 'default' }), null)
  for (const theme of ['tokki', 'hacker', 'mono']) {
    const decoration = exports.ThemeBackdrop({ theme })
    assert.equal(decoration.props['aria-hidden'], 'true')
    const html = renderToStaticMarkup(decoration)
    assert(!/<(?:button|input|a)\b|tabindex=/i.test(html))
    if (theme === 'tokki') assert(html.includes('<svg'))
  }
})
