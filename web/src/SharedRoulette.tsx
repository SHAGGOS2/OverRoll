import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { SupportedLocale } from './localization'
import { localizeUi, translateGameText } from './uiLocalization'
import { safeAssetUrl } from './imageExport'
import { useImageExport } from './useImageExport'
import { restoreRouletteState, normalizeWeight, randomTicket, rotationForSegment, sectorPath, sectorArtworkBounds, segmentAtRotation, weightedSegments, winnerForTicket } from './rouletteModel'
import { fragpunkPortraitFrames } from './portraitFrames'
import { tf2Artwork } from './tf2Artwork'
import { pvzArtwork } from './pvzArtwork'
import { createRouletteAudio } from './rouletteAudio'

export type RouletteItem = { key: string; name: string; role: string; portrait: string; icon?: string }
export type RouletteRole = { id: string; label: string; color: string; icon?: string }
type Props = { gameId: string; title: string; items: RouletteItem[]; roles: RouletteRole[]; storagePrefix: string; legacySelectionKey?: string; baseUrl: string; locale: SupportedLocale; animationsEnabled: boolean; soundEnabled: boolean; soundVolume: number; onSpin?: () => void; onWin?: () => void; notify: (message: string, tone?: 'success' | 'info' | 'warning') => void }
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

function WheelIcon({ name, size = 18 }: { name: 'spin' | 'search' | 'check' | 'minus' | 'weights' | 'download' | 'history'; size?: number }) {
  const paths = {
    spin: 'M20 7v5h-5M4 17v-5h5M6.1 6.1A8 8 0 0 1 20 12M4 12a8 8 0 0 0 13.9 5.9',
    search: 'm21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    check: 'm5 12 4 4L19 6', minus: 'M5 12h14', weights: 'M4 7h16M4 17h16M8 4v6m8 4v6',
    download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5', history: 'M3 11a9 9 0 1 1 2 7M3 4v7h7m2-4v5l3 2',
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}

export default function SharedRoulette({ gameId, title, items, roles, storagePrefix, legacySelectionKey, baseUrl, locale, animationsEnabled, soundEnabled, soundVolume, onSpin, onWin, notify }: Props) {
  const [saved, setSaved] = useState(() => readSaved(storagePrefix, legacySelectionKey, items))
  const [search, setSearch] = useState(''), [role, setRole] = useState('all')
  const [showWeights, setShowWeights] = useState(false)
  const [spinning, setSpinning] = useState(false), [winnerKey, setWinnerKey] = useState('')
  const [rollingKey, setRollingKey] = useState(''), [history, setHistory] = useState<string[]>([])
  const rotor = useRef<SVGGElement>(null), animation = useRef<Animation | null>(null), spinningRef = useRef(false), rotation = useRef(0)
  const previewFrame = useRef<number | null>(null)
  const audio = useRef<ReturnType<typeof createRouletteAudio> | null>(null)
  const clipId = useId().replace(/:/g, '')
  const [exporting, saveImage] = useImageExport(notify, locale, gameId)
  const tr = (value: string) => translateGameText(gameId, locale, value)
  const asset = (path: string) => safeAssetUrl(path, baseUrl)
  const roleFor = (id: string) => roles.find((item) => item.id === id) ?? { id, label: id, color: '#ffc84a' }
  const selected = useMemo(() => new Set(saved.selected), [saved.selected])
  const pool = useMemo(() => items.filter((item) => selected.has(item.key)), [items, selected])
  const segments = useMemo(() => weightedSegments(pool.map((item) => ({ key: item.key, weight: normalizeWeight(saved.weights[item.key]) }))), [pool, saved.weights])
  const total = segments.reduce((sum, item) => sum + item.weight, 0)
  const visible = items.filter((item) => (role === 'all' || item.role === role) && `${item.name} ${tr(item.name)} ${tr(roleFor(item.role).label)}`.toLocaleLowerCase(locale).includes(search.trim().toLocaleLowerCase(locale)))
  const winner = items.find((item) => item.key === winnerKey)
  const preview = spinning ? pool.find((item) => item.key === rollingKey) : winner
  const winnerRole = preview ? roleFor(preview.role) : null
  const winnerOdds = winner ? segments.find((segment) => segment.key === winner.key)?.probability ?? 0 : 0
  const percent = (probability: number) => new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(probability)

  useEffect(() => {
    const sound = createRouletteAudio(); audio.current = sound
    const onVisibility = () => { if (document.hidden) sound.stop() }
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibility)
    return () => {
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility)
      sound.dispose(); audio.current = null
    }
  }, [])
  useEffect(() => { audio.current?.configure(soundEnabled, soundVolume) }, [soundEnabled, soundVolume])
  useEffect(() => {
    if (items.length && !saved.catalog.length) setSaved(readSaved(storagePrefix, legacySelectionKey, items))
  }, [items, storagePrefix, legacySelectionKey, saved.catalog.length])
  useEffect(() => {
    if (!saved.catalog.length) return
    try { localStorage.setItem(`${storagePrefix}.wheel`, JSON.stringify(saved)) } catch { /* Storage may be unavailable. */ }
  }, [saved, storagePrefix])
  useEffect(() => () => {
    spinningRef.current = false
    animation.current?.cancel()
    if (previewFrame.current !== null) window.cancelAnimationFrame(previewFrame.current)
  }, [])

  function resetResult() {
    setWinnerKey(''); setRollingKey(''); rotation.current = 0
    if (rotor.current) rotor.current.style.transform = 'rotate(0deg)'
  }
  function updateSelection(keys: string[]) {
    if (spinningRef.current) return
    audio.current?.select(keys.length >= saved.selected.length)
    setSaved((current) => ({ ...current, selected: [...new Set(keys)] }))
    resetResult()
  }
  function changeWeight(key: string, delta: number) {
    if (spinningRef.current) return
    audio.current?.select(delta > 0)
    setSaved((current) => ({ ...current, weights: { ...current.weights, [key]: normalizeWeight(normalizeWeight(current.weights[key]) + delta) } }))
    resetResult()
  }
  function equalizeWeights() {
    if (spinningRef.current) return
    audio.current?.select()
    setSaved((current) => ({ ...current, weights: {} }))
    resetResult()
  }
  function spin() {
    if (spinningRef.current || !pool.length || !rotor.current) return
    spinningRef.current = true; setSpinning(true); setWinnerKey(''); setRollingKey(pool[0].key)
    const index = winnerForTicket(segments, randomTicket(total)), result = pool[index]
    const start = rotation.current, target = rotationForSegment(segments[index].start, segments[index].end, start)
    const finish = () => {
      if (previewFrame.current !== null) window.cancelAnimationFrame(previewFrame.current)
      previewFrame.current = null
      animation.current?.cancel(); animation.current = null
      rotation.current = target % 360
      if (rotor.current) rotor.current.style.transform = `rotate(${rotation.current}deg)`
      spinningRef.current = false; setSpinning(false); setRollingKey(''); setWinnerKey(result.key)
      setHistory((current) => [result.key, ...current].slice(0, 5)); audio.current?.win(); onWin?.()
    }
    onSpin?.()
    if (!animationsEnabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof rotor.current.animate !== 'function') { finish(); return }
    audio.current?.start(3.6)
    const running = rotor.current.animate([{ transform: `rotate(${start}deg)` }, { transform: `rotate(${target}deg)` }], { duration: 3600, easing: 'cubic-bezier(.12,.72,.1,1)', fill: 'forwards' })
    animation.current = running
    let lastPreview = -Infinity, lastSector = segmentAtRotation(segments, start), lastTurn = Math.floor(start / 360)
    const updatePreview = (now: number) => {
      if (animation.current !== running) return
      if (now - lastPreview >= 65) {
        const progress = running.effect?.getComputedTiming().progress
        if (typeof progress === 'number') {
          const degrees = start + (target - start) * progress, sector = segmentAtRotation(segments, degrees), turn = Math.floor(degrees / 360)
          const candidate = pool[sector]
          if (candidate && (sector !== lastSector || turn !== lastTurn)) audio.current?.tick(progress)
          lastSector = sector; lastTurn = turn
          if (candidate) setRollingKey(candidate.key)
        }
        lastPreview = now
      }
      previewFrame.current = window.requestAnimationFrame(updatePreview)
    }
    previewFrame.current = window.requestAnimationFrame(updatePreview)
    void running.finished.then(() => { if (animation.current === running) finish() }).catch(() => {
      if (animation.current === running && spinningRef.current) finish()
    })
  }

  function artworkFor(item: RouletteItem) {
    const artwork = gameId === 'tf2' ? tf2Artwork[item.key] : gameId === 'pvzgw2' ? pvzArtwork[item.key] : undefined
    return { portrait: artwork?.portrait ?? item.portrait, frame: artwork?.frame ?? (gameId === 'fragpunk' ? fragpunkPortraitFrames[item.key] : undefined) }
  }
  function portrait(item: RouletteItem, featured = false) {
    const art = featured ? artworkFor(item) : { portrait: item.portrait, frame: gameId === 'fragpunk' ? fragpunkPortraitFrames[item.key] : undefined }
    return art.frame ? <svg className="wheel-art" viewBox={`${art.frame.x} ${art.frame.y} ${art.frame.width} ${art.frame.height}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true"><image href={asset(art.portrait)} width={art.frame.sourceWidth} height={art.frame.sourceHeight} /></svg> : <img className="wheel-art" src={asset(art.portrait)} alt="" loading={featured ? 'eager' : 'lazy'} decoding="async" draggable={false} />
  }
  async function exportWinner() {
    if (!winner || spinningRef.current) return
    const definition = roleFor(winner.role), art = artworkFor(winner)
    await saveImage({ title: `${title} · ${tr('Ruleta')}`, accent: definition.color, filename: `overroll-${gameId}-ruleta`, cards: [{ player: tr('Ganador'), name: tr(winner.name), role: tr(definition.label), color: definition.color, portrait: asset(art.portrait), icon: winner.icon || definition.icon ? asset(winner.icon ?? definition.icon!) : undefined, fit: art.frame || gameId === 'deadlock' ? 'contain' : 'cover', frame: art.frame }] })
  }

  return localizeUi(locale, <main className="utility-page shared-roulette" data-state={spinning ? 'spinning' : winner ? 'winner' : pool.length ? 'ready' : 'empty'} style={{ '--wheel-game-accent': roles[0]?.color ?? '#ffc84a', '--winner-color': winnerRole?.color ?? 'var(--wheel-accent)' } as CSSProperties}>
    <header className="wheel-heading"><div><span className="wheel-game-name" translate="no">{title}</span><h1>Ruleta</h1></div><div className="wheel-count"><span>En juego</span><strong>{pool.length}<small> / {items.length}</small></strong></div></header>
    <div className="wheel-layout">
      <section className="wheel-result" aria-label={tr('Ruleta')}>
        <div className="wheel-machine">
          <div className="wheel-machine-grid" aria-hidden="true" />
          <div className={`wheel-stage ${spinning ? 'is-spinning' : ''} ${winner ? 'has-winner' : ''}`}>
            <span className="wheel-pointer" aria-hidden="true"><i /></span>
            <svg viewBox="0 0 400 400" role="img" aria-label={tr('Ruleta')}>
              <defs>
                {segments.map((segment, index) => <clipPath key={segment.key} id={`${clipId}-${index}`} clipPathUnits="userSpaceOnUse"><path d={sectorPath(segment.start, segment.end)} /></clipPath>)}
                <linearGradient id={`${clipId}-shade`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#07131d" stopOpacity="0" /><stop offset="1" stopColor="#07131d" stopOpacity=".4" /></linearGradient>
              </defs>
              <circle className="wheel-rim-shadow" cx="200" cy="200" r="193" />
              <circle className="wheel-rim" cx="200" cy="200" r="191" />
              <g className="wheel-ticks" aria-hidden="true">{Array.from({ length: 60 }, (_, index) => {
                const angle = (index * 6 - 90) * Math.PI / 180, inner = index % 5 === 0 ? 186 : 189
                return <line key={index} x1={200 + inner * Math.cos(angle)} y1={200 + inner * Math.sin(angle)} x2={200 + 194 * Math.cos(angle)} y2={200 + 194 * Math.sin(angle)} className={index % 5 === 0 ? 'major' : undefined} />
              })}</g>
              <g ref={rotor} className="wheel-rotor">{segments.map((segment, index) => {
                const item = pool[index], bounds = sectorArtworkBounds(segment.start, segment.end)
                const art = gameId === 'pvzgw2' && pool.length > 24 ? { portrait: item.portrait, frame: undefined } : artworkFor(item)
                return <g key={item.key} className={`wheel-sector${winnerKey === item.key ? ' is-winner' : ''}`} style={{ '--sector-color': roleFor(item.role).color } as CSSProperties}>
                  <title>{tr(item.name)} · {percent(segment.probability)}</title>
                  <path className="wheel-sector-fill" d={sectorPath(segment.start, segment.end)} />
                  <g clipPath={`url(#${clipId}-${index})`} aria-hidden="true"><g transform={`rotate(${pool.length === 1 ? 0 : (segment.start + segment.end) / 2} 200 200)`}>
                    {art.frame ? <svg className="wheel-sector-image" {...bounds} viewBox={`${art.frame.x} ${art.frame.y} ${art.frame.width} ${art.frame.height}`} preserveAspectRatio="xMidYMin slice" overflow="hidden"><image href={asset(art.portrait)} width={art.frame.sourceWidth} height={art.frame.sourceHeight} /></svg> : <image className="wheel-sector-image" href={asset(art.portrait)} {...bounds} preserveAspectRatio="xMidYMid slice" />}
                    <rect className="wheel-sector-shade" {...bounds} fill={`url(#${clipId}-shade)`} />
                  </g></g>
                  <path className="wheel-sector-outline" d={sectorPath(segment.start, segment.end)} />
                </g>
              })}</g>
              {!pool.length && <circle className="wheel-empty-ring" cx="200" cy="200" r="184" />}
              <circle className="wheel-hub-rim" cx="200" cy="200" r="82" />
              <circle className="wheel-hub" cx="200" cy="200" r="77" />
            </svg>
            <div className="wheel-center" aria-hidden="true">{preview ? portrait(preview, !spinning) : <span><b>{String(pool.length).padStart(2, '0')}</b><small>En juego</small></span>}</div>
          </div>
          <div className="wheel-role-legend" aria-label={tr('Roles')}>{roles.map((definition) => {
            const count = pool.filter((item) => item.role === definition.id).length
            return count > 0 ? <span key={definition.id} style={{ '--legend-color': definition.color } as CSSProperties}><i />{definition.label}<b>{count}</b></span> : null
          })}</div>
        </div>

        <div className={`wheel-winner ${winner ? 'is-revealed' : ''}`}>
          <div className="wheel-winner-art" aria-hidden="true">{preview ? portrait(preview, !spinning) : <WheelIcon name="spin" size={34} />}</div>
          <div className="wheel-winner-copy"><small>{spinning ? 'Girando…' : winner ? 'Ganador' : 'Selección'}</small><strong>{preview?.name ?? (pool.length ? 'Lista para girar' : 'Selecciona participantes')}</strong>{winnerRole && <span>{(preview?.icon || winnerRole.icon) && <img src={asset(preview?.icon ?? winnerRole.icon!)} alt="" />}{winnerRole.label}</span>}</div>
          {winner && <span className="wheel-winner-odds" title={tr('Probabilidad')}><b>{percent(winnerOdds)}</b><small>Probabilidad</small></span>}
        </div>
        <div className="wheel-announcement" role="status" aria-live="polite" aria-atomic="true">{spinning ? tr('Girando…') : winner ? `${tr('Ganador')}: ${tr(winner.name)}` : tr(pool.length ? 'Lista para girar' : 'Selecciona participantes')}</div>
        <div className="wheel-main-actions"><button type="button" className="wheel-spin primary" onClick={spin} disabled={spinning || !pool.length}><WheelIcon name="spin" size={21} /><span>{spinning ? 'Girando…' : 'Girar ruleta'}</span><span className="wheel-spin-arrow" aria-hidden="true">↗</span></button><button type="button" className="wheel-download" onClick={() => void exportWinner()} disabled={!winner || spinning || exporting} aria-label={tr('Descargar imagen')} title={tr('Descargar imagen')}><WheelIcon name="download" size={20} /></button></div>
        {!!history.length && <div className="wheel-history"><h2><WheelIcon name="history" size={15} />Últimos resultados</h2><ol>{history.map((key, index) => {
          const item = items.find((candidate) => candidate.key === key)
          return item ? <li key={`${key}-${index}`} title={tr(item.name)}><div className="wheel-history-art">{portrait(item)}</div><span>{item.name}</span></li> : null
        })}</ol></div>}
      </section>

      <section className="wheel-editor" aria-label={tr('Selección')}>
        <fieldset disabled={spinning}>
          <header className="wheel-editor-heading"><h2>Participantes</h2><span>{pool.length} / {items.length}</span></header>
          <div className="wheel-search"><WheelIcon name="search" size={17} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar…" aria-label="Buscar…" /></div>
          <div className="wheel-role-filters" aria-label={tr('Roles')}><button type="button" className={role === 'all' ? 'active' : ''} aria-pressed={role === 'all'} onClick={() => { setRole('all'); audio.current?.select() }}>Todos<small>{items.length}</small></button>{roles.length > 1 && roles.map((definition) => <button type="button" key={definition.id} className={role === definition.id ? 'active' : ''} aria-pressed={role === definition.id} onClick={() => { setRole(definition.id); audio.current?.select() }} style={{ '--filter-color': definition.color } as CSSProperties}>{definition.icon && <img src={asset(definition.icon)} alt="" />}{definition.label}<small>{items.filter((item) => item.role === definition.id).length}</small></button>)}</div>
          <div className="wheel-actions"><button type="button" onClick={() => updateSelection([...saved.selected, ...visible.map((item) => item.key)])}><WheelIcon name="check" size={14} />Añadir visibles</button><button type="button" onClick={() => updateSelection(saved.selected.filter((key) => !visible.some((item) => item.key === key)))}><WheelIcon name="minus" size={14} />Quitar visibles</button><button type="button" className={`wheel-probability-toggle ${showWeights ? 'active' : ''}`} aria-pressed={showWeights} onClick={() => { setShowWeights((current) => !current); audio.current?.select(!showWeights) }} title={tr('Probabilidades')}><WheelIcon name="weights" size={16} /><span>Probabilidades</span></button></div>
          <div className={`wheel-catalog ${showWeights ? 'show-weights' : ''}`}>{visible.map((item) => {
            const definition = roleFor(item.role), active = selected.has(item.key), weight = normalizeWeight(saved.weights[item.key])
            return <article key={item.key} className={`wheel-candidate ${active ? 'selected' : ''}`} style={{ '--candidate-color': definition.color } as CSSProperties}>
              <button type="button" className="wheel-candidate-pick" aria-pressed={active} onClick={() => updateSelection(active ? saved.selected.filter((key) => key !== item.key) : [...saved.selected, item.key])}><div className="wheel-candidate-art">{portrait(item)}</div><span className="wheel-candidate-copy"><strong>{item.name}</strong><small>{(item.icon || definition.icon) && <img src={asset(item.icon ?? definition.icon!)} alt="" />}{definition.label}</small>{active && <output>{percent(weight / total)}{weight > 1 && <em>×{weight}</em>}</output>}</span><span className="wheel-selection-mark" aria-hidden="true">{active ? <WheelIcon name="check" size={13} /> : '+'}</span></button>
              {active && showWeights && <div className="wheel-weight"><span>×{weight}</span><button type="button" aria-label={`${tr('Reducir peso')}: ${tr(item.name)}`} disabled={weight === 1} onClick={() => changeWeight(item.key, -1)}>−</button><button type="button" aria-label={`${tr('Aumentar peso')}: ${tr(item.name)}`} disabled={weight === 64} onClick={() => changeWeight(item.key, 1)}>+</button></div>}
            </article>
          })}{!visible.length && <p className="wheel-empty"><WheelIcon name="search" size={24} /><span>Sin resultados</span></p>}</div>
          {showWeights && <footer className="wheel-editor-footer"><button type="button" onClick={equalizeWeights}><WheelIcon name="weights" size={14} />Igualar pesos</button></footer>}
        </fieldset>
      </section>
    </div>
  </main>, gameId)
}
