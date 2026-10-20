import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { TELEPORT_DURATION_MS, TELEPORT_SWAP_MS, type CardDesign } from './cardDesign'
import type { PortraitFrame } from './portraitFrames'

type Portrait = { src: string; alt: string; crop?: PortraitFrame }
type Props = {
  player: string; index: number; name: string; role: string; roleId?: string; roleIcon?: string
  portrait: string; rolesOnly: boolean; locked: boolean; profile?: string; blocked: number
  perks: Array<{ name: string; description: string; icon: string; tier: string }>
  actions: ReactNode; revision: number; motion: boolean; locale: string
  design?: CardDesign; gameId?: string; accent?: string; fit?: 'cover' | 'contain'; frame?: PortraitFrame
  candidates?: Array<{ name: string; portrait: string }>; extras?: ReactNode; subtitle?: string
}

export function TeleportPortrait({ src, alt, crop, revision, enabled, locked = false, rolesOnly = false, fit = 'cover', motionStyle = 'teleport' }: Portrait & { revision: number; enabled: boolean; locked?: boolean; rolesOnly?: boolean; fit?: 'cover' | 'contain'; motionStyle?: 'teleport' | 'slide' | 'flip' | 'orbit' }) {
  const visible = useRef({ src, alt, crop })
  const previous = useRef<{ src: string; revision: number } | null>(null)
  const [frame, setFrame] = useState<Portrait & { phase: 'idle' | 'out' | 'in' }>({ src, alt, crop, phase: 'idle' })
  const [broken, setBroken] = useState(false)

  useEffect(() => {
    const first = previous.current === null
    const changed = first || previous.current?.src !== src || previous.current.revision !== revision
    previous.current = { src, revision }
    if (!changed || !enabled || locked || !src) {
      visible.current = { src, alt, crop }
      setFrame({ src, alt, crop, phase: 'idle' })
      setBroken(false)
      return
    }
    const departing = !first && Boolean(visible.current.src)
    setFrame({ ...visible.current, phase: departing ? 'out' : 'in' })
    const swap = window.setTimeout(() => {
      visible.current = { src, alt, crop }
      setBroken(false)
      setFrame({ src, alt, crop, phase: 'in' })
    }, departing ? TELEPORT_SWAP_MS : 0)
    const finish = window.setTimeout(() => setFrame((current) => ({ ...current, phase: 'idle' })), departing ? TELEPORT_DURATION_MS : TELEPORT_DURATION_MS - TELEPORT_SWAP_MS)
    return () => { window.clearTimeout(swap); window.clearTimeout(finish) }
  }, [src, alt, crop, revision, enabled, locked])

  return <div className={`bar-card-figure ${rolesOnly ? 'is-role-only' : ''}`} data-fit={fit} data-motion={motionStyle} data-phase={frame.phase} aria-hidden="true">
    {frame.src && !broken ? frame.crop ? <svg viewBox={`${frame.crop.x} ${frame.crop.y} ${frame.crop.width} ${frame.crop.height}`} preserveAspectRatio="xMidYMid meet"><image href={frame.src} width={frame.crop.sourceWidth} height={frame.crop.sourceHeight} onError={() => setBroken(true)} /></svg> : <img src={frame.src} alt="" draggable={false} decoding="async" onError={() => setBroken(true)} /> : <span className="bar-card-empty">?</span>}
  </div>
}

export default function BarCard(props: Props) {
  const { player, index, name, role, roleId, roleIcon, portrait, rolesOnly, locked, profile, blocked, perks, actions, revision, motion, locale, design = 'bars', gameId = 'overwatch', accent, fit, frame, candidates, extras, subtitle } = props
  const portraitMotion = design === 'horizontal' ? 'slide' : design === 'hex' ? 'flip' : design === 'orbit' ? 'orbit' : 'teleport'
  return <article className={`bar-card ${design !== 'bars' && design !== 'classic' ? `is-${design}` : ''} bar-game-${gameId} ${roleId ?? ''} ${locked ? 'is-locked' : ''} ${candidates ? 'has-candidates' : ''} ${perks.length ? 'has-perks' : ''}`} style={{ ...(accent ? { '--role-color': accent } : {}), '--bar-perk-rows': perks.length } as CSSProperties} aria-label={`${player} · ${name}`}>
    <header className="bar-card-player"><small>{String(index + 1).padStart(2, '0')}</small><strong translate="no" title={player}>{player}</strong>{design === 'horizontal' && profile && <span className="bar-card-profile" translate="no" title={profile}>{profile}</span>}{locked && <span aria-hidden="true">◆</span>}{blocked > 0 && <small>{blocked}</small>}</header>
    <div className="bar-card-panel">
      <div className="bar-card-grid" />
      {candidates ? <div className="bar-card-candidates">{candidates.map((candidate, i) => <div className="bar-card-candidate" key={i} aria-label={`${i + 1} · ${candidate.name}`}><TeleportPortrait motionStyle={portraitMotion} src={candidate.portrait} alt={candidate.name} revision={revision} enabled={motion} locked={locked} fit="contain" /><span>{i + 1}</span><strong translate="no">{candidate.name}</strong></div>)}</div> : <div className="bar-card-art"><TeleportPortrait motionStyle={portraitMotion} src={portrait} alt={name} crop={frame} revision={revision} enabled={motion} locked={locked} rolesOnly={rolesOnly} fit={fit} /></div>}
      {perks.length > 0 && !rolesOnly && <div className={`bar-card-perks ${perks.length > 2 ? 'is-stadium' : ''}`}>
        {perks.map((perk, i) => <div className="bar-card-perk" title={`${perk.name}${perk.description ? '\n' + perk.description : ''}`} key={i}><span>{perk.icon ? <img src={perk.icon} alt="" /> : '✦'}</span><div><small>{perk.tier}</small><b translate="no" lang={locale}>{perk.name}</b></div></div>)}
      </div>}
      {roleIcon && <img className="bar-card-role-watermark" src={roleIcon} alt="" aria-hidden="true" />}
      <div className="bar-card-info"><h2 translate="no" title={name}>{name}</h2><div>{roleIcon && <img src={roleIcon} alt="" />}<span>{role}</span></div>{subtitle && <small>{subtitle}</small>}{profile && design !== 'horizontal' && <small translate="no" title={profile}>{profile}</small>}</div>
      <span className="bar-card-edge" aria-hidden="true" />
    </div>
    {extras && <div className="bar-card-extras">{extras}</div>}
    <div className="bar-card-actions">{actions}</div>
  </article>
}

