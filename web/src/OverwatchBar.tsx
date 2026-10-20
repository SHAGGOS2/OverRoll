import { useEffect, useRef, useState, type ReactNode } from 'react'
import { TELEPORT_DURATION_MS, TELEPORT_SWAP_MS } from './cardDesign'

type Portrait = { src: string; alt: string }
type Props = {
  player: string; index: number; name: string; role: string; roleId?: string; roleIcon?: string
  portrait: string; rolesOnly: boolean; locked: boolean; profile?: string; blocked: number
  perks: Array<{ name: string; description: string; icon: string; tier: string }>
  actions: ReactNode; revision: number; motion: boolean; locale: string
}

export function TeleportPortrait({ src, alt, revision, enabled, locked = false, rolesOnly = false }: Portrait & { revision: number; enabled: boolean; locked?: boolean; rolesOnly?: boolean }) {
  const visible = useRef({ src, alt })
  const previous = useRef<{ src: string; revision: number } | null>(null)
  const [frame, setFrame] = useState<Portrait & { phase: 'idle' | 'out' | 'in' }>({ src, alt, phase: 'idle' })
  const [broken, setBroken] = useState(false)

  useEffect(() => {
    const first = previous.current === null
    const changed = first || previous.current?.src !== src || previous.current.revision !== revision
    previous.current = { src, revision }
    if (!changed || !enabled || locked || !src) {
      visible.current = { src, alt }
      setFrame({ src, alt, phase: 'idle' })
      setBroken(false)
      return
    }
    const departing = !first && Boolean(visible.current.src)
    setFrame({ ...visible.current, phase: departing ? 'out' : 'in' })
    const swap = window.setTimeout(() => {
      visible.current = { src, alt }
      setBroken(false)
      setFrame({ src, alt, phase: 'in' })
    }, departing ? TELEPORT_SWAP_MS : 0)
    const finish = window.setTimeout(() => setFrame((current) => ({ ...current, phase: 'idle' })), departing ? TELEPORT_DURATION_MS : TELEPORT_DURATION_MS - TELEPORT_SWAP_MS)
    return () => { window.clearTimeout(swap); window.clearTimeout(finish) }
  }, [src, alt, revision, enabled, locked])

  return <div className={`ow-bar-figure ${rolesOnly ? 'is-role-only' : ''}`} data-phase={frame.phase} aria-hidden="true">
    {frame.src && !broken ? <img src={frame.src} alt="" draggable={false} decoding="async" onError={() => setBroken(true)} /> : <span className="ow-bar-empty">?</span>}
  </div>
}

export default function OverwatchBar(props: Props) {
  const { player, index, name, role, roleId, roleIcon, portrait, rolesOnly, locked, profile, blocked, perks, actions, revision, motion, locale } = props
  return <article className={`ow-bar ${roleId ?? ''} ${locked ? 'is-locked' : ''}`} aria-label={`${player} · ${name}`}>
    <header className="ow-bar-player"><small>{String(index + 1).padStart(2, '0')}</small><strong translate="no" title={player}>{player}</strong>{locked && <span aria-hidden="true">◆</span>}{blocked > 0 && <small>{blocked}</small>}</header>
    <div className="ow-bar-panel">
      <div className="ow-bar-grid" />
      <div className="ow-bar-art"><TeleportPortrait src={portrait} alt={name} revision={revision} enabled={motion} locked={locked} rolesOnly={rolesOnly} /></div>
      {perks.length > 0 && !rolesOnly && <div className={`ow-bar-perks ${perks.length > 2 ? 'is-stadium' : ''}`}>
        {perks.map((perk, i) => <div className="ow-bar-perk" title={`${perk.name}${perk.description ? '\n' + perk.description : ''}`} key={i}><span>{perk.icon ? <img src={perk.icon} alt="" /> : '✦'}</span><div><small>{perk.tier}</small><b translate="no" lang={locale}>{perk.name}</b></div></div>)}
      </div>}
      {roleIcon && <img className="ow-bar-role-watermark" src={roleIcon} alt="" aria-hidden="true" />}
      <div className="ow-bar-info"><h2 translate="no" title={name}>{name}</h2><div>{roleIcon && <img src={roleIcon} alt="" />}<span>{role}</span></div>{profile && <small translate="no" title={profile}>{profile}</small>}</div>
      <span className="ow-bar-edge" aria-hidden="true" />
    </div>
    <div className="ow-bar-actions">{actions}</div>
  </article>
}

