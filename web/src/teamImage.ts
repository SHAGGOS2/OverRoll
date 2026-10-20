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
    const columns = Math.min(3, Math.max(1, count)), rows = Math.ceil(count / columns)
    const cardWidth = 600, cardHeight = 240 + Math.max(0, Math.min(8, detailCount) - 2) * 32 + (alternatives ? 60 : 0)
    return { columns, rows, cardWidth, cardHeight, width: 96 + columns * cardWidth + (columns - 1) * 24, height: 222 + rows * cardHeight + (rows - 1) * 24 + 80 }
  }
  if (design === 'hex' || design === 'orbit') {
    const columns = Math.min(3, Math.max(1, count)), rows = Math.ceil(count / columns), cardWidth = 320
    const cardHeight = (design === 'orbit' && alternatives ? 470 : 430) + Math.min(8, detailCount) * 40
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
      const scale = layout.cardWidth / 720, w = 720, h = layout.cardHeight / scale
      ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.translate(-x, -y)
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
      ctx.restore()
    })
    else if (options.design === 'hex' || options.design === 'orbit') options.cards.forEach((card, index) => {
      const x = 48 + index % layout.columns * (layout.cardWidth + 24), y = 222 + Math.floor(index / layout.columns) * (layout.cardHeight + 24)
      const orbit = options.design === 'orbit', border = card.locked ? '#ffcf6b' : card.color
      const details = (card.details ?? []).slice(0, 8)
      const candidates = card.alternatives?.length ? [{ label: card.name, image: card.portrait }, ...card.alternatives.slice(0, 2)] : undefined
      const center = (label: string, ty: number, width: number, size: number, color = '#f4f7fc', weight = 700, minSize = size) => {
        ctx.save(); ctx.textAlign = 'center'; text(label, x + 160, ty, width, size, color, weight, minSize); ctx.restore()
      }
      const hexagon = (px: number, py: number, w: number, h: number) => {
        ctx.beginPath(); ctx.moveTo(px + w / 2, py); ctx.lineTo(px + w, py + h * .18); ctx.lineTo(px + w, py + h * .82)
        ctx.lineTo(px + w / 2, py + h); ctx.lineTo(px, py + h * .82); ctx.lineTo(px, py + h * .18); ctx.closePath()
      }
      const portrait = (src: string | undefined, px: number, py: number, w: number, h: number, frame?: PortraitFrame) => {
        ctx.save()
        if (orbit) { ctx.beginPath(); ctx.arc(px + w / 2, py + h / 2, w / 2, 0, Math.PI * 2) }
        else hexagon(px, py, w, h)
        ctx.fillStyle = '#1a3044'; ctx.fill(); ctx.clip(); picture(src, px, py, w, h, candidates ? true : card.fit === 'contain', frame); ctx.restore()
      }
      const detailTop = orbit && candidates ? 370 : orbit ? 340 : 360
      if (orbit) {
        const cy = y + (candidates ? 165 : 143), radius = candidates ? 149 : 133
        ctx.strokeStyle = border; ctx.lineWidth = 1; ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.arc(x + 160, cy, radius, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([])
        ctx.lineWidth = 3
        for (const angle of [-.85, 2.3]) { ctx.beginPath(); ctx.arc(x + 160, cy, radius - 7, angle, angle + 1.15); ctx.stroke() }
        if (candidates) candidates.forEach((candidate, i) => {
          const px = i === 0 ? x + 105 : i === 1 ? x + 29 : x + 181, py = y + (i === 0 ? 16 : 167)
          portrait(candidate.image, px, py, 110, 110)
          ctx.save(); ctx.textAlign = 'center'; text(candidate.label, px + 55, py + 132, 137, 13, '#edf5ff', 750, 10); ctx.restore()
        })
        else portrait(card.portrait, x + 43, y + 26, 234, 234, card.frame)
        const plaqueY = y + (candidates ? 318 : 243), plaqueH = candidates ? 41 : 80
        ctx.fillStyle = '#101e2e'; ctx.beginPath(); ctx.roundRect(x + 17, plaqueY, 286, plaqueH, 22); ctx.fill(); ctx.strokeStyle = border; ctx.lineWidth = 1; ctx.stroke()
        if (candidates) center(card.role, plaqueY + 25, 262, 13, card.color)
        else { center(card.name.toUpperCase(), plaqueY + 31, 262, 24, '#ffffff', 900, 14); center(card.role, plaqueY + 57, 254, 13, card.color) }
        ctx.fillStyle = '#101e2e'; ctx.beginPath(); ctx.arc(x + 48, y + 51, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
        ctx.save(); ctx.textAlign = 'center'; text(String(index + 1).padStart(2, '0'), x + 48, y + 56, 30, 12, card.color, 800); ctx.restore()
        if (card.icon) { ctx.beginPath(); ctx.arc(x + 274, y + 57, 21, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); picture(card.icon, x + 262, y + 45, 24, 24, true) }
      } else {
        hexagon(x + 4, y, 312, 350); ctx.fillStyle = '#101e2e'; ctx.fill(); ctx.strokeStyle = border; ctx.lineWidth = card.locked ? 3 : 1.5; ctx.stroke()
        if (candidates) {
          candidates.forEach((candidate, i) => {
            const left = i % 2 === 0, py = y + 43 + i * 74
            portrait(candidate.image, x + (left ? 17 : 233), py, 70, 70)
            ctx.save(); ctx.textAlign = left ? 'left' : 'right'; text(candidate.label, x + (left ? 98 : 222), py + 42, 190, 14, '#edf5ff', 750, 10); ctx.restore()
          })
          center(card.role, y + 294, 250, 13, card.color)
        } else {
          portrait(card.portrait, x + 8, y + 4, 304, 342, card.frame)
          ctx.save(); hexagon(x + 8, y + 4, 304, 342); ctx.clip()
          const fade = ctx.createLinearGradient(0, y + 170, 0, y + 325); fade.addColorStop(0, '#07121f00'); fade.addColorStop(.7, '#07121ff2'); fade.addColorStop(1, '#07121f')
          ctx.fillStyle = fade; ctx.fillRect(x + 8, y + 170, 304, 176); ctx.restore()
          text(card.name.toUpperCase(), x + 33, y + 262, 254, 26, '#ffffff', 900, 15)
          text(card.role, x + 33, y + 285, 254, 13, card.color)
          if (card.icon) { hexagon(x + 17, y + 85, 42, 44); ctx.fillStyle = '#101e2e'; ctx.fill(); picture(card.icon, x + 27, y + 96, 22, 22, true) }
        }
        center(String(index + 1).padStart(2, '0'), y + 26, 40, 12, card.color, 800)
      }
      details.forEach((detail, i) => {
        const dx = x + (orbit ? i % 2 ? 24 : 6 : 9), dy = y + detailTop + i * 40, w = orbit ? 290 : 302
        ctx.fillStyle = '#13283a'; ctx.strokeStyle = border; ctx.lineWidth = 1
        ctx.beginPath()
        if (orbit) ctx.roundRect(dx, dy, w, 34, 17)
        else { ctx.moveTo(dx + 9, dy); ctx.lineTo(dx + w, dy); ctx.lineTo(dx + w, dy + 25); ctx.lineTo(dx + w - 9, dy + 34); ctx.lineTo(dx, dy + 34); ctx.lineTo(dx, dy + 9); ctx.closePath() }
        ctx.fill(); ctx.stroke()
        picture(detail.image, dx + 6, dy + 5, 24, 24, true)
        text(detail.label, dx + (detail.image ? 38 : 12), dy + 22, w - (detail.image ? 48 : 24), 12, '#edf5ff', 600, 10)
      })
      const playerY = y + detailTop + details.length * 40 + 25
      ctx.strokeStyle = border; ctx.lineWidth = 1; ctx.beginPath()
      if (orbit) { ctx.moveTo(x + 65, playerY - 9); ctx.lineTo(x + 255, playerY - 9) }
      else { ctx.moveTo(x + 10, playerY - 7); ctx.lineTo(x + 10, playerY + 23) }
      ctx.stroke()
      if (orbit) center(card.player, playerY + 15, 264, 17, '#f4f7fc', 750, 12)
      else text(card.player, x + 22, playerY + 15, 269, 17, '#f4f7fc', 750, 12)
      if (card.locked) text('◆', x + 298, playerY + 15, 18, 12, '#ffcf6b')
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
