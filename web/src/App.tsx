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
import PvzModule from './PvzModule'
import RosterModule, { rosterGameDefinitions, type RosterGameId } from './RosterModule'
import { warmImageCache } from './imageCache'
import { creditsJoke, creditsSongUrl, detectBrowserLocale, localeChoices, localeName, translate, type LocalePreference, type SupportedLocale } from './localization'
import { installUiLocalization } from './uiLocalization'

type Role = 'tank' | 'damage' | 'support'
type GameId = 'overwatch' | 'tf2' | 'pvzgw2' | RosterGameId
type Tf2Group = 'offense' | 'defense' | 'support'
type View = 'principal' | 'roulette' | 'profiles' | 'more'
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
  | 'tf2Click'
  | 'tf2Generate'
  | 'tf2Reroll'
  | 'tf2RouletteBuild'
  | 'tf2RouletteSpin'
  | 'tf2RouletteWin'
type ProfileBucket = 'main' | 'played' | 'practice' | 'avoid'
type ProfileMode = 'classic' | 'allprofile' | 'lowprob' | 'practice' | 'played' | 'prefer' | 'main'
type ProfileTab = 'heroes' | 'players' | 'mode'
type MobileConfigTab = 'profile' | 'squad' | 'rules'
type SettingsTab = 'general' | 'audio' | 'catalogs' | 'language' | 'credits'
type IconName =
  | 'refresh'
  | 'reroll'
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
  | 'roulette'
  | 'language'

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

type OverFastHero = {
  name: string
  portrait?: string | null
  role: Role
  subrole: string
  perks: {
    minor: Perk[]
    major: Perk[]
  }
  stadium_powers?: Perk[] | null
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


type Tf2Class = {
  key: string
  name: string
  group: Tf2Group
  portrait: string
}

type Tf2Player = {
  id: string
  name: string
  groups: Record<Tf2Group, boolean>
  profileId: string
  blocked: string[]
}

type Tf2Pick = {
  mercenary: Tf2Class | null
  locked: boolean
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
  stalwart: 'Vanguardia',
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

const gameModuleIcons: Record<GameId, string> = {
  overwatch: 'assets/game-icons/overwatch.png',
  tf2: 'assets/game-icons/tf2.png',
  pvzgw2: 'assets/game-icons/pvzgw2.png',
  rivals: 'assets/game-icons/rivals.png',
  valorant: 'assets/game-icons/valorant.png',
  deadlock: 'assets/game-icons/deadlock.png',
  lastflag: 'assets/game-icons/lastflag.png',
  thefinals: 'assets/game-icons/thefinals.png',
  paladins: 'assets/game-icons/paladins.png',
  fragpunk: 'assets/game-icons/fragpunk.png',
  apex: 'assets/game-icons/apex.png',
}

const gameModules: Array<{ id: GameId; name: string; status: string; accent: string; available: boolean; catalogLabel: string; icon: string }> = [
  { id: 'overwatch', name: 'Overwatch', status: 'Disponible', accent: '#f5a623', available: true, catalogLabel: '53 héroes', icon: gameModuleIcons.overwatch },
  { id: 'tf2', name: 'Team Fortress 2', status: 'Disponible', accent: '#e8a45b', available: true, catalogLabel: '9 clases', icon: gameModuleIcons.tf2 },
  { id: 'pvzgw2', name: 'PVZ GW2', status: 'Disponible', accent: '#79dc72', available: true, catalogLabel: '121 personajes', icon: gameModuleIcons.pvzgw2 },
  ...rosterGameDefinitions.map((game) => ({
    id: game.id,
    name: game.name,
    status: 'Disponible',
    accent: game.accent,
    available: true,
    catalogLabel: game.catalogLabel,
    icon: gameModuleIcons[game.id],
  })),
]

function isRosterGame(game: GameId): game is RosterGameId {
  return rosterGameDefinitions.some((item) => item.id === game)
}

const tf2Groups: Tf2Group[] = ['offense', 'defense', 'support']

const tf2GroupLabels: Record<Tf2Group, string> = {
  offense: 'Ofensiva',
  defense: 'Defensa',
  support: 'Apoyo',
}

const tf2GroupColors: Record<Tf2Group, string> = {
  offense: '#e86448',
  defense: '#e8a45b',
  support: '#67b9d9',
}

const tf2Classes: Tf2Class[] = [
  { key: 'tf2-scout', name: 'Scout', group: 'offense', portrait: 'assets/tf2/classes/scout.jpg' },
  { key: 'tf2-soldier', name: 'Soldier', group: 'offense', portrait: 'assets/tf2/classes/soldier.jpg' },
  { key: 'tf2-pyro', name: 'Pyro', group: 'offense', portrait: 'assets/tf2/classes/pyro.jpg' },
  { key: 'tf2-demoman', name: 'Demoman', group: 'defense', portrait: 'assets/tf2/classes/demoman.jpg' },
  { key: 'tf2-heavy', name: 'Heavy', group: 'defense', portrait: 'assets/tf2/classes/heavy.jpg' },
  { key: 'tf2-engineer', name: 'Engineer', group: 'defense', portrait: 'assets/tf2/classes/engineer.jpg' },
  { key: 'tf2-medic', name: 'Medic', group: 'support', portrait: 'assets/tf2/classes/medic.jpg' },
  { key: 'tf2-sniper', name: 'Sniper', group: 'support', portrait: 'assets/tf2/classes/sniper.jpg' },
  { key: 'tf2-spy', name: 'Spy', group: 'support', portrait: 'assets/tf2/classes/spy.jpg' },
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
    case 'reroll':
      return <svg {...common}><path d="M4 7h11a5 5 0 0 1 5 5" /><path d="m4 7 3-3M4 7l3 3" /><path d="M20 17H9a5 5 0 0 1-5-5" /><path d="m20 17-3-3m3 3-3 3" /></svg>
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
    case 'language':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
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
    case 'roulette':
      return <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="1.4" /><path d="M12 4v6M12 14v6M4 12h6M14 12h6M6.35 6.35l4.24 4.24M13.41 13.41l4.24 4.24M17.65 6.35l-4.24 4.24M10.59 13.41l-4.24 4.24" /><path d="m18.5 2.8 2.7 1.1-2.2 1.8" /></svg>
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

function makeTf2Player(index: number): Tf2Player {
  return {
    id: `tf2-player-${index + 1}`,
    name: `Jugador ${index + 1}`,
    groups: { offense: true, defense: true, support: true },
    profileId: '',
    blocked: [],
  }
}

function normalizeTf2Players(raw: unknown): Tf2Player[] {
  if (!Array.isArray(raw) || raw.length === 0) return Array.from({ length: 6 }, (_, index) => makeTf2Player(index))
  return raw.slice(0, 6).map((item, index) => {
    const source = typeof item === 'object' && item ? item as Partial<Tf2Player> : {}
    return {
      id: typeof source.id === 'string' ? source.id : `tf2-player-${index + 1}`,
      name: typeof source.name === 'string' ? source.name : `Jugador ${index + 1}`,
      groups: {
        offense: source.groups?.offense !== false,
        defense: source.groups?.defense !== false,
        support: source.groups?.support !== false,
      },
      profileId: typeof source.profileId === 'string' ? source.profileId : '',
      blocked: Array.isArray(source.blocked) ? source.blocked.filter((key): key is string => typeof key === 'string') : [],
    }
  })
}

function tf2OptionsForPlayer(player: Tf2Player, excluded = new Set<string>()) {
  return tf2Classes.filter((mercenary) => (
    player.groups[mercenary.group]
    && !player.blocked.includes(mercenary.key)
    && !excluded.has(mercenary.key)
  ))
}

function buildTf2Team(players: Tf2Player[], previous: Tf2Pick[], avoidRepeated: boolean): Tf2Pick[] {
  const result: Tf2Pick[] = players.map(() => ({ mercenary: null, locked: false }))
  const used = new Set<string>()
  const openIndexes: number[] = []

  players.forEach((player, index) => {
    const current = previous[index]
    const validLocked = Boolean(
      current?.locked
      && current.mercenary
      && player.groups[current.mercenary.group]
      && !player.blocked.includes(current.mercenary.key),
    )
    if (validLocked && current?.mercenary) {
      result[index] = current
      used.add(current.mercenary.key)
    } else {
      openIndexes.push(index)
    }
  })

  const ordered = [...openIndexes].sort((left, right) => (
    tf2OptionsForPlayer(players[left], avoidRepeated ? used : new Set()).length
    - tf2OptionsForPlayer(players[right], avoidRepeated ? used : new Set()).length
  ))

  function solve(position: number): boolean {
    if (position >= ordered.length) return true
    const playerIndex = ordered[position]
    const player = players[playerIndex]
    const uniqueOptions = tf2OptionsForPlayer(player, avoidRepeated ? used : new Set())
    const options = shuffleArray(uniqueOptions)

    for (const mercenary of options) {
      result[playerIndex] = { mercenary, locked: false }
      if (avoidRepeated) used.add(mercenary.key)
      if (solve(position + 1)) return true
      if (avoidRepeated) used.delete(mercenary.key)
      result[playerIndex] = { mercenary: null, locked: false }
    }
    return false
  }

  if (!solve(0)) {
    openIndexes.forEach((playerIndex) => {
      const options = tf2OptionsForPlayer(players[playerIndex])
      result[playerIndex] = { mercenary: options[secureRandomIndex(options.length)] ?? null, locked: false }
    })
  }

  return result
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

const rouletteRoleColors: Record<Role, string> = {
  tank: '#49c9ff',
  damage: '#ff6077',
  support: '#5ce1a2',
}

const DMON_FALLBACK_PORTRAIT = 'https://cdn.mos.cms.futurecdn.net/piadU3GPmdaehKi9ymCoNF.jpg'
const OVERFAST_DMON_URL = 'https://overfast-api.tekrop.fr/heroes/dmon?locale=es-mx'

function isRemoteAsset(path: string): boolean {
  return /^(?:https?:)?\/\//i.test(path) || /^(?:data|blob):/i.test(path)
}

function dmonFallbackHero(): Hero {
  return {
    key: 'dmon',
    name: 'D.Mon',
    role: 'tank',
    subrole: '',
    portrait: DMON_FALLBACK_PORTRAIT,
    gamemodes: ['quickplay'],
    minorPerks: [],
    majorPerks: [],
    stadiumPowers: [],
  }
}

function mapOverFastDmon(hero: OverFastHero, fallback: Hero): Hero {
  const stadiumPowers = Array.isArray(hero.stadium_powers) ? hero.stadium_powers : []
  return {
    key: 'dmon',
    name: hero.name || fallback.name,
    role: hero.role === 'tank' || hero.role === 'damage' || hero.role === 'support' ? hero.role : fallback.role,
    subrole: hero.subrole || fallback.subrole,
    portrait: hero.portrait || fallback.portrait,
    gamemodes: stadiumPowers.length ? ['quickplay', 'stadium'] : ['quickplay'],
    minorPerks: Array.isArray(hero.perks?.minor) ? hero.perks.minor : fallback.minorPerks,
    majorPerks: Array.isArray(hero.perks?.major) ? hero.perks.major : fallback.majorPerks,
    stadiumPowers,
  }
}

async function fetchDmonFromOverFast(signal: AbortSignal): Promise<Hero> {
  const response = await fetch(OVERFAST_DMON_URL, {
    cache: 'no-store',
    credentials: 'omit',
    mode: 'cors',
    signal,
  })
  if (!response.ok) throw new Error(`OverFast D.Mon HTTP ${response.status}`)
  const payload = await response.json() as OverFastHero
  return mapOverFastDmon(payload, dmonFallbackHero())
}

function secureRandomIndex(length: number): number {
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

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360
}

function roulettePoint(radius: number, degrees: number) {
  const radians = (degrees * Math.PI) / 180
  return {
    x: 200 + Math.cos(radians) * radius,
    y: 200 + Math.sin(radians) * radius,
  }
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
  const asset = (path: string) => isRemoteAsset(path) ? path : `${baseUrl}${path.replace(/^\//, '')}`

  const [activeView, setActiveView] = useState<View>('principal')
  const [activeGame, setActiveGame] = useState<GameId>(() => readStorage('overroll.web.activeGame', 'overwatch'))
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
  const [lowPowerMode, setLowPowerMode] = useState(() => readStorage('overroll.web.lowPowerMode', false))
  const [mobileCompactMode, setMobileCompactMode] = useState(() => readStorage('overroll.web.mobileCompactMode', true))
  const [mobileConfigOpen, setMobileConfigOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('general')
  const [localePreference, setLocalePreference] = useState<LocalePreference>(() => {
    const stored = readStorage<unknown>('overroll.web.localePreference', 'auto')
    return stored === 'auto' || localeChoices.some((choice) => choice.id === stored) ? stored as LocalePreference : 'auto'
  })
  const [browserLocale, setBrowserLocale] = useState<SupportedLocale>(() => detectBrowserLocale())
  const [mobileConfigTab, setMobileConfigTab] = useState<MobileConfigTab>('squad')
  const audioRef = useRef<Partial<Record<SoundKey, HTMLAudioElement>>>({})
  const audioContextRef = useRef<AudioContext | null>(null)
  const [detailsIndex, setDetailsIndex] = useState<number | null>(null)
  const [filterIndex, setFilterIndex] = useState<number | null>(null)
  const [filterSearch, setFilterSearch] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | Role>('all')
  const [status, setStatus] = useState('Cargando catálogo local…')
  const [toast, setToast] = useState<Toast | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generationRevision, setGenerationRevision] = useState(0)
  const [rerollingIndex, setRerollingIndex] = useState<number | null>(null)
  const [rouletteSearch, setRouletteSearch] = useState('')
  const [rouletteRolesEnabled, setRouletteRolesEnabled] = useState<Record<Role, boolean>>(() => readStorage('overroll.web.rouletteRolesEnabled', {
    tank: true,
    damage: true,
    support: true,
  }))
  const [rouletteSelectedKeys, setRouletteSelectedKeys] = useState<string[]>(() => readStorage('overroll.web.rouletteSelectedKeys', []))
  const [rouletteWeights, setRouletteWeights] = useState<Record<string, number>>(() => readStorage('overroll.web.rouletteWeights', {}))
  const [rouletteInitialized, setRouletteInitialized] = useState(() => readStorage('overroll.web.rouletteInitialized', false))
  const [rouletteEntries, setRouletteEntries] = useState<string[]>([])
  const [rouletteWinnerKey, setRouletteWinnerKey] = useState('')
  const [rouletteSpinning, setRouletteSpinning] = useState(false)
  const [rouletteDirty, setRouletteDirty] = useState(true)
  const [rouletteRotation, setRouletteRotation] = useState(0)
  const [rouletteSpinRequest, setRouletteSpinRequest] = useState(0)
  const rouletteRotorRef = useRef<SVGGElement | null>(null)
  const rouletteAnimationRef = useRef<Animation | null>(null)
  const roulettePendingSpinRef = useRef<{ entries: string[]; winnerIndex: number } | null>(null)
  const [tf2Players, setTf2Players] = useState<Tf2Player[]>(() => normalizeTf2Players(readStorage<unknown>('overroll.web.tf2.players', [])))
  const [tf2Picks, setTf2Picks] = useState<Tf2Pick[]>(() => Array.from({ length: 6 }, () => ({ mercenary: null, locked: false })))
  const [tf2AvoidRepeated, setTf2AvoidRepeated] = useState(() => readStorage('overroll.web.tf2.avoidRepeated', true))
  const [tf2Status, setTf2Status] = useState('9 clases listas')
  const [tf2Generating, setTf2Generating] = useState(false)
  const [tf2GenerationRevision, setTf2GenerationRevision] = useState(0)
  const [tf2RerollingIndex, setTf2RerollingIndex] = useState<number | null>(null)
  const [tf2FilterIndex, setTf2FilterIndex] = useState<number | null>(null)
  const [tf2FilterSearch, setTf2FilterSearch] = useState('')
  const [tf2FilterGroup, setTf2FilterGroup] = useState<'all' | Tf2Group>('all')
  const [tf2RouletteSearch, setTf2RouletteSearch] = useState('')
  const [tf2RouletteGroup, setTf2RouletteGroup] = useState<'all' | Tf2Group>('all')
  const [tf2RouletteSelectedKeys, setTf2RouletteSelectedKeys] = useState<string[]>(() => readStorage('overroll.web.tf2.rouletteSelectedKeys', tf2Classes.map((item) => item.key)))
  const [tf2RouletteWeights, setTf2RouletteWeights] = useState<Record<string, number>>(() => readStorage('overroll.web.tf2.rouletteWeights', Object.fromEntries(tf2Classes.map((item) => [item.key, 1]))))
  const [tf2RouletteEntries, setTf2RouletteEntries] = useState<string[]>([])
  const [tf2RouletteWinnerKey, setTf2RouletteWinnerKey] = useState('')
  const [tf2RouletteDirty, setTf2RouletteDirty] = useState(true)
  const [tf2RouletteSpinning, setTf2RouletteSpinning] = useState(false)
  const [tf2RouletteRotation, setTf2RouletteRotation] = useState(0)
  const [tf2RouletteSpinRequest, setTf2RouletteSpinRequest] = useState(0)
  const tf2RouletteRotorRef = useRef<SVGGElement | null>(null)
  const tf2RouletteAnimationRef = useRef<Animation | null>(null)
  const tf2RoulettePendingSpinRef = useRef<{ entries: string[]; winnerIndex: number } | null>(null)

  const activeLocale: SupportedLocale = localePreference === 'auto' ? browserLocale : localePreference
  const t = (key: Parameters<typeof translate>[1]) => translate(activeLocale, key)

  useEffect(() => {
    const handleLanguageChange = () => setBrowserLocale(detectBrowserLocale())
    window.addEventListener('languagechange', handleLanguageChange)
    return () => window.removeEventListener('languagechange', handleLanguageChange)
  }, [])

  useEffect(() => {
    document.documentElement.lang = activeLocale
    document.documentElement.dir = 'ltr'
    document.title = `OverRoll · ${translate(activeLocale, 'random_picker')}`
    window.localStorage.setItem('overroll.web.localePreference', JSON.stringify(localePreference))
  }, [activeLocale, localePreference])

  useEffect(() => installUiLocalization(activeLocale), [activeLocale])

  useEffect(() => {
    warmImageCache(tf2Classes.map((item) => asset(item.portrait)), 9)
  }, [baseUrl])

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
      tf2Click: 'assets/tf2/sounds/click.wav',
      tf2Generate: 'assets/tf2/sounds/generate.wav',
      tf2Reroll: 'assets/tf2/sounds/reroll.mp3',
      tf2RouletteBuild: 'assets/tf2/sounds/click.wav',
      tf2RouletteSpin: 'assets/tf2/sounds/release.wav',
      tf2RouletteWin: 'assets/tf2/sounds/reroll.mp3',
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
    let cancelled = false
    const controller = new AbortController()
    const apiTimeout = window.setTimeout(() => controller.abort(), 6000)

    const applyLoadedHeroes = (loaded: HeroData, apiSynced: boolean) => {
      if (cancelled) return
      const pool = loaded.heroes.filter((hero) => stadium ? hero.stadiumPowers.length > 0 : hero.gamemodes.includes('quickplay'))
      setData(loaded)
      warmImageCache(loaded.heroes.map((hero) => asset(hero.portrait)), 10)
      const validKeys = new Set(loaded.heroes.map((hero) => hero.key))
      const storedSelection = rouletteSelectedKeys.filter((key) => validKeys.has(key))
      const nextSelection = rouletteInitialized ? storedSelection : loaded.heroes.map((hero) => hero.key)
      setRouletteSelectedKeys(nextSelection)
      setRouletteWeights((current) => {
        const normalized: Record<string, number> = {}
        nextSelection.forEach((key) => {
          const raw = Number(current[key] ?? 1)
          normalized[key] = Math.max(1, Math.min(64, Math.round(Number.isFinite(raw) ? raw : 1)))
        })
        if (nextSelection.length === 1) normalized[nextSelection[0]] = Math.max(2, normalized[nextSelection[0]] ?? 2)
        return normalized
      })
      if (!rouletteInitialized) setRouletteInitialized(true)
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
      setStatus(`${pool.length} héroes listos${apiSynced ? ' · D.Mon sincronizada' : ''}`)
      setGenerationRevision((value) => value + 1)
    }

    fetch(`${baseUrl}data/heroes.json`, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo abrir el catálogo de héroes.')
        return response.json() as Promise<HeroData>
      })
      .then(async (localData) => {
        const fallback = dmonFallbackHero()
        const localHeroes = localData.heroes.some((hero) => hero.key === 'dmon')
          ? localData.heroes
          : [...localData.heroes, fallback]
        const withFallback: HeroData = {
          ...localData,
          heroes: localHeroes,
        }

        // Paint the local catalog immediately so OverRoll never depends on the API to open.
        applyLoadedHeroes(withFallback, false)

        try {
          const dmon = await fetchDmonFromOverFast(controller.signal)
          if (cancelled) return
          const merged: HeroData = {
            source: `${localData.source} + OverFast API`,
            updatedAt: new Date().toISOString(),
            heroes: localHeroes.map((hero) => hero.key === 'dmon' ? dmon : hero),
          }
          setData(merged)
          warmImageCache([asset(dmon.portrait)], 1)
          setPicks((current) => current.map((pick) => pick.hero?.key === 'dmon' ? { ...pick, hero: dmon } : pick))
          setStatus(`${merged.heroes.filter((hero) => stadium ? hero.stadiumPowers.length > 0 : hero.gamemodes.includes('quickplay')).length} héroes listos · D.Mon sincronizada`)
        } catch (error) {
          if (!controller.signal.aborted) console.warn('D.Mon: no se pudo sincronizar OverFast; se usa el respaldo local.', error)
        }
      })
      .catch((error: Error) => {
        if (cancelled) return
        setLoadError(error.message)
        setStatus('Error al cargar los datos')
      })
      .finally(() => window.clearTimeout(apiTimeout))

    return () => {
      cancelled = true
      controller.abort()
      window.clearTimeout(apiTimeout)
    }
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
      window.localStorage.setItem('overroll.web.lowPowerMode', JSON.stringify(lowPowerMode))
      window.localStorage.setItem('overroll.web.mobileCompactMode', JSON.stringify(mobileCompactMode))
      window.localStorage.setItem('overroll.web.rouletteRolesEnabled', JSON.stringify(rouletteRolesEnabled))
      window.localStorage.setItem('overroll.web.rouletteSelectedKeys', JSON.stringify(rouletteSelectedKeys))
      window.localStorage.setItem('overroll.web.rouletteWeights', JSON.stringify(rouletteWeights))
      window.localStorage.setItem('overroll.web.rouletteInitialized', JSON.stringify(rouletteInitialized))
      window.localStorage.setItem('overroll.web.activeGame', JSON.stringify(activeGame))
      window.localStorage.setItem('overroll.web.tf2.players', JSON.stringify(tf2Players))
      window.localStorage.setItem('overroll.web.tf2.avoidRepeated', JSON.stringify(tf2AvoidRepeated))
      window.localStorage.setItem('overroll.web.tf2.rouletteSelectedKeys', JSON.stringify(tf2RouletteSelectedKeys))
      window.localStorage.setItem('overroll.web.tf2.rouletteWeights', JSON.stringify(tf2RouletteWeights))
    }, 180)

    return () => window.clearTimeout(timeout)
  }, [players, profiles, profileMode, currentProfileId, avoidRepeated, roleComposition, rolesOnly, randomPerks, stadium, soundEnabled, soundVolume, hoverSounds, animationsEnabled, compactPerks, lowPowerMode, mobileCompactMode, rouletteRolesEnabled, rouletteSelectedKeys, rouletteWeights, rouletteInitialized, activeGame, tf2Players, tf2AvoidRepeated, tf2RouletteSelectedKeys, tf2RouletteWeights])

  useEffect(() => () => {
    rouletteAnimationRef.current?.cancel()
    rouletteAnimationRef.current = null
    roulettePendingSpinRef.current = null
    tf2RouletteAnimationRef.current?.cancel()
    tf2RouletteAnimationRef.current = null
    tf2RoulettePendingSpinRef.current = null
  }, [])

  useEffect(() => {
    if (rouletteSpinRequest === 0) return undefined
    const pending = roulettePendingSpinRef.current
    const rotor = rouletteRotorRef.current
    if (!pending || !rotor || pending.entries.length < 2) return undefined

    const { entries, winnerIndex } = pending
    roulettePendingSpinRef.current = null
    rouletteAnimationRef.current?.cancel()

    const segmentAngle = 360 / entries.length
    const start = normalizeDegrees(rouletteRotation)
    const winnerAngle = normalizeDegrees(-(winnerIndex + 0.5) * segmentAngle)
    const finalOffset = normalizeDegrees(winnerAngle - start)
    const fullTurns = animationsEnabled ? 5 + secureRandomIndex(2) : 1
    const target = start + fullTurns * 360 + finalOffset
    const duration = animationsEnabled ? 2450 : 1

    rotor.style.transform = `rotate(${start}deg)`
    const animation = rotor.animate(
      [
        { transform: `rotate(${start}deg)`, offset: 0 },
        { transform: `rotate(${start + fullTurns * 288}deg)`, offset: 0.72 },
        { transform: `rotate(${target}deg)`, offset: 1 },
      ],
      {
        duration,
        easing: 'cubic-bezier(.12,.64,.16,1)',
        fill: 'forwards',
      },
    )
    rouletteAnimationRef.current = animation

    const finishSpin = () => {
      if (rouletteAnimationRef.current !== animation) return
      setRouletteRotation(target)
      setRouletteWinnerKey(entries[winnerIndex])
      setRouletteSpinning(false)
      playConfirmTone()
      const hero = (data?.heroes ?? []).find((candidate) => candidate.key === entries[winnerIndex])
      notify(hero ? `${hero.name} ganó la ruleta` : 'La ruleta eligió un ganador', 'success')
      window.requestAnimationFrame(() => {
        if (rouletteAnimationRef.current === animation) {
          animation.cancel()
          rouletteAnimationRef.current = null
        }
      })
    }

    void animation.finished.then(finishSpin).catch(() => undefined)
    return () => {
      if (rouletteAnimationRef.current === animation && animation.playState !== 'finished') {
        animation.cancel()
        rouletteAnimationRef.current = null
      }
    }
  }, [rouletteSpinRequest])

  useEffect(() => {
    if (tf2RouletteSpinRequest === 0) return undefined
    const pending = tf2RoulettePendingSpinRef.current
    const rotor = tf2RouletteRotorRef.current
    if (!pending || !rotor || pending.entries.length < 2) return undefined

    const { entries, winnerIndex } = pending
    tf2RoulettePendingSpinRef.current = null
    tf2RouletteAnimationRef.current?.cancel()

    const segmentAngle = 360 / entries.length
    const start = normalizeDegrees(tf2RouletteRotation)
    const winnerAngle = normalizeDegrees(-(winnerIndex + 0.5) * segmentAngle)
    const finalOffset = normalizeDegrees(winnerAngle - start)
    const fullTurns = animationsEnabled ? 5 + secureRandomIndex(2) : 1
    const target = start + fullTurns * 360 + finalOffset
    const duration = animationsEnabled ? 2300 : 1

    rotor.style.transform = `rotate(${start}deg)`
    const animation = rotor.animate(
      [
        { transform: `rotate(${start}deg)`, offset: 0 },
        { transform: `rotate(${start + fullTurns * 292}deg)`, offset: 0.74 },
        { transform: `rotate(${target}deg)`, offset: 1 },
      ],
      { duration, easing: 'cubic-bezier(.11,.67,.14,1)', fill: 'forwards' },
    )
    tf2RouletteAnimationRef.current = animation

    const finishSpin = () => {
      if (tf2RouletteAnimationRef.current !== animation) return
      setTf2RouletteRotation(target)
      setTf2RouletteWinnerKey(entries[winnerIndex])
      setTf2RouletteSpinning(false)
      playSound('tf2RouletteWin')
      const winner = tf2Classes.find((item) => item.key === entries[winnerIndex])
      notify(winner ? `${winner.name} ganó la ruleta TF2` : 'La ruleta TF2 eligió un ganador', 'success')
      window.requestAnimationFrame(() => {
        if (tf2RouletteAnimationRef.current === animation) {
          animation.cancel()
          tf2RouletteAnimationRef.current = null
        }
      })
    }

    void animation.finished.then(finishSpin).catch(() => undefined)
    return () => {
      if (tf2RouletteAnimationRef.current === animation && animation.playState !== 'finished') {
        animation.cancel()
        tf2RouletteAnimationRef.current = null
      }
    }
  }, [tf2RouletteSpinRequest])

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

  const rouletteVisibleHeroes = useMemo(() => {
    const search = rouletteSearch.trim().toLocaleLowerCase('es-MX')
    return (data?.heroes ?? []).filter((hero) => (
      rouletteRolesEnabled[hero.role]
      && (!search || hero.name.toLocaleLowerCase('es-MX').includes(search))
    ))
  }, [data, rouletteRolesEnabled, rouletteSearch])

  const roulettePool = useMemo(() => {
    const selected = new Set(rouletteSelectedKeys)
    return (data?.heroes ?? []).filter((hero) => selected.has(hero.key) && rouletteRolesEnabled[hero.role])
  }, [data, rouletteRolesEnabled, rouletteSelectedKeys])

  const rouletteTotalSlots = useMemo(() => roulettePool.reduce((total, hero) => {
    const raw = Number(rouletteWeights[hero.key] ?? 1)
    return total + Math.max(1, Math.min(64, Math.round(Number.isFinite(raw) ? raw : 1)))
  }, 0), [roulettePool, rouletteWeights])

  const rouletteBuiltHeroes = useMemo(() => {
    const byKey = new Map((data?.heroes ?? []).map((hero) => [hero.key, hero]))
    return rouletteEntries.map((key) => byKey.get(key)).filter((hero): hero is Hero => Boolean(hero))
  }, [data, rouletteEntries])

  const rouletteWinner = useMemo(() => (
    (data?.heroes ?? []).find((hero) => hero.key === rouletteWinnerKey) ?? null
  ), [data, rouletteWinnerKey])

  const tf2FilterPlayer = tf2FilterIndex === null ? null : tf2Players[tf2FilterIndex] ?? null
  const tf2VisibleFilterClasses = useMemo(() => {
    const search = tf2FilterSearch.trim().toLocaleLowerCase('es-MX')
    return tf2Classes.filter((item) => (
      (tf2FilterGroup === 'all' || item.group === tf2FilterGroup)
      && (!search || item.name.toLocaleLowerCase('es-MX').includes(search))
    ))
  }, [tf2FilterGroup, tf2FilterSearch])
  const tf2RouletteVisibleClasses = useMemo(() => {
    const search = tf2RouletteSearch.trim().toLocaleLowerCase('es-MX')
    return tf2Classes.filter((item) => (
      (tf2RouletteGroup === 'all' || item.group === tf2RouletteGroup)
      && (!search || item.name.toLocaleLowerCase('es-MX').includes(search))
    ))
  }, [tf2RouletteGroup, tf2RouletteSearch])
  const tf2RoulettePool = useMemo(() => {
    const selected = new Set(tf2RouletteSelectedKeys)
    return tf2Classes.filter((item) => selected.has(item.key))
  }, [tf2RouletteSelectedKeys])
  const tf2RouletteTotalSlots = useMemo(() => tf2RoulettePool.reduce((total, item) => {
    const raw = Number(tf2RouletteWeights[item.key] ?? 1)
    return total + Math.max(1, Math.min(64, Math.round(Number.isFinite(raw) ? raw : 1)))
  }, 0), [tf2RoulettePool, tf2RouletteWeights])
  const tf2RouletteBuiltClasses = useMemo(() => {
    const byKey = new Map(tf2Classes.map((item) => [item.key, item]))
    return tf2RouletteEntries.map((key) => byKey.get(key)).filter((item): item is Tf2Class => Boolean(item))
  }, [tf2RouletteEntries])
  const tf2RouletteWinner = useMemo(() => tf2Classes.find((item) => item.key === tf2RouletteWinnerKey) ?? null, [tf2RouletteWinnerKey])

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

  function activateGame(game: GameId) {
    setActiveGame(game)
    setActiveView('principal')
    setDetailsIndex(null)
    setFilterIndex(null)
    setTf2FilterIndex(null)
    setMobileConfigOpen(false)
    setMobileConfigTab('squad')
    playSound(game === 'tf2' ? 'tf2Click' : 'nav')
    const activeName = gameModules.find((item) => item.id === game)?.name ?? 'OverRoll'
    notify(`${activeName} activo`, 'success')
  }

  function tf2ChangePlayerCount(delta: number) {
    const nextCount = Math.max(1, Math.min(6, tf2Players.length + delta))
    if (nextCount === tf2Players.length) return
    setTf2Players((old) => Array.from({ length: nextCount }, (_, index) => old[index] ?? makeTf2Player(index)))
    setTf2Picks((old) => Array.from({ length: nextCount }, (_, index) => old[index] ?? { mercenary: null, locked: false }))
    setTf2FilterIndex(null)
    setTf2Status(`${nextCount} jugador${nextCount === 1 ? '' : 'es'} en Mercenarios`)
  }

  function tf2UpdatePlayerName(index: number, name: string) {
    setTf2Players((old) => old.map((player, playerIndex) => playerIndex === index ? { ...player, name } : player))
  }

  function tf2AssignPlayerProfile(index: number, profileId: string) {
    const assigned = profiles.find((item) => item.id === profileId)
    playSound('profileAssign')
    setTf2Players((old) => old.map((player, playerIndex) => playerIndex === index
      ? { ...player, profileId, name: assigned?.name ?? (player.profileId ? `Jugador ${index + 1}` : player.name) }
      : player))
    notify(assigned ? `${assigned.name} asignado al mercenario ${index + 1}` : `Perfil retirado del mercenario ${index + 1}`)
  }

  function tf2TogglePlayerGroup(index: number, group: Tf2Group) {
    const player = tf2Players[index]
    if (!player) return
    const enabledCount = tf2Groups.filter((item) => player.groups[item]).length
    if (player.groups[group] && enabledCount === 1) {
      notify('Cada jugador debe conservar al menos un grupo de clases.', 'warning')
      return
    }
    const next = !player.groups[group]
    setTf2Players((old) => old.map((item, playerIndex) => playerIndex === index ? { ...item, groups: { ...item.groups, [group]: next } } : item))
    playSound('tf2Click')
  }

  function tf2ClearNames() {
    setTf2Players((old) => old.map((player, index) => ({
      ...player,
      name: player.profileId ? profiles.find((item) => item.id === player.profileId)?.name ?? `Jugador ${index + 1}` : '',
    })))
    playSound('tf2Click')
    notify('Nombres de TF2 limpiados')
  }

  function tf2ShufflePlayers() {
    const payload = shuffleArray(tf2Players.map((player) => ({
      name: player.name,
      groups: player.groups,
      profileId: player.profileId,
      blocked: player.blocked,
    })))
    setTf2Players((old) => old.map((player, index) => ({ ...player, ...payload[index] })))
    setTf2Picks((old) => old.map((pick) => ({ ...pick, locked: false })))
    playSound('tf2Click')
    notify('Mercenarios, perfiles y filtros revueltos', 'success')
  }

  function tf2ResetGroups() {
    setTf2Players((old) => old.map((player) => ({ ...player, groups: { offense: true, defense: true, support: true } })))
    playSound('tf2Click')
    notify('Grupos de clases restablecidos')
  }

  function generateTf2Team() {
    if (tf2Generating || tf2RerollingIndex !== null) return
    setTf2Generating(true)
    setTf2Status('Reuniendo mercenarios…')
    playSound('tf2Generate')
    const nextTeam = buildTf2Team(tf2Players, tf2Picks, tf2AvoidRepeated)
    const missing = nextTeam.filter((pick) => !pick.mercenary).length
    setTf2Picks(nextTeam)
    setTf2GenerationRevision((value) => value + 1)
    window.setTimeout(() => {
      setTf2Generating(false)
      if (missing > 0) {
        setTf2Status(`${missing} jugador${missing === 1 ? '' : 'es'} sin clase compatible`)
        notify('Revisa los grupos y filtros de TF2.', 'warning')
      } else {
        setTf2Status('Equipo TF2 generado correctamente')
        notify('Nuevo equipo de mercenarios generado', 'success')
      }
    }, animationsEnabled ? 300 : 30)
  }

  function rerollTf2(index: number) {
    const current = tf2Picks[index]
    const player = tf2Players[index]
    if (!player || current?.locked || tf2RerollingIndex !== null || tf2Generating) return
    setTf2RerollingIndex(index)
    playSound('tf2Reroll')
    window.setTimeout(() => {
      const used = new Set(tf2Picks.filter((_, pickIndex) => pickIndex !== index).map((pick) => pick.mercenary?.key).filter((key): key is string => Boolean(key)))
      const excluded = new Set<string>(tf2AvoidRepeated ? used : [])
      if (current?.mercenary) excluded.add(current.mercenary.key)
      let options = tf2OptionsForPlayer(player, excluded)
      if (options.length === 0) {
        const onlyPrevious = current?.mercenary ? new Set([current.mercenary.key]) : new Set<string>()
        options = tf2OptionsForPlayer(player, onlyPrevious)
      }
      const mercenary = options[secureRandomIndex(options.length)] ?? current?.mercenary ?? null
      setTf2Picks((old) => old.map((pick, pickIndex) => pickIndex === index ? { mercenary, locked: false } : pick))
      setTf2RerollingIndex(null)
      setTf2Status(`Reroll de ${player.name || `Jugador ${index + 1}`}`)
      if (!mercenary) notify('No hay otra clase compatible con ese filtro.', 'warning')
    }, animationsEnabled ? 220 : 20)
  }

  function toggleTf2Lock(index: number) {
    const pick = tf2Picks[index]
    if (!pick?.mercenary) return
    const locked = !pick.locked
    setTf2Picks((old) => old.map((item, pickIndex) => pickIndex === index ? { ...item, locked } : item))
    playSound(locked ? 'lock' : 'tf2Click')
    notify(locked ? `${pick.mercenary.name} quedó fijado` : `${pick.mercenary.name} fue liberado`)
  }

  function openTf2Filter(index: number) {
    setTf2FilterIndex(index)
    setTf2FilterSearch('')
    setTf2FilterGroup('all')
    playSound('tf2Click')
  }

  function closeTf2Filter() {
    setTf2FilterIndex(null)
    playSound('tf2Click')
  }

  function toggleTf2BlockedClass(key: string) {
    if (tf2FilterIndex === null) return
    setTf2Players((old) => old.map((player, index) => {
      if (index !== tf2FilterIndex) return player
      const blocked = player.blocked.includes(key) ? player.blocked.filter((item) => item !== key) : [...player.blocked, key]
      return { ...player, blocked }
    }))
    playSound('tf2Click')
  }

  function clearTf2Filter() {
    if (tf2FilterIndex === null) return
    setTf2Players((old) => old.map((player, index) => index === tf2FilterIndex ? { ...player, blocked: [] } : player))
    playSound('tf2Click')
  }

  function tf2RouletteWeight(key: string) {
    const raw = Number(tf2RouletteWeights[key] ?? 1)
    return Math.max(1, Math.min(64, Math.round(Number.isFinite(raw) ? raw : 1)))
  }

  function tf2RouletteProbability(key: string) {
    if (!tf2RouletteSelectedKeys.includes(key) || tf2RouletteTotalSlots <= 0) return 0
    return tf2RouletteWeight(key) * 100 / tf2RouletteTotalSlots
  }

  function markTf2RouletteDirty(message?: string) {
    setTf2RouletteDirty(true)
    setTf2RouletteEntries([])
    setTf2RouletteWinnerKey('')
    setTf2RouletteRotation(0)
    setTf2Status(message ?? 'La ruleta TF2 tiene cambios pendientes')
  }

  function toggleTf2RouletteClass(key: string) {
    if (tf2RouletteSpinning) return
    const selected = tf2RouletteSelectedKeys.includes(key)
    const next = selected ? tf2RouletteSelectedKeys.filter((item) => item !== key) : [...tf2RouletteSelectedKeys, key]
    setTf2RouletteSelectedKeys(next)
    setTf2RouletteWeights((current) => {
      const copy = { ...current }
      if (selected) delete copy[key]
      else copy[key] = next.length === 1 ? 2 : 1
      if (next.length === 1) copy[next[0]] = Math.max(2, copy[next[0]] ?? 2)
      return copy
    })
    markTf2RouletteDirty(next.length ? 'Lista para construir' : 'Selecciona al menos una clase')
    playSound('tf2Click')
  }

  function changeTf2RouletteWeight(key: string, delta: number) {
    if (tf2RouletteSpinning || !tf2RouletteSelectedKeys.includes(key)) return
    const current = tf2RouletteWeight(key)
    if (delta > 0 && tf2RouletteTotalSlots >= 64) return
    if (delta < 0 && (current <= 1 || tf2RouletteTotalSlots <= 2)) return
    setTf2RouletteWeights((weights) => ({ ...weights, [key]: Math.max(1, Math.min(64, current + delta)) }))
    markTf2RouletteDirty('Pesos actualizados')
    playSound('tf2Click')
  }

  function selectAllTf2Roulette() {
    setTf2RouletteSelectedKeys(tf2Classes.map((item) => item.key))
    setTf2RouletteWeights(Object.fromEntries(tf2Classes.map((item) => [item.key, 1])))
    markTf2RouletteDirty('Las 9 clases están seleccionadas')
    playSound('tf2Click')
  }

  function clearTf2Roulette() {
    setTf2RouletteSelectedKeys([])
    setTf2RouletteWeights({})
    markTf2RouletteDirty('Selecciona al menos una clase')
    playSound('tf2Click')
  }

  function buildTf2Roulette(playAudio = true) {
    if (tf2RouletteSpinning || tf2RoulettePool.length === 0 || tf2RouletteTotalSlots > 64) return [] as string[]
    const entries = shuffleArray(tf2RoulettePool.flatMap((item) => Array.from({ length: tf2RouletteWeight(item.key) }, () => item.key))).slice(0, 64)
    if (entries.length === 1) entries.push(entries[0])
    setTf2RouletteEntries(entries)
    setTf2RouletteWinnerKey('')
    setTf2RouletteRotation(0)
    setTf2RouletteDirty(false)
    setTf2Status('Ruleta TF2 construida')
    if (playAudio) playSound('tf2RouletteBuild')
    return entries
  }

  function spinTf2Roulette() {
    if (tf2RouletteSpinning || tf2RoulettePool.length === 0) return
    const entries = tf2RouletteDirty || tf2RouletteEntries.length < 2 ? buildTf2Roulette(false) : tf2RouletteEntries
    if (entries.length < 2) return
    const winnerIndex = secureRandomIndex(entries.length)
    setTf2RouletteWinnerKey('')
    setTf2RouletteSpinning(true)
    setTf2Status('Girando ruleta TF2…')
    playSound('tf2RouletteSpin')
    tf2RoulettePendingSpinRef.current = { entries, winnerIndex }
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => setTf2RouletteSpinRequest((value) => value + 1)))
  }

  async function generateTf2TeamImage() {
    if (!tf2Picks.some((pick) => pick.mercenary)) {
      notify('Primero genera un equipo TF2.', 'warning')
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = 1800
    canvas.height = 1000
    const context = canvas.getContext('2d')
    if (!context) return
    const background = context.createLinearGradient(0, 0, canvas.width, canvas.height)
    background.addColorStop(0, '#160f0b')
    background.addColorStop(1, '#302116')
    context.fillStyle = background
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = 'rgba(232, 164, 91, .09)'
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
    context.fillStyle = '#e8a45b'
    context.font = '900 30px system-ui, sans-serif'
    context.fillText('OVERROLL', 72, 72)
    context.fillStyle = '#fff7e8'
    context.font = '900 54px system-ui, sans-serif'
    context.fillText('TEAM FORTRESS 2', 72, 136)
    const gap = 20
    const left = 72
    const top = 225
    const totalWidth = canvas.width - left * 2
    const cardWidth = (totalWidth - gap * (tf2Players.length - 1)) / tf2Players.length
    await Promise.all(tf2Players.map(async (player, index) => {
      const pick = tf2Picks[index]
      const mercenary = pick?.mercenary
      const accent = mercenary ? tf2GroupColors[mercenary.group] : '#7d6b5c'
      const x = left + index * (cardWidth + gap)
      context.fillStyle = 'rgba(25, 17, 12, .96)'
      context.fillRect(x, top, cardWidth, 650)
      context.strokeStyle = accent
      context.lineWidth = pick?.locked ? 6 : 4
      context.strokeRect(x, top, cardWidth, 650)
      context.fillStyle = '#241912'
      context.fillRect(x + 4, top + 4, cardWidth - 8, 54)
      context.fillStyle = accent
      context.font = '800 18px system-ui, sans-serif'
      context.fillText(String(index + 1).padStart(2, '0'), x + 18, top + 38)
      context.fillStyle = '#eadccc'
      context.font = '700 17px system-ui, sans-serif'
      context.fillText((player.name || `Jugador ${index + 1}`).slice(0, 20), x + 58, top + 38)
      const portraitX = x + 12
      const portraitY = top + 72
      const portraitWidth = cardWidth - 24
      const portraitHeight = 420
      context.fillStyle = '#342419'
      context.fillRect(portraitX, portraitY, portraitWidth, portraitHeight)
      if (mercenary) {
        try {
          const image = await loadImageForCanvas(asset(mercenary.portrait))
          drawImageCover(context, image, portraitX, portraitY, portraitWidth, portraitHeight)
        } catch { /* keep fallback */ }
      }
      const fade = context.createLinearGradient(0, portraitY + 270, 0, portraitY + portraitHeight)
      fade.addColorStop(0, 'rgba(20, 12, 7, 0)')
      fade.addColorStop(1, 'rgba(20, 12, 7, .94)')
      context.fillStyle = fade
      context.fillRect(portraitX, portraitY, portraitWidth, portraitHeight)
      context.textAlign = 'center'
      context.fillStyle = '#ffffff'
      context.font = '900 30px system-ui, sans-serif'
      context.fillText((mercenary?.name ?? 'SIN SELECCIÓN').toUpperCase(), x + cardWidth / 2, top + 545)
      context.fillStyle = accent
      context.font = '800 17px system-ui, sans-serif'
      context.fillText(mercenary ? tf2GroupLabels[mercenary.group].toUpperCase() : 'MERCENARIO', x + cardWidth / 2, top + 580)
      context.fillStyle = '#bca58f'
      context.font = '600 15px system-ui, sans-serif'
      context.fillText(player.profileId ? 'PERFIL ASIGNADO' : 'SELECCIÓN ALEATORIA', x + cardWidth / 2, top + 620)
      context.textAlign = 'left'
    }))
    context.textAlign = 'right'
    context.fillStyle = '#a78e76'
    context.font = '600 17px system-ui, sans-serif'
    context.fillText('Generado con OverRoll', canvas.width - 72, canvas.height - 42)
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `overroll-tf2-${new Date().toISOString().slice(0, 10)}.png`
      anchor.click()
      URL.revokeObjectURL(url)
      notify('Imagen del equipo TF2 generada', 'success')
    }, 'image/png')
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
    setTf2Players((old) => old.map((player) => {
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
    setTf2Players((old) => old.map((player, index) => (
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

  function rouletteWeight(heroKey: string) {
    const raw = Number(rouletteWeights[heroKey] ?? 1)
    const normalized = Math.max(1, Math.min(64, Math.round(Number.isFinite(raw) ? raw : 1)))
    return roulettePool.length === 1 && roulettePool[0]?.key === heroKey ? Math.max(2, normalized) : normalized
  }

  function rouletteProbability(heroKey: string) {
    if (!rouletteSelectedKeys.includes(heroKey) || rouletteTotalSlots <= 0) return 0
    return Math.round((rouletteWeight(heroKey) * 1000) / rouletteTotalSlots) / 10
  }

  function markRouletteDirty() {
    setRouletteDirty(true)
    setRouletteEntries([])
    setRouletteWinnerKey('')
    setRouletteRotation(0)
  }

  function toggleRouletteRole(role: Role) {
    if (rouletteSpinning) return
    const next = !rouletteRolesEnabled[role]
    setRouletteRolesEnabled((current) => ({ ...current, [role]: next }))
    markRouletteDirty()
    toggleRuleSound(next)
  }

  function toggleRouletteHero(heroKey: string) {
    if (rouletteSpinning) return
    const wasSelected = rouletteSelectedKeys.includes(heroKey)
    const nextSelection = wasSelected
      ? rouletteSelectedKeys.filter((key) => key !== heroKey)
      : [...rouletteSelectedKeys, heroKey]

    setRouletteSelectedKeys(nextSelection)
    setRouletteWeights((current) => {
      const next = { ...current }
      if (wasSelected) delete next[heroKey]
      else next[heroKey] = nextSelection.length === 1 ? 2 : 1
      if (nextSelection.length === 1) next[nextSelection[0]] = Math.max(2, Number(next[nextSelection[0]] ?? 2))
      return next
    })
    markRouletteDirty()
    playSound(wasSelected ? 'toggleOff' : 'toggleOn')
  }

  function changeRouletteWeight(heroKey: string, delta: number) {
    if (rouletteSpinning || !rouletteSelectedKeys.includes(heroKey)) return
    const current = rouletteWeight(heroKey)
    if (delta > 0 && rouletteTotalSlots >= 64) {
      notify('La ruleta admite como máximo 64 casillas.', 'warning')
      return
    }
    if (delta < 0 && rouletteTotalSlots <= 2) return
    const nextValue = Math.max(1, Math.min(64, current + delta))
    if (nextValue === current) return
    setRouletteWeights((weights) => ({ ...weights, [heroKey]: nextValue }))
    markRouletteDirty()
    playSound('click')
  }

  function selectRouletteVisible() {
    if (rouletteSpinning) return
    const visibleKeys = rouletteVisibleHeroes.map((hero) => hero.key)
    const nextSelection = [...new Set([...rouletteSelectedKeys, ...visibleKeys])]
    setRouletteSelectedKeys(nextSelection)
    setRouletteWeights((current) => {
      const next = { ...current }
      nextSelection.forEach((key) => { if (!next[key]) next[key] = nextSelection.length === 1 ? 2 : 1 })
      return next
    })
    markRouletteDirty()
    playSound('profileClassify')
  }

  function selectAllRouletteHeroes() {
    if (rouletteSpinning) return
    const activeKeys = (data?.heroes ?? []).filter((hero) => rouletteRolesEnabled[hero.role]).map((hero) => hero.key)
    const nextWeights: Record<string, number> = {}
    activeKeys.forEach((key) => { nextWeights[key] = activeKeys.length === 1 ? 2 : 1 })
    setRouletteSelectedKeys(activeKeys)
    setRouletteWeights(nextWeights)
    markRouletteDirty()
    playSound('profileClassify')
  }

  function clearRouletteVisible() {
    if (rouletteSpinning) return
    const visibleKeys = new Set(rouletteVisibleHeroes.map((hero) => hero.key))
    const nextSelection = rouletteSelectedKeys.filter((key) => !visibleKeys.has(key))
    setRouletteSelectedKeys(nextSelection)
    setRouletteWeights((current) => {
      const next = { ...current }
      visibleKeys.forEach((key) => delete next[key])
      if (nextSelection.length === 1) next[nextSelection[0]] = Math.max(2, Number(next[nextSelection[0]] ?? 2))
      return next
    })
    markRouletteDirty()
    playSound('filter')
  }

  function clearRouletteHeroes() {
    if (rouletteSpinning) return
    setRouletteSelectedKeys([])
    setRouletteWeights({})
    markRouletteDirty()
    playSound('toggleOff')
  }

  function equalizeRouletteWeights() {
    if (rouletteSpinning || roulettePool.length === 0) return
    setRouletteWeights((current) => {
      const next = { ...current }
      roulettePool.forEach((hero) => { next[hero.key] = roulettePool.length === 1 ? 2 : 1 })
      return next
    })
    markRouletteDirty()
    playSound('click')
  }

  function buildRoulette(showNotice = true): string[] | null {
    if (roulettePool.length === 0) {
      notify('Selecciona al menos un héroe para construir la ruleta.', 'warning')
      return null
    }

    const normalizedWeights = { ...rouletteWeights }
    if (roulettePool.length === 1) {
      const onlyKey = roulettePool[0].key
      normalizedWeights[onlyKey] = Math.max(2, rouletteWeight(onlyKey))
      setRouletteWeights(normalizedWeights)
    }

    const entries: string[] = []
    roulettePool.forEach((hero) => {
      const weight = roulettePool.length === 1
        ? Math.max(2, Number(normalizedWeights[hero.key] ?? 2))
        : rouletteWeight(hero.key)
      for (let copy = 0; copy < weight && entries.length < 64; copy += 1) entries.push(hero.key)
    })

    if (entries.length < 2) {
      notify('La ruleta necesita por lo menos 2 casillas.', 'warning')
      return null
    }

    const shuffled = shuffleArray(entries)
    setRouletteEntries(shuffled)
    setRouletteWinnerKey('')
    setRouletteRotation(0)
    setRouletteDirty(false)
    playSound('profileClassify')
    if (showNotice) notify(`Ruleta construida con ${shuffled.length} casillas`, 'success')
    return shuffled
  }

  function spinRoulette() {
    if (rouletteSpinning) return
    const entries = rouletteDirty || rouletteEntries.length === 0 ? buildRoulette(false) : rouletteEntries
    if (!entries || entries.length < 2) return

    const winnerIndex = secureRandomIndex(entries.length)
    roulettePendingSpinRef.current = { entries, winnerIndex }
    setRouletteSpinning(true)
    setRouletteWinnerKey('')
    setRouletteSpinRequest((value) => value + 1)
    playSound('generate')
  }

  async function generateRouletteImage() {
    if (!rouletteWinner) {
      notify('Gira la ruleta antes de generar la imagen.', 'warning')
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = 1400
    canvas.height = 788
    const context = canvas.getContext('2d')
    if (!context) {
      notify('El navegador no pudo crear la imagen.', 'warning')
      return
    }

    const accent = rouletteRoleColors[rouletteWinner.role]
    const background = context.createLinearGradient(0, 0, canvas.width, canvas.height)
    background.addColorStop(0, '#02070d')
    background.addColorStop(1, '#09283a')
    context.fillStyle = background
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.strokeStyle = 'rgba(92, 215, 255, .09)'
    for (let x = 0; x <= canvas.width; x += 64) {
      context.beginPath(); context.moveTo(x, 0); context.lineTo(x, canvas.height); context.stroke()
    }
    for (let y = 0; y <= canvas.height; y += 64) {
      context.beginPath(); context.moveTo(0, y); context.lineTo(canvas.width, y); context.stroke()
    }

    context.fillStyle = '#ffc43b'
    context.font = '900 32px system-ui, sans-serif'
    context.fillText('OVERROLL', 68, 72)
    context.fillStyle = '#ffffff'
    context.font = '900 58px system-ui, sans-serif'
    context.fillText('RULETA MAKER', 68, 138)
    context.fillStyle = '#8fa9b9'
    context.font = '700 20px system-ui, sans-serif'
    context.fillText(`${rouletteEntries.length} casillas · ${rouletteProbability(rouletteWinner.key).toFixed(1)}% de probabilidad`, 70, 176)

    context.fillStyle = 'rgba(5, 24, 36, .96)'
    context.fillRect(68, 218, 1264, 488)
    context.strokeStyle = accent
    context.lineWidth = 4
    context.strokeRect(68, 218, 1264, 488)

    try {
      const image = await loadImageForCanvas(asset(rouletteWinner.portrait))
      drawImageCover(context, image, 72, 222, 635, 480)
    } catch {
      context.fillStyle = '#153346'
      context.fillRect(72, 222, 635, 480)
    }

    const fade = context.createLinearGradient(640, 0, 980, 0)
    fade.addColorStop(0, 'rgba(5, 24, 36, 0)')
    fade.addColorStop(1, 'rgba(5, 24, 36, .98)')
    context.fillStyle = fade
    context.fillRect(520, 222, 808, 480)

    context.fillStyle = accent
    context.font = '900 22px system-ui, sans-serif'
    context.fillText('GANADOR', 770, 340)
    context.fillStyle = '#ffffff'
    context.font = '900 66px system-ui, sans-serif'
    context.fillText(rouletteWinner.name.toUpperCase(), 770, 420)
    context.fillStyle = accent
    context.font = '850 24px system-ui, sans-serif'
    context.fillText(`${roleLabels[rouletteWinner.role].toUpperCase()} · ${(subroleLabels[rouletteWinner.subrole] ?? rouletteWinner.subrole).toUpperCase()}`, 772, 462)
    context.fillStyle = '#8ca8b8'
    context.font = '700 20px system-ui, sans-serif'
    context.fillText(`Peso x${rouletteWeight(rouletteWinner.key)}`, 772, 520)
    context.fillText(`${rouletteProbability(rouletteWinner.key).toFixed(1)}% de probabilidad`, 772, 556)

    context.textAlign = 'right'
    context.fillStyle = '#7592a3'
    context.font = '600 16px system-ui, sans-serif'
    context.fillText('Generado con OverRoll', canvas.width - 68, canvas.height - 28)

    canvas.toBlob((blob) => {
      if (!blob) {
        notify('No se pudo terminar la imagen.', 'warning')
        return
      }
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `overroll-ruleta-${rouletteWinner.key}-${new Date().toISOString().slice(0, 10)}.png`
      anchor.click()
      URL.revokeObjectURL(url)
      playConfirmTone()
      notify('Imagen del ganador generada', 'success')
    }, 'image/png')
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

  function loadImageForCanvas(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.decoding = 'async'
      if (/^https?:\/\//i.test(src)) image.crossOrigin = 'anonymous'
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error(`No se pudo cargar ${src}`))
      image.src = src
    })
  }

  function drawImageCover(
    context: CanvasRenderingContext2D,
    image: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
    const sourceWidth = width / scale
    const sourceHeight = height / scale
    const sourceX = Math.max(0, (image.naturalWidth - sourceWidth) / 2)
    const sourceY = Math.max(0, (image.naturalHeight - sourceHeight) / 2)
    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height)
  }

  async function generateTeamImage() {
    const team = players.map((player, index) => ({ player, pick: picks[index] }))
    if (!team.some(({ pick }) => pick?.hero)) {
      notify('Primero genera un equipo.', 'warning')
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = 1800
    canvas.height = 1050
    const context = canvas.getContext('2d')
    if (!context) {
      notify('El navegador no pudo crear la imagen.', 'warning')
      return
    }

    const roleColors: Record<Role, string> = {
      tank: '#4fc9ff',
      damage: '#ff5578',
      support: '#55e4ad',
    }

    const background = context.createLinearGradient(0, 0, canvas.width, canvas.height)
    background.addColorStop(0, '#03111a')
    background.addColorStop(1, '#071f2d')
    context.fillStyle = background
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.strokeStyle = 'rgba(71, 194, 255, .12)'
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
    context.fillText('OVERWATCH', 72, 136)

    const gap = 22
    const left = 72
    const top = 225
    const totalWidth = canvas.width - left * 2
    const cardWidth = (totalWidth - gap * (team.length - 1)) / team.length
    const cardHeight = 710

    await Promise.all(team.map(async ({ player, pick }, index) => {
      const x = left + index * (cardWidth + gap)
      const role = pick?.role ?? pick?.hero?.role ?? assignedRoles[index]
      const accent = role ? roleColors[role] : '#67859a'

      context.fillStyle = 'rgba(4, 23, 34, .96)'
      context.fillRect(x, top, cardWidth, cardHeight)
      context.strokeStyle = accent
      context.lineWidth = 4
      context.strokeRect(x, top, cardWidth, cardHeight)

      context.fillStyle = '#071925'
      context.fillRect(x + 4, top + 4, cardWidth - 8, 54)
      context.fillStyle = accent
      context.font = '800 18px system-ui, sans-serif'
      context.fillText(String(index + 1).padStart(2, '0'), x + 18, top + 38)
      context.fillStyle = '#bfd1dc'
      context.font = '700 17px system-ui, sans-serif'
      context.fillText((player.name || `Jugador ${index + 1}`).slice(0, 22), x + 58, top + 38)

      const portraitX = x + 12
      const portraitY = top + 70
      const portraitWidth = cardWidth - 24
      const portraitHeight = 390
      context.fillStyle = '#0a2636'
      context.fillRect(portraitX, portraitY, portraitWidth, portraitHeight)

      const hero = pick?.hero
      if (hero) {
        try {
          const image = await loadImageForCanvas(asset(hero.portrait))
          drawImageCover(context, image, portraitX, portraitY, portraitWidth, portraitHeight)
        } catch {
          context.fillStyle = '#17384a'
          context.fillRect(portraitX, portraitY, portraitWidth, portraitHeight)
        }
      }

      const fade = context.createLinearGradient(0, portraitY + 260, 0, portraitY + portraitHeight)
      fade.addColorStop(0, 'rgba(2, 12, 18, 0)')
      fade.addColorStop(1, 'rgba(2, 12, 18, .92)')
      context.fillStyle = fade
      context.fillRect(portraitX, portraitY, portraitWidth, portraitHeight)

      context.fillStyle = '#ffffff'
      context.font = '900 30px system-ui, sans-serif'
      context.textAlign = 'center'
      context.fillText((hero?.name ?? 'SIN SELECCIÓN').toUpperCase(), x + cardWidth / 2, top + 505)
      context.fillStyle = accent
      context.font = '800 17px system-ui, sans-serif'
      context.fillText(role ? roleLabels[role].toUpperCase() : 'SIN ROL', x + cardWidth / 2, top + 536)

      context.textAlign = 'left'
      context.font = '700 16px system-ui, sans-serif'
      const perkItems = pick?.perks.slice(0, stadium ? 4 : 2) ?? []
      await Promise.all(perkItems.map(async (perk, perkIndex) => {
        const perkY = top + 576 + perkIndex * 45
        context.fillStyle = 'rgba(12, 45, 61, .92)'
        context.fillRect(x + 16, perkY, cardWidth - 32, 34)
        try {
          const perkImage = await loadImageForCanvas(asset(perk.icon))
          context.save()
          context.beginPath()
          context.rect(x + 20, perkY + 5, 24, 24)
          context.clip()
          context.drawImage(perkImage, x + 20, perkY + 5, 24, 24)
          context.restore()
        } catch {
          context.fillStyle = '#193f57'
          context.fillRect(x + 20, perkY + 5, 24, 24)
        }
        context.fillStyle = '#ffc84a'
        context.fillText(`${perkIndex + 1}.`, x + 52, perkY + 23)
        context.fillStyle = '#e8f3f8'
        const maxLength = Math.max(10, Math.floor(cardWidth / 12))
        const label = perk.name.length > maxLength ? `${perk.name.slice(0, maxLength - 1)}…` : perk.name
        context.fillText(label, x + 76, perkY + 23)
      }))

      if (perkItems.length === 0) {
        context.fillStyle = '#7892a1'
        context.font = '600 16px system-ui, sans-serif'
        context.fillText('Sin mejoras seleccionadas', x + 22, top + 610)
      }
    }))

    context.textAlign = 'right'
    context.fillStyle = '#708c9c'
    context.font = '600 17px system-ui, sans-serif'
    context.fillText('Generado con OverRoll', canvas.width - 72, canvas.height - 42)

    canvas.toBlob((blob) => {
      if (!blob) {
        notify('No se pudo terminar la imagen.', 'warning')
        return
      }
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `overroll-equipo-${new Date().toISOString().slice(0, 10)}.png`
      anchor.click()
      URL.revokeObjectURL(url)
      playConfirmTone()
      notify('Imagen del equipo generada', 'success')
    }, 'image/png')
  }

  function localDataUsage() {
    try {
      let bytes = 0
      for (let index = 0; index < window.localStorage.length; index += 1) {
        const key = window.localStorage.key(index)
        if (!key || !key.startsWith('overroll.web.')) continue
        const value = window.localStorage.getItem(key) ?? ''
        bytes += (key.length + value.length) * 2
      }
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    } catch {
      return 'No disponible'
    }
  }

  function restoreRecommendedSettings() {
    setSoundEnabled(true)
    setSoundVolume(0.42)
    setHoverSounds(false)
    setAnimationsEnabled(true)
    setCompactPerks(false)
    setLowPowerMode(false)
    setMobileCompactMode(true)
    playConfirmTone()
    notify('Ajustes visuales restaurados', 'success')
  }

  function resetLocalData() {
    const confirmed = window.confirm('Esto borrará perfiles, nombres, reglas, ruleta y configuración guardada en este navegador. ¿Continuar?')
    if (!confirmed) return

    try {
      const keys: string[] = []
      for (let index = 0; index < window.localStorage.length; index += 1) {
        const key = window.localStorage.key(index)
        if (key?.startsWith('overroll.web.')) keys.push(key)
      }
      keys.forEach((key) => window.localStorage.removeItem(key))
      window.location.reload()
    } catch {
      notify('No se pudieron borrar los datos locales', 'warning')
    }
  }

  function renderTf2Principal() {
    return (
      <main className="workspace tf2-workspace">
        <aside className={`sidebar tf2-sidebar ${mobileConfigOpen ? 'mobile-config-open' : 'mobile-config-closed'}`}>
          <div className="sidebar-head">
            <div><span className="eyebrow">Preparar partida</span><strong>Mercenarios</strong></div>
            <span className="live-dot tf2-live"><span /> TF2</span>
            <button type="button" className="mobile-config-toggle" onClick={() => { setMobileConfigOpen((value) => !value); playSound('tf2Click') }} aria-expanded={mobileConfigOpen}>
              <Icon name={mobileConfigOpen ? 'close' : 'settings'} size={15} /><span>{mobileConfigOpen ? 'Ocultar' : 'Editar'}</span>
            </button>
          </div>

          {mobileConfigOpen && (
            <div className="mobile-config-tabs tf2-mobile-tabs" role="tablist" aria-label="Apartados de TF2">
              <button type="button" className={mobileConfigTab === 'squad' ? 'active' : ''} onClick={() => setMobileConfigTab('squad')} role="tab"><Icon name="users" size={14} /> Escuadra</button>
              <button type="button" className={mobileConfigTab === 'rules' ? 'active' : ''} onClick={() => setMobileConfigTab('rules')} role="tab"><Icon name="settings" size={14} /> Reglas</button>
            </div>
          )}

          <section className={`side-panel squad-panel mobile-config-section ${mobileConfigTab === 'squad' ? 'mobile-active' : ''}`}>
            <div className="panel-title-row"><div><label>Escuadra</label><small>Nombres, perfiles y grupos permitidos</small></div><Icon name="users" size={17} /></div>
            <div className="squad-counter tf2-counter">
              <button type="button" onClick={() => { playSound('tf2Click'); tf2ChangePlayerCount(-1) }} disabled={tf2Players.length <= 1 || tf2Generating}>−</button>
              <strong>{tf2Players.length} jugador{tf2Players.length === 1 ? '' : 'es'}</strong>
              <button type="button" onClick={() => { playSound('tf2Click'); tf2ChangePlayerCount(1) }} disabled={tf2Players.length >= 6 || tf2Generating}>+</button>
            </div>
            <div className="squad-tools tf2-squad-tools">
              <button type="button" onClick={tf2ClearNames}><Icon name="trash" size={14} /><span>Nombres</span></button>
              <button type="button" onClick={tf2ShufflePlayers}><Icon name="shuffle" size={14} /><span>Revolver</span></button>
              <button type="button" onClick={tf2ResetGroups}><Icon name="reset" size={14} /><span>Clases</span></button>
            </div>
            <div className="players tf2-players">
              {tf2Players.map((player, index) => (
                <div className="player-row tf2-player-row" key={player.id}>
                  <span className="number">{String(index + 1).padStart(2, '0')}</span>
                  <input value={player.name} disabled={Boolean(player.profileId)} onChange={(event: ChangeEvent<HTMLInputElement>) => tf2UpdatePlayerName(index, event.target.value)} maxLength={22} aria-label={`Nombre TF2 ${index + 1}`} />
                  <select className="player-profile-inline" value={player.profileId} onChange={(event: ChangeEvent<HTMLSelectElement>) => tf2AssignPlayerProfile(index, event.target.value)} aria-label={`Perfil TF2 ${index + 1}`}>
                    <option value="">☆</option>{profiles.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
                  </select>
                  <div className="tf2-group-buttons">
                    {tf2Groups.map((group) => <button type="button" className={`tf2-group ${group} ${player.groups[group] ? 'active' : ''}`} onClick={() => tf2TogglePlayerGroup(index, group)} title={tf2GroupLabels[group]} aria-pressed={player.groups[group]} key={group}><span>{group === 'offense' ? 'OF' : group === 'defense' ? 'DE' : 'AP'}</span></button>)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={`side-panel rules mobile-config-section ${mobileConfigTab === 'rules' ? 'mobile-active' : ''}`}>
            <div className="panel-title-row"><div><label>Reglas</label><small>Ajustes exclusivos de TF2</small></div><Icon name="settings" size={17} /></div>
            <button type="button" className={`toggle-row tf2-toggle ${tf2AvoidRepeated ? 'enabled' : ''}`} onClick={() => { const next = !tf2AvoidRepeated; setTf2AvoidRepeated(next); playSound('tf2Click') }} aria-pressed={tf2AvoidRepeated}>
              <span className="switch"><span /></span><span><b>Evitar clases repetidas</b><small>Una clase por jugador cuando sea posible</small></span>
            </button>
            <div className="tf2-class-legend">
              {tf2Groups.map((group) => <span className={group} key={group}><i />{tf2GroupLabels[group]}<small>{tf2Classes.filter((item) => item.group === group).map((item) => item.name).join(', ')}</small></span>)}
            </div>
          </section>

          <div className="sidebar-footer">
            <div className="status-line tf2-status"><span className="status-icon"><Icon name="shield" size={15} /></span><span>{tf2Status}</span></div>
          </div>
        </aside>

        <section className="content tf2-content">
          <div className="content-topline tf2-topline">
            <div className="game-identity"><span className="game-kicker">Modo Mercenarios</span><div className="game-title-row"><h1>Team Fortress 2</h1><span className="web-badge tf2-badge">9 CLASES</span></div></div>
            <div className="topline-actions">
              <button type="button" className="generate-image-button tf2-image-button" onClick={generateTf2TeamImage} disabled={!tf2Picks.some((pick) => pick.mercenary)}><Icon name="download" size={17} /> Generar imagen</button>
              <div className="match-summary tf2-summary">
                <div><small>Jugadores</small><strong>{tf2Players.length}</strong></div>
                <div><small>Fijados</small><strong>{tf2Picks.filter((pick) => pick.locked).length}</strong></div>
                <div><small>Repetidos</small><strong>{tf2AvoidRepeated ? 'No' : 'Sí'}</strong></div>
              </div>
            </div>
          </div>
          <div className="team-stage tf2-stage">
            <div className="stage-grid" />
            <div className={`team-grid tf2-team-grid cards-${tf2Players.length}`} style={{ '--cards': tf2Players.length } as CSSProperties}>
              {tf2Players.map((player, index) => {
                const pick = tf2Picks[index]
                const mercenary = pick?.mercenary
                const profile = profiles.find((item) => item.id === player.profileId)
                const generationClass = tf2GenerationRevision % 2 === 0 ? 'generation-a' : 'generation-b'
                return (
                  <article className={`hero-card tf2-card ${mercenary?.group ?? ''} ${generationClass} ${pick?.locked ? 'is-locked' : ''} ${tf2RerollingIndex === index ? 'is-rerolling' : ''}`} style={{ '--delay': `${index * 45}ms`, '--tf2-accent': mercenary ? tf2GroupColors[mercenary.group] : '#e8a45b' } as CSSProperties} key={player.id}>
                    <span className="card-corner top" /><span className="card-corner bottom" /><div className="card-shine" />
                    <div className="card-player"><span className="player-index">{String(index + 1).padStart(2, '0')}</span><span>{player.name || `Jugador ${index + 1}`}</span>{profile && <span className="profile-tag">{profile.name.charAt(0).toUpperCase()}</span>}{player.blocked.length > 0 && <span className="filter-count">{player.blocked.length}</span>}{pick?.locked && <span className="mini-lock"><Icon name="lock" size={12} /></span>}</div>
                    <div className="portrait tf2-portrait">
                      <div className="portrait-grid" /><div className="portrait-fallback"><Icon name="gamepad" size={48} /></div>
                      {mercenary ? <img className="hero-image" src={asset(mercenary.portrait)} alt={mercenary.name} decoding="async" draggable={false} onLoad={handleImageLoad} onError={handleImageError} /> : <div className="portrait-loading"><span /><span /><span /></div>}
                      <div className="portrait-vignette" /><div className="tf2-class-stamp" aria-hidden="true"><span>{mercenary ? tf2GroupLabels[mercenary.group] : 'TF2'}</span></div>
                    </div>
                    <div className="hero-info"><div className="hero-name-row"><h2>{mercenary?.name ?? 'Sin selección'}</h2><span className={`role-dot tf2-dot ${mercenary?.group ?? ''}`} /></div><div className={`hero-role tf2-role ${mercenary?.group ?? ''}`}>{mercenary ? tf2GroupLabels[mercenary.group] : 'Genera un equipo'}{mercenary && <><span>•</span>MERCENARIO</>}</div></div>
                    <div className="card-actions tf2-card-actions">
                      <button type="button" onClick={() => rerollTf2(index)} disabled={!mercenary || pick?.locked || tf2RerollingIndex !== null} data-tooltip="Cambiar clase"><Icon name="reroll" size={18} /></button>
                      <button type="button" onClick={() => openTf2Filter(index)} className={player.blocked.length > 0 ? 'active-filter' : ''} data-tooltip="Filtro"><Icon name="filter" size={18} /></button>
                      <button type="button" onClick={() => toggleTf2Lock(index)} disabled={!mercenary} className={pick?.locked ? 'active-lock' : ''} data-tooltip={pick?.locked ? 'Liberar' : 'Fijar'}><Icon name={pick?.locked ? 'unlock' : 'lock'} size={17} /></button>
                    </div>
                    <div className="loadout tf2-loadout"><div><small>{profile ? 'Perfil' : 'Selección'}</small><span>{profile?.name ?? (mercenary ? 'Catálogo oficial TF2' : 'Pendiente')}</span></div><span className="loadout-status"><Icon name="check" size={13} /></span></div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      </main>
    )
  }

  function renderTf2Roulette() {
    const selected = new Set(tf2RouletteSelectedKeys)
    const selectedVisible = tf2RouletteVisibleClasses.filter((item) => selected.has(item.key)).length
    const wheelCount = tf2RouletteBuiltClasses.length
    const imageSize = wheelCount <= 12 ? 42 : wheelCount <= 24 ? 32 : 24
    const imageRadius = wheelCount <= 12 ? 126 : wheelCount <= 24 ? 137 : 145
    const buildStatus = tf2RouletteDirty
      ? tf2RoulettePool.length > 0 ? 'Cambios sin construir' : 'Sin participantes'
      : `${tf2RouletteEntries.length} casillas listas`

    return (
      <main className="utility-page roulette-page roulette-maker-v2 unified-game-roulette tf2-unified-roulette" style={{ '--yellow': '#e8a45b', '--cyan': '#e8a45b' } as CSSProperties}>
        <header className="roulette-heading">
          <div><span className="eyebrow">Modo independiente · Team Fortress 2</span><h1>Ruleta Maker</h1><p>La misma rueda de Overwatch, adaptada al catálogo cerrado de nueve clases de TF2.</p></div>
          <div className="roulette-heading-stats"><span><small>CLASES</small><b>{tf2RoulettePool.length}</b></span><span><small>CASILLAS</small><b>{tf2RouletteTotalSlots}/64</b></span><span className={tf2RouletteDirty ? 'pending' : 'ready'}><small>ESTADO</small><b>{tf2RouletteDirty ? 'EDITANDO' : 'LISTA'}</b></span></div>
        </header>

        <section className="roulette-maker-layout">
          <section className="roulette-builder-panel">
            <header className="roulette-section-heading"><div><span className="eyebrow">01 · Configuración</span><h2>Participantes y probabilidad</h2></div><span className={`roulette-build-badge ${tf2RouletteDirty ? 'pending' : 'ready'}`}>{buildStatus}</span></header>

            <div className="roulette-toolbar roulette-toolbar-v2">
              <label className="roulette-search"><Icon name="filter" size={16} /><input type="search" value={tf2RouletteSearch} onChange={(event: ChangeEvent<HTMLInputElement>) => setTf2RouletteSearch(event.target.value)} placeholder="Buscar clase…" /></label>
              <div className="roulette-role-toggles tf2-unified-role-tabs" role="group" aria-label="Grupo visible">
                <button type="button" className={tf2RouletteGroup === 'all' ? 'active' : ''} onClick={() => setTf2RouletteGroup('all')}>Todas</button>
                {tf2Groups.map((group) => <button type="button" className={tf2RouletteGroup === group ? 'active' : ''} style={{ '--role-color': tf2GroupColors[group] } as CSSProperties} onClick={() => setTf2RouletteGroup(group)} key={group}><i className="roulette-generic-role-mark" />{tf2GroupLabels[group]}</button>)}
              </div>
              <div className="roulette-toolbar-actions"><button type="button" onClick={() => { const next = [...new Set([...tf2RouletteSelectedKeys, ...tf2RouletteVisibleClasses.map((item) => item.key)])]; setTf2RouletteSelectedKeys(next); setTf2RouletteWeights((current) => ({ ...Object.fromEntries(next.map((key) => [key, current[key] ?? 1])) })); markTf2RouletteDirty('Clases visibles añadidas') }} disabled={!tf2RouletteVisibleClasses.length}>Añadir visibles</button><button type="button" onClick={() => { const visible = new Set(tf2RouletteVisibleClasses.map((item) => item.key)); const next = tf2RouletteSelectedKeys.filter((key) => !visible.has(key)); setTf2RouletteSelectedKeys(next); markTf2RouletteDirty('Clases visibles retiradas') }} disabled={!selectedVisible}>Quitar visibles</button></div>
            </div>

            <div className="roulette-bulk-actions"><button type="button" onClick={selectAllTf2Roulette} disabled={tf2RouletteSpinning}><Icon name="check" size={14} /> Seleccionar todas</button><button type="button" onClick={() => { setTf2RouletteWeights(Object.fromEntries(tf2RouletteSelectedKeys.map((key) => [key, 1]))); markTf2RouletteDirty('Pesos igualados') }} disabled={!tf2RoulettePool.length || tf2RouletteSpinning}><Icon name="reset" size={14} /> Igualar pesos</button><button type="button" className="danger" onClick={clearTf2Roulette} disabled={!tf2RouletteSelectedKeys.length || tf2RouletteSpinning}><Icon name="trash" size={14} /> Vaciar</button></div>

            <div className="roulette-weight-grid">
              {tf2RouletteVisibleClasses.map((item) => {
                const chosen = selected.has(item.key)
                const weight = tf2RouletteWeight(item.key)
                const probability = tf2RouletteProbability(item.key)
                const roleColor = tf2GroupColors[item.group]
                return <article className={`roulette-weight-card ${chosen ? 'selected' : ''}`} style={{ '--role-color': roleColor } as CSSProperties} key={item.key}>
                  <button type="button" className="roulette-hero-pick" onClick={() => !chosen && toggleTf2RouletteClass(item.key)} disabled={tf2RouletteSpinning}><img src={asset(item.portrait)} alt="" loading="lazy" decoding="async" /><span className="roulette-weight-copy"><strong>{item.name}</strong><small>{tf2GroupLabels[item.group]}</small></span><i className="roulette-role-watermark roulette-generic-role-mark" />{!chosen && <span className="roulette-add-mark"><Icon name="plus" size={17} /></span>}</button>
                  {chosen && <div className="roulette-weight-controls"><button type="button" onClick={() => changeTf2RouletteWeight(item.key, -1)} disabled={tf2RouletteSpinning || weight <= 1 || tf2RouletteTotalSlots <= 2}>−</button><span className="roulette-weight-value"><small>PESO</small><b>x{weight}</b></span><button type="button" onClick={() => changeTf2RouletteWeight(item.key, 1)} disabled={tf2RouletteSpinning || tf2RouletteTotalSlots >= 64}>+</button><span className="roulette-probability"><small>PROB.</small><b>{probability.toFixed(1)}%</b><i><em style={{ width: `${Math.min(100, probability)}%` }} /></i></span><button type="button" className="remove" onClick={() => toggleTf2RouletteClass(item.key)}>×</button></div>}
                </article>
              })}
            </div>

            <footer className="roulette-builder-footer"><div className="roulette-total-summary"><span><small>SELECCIONADAS</small><b>{tf2RoulettePool.length}</b></span><span><small>CASILLAS</small><b>{tf2RouletteTotalSlots}</b></span><p>Máximo 64. Una única clase usa automáticamente dos casillas.</p></div><button type="button" className="roulette-build-button" onClick={() => buildTf2Roulette(true)} disabled={tf2RouletteSpinning || !tf2RoulettePool.length || tf2RouletteTotalSlots > 64}><Icon name="roulette" size={20} /><span>CONSTRUIR RULETA</span></button></footer>
          </section>

          <aside className="roulette-wheel-panel">
            <header className="roulette-section-heading compact"><div><span className="eyebrow">02 · Resultado</span><h2>Rueda construida</h2></div><span className="roulette-game-chip">TF2</span></header>
            <div className={`roulette-wheel-stage ${tf2RouletteSpinning ? 'spinning' : ''} ${tf2RouletteDirty ? 'dirty' : ''}`}><span className="roulette-wheel-pointer" aria-hidden="true"><i /></span>{wheelCount >= 2 ? <div className="roulette-wheel-shell"><svg className="roulette-wheel-svg" viewBox="0 0 400 400"><defs>{tf2RouletteBuiltClasses.map((item, index) => { const angle = -90 + (index + .5) * 360 / wheelCount; const point = roulettePoint(imageRadius, angle); return <clipPath id={`tf2-unified-slot-${index}`} key={`clip-${item.key}-${index}`}><circle cx={point.x} cy={point.y} r={imageSize / 2} /></clipPath> })}</defs><g ref={tf2RouletteRotorRef} className="roulette-wheel-rotor" style={{ transform: `rotate(${tf2RouletteRotation}deg)` }}>{tf2RouletteBuiltClasses.map((item, index) => <path d={rouletteSectorPath(index, wheelCount)} fill={tf2GroupColors[item.group]} className="roulette-wheel-sector" key={`sector-${item.key}-${index}`} />)}{tf2RouletteBuiltClasses.map((item, index) => { const angle = -90 + (index + .5) * 360 / wheelCount; const point = roulettePoint(imageRadius, angle); return <g key={`portrait-${item.key}-${index}`}><circle cx={point.x} cy={point.y} r={imageSize / 2 + 2} fill="#061722" stroke="rgba(255,255,255,.72)" strokeWidth="1.5" /><image href={asset(item.portrait)} x={point.x - imageSize / 2} y={point.y - imageSize / 2} width={imageSize} height={imageSize} preserveAspectRatio="xMidYMid slice" clipPath={`url(#tf2-unified-slot-${index})`} /></g> })}<circle cx="200" cy="200" r="185" fill="none" stroke="rgba(211,241,255,.78)" strokeWidth="3" /></g></svg><div className="roulette-wheel-hub" style={{ '--role-color': tf2RouletteWinner ? tf2GroupColors[tf2RouletteWinner.group] : '#e8a45b' } as CSSProperties}>{tf2RouletteWinner ? <><img src={asset(tf2RouletteWinner.portrait)} alt="" /><span><small>GANADOR</small><strong>{tf2RouletteWinner.name}</strong></span></> : <><Icon name="roulette" size={28} /><span><small>RULETA</small><strong>{wheelCount} casillas</strong></span></>}</div></div> : <div className="roulette-wheel-placeholder"><span><Icon name="roulette" size={50} /></span><strong>Construye la ruleta</strong><p>Ajusta pesos y crea la rueda para ver las casillas reales.</p></div>}</div>
            <div className="roulette-winner-strip">{tf2RouletteWinner ? <><div className="roulette-winner-portrait" style={{ '--role-color': tf2GroupColors[tf2RouletteWinner.group] } as CSSProperties}><img src={asset(tf2RouletteWinner.portrait)} alt="" /></div><div><small>GANADOR DEL ÚLTIMO GIRO</small><strong>{tf2RouletteWinner.name}</strong><span>{tf2GroupLabels[tf2RouletteWinner.group]} · Peso x{tf2RouletteWeight(tf2RouletteWinner.key)} · {tf2RouletteProbability(tf2RouletteWinner.key).toFixed(1)}%</span></div></> : <><Icon name={tf2RouletteDirty ? 'warning' : 'check'} size={20} /><div><small>ESTADO</small><strong>{tf2RouletteSpinning ? 'Girando…' : buildStatus}</strong><span>{tf2RouletteDirty ? 'Construye para aplicar los cambios.' : 'La rueda está lista para girar.'}</span></div></>}</div>
            <button type="button" className={`roulette-spin-button ${tf2RouletteSpinning ? 'spinning' : ''}`} onClick={spinTf2Roulette} disabled={tf2RouletteSpinning || !tf2RoulettePool.length}><Icon name="roulette" size={24} /><span>{tf2RouletteSpinning ? 'GIRANDO…' : tf2RouletteDirty ? 'CONSTRUIR Y GIRAR' : 'GIRAR RULETA'}</span></button>
            <small className="roulette-autosave"><Icon name="check" size={13} /> Selección y pesos de TF2 se guardan por separado.</small>
            {!!tf2RouletteEntries.length && <details className="roulette-slot-list"><summary><span>Ver casillas construidas</span><b>{tf2RouletteEntries.length}</b></summary><div>{tf2RouletteBuiltClasses.map((item, index) => <span key={`${item.key}-${index}`} style={{ '--role-color': tf2GroupColors[item.group] } as CSSProperties}><i>{index + 1}</i><img src={asset(item.portrait)} alt="" /><strong>{item.name}</strong></span>)}</div></details>}
          </aside>
        </section>

        <div className="principal-generate-dock tf2-principal-generate-dock">
          <button type="button" className={`generate principal-generate-action tf2-generate ${tf2Generating ? 'generating' : ''}`} onClick={generateTf2Team} disabled={tf2Generating || tf2RerollingIndex !== null}>
            <span className="generate-glow" /><Icon name={tf2Generating ? 'refresh' : 'spark'} size={19} /><span>{tf2Generating ? 'Reuniendo…' : 'Generar equipo'}</span>
          </button>
        </div>
      </main>
    )
  }

  function renderPrincipal() {
    return (
      <main className="workspace">
        <aside className={`sidebar ${mobileConfigOpen ? 'mobile-config-open' : 'mobile-config-closed'}`}>
          <div className="sidebar-head">
            <div><span className="eyebrow">Preparar partida</span><strong>Configuración</strong></div>
            <span className="live-dot"><span /> LOCAL</span>
            <button type="button" className="mobile-config-toggle" onClick={() => { setMobileConfigOpen((value) => !value); playSound('click') }} aria-expanded={mobileConfigOpen}>
              <Icon name={mobileConfigOpen ? 'close' : 'settings'} size={15} />
              <span>{mobileConfigOpen ? 'Ocultar' : 'Editar'}</span>
            </button>
          </div>

          {mobileConfigOpen && (
            <div className="mobile-config-tabs" role="tablist" aria-label="Apartados de configuración">
              <button type="button" className={mobileConfigTab === 'profile' ? 'active' : ''} onClick={() => { setMobileConfigTab('profile'); playSound('click') }} role="tab" aria-selected={mobileConfigTab === 'profile'}><Icon name="profile" size={14} /> Perfil</button>
              <button type="button" className={mobileConfigTab === 'squad' ? 'active' : ''} onClick={() => { setMobileConfigTab('squad'); playSound('click') }} role="tab" aria-selected={mobileConfigTab === 'squad'}><Icon name="users" size={14} /> Escuadra</button>
              <button type="button" className={mobileConfigTab === 'rules' ? 'active' : ''} onClick={() => { setMobileConfigTab('rules'); playSound('click') }} role="tab" aria-selected={mobileConfigTab === 'rules'}><Icon name="settings" size={14} /> Reglas</button>
            </div>
          )}

          <section className={`side-panel profile-panel mobile-config-section ${mobileConfigTab === 'profile' ? 'mobile-active' : ''}`}>
            <div className="panel-title-row">
              <div><label>Modo de perfiles</label><small>{profileModeInfo.description}</small></div>
              <Icon name="profile" size={17} />
            </div>
            <select value={profileMode} onChange={(event: ChangeEvent<HTMLSelectElement>) => { setProfileMode(event.target.value as ProfileMode); playSound('profileSelect') }}>
              {profileModes.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
            </select>
          </section>

          <section className={`side-panel squad-panel mobile-config-section ${mobileConfigTab === 'squad' ? 'mobile-active' : ''}`}>
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

          <section className={`side-panel rules mobile-config-section ${mobileConfigTab === 'rules' ? 'mobile-active' : ''}`}>
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
          </div>
        </aside>

        <section className="content">
          <div className="content-topline">
            <div className="game-identity">
              <span className="game-kicker">Selector principal</span>
              <div className="game-title-row"><h1>Overwatch</h1><span className="web-badge">WEB BETA</span></div>
            </div>
            <div className="topline-actions">
              <button type="button" className="generate-image-button" onClick={generateTeamImage} disabled={!picks.some((pick) => pick.hero)}>
                <Icon name="download" size={17} /> Generar imagen
              </button>
              <div className="match-summary">
                <div><small>Composición</small><strong>{compositionText}</strong></div>
                <div><small>Fijados</small><strong>{picks.filter((pick) => pick.locked).length}</strong></div>
                <div><small>Perfil</small><strong>{profileModeInfo.name}</strong></div>
              </div>
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
                  const roleWatermarkStyle = visibleRole
                    ? ({ '--role-mask': `url("${asset(`assets/roles/${visibleRole}.png`)}")` } as CSSProperties)
                    : undefined
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
                          <img key={`role-${visibleRole}`} className="role-only-image" src={asset(`assets/roles/${visibleRole}.png`)} alt={roleLabels[visibleRole]} decoding="async" draggable={false} onLoad={handleImageLoad} onError={handleImageError} />
                        ) : hero ? (
                          <img key={hero.key} className="hero-image" src={asset(hero.portrait)} alt={hero.name} decoding="async" draggable={false} onLoad={handleImageLoad} onError={handleImageError} />
                        ) : (
                          <div className="portrait-loading"><span /><span /><span /></div>
                        )}
                        <div className="portrait-vignette" />
                        <div className="role-watermark" aria-hidden="true">
                          {visibleRole
                            ? <span className="role-watermark-icon" style={roleWatermarkStyle} />
                            : <span className="role-watermark-fallback">?</span>}
                        </div>
                      </div>

                      <div className="hero-info">
                        <div className="hero-name-row"><h2>{rolesOnly && visibleRole ? roleLabels[visibleRole] : hero?.name ?? 'Sin selección'}</h2><span className={`role-dot ${visibleRole ?? ''}`} /></div>
                        <div className={`hero-role ${visibleRole ?? ''}`}>
                          {visibleRole ? roleLabels[visibleRole] : 'Genera un equipo'}
                          {hero?.subrole && <><span>•</span>{subroleLabels[hero.subrole] ?? hero.subrole}</>}
                        </div>
                      </div>

                      <div className="card-actions four-actions">
                        <button type="button" onClick={() => reroll(index)} disabled={!hero || pick?.locked || rolesOnly || rerollingIndex !== null} data-tooltip="Reroll" aria-label={`Reroll de ${player.name}`}><Icon name="reroll" size={18} /></button>
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
                          <small>{stadium ? 'Poderes equipados' : pick.perks.length > 0 ? 'Equipamiento' : 'Perfil'}</small>
                          <span>{stadium ? `${pick.perks.length} poderes seleccionados` : pick.perks.length > 0 ? `${pick.perks.length} mejoras seleccionadas` : assignedProfile ? assignedProfile.name : 'Sin perfil asignado'}</span>
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

        <div className="principal-generate-dock overwatch-principal-generate-dock">
          <button type="button" className={`generate principal-generate-action ${generating ? 'generating' : ''}`} onClick={generateTeam} disabled={!data || generating || rerollingIndex !== null}>
            <span className="generate-glow" /><Icon name={generating ? 'refresh' : 'spark'} size={19} /><span>{generating ? 'Generando…' : 'Generar equipo'}</span>
          </button>
        </div>
      </main>
    )
  }


  function renderRoulette() {
    const selectedSet = new Set(rouletteSelectedKeys)
    const selectedVisible = rouletteVisibleHeroes.filter((hero) => selectedSet.has(hero.key)).length
    const wheelCount = rouletteBuiltHeroes.length
    const imageSize = wheelCount <= 12 ? 42 : wheelCount <= 24 ? 32 : wheelCount <= 40 ? 24 : 18
    const imageRadius = wheelCount <= 12 ? 126 : wheelCount <= 24 ? 137 : 145
    const activeRoleCount = roles.filter((role) => rouletteRolesEnabled[role]).length
    const buildStatus = rouletteDirty
      ? roulettePool.length > 0 ? 'Cambios sin construir' : 'Sin participantes'
      : `${rouletteEntries.length} casillas listas`

    return (
      <main className="utility-page roulette-page roulette-maker-v2">
        <header className="roulette-heading">
          <div>
            <span className="eyebrow">Modo independiente</span>
            <h1>Ruleta Maker</h1>
            <p>Construye la rueda por casillas. Cada peso aumenta la probabilidad real de ese héroe.</p>
          </div>
          <div className="roulette-heading-stats" aria-label="Resumen de la ruleta">
            <span><small>HÉROES</small><b>{roulettePool.length}</b></span>
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
              <label className="roulette-search"><Icon name="filter" size={16} /><input type="search" value={rouletteSearch} onChange={(event: ChangeEvent<HTMLInputElement>) => setRouletteSearch(event.target.value)} placeholder="Buscar héroe…" /></label>
              <div className="roulette-role-toggles" role="group" aria-label="Roles incluidos">
                {roles.map((role) => {
                  const roleStyle = ({ '--role-icon': `url("${asset(`assets/roles/${role}.png`)}")` } as CSSProperties)
                  return (
                    <button type="button" className={`${role} ${rouletteRolesEnabled[role] ? 'active' : ''}`} onClick={() => toggleRouletteRole(role)} aria-pressed={rouletteRolesEnabled[role]} key={role}>
                      <i style={roleStyle} aria-hidden="true" />{roleLabels[role]}
                    </button>
                  )
                })}
              </div>
              <div className="roulette-toolbar-actions">
                <button type="button" onClick={selectRouletteVisible} disabled={rouletteVisibleHeroes.length === 0}>Añadir visibles</button>
                <button type="button" onClick={clearRouletteVisible} disabled={selectedVisible === 0}>Quitar visibles</button>
              </div>
            </div>

            <div className="roulette-bulk-actions">
              <button type="button" onClick={selectAllRouletteHeroes} disabled={activeRoleCount === 0 || rouletteSpinning}><Icon name="check" size={14} /> Seleccionar roles activos</button>
              <button type="button" onClick={equalizeRouletteWeights} disabled={roulettePool.length === 0 || rouletteSpinning}><Icon name="reset" size={14} /> Igualar pesos</button>
              <button type="button" className="danger" onClick={clearRouletteHeroes} disabled={rouletteSelectedKeys.length === 0 || rouletteSpinning}><Icon name="trash" size={14} /> Vaciar</button>
            </div>

            {activeRoleCount === 0 && <div className="roulette-inline-warning"><Icon name="warning" size={16} /> Activa al menos un rol para mostrar participantes.</div>}

            <div className="roulette-weight-grid">
              {rouletteVisibleHeroes.map((hero) => {
                const selected = selectedSet.has(hero.key)
                const weight = rouletteWeight(hero.key)
                const probability = rouletteProbability(hero.key)
                const roleStyle = ({ '--role-icon': `url("${asset(`assets/roles/${hero.role}.png`)}")` } as CSSProperties)
                return (
                  <article className={`roulette-weight-card ${hero.role} ${selected ? 'selected' : ''}`} key={hero.key}>
                    <button type="button" className="roulette-hero-pick" onClick={() => !selected && toggleRouletteHero(hero.key)} disabled={rouletteSpinning} aria-label={selected ? `${hero.name} seleccionado` : `Añadir a ${hero.name}`}>
                      <img src={asset(hero.portrait)} alt="" loading="lazy" decoding="async" onLoad={handleImageLoad} onError={handleImageError} />
                      <span className="roulette-weight-copy"><strong>{hero.name}</strong><small>{roleLabels[hero.role]} · {subroleLabels[hero.subrole] ?? hero.subrole}</small></span>
                      <i className="roulette-role-watermark" style={roleStyle} aria-hidden="true" />
                      {!selected && <span className="roulette-add-mark"><Icon name="plus" size={17} /></span>}
                    </button>

                    {selected && (
                      <div className="roulette-weight-controls">
                        <button type="button" onClick={() => changeRouletteWeight(hero.key, -1)} disabled={rouletteSpinning || rouletteTotalSlots <= 2 || weight <= 1} aria-label={`Reducir peso de ${hero.name}`}>−</button>
                        <span className="roulette-weight-value"><small>PESO</small><b>x{weight}</b></span>
                        <button type="button" onClick={() => changeRouletteWeight(hero.key, 1)} disabled={rouletteSpinning || rouletteTotalSlots >= 64} aria-label={`Aumentar peso de ${hero.name}`}>+</button>
                        <span className="roulette-probability"><small>PROB.</small><b>{probability.toFixed(1)}%</b><i><em style={{ width: `${Math.min(100, probability)}%` }} /></i></span>
                        <button type="button" className="remove" onClick={() => toggleRouletteHero(hero.key)} disabled={rouletteSpinning} aria-label={`Quitar a ${hero.name}`}><Icon name="close" size={15} /></button>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>

            {rouletteVisibleHeroes.length === 0 && activeRoleCount > 0 && (
              <div className="roulette-empty-list"><Icon name="filter" size={28} /><strong>No hay coincidencias</strong><span>Prueba otro nombre o activa más roles.</span></div>
            )}

            <footer className="roulette-builder-footer">
              <div className="roulette-total-summary">
                <span><small>SELECCIONADOS</small><b>{roulettePool.length}</b></span>
                <span><small>CASILLAS</small><b>{rouletteTotalSlots}</b></span>
                <p>Máximo 64. Un héroe único usa automáticamente dos casillas.</p>
              </div>
              <button type="button" className="roulette-build-button" onClick={() => buildRoulette(true)} disabled={rouletteSpinning || roulettePool.length === 0 || rouletteTotalSlots > 64}>
                <Icon name="roulette" size={20} /><span>CONSTRUIR RULETA</span>
              </button>
            </footer>
          </section>

          <aside className="roulette-wheel-panel">
            <header className="roulette-section-heading compact">
              <div><span className="eyebrow">02 · Resultado</span><h2>Rueda construida</h2></div>
              <button type="button" className="roulette-image-button" onClick={generateRouletteImage} disabled={!rouletteWinner || rouletteSpinning}><Icon name="download" size={15} /> Imagen</button>
            </header>

            <div className={`roulette-wheel-stage ${rouletteSpinning ? 'spinning' : ''} ${rouletteDirty ? 'dirty' : ''}`}>
              <span className="roulette-wheel-pointer" aria-hidden="true"><i /></span>
              {wheelCount >= 2 ? (
                <div className="roulette-wheel-shell">
                  <svg className="roulette-wheel-svg" viewBox="0 0 400 400" role="img" aria-label={`Ruleta de ${wheelCount} casillas`}>
                    <defs>
                      {rouletteBuiltHeroes.map((hero, index) => {
                        const angle = -90 + (index + 0.5) * (360 / wheelCount)
                        const point = roulettePoint(imageRadius, angle)
                        return <clipPath id={`roulette-slot-clip-${index}`} key={`clip-${hero.key}-${index}`}><circle cx={point.x} cy={point.y} r={imageSize / 2} /></clipPath>
                      })}
                      <filter id="roulette-wheel-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#000" floodOpacity=".55" /></filter>
                    </defs>
                    <g ref={rouletteRotorRef} className="roulette-wheel-rotor" style={{ transform: `rotate(${rouletteRotation}deg)` }}>
                      {rouletteBuiltHeroes.map((hero, index) => (
                        <path d={rouletteSectorPath(index, wheelCount)} fill={rouletteRoleColors[hero.role]} className={`roulette-wheel-sector ${hero.role}`} key={`sector-${hero.key}-${index}`} />
                      ))}
                      {rouletteBuiltHeroes.map((hero, index) => {
                        const angle = -90 + (index + 0.5) * (360 / wheelCount)
                        const point = roulettePoint(imageRadius, angle)
                        return (
                          <g key={`portrait-${hero.key}-${index}`}>
                            <circle cx={point.x} cy={point.y} r={imageSize / 2 + 2} fill="#061722" stroke="rgba(255,255,255,.72)" strokeWidth="1.5" />
                            <image href={asset(hero.portrait)} x={point.x - imageSize / 2} y={point.y - imageSize / 2} width={imageSize} height={imageSize} preserveAspectRatio="xMidYMid slice" clipPath={`url(#roulette-slot-clip-${index})`} />
                          </g>
                        )
                      })}
                      <circle cx="200" cy="200" r="185" fill="none" stroke="rgba(211,241,255,.78)" strokeWidth="3" />
                    </g>
                  </svg>
                  <div className={`roulette-wheel-hub ${rouletteWinner ? rouletteWinner.role : ''}`}>
                    {rouletteWinner ? (
                      <><img src={asset(rouletteWinner.portrait)} alt="" /><span><small>GANADOR</small><strong>{rouletteWinner.name}</strong></span></>
                    ) : (
                      <><Icon name="roulette" size={28} /><span><small>RULETA</small><strong>{wheelCount} casillas</strong></span></>
                    )}
                  </div>
                </div>
              ) : (
                <div className="roulette-wheel-placeholder"><span><Icon name="roulette" size={50} /></span><strong>Construye la ruleta</strong><p>Ajusta pesos y crea la rueda para ver las casillas reales.</p></div>
              )}
            </div>

            <div className="roulette-winner-strip">
              {rouletteWinner ? (
                <>
                  <div className={`roulette-winner-portrait ${rouletteWinner.role}`}><img src={asset(rouletteWinner.portrait)} alt="" /></div>
                  <div><small>GANADOR DEL ÚLTIMO GIRO</small><strong>{rouletteWinner.name}</strong><span>{roleLabels[rouletteWinner.role]} · Peso x{rouletteWeight(rouletteWinner.key)} · {rouletteProbability(rouletteWinner.key).toFixed(1)}%</span></div>
                </>
              ) : (
                <><Icon name={rouletteDirty ? 'warning' : 'check'} size={20} /><div><small>ESTADO</small><strong>{rouletteSpinning ? 'Girando…' : buildStatus}</strong><span>{rouletteDirty ? 'Construye para aplicar los cambios.' : 'La rueda está lista para girar.'}</span></div></>
              )}
            </div>

            <button type="button" className={`roulette-spin-button ${rouletteSpinning ? 'spinning' : ''}`} onClick={spinRoulette} disabled={rouletteSpinning || roulettePool.length === 0}>
              <Icon name="roulette" size={24} />
              <span>{rouletteSpinning ? 'GIRANDO…' : rouletteDirty ? 'CONSTRUIR Y GIRAR' : 'GIRAR RULETA'}</span>
            </button>

            <small className="roulette-autosave"><Icon name="check" size={13} /> Selección, roles y pesos se guardan en este navegador.</small>

            {rouletteEntries.length > 0 && (
              <details className="roulette-slot-list">
                <summary><span>Ver casillas construidas</span><b>{rouletteEntries.length}</b></summary>
                <div>
                  {rouletteBuiltHeroes.map((hero, index) => (
                    <span className={hero.role} key={`${hero.key}-slot-${index}`}><i>{index + 1}</i><img src={asset(hero.portrait)} alt="" /><strong>{hero.name}</strong></span>
                  ))}
                </div>
              </details>
            )}
          </aside>
        </section>
      </main>
    )
  }

  function profileMarkedCount(profile: UserProfile) {
    return profileBuckets.reduce((sum, bucket) => sum + profile.heroes[bucket].length, 0)
  }

  function profileAssignedCount(profileId: string) {
    return players.filter((player) => player.profileId === profileId).length
      + tf2Players.filter((player) => player.profileId === profileId).length
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

  function renderProfiles() {
    const totalHeroes = data?.heroes.length ?? 0
    const markedHeroes = currentProfile ? profileMarkedCount(currentProfile) : 0
    const assignedPlayers = currentProfile ? profileAssignedCount(currentProfile.id) : 0

    return (
      <main className="utility-page profiles-simple-page">
        <header className="profiles-simple-heading">
          <div>
            <span className="eyebrow">Perfiles locales</span>
            <h1>Perfiles</h1>
          </div>
          <button type="button" className="primary" onClick={createProfile}><Icon name="plus" size={16} /> Nuevo perfil</button>
        </header>

        {profiles.length === 0 ? (
          <section className="profiles-simple-empty">
            <Icon name="profile" size={42} />
            <h2>Crea tu primer perfil</h2>
            <p>Marca tus héroes y úsalo en una o varias fichas.</p>
            <button type="button" className="primary" onClick={createProfile}><Icon name="plus" size={16} /> Crear perfil</button>
          </section>
        ) : (
          <>
            <section className="profiles-simple-toolbar">
              <label>
                <span>Perfil</span>
                <select value={currentProfileId} onChange={(event: ChangeEvent<HTMLSelectElement>) => { setCurrentProfileId(event.target.value); playSound('profileSelect') }}>
                  {profiles.map((profile) => <option value={profile.id} key={profile.id}>{profile.name}</option>)}
                </select>
              </label>

              {currentProfile && (
                <>
                  <label className="profile-name-field">
                    <span>Nombre</span>
                    <input value={currentProfile.name} onChange={(event: ChangeEvent<HTMLInputElement>) => renameCurrentProfile(event.target.value)} maxLength={28} />
                  </label>
                  <div className="profiles-simple-count"><b>{markedHeroes}</b><span>de {totalHeroes || '—'} clasificados</span></div>
                  <div className="profiles-simple-actions">
                    <button type="button" onClick={duplicateCurrentProfile}><Icon name="plus" size={15} /> Duplicar</button>
                    <button type="button" className="danger" onClick={deleteCurrentProfile}><Icon name="trash" size={15} /> Eliminar</button>
                  </div>
                </>
              )}
            </section>

            {currentProfile && (
              <section className="profiles-simple-editor">
                <nav className="profiles-simple-tabs" aria-label="Secciones del perfil">
                  <button type="button" className={profileTab === 'heroes' ? 'active' : ''} onClick={() => setProfileTab('heroes')}>
                    <Icon name="gamepad" size={16} /> Héroes
                  </button>
                  <button type="button" className={profileTab === 'players' ? 'active' : ''} onClick={() => setProfileTab('players')}>
                    <Icon name="users" size={16} /> Jugadores {assignedPlayers > 0 && <b>{assignedPlayers}</b>}
                  </button>
                  <button type="button" className={profileTab === 'mode' ? 'active' : ''} onClick={() => setProfileTab('mode')}>
                    <Icon name="settings" size={16} /> Reglas
                  </button>
                </nav>

                {profileTab === 'heroes' && (
                  <div className="profiles-simple-section">
                    <div className="profiles-hero-toolbar">
                      <div className="profile-search">
                        <Icon name="filter" size={16} />
                        <input value={profileSearch} onChange={(event: ChangeEvent<HTMLInputElement>) => setProfileSearch(event.target.value)} placeholder="Buscar héroe…" />
                      </div>
                      <div className="role-filter-tabs">
                        <button type="button" className={profileRole === 'all' ? 'active' : ''} onClick={() => setProfileRole('all')}>Todos</button>
                        {roles.map((role) => (
                          <button type="button" className={`${role} ${profileRole === role ? 'active' : ''}`} onClick={() => setProfileRole(role)} key={role}>{roleLabels[role]}</button>
                        ))}
                      </div>
                    </div>

                    <div className="profiles-simple-hint">
                      <span>Elige una categoría por héroe. “Sin clasificar” no modifica sus probabilidades.</span>
                      {markedHeroes > 0 && <button type="button" onClick={clearCurrentProfile}><Icon name="reset" size={14} /> Reiniciar</button>}
                    </div>

                    <div className="profiles-simple-grid">
                      {classifiedHeroes.map((hero) => {
                        const bucket = heroBucket(currentProfile, hero.key)
                        return (
                          <article className={`profiles-simple-hero ${hero.role} ${bucket ?? 'unmarked'}`} key={hero.key}>
                            <img src={asset(hero.portrait)} alt="" loading="lazy" decoding="async" />
                            <div>
                              <strong>{hero.name}</strong>
                              <small>{roleLabels[hero.role]}</small>
                            </div>
                            <select
                              value={bucket ?? ''}
                              onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                                setHeroBucket(hero.key, event.target.value as ProfileBucket | '')
                                playSound('profileClassify')
                              }}
                              aria-label={`Clasificación de ${hero.name}`}
                            >
                              <option value="">Sin clasificar</option>
                              {profileBuckets.map((item) => <option value={item} key={item}>{bucketLabels[item]}</option>)}
                            </select>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                )}

                {profileTab === 'players' && (
                  <div className="profiles-simple-section">
                    <header className="profiles-section-title">
                      <div><h2>Asignar a jugadores</h2><p>Pulsa una ficha para activar o quitar este perfil.</p></div>
                    </header>
                    <div className="profiles-game-assignment">
                      <div className="profiles-game-label"><span className="settings-game-dot" style={{ '--module-accent': '#f5a623' } as CSSProperties} /><strong>Overwatch</strong><small>{players.length} fichas</small></div>
                      <div className="profiles-player-list">
                        {players.map((player, index) => {
                          const assigned = player.profileId === currentProfile.id
                          const otherProfile = profiles.find((profile) => profile.id === player.profileId)
                          return (
                            <button type="button" className={assigned ? 'assigned' : ''} onClick={() => assignPlayerProfile(index, assigned ? '' : currentProfile.id)} key={player.id}>
                              <span className="player-number">{String(index + 1).padStart(2, '0')}</span>
                              <span><strong>{player.name || `Jugador ${index + 1}`}</strong><small>{assigned ? currentProfile.name : otherProfile ? `Usa ${otherProfile.name}` : 'Sin perfil'}</small></span>
                              <Icon name={assigned ? 'check' : 'profile'} size={18} />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div className="profiles-game-assignment tf2-assignment">
                      <div className="profiles-game-label"><span className="settings-game-dot" style={{ '--module-accent': '#e8a45b' } as CSSProperties} /><strong>Team Fortress 2</strong><small>{tf2Players.length} fichas</small></div>
                      <div className="profiles-player-list">
                        {tf2Players.map((player, index) => {
                          const assigned = player.profileId === currentProfile.id
                          const otherProfile = profiles.find((profile) => profile.id === player.profileId)
                          return (
                            <button type="button" className={assigned ? 'assigned' : ''} onClick={() => tf2AssignPlayerProfile(index, assigned ? '' : currentProfile.id)} key={player.id}>
                              <span className="player-number">{String(index + 1).padStart(2, '0')}</span>
                              <span><strong>{player.name || `Jugador ${index + 1}`}</strong><small>{assigned ? currentProfile.name : otherProfile ? `Usa ${otherProfile.name}` : 'Sin perfil'}</small></span>
                              <Icon name={assigned ? 'check' : 'profile'} size={18} />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {profileTab === 'mode' && (
                  <div className="profiles-simple-section">
                    <header className="profiles-section-title">
                      <div><h2>Reglas del perfil</h2><p>Decide cómo se usan las categorías cuando generas un equipo.</p></div>
                    </header>
                    <div className="profiles-mode-list">
                      {profileModes.map((mode) => (
                        <button type="button" className={profileMode === mode.id ? 'active' : ''} onClick={() => { setProfileMode(mode.id); playSound('profileSelect') }} aria-pressed={profileMode === mode.id} key={mode.id}>
                          <span className="mode-radio"><i /></span>
                          <span><strong>{mode.name}</strong><small>{mode.description}</small></span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    )
  }

  function renderMore() {
    const storedUsage = localDataUsage()
    const heroCount = data?.heroes.length ?? 0
    const activeModule = gameModules.find((game) => game.id === activeGame)
    const activeCatalogLabel = activeGame === 'overwatch' ? `${heroCount} héroes` : activeModule?.catalogLabel ?? 'Catálogo local'
    const settingsTabs: Array<{ id: SettingsTab; label: string; icon: IconName; description: string }> = [
      { id: 'general', label: t('tab_general'), icon: 'settings', description: t('tab_general_desc') },
      { id: 'audio', label: t('tab_audio'), icon: 'sound', description: t('tab_audio_desc') },
      { id: 'catalogs', label: t('tab_games'), icon: 'gamepad', description: t('tab_games_desc') },
      { id: 'language', label: t('tab_language'), icon: 'language', description: t('tab_language_desc') },
      { id: 'credits', label: t('tab_credits'), icon: 'spark', description: t('tab_credits_desc') },
    ]
    const activeSettings = settingsTabs.find((tab) => tab.id === settingsTab) ?? settingsTabs[0]

    return (
      <main className="utility-page settings-page-v2 settings-tabbed-page">
        <header className="settings-heading-v2">
          <div>
            <span className="eyebrow">{t('settings_kicker')}</span>
            <h1>{t('settings_title')}</h1>
            <p>{t('settings_intro')}</p>
          </div>
          <div className="settings-status-v2" aria-label="Estado local">
            <span><small>{t('catalog_active')}</small><strong>{activeCatalogLabel}</strong></span>
            <span><small>{t('profiles')}</small><strong>{profiles.length}</strong></span>
            <span><small>{t('stored')}</small><strong>{storedUsage}</strong></span>
          </div>
        </header>

        <nav className="settings-jump-nav settings-tab-nav" aria-label="Secciones de configuración" role="tablist">
          {settingsTabs.map((tab) => (
            <button
              type="button"
              className={settingsTab === tab.id ? 'active' : ''}
              onClick={() => { setSettingsTab(tab.id); playSound('click') }}
              role="tab"
              aria-selected={settingsTab === tab.id}
              aria-controls={`settings-panel-${tab.id}`}
              key={tab.id}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <section className="settings-active-overview" aria-live="polite">
          <span className="settings-active-overview-icon"><Icon name={activeSettings.icon} size={22} /></span>
          <div><small>{t('active_section')}</small><strong>{activeSettings.label}</strong><p>{activeSettings.description}</p></div>
          <span className="settings-active-index">{String(settingsTabs.findIndex((tab) => tab.id === settingsTab) + 1).padStart(2, '0')} / {String(settingsTabs.length).padStart(2, '0')}</span>
        </section>

        <div className="settings-tab-stage">
          {settingsTab === 'general' && (
            <section className="settings-section-v2 settings-tab-panel" id="settings-panel-general" role="tabpanel">
              <header className="settings-section-heading-v2">
                <span className="settings-section-icon"><Icon name="settings" size={22} /></span>
                <div><small>GENERAL</small><h2>Interfaz y rendimiento</h2><p>Cambios visuales reales, sin alterar las reglas de generación de cada juego.</p></div>
              </header>
              <div className="settings-list-v2">
                <article className="setting-row-v2">
                  <span className="setting-row-icon"><Icon name="spark" size={19} /></span>
                  <div><strong>Animaciones</strong><p>Transiciones, entradas de fichas y movimiento de la ruleta.</p></div>
                  <button type="button" className={`setting-toggle-v2 ${animationsEnabled ? 'enabled' : ''}`} onClick={() => { const next = !animationsEnabled; setAnimationsEnabled(next); toggleRuleSound(next) }} aria-pressed={animationsEnabled}><span /><b>{animationsEnabled ? 'Activas' : 'Reducidas'}</b></button>
                </article>
                <article className="setting-row-v2">
                  <span className="setting-row-icon"><Icon name="details" size={19} /></span>
                  <div><strong>Mejoras compactas</strong><p>Reduce el espacio de perks, Team-Ups y equipamientos dentro de las fichas.</p></div>
                  <button type="button" className={`setting-toggle-v2 ${compactPerks ? 'enabled' : ''}`} onClick={() => { const next = !compactPerks; setCompactPerks(next); toggleRuleSound(next) }} aria-pressed={compactPerks}><span /><b>{compactPerks ? 'Compactas' : 'Completas'}</b></button>
                </article>
                <article className="setting-row-v2">
                  <span className="setting-row-icon"><Icon name="gamepad" size={19} /></span>
                  <div><strong>Vista compacta en móvil</strong><p>Acorta retratos y controles para recorrer el equipo con menos desplazamiento.</p></div>
                  <button type="button" className={`setting-toggle-v2 ${mobileCompactMode ? 'enabled' : ''}`} onClick={() => { const next = !mobileCompactMode; setMobileCompactMode(next); toggleRuleSound(next) }} aria-pressed={mobileCompactMode}><span /><b>{mobileCompactMode ? 'Activa' : 'Normal'}</b></button>
                </article>
                <article className="setting-row-v2">
                  <span className="setting-row-icon"><Icon name="shield" size={19} /></span>
                  <div><strong>Modo ligero</strong><p>Quita fondos animados, desenfoques y sombras costosas para reducir carga gráfica.</p></div>
                  <button type="button" className={`setting-toggle-v2 ${lowPowerMode ? 'enabled' : ''}`} onClick={() => { const next = !lowPowerMode; setLowPowerMode(next); toggleRuleSound(next) }} aria-pressed={lowPowerMode}><span /><b>{lowPowerMode ? 'Activo' : 'Normal'}</b></button>
                </article>
              </div>
              <footer className="settings-section-footer-v2 settings-general-actions"><button type="button" className="settings-secondary-action" onClick={restoreRecommendedSettings}><Icon name="reset" size={15} /> Restaurar ajustes recomendados</button><button type="button" className="settings-danger-action" onClick={resetLocalData}><Icon name="trash" size={15} /> Borrar datos locales</button></footer>
            </section>
          )}

          {settingsTab === 'audio' && (
            <section className="settings-section-v2 settings-tab-panel" id="settings-panel-audio" role="tabpanel">
              <header className="settings-section-heading-v2">
                <span className="settings-section-icon"><Icon name="sound" size={22} /></span>
                <div><small>AUDIO</small><h2>Sonidos de interfaz</h2><p>El volumen se aplica a botones, generación, perfiles y ruletas de todos los juegos.</p></div>
              </header>
              <div className="settings-list-v2">
                <article className="setting-row-v2">
                  <span className="setting-row-icon"><Icon name="sound" size={19} /></span>
                  <div><strong>Audio general</strong><p>Activa o silencia todos los sonidos de OverRoll.</p></div>
                  <button type="button" className={`setting-toggle-v2 ${soundEnabled ? 'enabled' : ''}`} onClick={toggleSounds} aria-pressed={soundEnabled}><span /><b>{soundEnabled ? 'Activo' : 'Silenciado'}</b></button>
                </article>
                <article className="setting-row-v2 volume-row-v2">
                  <span className="setting-row-icon"><Icon name="sound" size={19} /></span>
                  <div><strong>Volumen</strong><p>Ajuste maestro para todos los efectos.</p></div>
                  <label className="settings-volume-v2"><input type="range" min="0" max="1" step="0.05" value={soundVolume} disabled={!soundEnabled} onChange={(event: ChangeEvent<HTMLInputElement>) => setSoundVolume(Number(event.target.value))} onPointerUp={() => playSound('click')} aria-label="Volumen de la interfaz" /><b>{Math.round(soundVolume * 100)}%</b></label>
                </article>
                <article className="setting-row-v2">
                  <span className="setting-row-icon"><Icon name="spark" size={19} /></span>
                  <div><strong>Sonido al pasar el mouse</strong><p>Está apagado por defecto para evitar ruido constante.</p></div>
                  <button type="button" className={`setting-toggle-v2 ${hoverSounds ? 'enabled' : ''}`} onClick={() => { const next = !hoverSounds; setHoverSounds(next); toggleRuleSound(next) }} aria-pressed={hoverSounds}><span /><b>{hoverSounds ? 'Activo' : 'Apagado'}</b></button>
                </article>
              </div>
              <footer className="settings-section-footer-v2"><button type="button" className="settings-primary-action" disabled={!soundEnabled} onClick={playConfirmTone}><Icon name="sound" size={15} /> Probar sonido</button></footer>
            </section>
          )}

          {settingsTab === 'catalogs' && (
            <section className="settings-section-v2 settings-tab-panel settings-catalog-panel" id="settings-panel-catalogs" role="tabpanel">
              <header className="settings-section-heading-v2">
                <span className="settings-section-icon"><Icon name="gamepad" size={22} /></span>
                <div><small>JUEGOS</small><h2>Catálogos de OverRoll</h2><p>Cada juego conserva sus reglas, límites, composición y ruleta sin mezclar su estado con los demás.</p></div>
              </header>
              <div className="settings-games-grid-v2">
                {gameModules.map((game) => {
                  const selected = game.id === activeGame
                  return (
                    <button type="button" className={`settings-game-card-v2 ${game.available ? 'available' : ''} ${selected ? 'selected-game' : ''}`} style={{ '--module-accent': game.accent } as CSSProperties} onClick={() => game.available ? activateGame(game.id) : notify(`${game.name}: ${game.status}`, 'info')} key={game.name}>
                      <span className="settings-game-icon-v3"><img src={asset(game.icon)} alt="" decoding="async" /></span>
                      <span className="settings-game-copy-v3"><strong>{game.name}</strong><small>{selected ? 'Juego activo' : game.catalogLabel}</small></span>
                      <b>{selected ? 'Activo' : 'Abrir'}</b>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {settingsTab === 'language' && (
            <section className="settings-section-v2 settings-tab-panel language-page-v1" id="settings-panel-language" role="tabpanel">
              <header className="settings-section-heading-v2">
                <span className="settings-section-icon"><Icon name="language" size={22} /></span>
                <div><small>{t('language_eyebrow')}</small><h2>{t('language_title')}</h2><p>{t('language_intro')}</p></div>
              </header>
              <div className="language-choice-v1">
                <button type="button" className={`language-auto-v1 ${localePreference === 'auto' ? 'active' : ''}`} onClick={() => { setLocalePreference('auto'); playSound('click') }} aria-pressed={localePreference === 'auto'}>
                  <span className="language-radio-v1"><i /></span>
                  <span><strong>{t('language_auto_title')}</strong><small>{t('language_auto_body')}</small><em>{t('language_detected')}: {localeName(browserLocale)}</em></span>
                  <Icon name="language" size={20} />
                </button>
                <div className="language-manual-v1">
                  <div><strong>{t('language_manual_title')}</strong><p>{t('language_manual_body')}</p></div>
                  <div className="language-grid-v1">
                    {localeChoices.map((choice) => (
                      <button type="button" className={localePreference === choice.id ? 'active' : ''} onClick={() => { setLocalePreference(choice.id); playSound('click') }} aria-pressed={localePreference === choice.id} lang={choice.id} key={choice.id}>
                        <span className="language-radio-v1"><i /></span><strong>{choice.name}</strong><small>{choice.id}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <footer className="language-status-v1"><Icon name="check" size={16} /><span><small>{t('language_active')}</small><strong>{localeName(activeLocale)}</strong><p>{t('language_saved')}</p></span></footer>
            </section>
          )}

          {settingsTab === 'credits' && (
            <section className="settings-section-v2 settings-tab-panel credits-page-v4" id="settings-panel-credits" role="tabpanel">
              <div className="credits-hero-v4">
                <div className="credits-hero-copy-v4">
                  <span className="credits-kicker-v4">{t('credits_kicker')}</span>
                  <h2>{t('credits_title')}</h2>
                  <p>{t('credits_intro')}</p>
                  <div className="credits-actions-v4">
                    <button type="button" onClick={() => navigate('principal')}><Icon name="gamepad" size={16} /> {t('credits_play')}</button>
                    <a href="https://github.com/SHAGGOS2/OverRoll" target="_blank" rel="noreferrer"><Icon name="download" size={16} /> {t('credits_project')}</a>
                  </div>
                </div>
                <a className="credits-hero-visual-v4 credits-hammond-link-v1" href={creditsSongUrl(activeLocale)} target="_blank" rel="noreferrer" title={t('credits_hammond_hint')}>
                  <img src={asset('assets/hammond_credits.gif')} alt={t('credits_hammond_alt')} />
                  <span>{creditsJoke(activeLocale)}</span>
                </a>
              </div>

              <div className="credits-story-v4">
                <article className="credits-author-v4">
                  <small>{t('credits_author_label')}</small>
                  <h3>SHAGGOS</h3>
                  <p>{t('credits_author_body')}</p>
                </article>
                <article className="credits-community-v4">
                  <small>{t('credits_community_label')}</small>
                  <h3>{t('credits_community_title')}</h3>
                  <p>{t('credits_community_body')}</p>
                </article>
              </div>

              <div className="credits-manifest-v4">
                <span>{t('credits_idea')}</span>
                <blockquote>{t('credits_manifest')}</blockquote>
              </div>

              <footer className="credits-legal-v4">
                <div><b>{t('credits_legal_title')}</b><p>{t('credits_legal_body')}</p></div>
                <strong>{t('credits_thanks')}</strong>
              </footer>
            </section>
          )}
        </div>

        {settingsTab !== 'credits' && settingsTab !== 'language' && (
          <section className="settings-about-v2 settings-about-compact">
            <div><span className="eyebrow">OVERROLL WEB</span><h2>Configuración independiente por módulo</h2><p>Los cambios visuales son globales; cada juego conserva por separado sus escuadras, reglas y ruletas.</p></div>
            <span className="settings-version-v2"><Icon name="check" size={16} /> Guardado automático</span>
          </section>
        )}
      </main>
    )
  }
  return (
    <div className={`app ${animationsEnabled ? '' : 'reduce-motion'} ${compactPerks ? 'compact-perks' : ''} ${lowPowerMode ? 'low-power' : ''} ${mobileCompactMode ? 'mobile-compact' : ''}`}>
      <div className="ambient-grid" /><div className="ambient-orb orb-one" /><div className="ambient-orb orb-two" /><div className="noise-layer" />

      <header className="topbar">
        <button type="button" className="brand" onMouseEnter={hoverSound} onClick={() => navigate('principal')} aria-label={t('nav_home')}>
          <span className="brand-mark"><img src={asset('app_icon.png')} alt="" /></span><span className="brand-copy"><strong>OverRoll</strong><small>{gameModules.find((game) => game.id === activeGame)?.name ?? t('random_picker')}</small></span>
        </button>
        <nav aria-label="OverRoll">
          <button type="button" className={activeView === 'principal' ? 'nav-active' : ''} onMouseEnter={hoverSound} onClick={() => navigate('principal')}><Icon name="gamepad" size={16} /><span>{t('nav_home')}</span></button>
          <button type="button" className={activeView === 'roulette' ? 'nav-active' : ''} onMouseEnter={hoverSound} onClick={() => navigate('roulette')}><Icon name="roulette" size={16} /><span>{t('nav_roulette')}</span></button>
          <button type="button" className={activeView === 'profiles' ? 'nav-active' : ''} onMouseEnter={hoverSound} onClick={() => navigate('profiles')}><Icon name="profile" size={16} /><span>{t('nav_profiles')}</span></button>
          <button type="button" className={activeView === 'more' ? 'nav-active' : ''} onMouseEnter={hoverSound} onClick={() => navigate('more')}><Icon name="settings" size={16} /><span>{t('nav_more')}</span></button>
        </nav>
      </header>

      {activeGame === 'pvzgw2' && (activeView === 'principal' || activeView === 'roulette') && (
        <PvzModule
          view={activeView}
          profiles={profiles.map(({ id, name }) => ({ id, name }))}
          baseUrl={baseUrl}
          animationsEnabled={animationsEnabled}
          soundEnabled={soundEnabled}
          soundVolume={soundVolume}
          mobileCompactMode={mobileCompactMode}
          notify={notify}
        />
      )}
      {isRosterGame(activeGame) && (activeView === 'principal' || activeView === 'roulette') && (
        <RosterModule
          key={activeGame}
          gameId={activeGame}
          view={activeView}
          profiles={profiles.map(({ id, name }) => ({ id, name }))}
          baseUrl={baseUrl}
          animationsEnabled={animationsEnabled}
          soundEnabled={soundEnabled}
          soundVolume={soundVolume}
          mobileCompactMode={mobileCompactMode}
          notify={notify}
          playUiSound={playSound}
          playConfirmTone={playConfirmTone}
        />
      )}
      {activeGame !== 'pvzgw2' && !isRosterGame(activeGame) && activeView === 'principal' && (activeGame === 'tf2' ? renderTf2Principal() : renderPrincipal())}
      {activeGame !== 'pvzgw2' && !isRosterGame(activeGame) && activeView === 'roulette' && (activeGame === 'tf2' ? renderTf2Roulette() : renderRoulette())}
      {activeView === 'profiles' && renderProfiles()}
      {activeView === 'more' && renderMore()}

      {activeGame === 'overwatch' && detailsIndex !== null && selectedDetailHero && (
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

      {activeGame === 'overwatch' && filterIndex !== null && filterPlayer && (
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

      {activeGame === 'tf2' && tf2FilterIndex !== null && tf2FilterPlayer && (
        <div className="filter-layer tf2-filter-layer" role="presentation" onMouseDown={(event: MouseEvent<HTMLDivElement>) => { if (event.currentTarget === event.target) closeTf2Filter() }}>
          <section className="filter-dialog tf2-filter-dialog" role="dialog" aria-modal="true" aria-label={`Filtro TF2 de ${tf2FilterPlayer.name}`}>
            <header className="filter-heading"><div><span className="eyebrow">Filtro individual · TF2</span><h2>{tf2FilterPlayer.name || `Jugador ${tf2FilterIndex + 1}`}</h2><p>{tf2Classes.length - tf2FilterPlayer.blocked.length} permitidas · {tf2FilterPlayer.blocked.length} bloqueadas</p></div><button type="button" onClick={closeTf2Filter}><Icon name="close" size={20} /></button></header>
            <div className="filter-toolbar"><div className="profile-search"><Icon name="filter" size={16} /><input value={tf2FilterSearch} onChange={(event: ChangeEvent<HTMLInputElement>) => setTf2FilterSearch(event.target.value)} placeholder="Buscar clase…" /></div><div className="role-filter-tabs tf2-filter-tabs"><button type="button" className={tf2FilterGroup === 'all' ? 'active' : ''} onClick={() => setTf2FilterGroup('all')}>Todas</button>{tf2Groups.map((group) => <button type="button" className={`${group} ${tf2FilterGroup === group ? 'active' : ''}`} onClick={() => setTf2FilterGroup(group)} key={group}>{tf2GroupLabels[group]}</button>)}</div><button type="button" className="reset-classification" onClick={clearTf2Filter}><Icon name="reset" size={15} /> Reiniciar</button></div>
            <div className="filter-hero-grid tf2-filter-class-grid">{tf2VisibleFilterClasses.map((item) => { const blocked = tf2FilterPlayer.blocked.includes(item.key); return <button type="button" className={`filter-hero tf2-filter-class ${item.group} ${blocked ? 'blocked' : ''}`} onClick={() => toggleTf2BlockedClass(item.key)} aria-pressed={blocked} key={item.key}><img src={asset(item.portrait)} alt={item.name} /><span><strong>{item.name}</strong><small>{blocked ? 'BLOQUEADA' : tf2GroupLabels[item.group].toUpperCase()}</small></span><i>{blocked ? '×' : '✓'}</i></button> })}</div>
          </section>
        </div>
      )}

      {toast && <div className={`toast ${toast.tone}`} role="status"><span><Icon name={toast.tone === 'warning' ? 'warning' : toast.tone === 'success' ? 'check' : 'spark'} size={17} /></span><p>{toast.message}</p></div>}
    </div>
  )
}

export default App
