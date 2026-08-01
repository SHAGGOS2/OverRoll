import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type MouseEvent,
  type SyntheticEvent,
} from 'react'
import './App.css'

type Role = 'tank' | 'damage' | 'support'
type View = 'principal' | 'profiles' | 'more'
type ToastTone = 'success' | 'info' | 'warning'
type SoundKey =
  | 'click'
  | 'open'
  | 'close'
  | 'toggleOn'
  | 'toggleOff'
  | 'generate'
  | 'reroll'
  | 'nav'
  | 'profileSelect'
  | 'profileCreate'
  | 'profileDelete'
  | 'profileClassify'
  | 'profileAssign'
  | 'filter'
  | 'lock'
  | 'perk'
  | 'shuffle'
  | 'stadium'
type ProfileBucket = 'main' | 'played' | 'practice' | 'avoid'
type ProfileMode = 'classic' | 'allprofile' | 'lowprob' | 'practice' | 'played' | 'prefer' | 'main'
type ProfileTab = 'heroes' | 'players' | 'mode'
type IconName =
  | 'refresh'
  | 'lock'
  | 'unlock'
  | 'details'
  | 'filter'
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
  | 'plus'
  | 'upload'
  | 'download'

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

type UserProfile = {
  id: string
  name: string
  heroes: Record<ProfileBucket, string[]>
}

type Player = {
  id: string
  name: string
  roles: Record<Role, boolean>
  profileId: string
  blocked: string[]
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
const profileBuckets: ProfileBucket[] = ['main', 'played', 'practice', 'avoid']

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

const bucketLabels: Record<ProfileBucket, string> = {
  main: 'Main',
  played: 'Usado',
  practice: 'Jugado',
  avoid: 'No usado',
}

const profileModes: Array<{ id: ProfileMode; name: string; description: string }> = [
  {
    id: 'classic',
    name: 'Sin perfil',
    description: 'Ignora los perfiles. Usa cualquier héroe permitido por roles y filtros.',
  },
  {
    id: 'allprofile',
    name: 'Todos los marcados',
    description: 'Elige por igual entre Main, Usado, Jugado y No usado.',
  },
  {
    id: 'lowprob',
    name: 'Descubrir',
    description: 'Da más oportunidad a héroes menos familiares para crear variedad.',
  },
  {
    id: 'practice',
    name: 'Practicar',
    description: 'Usa héroes marcados como Jugado o No usado.',
  },
  {
    id: 'played',
    name: 'Excluir no usados',
    description: 'Usa Main, Usado o Jugado y evita los marcados como No usado.',
  },
  {
    id: 'prefer',
    name: 'Favoritos',
    description: 'Usa solamente héroes Main y Usado.',
  },
  {
    id: 'main',
    name: 'Solo Main',
    description: 'Busca héroes Main y vuelve al catálogo permitido si el rol no tiene ninguno.',
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
    case 'filter':
      return <svg {...common}><path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z" /></svg>
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
    case 'plus':
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>
    case 'upload':
      return <svg {...common}><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 20h14" /></svg>
    case 'download':
      return <svg {...common}><path d="M12 4v12M7 11l5 5 5-5" /><path d="M5 20h14" /></svg>
    default:
      return null
  }
}

function emptyProfileHeroes(): Record<ProfileBucket, string[]> {
  return { main: [], played: [], practice: [], avoid: [] }
}

function makePlayer(index: number): Player {
  return {
    id: `player-${index + 1}`,
    name: `Jugador ${index + 1}`,
    roles: { tank: true, damage: true, support: true },
    profileId: '',
    blocked: [],
  }
}

function normalizePlayers(raw: unknown): Player[] {
  if (!Array.isArray(raw) || raw.length === 0) return Array.from({ length: 5 }, (_, index) => makePlayer(index))
  return raw.slice(0, 6).map((item, index) => {
    const source = typeof item === 'object' && item ? item as Partial<Player> : {}
    return {
      id: typeof source.id === 'string' ? source.id : `player-${index + 1}`,
      name: typeof source.name === 'string' ? source.name : `Jugador ${index + 1}`,
      roles: {
        tank: source.roles?.tank !== false,
        damage: source.roles?.damage !== false,
        support: source.roles?.support !== false,
      },
      profileId: typeof source.profileId === 'string' ? source.profileId : '',
      blocked: Array.isArray(source.blocked) ? source.blocked.filter((key): key is string => typeof key === 'string') : [],
    }
  })
}

function normalizeProfiles(raw: unknown): UserProfile[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item, index) => {
    if (!item || typeof item !== 'object') return []
    const source = item as Partial<UserProfile>
    const heroes = source.heroes && typeof source.heroes === 'object' ? source.heroes : emptyProfileHeroes()
    return [{
      id: typeof source.id === 'string' && source.id ? source.id : `profile-${Date.now()}-${index}`,
      name: typeof source.name === 'string' && source.name.trim() ? source.name.trim() : `Perfil ${index + 1}`,
      heroes: {
        main: Array.isArray(heroes.main) ? heroes.main.filter((key): key is string => typeof key === 'string') : [],
        played: Array.isArray(heroes.played) ? heroes.played.filter((key): key is string => typeof key === 'string') : [],
        practice: Array.isArray(heroes.practice) ? heroes.practice.filter((key): key is string => typeof key === 'string') : [],
        avoid: Array.isArray(heroes.avoid) ? heroes.avoid.filter((key): key is string => typeof key === 'string') : [],
      },
    }]
  })
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

  const remainingSlots = compositionFor(players.length)
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

function bucketsForMode(mode: ProfileMode): ProfileBucket[] | null {
  switch (mode) {
    case 'classic': return null
    case 'allprofile': return ['main', 'played', 'practice', 'avoid']
    case 'lowprob': return ['main', 'played', 'practice', 'avoid']
    case 'practice': return ['practice', 'avoid']
    case 'played': return ['main', 'played', 'practice']
    case 'prefer': return ['main', 'played']
    case 'main': return ['main']
    default: return null
  }
}

function heroBucket(profile: UserProfile | undefined, heroKey: string): ProfileBucket | null {
  if (!profile) return null
  return profileBuckets.find((bucket) => profile.heroes[bucket].includes(heroKey)) ?? null
}

function chooseHero(options: {
  heroes: Hero[]
  player: Player
  role: Role
  used: Set<string>
  avoidRepeated: boolean
  previousKey?: string
  profiles: UserProfile[]
  profileMode: ProfileMode
}): Hero | null {
  const { heroes, player, role, used, avoidRepeated, previousKey, profiles, profileMode } = options
  const blocked = new Set(player.blocked)
  let pool = heroes.filter((hero) => hero.role === role && !blocked.has(hero.key))

  if (avoidRepeated) {
    const unique = pool.filter((hero) => !used.has(hero.key))
    if (unique.length > 0) pool = unique
  }

  const profile = profiles.find((item) => item.id === player.profileId)
  const modeBuckets = bucketsForMode(profileMode)
  if (profile && modeBuckets) {
    const allowed = new Set(modeBuckets.flatMap((bucket) => profile.heroes[bucket]))
    const profiled = pool.filter((hero) => allowed.has(hero.key))
    if (profiled.length > 0) pool = profiled
  }

  if (previousKey && pool.length > 1) {
    const alternatives = pool.filter((hero) => hero.key !== previousKey)
    if (alternatives.length > 0) pool = alternatives
  }

  if (pool.length === 0) return null

  if (profileMode === 'lowprob' && profile) {
    const weights: Record<ProfileBucket, number> = { avoid: 8, practice: 5, played: 3, main: 1 }
    const weighted = pool.map((hero) => ({ hero, weight: weights[heroBucket(profile, hero.key) ?? 'main'] ?? 1 }))
    const total = weighted.reduce((sum, item) => sum + item.weight, 0)
    let cursor = Math.random() * total
    for (const item of weighted) {
      cursor -= item.weight
      if (cursor <= 0) return item.hero
    }
  }

  return pool[Math.floor(Math.random() * pool.length)] ?? null
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
  profiles: UserProfile[]
  profileMode: ProfileMode
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
    profiles,
    profileMode,
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
      && !players[index].blocked.includes(pick.hero.key)
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
      && player.roles[selectedRole]
      && !player.blocked.includes(current.hero.key),
    )

    if (canKeepLocked && current) return current
    if (rolesOnly) return { hero: null, locked: false, role: selectedRole, perks: [] }
    if (!selectedRole) return { hero: null, locked: false, role: null, perks: [] }

    const hero = chooseHero({
      heroes,
      player,
      role: selectedRole,
      used,
      avoidRepeated,
      previousKey: current?.hero?.key,
      profiles,
      profileMode,
    })
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
  const [players, setPlayers] = useState<Player[]>(() => normalizePlayers(readStorage<unknown>('overroll.web.players', [])))
  const [picks, setPicks] = useState<Pick[]>(() => (
    Array.from({ length: 5 }, () => ({ hero: null, locked: false, role: null, perks: [] }))
  ))
  const [profiles, setProfiles] = useState<UserProfile[]>(() => normalizeProfiles(readStorage<unknown>('overroll.web.profiles', [])))
  const [profileMode, setProfileMode] = useState<ProfileMode>(() => readStorage('overroll.web.profileMode', 'classic'))
  const [currentProfileId, setCurrentProfileId] = useState(() => readStorage('overroll.web.currentProfileId', ''))
  const [profileSearch, setProfileSearch] = useState('')
  const [profileRole, setProfileRole] = useState<'all' | Role>('all')
  const [profileTab, setProfileTab] = useState<ProfileTab>('heroes')
  const [avoidRepeated, setAvoidRepeated] = useState(() => readStorage('overroll.web.avoidRepeated', true))
  const [roleComposition, setRoleComposition] = useState(() => readStorage('overroll.web.roleComposition', true))
  const [rolesOnly, setRolesOnly] = useState(() => readStorage('overroll.web.rolesOnly', false))
  const [randomPerks, setRandomPerks] = useState(() => readStorage('overroll.web.randomPerks', true))
  const [stadium, setStadium] = useState(() => readStorage('overroll.web.stadium', false))
  const [soundEnabled, setSoundEnabled] = useState(() => readStorage('overroll.web.soundEnabled', true))
  const [soundVolume, setSoundVolume] = useState(() => readStorage('overroll.web.soundVolume', 0.42))
  const [hoverSounds, setHoverSounds] = useState(() => readStorage('overroll.web.hoverSounds', false))
  const [animationsEnabled, setAnimationsEnabled] = useState(() => readStorage('overroll.web.animationsEnabled', true))
  const [compactPerks, setCompactPerks] = useState(() => readStorage('overroll.web.compactPerks', false))
  const audioRef = useRef<Partial<Record<SoundKey, HTMLAudioElement>>>({})
  const audioContextRef = useRef<AudioContext | null>(null)
  const importRef = useRef<HTMLInputElement | null>(null)
  const [detailsIndex, setDetailsIndex] = useState<number | null>(null)
  const [filterIndex, setFilterIndex] = useState<number | null>(null)
  const [filterSearch, setFilterSearch] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | Role>('all')
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
      profileSelect: 'assets/sounds/profile-select.mp3',
      profileCreate: 'assets/sounds/profile-create.mp3',
      profileDelete: 'assets/sounds/profile-delete.mp3',
      profileClassify: 'assets/sounds/profile-classify.mp3',
      profileAssign: 'assets/sounds/profile-assign.mp3',
      filter: 'assets/sounds/filter.mp3',
      lock: 'assets/sounds/lock.mp3',
      perk: 'assets/sounds/perk.mp3',
      shuffle: 'assets/sounds/shuffle.mp3',
      stadium: 'assets/sounds/stadium.mp3',
    }

    Object.entries(soundPaths).forEach(([key, path]) => {
      const audio = new Audio(`${asset(path)}?v=9`)
      audio.preload = 'metadata'
      audioRef.current[key as SoundKey] = audio
    })

    return () => {
      Object.values(audioRef.current).forEach((audio) => audio?.pause())
      audioRef.current = {}
      if (audioContextRef.current) {
        void audioContextRef.current.close().catch(() => undefined)
        audioContextRef.current = null
      }
    }
  }, [baseUrl])

  useEffect(() => {
    fetch(`${baseUrl}data/heroes.json`)
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo abrir el catálogo de héroes.')
        return response.json() as Promise<HeroData>
      })
      .then((loaded) => {
        const pool = loaded.heroes.filter((hero) => stadium ? hero.stadiumPowers.length > 0 : hero.gamemodes.includes('quickplay'))
        setData(loaded)
        setPicks((current) => buildTeam({
          heroes: pool,
          players,
          previous: current,
          avoidRepeated,
          roleComposition,
          rolesOnly,
          randomPerks,
          stadium,
          profiles,
          profileMode,
        }))
        setStatus(`${pool.length} héroes listos`)
        setGenerationRevision((value) => value + 1)
      })
      .catch((error: Error) => {
        setLoadError(error.message)
        setStatus('Error al cargar los datos')
      })
  }, [baseUrl])

  useEffect(() => {
    if (profiles.length > 0 && !profiles.some((profile) => profile.id === currentProfileId)) {
      setCurrentProfileId(profiles[0].id)
    }
  }, [profiles, currentProfileId])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem('overroll.web.players', JSON.stringify(players))
      window.localStorage.setItem('overroll.web.profiles', JSON.stringify(profiles))
      window.localStorage.setItem('overroll.web.profileMode', JSON.stringify(profileMode))
      window.localStorage.setItem('overroll.web.currentProfileId', JSON.stringify(currentProfileId))
      window.localStorage.setItem('overroll.web.avoidRepeated', JSON.stringify(avoidRepeated))
      window.localStorage.setItem('overroll.web.roleComposition', JSON.stringify(roleComposition))
      window.localStorage.setItem('overroll.web.rolesOnly', JSON.stringify(rolesOnly))
      window.localStorage.setItem('overroll.web.randomPerks', JSON.stringify(randomPerks))
      window.localStorage.setItem('overroll.web.stadium', JSON.stringify(stadium))
      window.localStorage.setItem('overroll.web.soundEnabled', JSON.stringify(soundEnabled))
      window.localStorage.setItem('overroll.web.soundVolume', JSON.stringify(soundVolume))
      window.localStorage.setItem('overroll.web.hoverSounds', JSON.stringify(hoverSounds))
      window.localStorage.setItem('overroll.web.animationsEnabled', JSON.stringify(animationsEnabled))
      window.localStorage.setItem('overroll.web.compactPerks', JSON.stringify(compactPerks))
    }, 180)

    return () => window.clearTimeout(timeout)
  }, [players, profiles, profileMode, currentProfileId, avoidRepeated, roleComposition, rolesOnly, randomPerks, stadium, soundEnabled, soundVolume, hoverSounds, animationsEnabled, compactPerks])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    const closeOverlay = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDetailsIndex(null)
        setFilterIndex(null)
      }
    }
    window.addEventListener('keydown', closeOverlay)
    return () => window.removeEventListener('keydown', closeOverlay)
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
  const profileModeInfo = profileModes.find((mode) => mode.id === profileMode) ?? profileModes[0]
  const currentProfile = profiles.find((profile) => profile.id === currentProfileId)
  const selectedDetailPick = detailsIndex === null ? null : picks[detailsIndex] ?? null
  const selectedDetailHero = selectedDetailPick?.hero ?? null
  const filterPlayer = filterIndex === null ? null : players[filterIndex] ?? null

  const classifiedHeroes = useMemo(() => {
    const search = profileSearch.trim().toLocaleLowerCase('es-MX')
    return (data?.heroes ?? []).filter((hero) => (
      (profileRole === 'all' || hero.role === profileRole)
      && (!search || hero.name.toLocaleLowerCase('es-MX').includes(search))
    ))
  }, [data, profileRole, profileSearch])

  const filterHeroes = useMemo(() => {
    const search = filterSearch.trim().toLocaleLowerCase('es-MX')
    return availableHeroes.filter((hero) => (
      (filterRole === 'all' || hero.role === filterRole)
      && (!search || hero.name.toLocaleLowerCase('es-MX').includes(search))
    ))
  }, [availableHeroes, filterRole, filterSearch])

  function playSound(kind: SoundKey) {
    if (!soundEnabled || soundVolume <= 0) return
    const audio = audioRef.current[kind]
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    audio.volume = Math.max(0, Math.min(1, soundVolume))
    void audio.play().catch(() => undefined)
  }

  function playConfirmTone() {
    if (!soundEnabled || soundVolume <= 0) return

    const context = audioContextRef.current ?? new window.AudioContext()
    audioContextRef.current = context

    if (context.state === 'suspended') {
      void context.resume().catch(() => undefined)
    }

    const now = context.currentTime
    const master = context.createGain()
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(Math.max(0.015, soundVolume * 0.16), now + 0.015)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.34)
    master.connect(context.destination)

    const notes = [
      { frequency: 660, start: 0, duration: 0.16 },
      { frequency: 880, start: 0.11, duration: 0.2 },
    ]

    notes.forEach((note) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(note.frequency, now + note.start)
      gain.gain.setValueAtTime(0.0001, now + note.start)
      gain.gain.exponentialRampToValueAtTime(0.8, now + note.start + 0.012)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration)
      oscillator.connect(gain)
      gain.connect(master)
      oscillator.start(now + note.start)
      oscillator.stop(now + note.start + note.duration + 0.02)
    })
  }

  function hoverSound() {
    if (hoverSounds) playSound('click')
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
    setStatus(stadium ? 'Barajando héroes y poderes Stadium…' : 'Barajando héroes, perfiles y filtros…')
    setPicks((current) => buildTeam({
      heroes: availableHeroes,
      players,
      previous: current,
      avoidRepeated,
      roleComposition,
      rolesOnly,
      randomPerks,
      stadium,
      profiles,
      profileMode,
    }))
    setGenerationRevision((value) => value + 1)

    window.setTimeout(() => {
      setGenerating(false)
      setStatus(rolesOnly ? 'Composición de roles generada' : 'Equipo generado correctamente')
      playConfirmTone()
      notify(rolesOnly ? 'Composición generada' : stadium ? 'Equipo Stadium generado' : 'Nuevo equipo generado', 'success')
    }, animationsEnabled ? 360 : 40)
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

      const hero = selectedRole ? chooseHero({
        heroes: availableHeroes,
        player,
        role: selectedRole,
        used,
        avoidRepeated,
        previousKey: current.hero?.key,
        profiles,
        profileMode,
      }) : null

      setPicks((old) => old.map((pick, pickIndex) => (
        pickIndex === index ? { hero, locked: false, role: selectedRole ?? null, perks: rollPerks(hero, randomPerks, stadium) } : pick
      )))
      setRerollingIndex(null)
      setStatus(`Reroll de ${player.name || `Jugador ${index + 1}`}`)
      if (!hero) notify('No hay otro héroe compatible con ese perfil y filtro.', 'warning')
    }, animationsEnabled ? 280 : 30)
  }

  function toggleLock(index: number) {
    const pick = picks[index]
    if (!pick?.hero || rolesOnly) return
    const nextLocked = !pick.locked
    playSound(nextLocked ? 'lock' : 'toggleOff')
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
      return { ...player, roles: { ...player.roles, [role]: !player.roles[role] } }
    }))
  }

  function changePlayerCount(delta: number) {
    const nextCount = Math.max(1, Math.min(6, players.length + delta))
    if (nextCount === players.length) return

    setPlayers((old) => Array.from({ length: nextCount }, (_, index) => old[index] ?? makePlayer(index)))
    setPicks((old) => Array.from(
      { length: nextCount },
      (_, index) => old[index] ?? { hero: null, locked: false, role: null, perks: [] },
    ))
    setDetailsIndex(null)
    setFilterIndex(null)
    setStatus(`${nextCount} jugador${nextCount === 1 ? '' : 'es'} en la escuadra`)
  }

  function updatePlayerName(index: number, name: string) {
    setPlayers((old) => old.map((player, playerIndex) => (
      playerIndex === index ? { ...player, name } : player
    )))
  }

  function assignPlayerProfile(index: number, profileId: string) {
    const assigned = profiles.find((item) => item.id === profileId)
    playSound('profileAssign')
    setPlayers((old) => old.map((player, playerIndex) => (
      playerIndex === index
        ? { ...player, profileId, name: assigned?.name ?? (player.profileId ? `Jugador ${index + 1}` : player.name) }
        : player
    )))
    notify(assigned ? `${assigned.name} asignado al Jugador ${index + 1}` : `Perfil retirado del Jugador ${index + 1}`)
  }

  function clearPlayerNames() {
    playSound('click')
    setPlayers((old) => old.map((player, index) => ({
      ...player,
      name: player.profileId ? (profiles.find((item) => item.id === player.profileId)?.name ?? `Jugador ${index + 1}`) : '',
    })))
    notify('Nombres libres limpiados')
  }

  function shufflePlayers() {
    playSound('shuffle')
    const payload = shuffleArray(players.map((player) => ({
      name: player.name,
      roles: player.roles,
      profileId: player.profileId,
      blocked: player.blocked,
    })))
    setPlayers((old) => old.map((player, index) => ({ ...player, ...payload[index] })))
    setPicks((old) => old.map((pick) => ({ ...pick, locked: false })))
    notify('Jugadores, perfiles, roles y filtros revueltos', 'success')
  }

  function resetPlayerRoles() {
    playSound('click')
    setPlayers((old) => old.map((player) => ({ ...player, roles: { tank: true, damage: true, support: true } })))
    notify('Roles restablecidos')
  }

  function toggleRandomPerks() {
    const next = !randomPerks
    setRandomPerks(next)
    toggleRuleSound(next)
    setPicks((old) => old.map((pick) => ({ ...pick, perks: rollPerks(pick.hero, next, stadium) })))
  }

  function toggleStadium() {
    const next = !stadium
    setStadium(next)
    setRoleComposition(true)
    setRolesOnly(false)
    playSound(next ? 'stadium' : 'toggleOff')

    if (data) {
      const pool = data.heroes.filter((hero) => next ? hero.stadiumPowers.length > 0 : hero.gamemodes.includes('quickplay'))
      setPicks((current) => buildTeam({
        heroes: pool,
        players,
        previous: current.map((pick) => ({ ...pick, locked: false })),
        avoidRepeated,
        roleComposition: true,
        rolesOnly: false,
        randomPerks,
        stadium: next,
        profiles,
        profileMode,
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

  function createProfile() {
    const id = `profile-${Date.now()}`
    const next: UserProfile = { id, name: `Nuevo perfil ${profiles.length + 1}`, heroes: emptyProfileHeroes() }
    setProfiles((old) => [...old, next])
    setCurrentProfileId(id)
    playSound('profileCreate')
    notify('Perfil creado', 'success')
  }

  function renameCurrentProfile(name: string) {
    setProfiles((old) => old.map((profile) => profile.id === currentProfileId ? { ...profile, name } : profile))
    setPlayers((old) => old.map((player) => {
      if (player.profileId !== currentProfileId) return player
      return { ...player, name }
    }))
  }

  function deleteCurrentProfile() {
    if (!currentProfile) return
    const id = currentProfile.id
    setProfiles((old) => old.filter((profile) => profile.id !== id))
    setPlayers((old) => old.map((player, index) => (
      player.profileId === id ? { ...player, profileId: '', name: `Jugador ${index + 1}` } : player
    )))
    setCurrentProfileId('')
    playSound('profileDelete')
    notify(`${currentProfile.name} fue eliminado`)
  }

  function setHeroBucket(heroKey: string, bucket: ProfileBucket | '') {
    if (!currentProfile) return
    setProfiles((old) => old.map((profile) => {
      if (profile.id !== currentProfile.id) return profile
      const heroes = Object.fromEntries(profileBuckets.map((item) => [item, profile.heroes[item].filter((key) => key !== heroKey)])) as Record<ProfileBucket, string[]>
      if (bucket) heroes[bucket] = [...heroes[bucket], heroKey]
      return { ...profile, heroes }
    }))
  }

  function clearCurrentProfile() {
    if (!currentProfile) return
    setProfiles((old) => old.map((profile) => profile.id === currentProfile.id ? { ...profile, heroes: emptyProfileHeroes() } : profile))
    notify('Clasificación del perfil reiniciada')
  }

  function exportProfiles() {
    const payload = JSON.stringify({ version: 1, profileMode, profiles, playerAssignments: players.map((player) => player.profileId) }, null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'overroll-perfiles.json'
    anchor.click()
    URL.revokeObjectURL(url)
    playConfirmTone()
    notify('Perfiles exportados', 'success')
  }

  function importProfiles(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    file.text()
      .then((text) => {
        const parsed = JSON.parse(text) as { profiles?: unknown; profileMode?: ProfileMode; playerAssignments?: unknown }
        const imported = normalizeProfiles(parsed.profiles)
        if (imported.length === 0) throw new Error('El archivo no contiene perfiles válidos.')
        setProfiles(imported)
        if (profileModes.some((mode) => mode.id === parsed.profileMode)) setProfileMode(parsed.profileMode as ProfileMode)
        if (Array.isArray(parsed.playerAssignments)) {
          const assignments = parsed.playerAssignments as unknown[]
          setPlayers((old) => old.map((player, index) => ({
            ...player,
            profileId: typeof assignments[index] === 'string' ? assignments[index] as string : '',
          })))
        }
        setCurrentProfileId(imported[0].id)
        playConfirmTone()
        notify(`${imported.length} perfiles importados`, 'success')
      })
      .catch((error: Error) => notify(error.message || 'No se pudo importar el archivo.', 'warning'))
  }

  function openFilter(index: number) {
    playSound('filter')
    setFilterIndex(index)
    setFilterSearch('')
    setFilterRole('all')
  }

  function closeFilter() {
    playSound('close')
    setFilterIndex(null)
  }

  function toggleBlockedHero(heroKey: string) {
    if (filterIndex === null) return
    setPlayers((old) => old.map((player, index) => {
      if (index !== filterIndex) return player
      const blocked = new Set(player.blocked)
      if (blocked.has(heroKey)) blocked.delete(heroKey)
      else blocked.add(heroKey)
      return { ...player, blocked: [...blocked] }
    }))
    playSound('filter')
  }

  function toggleBlockedRole(role: Role) {
    if (filterIndex === null) return
    const keys = availableHeroes.filter((hero) => hero.role === role).map((hero) => hero.key)
    setPlayers((old) => old.map((player, index) => {
      if (index !== filterIndex) return player
      const blocked = new Set(player.blocked)
      const allBlocked = keys.every((key) => blocked.has(key))
      keys.forEach((key) => allBlocked ? blocked.delete(key) : blocked.add(key))
      return { ...player, blocked: [...blocked] }
    }))
    playSound('filter')
  }

  function clearPlayerFilter() {
    if (filterIndex === null) return
    setPlayers((old) => old.map((player, index) => index === filterIndex ? { ...player, blocked: [] } : player))
    playSound('filter')
    notify('Filtro reiniciado')
  }

  function toggleManualPerk(perk: Perk) {
    if (detailsIndex === null || !selectedDetailHero) return
    setPicks((old) => old.map((pick, index) => {
      if (index !== detailsIndex) return pick
      const selected = pick.perks.some((item) => item.name === perk.name)
      if (selected) return { ...pick, perks: pick.perks.filter((item) => item.name !== perk.name) }

      if (stadium) {
        const next = [...pick.perks, perk]
        return { ...pick, perks: next.length > 4 ? next.slice(next.length - 4) : next }
      }

      const isMinor = selectedDetailHero.minorPerks.some((item) => item.name === perk.name)
      const next = pick.perks.filter((item) => {
        const itemIsMinor = selectedDetailHero.minorPerks.some((candidate) => candidate.name === item.name)
        return itemIsMinor !== isMinor
      })
      return { ...pick, perks: [...next, perk] }
    }))
    playSound('perk')
  }

  function rerollSelectedPerks() {
    if (detailsIndex === null || !selectedDetailHero) return
    setPicks((old) => old.map((pick, index) => index === detailsIndex ? { ...pick, perks: rollPerks(selectedDetailHero, true, stadium) } : pick))
    playSound('reroll')
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
            <div><span className="eyebrow">Preparar partida</span><strong>Configuración</strong></div>
            <span className="live-dot"><span /> LOCAL</span>
          </div>

          <section className="side-panel profile-panel">
            <div className="panel-title-row">
              <div><label>Modo de perfiles</label><small>{profileModeInfo.description}</small></div>
              <Icon name="profile" size={17} />
            </div>
            <select value={profileMode} onChange={(event: ChangeEvent<HTMLSelectElement>) => { setProfileMode(event.target.value as ProfileMode); playSound('profileSelect') }}>
              {profileModes.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
            </select>
          </section>

          <section className="side-panel squad-panel">
            <div className="panel-title-row">
              <div><label>Escuadra</label><small>Nombres, perfiles, filtros y roles</small></div>
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
                    disabled={Boolean(player.profileId)}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => updatePlayerName(index, event.target.value)}
                    aria-label={`Nombre del jugador ${index + 1}`}
                    title={player.profileId ? 'El nombre lo controla el perfil asignado.' : ''}
                    maxLength={22}
                  />
                  <select
                    className="player-profile-inline"
                    value={player.profileId}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => assignPlayerProfile(index, event.target.value)}
                    title={profiles.find((item) => item.id === player.profileId)?.name ?? 'Sin perfil'}
                    aria-label={`Perfil del jugador ${index + 1}`}
                  >
                    <option value="">☆</option>
                    {profiles.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
                  </select>
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
              <div><label>Reglas</label><small>Ajustes de generación</small></div>
              <Icon name="settings" size={17} />
            </div>

            <button type="button" className={`toggle-row ${avoidRepeated ? 'enabled' : ''}`} onClick={() => { const next = !avoidRepeated; setAvoidRepeated(next); toggleRuleSound(next) }} aria-pressed={avoidRepeated}>
              <span className="switch"><span /></span><span><b>Evitar repetidos</b><small>Un héroe por equipo</small></span>
            </button>
            <button type="button" className={`toggle-row ${roleComposition ? 'enabled' : ''}`} onClick={() => { const next = !roleComposition; setRoleComposition(next); toggleRuleSound(next) }} aria-pressed={roleComposition}>
              <span className="switch"><span /></span><span><b>Composición de roles</b><small>Distribución automática</small></span>
            </button>
            <button type="button" className={`toggle-row perks-toggle ${randomPerks ? 'enabled' : ''}`} onClick={toggleRandomPerks} aria-pressed={randomPerks}>
              <span className="switch"><span /></span><span><b>Perks aleatorias</b><small>{stadium ? 'Cuatro poderes Stadium' : 'Una menor y una mayor'}</small></span>
            </button>
            <button type="button" className={`toggle-row stadium-toggle ${stadium ? 'enabled' : ''}`} onClick={toggleStadium} aria-pressed={stadium}>
              <span className="switch"><span /></span><span><b>Modo Stadium</b><small>Solo héroes compatibles</small></span>
            </button>
            <button type="button" className={`toggle-row ${rolesOnly ? 'enabled' : ''}`} onClick={() => { const next = !rolesOnly; setRolesOnly(next); toggleRuleSound(next) }} aria-pressed={rolesOnly}>
              <span className="switch"><span /></span><span><b>Solo rol</b><small>Oculta los héroes</small></span>
            </button>
          </section>

          <div className="sidebar-footer">
            <div className={`status-line ${loadError ? 'error' : ''}`}><span className="status-icon"><Icon name={loadError ? 'warning' : 'shield'} size={15} /></span><span>{status}</span></div>
            <button type="button" className={`generate ${generating ? 'generating' : ''}`} onClick={generateTeam} disabled={!data || generating || rerollingIndex !== null}>
              <span className="generate-glow" /><Icon name={generating ? 'refresh' : 'spark'} size={19} /><span>{generating ? 'Generando…' : 'Generar equipo'}</span>
            </button>
          </div>
        </aside>

        <section className="content">
          <div className="content-topline">
            <div className="game-identity">
              <span className="game-kicker">Selector principal</span>
              <div className="game-title-row"><h1>Overwatch 2</h1><span className="web-badge">WEB BETA</span></div>
              <p>{availableHeroes.length || '—'} héroes · {players.length} jugadores · {stadium ? 'Stadium' : 'Quick Play'} · perfiles y filtros locales</p>
            </div>
            <div className="match-summary">
              <div><small>Composición</small><strong>{compositionText}</strong></div>
              <div><small>Fijados</small><strong>{picks.filter((pick) => pick.locked).length}</strong></div>
              <div><small>Perfil</small><strong>{profileModeInfo.name}</strong></div>
            </div>
          </div>

          {loadError ? (
            <div className="error-state"><Icon name="warning" size={34} /><h2>No se pudo cargar el catálogo</h2><p>{loadError}</p><button type="button" onClick={() => window.location.reload()}>Volver a intentar</button></div>
          ) : (
            <div className="team-stage">
              <div className="stage-grid" />
              <div className={`team-grid cards-${players.length}`} style={{ '--cards': players.length } as CSSProperties}>
                {players.map((player, index) => {
                  const pick = picks[index]
                  const hero = pick?.hero
                  const visibleRole = pick?.role ?? hero?.role ?? assignedRoles[index]
                  const generationClass = generationRevision % 2 === 0 ? 'generation-a' : 'generation-b'
                  const assignedProfile = profiles.find((item) => item.id === player.profileId)

                  return (
                    <article className={`hero-card ${visibleRole ?? ''} ${generationClass} ${pick?.locked ? 'is-locked' : ''} ${rerollingIndex === index ? 'is-rerolling' : ''}`} style={{ '--delay': `${index * 55}ms` } as CSSProperties} key={player.id}>
                      <span className="card-corner top" /><span className="card-corner bottom" /><div className="card-shine" />
                      <div className="card-player">
                        <span className="player-index">{String(index + 1).padStart(2, '0')}</span>
                        <span>{player.name || `Jugador ${index + 1}`}</span>
                        {assignedProfile && <span className="profile-tag" title={`Perfil: ${assignedProfile.name}`}>{assignedProfile.name.charAt(0).toUpperCase()}</span>}
                        {player.blocked.length > 0 && <span className="filter-count" title={`${player.blocked.length} héroes bloqueados`}>{player.blocked.length}</span>}
                        {pick?.locked && <span className="mini-lock"><Icon name="lock" size={12} /></span>}
                      </div>

                      <div className="portrait">
                        <div className="portrait-grid" /><div className="portrait-fallback"><Icon name="gamepad" size={48} /></div>
                        {rolesOnly && visibleRole ? (
                          <img className="role-only-image" src={asset(`assets/roles/${visibleRole}.png`)} alt={roleLabels[visibleRole]} decoding="async" draggable={false} onLoad={handleImageLoad} onError={handleImageError} />
                        ) : hero ? (
                          <img className="hero-image" src={asset(hero.portrait)} alt={hero.name} decoding="async" draggable={false} onLoad={handleImageLoad} onError={handleImageError} />
                        ) : (
                          <div className="portrait-loading"><span /><span /><span /></div>
                        )}
                        <div className="portrait-vignette" /><div className="role-watermark">{visibleRole ? roleLabels[visibleRole].charAt(0) : '?'}</div>
                      </div>

                      <div className="hero-info">
                        <div className="hero-name-row"><h2>{rolesOnly && visibleRole ? roleLabels[visibleRole] : hero?.name ?? 'Sin selección'}</h2><span className={`role-dot ${visibleRole ?? ''}`} /></div>
                        <div className={`hero-role ${visibleRole ?? ''}`}>
                          {visibleRole ? roleLabels[visibleRole] : 'Genera un equipo'}
                          {hero?.subrole && <><span>•</span>{subroleLabels[hero.subrole] ?? hero.subrole}</>}
                        </div>
                      </div>

                      <div className="card-actions four-actions">
                        <button type="button" onClick={() => reroll(index)} disabled={!hero || pick?.locked || rolesOnly || rerollingIndex !== null} data-tooltip="Reroll" aria-label={`Reroll de ${player.name}`}><Icon name="refresh" size={18} /></button>
                        <button type="button" onClick={() => openFilter(index)} disabled={rolesOnly} data-tooltip="Filtro" aria-label={`Filtro de ${player.name}`} className={player.blocked.length > 0 ? 'active-filter' : ''}><Icon name="filter" size={18} /></button>
                        <button type="button" onClick={() => openDetails(index)} disabled={!hero} data-tooltip="Perks y detalles" aria-label={`Detalles de ${hero?.name ?? 'héroe'}`}><Icon name="details" size={18} /></button>
                        <button type="button" onClick={() => toggleLock(index)} disabled={!hero || rolesOnly} className={pick?.locked ? 'active-lock' : ''} data-tooltip={pick?.locked ? 'Liberar' : 'Fijar'} aria-label={pick?.locked ? `Liberar ${hero?.name}` : `Fijar ${hero?.name}`}><Icon name={pick?.locked ? 'unlock' : 'lock'} size={17} /></button>
                      </div>

                      {!rolesOnly && hero && pick.perks.length > 0 && (
                        <div className={`card-perks ${stadium ? 'stadium' : 'quickplay'}`}>
                          {pick.perks.map((perk, perkIndex) => (
                            <article className="card-perk" key={`${perk.name}-${perkIndex}`} title={perk.description}>
                              {perk.icon ? <img src={asset(perk.icon)} alt="" loading="lazy" decoding="async" /> : <Icon name="spark" size={20} />}
                              <span><small>{stadium ? `PODER ${perkIndex + 1}` : hero.minorPerks.some((item) => item.name === perk.name) ? 'MENOR' : 'MAYOR'}</small><b>{perk.name}</b></span>
                            </article>
                          ))}
                        </div>
                      )}

                      <div className="loadout">
                        <div>
                          <small>{stadium ? 'Modo Stadium' : pick.perks.length > 0 ? 'Perks activas' : 'Selección personal'}</small>
                          <span>{stadium ? `${pick.perks.length} poderes` : pick.perks.length > 0 ? `${pick.perks.length} perks` : assignedProfile ? assignedProfile.name : 'Sin configuración'}</span>
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


  function profileMarkedCount(profile: UserProfile) {
    return profileBuckets.reduce((sum, bucket) => sum + profile.heroes[bucket].length, 0)
  }

  function profileAssignedCount(profileId: string) {
    return players.filter((player) => player.profileId === profileId).length
  }

  function duplicateCurrentProfile() {
    if (!currentProfile) return
    const id = `profile-${Date.now()}`
    const copy: UserProfile = {
      id,
      name: `${currentProfile.name} copia`.slice(0, 28),
      heroes: Object.fromEntries(
        profileBuckets.map((bucket) => [bucket, [...currentProfile.heroes[bucket]]]),
      ) as Record<ProfileBucket, string[]>,
    }
    setProfiles((old) => [...old, copy])
    setCurrentProfileId(id)
    playSound('profileCreate')
    notify('Perfil duplicado', 'success')
  }

  function setVisibleHeroesBucket(bucket: ProfileBucket | '') {
    if (!currentProfile || classifiedHeroes.length === 0) return
    const visibleKeys = new Set(classifiedHeroes.map((hero) => hero.key))

    setProfiles((old) => old.map((profile) => {
      if (profile.id !== currentProfile.id) return profile
      const heroes = Object.fromEntries(
        profileBuckets.map((item) => [
          item,
          profile.heroes[item].filter((key) => !visibleKeys.has(key)),
        ]),
      ) as Record<ProfileBucket, string[]>

      if (bucket) heroes[bucket] = [...heroes[bucket], ...visibleKeys]
      return { ...profile, heroes }
    }))

    playSound('profileClassify')
    notify(
      bucket
        ? `${classifiedHeroes.length} héroes visibles marcados como ${bucketLabels[bucket]}`
        : `${classifiedHeroes.length} héroes visibles quedaron sin marcar`,
      'success',
    )
  }

  function renderProfiles() {
    const totalHeroes = data?.heroes.length ?? 0
    const markedHeroes = currentProfile ? profileMarkedCount(currentProfile) : 0
    const assignedPlayers = currentProfile ? profileAssignedCount(currentProfile.id) : 0
    const unmarkedHeroes = Math.max(0, totalHeroes - markedHeroes)
    const completion = totalHeroes > 0 ? Math.round((markedHeroes / totalHeroes) * 100) : 0

    return (
      <main className="utility-page profile-manager-page profile-comfort-page">
        <header className="utility-heading profile-heading profile-heading-compact">
          <div>
            <span className="eyebrow">Perfiles locales</span>
            <h1>Perfiles</h1>
            <p>Elige una persona y configura únicamente lo que necesita para sus selecciones.</p>
          </div>
          <div className="profile-header-actions">
            <input ref={importRef} className="hidden-file-input" type="file" accept="application/json,.json" onChange={importProfiles} />
            <button type="button" onClick={() => importRef.current?.click()} title="Importar perfiles"><Icon name="upload" size={16} /> Importar</button>
            <button type="button" onClick={exportProfiles} disabled={profiles.length === 0} title="Exportar perfiles"><Icon name="download" size={16} /> Exportar</button>
            <button type="button" className="primary" onClick={createProfile}><Icon name="plus" size={16} /> Nuevo perfil</button>
          </div>
        </header>

        <div className="profile-comfort-layout">
          <aside className="profile-comfort-sidebar">
            <div className="profile-sidebar-head">
              <div>
                <small>PERFILES GUARDADOS</small>
                <strong>{profiles.length}</strong>
              </div>
              <button type="button" onClick={createProfile} aria-label="Crear perfil" title="Crear perfil"><Icon name="plus" size={17} /></button>
            </div>

            <div className="profile-sidebar-list">
              {profiles.length === 0 ? (
                <button type="button" className="empty-profile-create compact" onClick={createProfile}>
                  <Icon name="plus" size={20} />
                  <strong>Crear el primer perfil</strong>
                  <span>Se guarda solo en este navegador.</span>
                </button>
              ) : profiles.map((item) => {
                const marked = profileMarkedCount(item)
                const assigned = profileAssignedCount(item.id)
                return (
                  <button
                    type="button"
                    className={`comfort-profile-row ${item.id === currentProfileId ? 'selected' : ''}`}
                    onClick={() => { setCurrentProfileId(item.id); playSound('profileSelect') }}
                    key={item.id}
                  >
                    <span className="saved-profile-avatar">{item.name.charAt(0).toUpperCase()}</span>
                    <span>
                      <strong>{item.name}</strong>
                      <small>{marked}/{totalHeroes || '—'} héroes{assigned ? ` · ${assigned} jugador${assigned === 1 ? '' : 'es'}` : ''}</small>
                    </span>
                    {item.id === currentProfileId && <Icon name="check" size={15} />}
                  </button>
                )
              })}
            </div>
          </aside>

          <section className="profile-comfort-editor">
            {!currentProfile ? (
              <div className="profile-editor-empty comfort-empty">
                <Icon name="profile" size={44} />
                <h2>Selecciona o crea un perfil</h2>
                <p>Después podrás marcar héroes, asignarlo a jugadores y elegir su modo de selección.</p>
                <button type="button" className="primary" onClick={createProfile}><Icon name="plus" size={16} /> Crear perfil</button>
              </div>
            ) : (
              <>
                <div className="profile-comfort-top">
                  <div className="profile-name-block">
                    <small>NOMBRE DEL PERFIL</small>
                    <input value={currentProfile.name} onChange={(event: ChangeEvent<HTMLInputElement>) => renameCurrentProfile(event.target.value)} maxLength={28} />
                  </div>
                  <div className="profile-quick-stats" aria-label="Resumen del perfil">
                    <span><b>{markedHeroes}</b><small>marcados</small></span>
                    <span><b>{unmarkedHeroes}</b><small>sin marcar</small></span>
                    <span><b>{assignedPlayers}</b><small>jugadores</small></span>
                  </div>
                  <div className="profile-identity-actions compact-actions">
                    <button type="button" onClick={duplicateCurrentProfile} title="Duplicar perfil"><Icon name="plus" size={15} /> Duplicar</button>
                    <button type="button" className="danger icon-danger" onClick={deleteCurrentProfile} title="Eliminar perfil"><Icon name="trash" size={16} /></button>
                  </div>
                </div>

                <div className="profile-comfort-progress" aria-label={`${completion}% clasificado`}>
                  <span style={{ width: `${completion}%` }} />
                </div>

                <nav className="profile-editor-tabs" aria-label="Secciones del perfil">
                  <button type="button" className={profileTab === 'heroes' ? 'active' : ''} onClick={() => setProfileTab('heroes')}>
                    <Icon name="gamepad" size={16} /> Héroes <b>{markedHeroes}/{totalHeroes || '—'}</b>
                  </button>
                  <button type="button" className={profileTab === 'players' ? 'active' : ''} onClick={() => setProfileTab('players')}>
                    <Icon name="users" size={16} /> Jugadores <b>{assignedPlayers}</b>
                  </button>
                  <button type="button" className={profileTab === 'mode' ? 'active' : ''} onClick={() => setProfileTab('mode')}>
                    <Icon name="settings" size={16} /> Modo <b>{profileModeInfo.name}</b>
                  </button>
                </nav>

                {profileTab === 'heroes' && (
                  <section className="profile-tab-content heroes-tab-content">
                    <div className="profile-classifier-toolbar profile-toolbar-comfort">
                      <div className="profile-search">
                        <Icon name="filter" size={16} />
                        <input value={profileSearch} onChange={(event: ChangeEvent<HTMLInputElement>) => setProfileSearch(event.target.value)} placeholder="Buscar héroe…" />
                      </div>
                      <div className="role-filter-tabs">
                        <button type="button" className={profileRole === 'all' ? 'active' : ''} onClick={() => setProfileRole('all')}>Todos</button>
                        {roles.map((role) => (
                          <button type="button" className={`${role} ${profileRole === role ? 'active' : ''}`} onClick={() => setProfileRole(role)} key={role}>
                            {roleLabels[role]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="comfort-category-bar">
                      <div className="bucket-legend compact-legend">
                        {profileBuckets.map((bucket) => (
                          <span className={bucket} key={bucket}><i />{bucketLabels[bucket]} <b>{currentProfile.heroes[bucket].length}</b></span>
                        ))}
                        <span className="unmarked"><i />Sin marcar <b>{unmarkedHeroes}</b></span>
                      </div>
                      <div className="comfort-bulk-actions">
                        <span>Marcar visibles:</span>
                        {profileBuckets.map((bucket) => (
                          <button type="button" className={bucket} onClick={() => setVisibleHeroesBucket(bucket)} title={`Marcar visibles como ${bucketLabels[bucket]}`} key={bucket}>
                            {bucketLabels[bucket]}
                          </button>
                        ))}
                        <button type="button" className="unmarked" onClick={() => setVisibleHeroesBucket('')}>Limpiar</button>
                      </div>
                    </div>

                    <p className="profile-help-line">Pulsa una categoría en cada héroe. El botón activo indica cómo se usará en este perfil.</p>

                    <div className="hero-classifier-grid hero-classifier-comfort">
                      {classifiedHeroes.map((hero) => {
                        const bucket = heroBucket(currentProfile, hero.key)
                        return (
                          <article className={`classifier-hero comfort-hero-card ${hero.role} ${bucket ?? 'unmarked'}`} key={hero.key}>
                            <span className="classifier-portrait">
                              <img src={asset(hero.portrait)} alt="" loading="lazy" decoding="async" />
                              <i className={hero.role}>{roleLabels[hero.role].charAt(0)}</i>
                            </span>
                            <span className="comfort-hero-copy">
                              <strong>{hero.name}</strong>
                              <small>{roleLabels[hero.role]}</small>
                            </span>
                            <div className="comfort-category-buttons" aria-label={`Clasificación de ${hero.name}`}>
                              {profileBuckets.map((item) => (
                                <button
                                  type="button"
                                  className={`${item} ${bucket === item ? 'active' : ''}`}
                                  onClick={() => { setHeroBucket(hero.key, bucket === item ? '' : item); playSound('profileClassify') }}
                                  aria-pressed={bucket === item}
                                  title={bucketLabels[item]}
                                  key={item}
                                >
                                  {bucketLabels[item]}
                                </button>
                              ))}
                            </div>
                          </article>
                        )
                      })}
                    </div>

                    <div className="profile-tab-footer">
                      <button type="button" className="reset-classification" onClick={clearCurrentProfile}><Icon name="reset" size={15} /> Reiniciar clasificación</button>
                    </div>
                  </section>
                )}

                {profileTab === 'players' && (
                  <section className="profile-tab-content players-tab-content">
                    <div className="profile-tab-intro">
                      <div><small>ASIGNACIÓN</small><h2>¿Quién usa este perfil?</h2><p>Puedes asignarlo a una o varias fichas de la pantalla principal.</p></div>
                    </div>
                    <div className="comfort-player-grid">
                      {players.map((player, index) => {
                        const assigned = player.profileId === currentProfile.id
                        const otherProfile = profiles.find((item) => item.id === player.profileId)
                        return (
                          <button
                            type="button"
                            className={assigned ? 'assigned' : ''}
                            onClick={() => assignPlayerProfile(index, assigned ? '' : currentProfile.id)}
                            key={player.id}
                          >
                            <b>{String(index + 1).padStart(2, '0')}</b>
                            <span><strong>{player.name || `Jugador ${index + 1}`}</strong><small>{assigned ? 'Usa este perfil' : otherProfile ? `Usa ${otherProfile.name}` : 'Sin perfil asignado'}</small></span>
                            <Icon name={assigned ? 'check' : 'profile'} size={18} />
                          </button>
                        )
                      })}
                    </div>
                  </section>
                )}

                {profileTab === 'mode' && (
                  <section className="profile-tab-content mode-tab-content">
                    <div className="profile-tab-intro">
                      <div><small>COMPORTAMIENTO</small><h2>Modo de selección</h2><p>Define cómo se interpretan las categorías al generar héroes.</p></div>
                    </div>
                    <div className="comfort-mode-grid" role="list" aria-label="Modos de perfil">
                      {profileModes.map((mode) => (
                        <button
                          type="button"
                          className={profileMode === mode.id ? 'active' : ''}
                          onClick={() => { setProfileMode(mode.id); playSound('profileSelect') }}
                          aria-pressed={profileMode === mode.id}
                          key={mode.id}
                        >
                          <span><Icon name={profileMode === mode.id ? 'check' : 'settings'} size={18} /></span>
                          <div><strong>{mode.name}</strong><small>{mode.description}</small></div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    )
  }

  function renderMore() {
    return (
      <main className="utility-page">
        <header className="utility-heading"><span className="eyebrow">Configuración web</span><h1>Más</h1><p>Sonidos, animaciones, presentación y próximos módulos.</p></header>

        <section className="settings-grid-web">
          <article className="web-setting-card">
            <span className="profile-card-icon"><Icon name="sound" size={24} /></span>
            <div><small>AUDIO</small><strong>Sonidos de interfaz</strong><p>Todo el audio y el volumen se administran aquí. La confirmación ahora es un tono generado, sin voces ni archivos heredados.</p></div>
            <button type="button" className={`sound-master ${soundEnabled ? 'enabled' : ''}`} onClick={toggleSounds}>{soundEnabled ? 'ACTIVOS' : 'APAGADOS'}</button>
            <label className="volume-control"><span>Volumen</span><input type="range" min="0" max="1" step="0.05" value={soundVolume} disabled={!soundEnabled} onChange={(event: ChangeEvent<HTMLInputElement>) => setSoundVolume(Number(event.target.value))} onPointerUp={() => playSound('click')} /><b>{Math.round(soundVolume * 100)}%</b></label>
            <button type="button" className="test-sound" disabled={!soundEnabled} onClick={playConfirmTone}>Probar confirmación</button>
          </article>

          <article className="web-setting-card compact-setting">
            <span className="profile-card-icon"><Icon name="spark" size={24} /></span>
            <div><small>RENDIMIENTO</small><strong>Animaciones</strong><p>Desactívalas en equipos con GPU limitada o cuando la página se sienta pesada.</p></div>
            <button type="button" className={`sound-master ${animationsEnabled ? 'enabled' : ''}`} onClick={() => { const next = !animationsEnabled; setAnimationsEnabled(next); toggleRuleSound(next) }}>{animationsEnabled ? 'ACTIVAS' : 'REDUCIDAS'}</button>
          </article>

          <article className="web-setting-card compact-setting">
            <span className="profile-card-icon"><Icon name="details" size={24} /></span>
            <div><small>FICHAS</small><strong>Perks compactas</strong><p>Reduce el espacio usado por perks y poderes cuando hay cinco o seis jugadores.</p></div>
            <button type="button" className={`sound-master ${compactPerks ? 'enabled' : ''}`} onClick={() => { const next = !compactPerks; setCompactPerks(next); toggleRuleSound(next) }}>{compactPerks ? 'COMPACTAS' : 'COMPLETAS'}</button>
          </article>

          <article className="web-setting-card compact-setting">
            <span className="profile-card-icon"><Icon name="sound" size={24} /></span>
            <div><small>INTERACCIÓN</small><strong>Sonido al pasar el mouse</strong><p>Está apagado por defecto para no volver molesta la interfaz.</p></div>
            <button type="button" className={`sound-master ${hoverSounds ? 'enabled' : ''}`} onClick={() => { const next = !hoverSounds; setHoverSounds(next); toggleRuleSound(next) }}>{hoverSounds ? 'ACTIVO' : 'APAGADO'}</button>
          </article>
        </section>

        <div className="games-grid">
          {gameModules.map((game, index) => {
            const available = game.status === 'Disponible'
            return (
              <button type="button" className={`game-module ${available ? 'available' : ''}`} style={{ '--module-accent': game.accent, '--delay': `${index * 55}ms` } as CSSProperties} onMouseEnter={hoverSound} onClick={() => available ? navigate('principal') : notify(`${game.name}: ${game.status}`, 'info')} key={game.name}>
                <span className="module-icon"><Icon name="gamepad" size={28} /></span><span className="module-copy"><strong>{game.name}</strong><small>{game.status}</small></span><span className="module-status">{available ? 'ABRIR' : 'PRÓX.'}</span>
              </button>
            )
          })}
        </div>
      </main>
    )
  }

  return (
    <div className={`app ${animationsEnabled ? '' : 'reduce-motion'} ${compactPerks ? 'compact-perks' : ''}`}>
      <div className="ambient-grid" /><div className="ambient-orb orb-one" /><div className="ambient-orb orb-two" /><div className="noise-layer" />

      <header className="topbar">
        <button type="button" className="brand" onMouseEnter={hoverSound} onClick={() => navigate('principal')} aria-label="Ir a Principal">
          <span className="brand-mark"><img src={asset('app_icon.png')} alt="" /></span><span className="brand-copy"><strong>OverRoll</strong><small>Selector aleatorio de héroes</small></span>
        </button>
        <div className="local-data"><span className="pulse-dot" />Datos locales<b>{data?.updatedAt ? new Date(data.updatedAt).toLocaleDateString('es-MX') : 'cargando'}</b></div>
        <nav aria-label="Navegación principal">
          <button type="button" className={activeView === 'principal' ? 'nav-active' : ''} onMouseEnter={hoverSound} onClick={() => navigate('principal')}><Icon name="gamepad" size={16} /><span>Principal</span></button>
          <button type="button" className={activeView === 'profiles' ? 'nav-active' : ''} onMouseEnter={hoverSound} onClick={() => navigate('profiles')}><Icon name="profile" size={16} /><span>Perfiles</span></button>
          <button type="button" className={activeView === 'more' ? 'nav-active' : ''} onMouseEnter={hoverSound} onClick={() => navigate('more')}><Icon name="settings" size={16} /><span>Más</span></button>
        </nav>
      </header>

      {activeView === 'principal' && renderPrincipal()}
      {activeView === 'profiles' && renderProfiles()}
      {activeView === 'more' && renderMore()}

      {detailsIndex !== null && selectedDetailHero && (
        <div className="drawer-layer" role="presentation" onMouseDown={(event: MouseEvent<HTMLDivElement>) => { if (event.currentTarget === event.target) closeDetails() }}>
          <aside className={`hero-drawer ${selectedDetailHero.role}`} role="dialog" aria-modal="true" aria-label={`Detalles de ${selectedDetailHero.name}`}>
            <button type="button" className="drawer-close" onClick={closeDetails} aria-label="Cerrar detalles"><Icon name="close" size={20} /></button>
            <div className="drawer-hero">
              <img src={asset(selectedDetailHero.portrait)} alt={selectedDetailHero.name} onError={handleImageError} /><div className="drawer-vignette" />
              <div className="drawer-title"><small>{roleLabels[selectedDetailHero.role]} · {subroleLabels[selectedDetailHero.subrole] ?? selectedDetailHero.subrole}</small><h2>{selectedDetailHero.name}</h2></div>
            </div>
            <div className="drawer-content">
              <div className="drawer-section-title with-action"><span><Icon name="spark" size={17} />{stadium ? 'Poderes Stadium elegidos' : 'Perks elegidas'}</span><button type="button" onClick={rerollSelectedPerks}><Icon name="refresh" size={15} /> Aleatorias</button></div>
              <div className="selected-perk-grid">
                {(selectedDetailPick?.perks ?? []).map((perk, index) => (
                  <article className="selected-perk-card" key={`selected-${perk.name}-${index}`}>
                    {perk.icon ? <img src={asset(perk.icon)} alt="" loading="lazy" /> : <Icon name="spark" size={24} />}
                    <div><small>{stadium ? `PODER ${index + 1}` : selectedDetailHero.minorPerks.some((item) => item.name === perk.name) ? 'VENTAJA MENOR' : 'VENTAJA MAYOR'}</small><strong>{perk.name}</strong><p>{perk.description}</p></div>
                  </article>
                ))}
              </div>
              {(selectedDetailPick?.perks.length ?? 0) === 0 && <p className="empty-perks">Selecciona perks manualmente abajo o usa el botón Aleatorias.</p>}

              <div className="drawer-section-title catalog-title"><Icon name={stadium ? 'stadium' : 'details'} size={17} /><span>{stadium ? 'Catálogo Stadium · elige hasta 4' : 'Catálogo Quick Play · una menor y una mayor'}</span></div>
              <div className="perk-grid">
                {(stadium ? selectedDetailHero.stadiumPowers : [...selectedDetailHero.minorPerks, ...selectedDetailHero.majorPerks]).map((perk, index) => {
                  const selected = selectedDetailPick?.perks.some((item) => item.name === perk.name)
                  return (
                    <button type="button" className={`perk-card detailed selectable ${selected ? 'selected' : ''}`} onClick={() => toggleManualPerk(perk)} key={`${perk.name}-${index}`}>
                      {perk.icon ? <img src={asset(perk.icon)} alt="" loading="lazy" /> : <Icon name="spark" size={22} />}
                      <div><span>{selected ? '✓' : String(index + 1).padStart(2, '0')}</span><strong>{perk.name}</strong><small>{stadium ? 'PODER STADIUM' : index < selectedDetailHero.minorPerks.length ? 'VENTAJA MENOR' : 'VENTAJA MAYOR'}</small><p>{perk.description}</p></div>
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>
        </div>
      )}

      {filterIndex !== null && filterPlayer && (
        <div className="filter-layer" role="presentation" onMouseDown={(event: MouseEvent<HTMLDivElement>) => { if (event.currentTarget === event.target) closeFilter() }}>
          <section className="filter-dialog" role="dialog" aria-modal="true" aria-label={`Filtro de ${filterPlayer.name}`}>
            <header className="filter-heading">
              <div><span className="eyebrow">Filtro individual</span><h2>{filterPlayer.name || `Jugador ${filterIndex + 1}`}</h2><p>{availableHeroes.length - filterPlayer.blocked.length} visibles · {filterPlayer.blocked.length} bloqueados</p></div>
              <button type="button" onClick={closeFilter} aria-label="Cerrar filtro"><Icon name="close" size={20} /></button>
            </header>

            <div className="filter-toolbar">
              <div className="profile-search"><Icon name="filter" size={16} /><input value={filterSearch} onChange={(event: ChangeEvent<HTMLInputElement>) => setFilterSearch(event.target.value)} placeholder="Buscar héroe…" /></div>
              <div className="role-filter-tabs">
                <button type="button" className={filterRole === 'all' ? 'active' : ''} onClick={() => setFilterRole('all')}>Todos</button>
                {roles.map((role) => <button type="button" className={`${role} ${filterRole === role ? 'active' : ''}`} onClick={() => setFilterRole(role)} key={role}>{roleLabels[role]}</button>)}
              </div>
              <button type="button" className="reset-classification" onClick={clearPlayerFilter}><Icon name="reset" size={15} /> Reiniciar</button>
            </div>

            <div className="filter-role-actions">
              {roles.map((role) => {
                const roleHeroes = availableHeroes.filter((hero) => hero.role === role)
                const allBlocked = roleHeroes.length > 0 && roleHeroes.every((hero) => filterPlayer.blocked.includes(hero.key))
                return <button type="button" className={`${role} ${allBlocked ? 'blocked' : ''}`} onClick={() => toggleBlockedRole(role)} key={role}>{allBlocked ? `Permitir ${roleLabels[role]}` : `Bloquear ${roleLabels[role]}`}</button>
              })}
            </div>

            <div className="filter-hero-grid">
              {filterHeroes.map((hero) => {
                const blocked = filterPlayer.blocked.includes(hero.key)
                return (
                  <button type="button" className={`filter-hero ${hero.role} ${blocked ? 'blocked' : ''}`} onClick={() => toggleBlockedHero(hero.key)} aria-pressed={blocked} key={hero.key}>
                    <img src={asset(hero.portrait)} alt={hero.name} loading="lazy" decoding="async" />
                    <span><strong>{hero.name}</strong><small>{blocked ? 'BLOQUEADO' : 'PERMITIDO'}</small></span>
                    <i>{blocked ? '×' : '✓'}</i>
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      )}

      {toast && <div className={`toast ${toast.tone}`} role="status"><span><Icon name={toast.tone === 'warning' ? 'warning' : toast.tone === 'success' ? 'check' : 'spark'} size={17} /></span><p>{toast.message}</p></div>}
    </div>
  )
}

export default App
