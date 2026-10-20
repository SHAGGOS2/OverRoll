import type { SupportedLocale } from './localization'
import { translateUiText } from './uiLocalization'
import { pageThemes, type PageTheme } from './pageTheme'

export function TokkiMark({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" aria-hidden="true">
    <path d="m67 64-7-38 14 7 12 26m47 5 7-38-14 7-12 26M65 68l-27 12-16 34 15 7 15-22 7 36m76-67 27 12 16 34-15 7-15-22-7 36" />
    <path d="m63 65 21-10h32l21 10 10 37-9 37-23 17H85l-23-17-9-37 10-37Z" />
    <path d="m77 74 13-6h20l13 6 9 27-13 21H81l-13-21 9-27Z" /><path d="m79 86 13 5m29-5-13 5m-14 15 6 4 6-4M69 143l-16 22-4 18h31l12-25m39-15 16 22 4 18h-31l-12-25M22 114l-6 16 19 6 9-15m134-7 6 16-19 6-9-15M58 128l16 3m68-3-16 3M94 136h12" />
    <path d="M14 66V49h17m155 17V49h-17M14 151v17h17m155-17v17h-17" opacity=".5" />
  </svg>
}

type Props = { value: PageTheme; onChange: (value: PageTheme) => void; locale: SupportedLocale }
export default function PageThemeOptions({ value, onChange, locale }: Props) {
  const tr = (text: string) => translateUiText(locale, text)
  return <div className="page-theme-options">
    <div className="page-theme-choices">
      {pageThemes.map((theme) => <label className={`page-theme-choice ${value === theme.id ? 'selected' : ''}`} key={theme.id}>
        <input type="radio" name="page-theme" value={theme.id} checked={value === theme.id} onChange={() => onChange(theme.id)} />
        <span className={`page-theme-preview theme-preview-${theme.id}`} aria-hidden="true">
          <span className="theme-preview-top"><i /><i /><i /></span>
          <span className="theme-preview-sidebar"><i /><i /><i /><i /></span>
          <span className="theme-preview-content"><i /><span /><span /><span /></span>
          {theme.id === 'tokki' && <TokkiMark />}
          {theme.id === 'hacker' && <b className="theme-terminal-cursor">_</b>}
        </span>
        <span className="card-design-caption"><strong>{tr(theme.label)}</strong><span className="card-design-radio" aria-hidden="true" /></span>
      </label>)}
    </div>
    <button type="button" className="theme-reset" disabled={value === 'default'} onClick={() => onChange('default')}>{tr('Diseño original')}</button>
  </div>
}

export function ThemeBackdrop({ theme }: { theme: PageTheme }) {
  return theme === 'default' ? null : <div className={`theme-backdrop backdrop-${theme}`} aria-hidden="true">{theme === 'tokki' && <TokkiMark />}</div>
}
