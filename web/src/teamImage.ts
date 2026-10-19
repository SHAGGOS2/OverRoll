import { downloadCanvasPng, loadExportImage } from './imageExport.ts'

export type ImageDetail = { label: string; image?: string }
export type TeamImageCard = {
  player: string; name: string; role: string; color: string
  portrait?: string; icon?: string; locked?: boolean; fit?: 'cover' | 'contain'
  details?: ImageDetail[]; alternatives?: ImageDetail[]
}
export type TeamImageOptions = { assetBase?: string; title: string; subtitle?: string; accent: string; filename: string; cards: TeamImageCard[] }
let exporting = false

export function teamImageLayout(count: number, detailCount: number, alternatives: boolean) {
  const columns = Math.min(3, Math.max(1, count))
  const rows = Math.ceil(count / columns)
  const cardWidth = 384
  const cardHeight = 510 + Math.min(8, detailCount) * 40 + (alternatives ? 124 : 0)
  return { columns, rows, cardWidth, cardHeight, width: 96 + columns * cardWidth + (columns - 1) * 24, height: 222 + rows * cardHeight + (rows - 1) * 24 + 80 }
}

export async function exportTeamImage(options: TeamImageOptions): Promise<{ missingImages: number } | null> {
  if (exporting) return null
  if (!options.cards.length || options.cards.length > 12) throw new Error('Escuadra no válida')
  exporting = true
  let canvas: HTMLCanvasElement | undefined
  try {
    const layout = teamImageLayout(options.cards.length, Math.max(0, ...options.cards.map((c) => c.details?.length ?? 0)), options.cards.some((c) => c.alternatives?.length))
    canvas = document.createElement('canvas')
    canvas.width = layout.width
    canvas.height = layout.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('El navegador no permite crear la imagen')
    const sources = [...new Set(options.cards.flatMap((c) => [c.portrait, c.icon, ...(c.details ?? []).map((d) => d.image), ...(c.alternatives ?? []).map((d) => d.image)]).filter((s): s is string => Boolean(s)))]
    const images = new Map<string, HTMLImageElement>()
    // Bounded loading; all drawing below is synchronous, so canvas state cannot interleave.
    for (let i = 0; i < sources.length; i += 8) {
      await Promise.all(sources.slice(i, i + 8).map(async (src) => { try { images.set(src, await loadExportImage(src, undefined, options.assetBase)) } catch { /* visible fallback */ } }))
    }
    const background = ctx.createLinearGradient(0, 0, layout.width, layout.height)
    background.addColorStop(0, '#101d2c'); background.addColorStop(1, '#050a12')
    ctx.fillStyle = background; ctx.fillRect(0, 0, layout.width, layout.height)
    ctx.fillStyle = options.accent; ctx.fillRect(48, 46, 42, 5)
    const text = (label: string, x: number, y: number, width: number, size: number, color = '#f4f7fc', weight = 700, minSize = size) => {
      ctx.fillStyle = color; ctx.font = `${weight} ${size}px system-ui, sans-serif`
      while (size > minSize && ctx.measureText(label).width > width) { size -= 1; ctx.font = `${weight} ${size}px system-ui, sans-serif` }
      let trimmed = label.slice(0, 200)
      while (trimmed.length && ctx.measureText(trimmed).width > width) trimmed = trimmed.slice(0, -1)
      ctx.fillText(trimmed.length < label.length ? `${trimmed.slice(0, -1)}…` : trimmed, x, y)
    }
    const picture = (src: string | undefined, x: number, y: number, width: number, height: number, contain = false) => {
      const image = src ? images.get(src) : undefined
      if (!image) return
      const scale = (contain ? Math.min : Math.max)(width / image.naturalWidth, height / image.naturalHeight)
      const w = image.naturalWidth * scale, h = image.naturalHeight * scale
      ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, width, height, 10); ctx.clip()
      ctx.drawImage(image, x + (width - w) / 2, y + (height - h) * .2, w, h); ctx.restore()
    }
    text('OVERROLL', 48, 88, layout.width - 96, 26, options.accent, 900)
    text(options.title.toUpperCase(), 48, 142, layout.width - 96, 36, '#ffffff', 900, 24)
    text(options.subtitle ?? `${options.cards.length} jugadores · Tu próxima partida empieza aquí`, 48, 176, layout.width - 96, 16, '#a4b7cb', 500)
    options.cards.forEach((card, index) => {
      const x = 48 + index % layout.columns * (layout.cardWidth + 24)
      const y = 222 + Math.floor(index / layout.columns) * (layout.cardHeight + 24)
      ctx.fillStyle = '#101e2e'; ctx.beginPath(); ctx.roundRect(x, y, layout.cardWidth, layout.cardHeight, 18); ctx.fill()
      ctx.strokeStyle = card.locked ? '#ffca62' : '#29394b'; ctx.lineWidth = card.locked ? 2 : 1; ctx.stroke()
      ctx.fillStyle = card.color; ctx.fillRect(x + 20, y + 22, 4, 23)
      text(String(index + 1).padStart(2, '0'), x + 34, y + 40, 28, 16, card.color, 900)
      text(card.player, x + 74, y + 40, 286, 19, '#f4f7fc', 700, 13)
      ctx.fillStyle = '#172a3e'; ctx.beginPath(); ctx.roundRect(x + 16, y + 62, 352, 320, 12); ctx.fill()
      picture(card.portrait, x + 16, y + 62, 352, 320, card.fit === 'contain')
      if (!card.portrait || !images.has(card.portrait)) text('OVERROLL', x + 100, y + 238, 210, 24, '#647d95', 900)
      const fade = ctx.createLinearGradient(0, y + 270, 0, y + 382); fade.addColorStop(0, '#101e2e00'); fade.addColorStop(1, '#101e2e')
      ctx.fillStyle = fade; ctx.fillRect(x + 16, y + 270, 352, 112)
      text(card.name.toUpperCase(), x + 24, y + 420, 336, 27, '#ffffff', 900, 18)
      picture(card.icon, x + 24, y + 438, 24, 24, true)
      text(card.role, x + (card.icon ? 58 : 24), y + 457, card.icon ? 302 : 336, 15, card.color)
      let detailY = y + 488
      for (const detail of (card.details ?? []).slice(0, 8)) {
        ctx.fillStyle = '#1a2b3d'; ctx.beginPath(); ctx.roundRect(x + 20, detailY - 12, 344, 34, 6); ctx.fill()
        picture(detail.image, x + 26, detailY - 8, 26, 26, true)
        text(detail.label, x + (detail.image ? 62 : 30), detailY + 11, detail.image ? 290 : 320, 13, '#dbe7f3', 600)
        detailY += 40
      }
      ;(card.alternatives ?? []).slice(0, 2).forEach((item, i) => {
        const ax = x + 20 + i * 176
        picture(item.image, ax, detailY + 2, 168, 82)
        text(item.label, ax + 4, detailY + 106, 160, 12, '#b7cadd')
      })
    })
    text('over-roll.com  /  Generado con OverRoll', 48, layout.height - 30, layout.width - 96, 14, '#8197af', 500)
    await downloadCanvasPng(canvas, options.filename)
    return { missingImages: sources.length - images.size }
  } finally {
    if (canvas) { canvas.width = 0; canvas.height = 0 }
    exporting = false
  }
}
