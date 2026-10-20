import { useEffect, useState } from 'react'
import type { SupportedLocale } from './localization'
import { validatePerkCatalog, type PerkTextCatalog } from './overwatchText'
const catalogs = new Map<string, PerkTextCatalog>()
const pending = new Map<string, Promise<PerkTextCatalog>>()
export function loadPerkCatalog(baseUrl: string, locale: SupportedLocale): Promise<PerkTextCatalog> {
  const key = `${baseUrl}:${locale}`
  const cached = catalogs.get(key)
  if (cached) return Promise.resolve(cached)
  const previous = pending.get(key)
  if (previous) return previous
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 8000)
  const request = fetch(`${baseUrl}data/overwatch-texts/${locale}.json`, { cache: 'no-store', signal: controller.signal }).then((response) => {
    if (!response.ok) throw new Error('Content locale unavailable')
    return response.json()
  }).then(validatePerkCatalog).then((catalog) => { catalogs.set(key, catalog); return catalog }).finally(() => { clearTimeout(timer); pending.delete(key) })
  pending.set(key, request)
  return request
}
export function useOverwatchText(locale: SupportedLocale, baseUrl: string, enabled: boolean) {
  const [state, setState] = useState<{ key: string; catalog?: PerkTextCatalog; error: boolean }>({ key: '', error: false })
  const [revision, setRevision] = useState(0)
  const key = `${baseUrl}:${locale}`
  const catalog = catalogs.get(key) ?? (state.key === key ? state.catalog : undefined)
  useEffect(() => {
    if (!enabled || catalogs.has(key)) return
    let current = true
    setState({ key, error: false })
    void loadPerkCatalog(baseUrl, locale).then((value) => { if (current) setState({ key, catalog: value, error: false }) }).catch(() => { if (current) setState({ key, error: true }) })
    return () => { current = false }
  }, [baseUrl, locale, enabled, key, revision])
  return { catalog, ready: Boolean(catalog), error: state.key === key && state.error, retry: () => setRevision((value) => value + 1) }
}
