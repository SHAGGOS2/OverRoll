export type CardDesign = 'classic' | 'bars'

export const TELEPORT_SWAP_MS = 260
export const TELEPORT_DURATION_MS = 720

export function normalizeCardDesign(value: unknown): CardDesign {
  return value === 'bars' ? 'bars' : 'classic'
}

export function barPortraitFit(gameId: string): 'cover' | 'contain' {
  return gameId === 'overwatch' || gameId === 'valorant' || gameId === 'apex' || gameId === 'paladins' ? 'cover' : 'contain'
}
