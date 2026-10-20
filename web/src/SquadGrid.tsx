import { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import type { SupportedLocale } from './localization'
import { displayPlayerName, translateUiText } from './uiLocalization'
import { dropTarget, keyboardTarget, showcaseScale, type CardRect } from './squadOrder'
import { squadText } from './squadText'

type Member = { id: string; name: string }
type Props = {
  players: Member[]; onReorder: (sourceId: string, targetId: string) => void; locale: SupportedLocale
  disabled?: boolean; motion: boolean; showcase?: boolean; className: string; style?: CSSProperties; children: ReactNode
}
type Controls = {
  players: Member[]; locale: SupportedLocale; disabled: boolean; hidden: boolean; selected: string | null; hintId: string
  start: (event: PointerEvent<HTMLButtonElement>, index: number) => void
  choose: (index: number) => void; key: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void
}
type Gesture = {
  id: number; source: number; x: number; y: number; lastX: number; lastY: number; active: boolean
  capture: HTMLButtonElement; rects: CardRect[]; gridRect: DOMRect; scale: number; target: number | null; scroll: HTMLElement[]
}
const Context = createContext<Controls | null>(null)

function memberName(players: Member[], index: number, locale: SupportedLocale): string {
  return displayPlayerName(locale, players[index]?.name ?? '', index + 1)
}

export function ReorderHandle({ index }: { index: number }) {
  const controls = useContext(Context)
  if (!controls || controls.hidden || controls.players.length < 2) return null
  const { players, locale, disabled, selected, hintId } = controls
  return <button type="button" className="squad-grip" disabled={disabled} aria-pressed={selected === players[index]?.id}
    aria-label={squadText(locale, 'move', { player: memberName(players, index, locale) })} aria-describedby={hintId}
    title={squadText(locale, 'hint')} onPointerDown={(event) => controls.start(event, index)}
    onClick={() => controls.choose(index)} onKeyDown={(event) => controls.key(event, index)}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {[7, 12, 17].flatMap((y) => [9, 15].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" />))}
    </svg>
  </button>
}

export default function SquadGrid({ players, onReorder, locale, disabled = false, motion, showcase = false, className, style, children }: Props) {
  const grid = useRef<HTMLDivElement>(null)
  const gesture = useRef<Gesture | null>(null)
  const scrollFrame = useRef<number | null>(null)
  const suppressClick = useRef(false)
  const clickTimer = useRef<number | null>(null)
  const before = useRef<Map<string, DOMRect> | null>(null)
  const animations = useRef<Animation[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [message, setMessage] = useState('')
  const hintId = useId()
  const order = players.map((player) => player.id).join('\0')
  const blocked = disabled || showcase || players.length < 2
  const cards = () => Array.from(grid.current?.children ?? []).filter((node): node is HTMLElement => node instanceof HTMLElement)

  function clearGesture() {
    const current = gesture.current
    gesture.current = null
    if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current)
    scrollFrame.current = null
    for (const card of cards()) {
      card.classList.remove('squad-drag-source', 'squad-drop-target')
      card.style.removeProperty('--squad-drag-x')
      card.style.removeProperty('--squad-drag-y')
    }
    if (current?.capture.hasPointerCapture?.(current.id)) current.capture.releasePointerCapture(current.id)
  }

  function cancel() {
    clearGesture()
    setDragging(false)
    setSelected(null)
    setMessage(squadText(locale, 'cancelled'))
  }

  function commit(source: number, target: number) {
    if (blocked || !players[source] || !players[target] || source === target) return
    before.current = new Map(cards().map((card, index) => [players[index].id, card.getBoundingClientRect()]))
    onReorder(players[source].id, players[target].id)
    setSelected(null)
    setMessage(squadText(locale, 'moved', { player: memberName(players, source, locale), position: target + 1, count: players.length }))
  }

  function updatePointer() {
    const current = gesture.current, element = grid.current
    if (!current?.active || !element) return
    const shiftX = element.getBoundingClientRect().left - current.gridRect.left
    const shiftY = element.getBoundingClientRect().top - current.gridRect.top
    const rects = current.rects.map((rect) => ({ left: rect.left + shiftX, right: rect.right + shiftX, top: rect.top + shiftY, bottom: rect.bottom + shiftY }))
    current.target = dropTarget(rects, current.lastX, current.lastY)
    const elements = cards(), source = elements[current.source]
    source?.style.setProperty('--squad-drag-x', `${(current.lastX - current.x - shiftX) / current.scale}px`)
    source?.style.setProperty('--squad-drag-y', `${(current.lastY - current.y - shiftY) / current.scale}px`)
    elements.forEach((card, index) => card.classList.toggle('squad-drop-target', index === current.target && index !== current.source))
  }

  function scrollAtEdge() {
    const current = gesture.current
    if (!current?.active) return
    for (const parent of current.scroll) {
      const rect = parent === document.scrollingElement ? { left: 0, right: window.innerWidth, top: 0, bottom: window.innerHeight } : parent.getBoundingClientRect()
      if (current.lastX < rect.left || current.lastX > rect.right || current.lastY < rect.top || current.lastY > rect.bottom) continue
      if (parent.scrollWidth > parent.clientWidth + 1) parent.scrollLeft += current.lastX < rect.left + 36 ? -12 : current.lastX > rect.right - 36 ? 12 : 0
      if (parent.scrollHeight > parent.clientHeight + 1) parent.scrollTop += current.lastY < rect.top + 36 ? -12 : current.lastY > rect.bottom - 36 ? 12 : 0
    }
    updatePointer()
    scrollFrame.current = window.requestAnimationFrame(scrollAtEdge)
  }

  function start(event: PointerEvent<HTMLButtonElement>, index: number) {
    if (blocked || event.button !== 0 || event.isPrimary === false || !grid.current) return
    clearGesture()
    animations.current.forEach((animation) => animation.cancel())
    event.currentTarget.focus({ preventScroll: true })
    const scroll: HTMLElement[] = []
    for (let parent = grid.current.parentElement; parent; parent = parent.parentElement) {
      const overflow = window.getComputedStyle(parent)
      if (parent === document.scrollingElement || /auto|scroll/.test(overflow.overflowX + overflow.overflowY)) scroll.push(parent)
    }
    gesture.current = { id: event.pointerId, source: index, x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY,
      active: false, capture: event.currentTarget, rects: cards().map((card) => card.getBoundingClientRect()), gridRect: grid.current.getBoundingClientRect(),
      scale: grid.current.getBoundingClientRect().width / grid.current.offsetWidth || 1, target: index, scroll }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current
    if (!current || current.id !== event.pointerId) return
    current.lastX = event.clientX; current.lastY = event.clientY
    if (!current.active && Math.hypot(event.clientX - current.x, event.clientY - current.y) < 6) return
    event.preventDefault()
    if (!current.active) {
      current.active = true
      setSelected(null)
      setDragging(true)
      cards()[current.source]?.classList.add('squad-drag-source')
      scrollFrame.current = window.requestAnimationFrame(scrollAtEdge)
    }
    updatePointer()
  }

  function pointerUp(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current
    if (!current || current.id !== event.pointerId) return
    if (current.active) {
      current.lastX = event.clientX; current.lastY = event.clientY
      updatePointer()
      suppressClick.current = true
      if (clickTimer.current !== null) window.clearTimeout(clickTimer.current)
      clickTimer.current = window.setTimeout(() => { suppressClick.current = false }, 250)
      if (current.target !== null && current.target !== current.source) commit(current.source, current.target)
      else setMessage(squadText(locale, 'cancelled'))
    }
    clearGesture()
    setDragging(false)
  }

  function choose(index: number) {
    if (blocked || suppressClick.current) return
    const source = players.findIndex((player) => player.id === selected)
    if (source === index) { cancel(); return }
    if (source >= 0) { commit(source, index); return }
    setSelected(players[index].id)
    setMessage(squadText(locale, 'selected', { player: memberName(players, index, locale) }))
  }

  function key(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (blocked) return
    const target = keyboardTarget(cards().map((card) => card.getBoundingClientRect()), index, event.key)
    if (target === null) return
    event.preventDefault()
    clearGesture()
    setDragging(false)
    commit(index, target)
  }

  useEffect(() => {
    if (blocked) { clearGesture(); setDragging(false); setSelected(null) }
  }, [blocked])

  useEffect(() => {
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && (gesture.current || selected)) { event.preventDefault(); event.stopPropagation(); cancel() }
    }
    const interrupted = () => { if (gesture.current) cancel() }
    window.addEventListener('keydown', escape)
    window.addEventListener('blur', interrupted)
    window.addEventListener('resize', interrupted)
    return () => { window.removeEventListener('keydown', escape); window.removeEventListener('blur', interrupted); window.removeEventListener('resize', interrupted) }
  }, [selected, locale])

  useLayoutEffect(() => {
    clearGesture()
    setDragging(false)
    setSelected(null)
    animations.current.forEach((animation) => animation.cancel())
    animations.current = []
    const previous = before.current
    before.current = null
    if (!previous || !motion) return
    const scale = grid.current ? grid.current.getBoundingClientRect().width / grid.current.offsetWidth || 1 : 1
    cards().forEach((card, index) => {
      const old = previous.get(players[index].id), next = card.getBoundingClientRect()
      if (!old || typeof card.animate !== 'function') return
      const x = (old.left - next.left) / scale, y = (old.top - next.top) / scale
      if (Math.abs(x) + Math.abs(y) < 1) return
      const base = window.getComputedStyle(card).transform
      animations.current.push(card.animate([{ transform: `translate(${x}px, ${y}px) ${base === 'none' ? '' : base}` }, { transform: base }], { duration: 240, easing: 'cubic-bezier(.2,.75,.25,1)' }))
    })
  }, [order, motion])

  useLayoutEffect(() => {
    const element = grid.current, stage = element?.parentElement
    if (!element || !stage) return
    const fit = () => {
      const desktop = window.matchMedia?.('(min-width: 861px)').matches
      if (!showcase || !desktop) { element.style.removeProperty('--showcase-scale'); return }
      element.style.setProperty('--showcase-scale', String(showcaseScale(element.scrollWidth, element.offsetHeight, stage.clientWidth, stage.clientHeight)))
    }
    fit()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(fit)
    observer?.observe(element); observer?.observe(stage)
    window.addEventListener('resize', fit)
    return () => { observer?.disconnect(); window.removeEventListener('resize', fit); element.style.removeProperty('--showcase-scale') }
  }, [showcase, order])

  useEffect(() => () => {
    clearGesture()
    animations.current.forEach((animation) => animation.cancel())
    if (clickTimer.current !== null) window.clearTimeout(clickTimer.current)
  }, [])

  return <Context.Provider value={{ players, locale, disabled: blocked, hidden: showcase, selected, hintId, start, choose, key }}>
    <div ref={grid} className={`${className} squad-grid${dragging ? ' is-dragging' : ''}${selected ? ' is-choosing-position' : ''}`} role="group" aria-label={translateUiText(locale, 'Escuadra')}
      style={{ ...style, '--showcase-columns': players.length > 6 ? Math.ceil(players.length / 2) : players.length } as CSSProperties}
      onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={cancel} onLostPointerCapture={() => { if (gesture.current) cancel() }} onDragStart={(event) => event.preventDefault()}>
      {children}
    </div>
    <span className="squad-sr-only" id={hintId}>{squadText(locale, 'hint')}</span>
    <span className="squad-sr-only" role="status" aria-live="polite" aria-atomic="true">{message}</span>
  </Context.Provider>
}
