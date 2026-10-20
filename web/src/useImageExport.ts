import { useState } from 'react'
import type { SupportedLocale } from './localization'
import { translateGameText, translateUiText, localizedPlayerName, isDefaultPlayerName } from './uiLocalization'
import { exportTeamImage, type TeamImageOptions } from './teamImage.ts'

export function useImageExport(notify: (message: string, tone: 'success' | 'info' | 'warning') => void, locale: SupportedLocale = 'es-mx', gameId = '') {
  const [exporting, setExporting] = useState(false)
  async function saveImage(options: TeamImageOptions) {
    if (!options.cards.length) { notify('Primero genera una selección.', 'warning'); return }
    setExporting(true)
    try {
      const tr = (value: string) => translateGameText(gameId, locale, value)
      const result = await exportTeamImage({ ...options, title: tr(options.title), subtitle: options.subtitle ? tr(options.subtitle) : translateUiText(locale, `${options.cards.length} ${options.cards.length === 1 ? 'jugador' : 'jugadores'}`), cards: options.cards.map((card, index) => ({ ...card, player: isDefaultPlayerName(card.player, index + 1) ? localizedPlayerName(locale, index + 1) : card.player, name: tr(card.name), role: tr(card.role), details: card.details?.map((detail) => ({ ...detail, label: tr(detail.label) })), alternatives: card.alternatives?.map((item) => ({ ...item, label: tr(item.label) })) })), assetBase: import.meta.env.BASE_URL })
      if (result) notify(result.missingImages ? 'Imagen descargada; algunos recursos no estaban disponibles.' : 'Imagen descargada', result.missingImages ? 'info' : 'success')
    } catch { notify('No se pudo descargar la imagen. Inténtalo de nuevo.', 'warning') }
    finally { setExporting(false) }
  }
  return [exporting, saveImage] as const
}
