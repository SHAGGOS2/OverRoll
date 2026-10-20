import { useId, type KeyboardEvent, type ReactNode } from 'react'
import type { SupportedLocale } from './localization'
import { translateUiText } from './uiLocalization'
type Tab = 'squad' | 'rules'
type Props = { className: string; locale: SupportedLocale; open: boolean; activeTab: Tab; onToggle: () => void; onTabChange: (tab: Tab) => void; children: ReactNode }
export default function GameSidebar({ className, locale, open, activeTab, onToggle, onTabChange, children }: Props) {
  const id = useId(), tr = (label: string) => translateUiText(locale, label)
  const tabs: Tab[] = ['squad', 'rules']
  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, tab: Tab) {
    const index = tabs.indexOf(tab)
    const next = event.key === 'ArrowRight' || event.key === 'ArrowLeft' ? tabs[1 - index] : event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[1] : undefined
    if (!next) return
    event.preventDefault(); onTabChange(next)
    event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-tab="${next}"]`)?.focus()
  }
  return <aside className={`${className} standard-sidebar`}>
    <div className="sidebar-head">
      <strong><span className="configuration-mark" aria-hidden="true"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 6h16M4 12h16M4 18h16M9 3v6m6 0v6m-6 0v6" /></svg></span>{tr('Configuración')}</strong>
      <button type="button" className="mobile-config-toggle" aria-expanded={open} aria-controls={open ? id : undefined} onClick={onToggle}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{open ? <path d="m6 6 12 12M18 6 6 18" /> : <><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="9" cy="6" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="9" cy="18" r="2" /></>}</svg>
        <span>{tr(open ? 'Ocultar' : 'Editar')}</span>
      </button>
    </div>
    {open && <div className="mobile-config-tabs" role="tablist" aria-label={tr('Apartados de configuración')} id={id}>
      {tabs.map((tab) => <button type="button" role="tab" data-tab={tab} key={tab} aria-selected={activeTab === tab} tabIndex={activeTab === tab ? 0 : -1} className={activeTab === tab ? 'active' : ''} onClick={() => onTabChange(tab)} onKeyDown={(event) => onTabKey(event, tab)}>{tr(tab === 'squad' ? 'Escuadra' : 'Reglas')}</button>)}
    </div>}
    {children}
  </aside>
}
