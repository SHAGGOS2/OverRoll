import type { CSSProperties } from 'react'
import GamePicker from './GamePicker'
import { translate, type SupportedLocale } from './localization'

type View = 'principal' | 'roulette' | 'profiles' | 'more'
type Game<Id extends string> = { id: Id; name: string; icon: string; accent: string; available: boolean }
type Props<Id extends string> = {
  games: Game<Id>[]; activeGame: Id; activeView: View; locale: SupportedLocale
  animationsEnabled: boolean; onMenuToggle: (open: boolean) => void
  logoSrc: string; asset: (path: string) => string
  onGameChange: (game: Id) => void; onNavigate: (view: View) => void; onHover: () => void
}

export default function AppHeader<Id extends string>({ games, activeGame, activeView, locale, logoSrc, asset, onGameChange, onNavigate, onHover, animationsEnabled, onMenuToggle }: Props<Id>) {
  const currentGame = games.find((game) => game.id === activeGame) ?? games[0]
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key)
  const tabs: Array<{ id: View; label: string; path: string }> = [
    { id: 'principal', label: t('nav_home'), path: 'M6 8h12a3 3 0 0 1 3 3v5a2 2 0 0 1-3.4 1.4L15 15H9l-2.6 2.4A2 2 0 0 1 3 16v-5a3 3 0 0 1 3-3ZM7 10v4m-2-2h4m7-1h.01M18 13h.01' },
    { id: 'roulette', label: t('nav_roulette'), path: 'M21 12a9 9 0 1 1-3-6.7M12 3v5m0 8v5M3 12h5m8 0h5M5.6 5.6l3.6 3.6m5.6 5.6 3.6 3.6M5.6 18.4l3.6-3.6M17 3h4v4m-4-4-4 7' },
    { id: 'profiles', label: t('nav_profiles'), path: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2' },
    { id: 'more', label: t('nav_more'), path: 'M4 6h16M4 12h16M4 18h16M9 3v6m6 0v6m-6 0v6' },
  ]
  return <header className="topbar" style={{ '--active-accent': currentGame?.accent ?? '#f5bd55' } as CSSProperties}>
    <button type="button" className="brand" onMouseEnter={onHover} onClick={() => onNavigate('principal')} aria-label={t('nav_home')}>
      <span className="brand-mark"><img src={logoSrc} alt="" /></span>
      <span className="brand-copy"><strong>OverRoll</strong></span>
    </button>
    <GamePicker games={games} activeGame={activeGame} locale={locale} asset={asset} animationsEnabled={animationsEnabled} onGameChange={onGameChange} onMenuToggle={onMenuToggle} onHover={onHover} />
    <nav aria-label="OverRoll">
      {tabs.map((tab) => <button type="button" key={tab.id} className={activeView === tab.id ? 'nav-active' : ''} aria-current={activeView === tab.id ? 'page' : undefined} onMouseEnter={onHover} onClick={() => onNavigate(tab.id)}>
        <svg className="topbar-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={tab.path} /></svg>
        <span>{tab.label}</span>
      </button>)}
    </nav>
  </header>
}
