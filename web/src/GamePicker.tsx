import { useId, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import AnimatedLayer from './AnimatedLayer'
import { translate, type SupportedLocale } from './localization'
import { translateUiText } from './uiLocalization'

export type PickerGame<Id extends string> = { id: Id; name: string; icon: string; accent: string; available: boolean }
type CatalogProps<Id extends string> = {
  games: PickerGame<Id>[]; activeGame: Id; locale: SupportedLocale; id: string
  asset: (path: string) => string; onChoose: (game: Id) => void; onClose: () => void
}
type Props<Id extends string> = Omit<CatalogProps<Id>, 'id' | 'onChoose' | 'onClose'> & {
  animationsEnabled: boolean; onGameChange: (game: Id) => void
  onMenuToggle: (open: boolean) => void; onHover: () => void
}

export function GameCatalog<Id extends string>({ games, activeGame, locale, id, asset, onChoose, onClose }: CatalogProps<Id>) {
  const current = games.find((game) => game.id === activeGame)
  function moveFocus(event: KeyboardEvent<HTMLButtonElement>) {
    const buttons = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button[data-game-id]:not(:disabled)') ?? [])
    const index = buttons.indexOf(event.currentTarget)
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : event.key === 'ArrowRight' ? (index + 1) % buttons.length : event.key === 'ArrowLeft' ? (index + buttons.length - 1) % buttons.length : undefined
    if (next === undefined || !buttons.length) return
    event.preventDefault(); buttons[next]?.focus()
  }
  return <section className="game-picker-dialog" role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} id={id} style={{ '--picker-accent': current?.accent ?? '#f5bd55' } as CSSProperties}>
    <header className="game-picker-heading">
      <h2 id={`${id}-title`}>{translate(locale, 'tab_games')}</h2>
      <button type="button" className="game-picker-close" aria-label={translateUiText(locale, 'Cerrar')} onClick={onClose}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
    </header>
    <div className="game-picker-grid">
      {games.map((game) => <button type="button" data-game-id={game.id} className={`game-picker-tile ${game.id === activeGame ? 'selected' : ''}`} style={{ '--tile-accent': game.accent } as CSSProperties} key={game.id} disabled={!game.available} data-initial-focus={game.id === activeGame || undefined} aria-pressed={game.id === activeGame} onKeyDown={moveFocus} onClick={() => { if (game.available) onChoose(game.id) }}>
        <span className="game-picker-tile-icon">{game.icon && <img src={asset(game.icon)} alt="" aria-hidden="true" />}</span>
        <strong translate="no">{game.name}</strong>
        <span className="game-picker-selected" aria-hidden="true">{game.id === activeGame && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 4 4L19 6" /></svg>}</span>
      </button>)}
    </div>
  </section>
}

export default function GamePicker<Id extends string>({ games, activeGame, locale, asset, animationsEnabled, onGameChange, onMenuToggle, onHover }: Props<Id>) {
  const id = useId(), [open, setOpen] = useState(false)
  const current = games.find((game) => game.id === activeGame) ?? games[0]
  function close() { setOpen(false); onMenuToggle(false) }
  function choose(id: Id) {
    if (!games.some((game) => game.id === id && game.available)) return
    setOpen(false)
    if (id !== activeGame) onGameChange(id)
    else onMenuToggle(false)
  }
  return <>
    <button type="button" className="topbar-game-picker" aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined} onMouseEnter={onHover} onClick={() => { setOpen(true); onMenuToggle(true) }}>
      {current && <img className="topbar-game-icon" src={asset(current.icon)} alt="" aria-hidden="true" />}
      <span className="topbar-game-copy"><small>{translate(locale, 'tab_games')}</small><strong translate="no">{current?.name}</strong></span>
      <svg className="topbar-picker-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </button>
    {typeof document !== 'undefined' && createPortal(<AnimatedLayer open={open} enabled={animationsEnabled} onClose={close} className="game-picker-layer"><GameCatalog games={games} activeGame={activeGame} locale={locale} id={id} asset={asset} onChoose={choose} onClose={close} /></AnimatedLayer>, document.body)}
  </>
}
