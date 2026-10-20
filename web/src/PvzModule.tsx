import GameSidebar from './GameSidebar'
import AnimatedLayer from './AnimatedLayer'
import SharedRoulette from './SharedRoulette'
import { useImageExport } from './useImageExport'
import { safeAssetUrl } from './imageExport.ts'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from 'react'
import {
  pvzCharacters,
  pvzSideColors,
  pvzSideLabels,
  pvzSideSingular,
  type PvzCharacter,
  type PvzSide,
} from './pvzCatalog'
import { warmImageCache } from './imageCache'
import type { SupportedLocale } from './localization'
import { localizeUi, isDefaultPlayerName, localizedPlayerName } from './uiLocalization'
import ViewportAction from './ViewportAction'
import { sanitizePersonName, PERSON_NAME_PATTERN, PERSON_NAME_HINT, PLAYER_NAME_MAX_LENGTH } from './personName.ts'
import './PvzModule.css'

type PvzView = 'principal' | 'roulette'
type PvzMobileTab = 'squad' | 'rules'
type NoticeTone = 'success' | 'info' | 'warning'
type PvzSound = 'toggleOn' | 'toggleOff' | 'nav' | 'profileAssign' | 'shuffle' | 'click' | 'generate' | 'reroll' | 'rouletteBuild' | 'rouletteSpin' | 'rouletteWin'

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
  return { id: `pvz-player-${index + 1}`, name: `Jugador${index + 1}`, side, profileId: '', blocked: [] }
}

function normalizePlayers(raw: unknown): PvzPlayer[] {
  if (!Array.isArray(raw) || raw.length === 0) return Array.from({ length: 4 }, (_, index) => makePlayer(index))
  const normalized: PvzPlayer[] = raw.slice(0, 8).map((item, index) => {
    const source = item && typeof item === 'object' ? item as Partial<PvzPlayer> : {}
    return {
      id: typeof source.id === 'string' ? source.id : `pvz-player-${index + 1}`,
      name: typeof source.name === 'string' ? sanitizePersonName(source.name) : `Jugador${index + 1}`,
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
  const [imageExporting, saveImage] = useImageExport(notify, locale, 'pvzgw2')
  const asset = (path: string) => safeAssetUrl(path, baseUrl)
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
  const soundsRef = useRef<Partial<Record<PvzSound, HTMLAudioElement>>>({})

  useEffect(() => {
    const soundPaths: Record<PvzSound, string> = {
      toggleOn: 'assets/sounds/toggle-on.mp3',
      toggleOff: 'assets/sounds/toggle-off.mp3',
      nav: 'assets/sounds/nav.mp3',
      profileAssign: 'assets/sounds/profile-assign.mp3',
      shuffle: 'assets/sounds/shuffle.mp3',
      click: 'assets/pvzgw2/sounds/Audio_Always_Loaded.062.ogg',
      generate: 'assets/pvzgw2/sounds/plants-vs-zombies-sun-pickup.mp3',
      reroll: 'assets/pvzgw2/sounds/killpop.mp3',
      rouletteBuild: 'assets/pvzgw2/sounds/Audio_Always_Loaded.048.ogg',
      rouletteSpin: 'assets/pvzgw2/sounds/Audio_Always_Loaded.029.ogg',
      rouletteWin: 'assets/pvzgw2/sounds/Audio_Always_Loaded.082.ogg',
    }
    Object.entries(soundPaths).forEach(([key, path]) => {
      const audio = new Audio(`${baseUrl}${path}?v=20`)
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
    try {
      window.localStorage.setItem('overroll.web.pvz.players', JSON.stringify(players))
      window.localStorage.setItem('overroll.web.pvz.picks', JSON.stringify(picks.map((pick) => ({ key: pick.character?.key ?? '', locked: pick.locked }))))
      window.localStorage.setItem('overroll.web.pvz.avoidRepeated', JSON.stringify(avoidRepeated))
      window.localStorage.setItem('overroll.web.pvz.useVariants', JSON.stringify(useVariants))
      window.localStorage.setItem('overroll.web.pvz.includeDlc', JSON.stringify(includeDlc))
      window.localStorage.setItem('overroll.web.pvz.sideSwitchEnabled', JSON.stringify(sideSwitchEnabled))
    } catch { /* Storage may be blocked by browser preferences. */ }
  }, [players, picks, avoidRepeated, useVariants, includeDlc, sideSwitchEnabled])

  useEffect(() => {
    const eligible = new Set(eligibleCharacters.map((item) => item.key))
    setPicks((current) => current.map((pick, index) => {
      if (!pick.character || eligible.has(pick.character.key)) return pick
      const player = players[index]
      const options = player ? eligibleBySide[player.side].filter((item) => !player.blocked.includes(item.key)) : []
      return { character: options[randomIndex(options.length)] ?? null, locked: false }
    }))
  }, [useVariants, includeDlc])

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

  function updatePlayerName(index: number, name: string) {
    setPlayers((current) => current.map((player, playerIndex) => playerIndex === index ? { ...player, name: sanitizePersonName(name) } : player))
  }

  function assignProfile(index: number, profileId: string) {
    const profile = profiles.find((item) => item.id === profileId)
    setPlayers((current) => current.map((player, playerIndex) => playerIndex === index ? {
      ...player,
      profileId,
      name: sanitizePersonName(profile?.name ?? (player.profileId ? `Jugador${index + 1}` : player.name)),
    } : player))
    playSound('profileAssign')
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
    setStatus(`${player.name || `Jugador${index + 1}`} cambió a ${pvzSideLabels[side]}`)
    setGenerationRevision((value) => value + 1)
    playSound('click')
  }

  function clearNames() {
    setPlayers((current) => current.map((player, index) => ({ ...player, name: sanitizePersonName(player.profileId ? profiles.find((profile) => profile.id === player.profileId)?.name ?? `Jugador${index + 1}` : '') })))
    playSound('click')
    notify('Nombres de PVZ limpiados')
  }

  function shufflePlayers() {
    const payload = shuffle(players.map((player) => ({ name: player.name, profileId: player.profileId, blocked: player.blocked })))
    setPlayers((current) => current.map((player, index) => ({ ...player, ...payload[index] })))
    setPicks((current) => current.map((pick) => ({ ...pick, locked: false })))
    playSound('shuffle')
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
      setStatus(`Reroll de ${player.name || `Jugador${index + 1}`}`)
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
    await saveImage({ title: 'Plants vs. Zombies · GW2', accent: '#f7d85b', filename: 'overroll-pvzgw2-equipo', cards: players.map((player, index) => {
      const pick = picks[index], hero = pick?.character
      return { player: player.name, name: hero?.name ?? 'Sin selección', role: pvzSideSingular[player.side] + (hero ? ' · ' + hero.baseName : ''), color: pvzSideColors[player.side], portrait: hero ? asset(hero.portrait) : undefined, locked: pick?.locked }
    }) })
  }

  function renderPrincipal() {
    return (
      <main className={`workspace pvz-workspace standard-game ${mobileCompactMode ? 'pvz-mobile-compact' : ''}`}>
        <GameSidebar className={`sidebar pvz-sidebar ${mobileConfigOpen ? 'mobile-config-open' : 'mobile-config-closed'}`} locale={locale} open={mobileConfigOpen} activeTab={mobileTab} onToggle={() => { setMobileConfigOpen((value) => !value); playSound('click') }} onTabChange={(tab) => { setMobileTab(tab); playSound('nav') }}>

          <section className={`side-panel pvz-side-panel pvz-squad-panel mobile-config-section ${mobileTab === 'squad' ? 'mobile-active' : ''}`}>
            <div className="panel-title-row"><div><label>Escuadra</label></div><PvzIcon name="users" size={17} /></div>
            <div className="squad-counter pvz-counter"><button type="button" onClick={() => changePlayerCount(-1)} disabled={players.length <= 2 || generating}>−</button><strong>{players.length} jugador{players.length === 1 ? '' : 'es'}</strong><button type="button" onClick={() => changePlayerCount(1)} disabled={players.length >= 8 || generating}>+</button></div>
            <div className="pvz-side-balance"><span className="plants">{plantCount} plantas</span><i /><span className="zombies">{zombieCount} zombis</span></div>
            <div className="squad-tools pvz-squad-tools"><button type="button" onClick={clearNames}><PvzIcon name="trash" size={14} /><span>Nombres</span></button><button type="button" onClick={shufflePlayers}><PvzIcon name="shuffle" size={14} /><span>Revolver</span></button><button type="button" onClick={resetSides}><PvzIcon name="reset" size={14} /><span>Bandos</span></button></div>
            <div className="players pvz-players">
              {players.map((player, index) => <div className={`pvz-player-row ${player.side}`} key={player.id}>
                <span className="pvz-player-number">{String(index + 1).padStart(2, '0')}</span>
                <input value={isDefaultPlayerName(player.name, index + 1) ? localizedPlayerName(locale, index + 1) : player.name} disabled={Boolean(player.profileId)} onChange={(event: ChangeEvent<HTMLInputElement>) => updatePlayerName(index, event.target.value)} onFocus={() => playSound('click')} maxLength={PLAYER_NAME_MAX_LENGTH} pattern={PERSON_NAME_PATTERN} title={PERSON_NAME_HINT} aria-label={`Nombre PVZ ${index + 1}`} />
                <select value={player.profileId} onChange={(event: ChangeEvent<HTMLSelectElement>) => assignProfile(index, event.target.value)} aria-label={`Perfil PVZ ${index + 1}`}><option value="">☆</option>{profiles.map((profile) => <option value={profile.id} key={profile.id} translate="no">{profile.name}</option>)}</select>
                <button type="button" className={`roster-inline-filter ${player.blocked.length ? 'active-filter' : ''}`} onClick={() => openFilter(index)} aria-label={`Filtro de ${player.name}`}><PvzIcon name="filter" size={14} />{player.blocked.length > 0 && <b>{player.blocked.length}</b>}</button>
                <div className="pvz-side-buttons"><button type="button" className={`plants ${player.side === 'plants' ? 'active' : ''}`} onClick={() => setPlayerSide(index, 'plants')} aria-pressed={player.side === 'plants'}><span>Planta</span></button><button type="button" className={`zombies ${player.side === 'zombies' ? 'active' : ''}`} onClick={() => setPlayerSide(index, 'zombies')} aria-pressed={player.side === 'zombies'}><span>Zombi</span></button></div>
              </div>)}
            </div>
          </section>

          <section className={`side-panel pvz-side-panel pvz-rules-panel mobile-config-section ${mobileTab === 'rules' ? 'mobile-active' : ''}`}>
            <div className="panel-title-row"><div><label>Reglas</label></div><PvzIcon name="settings" size={17} /></div>
            {[
              { label: 'Evitar personajes repetidos', value: avoidRepeated, setter: setAvoidRepeated },
              { label: 'Usar variantes', value: useVariants, setter: setUseVariants },
              { label: 'Incluir personajes DLC', value: includeDlc, setter: setIncludeDlc },
              { label: 'Permitir cambio de bando', value: sideSwitchEnabled, setter: setSideSwitchEnabled },
            ].map((rule) => <button type="button" className={`toggle-row pvz-toggle ${rule.value ? 'enabled' : ''}`} onClick={() => { rule.setter(!rule.value); playSound(rule.value ? 'toggleOff' : 'toggleOn') }} aria-pressed={rule.value} key={rule.label}><span className="switch"><span /></span><span><b>{rule.label}</b></span></button>)}
            <div className="pvz-catalog-summary"><span className="plants"><b>{eligibleBySide.plants.length}</b><small>Plantas disponibles</small></span><span className="zombies"><b>{eligibleBySide.zombies.length}</b><small>Zombis disponibles</small></span></div>
          </section>

          <div className="sidebar-footer pvz-sidebar-footer">
            <div className="status-line pvz-status"><span className="status-icon"><PvzIcon name="check" size={15} /></span><span>{status}</span></div>
            <div className="pvz-generate-grid pvz-side-generate-grid"><button type="button" className="pvz-generate plants" onClick={() => generateTeam('plants')} disabled={generating || rerollingIndex !== null}><PvzIcon name="spark" size={17} /><span>Generar plantas</span></button><button type="button" className="pvz-generate zombies" onClick={() => generateTeam('zombies')} disabled={generating || rerollingIndex !== null}><PvzIcon name="spark" size={17} /><span>Generar zombis</span></button></div>
          </div>
        </GameSidebar>

        <section className="content pvz-content">
          <div className="content-topline pvz-topline"><div className="game-identity"><div className="game-title-row"><h1>PVZ Garden Warfare 2</h1></div></div><div className="topline-actions"><button type="button" className="generate-image-button pvz-image-button" onClick={generateImage} aria-busy={imageExporting} disabled={imageExporting || !picks.some((pick) => pick.character)}><PvzIcon name="download" size={17} /> Generar imagen</button><div className="match-summary pvz-summary"><div><small>Plantas</small><strong>{plantCount}</strong></div><div><small>Zombis</small><strong>{zombieCount}</strong></div><div><small>Fijados</small><strong>{lockedCount}</strong></div></div></div></div>
          <div className="team-stage pvz-stage"><div className="stage-grid" /><div className={`pvz-team-grid cards-${players.length}`} style={{ '--cards': players.length } as CSSProperties}>
            {players.map((player, index) => {
              const pick = picks[index]
              const character = pick?.character
              const profile = profiles.find((item) => item.id === player.profileId)
              const generationClass = generationRevision % 2 === 0 ? 'generation-a' : 'generation-b'
              return <article className={`pvz-card ${player.side} ${generationClass} ${pick?.locked ? 'is-locked' : ''} ${rerollingIndex === index ? 'is-rerolling' : ''}`} style={{ '--delay': `${index * 45}ms`, '--pvz-accent': pvzSideColors[player.side] } as CSSProperties} key={player.id}>
                <div className="pvz-card-player"><span>{String(index + 1).padStart(2, '0')}</span><strong translate="no">{isDefaultPlayerName(player.name, index + 1) ? localizedPlayerName(locale, index + 1) : (player.name || localizedPlayerName(locale, index + 1))}</strong>{profile && <i translate="no">{profile.name.charAt(0).toUpperCase()}</i>}{pick?.locked && <b><PvzIcon name="lock" size={12} /></b>}</div>
                <div className="pvz-portrait"><div className="portrait-grid" aria-hidden="true" />{character ? <img src={asset(character.portrait)} alt={character.name} decoding="async" draggable={false} /> : <div className="pvz-empty-portrait"><PvzIcon name="spark" size={44} /><span>Genera este bando</span></div>}<div className="pvz-portrait-fade" /></div>
                <div className="pvz-card-body"><div className="pvz-card-title"><h2>{character?.name ?? 'Sin selección'}</h2><span className={player.side}>{pvzSideSingular[player.side]}</span></div>
                {character?.isVariant && <div className="pvz-variant-meta"><span>{character.baseName}</span>{character.isDlc && <b>DLC</b>}</div>}
                </div>
                <div className="pvz-card-actions"><button type="button" onClick={() => reroll(index)} disabled={!character || pick?.locked || generating || rerollingIndex !== null} title="Cambiar personaje"><PvzIcon name="reroll" size={18} /></button><button type="button" onClick={() => openFilter(index)} title="Filtro individual"><PvzIcon name="filter" size={18} /><span>{player.blocked.length || ''}</span></button>{sideSwitchEnabled && <button type="button" className="side-switch" onClick={() => setPlayerSide(index, player.side === 'plants' ? 'zombies' : 'plants')} title="Cambiar bando y reemplazar"><PvzIcon name="switch" size={18} /></button>}<button type="button" className={pick?.locked ? 'active-lock' : ''} onClick={() => toggleLock(index)} disabled={!character} title={pick?.locked ? 'Desbloquear' : 'Bloquear'}><PvzIcon name={pick?.locked ? 'unlock' : 'lock'} size={18} /></button></div>

                {profile && <div className="loadout"><div><small>Perfil</small><span translate="no">{profile.name}</span></div></div>}
              </article>
            })}
          </div></div>
        </section>

        <ViewportAction className="pvz-principal-generate-dock">
          <button type="button" className={`generate principal-generate-action pvz-principal-generate ${generating ? 'generating' : ''}`} onClick={() => generateTeam('both')} disabled={generating || rerollingIndex !== null}>
            <span className="generate-glow" /><PvzIcon name={generating ? 'reroll' : 'spark'} size={19} /><span>{generating ? 'Preparando…' : 'Generar ambos'}</span>
          </button>
        </ViewportAction>

        <AnimatedLayer open={Boolean(filterPlayer)} enabled={animationsEnabled} onClose={() => setFilterIndex(null)} className="filter-layer pvz-filter-layer">{filterPlayer && (<><section className={`filter-dialog pvz-filter-dialog ${filterPlayer.side}`} role="dialog" aria-modal="true" aria-label="Filtros individuales"><header className="filter-heading"><div><span className="eyebrow">Filtro individual · {pvzSideSingular[filterPlayer.side]}</span><h2 translate="no">{filterPlayer.name || `Jugador${filterIndex! + 1}`}</h2><p>{eligibleBySide[filterPlayer.side].length - filterPlayer.blocked.filter((key) => eligibleBySide[filterPlayer.side].some((item) => item.key === key)).length} permitidos · {filterPlayer.blocked.length} bloqueados</p></div><button type="button" onClick={() => { setFilterIndex(null); playSound('click') }} aria-label="Cerrar filtro"><PvzIcon name="close" size={20} /></button></header><div className="filter-toolbar pvz-filter-toolbar"><label className="profile-search"><PvzIcon name="filter" size={16} /><input value={filterSearch} onFocus={() => playSound('click')} onChange={(event: ChangeEvent<HTMLInputElement>) => setFilterSearch(event.target.value)} placeholder="Buscar personaje o clase…" /></label><button type="button" className="reset-classification" onClick={clearFilter}><PvzIcon name="reset" size={15} /> Reiniciar</button></div><div className="pvz-filter-grid">{filterRows.map((item) => { const blocked = filterPlayer.blocked.includes(item.key); return <button type="button" className={`pvz-filter-card ${item.side} ${blocked ? 'blocked' : ''}`} onClick={() => toggleBlocked(item.key)} aria-pressed={blocked} key={item.key}><img src={asset(item.portrait)} alt="" /><span><strong>{item.name}</strong><small>{blocked ? 'BLOQUEADO' : item.isVariant ? item.baseName : 'PREDETERMINADO'}</small></span><i>{blocked ? '×' : '✓'}</i></button> })}</div></section></>)}</AnimatedLayer>
      </main>
    )
  }

  return view === 'roulette' ? (<SharedRoulette gameId="pvzgw2" title="Plants vs. Zombies Garden Warfare 2" items={eligibleCharacters.map((item) => ({ ...item, role: item.side }))} roles={(['plants', 'zombies'] as const).map((id) => ({ id, label: pvzSideLabels[id], color: pvzSideColors[id] }))} storagePrefix="overroll.web.pvz" legacySelectionKey="rouletteSelectedKeys" baseUrl={baseUrl} locale={locale} animationsEnabled={animationsEnabled} notify={notify} onSpin={() => playSound('rouletteSpin')} onWin={() => playSound('rouletteWin')} />) : localizeUi(locale, renderPrincipal(), 'pvzgw2')
}
