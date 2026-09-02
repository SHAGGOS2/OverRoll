import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { warmImageCache } from './imageCache'
import './RosterModule.css'

export type RosterGameId =
  | 'rivals'
  | 'valorant'
  | 'deadlock'
  | 'lastflag'
  | 'thefinals'
  | 'paladins'
  | 'fragpunk'
  | 'apex'

type ToastTone = 'success' | 'info' | 'warning'
type ModuleView = 'principal' | 'roulette'
type RosterSoundKey = 'click' | 'open' | 'close' | 'toggleOn' | 'toggleOff' | 'generate' | 'reroll' | 'nav' | 'profileAssign' | 'filter' | 'lock' | 'shuffle'
type RosterConfigTab = 'squad' | 'rules'

type RoleDefinition = {
  id: string
  label: string
  color: string
}

export type RosterGameDefinition = {
  id: RosterGameId
  name: string
  shortName: string
  kicker: string
  accent: string
  defaultPlayers: number
  minPlayers?: number
  maxPlayers: number
  description: string
  catalogLabel: string
  formatLabel: string
  roles: RoleDefinition[]
  supportsTeamups?: boolean
  supportsLoadouts?: boolean
  rolePattern?: string[]
}

type CatalogHero = {
  key: string
  name: string
  role: string
  portrait: string
}

type CatalogPayload = {
  source?: string
  updated?: string
  heroes: CatalogHero[]
}

type Teamup = {
  key: string
  name: string
  heroes: string[]
  receiver?: string
  anchor?: string
}

type TeamupsPayload = {
  season?: string
  teamups: Teamup[]
}

type FinalsRawLoadouts = Record<string, {
  specializations: string[]
  weapons: string[]
  gadgets: string[]
}>

type FinalsLoadout = {
  specialization: string
  weapon: string
  gadgets: string[]
}

type SharedProfile = {
  id: string
  name: string
}

type RosterPlayer = {
  id: string
  name: string
  profileId: string
  roles: Record<string, boolean>
  blocked: string[]
}

type RosterPick = {
  hero: CatalogHero | null
  locked: boolean
  candidates?: CatalogHero[]
  loadout?: FinalsLoadout
  teamupKey?: string
}

type Props = {
  gameId: RosterGameId
  view: ModuleView
  profiles: SharedProfile[]
  baseUrl: string
  animationsEnabled: boolean
  soundEnabled: boolean
  soundVolume: number
  mobileCompactMode: boolean
  notify: (message: string, tone?: ToastTone) => void
  playUiSound?: (sound: RosterSoundKey) => void
  playConfirmTone?: () => void
}

type RosterIconName = 'settings' | 'users' | 'gamepad' | 'shield' | 'spark' | 'close' | 'profile' | 'trash' | 'shuffle' | 'reset' | 'reroll' | 'filter' | 'details' | 'lock' | 'unlock' | 'check' | 'download' | 'roulette'

function RosterIcon({ name, size = 18 }: { name: RosterIconName; size?: number }) {
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
    case 'settings': return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A8 8 0 0 0 15 6l-.3-2.6h-4L10.4 6A8 8 0 0 0 8 7.1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1A8 8 0 0 0 10.4 18l.3 2.6h4L15 18a8 8 0 0 0 2-1.1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z" /></svg>
    case 'users': return <svg {...common}><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M18 15a6 6 0 0 1 4 6" /></svg>
    case 'gamepad': return <svg {...common}><path d="M6 8h12a4 4 0 0 1 3.8 5.3l-1.1 3.2a2.3 2.3 0 0 1-3.7 1l-1.6-1.3H8.6L7 17.5a2.3 2.3 0 0 1-3.7-1l-1.1-3.2A4 4 0 0 1 6 8Z" /><path d="M8 11v4M6 13h4M16.5 12h.01M18.5 14h.01" /></svg>
    case 'shield': return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
    case 'spark': return <svg {...common}><path d="m12 3-1.5 4.5L6 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5L12 3Z" /><path d="m5 15-.8 2.2L2 18l2.2.8L5 21l.8-2.2L8 18l-2.2-.8L5 15Z" /></svg>
    case 'close': return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>
    case 'profile': return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
    case 'trash': return <svg {...common}><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" /></svg>
    case 'shuffle': return <svg {...common}><path d="M16 3h5v5M4 20l5.5-5.5M21 3l-6.5 6.5M16 16h5v5M15 15l6 6M4 4l5.5 5.5" /></svg>
    case 'reset': return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
    case 'reroll': return <svg {...common}><path d="M4 7h11a5 5 0 0 1 5 5" /><path d="m4 7 3-3M4 7l3 3" /><path d="M20 17H9a5 5 0 0 1-5-5" /><path d="m20 17-3-3m3 3-3 3" /></svg>
    case 'filter': return <svg {...common}><path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z" /></svg>
    case 'details': return <svg {...common}><path d="M4 6h16M4 12h16M4 18h10" /></svg>
    case 'lock': return <svg {...common}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
    case 'unlock': return <svg {...common}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 7.3-2.2" /></svg>
    case 'check': return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>
    case 'download': return <svg {...common}><path d="M12 4v12M7 11l5 5 5-5" /><path d="M5 20h14" /></svg>
    case 'roulette': return <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="1.4" /><path d="M12 4v6M12 14v6M4 12h6M14 12h6M6.35 6.35l4.24 4.24M13.41 13.41l4.24 4.24M17.65 6.35l-4.24 4.24M10.59 13.41l-4.24 4.24" /></svg>
    default: return null
  }
}

export const rosterGameDefinitions: RosterGameDefinition[] = [
  {
    id: 'rivals',
    name: 'Marvel Rivals',
    shortName: 'Rivals',
    kicker: 'Team-Ups y roles',
    accent: '#6ae4ff',
    defaultPlayers: 6,
    maxPlayers: 6,
    rolePattern: ['vanguard', 'vanguard', 'duelist', 'duelist', 'strategist', 'strategist'],
    description: 'Forma una escuadra de seis héroes y prioriza combinaciones de Team-Up.',
    catalogLabel: '53 héroes',
    formatLabel: '6 jugadores',
    supportsTeamups: true,
    roles: [
      { id: 'vanguard', label: 'Vanguardia', color: '#79b7ff' },
      { id: 'duelist', label: 'Duelista', color: '#ff6969' },
      { id: 'strategist', label: 'Estratega', color: '#7ce7a3' },
      { id: 'flex', label: 'Flexible', color: '#d69cff' },
    ],
  },
  {
    id: 'valorant',
    name: 'Valorant',
    shortName: 'Valorant',
    kicker: 'Agentes por rol',
    accent: '#ff5868',
    defaultPlayers: 5,
    maxPlayers: 5,
    rolePattern: ['controller', 'duelist', 'initiator', 'sentinel', 'duelist'],
    description: 'Genera una composición de cinco agentes respetando los roles habilitados.',
    catalogLabel: '29 agentes',
    formatLabel: '5 jugadores',
    roles: [
      { id: 'controller', label: 'Controlador', color: '#9c8cff' },
      { id: 'duelist', label: 'Duelista', color: '#ff5868' },
      { id: 'initiator', label: 'Iniciador', color: '#ffb454' },
      { id: 'sentinel', label: 'Centinela', color: '#65d6bd' },
    ],
  },
  {
    id: 'deadlock',
    name: 'Deadlock',
    shortName: 'Deadlock',
    kicker: 'Tres preferencias por jugador',
    accent: '#d1bd77',
    defaultPlayers: 3,
    minPlayers: 3,
    maxPlayers: 12,
    description: 'Genera tres preferencias de héroe por jugador; Deadlock decide cuál asigna al entrar a la partida.',
    catalogLabel: '38 héroes',
    formatLabel: '3 a 12 jugadores',
    roles: [{ id: 'hero', label: 'Héroe', color: '#d1bd77' }],
  },
  {
    id: 'lastflag',
    name: 'Last Flag',
    shortName: 'Last Flag',
    kicker: 'Tres concursantes',
    accent: '#efcd4f',
    defaultPlayers: 3,
    maxPlayers: 3,
    description: 'Genera un equipo de tres concursantes con estilos completamente distintos.',
    catalogLabel: '9 concursantes',
    formatLabel: '3 jugadores',
    roles: [
      { id: 'assassin', label: 'Asesino', color: '#f25f5c' },
      { id: 'tank', label: 'Tanque', color: '#5d9cec' },
      { id: 'all-rounder', label: 'Versátil', color: '#a78bfa' },
      { id: 'recon', label: 'Reconocimiento', color: '#4dd0e1' },
      { id: 'area-control', label: 'Control de área', color: '#f6b352' },
      { id: 'support', label: 'Apoyo', color: '#72d6a0' },
      { id: 'crowd-control', label: 'Control', color: '#c79bf2' },
      { id: 'offensive', label: 'Ofensivo', color: '#ff7d66' },
      { id: 'control', label: 'Táctico', color: '#70b7ff' },
    ],
  },
  {
    id: 'thefinals',
    name: 'THE FINALS',
    shortName: 'THE FINALS',
    kicker: 'Builds completas',
    accent: '#f7db22',
    defaultPlayers: 3,
    maxPlayers: 3,
    rolePattern: ['light', 'medium', 'heavy'],
    description: 'Elige complexión, especialización, arma y tres artefactos para cada concursante.',
    catalogLabel: '3 complexiones',
    formatLabel: '3 jugadores',
    supportsLoadouts: true,
    roles: [
      { id: 'light', label: 'Ligero', color: '#78d6ff' },
      { id: 'medium', label: 'Medio', color: '#f7db22' },
      { id: 'heavy', label: 'Pesado', color: '#ff7d58' },
    ],
  },
  {
    id: 'paladins',
    name: 'Paladins',
    shortName: 'Paladins',
    kicker: 'Campeones por clase',
    accent: '#50c7e8',
    defaultPlayers: 5,
    maxPlayers: 5,
    rolePattern: ['frontline', 'damage', 'flank', 'support', 'damage'],
    description: 'Forma una escuadra de cinco campeones con daño, flanco, frontline y apoyo.',
    catalogLabel: '59 campeones',
    formatLabel: '5 jugadores',
    roles: [
      { id: 'frontline', label: 'Frontline', color: '#5ca8ff' },
      { id: 'damage', label: 'Daño', color: '#ff675f' },
      { id: 'flank', label: 'Flanco', color: '#d593ff' },
      { id: 'support', label: 'Apoyo', color: '#67d69a' },
    ],
  },
  {
    id: 'fragpunk',
    name: 'FragPunk',
    shortName: 'FragPunk',
    kicker: 'Lancers aleatorios',
    accent: '#ffea3b',
    defaultPlayers: 5,
    maxPlayers: 5,
    description: 'Reparte cinco Lancers sin mezclar su estado con ningún otro juego.',
    catalogLabel: '21 Lancers',
    formatLabel: '5 jugadores',
    roles: [{ id: 'lancer', label: 'Lancer', color: '#ffea3b' }],
  },
  {
    id: 'apex',
    name: 'Apex Legends',
    shortName: 'Apex',
    kicker: 'Trío de leyendas',
    accent: '#ee5a49',
    defaultPlayers: 3,
    maxPlayers: 3,
    description: 'Genera un trío de leyendas y filtra por las cinco clases actuales.',
    catalogLabel: '28 leyendas',
    formatLabel: '3 jugadores',
    roles: [
      { id: 'assault', label: 'Asalto', color: '#ef655f' },
      { id: 'skirmisher', label: 'Escaramuza', color: '#f59f4a' },
      { id: 'recon', label: 'Reconocimiento', color: '#65b8ff' },
      { id: 'controller', label: 'Control', color: '#b694ff' },
      { id: 'support', label: 'Apoyo', color: '#67d69a' },
    ],
  },
]


function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function randomIndex(length: number): number {
  if (length <= 1) return 0
  const buffer = new Uint32Array(1)
  crypto.getRandomValues(buffer)
  return buffer[0] % length
}

function randomItem<T>(items: T[]): T | undefined {
  return items[randomIndex(items.length)]
}

function shuffled<T>(items: T[]): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = randomIndex(index + 1)
    const value = copy[index]
    copy[index] = copy[other]
    copy[other] = value
  }
  return copy
}

function makePlayer(index: number, roles: RoleDefinition[]): RosterPlayer {
  return {
    id: crypto.randomUUID(),
    name: `Jugador ${index + 1}`,
    profileId: '',
    roles: Object.fromEntries(roles.map((role) => [role.id, true])),
    blocked: [],
  }
}

function minimumPlayers(game: RosterGameDefinition): number {
  return Math.max(1, Math.min(game.maxPlayers, game.minPlayers ?? 1))
}


function buildRolePlan(game: RosterGameDefinition, players: RosterPlayer[]): string[] {
  const roles = game.roles.filter((role) => role.id !== 'flex').map((role) => role.id)
  if (!roles.length) return Array.from({ length: players.length }, () => '')

  const plan: string[] = []
  if (game.rolePattern?.length) {
    while (plan.length < players.length) plan.push(...game.rolePattern)
    const resolved = plan.slice(0, players.length)
    // Rivals mantiene la composición 2-2-2, pero los roles no pertenecen a slots fijos.
    return game.id === 'rivals' ? shuffled(resolved) : resolved
  }

  while (plan.length < players.length) plan.push(...shuffled(roles))
  return plan.slice(0, players.length)
}

function normalizeRosterPlayers(raw: unknown, game: RosterGameDefinition): RosterPlayer[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return Array.from({ length: game.defaultPlayers }, (_, index) => makePlayer(index, game.roles))
  }

  const normalized = raw.slice(0, game.maxPlayers).map((value, index) => {
    const row = value && typeof value === 'object' ? value as Record<string, unknown> : {}
    const roles = Object.fromEntries(game.roles.map((role) => [role.id, true])) as Record<string, boolean>
    return {
      id: typeof row.id === 'string' && row.id ? row.id : crypto.randomUUID(),
      name: typeof row.name === 'string' && row.name.trim() ? row.name.slice(0, 22) : `Jugador ${index + 1}`,
      profileId: typeof row.profileId === 'string' ? row.profileId : '',
      roles,
      blocked: Array.isArray(row.blocked) ? row.blocked.filter((key): key is string => typeof key === 'string') : [],
    }
  })

  const minimum = minimumPlayers(game)
  const targetLength = Math.max(minimum, normalized.length || game.defaultPlayers)
  return Array.from({ length: Math.min(game.maxPlayers, targetLength) }, (_, index) => normalized[index] ?? makePlayer(index, game.roles))
}

function normalizePortrait(gameId: RosterGameId, portrait: string): string {
  if (/^(?:https?:)?\/\//i.test(portrait) || /^(?:data|blob):/i.test(portrait)) return portrait
  const filename = portrait.replace(/\\/g, '/').split('/').pop() ?? portrait
  return `assets/games/${gameId}/${filename}`
}

function roleDefinition(game: RosterGameDefinition, roleId: string): RoleDefinition {
  return game.roles.find((role) => role.id === roleId) ?? {
    id: roleId,
    label: roleId || 'Personaje',
    color: game.accent,
  }
}

function slugifyFinalsItem(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^\./, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function finalsIcon(baseUrl: string, name: string): string {
  const slug = slugifyFinalsItem(name)
  const extension = slug === 'h-infuser' ? 'png' : 'webp'
  return `${baseUrl}assets/games/thefinals/items/${slug}.${extension}`
}

function pickFinalsLoadout(raw: FinalsRawLoadouts | null, role: string): FinalsLoadout | undefined {
  const pool = raw?.[role]
  if (!pool) return undefined
  const specialization = randomItem(pool.specializations) ?? ''
  const weapon = randomItem(pool.weapons) ?? ''
  const gadgetPool = [...pool.gadgets]
  const gadgets: string[] = []
  while (gadgetPool.length && gadgets.length < 3) {
    gadgets.push(gadgetPool.splice(randomIndex(gadgetPool.length), 1)[0])
  }
  return { specialization, weapon, gadgets }
}

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360
}

function roulettePoint(radius: number, degrees: number) {
  const radians = (degrees * Math.PI) / 180
  return { x: 200 + Math.cos(radians) * radius, y: 200 + Math.sin(radians) * radius }
}

function rouletteSectorPath(index: number, total: number) {
  if (total <= 1) return 'M 200 16 A 184 184 0 1 1 199.9 16 Z'
  const step = 360 / total
  const start = -90 + index * step
  const end = start + step
  const first = roulettePoint(184, start)
  const second = roulettePoint(184, end)
  const largeArc = step > 180 ? 1 : 0
  return `M 200 200 L ${first.x.toFixed(3)} ${first.y.toFixed(3)} A 184 184 0 ${largeArc} 1 ${second.x.toFixed(3)} ${second.y.toFixed(3)} Z`
}

function buildWeightedEntries(keys: string[], weights: Record<string, number>): string[] {
  const entries: string[] = []
  keys.forEach((key) => {
    const weight = Math.max(1, Math.min(5, Math.round(weights[key] ?? 1)))
    for (let index = 0; index < weight; index += 1) entries.push(key)
  })
  return entries
}

function rosterPickCandidates(pick: RosterPick | undefined): CatalogHero[] {
  if (!pick) return []
  if (pick.candidates?.length) return pick.candidates.slice(0, 3)
  return pick.hero ? [pick.hero] : []
}

export default function RosterModule({
  gameId,
  view,
  profiles,
  baseUrl,
  animationsEnabled,
  soundEnabled,
  soundVolume,
  mobileCompactMode,
  notify,
  playUiSound,
  playConfirmTone,
}: Props) {
  const game = rosterGameDefinitions.find((item) => item.id === gameId) ?? rosterGameDefinitions[0]
  const storagePrefix = `overroll.web.${gameId}`
  const [catalog, setCatalog] = useState<CatalogHero[]>([])
  const [loadError, setLoadError] = useState('')
  const [teamups, setTeamups] = useState<Teamup[]>([])
  const [teamupsReady, setTeamupsReady] = useState(!game.supportsTeamups)
  const [finalsLoadouts, setFinalsLoadouts] = useState<FinalsRawLoadouts | null>(null)
  const [players, setPlayers] = useState<RosterPlayer[]>(() => (
    normalizeRosterPlayers(readStorage<unknown>(`${storagePrefix}.players`, []), game)
  ))
  const [picks, setPicks] = useState<RosterPick[]>(() => Array.from({ length: players.length }, () => ({ hero: null, locked: false })))
  const [avoidRepeated, setAvoidRepeated] = useState(() => readStorage(`${storagePrefix}.avoidRepeated`, true))
  const [balancedRoles, setBalancedRoles] = useState(() => readStorage(`${storagePrefix}.balancedRoles`, game.roles.length > 1))
  const [priorityTeamups, setPriorityTeamups] = useState(() => readStorage(`${storagePrefix}.priorityTeamups`, true))
  const [status, setStatus] = useState(`Cargando ${game.name}…`)
  const [generating, setGenerating] = useState(false)
  const [generationRevision, setGenerationRevision] = useState(0)
  const [rerollingIndex, setRerollingIndex] = useState<number | null>(null)
  const [mobileConfigOpen, setMobileConfigOpen] = useState(false)
  const [mobileConfigTab, setMobileConfigTab] = useState<RosterConfigTab>('squad')
  const [detailsIndex, setDetailsIndex] = useState<number | null>(null)
  const [filterIndex, setFilterIndex] = useState<number | null>(null)
  const [filterSearch, setFilterSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [rouletteSearch, setRouletteSearch] = useState('')
  const [rouletteRole, setRouletteRole] = useState('all')
  const [rouletteSelected, setRouletteSelected] = useState<string[]>(() => readStorage(`${storagePrefix}.rouletteSelected`, []))
  const [rouletteWeights, setRouletteWeights] = useState<Record<string, number>>(() => readStorage(`${storagePrefix}.rouletteWeights`, {}))
  const [rouletteEntries, setRouletteEntries] = useState<string[]>([])
  const [rouletteDirty, setRouletteDirty] = useState(true)
  const [rouletteWinner, setRouletteWinner] = useState('')
  const [rouletteSpinning, setRouletteSpinning] = useState(false)
  const [rouletteRotation, setRouletteRotation] = useState(0)
  const spinTimerRef = useRef<number | null>(null)

  const asset = (path: string) => /^(?:https?:)?\/\//i.test(path) || /^(?:data|blob):/i.test(path) ? path : `${baseUrl}${path.replace(/^\//, '')}`

  useEffect(() => {
    let cancelled = false
    setLoadError('')
    setStatus(`Cargando ${game.name}…`)
    fetch(`${baseUrl}assets/games/${gameId}/catalog.json`, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<CatalogPayload>
      })
      .then((payload) => {
        if (cancelled) return
        const heroes = (payload.heroes ?? []).map((hero) => ({
          ...hero,
          key: hero.key.startsWith(`${gameId}-`) || gameId !== 'rivals' ? hero.key : `${gameId}-${hero.key}`,
          portrait: normalizePortrait(gameId, hero.portrait),
        }))
        setCatalog(heroes)
        warmImageCache(heroes.map((hero) => asset(hero.portrait)))
        setStatus(`${heroes.length} ${game.catalogLabel.replace(/^\d+\s*/, '').toLowerCase()} listos`)
        setRouletteSelected((current) => current.length ? current.filter((key) => heroes.some((hero) => hero.key === key)) : heroes.map((hero) => hero.key))
        setRouletteWeights((current) => ({ ...Object.fromEntries(heroes.map((hero) => [hero.key, 1])), ...current }))
      })
      .catch(() => {
        if (cancelled) return
        setLoadError(`No se pudo abrir el catálogo local de ${game.name}.`)
        setStatus('Catálogo no disponible')
      })

    if (game.supportsTeamups) {
      setTeamupsReady(false)
      fetch(`${baseUrl}assets/games/rivals/teamups.json`, { cache: 'no-store' })
        .then((response) => response.json() as Promise<TeamupsPayload>)
        .then((payload) => {
          if (!cancelled) {
            setTeamups(payload.teamups ?? [])
            setTeamupsReady(true)
          }
        })
        .catch(() => { if (!cancelled) setTeamupsReady(true) })
    }

    if (game.supportsLoadouts) {
      fetch(`${baseUrl}assets/games/thefinals/loadouts.json`, { cache: 'no-store' })
        .then((response) => response.json() as Promise<FinalsRawLoadouts>)
        .then((payload) => { if (!cancelled) setFinalsLoadouts(payload) })
        .catch(() => undefined)
    }

    return () => { cancelled = true }
  }, [baseUrl, game.catalogLabel, game.name, game.supportsLoadouts, game.supportsTeamups, gameId])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(`${storagePrefix}.players`, JSON.stringify(players))
      window.localStorage.setItem(`${storagePrefix}.avoidRepeated`, JSON.stringify(avoidRepeated))
      window.localStorage.setItem(`${storagePrefix}.balancedRoles`, JSON.stringify(balancedRoles))
      window.localStorage.setItem(`${storagePrefix}.priorityTeamups`, JSON.stringify(priorityTeamups))
      window.localStorage.setItem(`${storagePrefix}.rouletteSelected`, JSON.stringify(rouletteSelected))
      window.localStorage.setItem(`${storagePrefix}.rouletteWeights`, JSON.stringify(rouletteWeights))
    }, 120)
    return () => window.clearTimeout(timer)
  }, [avoidRepeated, balancedRoles, players, priorityTeamups, rouletteSelected, rouletteWeights, storagePrefix])

  useEffect(() => () => {
    if (spinTimerRef.current !== null) window.clearTimeout(spinTimerRef.current)
  }, [])

  useEffect(() => {
    setPicks((current) => Array.from({ length: players.length }, (_, index) => current[index] ?? { hero: null, locked: false }))
  }, [players.length])

  const chosenKeys = useMemo(() => picks.flatMap((pick) => rosterPickCandidates(pick).map((hero) => hero.key)), [picks])

  const filteredRouletteHeroes = useMemo(() => catalog.filter((hero) => {
    const query = rouletteSearch.trim().toLowerCase()
    return (!query || hero.name.toLowerCase().includes(query)) && (rouletteRole === 'all' || hero.role === rouletteRole)
  }), [catalog, rouletteRole, rouletteSearch])

  const roulettePool = useMemo(() => {
    const selected = new Set(rouletteSelected)
    return catalog.filter((hero) => selected.has(hero.key))
  }, [catalog, rouletteSelected])

  const rouletteTotalSlots = useMemo(() => buildWeightedEntries(rouletteSelected, rouletteWeights).length, [rouletteSelected, rouletteWeights])

  const rouletteBuiltHeroes = useMemo(() => {
    const byKey = new Map(catalog.map((hero) => [hero.key, hero]))
    return rouletteEntries.map((key) => byKey.get(key)).filter((hero): hero is CatalogHero => Boolean(hero))
  }, [catalog, rouletteEntries])

  function rouletteWeight(heroKey: string) {
    return Math.max(1, Math.min(5, Math.round(Number(rouletteWeights[heroKey] ?? 1))))
  }

  function rouletteProbability(heroKey: string) {
    if (!rouletteSelected.includes(heroKey) || rouletteTotalSlots <= 0) return 0
    return rouletteWeight(heroKey) * 100 / rouletteTotalSlots
  }

  function markRouletteDirty() {
    setRouletteDirty(true)
    setRouletteWinner('')
  }

  function buildRoulette(playAudio = true) {
    if (rouletteSpinning || roulettePool.length === 0 || rouletteTotalSlots > 64) return [] as string[]
    const entries = buildWeightedEntries(rouletteSelected, rouletteWeights)
    if (entries.length === 1) entries.push(entries[0])
    const shuffledEntries = shuffled(entries).slice(0, 64)
    setRouletteEntries(shuffledEntries)
    setRouletteRotation(0)
    setRouletteWinner('')
    setRouletteDirty(false)
    if (playAudio) playModuleSound('generate', 700, 0.12)
    return shuffledEntries
  }


  function playTone(frequency = 520, duration = 0.08) {
    if (!soundEnabled) return
    try {
      const context = new AudioContext()
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      gain.gain.value = Math.max(0.01, soundVolume * 0.12)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start()
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration)
      oscillator.stop(context.currentTime + duration)
      oscillator.addEventListener('ended', () => void context.close())
    } catch {
      // AudioContext can be blocked until the first user gesture; generation still works.
    }
  }


  function playModuleSound(kind: RosterSoundKey, fallbackFrequency = 520, fallbackDuration = 0.08) {
    if (!soundEnabled || soundVolume <= 0) return
    if (playUiSound) {
      playUiSound(kind)
      return
    }
    playTone(fallbackFrequency, fallbackDuration)
  }

  function changePlayerCount(delta: number) {
    const nextCount = Math.max(minimumPlayers(game), Math.min(game.maxPlayers, players.length + delta))
    if (nextCount === players.length) return
    setPlayers((current) => Array.from({ length: nextCount }, (_, index) => current[index] ?? makePlayer(index, game.roles)))
    setPicks((current) => Array.from({ length: nextCount }, (_, index) => current[index] ?? { hero: null, locked: false }))
    setFilterIndex(null)
    setDetailsIndex(null)
    setStatus(`${nextCount} jugador${nextCount === 1 ? '' : 'es'} configurado${nextCount === 1 ? '' : 's'}`)
    playModuleSound('click', 430)
  }

  function updatePlayerName(index: number, name: string) {
    setPlayers((current) => current.map((player, playerIndex) => playerIndex === index ? { ...player, name } : player))
  }

  function assignProfile(index: number, profileId: string) {
    const profile = profiles.find((item) => item.id === profileId)
    setPlayers((current) => current.map((player, playerIndex) => playerIndex === index
      ? { ...player, profileId, name: profile?.name ?? `Jugador ${index + 1}` }
      : player))
    playModuleSound('profileAssign', 620)
  }

  function clearPlayerNames() {
    setPlayers((current) => current.map((player, index) => ({
      ...player,
      profileId: '',
      name: `Jugador ${index + 1}`,
    })))
    setStatus('Nombres restablecidos')
    playModuleSound('click', 430)
  }

  function shufflePlayerOrder() {
    const order = shuffled(players.map((_, index) => index))
    setPlayers(order.map((index) => players[index]))
    setPicks(order.map((index) => picks[index] ?? { hero: null, locked: false }))
    setDetailsIndex(null)
    setStatus('Orden de jugadores mezclado')
    playModuleSound('shuffle', 560)
  }


  function candidatePool(player: RosterPlayer, preferredRole: string | null, used: Set<string>, previousKey = ''): CatalogHero[] {
    const allowed = catalog.filter((hero) => player.roles[hero.role] !== false && !player.blocked.includes(hero.key))
    // Deadpool es Flexible en Rivals: puede ocupar cualquier hueco del plan 2-2-2.
    const byRole = preferredRole
      ? allowed.filter((hero) => hero.role === preferredRole || (game.id === 'rivals' && hero.role === 'flex'))
      : allowed
    let pool = byRole.length ? byRole : allowed
    if (avoidRepeated) {
      const unique = pool.filter((hero) => !used.has(hero.key))
      if (unique.length) pool = unique
    }
    const withoutPrevious = pool.filter((hero) => hero.key !== previousKey)
    if (withoutPrevious.length) pool = withoutPrevious
    return pool
  }

  function chooseDeadlockCandidates(player: RosterPlayer, used: Set<string>, previousKeys: string[] = []): CatalogHero[] {
    const allowed = catalog.filter((hero) => player.roles[hero.role] !== false && !player.blocked.includes(hero.key))
    const previous = new Set(previousKeys)
    const selected: CatalogHero[] = []

    while (selected.length < 3) {
      let pool = allowed.filter((hero) => !selected.some((item) => item.key === hero.key))
      if (avoidRepeated) {
        const globallyUnique = pool.filter((hero) => !used.has(hero.key))
        if (globallyUnique.length) pool = globallyUnique
      }
      const fresh = pool.filter((hero) => !previous.has(hero.key))
      if (fresh.length) pool = fresh
      const hero = randomItem(pool)
      if (!hero) break
      selected.push(hero)
      if (avoidRepeated) used.add(hero.key)
    }

    return selected
  }

  function teamupAnchorKey(teamup: Teamup): string {
    const explicit = teamup.anchor?.trim()
    if (explicit) return explicit
    const listed = teamup.heroes.find((key) => key !== teamup.receiver)
    if (listed) return listed
    // Backward compatibility for older Season 9 snapshots where The Hood was not yet in the selectable catalog.
    if (['hellfire-sparks', 'oblivion-shroud', 'void-pentagram'].includes(teamup.key)) return 'rivals-the-hood'
    return ''
  }

  function teamupsForReceiver(heroKey: string): Teamup[] {
    return teamups.filter((teamup) => teamup.receiver === heroKey)
  }

  // The Hood is the partner/anchor for three Season 9 Team-Ups rather than the receiver.
  // Keep the existing receiver-first behavior for the rest of the roster, but let his card
  // expose and cycle those three relationships like any other Rivals card.
  function selectableTeamupsForHero(heroKey: string): Teamup[] {
    if (heroKey === 'rivals-the-hood') {
      return teamups.filter((teamup) => teamup.receiver === heroKey || teamupAnchorKey(teamup) === heroKey)
    }
    return teamupsForReceiver(heroKey)
  }

  function teamupPartnerKey(teamup: Teamup, heroKey: string): string {
    const anchorKey = teamupAnchorKey(teamup)
    return anchorKey === heroKey ? (teamup.receiver ?? '') : anchorKey
  }

  function teamupPartnerName(teamup: Teamup, heroKey: string): string {
    const partnerKey = teamupPartnerKey(teamup, heroKey)
    return heroByKey(partnerKey)?.name ?? 'Compañero'
  }

  function teamupIsComplete(teamup: Teamup, selected: Set<string>): boolean {
    const receiverKey = teamup.receiver ?? ''
    const anchorKey = teamupAnchorKey(teamup)
    return Boolean(receiverKey && anchorKey && selected.has(receiverKey) && selected.has(anchorKey))
  }

  function heroByKey(heroKey: string): CatalogHero | null {
    return catalog.find((hero) => hero.key === heroKey) ?? null
  }

  function applyTeamupSelections(team: RosterPick[]): RosterPick[] {
    if (!game.supportsTeamups) return team
    const selected = new Set(team.flatMap((pick) => pick.hero ? [pick.hero.key] : []))
    return team.map((pick) => {
      if (!pick.hero) return { ...pick, teamupKey: undefined }
      const options = selectableTeamupsForHero(pick.hero.key)
      const complete = options.filter((teamup) => teamupIsComplete(teamup, selected))
      const existing = options.find((teamup) => teamup.key === pick.teamupKey)
      const chosen = priorityTeamups
        ? complete.find((teamup) => teamup.key === existing?.key) ?? randomItem(complete) ?? existing ?? randomItem(options) ?? null
        : existing ?? randomItem(options) ?? null
      return { ...pick, teamupKey: chosen?.key }
    })
  }

  function teamupBiasedHero(pool: CatalogHero[], used: Set<string>): CatalogHero | null {
    if (!pool.length) return null
    if (!game.supportsTeamups || !priorityTeamups || used.size === 0) return randomItem(pool) ?? null
    const preferred = pool.filter((hero) => teamups.some((teamup) => {
      const receiverKey = teamup.receiver ?? ''
      const anchorKey = teamupAnchorKey(teamup)
      return (receiverKey === hero.key && used.has(anchorKey))
        || (anchorKey === hero.key && used.has(receiverKey))
    }))
    return randomItem(preferred.length ? preferred : pool) ?? null
  }

  function assignedRole(index: number, rolePlan: string[]): string | null {
    if (!balancedRoles || game.roles.length <= 1) return null
    return rolePlan[index] ?? null
  }

  function rivalsMissingRole(excludeIndex: number): string | null {
    if (game.id !== 'rivals') return null
    const targets: Record<string, number> = { vanguard: 2, duelist: 2, strategist: 2 }
    const counts: Record<string, number> = { vanguard: 0, duelist: 0, strategist: 0 }
    picks.forEach((pick, index) => {
      if (index === excludeIndex || !pick.hero || pick.hero.role === 'flex') return
      if (counts[pick.hero.role] !== undefined) counts[pick.hero.role] += 1
    })
    const missing = Object.keys(targets).flatMap((role) =>
      Array.from({ length: Math.max(0, targets[role] - counts[role]) }, () => role),
    )
    return randomItem(missing) ?? null
  }

  function generateTeam() {
    if (!catalog.length) {
      notify(`El catálogo de ${game.name} todavía no está listo.`, 'warning')
      return
    }
    if (game.supportsTeamups && priorityTeamups && !teamupsReady) {
      notify('Los Team-Ups todavía se están cargando. Intenta de nuevo en un momento.', 'warning')
      return
    }
    if (game.supportsTeamups && priorityTeamups && teamupsReady && teamups.length === 0) {
      notify('No se pudo abrir el catálogo de Team-Ups.', 'warning')
      return
    }
    setGenerating(true)
    playModuleSound('generate', 360, 0.13)
    setStatus(game.supportsTeamups && priorityTeamups ? 'Buscando una combinación de Team-Up válida…' : `Barajando ${game.catalogLabel.toLowerCase()}…`)

    if (gameId === 'deadlock') {
      const used = new Set<string>()
      const next = players.map((player, index) => {
        const current = picks[index]
        const currentCandidates = rosterPickCandidates(current)
        const lockedCandidatesAreValid = Boolean(
          current?.locked
          && currentCandidates.length === 3
          && currentCandidates.every((hero) => !player.blocked.includes(hero.key) && player.roles[hero.role] !== false),
        )
        if (lockedCandidatesAreValid) {
          if (avoidRepeated) currentCandidates.forEach((hero) => used.add(hero.key))
          return { ...current, hero: currentCandidates[0] ?? null, candidates: currentCandidates } as RosterPick
        }
        const candidates = chooseDeadlockCandidates(player, used, currentCandidates.map((hero) => hero.key))
        return { hero: candidates[0] ?? null, candidates, locked: false }
      })
      const candidateCount = next.reduce((total, pick) => total + rosterPickCandidates(pick).length, 0)
      const completeCards = next.filter((pick) => rosterPickCandidates(pick).length === 3).length
      setPicks(next)
      setGenerationRevision((value) => value + 1)
      setStatus(`${completeCards}/${players.length} fichas · ${candidateCount} candidatos generados`)
      window.setTimeout(() => {
        setGenerating(false)
        if (playConfirmTone) playConfirmTone()
        else playTone(880, 0.18)
      }, animationsEnabled ? 420 : 1)
      notify(completeCards === players.length ? 'Deadlock: tres candidatos por jugador generados' : 'Algunos filtros no permiten completar tres candidatos.', completeCards === players.length ? 'success' : 'warning')
      return
    }

    const used = new Set<string>()
    const rolePlan = buildRolePlan(game, players)
    const next: RosterPick[] = Array.from({ length: players.length }, () => ({ hero: null, locked: false }))
    const openIndices: number[] = []

    players.forEach((player, index) => {
      const current = picks[index]
      if (current?.locked && current.hero && !player.blocked.includes(current.hero.key) && player.roles[current.hero.role] !== false) {
        next[index] = current
        used.add(current.hero.key)
      } else {
        openIndices.push(index)
      }
    })

    let seededTeamup = false
    if (game.supportsTeamups && priorityTeamups && teamups.length) {
      const canAssign = (playerIndex: number, hero: CatalogHero) => {
        const player = players[playerIndex]
        return player
          && player.roles[hero.role] !== false
          && !player.blocked.includes(hero.key)
          && !used.has(hero.key)
      }

      for (const teamup of shuffled(teamups)) {
        const receiver = heroByKey(teamup.receiver ?? '')
        const anchor = heroByKey(teamupAnchorKey(teamup))
        if (!receiver || !anchor || receiver.key === anchor.key) continue

        const receiverAlready = used.has(receiver.key)
        const anchorAlready = used.has(anchor.key)
        if (receiverAlready && anchorAlready) {
          seededTeamup = true
          break
        }

        if (receiverAlready !== anchorAlready) {
          const missingHero = receiverAlready ? anchor : receiver
          const targetIndex = openIndices.find((playerIndex) => canAssign(playerIndex, missingHero))
          if (targetIndex === undefined) continue
          next[targetIndex] = {
            hero: missingHero,
            locked: false,
            loadout: undefined,
            teamupKey: missingHero.key === receiver.key ? teamup.key : undefined,
          }
          used.add(missingHero.key)
          openIndices.splice(openIndices.indexOf(targetIndex), 1)
          seededTeamup = true
          break
        }

        const receiverIndex = openIndices.find((playerIndex) => canAssign(playerIndex, receiver))
        if (receiverIndex === undefined) continue
        const anchorIndex = openIndices.find((playerIndex) => playerIndex !== receiverIndex && canAssign(playerIndex, anchor))
        if (anchorIndex === undefined) continue

        next[receiverIndex] = { hero: receiver, locked: false, teamupKey: teamup.key }
        next[anchorIndex] = { hero: anchor, locked: false }
        used.add(receiver.key)
        used.add(anchor.key)
        openIndices.splice(openIndices.indexOf(receiverIndex), 1)
        openIndices.splice(openIndices.indexOf(anchorIndex), 1)
        seededTeamup = true
        break
      }
    }

    openIndices.forEach((index) => {
      const player = players[index]
      const current = picks[index]
      const preferredRole = assignedRole(index, rolePlan)
      const pool = candidatePool(player, preferredRole, used, current?.hero?.key)
      const hero = teamupBiasedHero(pool, used)
      if (hero) used.add(hero.key)
      next[index] = {
        hero,
        locked: false,
        loadout: hero && game.supportsLoadouts ? pickFinalsLoadout(finalsLoadouts, hero.role) : undefined,
      }
    })

    const resolved = applyTeamupSelections(next)
    const selectedKeys = new Set(resolved.flatMap((pick) => pick.hero ? [pick.hero.key] : []))
    const activeTeamupCount = resolved.filter((pick) => {
      const selectedTeamup = pick.teamupKey ? teamups.find((teamup) => teamup.key === pick.teamupKey) : null
      return selectedTeamup ? teamupIsComplete(selectedTeamup, selectedKeys) : false
    }).length

    setPicks(resolved)
    setGenerationRevision((value) => value + 1)
    const completed = resolved.filter((pick) => pick.hero).length
    setStatus(game.supportsTeamups && priorityTeamups
      ? `${completed}/${players.length} selecciones · ${activeTeamupCount} Team-Up activo${activeTeamupCount === 1 ? '' : 's'}`
      : `${completed}/${players.length} selecciones generadas`)
    window.setTimeout(() => {
      setGenerating(false)
      if (playConfirmTone) playConfirmTone()
      else playTone(880, 0.18)
    }, animationsEnabled ? 420 : 1)
    if (game.supportsTeamups && priorityTeamups && !seededTeamup && activeTeamupCount === 0) {
      notify('No existe un Team-Up compatible con los roles y filtros actuales.', 'warning')
    } else {
      notify(`${game.name}: equipo generado`, 'success')
    }
  }

  function reroll(index: number) {
    const player = players[index]
    const current = picks[index]
    if (!player || !catalog.length || current?.locked || generating || rerollingIndex !== null) return

    setRerollingIndex(index)
    playModuleSound('reroll', 680)

    window.setTimeout(() => {
      if (gameId === 'deadlock') {
        const used = new Set<string>()
        picks.forEach((pick, pickIndex) => {
          if (pickIndex !== index && avoidRepeated) rosterPickCandidates(pick).forEach((hero) => used.add(hero.key))
        })
        const previousCandidates = rosterPickCandidates(current)
        const candidates = chooseDeadlockCandidates(player, used, previousCandidates.map((hero) => hero.key))
        setPicks((old) => old.map((pick, pickIndex) => pickIndex === index ? {
          hero: candidates[0] ?? null,
          candidates,
          locked: false,
        } : pick))
        setStatus(candidates.length === 3 ? `${player.name}: tres candidatos nuevos` : `No hay tres candidatos válidos para ${player.name}`)
        setRerollingIndex(null)
        return
      }

      const used = new Set(chosenKeys.filter((_, pickIndex) => pickIndex !== index))
      const preferredRole = balancedRoles && current?.hero
        ? (game.id === 'rivals' && current.hero.role === 'flex'
          ? rivalsMissingRole(index) ?? assignedRole(index, buildRolePlan(game, players))
          : current.hero.role)
        : assignedRole(index, buildRolePlan(game, players))
      const pool = candidatePool(player, preferredRole, used, current?.hero?.key)
      const hero = teamupBiasedHero(pool, used)

      setPicks((old) => applyTeamupSelections(old.map((pick, pickIndex) => pickIndex === index ? {
        hero,
        locked: false,
        loadout: hero && game.supportsLoadouts ? pickFinalsLoadout(finalsLoadouts, hero.role) : undefined,
        teamupKey: undefined,
      } : pick)))
      setStatus(hero ? `${player.name}: ${hero.name}` : `No hay selección válida para ${player.name}`)
      setRerollingIndex(null)
    }, animationsEnabled ? 280 : 1)
  }

  function toggleLock(index: number) {
    setPicks((current) => current.map((pick, pickIndex) => pickIndex === index ? { ...pick, locked: !pick.locked } : pick))
    playModuleSound('lock', 470)
  }

  function toggleBlocked(heroKey: string) {
    if (filterIndex === null) return
    playModuleSound('filter', 560)
    setPlayers((current) => current.map((player, index) => {
      if (index !== filterIndex) return player
      const blocked = player.blocked.includes(heroKey)
        ? player.blocked.filter((key) => key !== heroKey)
        : [...player.blocked, heroKey]
      return { ...player, blocked }
    }))
  }

  function toggleRouletteHero(heroKey: string) {
    playModuleSound('click', 520)
    setRouletteSelected((current) => current.includes(heroKey) ? current.filter((key) => key !== heroKey) : [...current, heroKey])
    markRouletteDirty()
  }

  function changeRouletteWeight(heroKey: string, delta: number) {
    playModuleSound('click', 520)
    setRouletteWeights((current) => ({ ...current, [heroKey]: Math.max(1, Math.min(5, (current[heroKey] ?? 1) + delta)) }))
    markRouletteDirty()
  }

  function spinRoulette() {
    if (rouletteSpinning || roulettePool.length === 0) return
    const needsBuild = rouletteDirty || rouletteEntries.length < 2
    const entries = needsBuild ? buildRoulette(false) : rouletteEntries
    if (entries.length < 2) return
    const winnerIndex = randomIndex(entries.length)
    const winnerKey = entries[winnerIndex]
    const hero = catalog.find((item) => item.key === winnerKey)
    const turns = animationsEnabled ? 5 + randomIndex(3) : 1
    const segment = 360 / entries.length
    const target = normalizeDegrees(-((winnerIndex + 0.5) * segment))

    setRouletteSpinning(true)
    setRouletteWinner('')

    const startRotation = () => {
      setRouletteRotation((current) => {
        const delta = normalizeDegrees(target - normalizeDegrees(current))
        return current + turns * 360 + delta
      })
      playModuleSound('generate', 740, 0.2)
      if (spinTimerRef.current !== null) window.clearTimeout(spinTimerRef.current)
      spinTimerRef.current = window.setTimeout(() => {
        setRouletteSpinning(false)
        setRouletteWinner(winnerKey)
        notify(hero ? `${hero.name} ganó la ruleta de ${game.shortName}` : 'La ruleta eligió un ganador', 'success')
        if (playConfirmTone) playConfirmTone()
        else playTone(920, 0.24)
      }, animationsEnabled ? 1900 : 20)
    }

    // Cuando la rueda se construye en este mismo clic, React todavía no la ha
    // pintado en 0°. Dos frames permiten montarla primero y después iniciar
    // la transición; así el primer giro se ve igual que los siguientes.
    if (needsBuild) {
      window.requestAnimationFrame(() => window.requestAnimationFrame(startRotation))
    } else {
      startRotation()
    }
  }


  async function generateTeamImage() {
    const selected = players.map((player, index) => ({ player, pick: picks[index] })).filter((item) => item.pick?.hero)
    if (!selected.length) {
      notify(`Genera primero un equipo de ${game.name}.`, 'warning')
      return
    }

    const columns = Math.min(selected.length <= 4 ? selected.length : 3, selected.length)
    const rows = Math.ceil(selected.length / columns)
    const cardWidth = 320
    const cardHeight = game.supportsLoadouts ? 462 : gameId === 'deadlock' ? 420 : 420
    const gap = 22
    const headerHeight = 178
    const footerHeight = 84
    const canvas = document.createElement('canvas')
    canvas.width = columns * cardWidth + (columns - 1) * gap + 144
    canvas.height = headerHeight + rows * cardHeight + (rows - 1) * gap + footerHeight + 84
    const context = canvas.getContext('2d')
    if (!context) return

    const roleColor = (heroRole: string) => roleDefinition(game, heroRole).color
    const loadImage = (url: string) => new Promise<HTMLImageElement | null>((resolve) => {
      const image = new Image()
      if (/^https?:\/\//i.test(url)) image.crossOrigin = 'anonymous'
      image.onload = () => resolve(image)
      image.onerror = () => resolve(null)
      image.src = url
    })
    const drawCover = (image: HTMLImageElement, x: number, y: number, width: number, height: number) => {
      const ratio = Math.max(width / image.width, height / image.height)
      const drawWidth = image.width * ratio
      const drawHeight = image.height * ratio
      context.save()
      context.beginPath()
      context.rect(x, y, width, height)
      context.clip()
      context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight)
      context.restore()
    }

    const background = context.createLinearGradient(0, 0, canvas.width, canvas.height)
    background.addColorStop(0, '#03111a')
    background.addColorStop(1, '#071f2d')
    context.fillStyle = background
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = `${game.accent}22`
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
    context.fillStyle = '#ffc84a'
    context.font = '800 28px system-ui, sans-serif'
    context.fillText('OVERROLL', 72, 74)
    context.fillStyle = '#ffffff'
    context.font = '900 54px system-ui, sans-serif'
    context.fillText(game.name.toUpperCase(), 72, 136)

    await Promise.all(selected.map(async ({ player, pick }, itemIndex) => {
      const deadlockCandidates = gameId === 'deadlock' ? rosterPickCandidates(pick) : []
      const hero = deadlockCandidates[0] ?? pick.hero
      if (!hero) return
      const accent = roleColor(hero.role)
      const column = itemIndex % columns
      const row = Math.floor(itemIndex / columns)
      const x = 72 + column * (cardWidth + gap)
      const y = headerHeight + 22 + row * (cardHeight + gap)

      context.fillStyle = 'rgba(4, 23, 34, .96)'
      context.fillRect(x, y, cardWidth, cardHeight)
      context.strokeStyle = accent
      context.lineWidth = 4
      context.strokeRect(x, y, cardWidth, cardHeight)
      context.fillStyle = '#071925'
      context.fillRect(x + 4, y + 4, cardWidth - 8, 54)
      context.fillStyle = accent
      context.font = '800 18px system-ui, sans-serif'
      context.fillText(String(itemIndex + 1).padStart(2, '0'), x + 18, y + 38)
      context.fillStyle = '#bfd1dc'
      context.font = '700 17px system-ui, sans-serif'
      context.fillText((player.name || `Jugador ${itemIndex + 1}`).slice(0, 22), x + 58, y + 38)

      if (gameId === 'deadlock') {
        const innerGap = 8
        const padding = 10
        const mainHeight = 214
        const secondaryHeight = 88
        const secondaryWidth = (cardWidth - padding * 2 - innerGap) / 2
        const drawCandidate = async (candidate: CatalogHero, candidateIndex: number, px: number, py: number, pw: number, ph: number) => {
          context.fillStyle = '#071923'
          context.fillRect(px, py, pw, ph)
          const candidateImage = await loadImage(asset(candidate.portrait))
          if (candidateImage) drawCover(candidateImage, px, py, pw, ph)
          const gradient = context.createLinearGradient(0, py + ph * 0.42, 0, py + ph)
          gradient.addColorStop(0, 'rgba(6,19,30,0)')
          gradient.addColorStop(1, 'rgba(6,19,30,.97)')
          context.fillStyle = gradient
          context.fillRect(px, py, pw, ph)
          context.fillStyle = 'rgba(5, 18, 29, .84)'
          context.fillRect(px + 4, py + ph - 42, pw - 8, 34)
          context.fillStyle = game.accent
          context.font = '700 10px Arial'
          context.fillText(`PREFERENCIA ${candidateIndex + 1}`, px + 10, py + ph - 24)
          context.fillStyle = '#ffffff'
          context.font = candidateIndex === 0 ? '700 20px Arial' : '700 13px Arial'
          context.fillText(candidate.name.toUpperCase().slice(0, candidateIndex === 0 ? 22 : 14), px + 10, py + ph - 8)
          context.strokeStyle = game.accent
          context.lineWidth = 1
          context.strokeRect(px + .5, py + .5, pw - 1, ph - 1)
        }
        await Promise.all(deadlockCandidates.slice(0, 3).map((candidate, candidateIndex) => candidateIndex === 0 ? drawCandidate(candidate, candidateIndex, x + padding, y + 72, cardWidth - padding * 2, mainHeight) : drawCandidate(candidate, candidateIndex, x + padding + (candidateIndex - 1) * (secondaryWidth + innerGap), y + 72 + mainHeight + innerGap, secondaryWidth, secondaryHeight)))
        return
      }

      const portraitX = x + 12
      const portraitY = y + 70
      const portraitWidth = cardWidth - 24
      const portraitHeight = 240
      context.fillStyle = '#0a2636'
      context.fillRect(portraitX, portraitY, portraitWidth, portraitHeight)
      const image = await loadImage(asset(hero.portrait))
      if (image) drawCover(image, portraitX, portraitY, portraitWidth, portraitHeight)
      const fade = context.createLinearGradient(0, portraitY + 130, 0, portraitY + portraitHeight)
      fade.addColorStop(0, 'rgba(2, 12, 18, 0)')
      fade.addColorStop(1, 'rgba(2, 12, 18, .92)')
      context.fillStyle = fade
      context.fillRect(portraitX, portraitY, portraitWidth, portraitHeight)

      context.textAlign = 'center'
      context.fillStyle = '#ffffff'
      context.font = '900 30px system-ui, sans-serif'
      context.fillText(hero.name.toUpperCase().slice(0, 22), x + cardWidth / 2, y + 344)
      context.fillStyle = accent
      context.font = '800 17px system-ui, sans-serif'
      context.fillText(roleDefinition(game, hero.role).label.toUpperCase(), x + cardWidth / 2, y + 374)
      context.textAlign = 'left'

      if (pick.loadout) {
        const summary = [pick.loadout.specialization, pick.loadout.weapon, ...pick.loadout.gadgets]
        context.font = '700 12px Arial'
        summary.slice(0, 5).forEach((item, index) => {
          const lineY = y + 396 + index * 15
          context.fillStyle = index < 2 ? game.accent : '#b9cbd6'
          context.fillText(item.slice(0, 34), x + 16, lineY)
        })
      } else if (game.supportsTeamups) {
        const synergy = pick.teamupKey ? activeTeamups(hero.key).find((teamup) => teamup.key === pick.teamupKey) : undefined
        const partnerKey = synergy ? teamupPartnerKey(synergy, hero.key) : ''
        const partner = partnerKey ? heroByKey(partnerKey) : null
        context.fillStyle = 'rgba(12, 45, 61, .92)'
        context.fillRect(x + 16, y + 392, cardWidth - 32, 52)
        if (partner) {
          const partnerImage = await loadImage(asset(partner.portrait))
          if (partnerImage) drawCover(partnerImage, x + 20, y + 398, 44, 40)
        }
        context.fillStyle = '#ffc84a'
        context.font = '800 11px system-ui, sans-serif'
        context.fillText(synergy?.complete ? 'ACTIVO' : 'TEAM-UP ELEGIDO', x + 72, y + 412)
        context.fillStyle = '#e8f3f8'
        context.font = '800 16px system-ui, sans-serif'
        context.fillText((synergy?.name ?? 'SIN TEAM-UP').slice(0, 22), x + 72, y + 430)
        context.fillStyle = '#89a6b8'
        context.font = '600 12px system-ui, sans-serif'
        context.fillText((partner ? `Con ${partner.name}` : 'Sin combinación completa').slice(0, 32), x + 72, y + 443)
      } else {
        context.fillStyle = '#8eaaba'
        context.font = '600 14px system-ui, sans-serif'
        context.fillText(player.name.slice(0, 28), x + 18, y + cardHeight - 26)
      }
    }))

    context.textAlign = 'right'
    context.fillStyle = '#708c9c'
    context.font = '600 17px system-ui, sans-serif'
    context.fillText('Generado con OverRoll', canvas.width - 72, canvas.height - 42)

    canvas.toBlob((blob) => {
      if (!blob) return
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.href = url
      link.download = `OverRoll_${gameId}_equipo.png`
      link.click()
      URL.revokeObjectURL(url)
      notify(`Imagen de ${game.name} generada`, 'success')
      playModuleSound('click', 760, 0.16)
    }, 'image/png')
  }

  function activeTeamups(heroKey: string): Array<Teamup & { complete: boolean }> {
    const selected = new Set(chosenKeys)
    return selectableTeamupsForHero(heroKey)
      .map((teamup) => ({ ...teamup, complete: teamupIsComplete(teamup, selected) }))
  }

  function relatedTeamups(heroKey: string): Array<Teamup & { complete: boolean; relation: 'receiver' | 'anchor' }> {
    const selected = new Set(chosenKeys)
    return teamups
      .filter((teamup) => teamup.receiver === heroKey || teamupAnchorKey(teamup) === heroKey)
      .map((teamup) => ({
        ...teamup,
        complete: teamupIsComplete(teamup, selected),
        relation: teamup.receiver === heroKey ? 'receiver' : 'anchor',
      }))
  }

  function renderLoadout(loadout: FinalsLoadout | undefined) {
    if (!loadout) return null
    const rows = [
      { label: 'Especialización', name: loadout.specialization },
      { label: 'Arma', name: loadout.weapon },
      ...loadout.gadgets.map((name, index) => ({ label: `Artefacto ${index + 1}`, name })),
    ]
    return (
      <div className="roster-loadout">
        {rows.map((row) => (
          <div key={`${row.label}-${row.name}`}>
            <img src={finalsIcon(baseUrl, row.name)} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} />
            <span><small>{row.label}</small><b>{row.name}</b></span>
          </div>
        ))}
      </div>
    )
  }

  function renderPrincipal() {
    const lockedCount = picks.filter((pick) => pick.locked).length
    const selectedDetails = detailsIndex !== null ? picks[detailsIndex] : null
    const selectedDetailsCandidates = gameId === 'deadlock' ? rosterPickCandidates(selectedDetails ?? undefined) : []
    const selectedDetailsHero = selectedDetailsCandidates[0] ?? selectedDetails?.hero ?? null
    const selectedDetailsRole = selectedDetailsHero ? roleDefinition(game, selectedDetailsHero.role) : null

    return (
      <main className={`workspace roster-overwatch-layout roster-game-${gameId} ${mobileCompactMode ? 'roster-mobile-compact' : ''}`} style={{ '--module-accent': game.accent, '--yellow': game.accent, '--yellow-bright': `color-mix(in srgb, ${game.accent} 82%, white)` } as CSSProperties}>
        <aside className={`sidebar roster-unified-sidebar ${mobileConfigOpen ? 'mobile-config-open' : 'mobile-config-closed'}`}>
          <div className="sidebar-head">
            <div><span className="eyebrow">Preparar partida</span><strong>Configuración</strong></div>
            <span className="live-dot roster-live-dot"><span /> {game.shortName}</span>
            <button type="button" className="mobile-config-toggle" onClick={() => { setMobileConfigOpen((value) => !value); playModuleSound(mobileConfigOpen ? 'close' : 'open', 460) }} aria-expanded={mobileConfigOpen}>
              <RosterIcon name={mobileConfigOpen ? 'close' : 'settings'} size={15} /><span>{mobileConfigOpen ? 'Ocultar' : 'Editar'}</span>
            </button>
          </div>

          {mobileConfigOpen && (
            <div className="mobile-config-tabs roster-mobile-tabs" role="tablist" aria-label={`Apartados de ${game.name}`}>
              <button type="button" className={mobileConfigTab === 'squad' ? 'active' : ''} onClick={() => { setMobileConfigTab('squad'); playModuleSound('nav', 520) }} role="tab" aria-selected={mobileConfigTab === 'squad'}><RosterIcon name="users" size={14} /> Escuadra</button>
              <button type="button" className={mobileConfigTab === 'rules' ? 'active' : ''} onClick={() => { setMobileConfigTab('rules'); playModuleSound('nav', 520) }} role="tab" aria-selected={mobileConfigTab === 'rules'}><RosterIcon name="settings" size={14} /> Reglas</button>
            </div>
          )}

          <section className={`side-panel squad-panel roster-squad-panel mobile-config-section ${mobileConfigTab === 'squad' ? 'mobile-active' : ''}`}>
            <div className="panel-title-row"><div><label>Escuadra</label><small>Nombres, perfiles y filtros</small></div><RosterIcon name="users" size={17} /></div>
            <div className="squad-counter">
              <button type="button" onClick={() => changePlayerCount(-1)} disabled={players.length <= minimumPlayers(game) || generating}>−</button>
              <strong>{players.length} jugador{players.length === 1 ? '' : 'es'}</strong>
              <button type="button" onClick={() => changePlayerCount(1)} disabled={players.length >= game.maxPlayers || generating}>+</button>
            </div>
            <div className="squad-tools roster-squad-tools" aria-label="Herramientas de escuadra">
              <button type="button" onClick={clearPlayerNames}><RosterIcon name="trash" size={14} /><span>Nombres</span></button>
              <button type="button" onClick={shufflePlayerOrder}><RosterIcon name="shuffle" size={14} /><span>Revolver</span></button>
            </div>
            <div className="players roster-unified-players">
              {players.map((player, index) => {
                return (
                  <div className="player-row roster-game-player-row" key={player.id}>
                    <span className="number">{String(index + 1).padStart(2, '0')}</span>
                    <input value={player.name} disabled={Boolean(player.profileId)} onChange={(event) => updatePlayerName(index, event.target.value)} maxLength={22} aria-label={`Nombre de ${game.name} ${index + 1}`} />
                    <select className="player-profile-inline" value={player.profileId} onChange={(event) => assignProfile(index, event.target.value)} title={profiles.find((item) => item.id === player.profileId)?.name ?? 'Sin perfil'} aria-label={`Perfil de ${game.name} ${index + 1}`}>
                      <option value="">☆</option>{profiles.map((profile) => <option value={profile.id} key={profile.id}>{profile.name}</option>)}
                    </select>
                    <button type="button" className={`roster-inline-filter ${player.blocked.length ? 'active-filter' : ''}`} onClick={() => { setFilterIndex(index); setFilterSearch(''); setFilterRole('all'); playModuleSound('filter', 560) }} title="Filtros individuales"><RosterIcon name="filter" size={14} />{player.blocked.length > 0 && <b>{player.blocked.length}</b>}</button>
                  </div>
                )
              })}
            </div>
          </section>

          <section className={`side-panel rules roster-unified-rules mobile-config-section ${mobileConfigTab === 'rules' ? 'mobile-active' : ''}`}>
            <div className="panel-title-row"><div><label>Reglas</label><small>Ajustes exclusivos de {game.shortName}</small></div><RosterIcon name="settings" size={17} /></div>
            <button type="button" className={`toggle-row ${avoidRepeated ? 'enabled' : ''}`} onClick={() => { const next = !avoidRepeated; setAvoidRepeated(next); playModuleSound(next ? 'toggleOn' : 'toggleOff', next ? 620 : 360) }} aria-pressed={avoidRepeated}>
              <span className="switch"><span /></span><span><b>Evitar repetidos</b><small>No repite personajes mientras existan alternativas válidas.</small></span>
            </button>
            {game.roles.length > 1 && (
              <button type="button" className={`toggle-row ${balancedRoles ? 'enabled' : ''}`} onClick={() => { const next = !balancedRoles; setBalancedRoles(next); playModuleSound(next ? 'toggleOn' : 'toggleOff', next ? 620 : 360) }} aria-pressed={balancedRoles}>
                <span className="switch"><span /></span><span><b>Composición de roles</b><small>Acomoda automáticamente una composición válida para el tamaño del equipo.</small></span>
              </button>
            )}
            {game.supportsTeamups && (
              <button type="button" className={`toggle-row ${priorityTeamups ? 'enabled' : ''}`} onClick={() => { const next = !priorityTeamups; setPriorityTeamups(next); playModuleSound(next ? 'toggleOn' : 'toggleOff', next ? 720 : 360) }} aria-pressed={priorityTeamups}>
                <span className="switch"><span /></span><span><b>Priorizar Team-Ups</b><small>Favorece sinergias, pero conserva filtros, roles y bloqueo de repetidos.</small></span>
              </button>
            )}
            {game.supportsLoadouts && (
              <div className="roster-fixed-condition"><RosterIcon name="shield" size={15} /><span><b>Loadout completo</b><small>Especialización, arma y tres artefactos únicos por ficha.</small></span></div>
            )}
          </section>

          <div className="sidebar-footer">
            <div className={`status-line ${loadError ? 'error' : ''}`}><span className="status-icon"><RosterIcon name={loadError ? 'settings' : 'shield'} size={15} /></span><span>{status}</span></div>
            <button type="button" className={`generate ${generating ? 'generating' : ''}`} onClick={generateTeam} disabled={!catalog.length || generating || rerollingIndex !== null || (game.supportsTeamups && priorityTeamups && !teamupsReady)}>
              <span className="generate-glow" /><RosterIcon name="spark" size={19} /><span>{game.supportsTeamups && priorityTeamups && !teamupsReady ? 'Cargando Team-Ups…' : generating ? 'Generando…' : gameId === 'deadlock' ? 'Generar candidatos' : 'Generar equipo'}</span>
            </button>
          </div>
        </aside>

        <section className="content roster-unified-content">
          <div className="content-topline">
            <div className="game-identity">
              <span className="game-kicker">{game.kicker}</span>
              <div className="game-title-row"><h1>{game.name}</h1><span className="web-badge roster-game-badge">{game.catalogLabel.toUpperCase()}</span></div>
            </div>
            <div className="topline-actions">
              <button type="button" className="generate-image-button roster-image-button" onClick={generateTeamImage} disabled={!picks.some((pick) => pick.hero)}><RosterIcon name="download" size={17} /> Generar imagen</button>
              <div className="match-summary">
                <div><small>Formato</small><strong>{game.formatLabel}</strong></div>
                <div><small>Fijados</small><strong>{lockedCount}</strong></div>
                <div><small>Catálogo</small><strong>{game.catalogLabel}</strong></div>
              </div>
            </div>
          </div>

          {loadError ? (
            <div className="error-state"><RosterIcon name="settings" size={34} /><h2>No se pudo cargar el catálogo</h2><p>{loadError}</p><button type="button" onClick={() => window.location.reload()}>Volver a intentar</button></div>
          ) : (
            <div className="team-stage roster-team-stage">
              <div className="stage-grid" />
              <div className={`team-grid cards-${players.length} ${players.length > 6 ? 'roster-many-cards' : ''} ${game.supportsLoadouts ? 'roster-finals-grid' : ''}`} style={{ '--cards': players.length } as CSSProperties}>
                {players.map((player, index) => {
                  const pick = picks[index] ?? { hero: null, locked: false }
                  const deadlockCandidates = gameId === 'deadlock' ? rosterPickCandidates(pick) : []
                  const hero = deadlockCandidates[0] ?? pick.hero
                  const role = hero ? roleDefinition(game, hero.role) : null
                  const assignedProfile = profiles.find((profile) => profile.id === player.profileId)
                  const receiverTeamups = hero && game.supportsTeamups ? activeTeamups(hero.key) : []
                  const selectedTeamup = (pick.teamupKey ? receiverTeamups.find((teamup) => teamup.key === pick.teamupKey) : undefined) ?? receiverTeamups[0]
                  const generationClass = generationRevision % 2 === 0 ? 'generation-a' : 'generation-b'
                  return (
                    <article className={`hero-card roster-unified-card ${game.supportsLoadouts ? 'roster-finals-card' : ''} ${generationClass} ${pick.locked ? 'is-locked' : ''} ${rerollingIndex === index ? 'is-rerolling' : ''}`} style={{ '--role-color': role?.color ?? game.accent, '--delay': `${index * 45}ms` } as CSSProperties} key={player.id}>
                      <span className="card-corner top" /><span className="card-corner bottom" /><div className="card-shine" />
                      <div className="card-player"><span className="player-index">{String(index + 1).padStart(2, '0')}</span><span>{player.name || `Jugador ${index + 1}`}</span>{assignedProfile && <span className="profile-tag">{assignedProfile.name.charAt(0).toUpperCase()}</span>}{player.blocked.length > 0 && <span className="filter-count">{player.blocked.length}</span>}{pick.locked && <span className="mini-lock"><RosterIcon name="lock" size={12} /></span>}</div>
                      {gameId === 'deadlock' ? (
                        <div className="deadlock-candidate-grid" aria-label={`Tres candidatos de ${player.name}`}>
                          {Array.from({ length: 3 }, (_, candidateIndex) => {
                            const candidate = deadlockCandidates[candidateIndex]
                            const candidateRole = candidate ? roleDefinition(game, candidate.role) : null
                            return (
                              <div
                                className={`deadlock-candidate ${candidateIndex === 0 ? 'primary' : 'secondary'} ${candidate ? 'has-candidate' : 'empty'}`}
                                style={{ '--candidate-color': candidateRole?.color ?? game.accent } as CSSProperties}
                                key={candidate?.key ?? `empty-${candidateIndex}`}
                              >
                                <span className="deadlock-candidate-rank">{String(candidateIndex + 1).padStart(2, '0')}</span>
                                {candidate ? (
                                  <img src={asset(candidate.portrait)} alt={candidate.name} decoding="async" draggable={false} onLoad={(event) => { event.currentTarget.style.removeProperty('display') }} onError={(event) => { event.currentTarget.style.display = 'none' }} />
                                ) : (
                                  <div className="deadlock-candidate-empty"><RosterIcon name="gamepad" size={candidateIndex === 0 ? 44 : 28} /></div>
                                )}
                                <div className="deadlock-candidate-gradient" />
                                <div className="deadlock-candidate-copy">
                                  <small>Preferencia {candidateIndex + 1}</small>
                                  <strong>{candidate?.name ?? 'Sin selección'}</strong>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <>
                          <div className="portrait">
                            <div className="portrait-grid" /><div className="portrait-fallback"><RosterIcon name="gamepad" size={48} /></div>
                            {hero ? <img key={hero.key} className="hero-image" src={asset(hero.portrait)} alt={hero.name} decoding="async" draggable={false} onLoad={(event) => { event.currentTarget.style.removeProperty('display') }} onError={(event) => { event.currentTarget.style.display = 'none' }} /> : <div className="portrait-loading"><span /><span /><span /></div>}
                            <div className="portrait-vignette" />
                            <div className="role-watermark" aria-hidden="true"><span className="role-watermark-fallback">{role?.label.slice(0, 2).toUpperCase() ?? '?'}</span></div>
                          </div>
                          <div className="hero-info"><div className="hero-name-row"><h2>{hero?.name ?? 'Sin selección'}</h2><span className="role-dot" /></div><div className="hero-role">{role?.label ?? 'Genera un equipo'}</div></div>
                        </>
                      )}

                      {hero && game.supportsTeamups && selectedTeamup && (() => {
                        const partnerKey = teamupPartnerKey(selectedTeamup, hero.key)
                        const partner = heroByKey(partnerKey)
                        const partnerName = teamupPartnerName(selectedTeamup, hero.key)
                        const heroIsAnchor = teamupAnchorKey(selectedTeamup) === hero.key
                        return (
                          <div className="roster-card-special roster-card-teamups">
                            <div className={`${selectedTeamup.complete ? 'complete' : ''} selected locked-teamup-card`} aria-label={`Team-Up de ${hero.name}`}>
                              {partner
                                ? <img src={asset(partner.portrait)} alt={partner.name} decoding="async" loading="eager" />
                                : <span className="roster-teamup-portrait-fallback" aria-label={partnerName}>{partnerName.split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'TU'}</span>}
                              <span><b>{selectedTeamup.complete ? 'ACTIVO' : 'TEAM-UP ELEGIDO'}</b><strong>{selectedTeamup.name}</strong><small>{selectedTeamup.complete ? `Con ${partnerName}` : heroIsAnchor ? `Potencia a ${partnerName}` : `Base · mejora con ${partnerName}`}</small></span>
                            </div>
                          </div>
                        )
                      })()}
                      {hero && pick.loadout && <div className="roster-card-special roster-card-finals">{renderLoadout(pick.loadout)}</div>}

                      <div className="card-actions four-actions">
                        <button type="button" onClick={() => reroll(index)} disabled={!hero || pick.locked || rerollingIndex !== null} data-tooltip={gameId === 'deadlock' ? 'Cambiar los 3 candidatos' : 'Reroll'} aria-label={gameId === 'deadlock' ? `Cambiar los tres candidatos de ${player.name}` : `Reroll de ${player.name}`}><RosterIcon name="reroll" size={18} /></button>
                        <button type="button" onClick={() => { setFilterIndex(index); setFilterSearch(''); setFilterRole('all'); playModuleSound('filter', 560) }} data-tooltip="Filtro" aria-label={`Filtro de ${player.name}`} className={player.blocked.length > 0 ? 'active-filter' : ''}><RosterIcon name="filter" size={18} /></button>
                        <button type="button" onClick={() => { setDetailsIndex(index); playModuleSound('open', 590) }} disabled={!hero} data-tooltip="Detalles" aria-label={`Detalles de ${hero?.name ?? 'personaje'}`}><RosterIcon name="details" size={18} /></button>
                        <button type="button" onClick={() => toggleLock(index)} disabled={!hero} className={pick.locked ? 'active-lock' : ''} data-tooltip={pick.locked ? 'Liberar' : 'Fijar'} aria-label={gameId === 'deadlock' ? (pick.locked ? `Liberar candidatos de ${player.name}` : `Fijar candidatos de ${player.name}`) : pick.locked ? `Liberar ${hero?.name}` : `Fijar ${hero?.name}`}><RosterIcon name={pick.locked ? 'unlock' : 'lock'} size={17} /></button>
                      </div>
                      <div className="loadout">
                        <div><small>{gameId === 'deadlock' ? 'Candidatos' : pick.loadout ? 'Equipamiento' : game.supportsTeamups ? 'Team-Ups' : 'Formato'}</small><span>{gameId === 'deadlock' ? `${deadlockCandidates.length}/3 opciones para matchmaking` : pick.loadout ? `${1 + 1 + pick.loadout.gadgets.length} elementos equipados` : selectedTeamup?.complete ? `${selectedTeamup.name} activo` : selectedTeamup ? `${selectedTeamup.name} · base` : assignedProfile ? assignedProfile.name : game.formatLabel}</span></div>
                        <span className="loadout-status"><RosterIcon name="check" size={13} /></span>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          )}
          <div className="floating-generate-dock roster-floating-dock">
            <button type="button" className={`floating-generate roster-floating-generate ${generating ? 'generating' : ''}`} onClick={generateTeam} disabled={!catalog.length || generating || rerollingIndex !== null || (game.supportsTeamups && priorityTeamups && !teamupsReady)}>
              <span className="generate-glow" /><RosterIcon name="spark" size={19} /><span>{game.supportsTeamups && priorityTeamups && !teamupsReady ? 'Cargando Team-Ups…' : generating ? 'Generando…' : gameId === 'deadlock' ? 'Generar candidatos' : 'Generar equipo'}</span>
            </button>
          </div>
        </section>

        {filterIndex !== null && players[filterIndex] && (
          <div className="roster-modal-layer" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setFilterIndex(null) }}>
            <section className="roster-filter-modal" role="dialog" aria-modal="true" aria-label={`Filtros de ${players[filterIndex].name}`}>
              <header><div><span>Filtros individuales</span><h2>{players[filterIndex].name}</h2></div><button type="button" onClick={() => { setFilterIndex(null); playModuleSound('close', 420) }}>×</button></header>
              <div className="roster-filter-tools"><input value={filterSearch} onChange={(event) => setFilterSearch(event.target.value)} placeholder="Buscar personaje" /><select value={filterRole} onChange={(event) => setFilterRole(event.target.value)}><option value="all">Todos los roles</option>{game.roles.map((role) => <option value={role.id} key={role.id}>{role.label}</option>)}</select></div>
              <div className="roster-filter-grid">
                {catalog.filter((hero) => (!filterSearch || hero.name.toLowerCase().includes(filterSearch.toLowerCase())) && (filterRole === 'all' || hero.role === filterRole)).map((hero) => {
                  const blocked = players[filterIndex].blocked.includes(hero.key)
                  return <button type="button" className={blocked ? 'blocked' : ''} onClick={() => toggleBlocked(hero.key)} key={hero.key}><img src={asset(hero.portrait)} alt="" /><span><b>{hero.name}</b><small>{blocked ? 'Bloqueado' : roleDefinition(game, hero.role).label}</small></span></button>
                })}
              </div>
              <footer><button type="button" onClick={() => setPlayers((current) => current.map((player, index) => index === filterIndex ? { ...player, blocked: [] } : player))}>Restaurar todos</button><button type="button" className="primary" onClick={() => setFilterIndex(null)}>Listo</button></footer>
            </section>
          </div>
        )}

        {detailsIndex !== null && selectedDetailsHero && selectedDetailsRole && (
          <div className="roster-modal-layer roster-details-layer" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setDetailsIndex(null) }}>
            <aside className="roster-details-modal" role="dialog" aria-modal="true" aria-label={`Detalles de ${selectedDetailsHero.name}`} style={{ '--role-color': selectedDetailsRole.color } as CSSProperties}>
              <header><div><span>{selectedDetailsRole.label}</span><h2>{selectedDetailsHero.name}</h2><p>{players[detailsIndex]?.name} · {game.shortName}</p></div><button type="button" onClick={() => setDetailsIndex(null)}><RosterIcon name="close" size={20} /></button></header>
              <div className="roster-details-hero"><img src={asset(selectedDetailsHero.portrait)} alt={selectedDetailsHero.name} /><div><small>DATOS DE {game.shortName.toUpperCase()}</small><h3>{selectedDetailsRole.label}</h3><p>{game.description}</p><span>{gameId === 'deadlock' ? '3 candidatos por jugador' : game.formatLabel} · {game.catalogLabel}</span></div></div>
              {gameId === 'deadlock' && selectedDetailsCandidates.length > 0 && <section><h3>Preferencias para matchmaking</h3><div className="deadlock-details-candidates">{selectedDetailsCandidates.map((candidate, candidateIndex) => <div key={candidate.key}><span>{candidateIndex + 1}</span><img src={asset(candidate.portrait)} alt="" /><b>{candidate.name}</b></div>)}</div></section>}
              {game.supportsTeamups && <section><h3>Team-Ups relacionados</h3><div className="roster-details-tags">{relatedTeamups(selectedDetailsHero.key).map((teamup) => { const selected = selectedDetails?.teamupKey === teamup.key; const receiver = teamup.receiver ? heroByKey(teamup.receiver) : undefined; const relationLabel = teamup.relation === 'anchor' ? `ANCLA · ${receiver?.name ?? 'ALIADO'}` : selected && teamup.complete ? 'ACTIVO' : selected ? 'ELEGIDO' : teamup.complete ? 'DISPONIBLE' : 'BASE'; return <span className={(selected && teamup.complete) || (teamup.relation === 'anchor' && teamup.complete) ? 'complete' : ''} key={teamup.key}><b>{relationLabel}</b>{teamup.name}</span> })}</div></section>}
              {selectedDetails?.loadout && <section><h3>Equipamiento generado</h3>{renderLoadout(selectedDetails.loadout)}</section>}
              <section><h3>Reglas aplicadas</h3><div className="roster-details-rules"><span><b>{avoidRepeated ? 'ACTIVO' : 'INACTIVO'}</b>Evitar repetidos</span>{game.roles.length > 1 && <span><b>{balancedRoles ? 'ACTIVA' : 'INACTIVA'}</b>Composición de roles</span>}{game.supportsTeamups && <span><b>{priorityTeamups ? 'ACTIVA' : 'INACTIVA'}</b>Prioridad de Team-Ups</span>}</div></section>
            </aside>
          </div>
        )}
      </main>
    )
  }
  function renderRoulette() {
    const selectedSet = new Set(rouletteSelected)
    const selectedVisible = filteredRouletteHeroes.filter((hero) => selectedSet.has(hero.key)).length
    const winner = catalog.find((hero) => hero.key === rouletteWinner) ?? null
    const wheelCount = rouletteBuiltHeroes.length
    const imageSize = wheelCount <= 12 ? 42 : wheelCount <= 24 ? 32 : wheelCount <= 40 ? 24 : 18
    const imageRadius = wheelCount <= 12 ? 126 : wheelCount <= 24 ? 137 : 145
    const buildStatus = rouletteDirty
      ? roulettePool.length > 0 ? 'Cambios sin construir' : 'Sin participantes'
      : `${rouletteEntries.length} casillas listas`

    return (
      <main className="utility-page roulette-page roulette-maker-v2 roster-roulette-unified" style={{ '--module-accent': game.accent, '--yellow': game.accent, '--cyan': game.accent } as CSSProperties}>
        <header className="roulette-heading">
          <div>
            <span className="eyebrow">Modo independiente · {game.shortName}</span>
            <h1>Ruleta Maker</h1>
            <p>Construye la rueda por casillas. Cada peso aumenta la probabilidad real de ese personaje.</p>
          </div>
          <div className="roulette-heading-stats" aria-label="Resumen de la ruleta">
            <span><small>PERSONAJES</small><b>{roulettePool.length}</b></span>
            <span><small>CASILLAS</small><b>{rouletteTotalSlots}/64</b></span>
            <span className={rouletteDirty ? 'pending' : 'ready'}><small>ESTADO</small><b>{rouletteDirty ? 'EDITANDO' : 'LISTA'}</b></span>
          </div>
        </header>

        <section className="roulette-maker-layout">
          <section className="roulette-builder-panel">
            <header className="roulette-section-heading">
              <div><span className="eyebrow">01 · Configuración</span><h2>Participantes y probabilidad</h2></div>
              <span className={`roulette-build-badge ${rouletteDirty ? 'pending' : 'ready'}`}>{buildStatus}</span>
            </header>

            <div className="roulette-toolbar roulette-toolbar-v2">
              <label className="roulette-search"><RosterIcon name="filter" size={16} /><input type="search" value={rouletteSearch} onChange={(event) => setRouletteSearch(event.target.value)} placeholder="Buscar personaje…" /></label>
              <div className="roulette-role-toggles roster-role-toggles" role="group" aria-label="Rol visible">
                <button type="button" className={rouletteRole === 'all' ? 'active' : ''} onClick={() => setRouletteRole('all')}>Todos</button>
                {game.roles.map((role) => <button type="button" className={rouletteRole === role.id ? 'active' : ''} style={{ '--role-color': role.color } as CSSProperties} onClick={() => setRouletteRole(role.id)} key={role.id}><i className="roulette-generic-role-mark" />{role.label}</button>)}
              </div>
              <div className="roulette-toolbar-actions">
                <button type="button" onClick={() => { setRouletteSelected((current) => [...new Set([...current, ...filteredRouletteHeroes.map((hero) => hero.key)])]); markRouletteDirty() }} disabled={filteredRouletteHeroes.length === 0}>Añadir visibles</button>
                <button type="button" onClick={() => { const visible = new Set(filteredRouletteHeroes.map((hero) => hero.key)); setRouletteSelected((current) => current.filter((key) => !visible.has(key))); markRouletteDirty() }} disabled={selectedVisible === 0}>Quitar visibles</button>
              </div>
            </div>

            <div className="roulette-bulk-actions">
              <button type="button" onClick={() => { setRouletteSelected(catalog.map((hero) => hero.key)); markRouletteDirty() }} disabled={!catalog.length || rouletteSpinning}><RosterIcon name="check" size={14} /> Seleccionar todos</button>
              <button type="button" onClick={() => { setRouletteWeights((current) => ({ ...current, ...Object.fromEntries(rouletteSelected.map((key) => [key, 1])) })); markRouletteDirty() }} disabled={!roulettePool.length || rouletteSpinning}><RosterIcon name="reset" size={14} /> Igualar pesos</button>
              <button type="button" className="danger" onClick={() => { setRouletteSelected([]); markRouletteDirty() }} disabled={!rouletteSelected.length || rouletteSpinning}><RosterIcon name="trash" size={14} /> Vaciar</button>
            </div>

            <div className="roulette-weight-grid">
              {filteredRouletteHeroes.map((hero) => {
                const selected = selectedSet.has(hero.key)
                const weight = rouletteWeight(hero.key)
                const probability = rouletteProbability(hero.key)
                const role = roleDefinition(game, hero.role)
                return (
                  <article className={`roulette-weight-card ${selected ? 'selected' : ''}`} style={{ '--role-color': role.color } as CSSProperties} key={hero.key}>
                    <button type="button" className="roulette-hero-pick" onClick={() => !selected && toggleRouletteHero(hero.key)} disabled={rouletteSpinning} aria-label={selected ? `${hero.name} seleccionado` : `Añadir a ${hero.name}`}>
                      <img src={asset(hero.portrait)} alt="" loading="lazy" decoding="async" />
                      <span className="roulette-weight-copy"><strong>{hero.name}</strong><small>{role.label}</small></span>
                      <i className="roulette-role-watermark roulette-generic-role-mark" aria-hidden="true" />
                      {!selected && <span className="roulette-add-mark">+</span>}
                    </button>
                    {selected && <div className="roulette-weight-controls">
                      <button type="button" onClick={() => changeRouletteWeight(hero.key, -1)} disabled={rouletteSpinning || rouletteTotalSlots <= 2 || weight <= 1}>−</button>
                      <span className="roulette-weight-value"><small>PESO</small><b>x{weight}</b></span>
                      <button type="button" onClick={() => changeRouletteWeight(hero.key, 1)} disabled={rouletteSpinning || rouletteTotalSlots >= 64}>+</button>
                      <span className="roulette-probability"><small>PROB.</small><b>{probability.toFixed(1)}%</b><i><em style={{ width: `${Math.min(100, probability)}%` }} /></i></span>
                      <button type="button" className="remove" onClick={() => toggleRouletteHero(hero.key)} disabled={rouletteSpinning}>×</button>
                    </div>}
                  </article>
                )
              })}
            </div>

            {!filteredRouletteHeroes.length && <div className="roulette-empty-list"><RosterIcon name="filter" size={28} /><strong>No hay coincidencias</strong><span>Prueba otro nombre o cambia el rol visible.</span></div>}

            <footer className="roulette-builder-footer">
              <div className="roulette-total-summary"><span><small>SELECCIONADOS</small><b>{roulettePool.length}</b></span><span><small>CASILLAS</small><b>{rouletteTotalSlots}</b></span><p>Máximo 64. Un único personaje usa automáticamente dos casillas.</p></div>
              <button type="button" className="roulette-build-button" onClick={() => buildRoulette(true)} disabled={rouletteSpinning || !roulettePool.length || rouletteTotalSlots > 64}><RosterIcon name="roulette" size={20} /><span>CONSTRUIR RULETA</span></button>
            </footer>
          </section>

          <aside className="roulette-wheel-panel">
            <header className="roulette-section-heading compact"><div><span className="eyebrow">02 · Resultado</span><h2>Rueda construida</h2></div><span className="roulette-game-chip" style={{ color: game.accent }}>{game.shortName}</span></header>
            <div className={`roulette-wheel-stage ${rouletteSpinning ? 'spinning' : ''} ${rouletteDirty ? 'dirty' : ''}`}>
              <span className="roulette-wheel-pointer" aria-hidden="true"><i /></span>
              {wheelCount >= 2 ? <div className="roulette-wheel-shell">
                <svg className="roulette-wheel-svg" viewBox="0 0 400 400" role="img" aria-label={`Ruleta de ${wheelCount} casillas`}>
                  <defs>{rouletteBuiltHeroes.map((hero, index) => { const angle = -90 + (index + .5) * 360 / wheelCount; const point = roulettePoint(imageRadius, angle); return <clipPath id={`roster-slot-${gameId}-${index}`} key={`clip-${hero.key}-${index}`}><circle cx={point.x} cy={point.y} r={imageSize / 2} /></clipPath> })}</defs>
                  <g className="roulette-wheel-rotor" style={{ transform: `rotate(${rouletteRotation}deg)`, transition: `transform ${animationsEnabled ? 1.9 : .02}s cubic-bezier(.12,.68,.16,1)` }}>
                    {rouletteBuiltHeroes.map((hero, index) => <path d={rouletteSectorPath(index, wheelCount)} fill={roleDefinition(game, hero.role).color} className="roulette-wheel-sector" key={`sector-${hero.key}-${index}`} />)}
                    {rouletteBuiltHeroes.map((hero, index) => { const angle = -90 + (index + .5) * 360 / wheelCount; const point = roulettePoint(imageRadius, angle); return <g key={`portrait-${hero.key}-${index}`}><circle cx={point.x} cy={point.y} r={imageSize / 2 + 2} fill="#061722" stroke="rgba(255,255,255,.72)" strokeWidth="1.5" /><image href={asset(hero.portrait)} x={point.x - imageSize / 2} y={point.y - imageSize / 2} width={imageSize} height={imageSize} preserveAspectRatio="xMidYMid slice" clipPath={`url(#roster-slot-${gameId}-${index})`} /></g> })}
                    <circle cx="200" cy="200" r="185" fill="none" stroke="rgba(211,241,255,.78)" strokeWidth="3" />
                  </g>
                </svg>
                <div className="roulette-wheel-hub" style={{ '--role-color': winner ? roleDefinition(game, winner.role).color : game.accent } as CSSProperties}>{winner ? <><img src={asset(winner.portrait)} alt="" /><span><small>GANADOR</small><strong>{winner.name}</strong></span></> : <><RosterIcon name="roulette" size={28} /><span><small>RULETA</small><strong>{wheelCount} casillas</strong></span></>}</div>
              </div> : <div className="roulette-wheel-placeholder"><span><RosterIcon name="roulette" size={50} /></span><strong>Construye la ruleta</strong><p>Ajusta pesos y crea la rueda para ver las casillas reales.</p></div>}
            </div>
            <div className="roulette-winner-strip">{winner ? <><div className="roulette-winner-portrait" style={{ '--role-color': roleDefinition(game, winner.role).color } as CSSProperties}><img src={asset(winner.portrait)} alt="" /></div><div><small>GANADOR DEL ÚLTIMO GIRO</small><strong>{winner.name}</strong><span>{roleDefinition(game, winner.role).label} · Peso x{rouletteWeight(winner.key)} · {rouletteProbability(winner.key).toFixed(1)}%</span></div></> : <><RosterIcon name={rouletteDirty ? 'settings' : 'check'} size={20} /><div><small>ESTADO</small><strong>{rouletteSpinning ? 'Girando…' : buildStatus}</strong><span>{rouletteDirty ? 'Construye para aplicar los cambios.' : 'La rueda está lista para girar.'}</span></div></>}</div>
            <button type="button" className={`roulette-spin-button ${rouletteSpinning ? 'spinning' : ''}`} onClick={spinRoulette} disabled={rouletteSpinning || !roulettePool.length}><RosterIcon name="roulette" size={24} /><span>{rouletteSpinning ? 'GIRANDO…' : rouletteDirty ? 'CONSTRUIR Y GIRAR' : 'GIRAR RULETA'}</span></button>
            <small className="roulette-autosave"><RosterIcon name="check" size={13} /> Selección y pesos se guardan por separado para {game.shortName}.</small>
            {!!rouletteEntries.length && <details className="roulette-slot-list"><summary><span>Ver casillas construidas</span><b>{rouletteEntries.length}</b></summary><div>{rouletteBuiltHeroes.map((hero, index) => <span key={`${hero.key}-${index}`} style={{ '--role-color': roleDefinition(game, hero.role).color } as CSSProperties}><i>{index + 1}</i><img src={asset(hero.portrait)} alt="" /><strong>{hero.name}</strong></span>)}</div></details>}
          </aside>
        </section>
      </main>
    )
  }

  return view === 'roulette' ? renderRoulette() : renderPrincipal()
}
