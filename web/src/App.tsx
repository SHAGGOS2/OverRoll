import { useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type MouseEvent, type SyntheticEvent } from 'react'
import './App.css'

type Role = 'tank' | 'damage' | 'support'
type View = 'principal' | 'profiles' | 'more'
type ToastTone = 'success' | 'info' | 'warning'
type SoundKey = 'click' | 'open' | 'close' | 'toggleOn' | 'toggleOff' | 'generate' | 'reroll' | 'nav' | 'success'
type IconName =
  | 'refresh'
  | 'lock'
  | 'unlock'
  | 'details'
  | 'users'
  | 'spark'
  | 'check'
  | 'gamepad'
  | 'profile'
  | 'settings'
  | 'close'
  | 'shield'
  | 'warning'
  | 'sound'
  | 'shuffle'
  | 'reset'
  | 'trash'
  | 'stadium'

type Perk = {
  name: string
  description: string
  icon: string
}

type Hero = {
  key: string
  name: string
  role: Role
  subrole: string
  portrait: string
  gamemodes: string[]
  minorPerks: Perk[]
  majorPerks: Perk[]
  stadiumPowers: Perk[]
}

type HeroData = {
  source: string
  updatedAt: string
  heroes: Hero[]
}

type Player = {
  id: string
  name: string
  roles: Record<Role, boolean>
}

type Pick = {
  hero: Hero | null
  locked: boolean
  role: Role | null
  perks: Perk[]
}

type Toast = {
  message: string
  tone: ToastTone
}

const roles: Role[] = ['tank', 'damage', 'support']

const roleLabels: Record<Role, string> = {
  tank: 'Tanque',
  damage: 'Daño',
  support: 'Apoyo',
}

const subroleLabels: Record<string, string> = {
  bruiser: 'Luchador',
  initiator: 'Iniciador',
  stalwart: 'Baluarte',
  flanker: 'Flanqueador',
  recon: 'Reconocimiento',
  sharpshooter: 'Tirador',
  specialist: 'Especialista',
  medic: 'Médico',
  survivor: 'Superviviente',
  tactician: 'Táctico',
}

const profileOptions = [
  {
    name: 'Sin perfil',
    description: 'Configuración manual. No modifica tus reglas.',
    badge: 'LIBRE',
  },
  {
    name: 'Casual',
    description: 'Evita repetidos y deja la composición libre.',
    badge: 'RÁPIDO',
  },
  {
    name: 'Competitivo',
    description: 'Usa composición de roles y evita repetidos.',
    badge: '1-2-2',
  },
  {
    name: 'Solo rol',
    description: 'Genera únicamente la composición del equipo.',
    badge: 'ROLES',
  },
]

const gameModules = [
  { name: 'Overwatch 2', status: 'Disponible', accent: '#f5a623' },
  { name: 'Marvel Rivals', status: 'Siguiente fase', accent: '#6ae4ff' },
  { name: 'PVZ GW2', status: 'Siguiente fase', accent: '#79dc72' },
  { name: 'Team Fortress 2', status: 'En cola', accent: '#e56d50' },
  { name: 'Valorant', status: 'En cola', accent: '#ff5868' },
  { name: 'Deadlock', status: 'En cola', accent: '#d1bd77' },
]

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
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
    case 'refresh':
      return <svg {...common}><path d="M20 11a8 8 0 1 0 2 5" /><path d="M20 4v7h-7" /></svg>
    case 'lock':
      return <svg {...common}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
    case 'unlock':
      return <svg {...common}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 7.3-2.2" /></svg>
    case 'details':
      return <svg {...common}><path d="M4 6h16M4 12h16M4 18h10" /></svg>
    case 'users':
      return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    case 'spark':
      return <svg {...common}><path d="m12 3-1.5 4.5L6 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5L12 3Z" /><path d="m5 15-.8 2.2L2 18l2.2.8L5 21l.8-2.2L8 18l-2.2-.8L5 15Z" /></svg>
    case 'check':
      return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>
    case 'gamepad':
      return <svg {...common}><path d="M6 8h12a4 4 0 0 1 3.8 5.3l-1.1 3.2a2.3 2.3 0 0 1-3.7 1l-1.6-1.3H8.6L7 17.5a2.3 2.3 0 0 1-3.7-1l-1.1-3.2A4 4 0 0 1 6 8Z" /><path d="M8 11v4M6 13h4M16.5 12h.01M18.5 14h.01" /></svg>
    case 'profile':
      return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
    case 'settings':
      return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.16.37.37.72.66 1 .3.28.68.42 1.08.4H21v4h-.1a1.7 1.7 0 0 0-1.5.6Z" /></svg>
    case 'close':
      return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>
    case 'shield':
      return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
    case 'warning':
      return <svg {...common}><path d="M10.3 3.5 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.5a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>
    case 'sound':
      return <svg {...common}><path d="M11 5 6 9H2v6h4l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" /></svg>
    case 'shuffle':
      return <svg {...common}><path d="M16 3h5v5" /><path d="m4 20 5.5-5.5M21 3l-6.5 6.5M16 16h5v5" /><path d="m15 15 6 6M4 4l5.5 5.5" /></svg>
    case 'reset':
      return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
    case 'trash':
      return <svg {...common}><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" /></svg>
    case 'stadium':
      return <svg {...common}><path d="M4 10V6l8-3 8 3v4" /><path d="M3 10h18v10H3z" /><path d="M8 20v-5h8v5M7 10V7M12 10V6M17 10V7" /></svg>
    default:
      return null
  }
}

function makePlayer(index: number): Player {
  return {
    id: `player-${index + 1}`,
    name: `Jugador ${index + 1}`,
    roles: { tank: true, damage: true, support: true },
  }
}

function shuffleArray<T>(items: readonly T[]): T[] {
  const output = [...items]
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = output[index]
    output[index] = output[swapIndex]
    output[swapIndex] = current
  }
  return output
}

function compositionFor(size: number): Role[] {
  if (size <= 1) return [roles[Math.floor(Math.random() * roles.length)]]
  if (size === 2) return shuffleArray(roles).slice(0, 2)
  if (size === 3) return shuffleArray(roles)
  if (size === 4) return shuffleArray([...roles, roles[Math.floor(Math.random() * roles.length)]])
  if (size === 5) return shuffleArray(['tank', 'damage', 'damage', 'support', 'support'])
  if (size === 6) return shuffleArray(['tank', 'tank', 'damage', 'damage', 'support', 'support'])

  const slots: Role[] = []
  for (let index = 0; index < size; index += 1) slots.push(roles[index % roles.length])
  return shuffleArray(slots)
}

function resolveRoleAssignments(players: Player[], enabled: boolean, previous: Pick[]): Array<Role | null> {
  const assignments: Array<Role | null> = players.map(() => null)

  if (!enabled) {
    return players.map((player, index) => {
      const current = previous[index]
      if (current?.locked && current.role && player.roles[current.role]) return current.role
      const allowed = roles.filter((role) => player.roles[role])
      return allowed[Math.floor(Math.random() * allowed.length)] ?? null
    })
  }

  const slots = compositionFor(players.length)
  const remainingSlots = [...slots]
  const remainingPlayers: number[] = []

  players.forEach((player, index) => {
    const current = previous[index]
    const forcedRole = current?.locked ? (current.role ?? current.hero?.role ?? null) : null
    const slotIndex = forcedRole ? remainingSlots.indexOf(forcedRole) : -1
    if (forcedRole && slotIndex >= 0 && player.roles[forcedRole]) {
      assignments[index] = forcedRole
      remainingSlots.splice(slotIndex, 1)
    } else {
      remainingPlayers.push(index)
    }
  })

  function solve(playerIndexes: number[], openSlots: Role[]): boolean {
    if (playerIndexes.length === 0) return true

    const ranked = playerIndexes
      .map((playerIndex) => ({
        playerIndex,
        choices: [...new Set(openSlots.filter((role) => players[playerIndex].roles[role]))],
      }))
      .sort((left, right) => left.choices.length - right.choices.length)

    const selected = ranked[0]
    if (!selected || selected.choices.length === 0) return false

    for (const role of shuffleArray(selected.choices)) {
      const slotIndex = openSlots.indexOf(role)
      if (slotIndex < 0) continue
      assignments[selected.playerIndex] = role
      const nextPlayers = playerIndexes.filter((index) => index !== selected.playerIndex)
      const nextSlots = [...openSlots]
      nextSlots.splice(slotIndex, 1)
      if (solve(nextPlayers, nextSlots)) return true
      assignments[selected.playerIndex] = null
    }

    return false
  }

  if (!solve(shuffleArray(remainingPlayers), remainingSlots)) {
    return players.map((player, index) => {
      const current = previous[index]
      if (current?.locked && current.role && player.roles[current.role]) return current.role
      const allowed = roles.filter((role) => player.roles[role])
      return allowed[Math.floor(Math.random() * allowed.length)] ?? null
    })
  }

  return assignments
}

function rollPerks(hero: Hero | null, enabled: boolean, stadium: boolean): Perk[] {
  if (!hero || !enabled) return []
  if (stadium) return shuffleArray(hero.stadiumPowers).slice(0, Math.min(4, hero.stadiumPowers.length))

  const selected: Perk[] = []
  if (hero.minorPerks.length > 0) selected.push(hero.minorPerks[Math.floor(Math.random() * hero.minorPerks.length)])
  if (hero.majorPerks.length > 0) selected.push(hero.majorPerks[Math.floor(Math.random() * hero.majorPerks.length)])
  return selected
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}

function buildTeam(options: {
  heroes: Hero[]
  players: Player[]
  previous: Pick[]
  avoidRepeated: boolean
  roleComposition: boolean
  rolesOnly: boolean
  randomPerks: boolean
  stadium: boolean
}): Pick[] {
  const {
    heroes,
    players,
    previous,
    avoidRepeated,
    roleComposition,
    rolesOnly,
    randomPerks,
    stadium,
  } = options

  const assignedRoles = resolveRoleAssignments(players, roleComposition, previous)
  const used = new Set<string>()
  const availableKeys = new Set(heroes.map((hero) => hero.key))

  previous.forEach((pick, index) => {
    if (
      index < players.length
      && pick?.locked
      && pick.hero
      && availableKeys.has(pick.hero.key)
      && pick.role
      && players[index].roles[pick.role]
    ) used.add(pick.hero.key)
  })

  return players.map((player, index) => {
    const current = previous[index]
    const selectedRole = assignedRoles[index]
    const canKeepLocked = Boolean(
      current?.locked
      && current.hero
      && selectedRole
      && current.role === selectedRole
      && availableKeys.has(current.hero.key)
      && player.roles[selectedRole],
    )

    if (canKeepLocked && current) return current
    if (rolesOnly) return { hero: null, locked: false, role: selectedRole, perks: [] }
    if (!selectedRole) return { hero: null, locked: false, role: null, perks: [] }

    let candidates = heroes.filter((hero) => hero.role === selectedRole)

    if (avoidRepeated) {
      const uniqueCandidates = candidates.filter((hero) => !used.has(hero.key))
      if (uniqueCandidates.length > 0) candidates = uniqueCandidates
    }

    if (current?.hero && candidates.length > 1) {
      const alternatives = candidates.filter((hero) => hero.key !== current.hero?.key)
      if (alternatives.length > 0) candidates = alternatives
    }

    const hero = candidates[Math.floor(Math.random() * candidates.length)] ?? null
    if (hero) used.add(hero.key)
    return {
      hero,
      locked: false,
      role: selectedRole,
      perks: rollPerks(hero, randomPerks, stadium),
    }
  })
}

function App() {
  const baseUrl = import.meta.env.BASE_URL
  const asset = (path: string) => `${baseUrl}${path.replace(/^\//, '')}`

  const [activeView, setActiveView] = useState<View>('principal')
  const [data, setData] = useState<HeroData | null>(null)
  const [loadError, setLoadError] = useState('')
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = readStorage<Player[]>('overroll.web.players', [])
    if (!Array.isArray(saved) || saved.length < 1) {
      return Array.from({ length: 5 }, (_, index) => makePlayer(index))
    }
    return saved.slice(0, 6)
  })
  const [picks, setPicks] = useState<Pick[]>(() => (
    Array.from({ length: 5 }, () => ({ hero: null, locked: false, role: null, perks: [] }))
  ))
  const [avoidRepeated, setAvoidRepeated] = useState(() => readStorage('overroll.web.avoidRepeated', true))
  const [roleComposition, setRoleComposition] = useState(() => readStorage('overroll.web.roleComposition', true))
  const [rolesOnly, setRolesOnly] = useState(() => readStorage('overroll.web.rolesOnly', false))
  const [randomPerks, setRandomPerks] = useState(() => readStorage('overroll.web.randomPerks', true))
  const [stadium, setStadium] = useState(() => readStorage('overroll.web.stadium', false))
  const [soundEnabled, setSoundEnabled] = useState(() => readStorage('overroll.web.soundEnabled', true))
  const [soundVolume, setSoundVolume] = useState(() => readStorage('overroll.web.soundVolume', 0.42))
  const audioRef = useRef<Partial<Record<SoundKey, HTMLAudioElement>>>({})
  const [profile, setProfile] = useState(() => readStorage('overroll.web.profile', 'Sin perfil'))
  const [detailsIndex, setDetailsIndex] = useState<number | null>(null)
  const [status, setStatus] = useState('Cargando catálogo local…')
  const [toast, setToast] = useState<Toast | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generationRevision, setGenerationRevision] = useState(0)
  const [rerollingIndex, setRerollingIndex] = useState<number | null>(null)

  useEffect(() => {
    const soundPaths: Record<SoundKey, string> = {
      click: 'assets/sounds/click.mp3',
      open: 'assets/sounds/open.mp3',
      close: 'assets/sounds/close.mp3',
      toggleOn: 'assets/sounds/toggle-on.mp3',
      toggleOff: 'assets/sounds/toggle-off.mp3',
      generate: 'assets/sounds/generate.mp3',
      reroll: 'assets/sounds/reroll.mp3',
      nav: 'assets/sounds/nav.mp3',
      success: 'assets/sounds/success.mp3',
    }

    Object.entries(soundPaths).forEach(([key, path]) => {
      const audio = new Audio(asset(path))
      audio.preload = 'auto'
      audioRef.current[key as SoundKey] = audio
    })

    return () => {
      Object.values(audioRef.current).forEach((audio) => audio?.pause())
      audioRef.current = {}
    }
  }, [baseUrl])

  useEffect(() => {
    fetch(`${baseUrl}data/heroes.json`)
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo abrir el catálogo de héroes.')
        return response.json() as Promise<HeroData>
      })
      .then((loaded) => {
        const quickplay = loaded.heroes.filter((hero) => stadium ? hero.stadiumPowers.length > 0 : hero.gamemodes.includes('quickplay'))
        setData(loaded)
        setPicks((current) => buildTeam({
          heroes: quickplay,
          players,
          previous: current,
          avoidRepeated,
          roleComposition,
          rolesOnly,
          randomPerks,
          stadium,
        }))
        setStatus(`${quickplay.length} héroes listos`)
        setGenerationRevision((value) => value + 1)
      })
      .catch((error: Error) => {
        setLoadError(error.message)
        setStatus('Error al cargar los datos')
      })
  }, [baseUrl])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem('overroll.web.players', JSON.stringify(players))
      window.localStorage.setItem('overroll.web.avoidRepeated', JSON.stringify(avoidRepeated))
      window.localStorage.setItem('overroll.web.roleComposition', JSON.stringify(roleComposition))
      window.localStorage.setItem('overroll.web.rolesOnly', JSON.stringify(rolesOnly))
      window.localStorage.setItem('overroll.web.randomPerks', JSON.stringify(randomPerks))
      window.localStorage.setItem('overroll.web.stadium', JSON.stringify(stadium))
      window.localStorage.setItem('overroll.web.soundEnabled', JSON.stringify(soundEnabled))
      window.localStorage.setItem('overroll.web.soundVolume', JSON.stringify(soundVolume))
      window.localStorage.setItem('overroll.web.profile', JSON.stringify(profile))
    }, 180)

    return () => window.clearTimeout(timeout)
  }, [players, avoidRepeated, roleComposition, rolesOnly, randomPerks, stadium, soundEnabled, soundVolume, profile])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    const closeDetails = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDetailsIndex(null)
    }
    window.addEventListener('keydown', closeDetails)
    return () => window.removeEventListener('keydown', closeDetails)
  }, [])

  const availableHeroes = useMemo(
    () => data?.heroes.filter((hero) => (
      stadium ? hero.stadiumPowers.length > 0 : hero.gamemodes.includes('quickplay')
    )) ?? [],
    [data, stadium],
  )

  const assignedRoles = picks.slice(0, players.length).map((pick) => pick?.role ?? null)
  const compositionText = roleComposition
    ? roles.map((role) => assignedRoles.filter((item) => item === role).length).join('-')
    : 'Libre'

  const selectedDetailPick = detailsIndex === null ? null : picks[detailsIndex] ?? null
  const selectedDetailHero = selectedDetailPick?.hero ?? null

  function playSound(kind: SoundKey) {
    if (!soundEnabled || soundVolume <= 0) return
    const audio = audioRef.current[kind]
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    audio.volume = Math.max(0, Math.min(1, soundVolume))
    void audio.play().catch(() => undefined)
  }

  function notify(message: string, tone: ToastTone = 'info') {
    setToast({ message, tone })
  }

  function toggleRuleSound(next: boolean) {
    playSound(next ? 'toggleOn' : 'toggleOff')
  }

  function generateTeam() {
    if (!data || generating || rerollingIndex !== null) return

    setGenerating(true)
    playSound('generate')
    setStatus(stadium ? 'Barajando héroes y poderes Stadium…' : 'Barajando héroes…')
    setPicks((current) => buildTeam({
      heroes: availableHeroes,
      players,
      previous: current,
      avoidRepeated,
      roleComposition,
      rolesOnly,
      randomPerks,
      stadium,
    }))
    setGenerationRevision((value) => value + 1)

    window.setTimeout(() => {
      setGenerating(false)
      setStatus(rolesOnly ? 'Composición de roles generada' : 'Equipo generado correctamente')
      playSound('success')
      notify(rolesOnly ? 'Composición generada' : stadium ? 'Equipo Stadium generado' : 'Nuevo equipo generado', 'success')
    }, 360)
  }

  function reroll(index: number) {
    const current = picks[index]
    if (!data || current?.locked || rolesOnly || rerollingIndex !== null || generating) return

    setRerollingIndex(index)
    playSound('reroll')

    window.setTimeout(() => {
      const used = new Set(
        picks
          .filter((pick, pickIndex) => pickIndex !== index && pick.hero)
          .map((pick) => pick.hero!.key),
      )
      const player = players[index]
      const allowedRoles = roles.filter((role) => player.roles[role])
      const selectedRole = current.role && player.roles[current.role]
        ? current.role
        : allowedRoles[Math.floor(Math.random() * allowedRoles.length)]

      let candidates = availableHeroes.filter((hero) => hero.role === selectedRole)
      if (avoidRepeated) {
        const unique = candidates.filter((hero) => !used.has(hero.key))
        if (unique.length > 0) candidates = unique
      }

      const alternatives = candidates.filter((hero) => hero.key !== current.hero?.key)
      if (alternatives.length > 0) candidates = alternatives

      const hero = candidates[Math.floor(Math.random() * candidates.length)] ?? null
      setPicks((old) => old.map((pick, pickIndex) => (
        pickIndex === index ? { hero, locked: false, role: selectedRole, perks: rollPerks(hero, randomPerks, stadium) } : pick
      )))
      setRerollingIndex(null)
      setStatus(`Reroll de ${player.name || `Jugador ${index + 1}`}`)
    }, 280)
  }

  function toggleLock(index: number) {
    const pick = picks[index]
    if (!pick?.hero || rolesOnly) return
    const nextLocked = !pick.locked
    toggleRuleSound(nextLocked)
    setPicks((old) => old.map((item, pickIndex) => (
      pickIndex === index ? { ...item, locked: nextLocked } : item
    )))
    notify(nextLocked ? `${pick.hero.name} quedó fijado` : `${pick.hero.name} fue liberado`)
  }

  function togglePlayerRole(index: number, role: Role) {
    const next = !players[index]?.roles[role]
    toggleRuleSound(next)
    setPlayers((old) => old.map((player, playerIndex) => {
      if (playerIndex !== index) return player
      const enabledCount = roles.filter((item) => player.roles[item]).length
      if (player.roles[role] && enabledCount === 1) {
        notify('Cada jugador debe conservar al menos un rol.', 'warning')
        return player
      }
      return {
        ...player,
        roles: { ...player.roles, [role]: !player.roles[role] },
      }
    }))
  }

  function changePlayerCount(delta: number) {
    const nextCount = Math.max(1, Math.min(6, players.length + delta))
    if (nextCount === players.length) return

    setPlayers((old) => Array.from(
      { length: nextCount },
      (_, index) => old[index] ?? makePlayer(index),
    ))
    setPicks((old) => Array.from(
      { length: nextCount },
      (_, index) => old[index] ?? { hero: null, locked: false, role: null, perks: [] },
    ))
    setDetailsIndex(null)
    setStatus(`${nextCount} jugador${nextCount === 1 ? '' : 'es'} en la escuadra`)
  }

  function updatePlayerName(index: number, name: string) {
    setPlayers((old) => old.map((player, playerIndex) => (
      playerIndex === index ? { ...player, name } : player
    )))
  }

  function applyProfile(name: string) {
    playSound('open')
    setProfile(name)
    setRolesOnly(name === 'Solo rol')

    if (name === 'Casual') {
      setAvoidRepeated(true)
      setRoleComposition(false)
    }
    if (name === 'Competitivo') {
      setAvoidRepeated(true)
      setRoleComposition(true)
    }
    if (name === 'Solo rol') {
      setAvoidRepeated(true)
      setRoleComposition(true)
    }

    notify(`Perfil ${name} activado`, 'success')
  }

  function clearPlayerNames() {
    playSound('click')
    setPlayers((old) => old.map((player) => ({ ...player, name: '' })))
    notify('Nombres limpiados')
  }

  function shufflePlayers() {
    playSound('nav')
    const payload = shuffleArray(players.map((player) => ({ name: player.name, roles: player.roles })))
    setPlayers((old) => old.map((player, index) => ({ ...player, ...payload[index] })))
    setPicks((old) => old.map((pick) => ({ ...pick, locked: false })))
    notify('Jugadores y roles revueltos', 'success')
  }

  function resetPlayerRoles() {
    playSound('click')
    setPlayers((old) => old.map((player) => ({
      ...player,
      roles: { tank: true, damage: true, support: true },
    })))
    notify('Roles restablecidos')
  }

  function toggleRandomPerks() {
    const next = !randomPerks
    setRandomPerks(next)
    toggleRuleSound(next)
    setPicks((old) => old.map((pick) => ({
      ...pick,
      perks: rollPerks(pick.hero, next, stadium),
    })))
  }

  function toggleStadium() {
    const next = !stadium
    setStadium(next)
    setRoleComposition(true)
    setRolesOnly(false)
    toggleRuleSound(next)

    if (data) {
      const pool = data.heroes.filter((hero) => (
        next ? hero.stadiumPowers.length > 0 : hero.gamemodes.includes('quickplay')
      ))
      setPicks((current) => buildTeam({
        heroes: pool,
        players,
        previous: current.map((pick) => ({ ...pick, locked: false })),
        avoidRepeated,
        roleComposition: true,
        rolesOnly: false,
        randomPerks,
        stadium: next,
      }))
      setGenerationRevision((value) => value + 1)
    }

    setStatus(next ? 'Modo Stadium activado' : 'Quick Play activado')
    notify(next ? 'Stadium: cuatro poderes por héroe' : 'Regreso a Quick Play', 'success')
  }

  function toggleSounds() {
    const next = !soundEnabled
    if (next) {
      const audio = audioRef.current.toggleOn
      if (audio) {
        audio.pause()
        audio.currentTime = 0
        audio.volume = Math.max(0, Math.min(1, soundVolume))
        void audio.play().catch(() => undefined)
      }
    } else {
      playSound('toggleOff')
    }
    setSoundEnabled(next)
  }

  function openDetails(index: number) {
    playSound('open')
    setDetailsIndex(index)
  }

  function closeDetails() {
    playSound('close')
    setDetailsIndex(null)
  }

  function navigate(view: View) {
    if (view !== activeView) playSound('nav')
    setActiveView(view)
  }

  function handleImageError(event: SyntheticEvent<HTMLImageElement>) {
    event.currentTarget.classList.add('is-broken')
    event.currentTarget.parentElement?.classList.add('portrait-error')
  }

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    event.currentTarget.classList.remove('is-broken')
    event.currentTarget.parentElement?.classList.remove('portrait-error')
  }

  function renderPrincipal() {
    return (
      <main className="workspace">
        <aside className="sidebar">
          <div className="sidebar-head">
            <div>
              <span className="eyebrow">Preparar partida</span>
              <strong>Configuración</strong>
            </div>
            <span className="live-dot"><span /> LOCAL</span>
          </div>

          <section className="side-panel profile-panel">
            <div className="panel-title-row">
              <div>
                <label>Modo de perfil</label>
                <small>Reglas rápidas para la escuadra</small>
              </div>
              <Icon name="profile" size={17} />
            </div>
            <select value={profile} onChange={(event: ChangeEvent<HTMLSelectElement>) => applyProfile(event.target.value)}>
              {profileOptions.map((item) => <option key={item.name}>{item.name}</option>)}
            </select>
          </section>

          <section className="side-panel squad-panel">
            <div className="panel-title-row">
              <div>
                <label>Escuadra</label>
                <small>Nombres y roles permitidos</small>
              </div>
              <Icon name="users" size={17} />
            </div>

            <div className="squad-counter">
              <button type="button" onClick={() => { playSound('click'); changePlayerCount(-1) }} disabled={players.length <= 1 || generating || rerollingIndex !== null} aria-label="Quitar jugador">−</button>
              <strong>{players.length} jugador{players.length === 1 ? '' : 'es'}</strong>
              <button type="button" onClick={() => { playSound('click'); changePlayerCount(1) }} disabled={players.length >= 6 || generating || rerollingIndex !== null} aria-label="Agregar jugador">+</button>
            </div>

            <div className="squad-tools" aria-label="Herramientas de escuadra">
              <button type="button" onClick={clearPlayerNames} title="Limpiar nombres"><Icon name="trash" size={14} /><span>Nombres</span></button>
              <button type="button" onClick={shufflePlayers} title="Revolver jugadores"><Icon name="shuffle" size={14} /><span>Revolver</span></button>
              <button type="button" onClick={resetPlayerRoles} title="Restablecer roles"><Icon name="reset" size={14} /><span>Roles</span></button>
            </div>

            <div className="players">
              {players.map((player, index) => (
                <div className="player-row" key={player.id}>
                  <span className="number">{String(index + 1).padStart(2, '0')}</span>
                  <input
                    value={player.name}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => updatePlayerName(index, event.target.value)}
                    aria-label={`Nombre del jugador ${index + 1}`}
                    maxLength={22}
                  />
                  {roles.map((role) => (
                    <button
                      type="button"
                      className={`role ${role} ${player.roles[role] ? 'active' : ''}`}
                      onClick={() => togglePlayerRole(index, role)}
                      title={roleLabels[role]}
                      aria-pressed={player.roles[role]}
                      key={role}
                    >
                      <img src={asset(`assets/roles/${role}.png`)} alt={roleLabels[role]} />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section className="side-panel rules">
            <div className="panel-title-row">
              <div>
                <label>Reglas</label>
                <small>Ajustes de generación</small>
              </div>
              <Icon name="settings" size={17} />
            </div>

            <button
              type="button"
              className={`toggle-row ${avoidRepeated ? 'enabled' : ''}`}
              onClick={() => { const next = !avoidRepeated; setAvoidRepeated(next); toggleRuleSound(next) }}
              aria-pressed={avoidRepeated}
            >
              <span className="switch"><span /></span>
              <span><b>Evitar repetidos</b><small>Un héroe por equipo</small></span>
            </button>

            <button
              type="button"
              className={`toggle-row ${roleComposition ? 'enabled' : ''}`}
              onClick={() => { const next = !roleComposition; setRoleComposition(next); toggleRuleSound(next) }}
              aria-pressed={roleComposition}
            >
              <span className="switch"><span /></span>
              <span><b>Composición de roles</b><small>Distribución automática</small></span>
            </button>

            <button
              type="button"
              className={`toggle-row perks-toggle ${randomPerks ? 'enabled' : ''}`}
              onClick={toggleRandomPerks}
              aria-pressed={randomPerks}
            >
              <span className="switch"><span /></span>
              <span><b>Perks aleatorias</b><small>{stadium ? 'Cuatro poderes Stadium' : 'Una menor y una mayor'}</small></span>
            </button>

            <button
              type="button"
              className={`toggle-row stadium-toggle ${stadium ? 'enabled' : ''}`}
              onClick={toggleStadium}
              aria-pressed={stadium}
            >
              <span className="switch"><span /></span>
              <span><b>Modo Stadium</b><small>Solo héroes compatibles</small></span>
            </button>

            <button
              type="button"
              className={`toggle-row ${rolesOnly ? 'enabled' : ''}`}
              onClick={() => { const next = !rolesOnly; setRolesOnly(next); toggleRuleSound(next) }}
              aria-pressed={rolesOnly}
            >
              <span className="switch"><span /></span>
              <span><b>Solo rol</b><small>Oculta los héroes</small></span>
            </button>
          </section>

          <section className="audio-strip" aria-label="Sonidos de la interfaz">
            <button type="button" className={soundEnabled ? 'enabled' : ''} onClick={toggleSounds} aria-pressed={soundEnabled}>
              <Icon name="sound" size={15} />
              <span>{soundEnabled ? 'Sonidos activos' : 'Sonidos apagados'}</span>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              disabled={!soundEnabled}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setSoundVolume(Number(event.target.value))}
              onPointerUp={() => playSound('click')}
              aria-label="Volumen de sonidos"
            />
          </section>

          <div className="sidebar-footer">
            <div className={`status-line ${loadError ? 'error' : ''}`}>
              <span className="status-icon"><Icon name={loadError ? 'warning' : 'shield'} size={15} /></span>
              <span>{status}</span>
            </div>

            <button
              type="button"
              className={`generate ${generating ? 'generating' : ''}`}
              onClick={generateTeam}
              disabled={!data || generating || rerollingIndex !== null}
            >
              <span className="generate-glow" />
              <Icon name={generating ? 'refresh' : 'spark'} size={19} />
              <span>{generating ? 'Generando…' : 'Generar equipo'}</span>
            </button>
          </div>
        </aside>

        <section className="content">
          <div className="content-topline">
            <div className="game-identity">
              <span className="game-kicker">Selector principal</span>
              <div className="game-title-row">
                <h1>Overwatch 2</h1>
                <span className="web-badge">WEB ALPHA</span>
              </div>
              <p>{availableHeroes.length || '—'} héroes · {players.length} jugadores · {stadium ? 'Stadium' : 'Quick Play'} · datos locales</p>
            </div>

            <div className="match-summary">
              <div><small>Composición</small><strong>{compositionText}</strong></div>
              <div><small>Fijados</small><strong>{picks.filter((pick) => pick.locked).length}</strong></div>
              <div><small>Modo</small><strong>{stadium ? 'Stadium' : profile}</strong></div>
            </div>
          </div>

          {loadError ? (
            <div className="error-state">
              <Icon name="warning" size={34} />
              <h2>No se pudo cargar el catálogo</h2>
              <p>{loadError}</p>
              <button type="button" onClick={() => window.location.reload()}>Volver a intentar</button>
            </div>
          ) : (
            <div className="team-stage">
              <div className="stage-grid" />
              <div className={`team-grid cards-${players.length}`} style={{ '--cards': players.length } as CSSProperties}>
                {players.map((player, index) => {
                  const pick = picks[index]
                  const hero = pick?.hero
                  const visibleRole = pick?.role ?? hero?.role ?? assignedRoles[index]
                  const generationClass = generationRevision % 2 === 0 ? 'generation-a' : 'generation-b'

                  return (
                    <article
                      className={`hero-card ${visibleRole ?? ''} ${generationClass} ${pick?.locked ? 'is-locked' : ''} ${rerollingIndex === index ? 'is-rerolling' : ''}`}
                      style={{ '--delay': `${index * 55}ms` } as CSSProperties}
                      key={player.id}
                    >
                      <span className="card-corner top" />
                      <span className="card-corner bottom" />
                      <div className="card-shine" />

                      <div className="card-player">
                        <span className="player-index">{String(index + 1).padStart(2, '0')}</span>
                        <span>{player.name || `Jugador ${index + 1}`}</span>
                        {pick?.locked && <span className="mini-lock"><Icon name="lock" size={12} /></span>}
                      </div>

                      <div className="portrait">
                        <div className="portrait-grid" />
                        <div className="portrait-fallback"><Icon name="gamepad" size={48} /></div>

                        {rolesOnly && visibleRole ? (
                          <img
                            className="role-only-image"
                            src={asset(`assets/roles/${visibleRole}.png`)}
                            alt={roleLabels[visibleRole]}
                            decoding="async"
                            draggable={false}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                          />
                        ) : hero ? (
                          <img
                            className="hero-image"
                            src={asset(hero.portrait)}
                            alt={hero.name}
                            decoding="async"
                            draggable={false}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                          />
                        ) : (
                          <div className="portrait-loading"><span /><span /><span /></div>
                        )}

                        <div className="portrait-vignette" />
                        <div className="role-watermark">{visibleRole ? roleLabels[visibleRole].charAt(0) : '?'}</div>
                      </div>

                      <div className="hero-info">
                        <div className="hero-name-row">
                          <h2>{rolesOnly && visibleRole ? roleLabels[visibleRole] : hero?.name ?? 'Sin selección'}</h2>
                          <span className={`role-dot ${visibleRole ?? ''}`} />
                        </div>
                        <div className={`hero-role ${visibleRole ?? ''}`}>
                          {visibleRole ? roleLabels[visibleRole] : 'Genera un equipo'}
                          {hero?.subrole && <><span>•</span>{subroleLabels[hero.subrole] ?? hero.subrole}</>}
                        </div>
                      </div>

                      <div className="card-actions">
                        <button
                          type="button"
                          onClick={() => reroll(index)}
                          disabled={!hero || pick?.locked || rolesOnly || rerollingIndex !== null}
                          data-tooltip="Reroll"
                          aria-label={`Reroll de ${player.name}`}
                        >
                          <Icon name="refresh" size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDetails(index)}
                          disabled={!hero}
                          data-tooltip="Detalles"
                          aria-label={`Detalles de ${hero?.name ?? 'héroe'}`}
                        >
                          <Icon name="details" size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleLock(index)}
                          disabled={!hero || rolesOnly}
                          className={pick?.locked ? 'active-lock' : ''}
                          data-tooltip={pick?.locked ? 'Liberar' : 'Fijar'}
                          aria-label={pick?.locked ? `Liberar ${hero?.name}` : `Fijar ${hero?.name}`}
                        >
                          <Icon name={pick?.locked ? 'unlock' : 'lock'} size={17} />
                        </button>
                      </div>

                      {!rolesOnly && hero && randomPerks && (
                        <div className={`card-perks ${stadium ? 'stadium' : 'quickplay'}`}>
                          {pick.perks.map((perk, perkIndex) => (
                            <article className="card-perk" key={`${perk.name}-${perkIndex}`} title={perk.description}>
                              {perk.icon ? <img src={asset(perk.icon)} alt="" loading="lazy" decoding="async" /> : <Icon name="spark" size={20} />}
                              <span><small>{stadium ? `PODER ${perkIndex + 1}` : perkIndex === 0 ? 'MENOR' : 'MAYOR'}</small><b>{perk.name}</b></span>
                            </article>
                          ))}
                          {pick.perks.length === 0 && <div className="no-random-perks">Sin perks disponibles</div>}
                        </div>
                      )}

                      <div className="loadout">
                        <div>
                          <small>{stadium ? 'Modo Stadium' : randomPerks ? 'Perks activas' : 'Selección personal'}</small>
                          <span>{stadium ? `${pick.perks.length} poderes aleatorios` : randomPerks ? `${pick.perks.length} perks aleatorias` : profile === 'Sin perfil' ? 'Sin configuración' : profile}</span>
                        </div>
                        <span className="loadout-status"><Icon name="check" size={13} /></span>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      </main>
    )
  }

  function renderProfiles() {
    return (
      <main className="utility-page">
        <header className="utility-heading">
          <span className="eyebrow">Configuración local</span>
          <h1>Perfiles</h1>
          <p>Elige una base y después ajusta las reglas desde Principal.</p>
        </header>

        <div className="profile-grid">
          {profileOptions.map((item, index) => (
            <button
              type="button"
              className={`profile-card ${profile === item.name ? 'selected' : ''}`}
              onClick={() => applyProfile(item.name)}
              style={{ '--delay': `${index * 70}ms` } as CSSProperties}
              key={item.name}
            >
              <span className="profile-card-icon"><Icon name={item.name === 'Competitivo' ? 'shield' : 'profile'} size={24} /></span>
              <span className="profile-card-copy">
                <small>{item.badge}</small>
                <strong>{item.name}</strong>
                <span>{item.description}</span>
              </span>
              <span className="profile-select"><Icon name="check" size={18} /></span>
            </button>
          ))}
        </div>

        <div className="utility-note">
          <Icon name="shield" size={20} />
          <div><strong>Guardado automático</strong><span>Los nombres, roles y reglas permanecen en este navegador.</span></div>
        </div>
      </main>
    )
  }

  function renderMore() {
    return (
      <main className="utility-page">
        <header className="utility-heading">
          <span className="eyebrow">Módulos del proyecto</span>
          <h1>Más juegos</h1>
          <p>Overwatch 2 ya usa datos reales. Los demás módulos se portarán por etapas.</p>
        </header>

        <section className="web-settings-panel">
          <div className="web-setting-copy">
            <span className="profile-card-icon"><Icon name="sound" size={24} /></span>
            <div><small>INTERFAZ</small><strong>Sonidos</strong><p>Usa los efectos que agregaste para navegación, botones, generación y reroll.</p></div>
          </div>
          <button type="button" className={`sound-master ${soundEnabled ? 'enabled' : ''}`} onClick={toggleSounds}>{soundEnabled ? 'ACTIVOS' : 'APAGADOS'}</button>
          <label className="volume-control"><span>Volumen</span><input type="range" min="0" max="1" step="0.05" value={soundVolume} disabled={!soundEnabled} onChange={(event: ChangeEvent<HTMLInputElement>) => setSoundVolume(Number(event.target.value))} onPointerUp={() => playSound('click')} /><b>{Math.round(soundVolume * 100)}%</b></label>
          <button type="button" className="test-sound" disabled={!soundEnabled} onClick={() => playSound('success')}>Probar sonido</button>
        </section>

        <div className="games-grid">
          {gameModules.map((game, index) => {
            const available = game.status === 'Disponible'
            return (
              <button
                type="button"
                className={`game-module ${available ? 'available' : ''}`}
                style={{ '--module-accent': game.accent, '--delay': `${index * 55}ms` } as CSSProperties}
                onClick={() => available ? navigate('principal') : notify(`${game.name}: ${game.status}`, 'info')}
                key={game.name}
              >
                <span className="module-icon"><Icon name="gamepad" size={28} /></span>
                <span className="module-copy"><strong>{game.name}</strong><small>{game.status}</small></span>
                <span className="module-status">{available ? 'ABRIR' : 'PRÓX.'}</span>
              </button>
            )
          })}
        </div>

        <div className="roadmap-strip">
          <span><b>1</b> Interfaz y Overwatch</span>
          <i />
          <span><b>2</b> Juegos adicionales</span>
          <i />
          <span><b>3</b> Ruletas, OBS y Twitch</span>
        </div>
      </main>
    )
  }

  return (
    <div className="app">
      <div className="ambient-grid" />
      <div className="ambient-orb orb-one" />
      <div className="ambient-orb orb-two" />
      <div className="noise-layer" />

      <header className="topbar">
        <button type="button" className="brand" onClick={() => navigate('principal')} aria-label="Ir a Principal">
          <span className="brand-mark"><img src={asset('app_icon.png')} alt="" /></span>
          <span className="brand-copy"><strong>OverRoll</strong><small>Selector aleatorio de héroes</small></span>
        </button>

        <div className="local-data">
          <span className="pulse-dot" />
          Datos locales
          <b>{data?.updatedAt ? new Date(data.updatedAt).toLocaleDateString('es-MX') : 'cargando'}</b>
        </div>

        <nav aria-label="Navegación principal">
          <button type="button" className={activeView === 'principal' ? 'nav-active' : ''} onClick={() => navigate('principal')}>
            <Icon name="gamepad" size={16} /><span>Principal</span>
          </button>
          <button type="button" className={activeView === 'profiles' ? 'nav-active' : ''} onClick={() => navigate('profiles')}>
            <Icon name="profile" size={16} /><span>Perfiles</span>
          </button>
          <button type="button" className={activeView === 'more' ? 'nav-active' : ''} onClick={() => navigate('more')}>
            <Icon name="settings" size={16} /><span>Más</span>
          </button>
        </nav>
      </header>

      {activeView === 'principal' && renderPrincipal()}
      {activeView === 'profiles' && renderProfiles()}
      {activeView === 'more' && renderMore()}

      {detailsIndex !== null && selectedDetailHero && (
        <div className="drawer-layer" role="presentation" onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
          if (event.currentTarget === event.target) closeDetails()
        }}>
          <aside className={`hero-drawer ${selectedDetailHero.role}`} role="dialog" aria-modal="true" aria-label={`Detalles de ${selectedDetailHero.name}`}>
            <button type="button" className="drawer-close" onClick={closeDetails} aria-label="Cerrar detalles"><Icon name="close" size={20} /></button>

            <div className="drawer-hero">
              <img src={asset(selectedDetailHero.portrait)} alt={selectedDetailHero.name} onError={handleImageError} />
              <div className="drawer-vignette" />
              <div className="drawer-title">
                <small>{roleLabels[selectedDetailHero.role]} · {subroleLabels[selectedDetailHero.subrole] ?? selectedDetailHero.subrole}</small>
                <h2>{selectedDetailHero.name}</h2>
              </div>
            </div>

            <div className="drawer-content">
              <div className="drawer-section-title"><Icon name="spark" size={17} /><span>{stadium ? 'Poderes Stadium elegidos' : 'Perks elegidas'}</span></div>
              <div className="selected-perk-grid">
                {(selectedDetailPick?.perks ?? []).map((perk, index) => (
                  <article className="selected-perk-card" key={`selected-${perk.name}-${index}`}>
                    {perk.icon ? <img src={asset(perk.icon)} alt="" loading="lazy" /> : <Icon name="spark" size={24} />}
                    <div><small>{stadium ? `PODER ${index + 1}` : index === 0 ? 'VENTAJA MENOR' : 'VENTAJA MAYOR'}</small><strong>{perk.name}</strong><p>{perk.description}</p></div>
                  </article>
                ))}
              </div>

              {(selectedDetailPick?.perks.length ?? 0) === 0 && (
                <p className="empty-perks">Activa Perks aleatorias y genera el equipo para obtener una selección.</p>
              )}

              <div className="drawer-section-title catalog-title"><Icon name={stadium ? 'stadium' : 'details'} size={17} /><span>{stadium ? 'Catálogo Stadium' : 'Todas las perks de Quick Play'}</span></div>
              <div className="perk-grid">
                {(stadium ? selectedDetailHero.stadiumPowers : [...selectedDetailHero.minorPerks, ...selectedDetailHero.majorPerks]).map((perk, index) => (
                  <article className="perk-card detailed" key={`${perk.name}-${index}`}>
                    {perk.icon ? <img src={asset(perk.icon)} alt="" loading="lazy" /> : <Icon name="spark" size={22} />}
                    <div><span>{String(index + 1).padStart(2, '0')}</span><strong>{perk.name}</strong><small>{stadium ? 'PODER STADIUM' : index < selectedDetailHero.minorPerks.length ? 'VENTAJA MENOR' : 'VENTAJA MAYOR'}</small><p>{perk.description}</p></div>
                  </article>
                ))}
              </div>

              {(stadium ? selectedDetailHero.stadiumPowers : [...selectedDetailHero.minorPerks, ...selectedDetailHero.majorPerks]).length === 0 && (
                <p className="empty-perks">Este héroe no tiene opciones registradas para este modo.</p>
              )}
            </div>
          </aside>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.tone}`} role="status">
          <span><Icon name={toast.tone === 'warning' ? 'warning' : toast.tone === 'success' ? 'check' : 'spark'} size={17} /></span>
          <p>{toast.message}</p>
        </div>
      )}
    </div>
  )
}

export default App
