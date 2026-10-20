import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
type Props = { open: boolean; enabled: boolean; onClose: () => void; className?: string; children: ReactNode }
export default function AnimatedLayer({ open, enabled, onClose, className = 'filter-layer', children }: Props) {
  const [mounted, setMounted] = useState(open), [closing, setClosing] = useState(false)
  const content = useRef(children), layer = useRef<HTMLDivElement>(null), close = useRef(onClose)
  close.current = onClose
  if (open && children) content.current = children
  useEffect(() => {
    if (open) { setMounted(true); setClosing(false); return }
    if (!mounted) return
    const reduce = !enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setClosing(true)
    const timer = window.setTimeout(() => { setMounted(false); setClosing(false) }, reduce ? 0 : 170)
    return () => window.clearTimeout(timer)
  }, [open, mounted, enabled])
  useLayoutEffect(() => {
    if (!mounted || !open) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusable = () => Array.from(layer.current?.querySelectorAll<HTMLElement>('input, select, button, a[href], [tabindex="0"]') ?? []).filter((element) => !element.hasAttribute('disabled') && element.getClientRects().length > 0)
    const frame = requestAnimationFrame(() => (layer.current?.querySelector<HTMLElement>('[data-initial-focus], input:not([type="checkbox"])') ?? focusable()[0] ?? layer.current)?.focus())
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close.current() }
      if (event.key !== 'Tab') return
      const elements = focusable(), first = elements[0], last = elements.at(-1)
      if (!first) { event.preventDefault(); return }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === layer.current)) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', keydown, true)
    return () => { cancelAnimationFrame(frame); document.removeEventListener('keydown', keydown, true); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus() }
  }, [mounted, open])
  if (!mounted) return null
  return <div ref={layer} className={`${className} animated-layer ${closing ? 'is-closing' : 'is-opening'} ${enabled ? '' : 'motion-off'}`} role="presentation" tabIndex={-1} aria-hidden={closing || undefined} inert={closing || undefined} onMouseDown={(event) => { if (event.target === event.currentTarget) close.current() }}>{open ? children : content.current}</div>
}
