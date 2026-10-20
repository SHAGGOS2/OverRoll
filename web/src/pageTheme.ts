export type PageTheme = 'default' | 'tokki' | 'hacker' | 'mono'

export const pageThemes = [
  { id: 'tokki', label: 'Rosa Tokki' },
  { id: 'hacker', label: 'Verde terminal' },
  { id: 'mono', label: 'Monocromo' },
] as const

export function normalizePageTheme(value: unknown): PageTheme {
  return pageThemes.some((theme) => theme.id === value) ? value as PageTheme : 'default'
}
