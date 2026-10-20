import { downloadCanvasPng, loadExportImage } from './imageExport.ts'
import type { PortraitFrame } from './portraitFrames.ts'
import type { CardDesign } from './cardDesign.ts'

export type ImageDetail = { label: string; image?: string }
export type TeamImageCard = {
  player: string; name: string; role: string; color: string
  portrait?: string; icon?: string; locked?: boolean; fit?: 'cover' | 'contain'; frame?: PortraitFrame
  details?: ImageDetail[]; alternatives?: ImageDetail[]
}
export type TeamImageOptions = { assetBase?: string; title: string; subtitle?: string; accent: string; filename: string; cards: TeamImageCard[]; design?: CardDesign }
let exporting = false

export function teamImageLayout(count: number, detailCount: number, alternatives: boolean, design: CardDesign = 'classic') {
  if (design === 'horizontal') {
    const columns = Math.min(2, Math.max(1, count)), rows = Math.ceil(count / columns)
    const cardWidth = 720, cardHeight = 280 + Math.max(0, Math.min(8, detailCount) - 2) * 36 + (alternatives ? 60 : 0)
    return { columns, rows, cardWidth, cardHeight, width: 96 + columns * cardWidth + (columns - 1) * 24, height: 222 + rows * cardHeight + (rows - 1) * 24 + 80 }
  }
  if (design === 'bars') {
    const columns = Math.max(1, count), cardWidth = 280, cardHeight = 620 + Math.max(0, Math.min(8, detailCount) - 2) * 36 + (alternatives ? 300 : 0)
    return { columns, rows: 1, cardWidth, cardHeight, width: 96 + columns * cardWidth + (columns - 1) * 24, height: 222 + cardHeight + 80 }
  }
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
    const layout = teamImageLayout(options.cards.length, Math.max(0, ...options.cards.map((c) => c.details?.length ?? 0)), options.cards.some((c) => c.alternatives?.length), options.design)
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
    const picture = (src: string | undefined, x: number, y: number, width: number, height: number, contain = false, frame?: PortraitFrame) => {
      const image = src ? images.get(src) : undefined
      if (!image) return
      const sx = frame?.x ?? 0, sy = frame?.y ?? 0
      const sw = frame?.width ?? image.naturalWidth, sh = frame?.height ?? image.naturalHeight
      const scale = (contain ? Math.min : Math.max)(width / sw, height / sh)
      const w = sw * scale, h = sh * scale
      ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, width, height, 10); ctx.clip()
      ctx.drawImage(image, sx, sy, sw, sh, x + (width - w) / 2, y + (height - h) * (contain ? .5 : .2), w, h); ctx.restore()
    }
    text('OVERROLL', 48, 88, layout.width - 96, 26, options.accent, 900)
    text(options.title.toUpperCase(), 48, 142, layout.width - 96, 36, '#ffffff', 900, 24)
    text(options.subtitle ?? `${options.cards.length} ${options.cards.length === 1 ? 'jugador' : 'jugadores'}`, 48, 176, layout.width - 96, 16, '#a4b7cb', 500)
    if (options.design === 'horizontal') options.cards.forEach((card, index) => {
      const x = 48 + index % layout.columns * (layout.cardWidth + 24), y = 222 + Math.floor(index / layout.columns) * (layout.cardHeight + 24)
      const w = layout.cardWidth, h = layout.cardHeight
      ctx.fillStyle = '#101e2e'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 16); ctx.fill()
      ctx.strokeStyle = card.locked ? '#ffcf6b' : card.color; ctx.lineWidth = card.locked ? 2 : 1; ctx.stroke()
      text(String(index + 1).padStart(2, '0'), x + 18, y + 29, 24, 13, card.color, 900)
      text(card.player, x + 52, y + 29, w - 82, 18, '#f4f7fc', 750, 13)
      if (card.alternatives?.length) {
        const candidates = [{ label: card.name, image: card.portrait }, ...card.alternatives.slice(0, 2)]
        candidates.forEach((candidate, i) => {
          const cx = x + 16 + i * 232
          picture(candidate.image, cx, y + 48, 224, h - 102, true)
          text(candidate.label, cx + 8, y + h - 30, 208, 14, '#edf5ff', 750, 11)
        })
      } else {
        picture(card.portrait, x + 12, y + 46, 264, h - 58, card.fit === 'contain', card.frame)
        const fade = ctx.createLinearGradient(x + 228, 0, x + 279, 0); fade.addColorStop(0, '#101e2e00'); fade.addColorStop(1, '#101e2e')
        ctx.fillStyle = fade; ctx.fillRect(x + 228, y + 46, 51, h - 58)
        text(card.name.toUpperCase(), x + 296, y + 83, 398, 27, '#ffffff', 900, 18)
        picture(card.icon, x + 296, y + 101, 20, 20, true)
        text(card.role, x + (card.icon ? 324 : 296), y + 117, card.icon ? 370 : 398, 14, card.color)
        ;(card.details ?? []).slice(0, 8).forEach((detail, i) => {
          const dy = y + 142 + i * 36
          ctx.fillStyle = '#1a2b3d'; ctx.beginPath(); ctx.roundRect(x + 292, dy - 6, 408, 31, 5); ctx.fill()
          picture(detail.image, x + 298, dy - 2, 23, 23, true)
          text(detail.label, x + (detail.image ? 332 : 302), dy + 15, detail.image ? 354 : 384, 12, '#edf5ff', 600)
        })
      }
    })
    else if (options.design === 'bars') options.cards.forEach((card, index) => {
      const x = 48 + index * (layout.cardWidth + 24), y = 258, w = layout.cardWidth, h = layout.cardHeight - 36, slant = 52
      const outline = () => { ctx.beginPath(); ctx.moveTo(x + slant, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - slant, y + h); ctx.lineTo(x, y + h); ctx.closePath() }
      text(String(index + 1).padStart(2, '0'), x + slant, y - 14, 25, 13, card.color, 800)
      text(card.player, x + slant + 32, y - 14, w - slant - 38, 17, '#f4f7fc', 750, 12)
      ctx.save(); outline(); ctx.clip()
      const bg = ctx.createLinearGradient(0, y, 0, y + h); bg.addColorStop(0, '#20394e'); bg.addColorStop(1, '#091522')
      ctx.fillStyle = bg; ctx.fillRect(x, y, w, h)
      ctx.strokeStyle = '#a4bddb14'; ctx.lineWidth = 1
      for (let line = 0; line < w; line += 26) { ctx.beginPath(); ctx.moveTo(x + line, y); ctx.lineTo(x + line, y + h); ctx.stroke() }
      for (let line = 0; line < h; line += 26) { ctx.beginPath(); ctx.moveTo(x, y + line); ctx.lineTo(x + w, y + line); ctx.stroke() }
      const artTop = Math.max(28, Math.min(8, card.details?.length ?? 0) * 38 + 40)
      if (card.alternatives?.length) {
        const candidates = [{ label: card.name, image: card.portrait }, ...card.alternatives.slice(0, 2)]
        const rowHeight = (h - artTop - 110) / candidates.length
        candidates.forEach((candidate, i) => {
          const rowY = y + artTop + i * rowHeight
          picture(candidate.image, x + 22, rowY, w - 44, rowHeight - 28, true)
          text(candidate.label, x + 38, rowY + rowHeight - 9, w - 76, 13, '#edf5ff', 750, 10)
        })
      } else {
        picture(card.portrait, x - 15, y + artTop, w + 30, h - artTop, card.fit === 'contain', card.frame)
        const topFade = ctx.createLinearGradient(0, y + artTop, 0, y + artTop + 48)
        topFade.addColorStop(0, '#20394e'); topFade.addColorStop(1, '#20394e00')
        ctx.fillStyle = topFade; ctx.fillRect(x, y + artTop, w, 48)
      }
      const fade = ctx.createLinearGradient(0, y + h - 180, 0, y + h); fade.addColorStop(0, '#07121f00'); fade.addColorStop(.55, '#07121fee'); fade.addColorStop(1, '#07121f')
      ctx.fillStyle = fade; ctx.fillRect(x, y + h - 180, w, 180)
      ;(card.details ?? []).slice(0, 8).forEach((detail, i) => {
        const dy = y + 10 + i * 38, dx = x + slant + 10 - i * 3
        const cx = i % 2 ? dx + 14 : x + w - 32
        ctx.fillStyle = '#0a1c2fee'; ctx.beginPath(); ctx.arc(cx, dy + 14, 15, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = card.color; ctx.stroke()
        picture(detail.image, cx - 11, dy + 3, 22, 22, true)
        text(detail.label, i % 2 ? dx + 36 : dx, dy + 18, w - slant - 66, 11, '#edf5ff', 650, 9)
      })
      ctx.globalAlpha = .22; picture(card.icon, x + w - slant - 48, y + h - 160, 48, 48, true); ctx.globalAlpha = 1
      text(card.name.toUpperCase(), x + 20, y + h - 66, w - slant - 24, 25, '#ffffff', 900, 16)
      picture(card.icon, x + 20, y + h - 43, 17, 17, true)
      text(card.role, x + 45, y + h - 29, w - slant - 48, 12, card.color, 650)
      ctx.fillStyle = card.color; ctx.fillRect(x, y + h - 4, w, 4)
      ctx.restore(); outline(); ctx.strokeStyle = card.locked ? '#ffcf6b' : card.color; ctx.lineWidth = card.locked ? 3 : 1; ctx.stroke()
      if (card.locked) text('◆', x + w - 22, y - 14, 20, 14, '#ffcf6b')
    })
    else options.cards.forEach((card, index) => {
      const x = 48 + index % layout.columns * (layout.cardWidth + 24)
      const y = 222 + Math.floor(index / layout.columns) * (layout.cardHeight + 24)
      ctx.fillStyle = '#101e2e'; ctx.beginPath(); ctx.roundRect(x, y, layout.cardWidth, layout.cardHeight, 18); ctx.fill()
      ctx.strokeStyle = card.locked ? '#ffca62' : '#29394b'; ctx.lineWidth = card.locked ? 2 : 1; ctx.stroke()
      ctx.fillStyle = card.color; ctx.fillRect(x + 20, y + 22, 4, 23)
      text(String(index + 1).padStart(2, '0'), x + 34, y + 40, 28, 16, card.color, 900)
      text(card.player, x + 74, y + 40, 286, 19, '#f4f7fc', 700, 13)
      ctx.fillStyle = '#172a3e'; ctx.beginPath(); ctx.roundRect(x + 16, y + 62, 352, 320, 12); ctx.fill()
      picture(card.portrait, x + 16, y + 62, 352, 320, card.fit === 'contain', card.frame)
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
        picture(item.image, ax, detailY + 2, 168, 82, true)
        text(item.label, ax + 4, detailY + 106, 160, 12, '#b7cadd')
      })
    })
    text('over-roll.com  /  OverRoll', 48, layout.height - 30, layout.width - 96, 14, '#8197af', 500)
    await downloadCanvasPng(canvas, options.filename)
    return { missingImages: sources.length - images.size }
  } finally {
    if (canvas) { canvas.width = 0; canvas.height = 0 }
    exporting = false
  }
}
