export type PageTheme = 'default' | 'tokki' | 'hacker' | 'mono' | 'nebula' | 'ocean' | 'ember'

export const pageThemes = [
  { id: 'tokki', label: 'Rosa Tokki' },
  { id: 'hacker', label: 'Verde terminal' },
  { id: 'mono', label: 'Monocromo' },
  { id: 'nebula', label: 'Nebulosa' },
  { id: 'ocean', label: 'Abismo' },
  { id: 'ember', label: 'Ascua' },
] as const

export function normalizePageTheme(value: unknown): PageTheme {
  return pageThemes.some((theme) => theme.id === value) ? value as PageTheme : 'default'
}
