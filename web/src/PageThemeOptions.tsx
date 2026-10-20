import type { SupportedLocale } from './localization'
import { translateUiText } from './uiLocalization'
import { pageThemes, type PageTheme } from './pageTheme'

export function TokkiMark({ className = '', src = '/assets/themes/tokki-logo.png' }: { className?: string; src?: string }) {
  return <img className={`tokki-mark ${className}`} src={src} alt="" aria-hidden="true" draggable={false} />
}

type Props = { value: PageTheme; onChange: (value: PageTheme) => void; locale: SupportedLocale; asset?: (path: string) => string }
export default function PageThemeOptions({ value, onChange, locale, asset = (path) => '/' + path }: Props) {
  const tr = (text: string) => translateUiText(locale, text)
  return <div className="page-theme-options">
    <div className="page-theme-choices">
      {pageThemes.map((theme) => <label className={`page-theme-choice ${value === theme.id ? 'selected' : ''}`} key={theme.id}>
        <input type="radio" name="page-theme" value={theme.id} checked={value === theme.id} onChange={() => onChange(theme.id)} />
        <span className={`page-theme-preview theme-preview-${theme.id}`} aria-hidden="true">
          <span className="theme-preview-top"><i /><i /><i /></span>
          <span className="theme-preview-sidebar"><i /><i /><i /><i /></span>
          <span className="theme-preview-content"><i /><span /><span /><span /></span>
          {theme.id === 'tokki' && <TokkiMark src={asset('assets/themes/tokki-logo.png')} />}
          {theme.id === 'hacker' && <b className="theme-terminal-cursor">_</b>}
        </span>
        <span className="card-design-caption"><strong>{tr(theme.label)}</strong><span className="card-design-radio" aria-hidden="true" /></span>
      </label>)}
    </div>
    <button type="button" className="theme-reset" disabled={value === 'default'} onClick={() => onChange('default')}>{tr('Diseño original')}</button>
  </div>
}

export function ThemeBackdrop({ theme, asset = (path) => '/' + path }: { theme: PageTheme; asset?: (path: string) => string }) {
  return theme === 'default' ? null : <div className={`theme-backdrop backdrop-${theme}`} aria-hidden="true">{theme === 'tokki' && <TokkiMark src={asset('assets/themes/tokki-logo.png')} />}</div>
}
