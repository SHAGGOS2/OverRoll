type Identified = { id: string }

/** Move the complete player/result pair; no field is reconstructed or discarded. */
export function reorderSquad<Player extends Identified, Pick>(
  players: Player[], picks: Pick[], sourceId: string, targetId: string, emptyPick: () => Pick,
): { players: Player[]; picks: Pick[]; changed: boolean } {
  const from = players.findIndex((player) => player.id === sourceId)
  const to = players.findIndex((player) => player.id === targetId)
  if (from < 0 || to < 0 || from === to || new Set(players.map((player) => player.id)).size !== players.length) {
    return { players, picks, changed: false }
  }
  const order = players.map((_, index) => index)
  order.splice(to, 0, order.splice(from, 1)[0])
  return { players: order.map((index) => players[index]), picks: order.map((index) => picks[index] ?? emptyPick()), changed: true }
}

export type CardRect = { left: number; top: number; right: number; bottom: number }

/** Use both axes so horizontal, multi-row and single-column layouts share one gesture. */
export function dropTarget(rects: CardRect[], x: number, y: number): number | null {
  if (!rects.length || !Number.isFinite(x) || !Number.isFinite(y)) return null
  const bounds = {
    left: Math.min(...rects.map((rect) => rect.left)), right: Math.max(...rects.map((rect) => rect.right)),
    top: Math.min(...rects.map((rect) => rect.top)), bottom: Math.max(...rects.map((rect) => rect.bottom)),
  }
  if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) return null
  let nearest = 0, distance = Infinity
  rects.forEach((rect, index) => {
    const dx = Math.max(rect.left - x, 0, x - rect.right)
    const dy = Math.max(rect.top - y, 0, y - rect.bottom)
    const next = dx * dx + dy * dy
    if (next < distance) { distance = next; nearest = index }
  })
  return nearest
}

export function keyboardTarget(rects: CardRect[], index: number, key: string): number | null {
  if (!rects[index]) return null
  if (key === 'Home') return 0
  if (key === 'End') return rects.length - 1
  if (key === 'ArrowLeft') return Math.max(0, index - 1)
  if (key === 'ArrowRight') return Math.min(rects.length - 1, index + 1)
  if (key !== 'ArrowUp' && key !== 'ArrowDown') return null
  const source = rects[index], direction = key === 'ArrowUp' ? -1 : 1
  const x = (source.left + source.right) / 2, y = (source.top + source.bottom) / 2
  let nearest: number | null = null, distance = Infinity
  rects.forEach((rect, next) => {
    const dx = (rect.left + rect.right) / 2 - x, dy = (rect.top + rect.bottom) / 2 - y
    if (next === index || dy * direction < 1) return
    const score = Math.abs(dy) + Math.abs(dx) * 2
    if (score < distance) { distance = score; nearest = next }
  })
  return nearest
}

export function showcaseScale(width: number, height: number, availableWidth: number, availableHeight: number): number {
  if (![width, height, availableWidth, availableHeight].every((value) => Number.isFinite(value) && value > 0)) return 1
  return Math.min(1, availableWidth / width, availableHeight / height)
}
