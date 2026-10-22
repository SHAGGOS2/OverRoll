export type WeightedItem = { key: string; weight: number }
export function normalizeWeight(value: unknown): number {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(1, Math.min(64, Math.round(number))) : 1
}
export function weightedSegments(items: WeightedItem[]) {
  const total = items.reduce((sum, item) => sum + normalizeWeight(item.weight), 0)
  let cursor = 0
  return items.map((item) => {
    const start = cursor / total * 360
    cursor += normalizeWeight(item.weight)
    return { ...item, weight: normalizeWeight(item.weight), start, end: cursor / total * 360, probability: normalizeWeight(item.weight) / total }
  })
}
export function randomTicket(total: number): number {
  if (!Number.isSafeInteger(total) || total < 1 || total > 0x100000000) throw new RangeError('Invalid ticket count')
  const limit = Math.floor(0x100000000 / total) * total
  const value = new Uint32Array(1)
  do { crypto.getRandomValues(value) } while (value[0] >= limit)
  return value[0] % total
}
export function winnerForTicket(items: WeightedItem[], ticket: number): number {
  const total = items.reduce((sum, item) => sum + normalizeWeight(item.weight), 0)
  if (!Number.isInteger(ticket) || ticket < 0 || ticket >= total) throw new RangeError('Invalid ticket')
  let cursor = 0
  return items.findIndex((item) => { cursor += normalizeWeight(item.weight); return ticket < cursor })
}
export function rotationForSegment(start: number, end: number, rotation: number, turns = 6): number {
  const angle = end - start >= 359.999 ? start : (start + end) / 2
  const normalized = ((rotation % 360) + 360) % 360
  const target = ((-angle % 360) + 360) % 360
  return rotation + turns * 360 + ((target - normalized + 360) % 360)
}
export function segmentAtRotation(segments: { start: number; end: number }[], rotation: number): number {
  if (!segments.length || !Number.isFinite(rotation)) return -1
  const angle = ((-rotation % 360) + 360) % 360
  return segments.findIndex((segment) => angle >= segment.start && angle < segment.end)
}
export function sectorArtworkBounds(start: number, end: number) {
  // Fit the visible ring in local coordinates, with the character facing the outer rim.
  const half = Math.min(360, Math.max(0, end - start)) * Math.PI / 360
  const halfWidth = half >= Math.PI / 2 ? 184 : 184 * Math.sin(half)
  const bottom = -(half <= Math.PI / 2 ? 82 : 184) * Math.cos(half)
  return { x: 200 - halfWidth, y: 16, width: halfWidth * 2, height: 184 + bottom }
}
export function sectorPath(start: number, end: number): string {
  const point = (degrees: number) => ({ x: 200 + 184 * Math.cos((degrees - 90) * Math.PI / 180), y: 200 + 184 * Math.sin((degrees - 90) * Math.PI / 180) })
  const first = point(start), last = point(end)
  if (end - start >= 359.999) return 'M 200 16 A 184 184 0 1 1 200 384 A 184 184 0 1 1 200 16 Z'
  return `M 200 200 L ${first.x} ${first.y} A 184 184 0 ${end - start > 180 ? 1 : 0} 1 ${last.x} ${last.y} Z`
}

export function restoreRouletteState(items: { key: string; role?: string }[], raw: unknown, legacySelection: unknown, legacyWeights: unknown, legacyRoles?: Record<string, unknown>) {
  const record = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {}
  const oldWeights = legacyWeights && typeof legacyWeights === 'object' && !Array.isArray(legacyWeights) ? legacyWeights as Record<string, unknown> : {}
  const storedWeights = record.weights && typeof record.weights === 'object' && !Array.isArray(record.weights) ? record.weights as Record<string, unknown> : oldWeights
  const keys = items.map((item) => item.key), valid = new Set(keys)
  const selectedRaw = record.selected ?? legacySelection
  const selection = Array.isArray(selectedRaw) ? [...new Set(selectedRaw.filter((key): key is string => typeof key === 'string' && valid.has(key)))] : keys
  const selected = record.selected === undefined && legacyRoles ? selection.filter((key) => legacyRoles[items.find((item) => item.key === key)?.role ?? ''] !== false) : selection
  const previous = (Array.isArray(record.catalog) ? record.catalog : Object.keys(oldWeights)).filter((key): key is string => typeof key === 'string' && valid.has(key))
  const hadAll = previous.length > 0 && previous.every((key) => selected.includes(key))
  return { selected: hadAll ? keys : selected, weights: Object.fromEntries(keys.map((key) => [key, normalizeWeight(storedWeights[key])])), catalog: keys }
}
