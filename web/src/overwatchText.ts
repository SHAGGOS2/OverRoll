import type { SupportedLocale } from './localization'
export type PerkGroup = 'minorPerks' | 'majorPerks' | 'stadiumPowers'
export type PerkText = { name: string; description: string }
export type CanonicalPerk = PerkText & { icon: string }
export type PerkTextCatalog = Record<string, PerkText>
export function perkTextKey(heroKey: string, group: PerkGroup, perk: Pick<CanonicalPerk, 'icon'>): string {
  return `${heroKey}/${group}/${perk.icon}`
}
export function selectedPerkGroup(hero: { minorPerks: CanonicalPerk[] }, perk: CanonicalPerk, stadium: boolean): PerkGroup {
  if (stadium) return 'stadiumPowers'
  return hero.minorPerks.some((item) => item.icon === perk.icon && item.name === perk.name) ? 'minorPerks' : 'majorPerks'
}
export function readPerkText(catalog: PerkTextCatalog | undefined, locale: SupportedLocale, heroKey: string, group: PerkGroup, perk: CanonicalPerk): PerkText | null {
  return catalog?.[perkTextKey(heroKey, group, perk)] ?? (locale === 'es-mx' ? { name: perk.name, description: perk.description } : null)
}
export function validatePerkCatalog(raw: unknown): PerkTextCatalog {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid content locale')
  const entries = Object.entries(raw)
  if (!entries.length || entries.length > 2000) throw new Error('Invalid content size')
  return Object.fromEntries(entries.map(([key, value]) => {
    if (!/^[a-z0-9-]+\/(minorPerks|majorPerks|stadiumPowers)\/assets\/[a-zA-Z0-9_./-]+$/.test(key) || !value || typeof value !== 'object' || typeof value.name !== 'string' || !value.name.trim() || value.name.length > 300 || typeof value.description !== 'string' || !value.description.trim() || value.description.length > 6000 || /<[a-z/][^>]*>/i.test(value.name + value.description)) throw new Error('Invalid content translation')
    return [key, { name: value.name, description: value.description }]
  }))
}
