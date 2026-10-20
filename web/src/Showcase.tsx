import { useEffect, useRef, useState, type RefObject } from 'react'
import type { SupportedLocale } from './localization'
import { squadText } from './squadText'

export function useShowcase(view: string, game: string) {
  const [enabled, setEnabled] = useState(false)
  const returnFocus = useRef<HTMLElement | null>(null)
  const returnScroll = useRef({ x: 0, y: 0, panels: [] as Array<{ element: HTMLElement; left: number; top: number }> })
  const exitRef = useRef<HTMLButtonElement>(null)

  function enter() {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    returnScroll.current = { x: window.scrollX, y: window.scrollY, panels: Array.from(document.querySelectorAll<HTMLElement>('.workspace, .workspace > .content, .team-stage')).map((element) => ({ element, left: element.scrollLeft, top: element.scrollTop })) }
    setEnabled(true)
  }
  function exit() { setEnabled(false) }

  useEffect(() => { setEnabled(false) }, [view, game])
  useEffect(() => {
    if (!enabled) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focus = window.requestAnimationFrame(() => exitRef.current?.focus({ preventScroll: true }))
    const keydown = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); setEnabled(false) } }
    window.addEventListener('keydown', keydown)
    return () => {
      window.cancelAnimationFrame(focus)
      window.removeEventListener('keydown', keydown)
      document.body.style.overflow = previousOverflow
      for (const panel of returnScroll.current.panels) if (panel.element.isConnected) { panel.element.scrollLeft = panel.left; panel.element.scrollTop = panel.top }
      window.scrollTo(returnScroll.current.x, returnScroll.current.y)
      if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true })
    }
  }, [enabled])
  return { enabled, enter, exit, exitRef }
}

export function ShowcaseButton({ locale, onClick, disabled = false }: { locale: SupportedLocale; onClick: () => void; disabled?: boolean }) {
  return <button type="button" className="showcase-button" onClick={onClick} disabled={disabled}>
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /><path d="M8 8h8v8H8z" /></svg>
    <span>{squadText(locale, 'showcase')}</span>
  </button>
}

export function ShowcaseHeader({ locale, game, logo, onExit, exitRef }: { locale: SupportedLocale; game: string; logo: string; onExit: () => void; exitRef: RefObject<HTMLButtonElement | null> }) {
  return <header className="showcase-header">
    <div className="showcase-brand"><img src={logo} alt="" /><div><span>OverRoll</span><h1 translate="no">{game}</h1></div></div>
    <button type="button" ref={exitRef} className="showcase-exit" onClick={onExit}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>
      <span>{squadText(locale, 'exit')}</span><kbd>Esc</kbd>
    </button>
  </header>
}
