/** Raster-only downloads. Catalog URLs never become arbitrary network requests. */
export const MAX_IMAGE_PIXELS = 24_000_000
export const MAX_EXPORT_PIXELS = 16_000_000
export const IMAGE_TIMEOUT_MS = 8000

export function safeAssetUrl(path: unknown, base = '/', origin = window.location.origin): string {
  if (typeof path !== 'string' || !path || (/[\\]/u.test(path) || Array.from(path).some((char) => char.codePointAt(0)! <= 32)) || path.startsWith('//')) return ''
  try {
    const root = new URL(base, origin)
    const url = new URL(path, root)
    if (url.origin !== origin || !/^https?:$/.test(url.protocol) || url.username || url.password || url.search || url.hash) return ''
    if (!url.pathname.startsWith(`${root.pathname.replace(/\/$/, '')}/assets/`)) return ''
    if (!/\.(?:png|jpe?g|webp|svg|gif)$/i.test(url.pathname)) return ''
    return url.href
  } catch { return '' }
}

export function loadExportImage(src: string, timeoutMs = IMAGE_TIMEOUT_MS, base = '/'): Promise<HTMLImageElement> {
  const url = safeAssetUrl(src, base)
  if (!url) return Promise.reject(new Error('Recurso de imagen no permitido'))
  return new Promise((resolve, reject) => {
    const image = new Image()
    let finished = false
    const finish = (error?: Error) => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      image.onload = null
      image.onerror = null
      if (error) { image.removeAttribute('src'); reject(error) } else resolve(image)
    }
    const timer = setTimeout(() => finish(new Error('Tiempo de carga agotado')), timeoutMs)
    image.decoding = 'async'
    image.onload = () => {
      const pixels = image.naturalWidth * image.naturalHeight
      finish(pixels > 0 && pixels <= MAX_IMAGE_PIXELS ? undefined : new Error('Dimensiones de imagen no permitidas'))
    }
    image.onerror = () => finish(new Error('No se pudo cargar la imagen'))
    image.src = url
  })
}

export function safePngFilename(value: string): string {
  return `${value.replace(/\.png$/i, '').replace(/[^a-z0-9_-]/gi, '-').replace(/-+/g, '-').slice(0, 96) || 'overroll'}.png`
}

export function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  if (!(canvas.width > 0 && canvas.height > 0) || canvas.width * canvas.height > MAX_EXPORT_PIXELS) return Promise.reject(new Error('Tamaño de exportación no permitido'))
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('No se pudo terminar la imagen')), 15000)
    try {
      canvas.toBlob((blob) => {
        clearTimeout(timer)
        if (!blob || blob.type !== 'image/png' || !blob.size || blob.size > 32_000_000) reject(new Error('PNG no válido'))
        else resolve(blob)
      }, 'image/png')
    } catch (error) { clearTimeout(timer); reject(error) }
  })
}

export async function downloadCanvasPng(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  const blob = await canvasToPng(canvas)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  try {
    anchor.href = url
    anchor.download = safePngFilename(filename)
    anchor.hidden = true
    document.body.appendChild(anchor)
    anchor.click()
  } finally {
    anchor.remove()
    // Allow download initiation before releasing the blob; release even on click failure.
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
