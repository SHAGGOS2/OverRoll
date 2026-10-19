import { useState } from 'react'
import { exportTeamImage, type TeamImageOptions } from './teamImage.ts'

export function useImageExport(notify: (message: string, tone: 'success' | 'info' | 'warning') => void) {
  const [exporting, setExporting] = useState(false)
  async function saveImage(options: TeamImageOptions) {
    if (!options.cards.length) { notify('Primero genera una selección.', 'warning'); return }
    setExporting(true)
    try {
      const result = await exportTeamImage({ ...options, assetBase: import.meta.env.BASE_URL })
      if (result) notify(result.missingImages ? 'Imagen descargada; algunos recursos no estaban disponibles.' : 'Imagen descargada', result.missingImages ? 'info' : 'success')
    } catch { notify('No se pudo descargar la imagen. Inténtalo de nuevo.', 'warning') }
    finally { setExporting(false) }
  }
  return [exporting, saveImage] as const
}
