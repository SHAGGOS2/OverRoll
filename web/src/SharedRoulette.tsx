import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { SupportedLocale } from './localization'
import { localizeUi, translateGameText } from './uiLocalization'
import { safeAssetUrl } from './imageExport'
import { useImageExport } from './useImageExport'
import { restoreRouletteState, normalizeWeight, randomTicket, rotationForSegment, sectorPath, weightedSegments, winnerForTicket } from './rouletteModel'
import { fragpunkPortraitFrames } from './portraitFrames'
export type RouletteItem = { key: string; name: string; role: string; portrait: string; icon?: string }
export type RouletteRole = { id: string; label: string; color: string; icon?: string }
type Props = { gameId: string; title: string; items: RouletteItem[]; roles: RouletteRole[]; storagePrefix: string; legacySelectionKey?: string; baseUrl: string; locale: SupportedLocale; animationsEnabled: boolean; onSpin?: () => void; onWin?: () => void; notify: (message: string, tone?: 'success' | 'info' | 'warning') => void }
type Saved = { selected: string[]; weights: Record<string, number>; catalog: string[] }
function readSaved(prefix: string, legacyKey: string | undefined, items: RouletteItem[]): Saved {
  try {
    const raw = JSON.parse(localStorage.getItem(`${prefix}.wheel`) ?? 'null')
    const legacy = JSON.parse(localStorage.getItem(`${prefix}.${legacyKey ?? 'rouletteSelected'}`) ?? 'null')
    const weights = JSON.parse(localStorage.getItem(`${prefix}.rouletteWeights`) ?? '{}')
    let legacyRoles: Record<string, unknown> | undefined
    if (!raw && prefix === 'overroll.web') {
      const roles = JSON.parse(localStorage.getItem(`${prefix}.rouletteRolesEnabled`) ?? 'null')
      if (roles && typeof roles === 'object' && !Array.isArray(roles)) legacyRoles = roles
    }
    if (!raw && prefix === 'overroll.web.pvz') {
      const side = JSON.parse(localStorage.getItem(`${prefix}.rouletteSide`) ?? 'null')
      if (side === 'plants' || side === 'zombies') legacyRoles = { plants: side === 'plants', zombies: side === 'zombies' }
    }
    return restoreRouletteState(items, raw, legacy, weights, legacyRoles)
  } catch { return restoreRouletteState(items, null, null, {}) }
}

export default function SharedRoulette({ gameId, title, items, roles, storagePrefix, legacySelectionKey, baseUrl, locale, animationsEnabled, onSpin, onWin, notify }: Props) {
  const [saved, setSaved] = useState(() => readSaved(storagePrefix, legacySelectionKey, items))
  const [search, setSearch] = useState(''), [role, setRole] = useState('all')
  const [spinning, setSpinning] = useState(false), [winnerKey, setWinnerKey] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const rotor = useRef<SVGGElement>(null), animation = useRef<Animation | null>(null), spinningRef = useRef(false), rotation = useRef(0)
  const clipId = useId().replace(/:/g, '')
  const [exporting, saveImage] = useImageExport(notify, locale, gameId)
  const tr = (value: string) => translateGameText(gameId, locale, value)
  const asset = (path: string) => safeAssetUrl(path, baseUrl)
  const roleFor = (id: string) => roles.find((item) => item.id === id) ?? { id, label: id, color: '#ffc84a' }
  const selected = useMemo(() => new Set(saved.selected), [saved.selected])
  const pool = useMemo(() => items.filter((item) => selected.has(item.key)), [items, selected])
  const segments = weightedSegments(pool.map((item) => ({ key: item.key, weight: normalizeWeight(saved.weights[item.key]) })))
  const total = segments.reduce((sum, item) => sum + item.weight, 0)
  const visible = items.filter((item) => (role === 'all' || item.role === role) && `${item.name} ${tr(item.name)} ${tr(roleFor(item.role).label)}`.toLocaleLowerCase(locale).includes(search.trim().toLocaleLowerCase(locale)))
  const winner = items.find((item) => item.key === winnerKey)
  useEffect(() => { try { localStorage.setItem(`${storagePrefix}.wheel`, JSON.stringify(saved)) } catch { /* Local storage may be unavailable. */ } }, [saved, storagePrefix])
  useEffect(() => () => { spinningRef.current = false; animation.current?.cancel() }, [])
  function updateSelection(keys: string[]) {
    if (spinningRef.current) return
    setSaved((current) => ({ ...current, selected: [...new Set(keys)] }))
    setWinnerKey('')
    rotation.current = 0
    if (rotor.current) rotor.current.style.transform = 'rotate(0deg)'
  }
  function changeWeight(key: string, delta: number) {
    if (spinningRef.current) return
    setSaved((current) => ({ ...current, weights: { ...current.weights, [key]: normalizeWeight(normalizeWeight(current.weights[key]) + delta) } }))
    setWinnerKey('')
    rotation.current = 0
    if (rotor.current) rotor.current.style.transform = 'rotate(0deg)'
  }
  function spin() {
    if (spinningRef.current || !pool.length || !rotor.current) return
    spinningRef.current = true; setSpinning(true); setWinnerKey('')
    const index = winnerForTicket(segments, randomTicket(total)), result = pool[index]
    const target = rotationForSegment(segments[index].start, segments[index].end, rotation.current)
    const finish = () => {
      animation.current?.cancel(); animation.current = null
      rotation.current = target % 360
      if (rotor.current) rotor.current.style.transform = `rotate(${rotation.current}deg)`
      spinningRef.current = false; setSpinning(false); setWinnerKey(result.key)
      setHistory((current) => [result.key, ...current].slice(0, 5)); onWin?.()
    }
    onSpin?.()
    if (!animationsEnabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof rotor.current.animate !== 'function') { finish(); return }
    const running = rotor.current.animate([{ transform: `rotate(${rotation.current}deg)` }, { transform: `rotate(${target}deg)` }], { duration: 2800, easing: 'cubic-bezier(.12,.67,.12,1)', fill: 'forwards' })
    animation.current = running
    void running.finished.then(() => { if (animation.current === running) finish() }).catch(() => undefined)
  }
  function portrait(item: RouletteItem) {
    const frame = gameId === 'fragpunk' ? fragpunkPortraitFrames[item.key] : undefined
    return frame ? <svg className="wheel-art" viewBox={`${frame.x} ${frame.y} ${frame.width} ${frame.height}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={tr(item.name)}><image href={asset(item.portrait)} width={frame.sourceWidth} height={frame.sourceHeight} /></svg> : <img className="wheel-art" src={asset(item.portrait)} alt="" loading="lazy" />
  }
  async function exportWinner() {
    if (!winner) return
    const definition = roleFor(winner.role)
    await saveImage({ title: `${title} · ${tr('Ruleta')}`, accent: definition.color, filename: `overroll-${gameId}-ruleta`, cards: [{ player: tr('Ganador'), name: tr(winner.name), role: tr(definition.label), color: definition.color, portrait: asset(winner.portrait), icon: winner.icon || definition.icon ? asset(winner.icon ?? definition.icon!) : undefined, fit: gameId === 'fragpunk' || gameId === 'deadlock' ? 'contain' : 'cover', frame: gameId === 'fragpunk' ? fragpunkPortraitFrames[winner.key] : undefined }] })
  }
  return localizeUi(locale, <main className="utility-page shared-roulette" style={{ '--wheel-accent': roles[0]?.color ?? '#ffc84a' } as CSSProperties}>
    <header className="wheel-heading"><div><h1>Ruleta</h1><span>{title}</span></div><span className="wheel-count">{pool.length} / {items.length}</span></header>
    <div className="wheel-layout">
      <section className="wheel-editor" aria-label="Selección">
        <fieldset disabled={spinning}>
          <div className="wheel-search"><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar…" aria-label="Buscar…" /><select aria-label="Roles" value={role} onChange={(event) => setRole(event.target.value)}><option value="all">Todos</option>{roles.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
          <div className="wheel-actions"><button onClick={() => updateSelection([...saved.selected, ...visible.map((item) => item.key)])}>Añadir visibles</button><button onClick={() => updateSelection(saved.selected.filter((key) => !visible.some((item) => item.key === key)))}>Quitar visibles</button><button onClick={() => { setSaved((current) => ({ ...current, weights: {} })); setWinnerKey('') }}>Igualar pesos</button></div>
          <div className="wheel-catalog">{visible.map((item) => { const definition = roleFor(item.role), active = selected.has(item.key), weight = normalizeWeight(saved.weights[item.key]); return <article key={item.key} className={`wheel-candidate ${active ? 'selected' : ''}`} style={{ '--candidate-color': definition.color } as CSSProperties}>
            <button className="wheel-candidate-pick" aria-pressed={active} onClick={() => updateSelection(active ? saved.selected.filter((key) => key !== item.key) : [...saved.selected, item.key])}>{portrait(item)}<span><strong>{item.name}</strong><small>{(item.icon || definition.icon) && <img src={asset(item.icon ?? definition.icon!)} alt="" />}{definition.label}</small></span><b aria-hidden="true">{active ? '✓' : '+'}</b></button>
            {active && <div className="wheel-weight"><button aria-label={`${tr('Reducir peso')}: ${item.name}`} disabled={weight === 1} onClick={() => changeWeight(item.key, -1)}>−</button><span>×{weight}</span><button aria-label={`${tr('Aumentar peso')}: ${item.name}`} disabled={weight === 64} onClick={() => changeWeight(item.key, 1)}>+</button><output>{new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(weight / total * 100)}%</output></div>}
          </article> })}{!visible.length && <p className="wheel-empty">Sin resultados</p>}</div>
        </fieldset>
      </section>
      <aside className="wheel-result">
        <div className={`wheel-stage ${spinning ? 'is-spinning' : ''}`}>
          <span className="wheel-pointer" aria-hidden="true" />
          <svg viewBox="0 0 400 400" role="img" aria-label={tr('Ruleta')}><defs>{segments.map((segment, index) => { const angle = ((segment.start + segment.end) / 2 - 90) * Math.PI / 180, x = 200 + 135 * Math.cos(angle), y = 200 + 135 * Math.sin(angle), size = Math.min(56, Math.max(12, (segment.end - segment.start) * 2)); return <clipPath key={segment.key} id={`${clipId}-${index}`}><circle cx={x} cy={y} r={size / 2} /></clipPath> })}</defs><g ref={rotor} className="wheel-rotor">{segments.map((segment, index) => { const item = pool[index], angle = ((segment.start + segment.end) / 2 - 90) * Math.PI / 180, x = 200 + 135 * Math.cos(angle), y = 200 + 135 * Math.sin(angle), size = Math.min(56, Math.max(12, (segment.end - segment.start) * 2)); return <g key={item.key}><path d={sectorPath(segment.start, segment.end)} fill={roleFor(item.role).color} stroke="#101922" strokeWidth="1.2" />{size >= 20 && (gameId === 'fragpunk' && fragpunkPortraitFrames[item.key] ? <svg x={x - size / 2} y={y - size / 2} width={size} height={size} viewBox={`${fragpunkPortraitFrames[item.key].x} ${fragpunkPortraitFrames[item.key].y} ${fragpunkPortraitFrames[item.key].width} ${fragpunkPortraitFrames[item.key].height}`} preserveAspectRatio="xMidYMid meet"><image href={asset(item.portrait)} width={fragpunkPortraitFrames[item.key].sourceWidth} height={fragpunkPortraitFrames[item.key].sourceHeight} /></svg> : <image href={asset(item.portrait)} x={x - size / 2} y={y - size / 2} width={size} height={size} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clipId}-${index})`} />)}</g> })}</g><circle cx="200" cy="200" r="63" fill="#101922" stroke="#f4f4f0" strokeWidth="2" />{!pool.length && <circle cx="200" cy="200" r="184" fill="none" stroke="#35414a" strokeWidth="2" />}</svg>
          <div className="wheel-center">{winner ? portrait(winner) : <span>{pool.length}<small>Selección</small></span>}</div>
        </div>
        <div className="wheel-winner" role="status" aria-live="polite" aria-atomic="true">{spinning ? <strong>Girando…</strong> : winner ? <><small>Ganador</small><strong>{winner.name}</strong><span>{roleFor(winner.role).label}</span></> : <strong>{pool.length ? 'Lista para girar' : 'Selecciona participantes'}</strong>}</div>
        <button className="wheel-spin primary" onClick={spin} disabled={spinning || !pool.length}>{spinning ? 'Girando…' : 'Girar ruleta'}</button>
        {winner && <button className="wheel-download" onClick={() => void exportWinner()} disabled={spinning || exporting}>Descargar imagen</button>}
        {!!history.length && <div className="wheel-history" aria-label={tr('Últimos resultados')}>{history.map((key, index) => { const item = items.find((candidate) => candidate.key === key); return item ? <span key={`${key}-${index}`} title={tr(item.name)}>{portrait(item)}</span> : null })}</div>}
      </aside>
    </div>
  </main>, gameId)
}
