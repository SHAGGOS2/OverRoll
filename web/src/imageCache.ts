const resolvedImages = new Set<string>()
const pendingImages = new Map<string, Promise<void>>()

function normalizedUrl(url: string): string {
  try {
    return new URL(url, window.location.href).href
  } catch {
    return url
  }
}

export function preloadImage(url: string): Promise<void> {
  if (!url) return Promise.resolve()
  const key = normalizedUrl(url)
  if (resolvedImages.has(key)) return Promise.resolve()
  const current = pendingImages.get(key)
  if (current) return current

  const promise = new Promise<void>((resolve) => {
    const image = new Image()
    image.decoding = 'async'
    image.loading = 'eager'
    image.onload = () => {
      const finish = () => {
        resolvedImages.add(key)
        pendingImages.delete(key)
        resolve()
      }
      if (typeof image.decode === 'function') {
        void image.decode().then(finish).catch(finish)
      } else {
        finish()
      }
    }
    image.onerror = () => {
      pendingImages.delete(key)
      resolve()
    }
    image.src = key
  })

  pendingImages.set(key, promise)
  return promise
}

export async function preloadImages(urls: string[], timeoutMs = 3500): Promise<void> {
  const unique = [...new Set(urls.filter(Boolean))]
  if (!unique.length) return
  const preload = Promise.all(unique.map((url) => preloadImage(url))).then(() => undefined)
  const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, timeoutMs))
  await Promise.race([preload, timeout])
}

export function warmImageCache(urls: string[], batchSize = 8): void {
  const queue = [...new Set(urls.filter(Boolean))]
  let cursor = 0
  const runBatch = () => {
    const batch = queue.slice(cursor, cursor + batchSize)
    cursor += batchSize
    batch.forEach((url) => void preloadImage(url))
    if (cursor < queue.length) window.setTimeout(runBatch, 40)
  }
  window.setTimeout(runBatch, 0)
}
