import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type MouseEvent,
} from 'react'
import {
  pvzCharacters,
  pvzPalettes,
  pvzSideColors,
  pvzSideLabels,
  pvzSideSingular,
  type PvzCharacter,
  type PvzSide,
} from './pvzCatalog'
import { warmImageCache } from './imageCache'
import type { SupportedLocale } from './localization'
import { isDefaultPlayerName, localizedPlayerName } from './uiLocalization'
import ViewportAction from './ViewportAction'
import './PvzModule.css'

type PvzView = 'principal' | 'roulette'
type PvzMobileTab = 'squad' | 'rules'
type NoticeTone = 'success' | 'info' | 'warning'
type PvzSound = 'click' | 'generate' | 'reroll' | 'rouletteBuild' | 'rouletteSpin' | 'rouletteWin'

type ProfileOption = { id: string; name: string }

type PvzPlayer = {
  id: string
  name: string
  side: PvzSide
  profileId: string
  blocked: string[]
}

type PvzPick = {
  character: PvzCharacter | null
  locked: boolean
}

type Props = {
  view: PvzView
  profiles: ProfileOption[]
  baseUrl: string
  animationsEnabled: boolean
  soundEnabled: boolean
  soundVolume: number
  mobileCompactMode: boolean
  locale: SupportedLocale
  notify: (message: string, tone?: NoticeTone) => void
}

type PvzIconName = 'users' | 'settings' | 'spark' | 'reroll' | 'filter' | 'lock' | 'unlock' | 'download' | 'shuffle' | 'trash' | 'reset' | 'check' | 'close' | 'roulette' | 'switch'

function PvzIcon({ name, size = 18 }: { name: PvzIconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (name) {
    case 'users': return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    case 'settings': return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V20.3h-3v-.09a1.7 1.7 0 0 0-1.03-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7.02 15a1.7 1.7 0 0 0-1.55-1.03H5.4v-3h.07A1.7 1.7 0 0 0 7.02 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06L8.74 4.94l.06.06A1.7 1.7 0 0 0 10.68 5.34a1.7 1.7 0 0 0 1.03-1.55V3.7h3v.09a1.7 1.7 0 0 0 1.03 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1.03h.09v3h-.09A1.7 1.7 0 0 0 19.4 15Z" /></svg>
    case 'spark': return <svg {...common}><path d="m12 3-1.5 4.5L6 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5L12 3Z" /><path d="m5 15-.8 2.2L2 18l2.2.8L5 21l.8-2.2L8 18l-2.2-.8L5 15Z" /></svg>
    case 'reroll': return <svg {...common}><path d="M4 7h11a5 5 0 0 1 5 5" /><path d="m4 7 3-3M4 7l3 3" /><path d="M20 17H9a5 5 0 0 1-5-5" /><path d="m20 17-3-3m3 3-3 3" /></svg>
    case 'filter': return <svg {...common}><path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z" /></svg>
    case 'lock': return <svg {...common}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
    case 'unlock': return <svg {...common}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 7.3-2.2" /></svg>
    case 'download': return <svg {...common}><path d="M12 4v12M7 11l5 5 5-5" /><path d="M5 20h14" /></svg>
    case 'shuffle': return <svg {...common}><path d="M16 3h5v5" /><path d="m21 3-6.5 6.5a3 3 0 0 1-4.2 0L3 3" /><path d="M16 16h5v5" /><path d="m21 21-6.5-6.5a3 3 0 0 0-4.2 0L3 21" /></svg>
    case 'trash': return <svg {...common}><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" /></svg>
    case 'reset': return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v6h6" /></svg>
    case 'check': return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>
    case 'close': return <svg {...common}><path d="M6 6l12 12M18 6 6 18" /></svg>
    case 'roulette': return <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="1.4" /><path d="M12 4v6M12 14v6M4 12h6M14 12h6M6.35 6.35l4.24 4.24M13.41 13.41l4.24 4.24M17.65 6.35l-4.24 4.24M10.59 13.41l-4.24 4.24" /></svg>
    case 'switch': return <svg {...common}><path d="M7 7h11l-3-3M17 17H6l3 3" /></svg>
    default: return null
  }
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function makePlayer(index: number): PvzPlayer {
  const side: PvzSide = index < 2 ? 'plants' : 'zombies'
  return { id: `pvz-player-${index + 1}`, name: `Jugador ${index + 1}`, side, profileId: '', blocked: [] }
}

function normalizePlayers(raw: unknown): PvzPlayer[] {
  if (!Array.isArray(raw) || raw.length === 0) return Array.from({ length: 4 }, (_, index) => makePlayer(index))
  const normalized: PvzPlayer[] = raw.slice(0, 8).map((item, index) => {
    const source = item && typeof item === 'object' ? item as Partial<PvzPlayer> : {}
    return {
      id: typeof source.id === 'string' ? source.id : `pvz-player-${index + 1}`,
      name: typeof source.name === 'string' ? source.name : `Jugador ${index + 1}`,
      side: source.side === 'zombies' ? 'zombies' : 'plants',
      profileId: typeof source.profileId === 'string' ? source.profileId : '',
      blocked: Array.isArray(source.blocked) ? source.blocked.filter((key): key is string => typeof key === 'string') : [],
    }
  })
  return Array.from({ length: Math.max(2, normalized.length) }, (_, index) => normalized[index] ?? makePlayer(index))
}

function normalizePicks(raw: unknown, count: number): PvzPick[] {
  const byKey = new Map(pvzCharacters.map((item) => [item.key, item]))
  const source = Array.isArray(raw) ? raw : []
  return Array.from({ length: count }, (_, index) => {
    const row = source[index] && typeof source[index] === 'object' ? source[index] as { key?: unknown; locked?: unknown } : {}
    const character = typeof row.key === 'string' ? byKey.get(row.key) ?? null : null
    return { character, locked: row.locked === true && Boolean(character) }
  })
}

function shuffle<T>(rows: readonly T[]): T[] {
  const copy = [...rows]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1))
    const current = copy[index]
    copy[index] = copy[target]
    copy[target] = current
  }
  return copy
}

function randomIndex(length: number): number {
  if (length <= 1) return 0
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const ceiling = Math.floor(0x100000000 / length) * length
    const value = new Uint32Array(1)
    do crypto.getRandomValues(value)
    while (value[0] >= ceiling)
    return value[0] % length
  }
  return Math.floor(Math.random() * length)
}

function point(radius: number, degrees: number) {
  const radians = degrees * Math.PI / 180
  return { x: 200 + Math.cos(radians) * radius, y: 200 + Math.sin(radians) * radius }
}

function sectorPath(index: number, total: number) {
  if (total <= 1) return 'M 200 16 A 184 184 0 1 1 199.9 16 Z'
  const step = 360 / total
  const start = -90 + index * step
  const end = start + step
  const first = point(184, start)
  const second = point(184, end)
  return `M 200 200 L ${first.x.toFixed(3)} ${first.y.toFixed(3)} A 184 184 0 ${step > 180 ? 1 : 0} 1 ${second.x.toFixed(3)} ${second.y.toFixed(3)} Z`
}

function normalizedDegrees(value: number) {
  return ((value % 360) + 360) % 360
}

function loadCanvasImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`No se pudo cargar ${url}`))
    image.src = url
  })
}

function drawCover(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const sourceWidth = width / scale
  const sourceHeight = height / scale
  const sourceX = (image.naturalWidth - sourceWidth) / 2
  const sourceY = (image.naturalHeight - sourceHeight) / 2
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height)
}

export default function PvzModule({
  view,
  profiles,
  baseUrl,
  animationsEnabled,
  soundEnabled,
  soundVolume,
  mobileCompactMode,
  locale,
  notify,
}: Props) {
  const asset = (path: string) => `${baseUrl}${path.replace(/^\//, '')}`
  const [players, setPlayers] = useState<PvzPlayer[]>(() => normalizePlayers(readStorage<unknown>('overroll.web.pvz.players', [])))
  const [picks, setPicks] = useState<PvzPick[]>(() => {
    const storedPlayers = normalizePlayers(readStorage<unknown>('overroll.web.pvz.players', []))
    return normalizePicks(readStorage<unknown>('overroll.web.pvz.picks', []), storedPlayers.length)
  })
  const [avoidRepeated, setAvoidRepeated] = useState(() => readStorage('overroll.web.pvz.avoidRepeated', true))
  const [useVariants, setUseVariants] = useState(() => readStorage('overroll.web.pvz.useVariants', true))
  const [includeDlc, setIncludeDlc] = useState(() => readStorage('overroll.web.pvz.includeDlc', true))
  const [sideSwitchEnabled, setSideSwitchEnabled] = useState(() => readStorage('overroll.web.pvz.sideSwitchEnabled', true))
  const [mobileConfigOpen, setMobileConfigOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<PvzMobileTab>('squad')
  const [status, setStatus] = useState('121 personajes y variantes listos')
  const [generating, setGenerating] = useState(false)
  const [rerollingIndex, setRerollingIndex] = useState<number | null>(null)
  const [generationRevision, setGenerationRevision] = useState(0)
  const [filterIndex, setFilterIndex] = useState<number | null>(null)
  const [filterSearch, setFilterSearch] = useState('')

  const [rouletteSide, setRouletteSide] = useState<PvzSide>(() => readStorage('overroll.web.pvz.rouletteSide', 'plants'))
  const [rouletteSearch, setRouletteSearch] = useState('')
  const [rouletteSelectedKeys, setRouletteSelectedKeys] = useState<string[]>(() => readStorage('overroll.web.pvz.rouletteSelectedKeys', pvzCharacters.map((item) => item.key)))
  const [rouletteWeights, setRouletteWeights] = useState<Record<string, number>>(() => readStorage('overroll.web.pvz.rouletteWeights', Object.fromEntries(pvzCharacters.map((item) => [item.key, 1]))))
  const [rouletteEntries, setRouletteEntries] = useState<string[]>([])
  const [rouletteWinnerKey, setRouletteWinnerKey] = useState('')
  const [rouletteDirty, setRouletteDirty] = useState(true)
  const [rouletteSpinning, setRouletteSpinning] = useState(false)
  const [rouletteRotation, setRouletteRotation] = useState(0)
  const [rouletteSpinRequest, setRouletteSpinRequest] = useState(0)
  const rotorRef = useRef<SVGGElement | null>(null)
  const animationRef = useRef<Animation | null>(null)
  const pendingSpinRef = useRef<{ entries: string[]; winnerIndex: number } | null>(null)
  const soundsRef = useRef<Partial<Record<PvzSound, HTMLAudioElement>>>({})

  useEffect(() => {
    const soundPaths: Record<PvzSound, string> = {
      click: 'assets/pvzgw2/sounds/Audio_Always_Loaded.062.ogg',
      generate: 'assets/pvzgw2/sounds/plants-vs-zombies-sun-pickup.mp3',
      reroll: 'assets/pvzgw2/sounds/killpop.mp3',
      rouletteBuild: 'assets/pvzgw2/sounds/Audio_Always_Loaded.048.ogg',
      rouletteSpin: 'assets/pvzgw2/sounds/Audio_Always_Loaded.029.ogg',
      rouletteWin: 'assets/pvzgw2/sounds/Audio_Always_Loaded.082.ogg',
    }
    Object.entries(soundPaths).forEach(([key, path]) => {
      const audio = new Audio(`${asset(path)}?v=20`)
      audio.preload = 'auto'
      soundsRef.current[key as PvzSound] = audio
    })
    return () => {
      Object.values(soundsRef.current).forEach((audio) => audio?.pause())
      soundsRef.current = {}
    }
  }, [baseUrl])

  function playSound(kind: PvzSound) {
    if (!soundEnabled || soundVolume <= 0) return
    const audio = soundsRef.current[kind]
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    audio.volume = Math.max(0, Math.min(1, soundVolume))
    void audio.play().catch(() => undefined)
  }

  const eligibleCharacters = useMemo(() => pvzCharacters.filter((item) => (
    (useVariants || !item.isVariant)
    && (includeDlc || !item.isDlc)
  )), [includeDlc, useVariants])

  const eligibleBySide = useMemo(() => ({
    plants: eligibleCharacters.filter((item) => item.side === 'plants'),
    zombies: eligibleCharacters.filter((item) => item.side === 'zombies'),
  }), [eligibleCharacters])

  useEffect(() => {
    warmImageCache(eligibleCharacters.map((item) => asset(item.portrait)), 10)
  }, [baseUrl, eligibleCharacters])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem('overroll.web.pvz.players', JSON.stringify(players))
      window.localStorage.setItem('overroll.web.pvz.picks', JSON.stringify(picks.map((pick) => ({ key: pick.character?.key ?? '', locked: pick.locked }))))
      window.localStorage.setItem('overroll.web.pvz.avoidRepeated', JSON.stringify(avoidRepeated))
      window.localStorage.setItem('overroll.web.pvz.useVariants', JSON.stringify(useVariants))
      window.localStorage.setItem('overroll.web.pvz.includeDlc', JSON.stringify(includeDlc))
      window.localStorage.setItem('overroll.web.pvz.sideSwitchEnabled', JSON.stringify(sideSwitchEnabled))
      window.localStorage.setItem('overroll.web.pvz.rouletteSide', JSON.stringify(rouletteSide))
      window.localStorage.setItem('overroll.web.pvz.rouletteSelectedKeys', JSON.stringify(rouletteSelectedKeys))
      window.localStorage.setItem('overroll.web.pvz.rouletteWeights', JSON.stringify(rouletteWeights))
    }, 160)
    return () => window.clearTimeout(timeout)
  }, [players, picks, avoidRepeated, useVariants, includeDlc, sideSwitchEnabled, rouletteSide, rouletteSelectedKeys, rouletteWeights])

  useEffect(() => {
    const eligible = new Set(eligibleCharacters.map((item) => item.key))
    setPicks((current) => current.map((pick, index) => {
      if (!pick.character || eligible.has(pick.character.key)) return pick
      const player = players[index]
      const options = player ? eligibleBySide[player.side].filter((item) => !player.blocked.includes(item.key)) : []
      return { character: options[randomIndex(options.length)] ?? null, locked: false }
    }))
    setRouletteEntries([])
    setRouletteWinnerKey('')
    setRouletteRotation(0)
    setRouletteDirty(true)
  }, [useVariants, includeDlc])

  useEffect(() => () => {
    animationRef.current?.cancel()
    animationRef.current = null
    pendingSpinRef.current = null
  }, [])

  useEffect(() => {
    if (rouletteSpinRequest === 0) return undefined
    const pending = pendingSpinRef.current
    const rotor = rotorRef.current
    if (!pending || !rotor || pending.entries.length < 2) return undefined

    pendingSpinRef.current = null
    animationRef.current?.cancel()
    const segmentAngle = 360 / pending.entries.length
    const start = normalizedDegrees(rouletteRotation)
    const winnerAngle = normalizedDegrees(-(pending.winnerIndex + 0.5) * segmentAngle)
    const target = start + (animationsEnabled ? 5 + randomIndex(2) : 1) * 360 + normalizedDegrees(winnerAngle - start)
    const duration = animationsEnabled ? 2250 : 1
    rotor.style.transform = `rotate(${start}deg)`
    const animation = rotor.animate([
      { transform: `rotate(${start}deg)`, offset: 0 },
      { transform: `rotate(${start + (animationsEnabled ? 5 : 1) * 292}deg)`, offset: .74 },
      { transform: `rotate(${target}deg)`, offset: 1 },
    ], { duration, easing: 'cubic-bezier(.11,.67,.14,1)', fill: 'forwards' })
    animationRef.current = animation

    const finish = () => {
      if (animationRef.current !== animation) return
      setRouletteRotation(target)
      setRouletteWinnerKey(pending.entries[pending.winnerIndex])
      setRouletteSpinning(false)
      playSound('rouletteWin')
      const winner = pvzCharacters.find((item) => item.key === pending.entries[pending.winnerIndex])
      notify(winner ? `${winner.name} ganó la ruleta ${pvzSideSingular[winner.side]}` : 'La ruleta eligió un ganador', 'success')
      window.requestAnimationFrame(() => {
        if (animationRef.current === animation) {
          animation.cancel()
          animationRef.current = null
        }
      })
    }
    void animation.finished.then(finish).catch(() => undefined)
    return () => {
      if (animationRef.current === animation && animation.playState !== 'finished') {
        animation.cancel()
        animationRef.current = null
      }
    }
  }, [rouletteSpinRequest])

  function optionsForPlayer(player: PvzPlayer, excluded = new Set<string>()) {
    return eligibleBySide[player.side].filter((item) => !player.blocked.includes(item.key) && !excluded.has(item.key))
  }

  function buildTeam(target: PvzSide | 'both', roster: PvzPlayer[] = players) {
    const result = roster.map((_, index) => picks[index] ?? { character: null, locked: false })
    const used = new Set<string>()
    const openIndexes: number[] = []

    roster.forEach((player, index) => {
      const current = result[index]
      const targeted = target === 'both' || player.side === target
      const valid = Boolean(current.character && current.character.side === player.side && optionsForPlayer(player).some((item) => item.key === current.character?.key))
      if (!targeted || (current.locked && valid)) {
        if (current.character) used.add(current.character.key)
      } else {
        openIndexes.push(index)
      }
    })

    const ordered = [...openIndexes].sort((left, right) => optionsForPlayer(roster[left], avoidRepeated ? used : new Set()).length - optionsForPlayer(roster[right], avoidRepeated ? used : new Set()).length)
    function solve(position: number): boolean {
      if (position >= ordered.length) return true
      const playerIndex = ordered[position]
      const player = roster[playerIndex]
      const options = shuffle(optionsForPlayer(player, avoidRepeated ? used : new Set()))
      for (const character of options) {
        result[playerIndex] = { character, locked: false }
        if (avoidRepeated) used.add(character.key)
        if (solve(position + 1)) return true
        if (avoidRepeated) used.delete(character.key)
      }
      return false
    }

    if (!solve(0)) {
      openIndexes.forEach((index) => {
        const options = optionsForPlayer(roster[index])
        result[index] = { character: options[randomIndex(options.length)] ?? null, locked: false }
      })
    }
    return result
  }

  function changePlayerCount(delta: number) {
    const nextCount = Math.max(2, Math.min(8, players.length + delta))
    if (nextCount === players.length) return
    setPlayers((old) => Array.from({ length: nextCount }, (_, index) => old[index] ?? makePlayer(index)))
    setPicks((old) => Array.from({ length: nextCount }, (_, index) => old[index] ?? { character: null, locked: false }))
    setFilterIndex(null)
    setStatus(`${nextCount} jugador${nextCount === 1 ? '' : 'es'} en Garden Warfare 2`)
    playSound('click')
  }

  function assignProfile(index: number, profileId: string) {
    const profile = profiles.find((item) => item.id === profileId)
    setPlayers((current) => current.map((player, playerIndex) => playerIndex === index ? {
      ...player,
      profileId,
      name: profile?.name ?? (player.profileId ? `Jugador ${index + 1}` : player.name),
    } : player))
    playSound('click')
  }

  function chooseForSide(player: PvzPlayer, index: number, side: PvzSide) {
    const adjusted = { ...player, side }
    const used = new Set(picks.filter((_, pickIndex) => pickIndex !== index).map((pick) => pick.character?.key).filter((key): key is string => Boolean(key)))
    const options = optionsForPlayer(adjusted, avoidRepeated ? used : new Set())
    return options[randomIndex(options.length)] ?? optionsForPlayer(adjusted)[0] ?? null
  }

  function setPlayerSide(index: number, side: PvzSide) {
    const player = players[index]
    if (!player || player.side === side) return
    const character = chooseForSide(player, index, side)
    setPlayers((current) => current.map((item, playerIndex) => playerIndex === index ? { ...item, side } : item))
    setPicks((current) => current.map((pick, pickIndex) => pickIndex === index ? { character, locked: false } : pick))
    setStatus(`${player.name || `Jugador ${index + 1}`} cambió a ${pvzSideLabels[side]}`)
    setGenerationRevision((value) => value + 1)
    playSound('click')
  }

  function clearNames() {
    setPlayers((current) => current.map((player, index) => ({ ...player, name: player.profileId ? profiles.find((profile) => profile.id === player.profileId)?.name ?? `Jugador ${index + 1}` : '' })))
    playSound('click')
    notify('Nombres de PVZ limpiados')
  }

  function shufflePlayers() {
    const payload = shuffle(players.map((player) => ({ name: player.name, profileId: player.profileId, blocked: player.blocked })))
    setPlayers((current) => current.map((player, index) => ({ ...player, ...payload[index] })))
    setPicks((current) => current.map((pick) => ({ ...pick, locked: false })))
    playSound('click')
    notify('Nombres, perfiles y filtros revueltos', 'success')
  }

  function resetSides() {
    setPlayers((current) => current.map((player, index) => ({ ...player, side: index < Math.ceil(current.length / 2) ? 'plants' : 'zombies' })))
    setPicks((current) => current.map(() => ({ character: null, locked: false })))
    setGenerationRevision((value) => value + 1)
    playSound('click')
    notify('Bandos equilibrados')
  }

  function randomizeBothSides(roster: PvzPlayer[], currentPicks: PvzPick[]) {
    const next = roster.map((player) => ({ ...player }))
    const openIndexes: number[] = []
    let fixedPlants = 0
    let fixedZombies = 0

    next.forEach((player, index) => {
      const pick = currentPicks[index]
      if (pick?.locked && pick.character) {
        player.side = pick.character.side
        if (player.side === 'plants') fixedPlants += 1
        else fixedZombies += 1
      } else {
        openIndexes.push(index)
      }
    })

    const idealPlants = Math.ceil(next.length / 2)
    const idealZombies = next.length - idealPlants
    let plantsNeeded = Math.max(0, idealPlants - fixedPlants)
    let zombiesNeeded = Math.max(0, idealZombies - fixedZombies)

    while (plantsNeeded + zombiesNeeded < openIndexes.length) {
      if (fixedPlants + plantsNeeded <= fixedZombies + zombiesNeeded) plantsNeeded += 1
      else zombiesNeeded += 1
    }
    while (plantsNeeded + zombiesNeeded > openIndexes.length) {
      if (plantsNeeded > zombiesNeeded) plantsNeeded -= 1
      else zombiesNeeded -= 1
    }

    const sidePool: PvzSide[] = [
      ...Array.from({ length: plantsNeeded }, () => 'plants' as const),
      ...Array.from({ length: zombiesNeeded }, () => 'zombies' as const),
    ]

    let shuffledSides = shuffle(sidePool)
    const sameDistribution = openIndexes.length > 1 && openIndexes.every((playerIndex, poolIndex) => next[playerIndex].side === shuffledSides[poolIndex])
    if (sameDistribution) shuffledSides = [...shuffledSides.slice(1), shuffledSides[0]]

    openIndexes.forEach((playerIndex, poolIndex) => {
      next[playerIndex].side = shuffledSides[poolIndex]
    })
    return next
  }

  function generateTeam(target: PvzSide | 'both') {
    if (generating || rerollingIndex !== null) return
    setGenerating(true)
    setStatus(target === 'plants' ? 'Cultivando equipo Planta…' : target === 'zombies' ? 'Reuniendo equipo Zombi…' : 'Preparando Plantas y Zombis…')
    playSound('generate')

    const roster = target === 'both'
      ? randomizeBothSides(players, picks)
      : players
    const next = buildTeam(target, roster)
    const missing = next.filter((pick, index) => (target === 'both' || roster[index].side === target) && !pick.character).length

    if (target === 'both') setPlayers(roster)
    setPicks(next)
    setGenerationRevision((value) => value + 1)
    window.setTimeout(() => {
      setGenerating(false)
      if (missing) {
        setStatus(`${missing} ficha${missing === 1 ? '' : 's'} sin personaje compatible`)
        notify('Revisa filtros, variantes o DLC de PVZ GW2.', 'warning')
      } else {
        const plantTotal = roster.filter((player) => player.side === 'plants').length
        const zombieTotal = roster.filter((player) => player.side === 'zombies').length
        setStatus(target === 'both' ? `${plantTotal} Plantas y ${zombieTotal} Zombis generados` : `${pvzSideLabels[target]} listos`)
      }
    }, animationsEnabled ? 300 : 25)
  }

  function reroll(index: number) {
    const player = players[index]
    const current = picks[index]
    if (!player || current?.locked || generating || rerollingIndex !== null) return
    setRerollingIndex(index)
    playSound('reroll')
    const used = new Set(picks.filter((_, pickIndex) => pickIndex !== index).map((pick) => pick.character?.key).filter((key): key is string => Boolean(key)))
    const excluded = new Set<string>(avoidRepeated ? used : [])
    if (current?.character) excluded.add(current.character.key)
    let options = optionsForPlayer(player, excluded)
    if (!options.length) options = optionsForPlayer(player, current?.character ? new Set([current.character.key]) : new Set())
    const character = options[randomIndex(options.length)] ?? current?.character ?? null
    window.setTimeout(() => {
      setPicks((rows) => rows.map((pick, pickIndex) => pickIndex === index ? { character, locked: false } : pick))
      setRerollingIndex(null)
      setStatus(`Reroll de ${player.name || `Jugador ${index + 1}`}`)
      if (!character) notify('No hay otro personaje compatible con ese filtro.', 'warning')
    }, animationsEnabled ? 210 : 20)
  }

  function toggleLock(index: number) {
    const pick = picks[index]
    if (!pick?.character) return
    const locked = !pick.locked
    setPicks((current) => current.map((item, pickIndex) => pickIndex === index ? { ...item, locked } : item))
    playSound('click')
    notify(locked ? `${pick.character.name} quedó fijado` : `${pick.character.name} fue liberado`)
  }

  function openFilter(index: number) {
    setFilterIndex(index)
    setFilterSearch('')
    playSound('click')
  }

  function toggleBlocked(key: string) {
    if (filterIndex === null) return
    const player = players[filterIndex]
    if (!player) return
    const eligible = eligibleBySide[player.side]
    const currentlyBlocked = player.blocked.includes(key)
    const allowedCount = eligible.filter((item) => !player.blocked.includes(item.key)).length
    if (!currentlyBlocked && allowedCount <= 1) {
      notify('Debes dejar al menos un personaje permitido.', 'warning')
      return
    }
    setPlayers((current) => current.map((item, index) => index === filterIndex ? {
      ...item,
      blocked: currentlyBlocked ? item.blocked.filter((blocked) => blocked !== key) : [...item.blocked, key],
    } : item))
    playSound('click')
  }

  function clearFilter() {
    if (filterIndex === null) return
    setPlayers((current) => current.map((item, index) => index === filterIndex ? { ...item, blocked: [] } : item))
    playSound('click')
  }

  const plantCount = players.filter((player) => player.side === 'plants').length
  const zombieCount = players.length - plantCount
  const lockedCount = picks.filter((pick) => pick.locked).length
  const filterPlayer = filterIndex === null ? null : players[filterIndex] ?? null
  const filterRows = useMemo(() => {
    if (!filterPlayer) return []
    const query = filterSearch.trim().toLocaleLowerCase('es-MX')
    return eligibleBySide[filterPlayer.side].filter((item) => !query || item.name.toLocaleLowerCase('es-MX').includes(query) || item.baseName.toLocaleLowerCase('es-MX').includes(query))
  }, [filterPlayer, filterSearch, eligibleBySide])

  async function generateImage() {
    if (!picks.some((pick) => pick.character)) {
      notify('Primero genera al menos un bando.', 'warning')
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = 2000
    canvas.height = 1260
    const context = canvas.getContext('2d')
    if (!context) return
    const background = context.createLinearGradient(0, 0, canvas.width, canvas.height)
    background.addColorStop(0, '#071a12')
    background.addColorStop(.52, '#0b1a20')
    background.addColorStop(1, '#171022')
    context.fillStyle = background
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = 'rgba(107, 191, 142, .08)'
    context.lineWidth = 1
    for (let x = 0; x <= canvas.width; x += 72) {
      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x, canvas.height)
      context.stroke()
    }
    for (let y = 0; y <= canvas.height; y += 72) {
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(canvas.width, y)
      context.stroke()
    }
    context.fillStyle = '#f7d85b'
    context.font = '900 31px system-ui, sans-serif'
    context.fillText('OVERROLL', 72, 72)
    context.fillStyle = '#f4fbf2'
    context.font = '900 56px system-ui, sans-serif'
    context.fillText('PVZ GW2', 72, 140)

    const columns = Math.min(4, Math.max(1, players.length))
    const rows = Math.ceil(players.length / columns)
    const gap = 22
    const left = 72
    const top = 225
    const totalWidth = canvas.width - left * 2
    const totalHeight = 930
    const cardWidth = (totalWidth - gap * (columns - 1)) / columns
    const cardHeight = (totalHeight - gap * (rows - 1)) / rows
    await Promise.all(players.map(async (player, index) => {
      const pick = picks[index]
      const character = pick?.character
      const color = pvzSideColors[player.side]
      const column = index % columns
      const row = Math.floor(index / columns)
      const x = left + column * (cardWidth + gap)
      const y = top + row * (cardHeight + gap)
      context.fillStyle = player.side === 'plants' ? 'rgba(9,35,23,.96)' : 'rgba(30,20,42,.96)'
      context.fillRect(x, y, cardWidth, cardHeight)
      context.strokeStyle = pick?.locked ? '#ffd35a' : color
      context.lineWidth = pick?.locked ? 6 : 4
      context.strokeRect(x, y, cardWidth, cardHeight)
      context.fillStyle = 'rgba(2,10,12,.72)'
      context.fillRect(x + 4, y + 4, cardWidth - 8, 48)
      context.fillStyle = color
      context.font = '800 17px system-ui, sans-serif'
      context.fillText(String(index + 1).padStart(2, '0'), x + 17, y + 34)
      context.fillStyle = '#e7f3ea'
      context.font = '700 17px system-ui, sans-serif'
      context.fillText((player.name || `Jugador ${index + 1}`).slice(0, 24), x + 55, y + 34)
      const portraitX = x + 12
      const portraitY = y + 64
      const portraitWidth = cardWidth - 24
      const portraitHeight = Math.max(180, cardHeight - 170)
      context.fillStyle = '#0a1a18'
      context.fillRect(portraitX, portraitY, portraitWidth, portraitHeight)
      if (character) {
        try {
          const image = await loadCanvasImage(asset(character.portrait))
          drawCover(context, image, portraitX, portraitY, portraitWidth, portraitHeight)
        } catch { /* keep fallback */ }
      }
      const fade = context.createLinearGradient(0, portraitY + portraitHeight * .55, 0, portraitY + portraitHeight)
      fade.addColorStop(0, 'rgba(2,8,10,0)')
      fade.addColorStop(1, 'rgba(2,8,10,.94)')
      context.fillStyle = fade
      context.fillRect(portraitX, portraitY, portraitWidth, portraitHeight)
      context.textAlign = 'center'
      context.fillStyle = '#ffffff'
      context.font = '900 28px system-ui, sans-serif'
      context.fillText((character?.name ?? 'SIN SELECCIÓN').toUpperCase(), x + cardWidth / 2, y + cardHeight - 82)
      context.fillStyle = color
      context.font = '800 16px system-ui, sans-serif'
      context.fillText(`${pvzSideSingular[player.side].toUpperCase()} · ${character?.baseName.toUpperCase() ?? 'CATÁLOGO'}`, x + cardWidth / 2, y + cardHeight - 48)
      context.textAlign = 'left'
    }))
    context.textAlign = 'right'
    context.fillStyle = '#8ba09a'
    context.font = '600 17px system-ui, sans-serif'
    context.fillText('Generado con OverRoll', canvas.width - 72, canvas.height - 42)
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `overroll-pvzgw2-${new Date().toISOString().slice(0, 10)}.png`
      anchor.click()
      URL.revokeObjectURL(url)
      notify('Imagen de PVZ GW2 generada', 'success')
    }, 'image/png')
  }

  const rouletteEligible = eligibleBySide[rouletteSide]
  const rouletteVisible = useMemo(() => {
    const query = rouletteSearch.trim().toLocaleLowerCase('es-MX')
    return rouletteEligible.filter((item) => !query || item.name.toLocaleLowerCase('es-MX').includes(query) || item.baseName.toLocaleLowerCase('es-MX').includes(query))
  }, [rouletteEligible, rouletteSearch])
  const roulettePool = useMemo(() => {
    const selected = new Set(rouletteSelectedKeys)
    return rouletteEligible.filter((item) => selected.has(item.key))
  }, [rouletteEligible, rouletteSelectedKeys])
  const rouletteTotal = useMemo(() => roulettePool.reduce((sum, item) => sum + Math.max(1, Math.min(64, Math.round(Number(rouletteWeights[item.key] ?? 1)))), 0), [roulettePool, rouletteWeights])
  const builtCharacters = useMemo(() => {
    const byKey = new Map(pvzCharacters.map((item) => [item.key, item]))
    return rouletteEntries.map((key) => byKey.get(key)).filter((item): item is PvzCharacter => Boolean(item))
  }, [rouletteEntries])
  const winner = pvzCharacters.find((item) => item.key === rouletteWinnerKey) ?? null

  function rouletteWeight(key: string) {
    const value = Number(rouletteWeights[key] ?? 1)
    return Math.max(1, Math.min(64, Math.round(Number.isFinite(value) ? value : 1)))
  }

  function rouletteProbability(key: string) {
    if (!rouletteSelectedKeys.includes(key) || rouletteTotal <= 0) return 0
    return rouletteWeight(key) * 100 / rouletteTotal
  }

  function markRouletteDirty(message?: string) {
    setRouletteDirty(true)
    setRouletteEntries([])
    setRouletteWinnerKey('')
    setRouletteRotation(0)
    setStatus(message ?? 'La ruleta PVZ tiene cambios pendientes')
  }

  function changeRouletteSide(side: PvzSide) {
    if (side === rouletteSide || rouletteSpinning) return
    setRouletteSide(side)
    setRouletteSearch('')
    const hasSelection = pvzCharacters.some((item) => item.side === side && rouletteSelectedKeys.includes(item.key) && (useVariants || !item.isVariant) && (includeDlc || !item.isDlc))
    if (!hasSelection) {
      const sideKeys = eligibleBySide[side].map((item) => item.key)
      setRouletteSelectedKeys((current) => [...current.filter((key) => !pvzCharacters.some((item) => item.key === key && item.side === side)), ...sideKeys])
      setRouletteWeights((current) => ({ ...current, ...Object.fromEntries(sideKeys.map((key) => [key, 1])) }))
    }
    markRouletteDirty(`Ruleta ${pvzSideSingular[side]} seleccionada`)
    playSound('click')
  }

  function toggleRouletteCharacter(key: string) {
    if (rouletteSpinning) return
    const selected = rouletteSelectedKeys.includes(key)
    const next = selected ? rouletteSelectedKeys.filter((item) => item !== key) : [...rouletteSelectedKeys, key]
    setRouletteSelectedKeys(next)
    setRouletteWeights((current) => {
      const copy = { ...current }
      if (selected) delete copy[key]
      else copy[key] = roulettePool.length === 0 ? 2 : 1
      const currentSideKeys = next.filter((itemKey) => pvzCharacters.find((item) => item.key === itemKey)?.side === rouletteSide)
      if (currentSideKeys.length === 1) copy[currentSideKeys[0]] = Math.max(2, copy[currentSideKeys[0]] ?? 2)
      return copy
    })
    markRouletteDirty(selected ? 'Personaje retirado' : 'Personaje añadido')
    playSound('click')
  }

  function changeRouletteWeight(key: string, delta: number) {
    if (rouletteSpinning || !rouletteSelectedKeys.includes(key)) return
    const current = rouletteWeight(key)
    if (delta > 0 && rouletteTotal >= 64) return
    if (delta < 0 && (current <= 1 || rouletteTotal <= 2)) return
    setRouletteWeights((weights) => ({ ...weights, [key]: Math.max(1, Math.min(64, current + delta)) }))
    markRouletteDirty('Probabilidades actualizadas')
    playSound('click')
  }

  function selectAllRoulette() {
    const currentSideKeys = new Set(pvzCharacters.filter((item) => item.side === rouletteSide).map((item) => item.key))
    const sideKeys = rouletteEligible.map((item) => item.key)
    setRouletteSelectedKeys((current) => [...current.filter((key) => !currentSideKeys.has(key)), ...sideKeys])
    setRouletteWeights((current) => ({ ...current, ...Object.fromEntries(sideKeys.map((key) => [key, 1])) }))
    markRouletteDirty(`${pvzSideLabels[rouletteSide]} seleccionados`)
    playSound('click')
  }

  function clearRoulette() {
    const currentSideKeys = new Set(pvzCharacters.filter((item) => item.side === rouletteSide).map((item) => item.key))
    setRouletteSelectedKeys((current) => current.filter((key) => !currentSideKeys.has(key)))
    setRouletteWeights((current) => {
      const copy = { ...current }
      currentSideKeys.forEach((key) => delete copy[key])
      return copy
    })
    markRouletteDirty('Selecciona al menos un personaje')
    playSound('click')
  }

  function buildRoulette(playAudio = true) {
    if (rouletteSpinning || roulettePool.length === 0 || rouletteTotal > 64) return [] as string[]
    const entries = shuffle(roulettePool.flatMap((item) => Array.from({ length: rouletteWeight(item.key) }, () => item.key))).slice(0, 64)
    if (entries.length === 1) entries.push(entries[0])
    setRouletteEntries(entries)
    setRouletteWinnerKey('')
    setRouletteRotation(0)
    setRouletteDirty(false)
    setStatus(`Ruleta ${pvzSideSingular[rouletteSide]} construida`)
    if (playAudio) playSound('rouletteBuild')
    return entries
  }

  function spinRoulette() {
    if (rouletteSpinning || roulettePool.length === 0) return
    const entries = rouletteDirty || rouletteEntries.length < 2 ? buildRoulette(false) : rouletteEntries
    if (entries.length < 2) return
    const winnerIndex = randomIndex(entries.length)
    setRouletteWinnerKey('')
    setRouletteSpinning(true)
    setStatus(`Girando ruleta ${pvzSideSingular[rouletteSide]}…`)
    playSound('rouletteSpin')
    pendingSpinRef.current = { entries, winnerIndex }
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => setRouletteSpinRequest((value) => value + 1)))
  }

  function renderPrincipal() {
    return (
      <main className={`workspace pvz-workspace ${mobileCompactMode ? 'pvz-mobile-compact' : ''}`}>
        <aside className={`sidebar pvz-sidebar ${mobileConfigOpen ? 'mobile-config-open' : 'mobile-config-closed'}`}>
          <div className="sidebar-head pvz-sidebar-head">
            <div><span className="eyebrow">Preparar partida</span><strong>Garden Warfare 2</strong></div>
            <span className="live-dot pvz-live"><span /> PVZ</span>
            <button type="button" className="mobile-config-toggle" onClick={() => { setMobileConfigOpen((value) => !value); playSound('click') }} aria-expanded={mobileConfigOpen}><PvzIcon name={mobileConfigOpen ? 'close' : 'settings'} size={15} /><span>{mobileConfigOpen ? 'Ocultar' : 'Editar'}</span></button>
          </div>
          {mobileConfigOpen && <div className="mobile-config-tabs pvz-mobile-tabs" role="tablist"><button type="button" className={mobileTab === 'squad' ? 'active' : ''} onClick={() => setMobileTab('squad')}><PvzIcon name="users" size={14} /> Escuadra</button><button type="button" className={mobileTab === 'rules' ? 'active' : ''} onClick={() => setMobileTab('rules')}><PvzIcon name="settings" size={14} /> Reglas</button></div>}

          <section className={`side-panel pvz-side-panel pvz-squad-panel mobile-config-section ${mobileTab === 'squad' ? 'mobile-active' : ''}`}>
            <div className="panel-title-row"><div><label>Escuadra</label><small>Nombres, perfiles y bando por jugador</small></div><PvzIcon name="users" size={17} /></div>
            <div className="squad-counter pvz-counter"><button type="button" onClick={() => changePlayerCount(-1)} disabled={players.length <= 1 || generating}>−</button><strong>{players.length} jugador{players.length === 1 ? '' : 'es'}</strong><button type="button" onClick={() => changePlayerCount(1)} disabled={players.length >= 8 || generating}>+</button></div>
            <div className="pvz-side-balance"><span className="plants">{plantCount} plantas</span><i /><span className="zombies">{zombieCount} zombis</span></div>
            <div className="squad-tools pvz-squad-tools"><button type="button" onClick={clearNames}><PvzIcon name="trash" size={14} /><span>Nombres</span></button><button type="button" onClick={shufflePlayers}><PvzIcon name="shuffle" size={14} /><span>Revolver</span></button><button type="button" onClick={resetSides}><PvzIcon name="reset" size={14} /><span>Bandos</span></button></div>
            <div className="players pvz-players">
              {players.map((player, index) => <div className={`pvz-player-row ${player.side}`} key={player.id}>
                <span className="pvz-player-number">{String(index + 1).padStart(2, '0')}</span>
                <input value={isDefaultPlayerName(player.name, index + 1) ? localizedPlayerName(locale, index + 1) : player.name} disabled={Boolean(player.profileId)} onChange={(event: ChangeEvent<HTMLInputElement>) => setPlayers((current) => current.map((item, playerIndex) => playerIndex === index ? { ...item, name: event.target.value } : item))} maxLength={22} aria-label={`Nombre PVZ ${index + 1}`} />
                <select value={player.profileId} onChange={(event: ChangeEvent<HTMLSelectElement>) => assignProfile(index, event.target.value)} aria-label={`Perfil PVZ ${index + 1}`}><option value="">☆</option>{profiles.map((profile) => <option value={profile.id} key={profile.id}>{profile.name}</option>)}</select>
                <div className="pvz-side-buttons"><button type="button" className={`plants ${player.side === 'plants' ? 'active' : ''}`} onClick={() => setPlayerSide(index, 'plants')} aria-pressed={player.side === 'plants'}><span>PL</span><small>Planta</small></button><button type="button" className={`zombies ${player.side === 'zombies' ? 'active' : ''}`} onClick={() => setPlayerSide(index, 'zombies')} aria-pressed={player.side === 'zombies'}><span>ZO</span><small>Zombi</small></button></div>
              </div>)}
            </div>
          </section>

          <section className={`side-panel pvz-side-panel pvz-rules-panel mobile-config-section ${mobileTab === 'rules' ? 'mobile-active' : ''}`}>
            <div className="panel-title-row"><div><label>Reglas</label><small>Ajustes exclusivos de PVZ GW2</small></div><PvzIcon name="settings" size={17} /></div>
            {[
              { label: 'Evitar personajes repetidos', note: 'Una variante por ficha cuando sea posible', value: avoidRepeated, setter: setAvoidRepeated },
              { label: 'Usar variantes', note: 'Incluye todas las variantes del catálogo', value: useVariants, setter: setUseVariants },
              { label: 'Incluir personajes DLC', note: 'Agrega personajes especiales y desbloqueables', value: includeDlc, setter: setIncludeDlc },
              { label: 'Permitir cambio de bando', note: 'El botón de ficha reemplaza el resultado al instante', value: sideSwitchEnabled, setter: setSideSwitchEnabled },
            ].map((rule) => <button type="button" className={`toggle-row pvz-toggle ${rule.value ? 'enabled' : ''}`} onClick={() => { rule.setter(!rule.value); playSound('click') }} aria-pressed={rule.value} key={rule.label}><span className="switch"><span /></span><span><b>{rule.label}</b><small>{rule.note}</small></span></button>)}
            <div className="pvz-catalog-summary"><span className="plants"><b>{eligibleBySide.plants.length}</b><small>Plantas disponibles</small></span><span className="zombies"><b>{eligibleBySide.zombies.length}</b><small>Zombis disponibles</small></span></div>
          </section>

          <div className="sidebar-footer pvz-sidebar-footer">
            <div className="status-line pvz-status"><span className="status-icon"><PvzIcon name="check" size={15} /></span><span>{status}</span></div>
            <div className="pvz-generate-grid pvz-side-generate-grid"><button type="button" className="pvz-generate plants" onClick={() => generateTeam('plants')} disabled={generating || rerollingIndex !== null}><PvzIcon name="spark" size={17} /><span>Generar plantas</span></button><button type="button" className="pvz-generate zombies" onClick={() => generateTeam('zombies')} disabled={generating || rerollingIndex !== null}><PvzIcon name="spark" size={17} /><span>Generar zombis</span></button></div>
          </div>
        </aside>

        <section className="content pvz-content">
          <div className="content-topline pvz-topline"><div className="game-identity"><span className="game-kicker">Selector por facción</span><div className="game-title-row"><h1>PVZ Garden Warfare 2</h1><span className="web-badge pvz-badge">121 PERSONAJES</span></div></div><div className="topline-actions"><button type="button" className="generate-image-button pvz-image-button" onClick={generateImage} disabled={!picks.some((pick) => pick.character)}><PvzIcon name="download" size={17} /> Generar imagen</button><div className="match-summary pvz-summary"><div><small>Plantas</small><strong>{plantCount}</strong></div><div><small>Zombis</small><strong>{zombieCount}</strong></div><div><small>Fijados</small><strong>{lockedCount}</strong></div></div></div></div>
          <div className="team-stage pvz-stage"><div className="stage-grid" /><div className={`pvz-team-grid cards-${players.length}`}>
            {players.map((player, index) => {
              const pick = picks[index]
              const character = pick?.character
              const profile = profiles.find((item) => item.id === player.profileId)
              const generationClass = generationRevision % 2 === 0 ? 'generation-a' : 'generation-b'
              return <article className={`pvz-card ${player.side} ${generationClass} ${pick?.locked ? 'is-locked' : ''} ${rerollingIndex === index ? 'is-rerolling' : ''}`} style={{ '--delay': `${index * 45}ms`, '--pvz-accent': pvzSideColors[player.side] } as CSSProperties} key={player.id}>
                <div className="pvz-card-player"><span>{String(index + 1).padStart(2, '0')}</span><strong>{isDefaultPlayerName(player.name, index + 1) ? localizedPlayerName(locale, index + 1) : (player.name || localizedPlayerName(locale, index + 1))}</strong>{profile && <i>{profile.name.charAt(0).toUpperCase()}</i>}{pick?.locked && <b><PvzIcon name="lock" size={12} /></b>}</div>
                <div className="pvz-portrait">{character ? <img src={asset(character.portrait)} alt={character.name} decoding="async" draggable={false} /> : <div className="pvz-empty-portrait"><PvzIcon name="spark" size={44} /><span>Genera este bando</span></div>}<div className="pvz-portrait-fade" /><span className="pvz-side-watermark">{player.side === 'plants' ? 'PLANTA' : 'ZOMBI'}</span></div>
                <div className="pvz-card-title"><h2>{character?.name ?? 'Sin selección'}</h2><span className={player.side}>{pvzSideSingular[player.side]}</span></div>
                <div className="pvz-card-actions"><button type="button" onClick={() => reroll(index)} disabled={!character || pick?.locked || generating || rerollingIndex !== null} title="Cambiar personaje"><PvzIcon name="reroll" size={18} /></button><button type="button" onClick={() => openFilter(index)} title="Filtro individual"><PvzIcon name="filter" size={18} /><span>{player.blocked.length || ''}</span></button>{sideSwitchEnabled && <button type="button" className="side-switch" onClick={() => setPlayerSide(index, player.side === 'plants' ? 'zombies' : 'plants')} title="Cambiar bando y reemplazar"><PvzIcon name="switch" size={18} /></button>}<button type="button" className={pick?.locked ? 'active-lock' : ''} onClick={() => toggleLock(index)} disabled={!character} title={pick?.locked ? 'Desbloquear' : 'Bloquear'}><PvzIcon name={pick?.locked ? 'unlock' : 'lock'} size={18} /></button></div>
                <div className="pvz-variant-panel">{character ? <img src={asset(character.portrait)} alt="" /> : <span className="pvz-variant-placeholder" />}<div><small>{character?.isVariant ? 'VARIANTE' : 'CLASE BASE'}</small><strong>{character?.isVariant ? character.name : 'Predeterminado'}</strong><span>{character?.baseName ?? pvzSideLabels[player.side]}</span></div>{character?.isDlc && <b>DLC</b>}</div>
              </article>
            })}
          </div></div>
        </section>

        <ViewportAction className="pvz-principal-generate-dock">
          <button type="button" className={`generate principal-generate-action pvz-principal-generate ${generating ? 'generating' : ''}`} onClick={() => generateTeam('both')} disabled={generating || rerollingIndex !== null}>
            <span className="generate-glow" /><PvzIcon name={generating ? 'reroll' : 'spark'} size={19} /><span>{generating ? 'Preparando…' : 'Generar ambos'}</span>
          </button>
        </ViewportAction>

        {filterPlayer && <div className="filter-layer pvz-filter-layer" role="presentation" onMouseDown={(event: MouseEvent<HTMLDivElement>) => { if (event.currentTarget === event.target) setFilterIndex(null) }}><section className={`filter-dialog pvz-filter-dialog ${filterPlayer.side}`} role="dialog" aria-modal="true"><header className="filter-heading"><div><span className="eyebrow">Filtro individual · {pvzSideSingular[filterPlayer.side]}</span><h2>{filterPlayer.name || `Jugador ${filterIndex! + 1}`}</h2><p>{eligibleBySide[filterPlayer.side].length - filterPlayer.blocked.filter((key) => eligibleBySide[filterPlayer.side].some((item) => item.key === key)).length} permitidos · {filterPlayer.blocked.length} bloqueados</p></div><button type="button" onClick={() => setFilterIndex(null)}><PvzIcon name="close" size={20} /></button></header><div className="filter-toolbar pvz-filter-toolbar"><label className="profile-search"><PvzIcon name="filter" size={16} /><input value={filterSearch} onChange={(event: ChangeEvent<HTMLInputElement>) => setFilterSearch(event.target.value)} placeholder="Buscar personaje o clase…" /></label><button type="button" className="reset-classification" onClick={clearFilter}><PvzIcon name="reset" size={15} /> Reiniciar</button></div><div className="pvz-filter-grid">{filterRows.map((item) => { const blocked = filterPlayer.blocked.includes(item.key); return <button type="button" className={`pvz-filter-card ${item.side} ${blocked ? 'blocked' : ''}`} onClick={() => toggleBlocked(item.key)} aria-pressed={blocked} key={item.key}><img src={asset(item.portrait)} alt="" /><span><strong>{item.name}</strong><small>{blocked ? 'BLOQUEADO' : item.isVariant ? item.baseName : 'PREDETERMINADO'}</small></span><i>{blocked ? '×' : '✓'}</i></button> })}</div></section></div>}
      </main>
    )
  }

  function renderRoulette() {
    const wheelCount = builtCharacters.length
    const imageRadius = wheelCount <= 12 ? 126 : wheelCount <= 24 ? 137 : 145
    const imageSize = wheelCount <= 12 ? 42 : wheelCount <= 24 ? 32 : wheelCount <= 40 ? 24 : 18
    const selected = new Set(rouletteSelectedKeys)
    const selectedVisible = rouletteVisible.filter((item) => selected.has(item.key)).length
    const buildStatus = rouletteDirty
      ? roulettePool.length > 0 ? 'Cambios sin construir' : 'Sin participantes'
      : `${rouletteEntries.length} casillas listas`
    const accent = pvzSideColors[rouletteSide]

    return <main className="utility-page roulette-page roulette-maker-v2 unified-game-roulette pvz-unified-roulette" style={{ '--yellow': accent, '--cyan': accent, '--pvz-wheel-accent': accent } as CSSProperties}>
      <header className="roulette-heading">
        <div><span className="eyebrow">Modo independiente · PVZ Garden Warfare 2</span><h1>Ruleta Maker</h1><p>La misma estructura de Overwatch, con selecciones independientes para Plantas y Zombis.</p></div>
        <div className="roulette-heading-stats"><span><small>PERSONAJES</small><b>{roulettePool.length}</b></span><span><small>CASILLAS</small><b>{rouletteTotal}/64</b></span><span className={rouletteDirty ? 'pending' : 'ready'}><small>ESTADO</small><b>{rouletteDirty ? 'EDITANDO' : 'LISTA'}</b></span></div>
      </header>

      <section className="roulette-maker-layout">
        <section className="roulette-builder-panel">
          <header className="roulette-section-heading"><div><span className="eyebrow">01 · Configuración</span><h2>Participantes y probabilidad</h2></div><span className={`roulette-build-badge ${rouletteDirty ? 'pending' : 'ready'}`}>{buildStatus}</span></header>

          <div className="roulette-toolbar roulette-toolbar-v2">
            <label className="roulette-search"><PvzIcon name="filter" size={16} /><input type="search" value={rouletteSearch} onChange={(event: ChangeEvent<HTMLInputElement>) => setRouletteSearch(event.target.value)} placeholder={`Buscar ${pvzSideSingular[rouletteSide].toLowerCase()}…`} /></label>
            <div className="roulette-role-toggles pvz-unified-faction-tabs" role="group" aria-label="Facción visible">
              <button type="button" className={rouletteSide === 'plants' ? 'active' : ''} style={{ '--role-color': pvzSideColors.plants } as CSSProperties} onClick={() => changeRouletteSide('plants')}><i className="roulette-generic-role-mark" />Plantas</button>
              <button type="button" className={rouletteSide === 'zombies' ? 'active' : ''} style={{ '--role-color': pvzSideColors.zombies } as CSSProperties} onClick={() => changeRouletteSide('zombies')}><i className="roulette-generic-role-mark" />Zombis</button>
            </div>
            <div className="roulette-toolbar-actions"><button type="button" onClick={() => { const next = [...new Set([...rouletteSelectedKeys, ...rouletteVisible.map((item) => item.key)])]; setRouletteSelectedKeys(next); setRouletteWeights((current) => ({ ...current, ...Object.fromEntries(next.map((key) => [key, current[key] ?? 1])) })); markRouletteDirty(`${pvzSideLabels[rouletteSide]} visibles añadidos`) }} disabled={!rouletteVisible.length}>Añadir visibles</button><button type="button" onClick={() => { const visible = new Set(rouletteVisible.map((item) => item.key)); setRouletteSelectedKeys((current) => current.filter((key) => !visible.has(key))); markRouletteDirty(`${pvzSideLabels[rouletteSide]} visibles retirados`) }} disabled={!selectedVisible}>Quitar visibles</button></div>
          </div>

          <div className="roulette-bulk-actions"><button type="button" onClick={selectAllRoulette} disabled={rouletteSpinning}><PvzIcon name="check" size={14} /> Seleccionar facción</button><button type="button" onClick={() => { setRouletteWeights((current) => ({ ...current, ...Object.fromEntries(roulettePool.map((item) => [item.key, 1])) })); markRouletteDirty('Pesos igualados') }} disabled={!roulettePool.length || rouletteSpinning}><PvzIcon name="reset" size={14} /> Igualar pesos</button><button type="button" className="danger" onClick={clearRoulette} disabled={!roulettePool.length || rouletteSpinning}><PvzIcon name="trash" size={14} /> Vaciar facción</button></div>

          <div className="roulette-weight-grid">
            {rouletteVisible.map((item) => {
              const chosen = selected.has(item.key)
              const weight = rouletteWeight(item.key)
              const probability = rouletteProbability(item.key)
              return <article className={`roulette-weight-card ${chosen ? 'selected' : ''}`} style={{ '--role-color': pvzSideColors[item.side] } as CSSProperties} key={item.key}>
                <button type="button" className="roulette-hero-pick" onClick={() => !chosen && toggleRouletteCharacter(item.key)} disabled={rouletteSpinning}><img src={asset(item.portrait)} alt="" loading="lazy" decoding="async" /><span className="roulette-weight-copy"><strong>{item.name}</strong><small>{item.isVariant ? item.baseName : 'Predeterminado'}{item.isDlc ? ' · DLC' : ''}</small></span><i className="roulette-role-watermark roulette-generic-role-mark" />{!chosen && <span className="roulette-add-mark">+</span>}</button>
                {chosen && <div className="roulette-weight-controls"><button type="button" onClick={() => changeRouletteWeight(item.key, -1)} disabled={rouletteSpinning || weight <= 1 || rouletteTotal <= 2}>−</button><span className="roulette-weight-value"><small>PESO</small><b>x{weight}</b></span><button type="button" onClick={() => changeRouletteWeight(item.key, 1)} disabled={rouletteSpinning || rouletteTotal >= 64}>+</button><span className="roulette-probability"><small>PROB.</small><b>{probability.toFixed(1)}%</b><i><em style={{ width: `${Math.min(100, probability)}%` }} /></i></span><button type="button" className="remove" onClick={() => toggleRouletteCharacter(item.key)}>×</button></div>}
              </article>
            })}
          </div>

          {!rouletteVisible.length && <div className="roulette-empty-list"><PvzIcon name="filter" size={28} /><strong>No hay coincidencias</strong><span>Prueba otro nombre o cambia la facción.</span></div>}

          <footer className="roulette-builder-footer"><div className="roulette-total-summary"><span><small>SELECCIONADOS</small><b>{roulettePool.length}</b></span><span><small>CASILLAS</small><b>{rouletteTotal}</b></span><p>Máximo 64. Un único personaje usa automáticamente dos casillas.</p></div><button type="button" className="roulette-build-button" onClick={() => buildRoulette(true)} disabled={rouletteSpinning || !roulettePool.length || rouletteTotal > 64}><PvzIcon name="roulette" size={20} /><span>CONSTRUIR RULETA</span></button></footer>
        </section>

        <aside className="roulette-wheel-panel">
          <header className="roulette-section-heading compact"><div><span className="eyebrow">02 · Resultado</span><h2>Rueda construida</h2></div><span className="roulette-game-chip" style={{ color: accent }}>{pvzSideLabels[rouletteSide]}</span></header>
          <div className={`roulette-wheel-stage ${rouletteSpinning ? 'spinning' : ''} ${rouletteDirty ? 'dirty' : ''}`}><span className="roulette-wheel-pointer" aria-hidden="true"><i /></span>{wheelCount >= 2 ? <div className="roulette-wheel-shell"><svg className="roulette-wheel-svg" viewBox="0 0 400 400"><defs>{builtCharacters.map((item, index) => { const angle = -90 + (index + .5) * 360 / wheelCount; const location = point(imageRadius, angle); return <clipPath id={`pvz-unified-slot-${rouletteSide}-${index}`} key={`clip-${item.key}-${index}`}><circle cx={location.x} cy={location.y} r={imageSize / 2} /></clipPath> })}</defs><g ref={rotorRef} className="roulette-wheel-rotor" style={{ transform: `rotate(${rouletteRotation}deg)` }}>{builtCharacters.map((item, index) => <path d={sectorPath(index, wheelCount)} fill={pvzPalettes[rouletteSide][index % pvzPalettes[rouletteSide].length]} className="roulette-wheel-sector" key={`sector-${item.key}-${index}`} />)}{builtCharacters.map((item, index) => { const angle = -90 + (index + .5) * 360 / wheelCount; const location = point(imageRadius, angle); return <g key={`portrait-${item.key}-${index}`}><circle cx={location.x} cy={location.y} r={imageSize / 2 + 2} fill="#061722" stroke="rgba(255,255,255,.72)" strokeWidth="1.5" /><image href={asset(item.portrait)} x={location.x - imageSize / 2} y={location.y - imageSize / 2} width={imageSize} height={imageSize} preserveAspectRatio="xMidYMid slice" clipPath={`url(#pvz-unified-slot-${rouletteSide}-${index})`} /></g> })}<circle cx="200" cy="200" r="185" fill="none" stroke="rgba(211,241,255,.78)" strokeWidth="3" /></g></svg><div className="roulette-wheel-hub" style={{ '--role-color': accent } as CSSProperties}>{winner ? <><img src={asset(winner.portrait)} alt="" /><span><small>GANADOR</small><strong>{winner.name}</strong></span></> : <><PvzIcon name="roulette" size={28} /><span><small>RULETA</small><strong>{wheelCount} casillas</strong></span></>}</div></div> : <div className="roulette-wheel-placeholder"><span><PvzIcon name="roulette" size={50} /></span><strong>Construye la ruleta</strong><p>Ajusta pesos y crea la rueda para ver las casillas reales.</p></div>}</div>
          <div className="roulette-winner-strip">{winner ? <><div className="roulette-winner-portrait" style={{ '--role-color': accent } as CSSProperties}><img src={asset(winner.portrait)} alt="" /></div><div><small>GANADOR DEL ÚLTIMO GIRO</small><strong>{winner.name}</strong><span>{winner.baseName} · Peso x{rouletteWeight(winner.key)} · {rouletteProbability(winner.key).toFixed(1)}%</span></div></> : <><PvzIcon name={rouletteDirty ? 'settings' : 'check'} size={20} /><div><small>ESTADO</small><strong>{rouletteSpinning ? 'Girando…' : buildStatus}</strong><span>{rouletteDirty ? 'Construye para aplicar los cambios.' : 'La rueda está lista para girar.'}</span></div></>}</div>
          <button type="button" className={`roulette-spin-button ${rouletteSpinning ? 'spinning' : ''}`} onClick={spinRoulette} disabled={rouletteSpinning || !roulettePool.length}><PvzIcon name="roulette" size={24} /><span>{rouletteSpinning ? 'GIRANDO…' : rouletteDirty ? 'CONSTRUIR Y GIRAR' : 'GIRAR RULETA'}</span></button>
          <small className="roulette-autosave"><PvzIcon name="check" size={13} /> Selección, facción y pesos se guardan en este navegador.</small>
          {!!rouletteEntries.length && <details className="roulette-slot-list"><summary><span>Ver casillas construidas</span><b>{rouletteEntries.length}</b></summary><div>{builtCharacters.map((item, index) => <span key={`${item.key}-${index}`} style={{ '--role-color': pvzSideColors[item.side] } as CSSProperties}><i>{index + 1}</i><img src={asset(item.portrait)} alt="" /><strong>{item.name}</strong></span>)}</div></details>}
        </aside>
      </section>
    </main>
  }

  return view === 'roulette' ? renderRoulette() : renderPrincipal()
}
