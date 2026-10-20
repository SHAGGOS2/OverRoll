import { useOverwatchText } from './useOverwatchText'
import { readPerkText, selectedPerkGroup, type PerkGroup } from './overwatchText'
import GameSidebar from './GameSidebar'
import AppHeader from './AppHeader'
import { gameCredits } from './gameCredits'
import AnimatedLayer from './AnimatedLayer'
import SharedRoulette from './SharedRoulette'
import { useImageExport } from './useImageExport'
import { safeAssetUrl } from './imageExport.ts'
import CardDesignOptions from './CardDesignOptions'
import PageThemeOptions, { ThemeBackdrop } from './PageThemeOptions'
import { normalizePageTheme, type PageTheme } from './pageTheme'
import BarCard from './BarCard'
import { normalizeCardDesign, TELEPORT_DURATION_MS, type CardDesign } from './cardDesign'
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
import './GameExperience.css'
import './Preferences.css'
import './InteractionPolish.css'
import './SharedRoulette.css'
import './Profiles.css'
import './StandardGames.css'
import './AppHeader.css'
import './GamePicker.css'
import './BarCards.css'
import './PageThemes.css'
import './HorizontalCards.css'
import { warmImageCache } from './imageCache'
import { creditsSongUrl, detectBrowserLocale, localeChoices, localeName, translate, type LocalePreference, type SupportedLocale } from './localization'
import { localizeUi, translateGameText, isDefaultPlayerName, localizedPlayerName } from './uiLocalization'
import ViewportAction from './ViewportAction'
import { sanitizePersonName, PERSON_NAME_PATTERN, PERSON_NAME_HINT, PLAYER_NAME_MAX_LENGTH, PROFILE_NAME_MAX_LENGTH } from './personName.ts'

const rouletteRoleColors = { tank: '#4fc9ff', damage: '#ff5578', support: '#55e4ad' }

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
type MobileConfigTab = 'squad' | 'rules'
type SettingsTab = 'general' | 'page-design' | 'card-design' | 'audio' | 'catalogs' | 'language' | 'credits'
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
  { id: 'overwatch', name: 'Overwatch', status: 'Disponible', accent: '#f5a623', available: true, catalogLabel: doctrineUnlocked() ? '54 héroes' : '53 héroes', icon: gameModuleIcons.overwatch },
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
    name: `Jugador${index + 1}`,
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
      name: typeof source.name === 'string' ? sanitizePersonName(source.name) : `Jugador${index + 1}`,
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
    name: `Jugador${index + 1}`,
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
      name: typeof source.name === 'string' ? sanitizePersonName(source.name) : `Jugador${index + 1}`,
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
      name: sanitizePersonName(source.name, PROFILE_NAME_MAX_LENGTH) || `Perfil${index + 1}`,
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

// Doctrine queda preparado desde ahora, pero OverRoll no lo incorpora al catálogo
// hasta el 5 de octubre de 2026 a las 00:00 (hora del centro de México, UTC-6).
const DOCTRINE_RELEASE_AT = Date.parse('2026-10-05T00:00:00-06:00')
const DOCTRINE_FALLBACK_PORTRAIT = 'assets/heroes/doctrine.png'
const OVERFAST_DOCTRINE_URL = 'https://overfast-api.tekrop.fr/heroes/doctrine?locale=es-mx'

function doctrineUnlocked(): boolean {
  return Date.now() >= DOCTRINE_RELEASE_AT
}

function doctrineFallbackHero(): Hero {
  return {
    key: 'doctrine',
    name: 'Doctrine',
    role: 'support',
    subrole: 'survivor',
    portrait: DOCTRINE_FALLBACK_PORTRAIT,
    gamemodes: ['quickplay'],
    minorPerks: [
      {
        name: 'Gracia salvadora',
        description: 'Drones vigorizantes sana 40 de salud al aplicarse.',
        icon: '',
      },
      {
        name: 'Sifón sanguíneo',
        description: 'Te sana un 50% del daño infligido con Cetro eterno infundido.',
        icon: '',
      },
    ],
    majorPerks: [
      {
        name: 'Transfusión',
        description: 'Reduce el tiempo de reutilización de Infundir según el daño y la sanación realizados.',
        icon: '',
      },
      {
        name: 'Costo de vida',
        description: 'Sacrifica 25 de salud máxima y aumenta un 20% la sanación de Cetro eterno.',
        icon: '',
      },
    ],
    stadiumPowers: [],
  }
}

function mapOverFastDoctrine(hero: OverFastHero, fallback: Hero): Hero {
  const stadiumPowers = Array.isArray(hero.stadium_powers) ? hero.stadium_powers : []
  return {
    key: 'doctrine',
    name: hero.name || fallback.name,
    role: 'support',
    subrole: hero.subrole || fallback.subrole,
    portrait: hero.portrait || fallback.portrait,
    gamemodes: stadiumPowers.length ? ['quickplay', 'stadium'] : ['quickplay'],
    minorPerks: Array.isArray(hero.perks?.minor) && hero.perks.minor.length ? hero.perks.minor : fallback.minorPerks,
    majorPerks: Array.isArray(hero.perks?.major) && hero.perks.major.length ? hero.perks.major : fallback.majorPerks,
    stadiumPowers,
  }
}

async function fetchDoctrineFromOverFast(signal: AbortSignal): Promise<Hero> {
  const response = await fetch(OVERFAST_DOCTRINE_URL, {
    cache: 'no-store',
    credentials: 'omit',
    mode: 'cors',
    signal,
  })
  if (!response.ok) throw new Error(`OverFast Doctrine HTTP ${response.status}`)
  const payload = await response.json() as OverFastHero
  return mapOverFastDoctrine(payload, doctrineFallbackHero())
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
  const asset = (path: string) => safeAssetUrl(path, baseUrl)

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
  const [profileBucketFilter, setProfileBucketFilter] = useState<ProfileBucket | 'all' | 'unmarked'>('all')
  const [profileBulkBucket, setProfileBulkBucket] = useState<ProfileBucket | ''>('main')
  const [otherProfilePlayers, setOtherProfilePlayers] = useState<Record<string, Array<{ id: string; name: string; profileId: string; [key: string]: unknown }>>>({})
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
  const [cardDesign, setCardDesign] = useState<CardDesign>(() => normalizeCardDesign(readStorage<unknown>('overroll.web.cardDesign', readStorage<unknown>('overroll.web.overwatch.cardDesign', 'classic'))))
  const [pageTheme, setPageTheme] = useState<PageTheme>(() => normalizePageTheme(readStorage<unknown>('overroll.web.pageTheme', 'default')))
  const [systemReducedMotion, setSystemReducedMotion] = useState(() => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches))
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

  const activeLocale: SupportedLocale = localePreference === 'auto' ? browserLocale : localePreference
  const barMotion = animationsEnabled && !lowPowerMode && !systemReducedMotion
  useEffect(() => { document.documentElement.dataset.overrollTheme = pageTheme }, [pageTheme])
  const t = (key: Parameters<typeof translate>[1]) => translate(activeLocale, key)
  const [imageExporting, saveImage] = useImageExport(notify, activeLocale, activeGame)
  const overwatchText = useOverwatchText(activeLocale, baseUrl, activeGame === 'overwatch')
  function perkText(hero: Hero, perk: Perk, group?: PerkGroup) {
    return readPerkText(overwatchText.catalog, activeLocale, hero.key, group ?? selectedPerkGroup(hero, perk, stadium), perk) ?? { name: '…', description: '' }
  }


  useEffect(() => {
    const handleLanguageChange = () => setBrowserLocale(detectBrowserLocale())
    window.addEventListener('languagechange', handleLanguageChange)
    return () => window.removeEventListener('languagechange', handleLanguageChange)
  }, [])

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!media) return
    const changed = () => setSystemReducedMotion(media.matches)
    media.addEventListener('change', changed)
    return () => media.removeEventListener('change', changed)
  }, [])

  useEffect(() => {
    document.documentElement.lang = activeLocale
    document.documentElement.dir = 'ltr'
    document.title = `OverRoll · ${translate(activeLocale, 'random_picker')}`
    window.localStorage.setItem('overroll.web.localePreference', JSON.stringify(localePreference))
  }, [activeLocale, localePreference])

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
      const audio = new Audio(`${baseUrl}${path}?v=9`)
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

    const applyLoadedHeroes = (loaded: HeroData, doctrineSynced: boolean) => {
      if (cancelled) return
      const pool = loaded.heroes.filter((hero) => stadium ? hero.stadiumPowers.length > 0 : hero.gamemodes.includes('quickplay'))
      setData(loaded)
      warmImageCache(loaded.heroes.map((hero) => asset(hero.portrait)), 10)
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
      setStatus(`${pool.length} héroes listos${doctrineSynced ? ' · Doctrine sincronizado' : ''}`)
      setGenerationRevision((value) => value + 1)
    }

    fetch(`${baseUrl}data/heroes.json`, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo abrir el catálogo de héroes.')
        return response.json() as Promise<HeroData>
      })
      .then(async (localData) => {
        let localHeroes = localData.heroes

        if (doctrineUnlocked() && !localHeroes.some((hero) => hero.key === 'doctrine')) {
          localHeroes = [...localHeroes, doctrineFallbackHero()]
        }

        const localSnapshot: HeroData = {
          ...localData,
          heroes: localHeroes,
        }

        // Todos los héroes publicados, incluida D.Mon, se pintan completos desde el snapshot local.
        applyLoadedHeroes(localSnapshot, false)

        // A published snapshot already contains Doctrine's current perks and local artwork.
        // Only synchronize legacy snapshots that still lack the released hero.
        if (!doctrineUnlocked() || localData.heroes.some((hero) => hero.key === 'doctrine')) return

        try {
          const doctrine = await fetchDoctrineFromOverFast(controller.signal)
          if (cancelled) return

          const merged: HeroData = {
            source: `${localData.source} + OverFast API (Doctrine)`,
            updatedAt: new Date().toISOString(),
            heroes: localHeroes.map((hero) => hero.key === 'doctrine' ? doctrine : hero),
          }
          setData(merged)
          warmImageCache([asset(doctrine.portrait)], 1)
          setPicks((current) => current.map((pick) => (
            pick.hero?.key === 'doctrine' ? { ...pick, hero: doctrine } : pick
          )))
          setStatus(`${merged.heroes.filter((hero) => stadium ? hero.stadiumPowers.length > 0 : hero.gamemodes.includes('quickplay')).length} héroes listos · Doctrine sincronizado`)
        } catch (error) {
          if (!controller.signal.aborted) console.warn('Doctrine: no se pudo sincronizar OverFast; se usa el respaldo preparado.', error)
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
      window.localStorage.setItem('overroll.web.cardDesign', JSON.stringify(cardDesign))
      window.localStorage.setItem('overroll.web.pageTheme', JSON.stringify(pageTheme))
      window.localStorage.setItem('overroll.web.compactPerks', JSON.stringify(compactPerks))
      window.localStorage.setItem('overroll.web.lowPowerMode', JSON.stringify(lowPowerMode))
      window.localStorage.setItem('overroll.web.mobileCompactMode', JSON.stringify(mobileCompactMode))
      window.localStorage.setItem('overroll.web.activeGame', JSON.stringify(activeGame))
      window.localStorage.setItem('overroll.web.tf2.players', JSON.stringify(tf2Players))
      window.localStorage.setItem('overroll.web.tf2.avoidRepeated', JSON.stringify(tf2AvoidRepeated))
    }, 180)

    return () => window.clearTimeout(timeout)
  }, [players, profiles, profileMode, currentProfileId, avoidRepeated, roleComposition, rolesOnly, randomPerks, stadium, soundEnabled, soundVolume, hoverSounds, animationsEnabled, cardDesign, pageTheme, compactPerks, lowPowerMode, mobileCompactMode, activeGame, tf2Players, tf2AvoidRepeated])

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
      && (!search || `${hero.name} ${translateGameText('overwatch', activeLocale, hero.name)}`.toLocaleLowerCase(activeLocale).includes(search))
      && (profileBucketFilter === 'all' || (profileBucketFilter === 'unmarked' ? !heroBucket(currentProfile, hero.key) : heroBucket(currentProfile, hero.key) === profileBucketFilter))
    ))
  }, [data, profileRole, profileSearch, profileBucketFilter, currentProfile, activeLocale])

  const filterHeroes = useMemo(() => {
    const search = filterSearch.trim().toLocaleLowerCase('es-MX')
    return availableHeroes.filter((hero) => (
      (filterRole === 'all' || hero.role === filterRole)
      && (!search || `${hero.name} ${translateGameText('overwatch', activeLocale, hero.name)}`.toLocaleLowerCase(activeLocale).includes(search))
    ))
  }, [availableHeroes, filterRole, filterSearch, activeLocale])

  const tf2FilterPlayer = tf2FilterIndex === null ? null : tf2Players[tf2FilterIndex] ?? null
  const tf2VisibleFilterClasses = useMemo(() => {
    const search = tf2FilterSearch.trim().toLocaleLowerCase('es-MX')
    return tf2Classes.filter((item) => (
      (tf2FilterGroup === 'all' || item.group === tf2FilterGroup)
      && (!search || item.name.toLocaleLowerCase('es-MX').includes(search))
    ))
  }, [tf2FilterGroup, tf2FilterSearch])

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
    setTf2Players((old) => old.map((player, playerIndex) => playerIndex === index ? { ...player, name: sanitizePersonName(name) } : player))
  }

  function tf2AssignPlayerProfile(index: number, profileId: string) {
    const assigned = profiles.find((item) => item.id === profileId)
    playSound('profileAssign')
    setTf2Players((old) => old.map((player, playerIndex) => playerIndex === index
      ? { ...player, profileId, name: sanitizePersonName(assigned?.name ?? (player.profileId ? `Jugador${index + 1}` : player.name)) }
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
      name: sanitizePersonName(player.profileId ? profiles.find((item) => item.id === player.profileId)?.name ?? `Jugador${index + 1}` : ''),
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
      }
    }, cardDesign !== 'classic' && barMotion ? TELEPORT_DURATION_MS : animationsEnabled ? 300 : 30)
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
      if (cardDesign !== 'classic' && barMotion) window.setTimeout(() => setTf2RerollingIndex(null), TELEPORT_DURATION_MS)
      else setTf2RerollingIndex(null)
      setTf2Status(`Reroll de ${player.name || `Jugador${index + 1}`}`)
      if (!mercenary) notify('No hay otra clase compatible con ese filtro.', 'warning')
    }, cardDesign !== 'classic' ? 0 : animationsEnabled ? 220 : 20)
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

  async function generateTf2TeamImage() {
    await saveImage({ title: 'Team Fortress 2', accent: '#e8a45b', filename: 'overroll-tf2-equipo', design: cardDesign, cards: tf2Players.map((player, index) => {
      const pick = tf2Picks[index], hero = pick?.mercenary
      return { player: player.name, name: hero?.name ?? 'Sin selección', role: hero ? tf2GroupLabels[hero.group] : 'Mercenario', color: hero ? tf2GroupColors[hero.group] : '#b9a18b', portrait: hero ? asset(hero.portrait) : undefined, fit: cardDesign !== 'classic' ? 'contain' as const : 'cover' as const, icon: hero ? asset('assets/tf2/icons/' + hero.key.replace(/^tf2-/, '') + '.png') : undefined, locked: pick?.locked }
    }) })
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
    }, cardDesign !== 'classic' ? barMotion ? TELEPORT_DURATION_MS : 40 : animationsEnabled ? 360 : 40)
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
      if (cardDesign !== 'classic' && barMotion) window.setTimeout(() => setRerollingIndex(null), TELEPORT_DURATION_MS)
      else setRerollingIndex(null)
      setStatus(`Reroll de ${player.name || `Jugador${index + 1}`}`)
      if (!hero) notify('No hay otro héroe compatible con ese perfil y filtro.', 'warning')
    }, cardDesign !== 'classic' ? 0 : animationsEnabled ? 280 : 30)
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
      playerIndex === index ? { ...player, name: sanitizePersonName(name) } : player
    )))
  }

  function assignPlayerProfile(index: number, profileId: string) {
    const assigned = profiles.find((item) => item.id === profileId)
    playSound('profileAssign')
    setPlayers((old) => old.map((player, playerIndex) => (
      playerIndex === index
        ? { ...player, profileId, name: sanitizePersonName(assigned?.name ?? (player.profileId ? `Jugador${index + 1}` : player.name)) }
        : player
    )))
    notify(assigned ? `${assigned.name} asignado al Jugador ${index + 1}` : `Perfil retirado del Jugador ${index + 1}`)
  }

  function clearPlayerNames() {
    playSound('click')
    setPlayers((old) => old.map((player, index) => ({
      ...player,
      name: sanitizePersonName(player.profileId ? (profiles.find((item) => item.id === player.profileId)?.name ?? `Jugador${index + 1}`) : ''),
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
    const next: UserProfile = { id, name: `NuevoPerfil${profiles.length + 1}`, heroes: emptyProfileHeroes() }
    setProfiles((old) => [...old, next])
    setCurrentProfileId(id)
    playSound('profileCreate')
    notify('Perfil creado', 'success')
  }

  function renameCurrentProfile(name: string) {
    const profileName = sanitizePersonName(name, PROFILE_NAME_MAX_LENGTH)
    const squadName = sanitizePersonName(profileName)
    setProfiles((old) => old.map((profile) => profile.id === currentProfileId ? { ...profile, name: profileName } : profile))
    syncOtherProfile(currentProfileId, profileName)
    setPlayers((old) => old.map((player) => {
      if (player.profileId !== currentProfileId) return player
      return { ...player, name: squadName }
    }))
    setTf2Players((old) => old.map((player) => {
      if (player.profileId !== currentProfileId) return player
      return { ...player, name: squadName }
    }))
  }

  function deleteCurrentProfile() {
    if (!currentProfile) return
    const id = currentProfile.id
    syncOtherProfile(id)
    setProfiles((old) => old.filter((profile) => profile.id !== id))
    setPlayers((old) => old.map((player, index) => (
      player.profileId === id ? { ...player, profileId: '', name: `Jugador${index + 1}` } : player
    )))
    setTf2Players((old) => old.map((player, index) => (
      player.profileId === id ? { ...player, profileId: '', name: `Jugador${index + 1}` } : player
    )))
    setCurrentProfileId('')
    playSound('profileDelete')
    notify('Perfil eliminado')
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



  async function generateTeamImage() {
    const colors: Record<Role, string> = { tank: '#4fc9ff', damage: '#ff5578', support: '#55e4ad' }
    await saveImage({ title: stadium ? 'Overwatch · Stadium' : 'Overwatch', accent: '#ffc84a', filename: 'overroll-overwatch-equipo', design: cardDesign, cards: players.map((player, index) => {
      const pick = picks[index], hero = pick?.hero, role = pick?.role ?? hero?.role
      return { player: player.name, name: rolesOnly && role ? roleLabels[role] : hero?.name ?? 'Sin selección', role: role ? roleLabels[role] : 'Sin rol', color: role ? colors[role] : '#8197af', fit: rolesOnly ? 'contain' as const : 'cover' as const, portrait: rolesOnly && role ? asset('assets/roles/' + role + '.png') : hero ? asset(hero.portrait) : undefined, icon: role ? asset('assets/roles/' + role + '.png') : undefined, locked: pick?.locked, details: rolesOnly ? [] : (pick?.perks ?? []).slice(0, stadium ? 4 : 2).map((perk) => ({ label: hero ? perkText(hero, perk).name : perk.name, image: asset(perk.icon) })) }
    }) })
  }

  function restoreRecommendedSettings() {
    setSoundEnabled(true)
    setSoundVolume(0.42)
    setHoverSounds(false)
    setAnimationsEnabled(true)
    setCardDesign('classic')
    setPageTheme('default')
    setCompactPerks(false)
    setLowPowerMode(false)
    setMobileCompactMode(true)
    playConfirmTone()
    notify('Ajustes visuales restaurados', 'success')
  }

  function resetLocalData() {
    playSound('click')
    const confirmed = window.confirm(translateGameText(activeGame, activeLocale, 'Esto borrará perfiles, nombres, reglas, ruleta y configuración guardada en este navegador. ¿Continuar?'))
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
      <main className="workspace tf2-workspace standard-game">
        <GameSidebar className={`sidebar tf2-sidebar ${mobileConfigOpen ? 'mobile-config-open' : 'mobile-config-closed'}`} locale={activeLocale} open={mobileConfigOpen} activeTab={mobileConfigTab} onToggle={() => { setMobileConfigOpen((value) => !value); playSound('tf2Click') }} onTabChange={(tab) => { setMobileConfigTab(tab); playSound('tf2Click') }}>


          <section className={`side-panel squad-panel mobile-config-section ${mobileConfigTab === 'squad' ? 'mobile-active' : ''}`}>
            <div className="panel-title-row"><div><label>Escuadra</label></div><Icon name="users" size={17} /></div>
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
                  <input value={isDefaultPlayerName(player.name, index + 1) ? localizedPlayerName(activeLocale, index + 1) : player.name} disabled={Boolean(player.profileId)} onChange={(event: ChangeEvent<HTMLInputElement>) => tf2UpdatePlayerName(index, event.target.value)} onFocus={() => playSound('click')} maxLength={PLAYER_NAME_MAX_LENGTH} pattern={PERSON_NAME_PATTERN} title={PERSON_NAME_HINT} aria-label={`Nombre TF2 ${index + 1}`} />
                  <select className="player-profile-inline" value={player.profileId} onChange={(event: ChangeEvent<HTMLSelectElement>) => tf2AssignPlayerProfile(index, event.target.value)} aria-label={`Perfil TF2 ${index + 1}`}>
                    <option value="">☆</option>{profiles.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
                  </select>
                  <button type="button" className={`roster-inline-filter ${player.blocked.length ? 'active-filter' : ''}`} onClick={() => openTf2Filter(index)} aria-label={`Filtro de ${player.name}`}><Icon name="filter" size={14} />{player.blocked.length > 0 && <b>{player.blocked.length}</b>}</button>
                  <div className="tf2-group-buttons">
                    {tf2Groups.map((group) => <button type="button" className={`tf2-group ${group} ${player.groups[group] ? 'active' : ''}`} onClick={() => tf2TogglePlayerGroup(index, group)} title={tf2GroupLabels[group]} aria-pressed={player.groups[group]} key={group}><span>{tf2GroupLabels[group]}</span></button>)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={`side-panel rules mobile-config-section ${mobileConfigTab === 'rules' ? 'mobile-active' : ''}`}>
            <div className="panel-title-row"><div><label>Reglas</label></div><Icon name="settings" size={17} /></div>
            <button type="button" className={`toggle-row tf2-toggle ${tf2AvoidRepeated ? 'enabled' : ''}`} onClick={() => { const next = !tf2AvoidRepeated; setTf2AvoidRepeated(next); playSound('tf2Click') }} aria-pressed={tf2AvoidRepeated}>
              <span className="switch"><span /></span><span><b>Evitar clases repetidas</b></span>
            </button>
          </section>

          <div className="sidebar-footer">
            <div className="status-line tf2-status"><span className="status-icon"><Icon name="shield" size={15} /></span><span>{tf2Status}</span></div>
          </div>
        </GameSidebar>

        <section className="content tf2-content">
          <div className="content-topline tf2-topline">
            <div className="game-identity"><div className="game-title-row"><h1>Team Fortress 2</h1></div></div>
            <div className="topline-actions">
              <button type="button" className="generate-image-button tf2-image-button" onClick={generateTf2TeamImage} aria-busy={imageExporting} disabled={imageExporting || !tf2Picks.some((pick) => pick.mercenary)}><Icon name="download" size={17} /> Generar imagen</button>
              <div className="match-summary tf2-summary">
                <div><small>Jugadores</small><strong>{tf2Players.length}</strong></div>
                <div><small>Fijados</small><strong>{tf2Picks.filter((pick) => pick.locked).length}</strong></div>
                <div><small>Repetidos</small><strong>{tf2AvoidRepeated ? 'No' : 'Sí'}</strong></div>
              </div>
            </div>
          </div>
          <div className="team-stage tf2-stage">
            <div className="stage-grid" />
            <div className={`team-grid tf2-team-grid cards-${tf2Players.length}${cardDesign !== 'classic' ? ` bar-cards${cardDesign === 'horizontal' ? ' horizontal-cards' : ''}` : ''}`} style={{ '--cards': tf2Players.length } as CSSProperties}>
              {tf2Players.map((player, index) => {
                const pick = tf2Picks[index]
                const mercenary = pick?.mercenary
                const profile = profiles.find((item) => item.id === player.profileId)
                const generationClass = tf2GenerationRevision % 2 === 0 ? 'generation-a' : 'generation-b'
                if (cardDesign !== 'classic') return <BarCard design={cardDesign} key={player.id} gameId="tf2" index={index}
                  player={isDefaultPlayerName(player.name, index + 1) ? localizedPlayerName(activeLocale, index + 1) : player.name || localizedPlayerName(activeLocale, index + 1)}
                  name={translateGameText('tf2', activeLocale, mercenary?.name ?? 'Sin selección')} role={translateGameText('tf2', activeLocale, mercenary ? tf2GroupLabels[mercenary.group] : 'Mercenario')}
                  accent={mercenary ? tf2GroupColors[mercenary.group] : '#e8a45b'} roleIcon={mercenary ? asset('assets/tf2/icons/' + mercenary.key.replace(/^tf2-/, '') + '.png') : undefined}
                  portrait={mercenary ? asset(mercenary.portrait) : ''} fit="contain" rolesOnly={false} locked={Boolean(pick?.locked)} profile={profile?.name} blocked={player.blocked.length}
                  perks={[]} revision={tf2GenerationRevision} motion={barMotion} locale={activeLocale}
                  actions={localizeUi(activeLocale, <>
                    <button type="button" onClick={() => rerollTf2(index)} disabled={!mercenary || pick?.locked || tf2Generating || tf2RerollingIndex !== null} aria-label="Cambiar clase" data-tooltip="Cambiar clase"><Icon name="reroll" size={18} /></button>
                    <button type="button" onClick={() => openTf2Filter(index)} className={player.blocked.length > 0 ? 'active-filter' : ''} aria-label={`Filtro de ${player.name}`} data-tooltip="Filtro"><Icon name="filter" size={18} /></button>
                    <button type="button" onClick={() => toggleTf2Lock(index)} disabled={!mercenary || tf2Generating || tf2RerollingIndex !== null} className={pick?.locked ? 'active-lock' : ''} aria-label={pick?.locked ? `Liberar ${mercenary?.name}` : `Fijar ${mercenary?.name}`} data-tooltip={pick?.locked ? 'Liberar' : 'Fijar'}><Icon name={pick?.locked ? 'unlock' : 'lock'} size={17} /></button>
                  </>, 'tf2')} />
                return (
                  <article className={`hero-card tf2-card ${mercenary?.group ?? ''} ${generationClass} ${pick?.locked ? 'is-locked' : ''} ${tf2RerollingIndex === index ? 'is-rerolling' : ''}`} style={{ '--delay': `${index * 45}ms`, '--tf2-accent': mercenary ? tf2GroupColors[mercenary.group] : '#e8a45b' } as CSSProperties} key={player.id}>
                    <span className="card-corner top" /><span className="card-corner bottom" /><div className="card-shine" />
                    <div className="card-player"><span className="player-index">{String(index + 1).padStart(2, '0')}</span><span translate="no">{isDefaultPlayerName(player.name, index + 1) ? localizedPlayerName(activeLocale, index + 1) : (player.name || localizedPlayerName(activeLocale, index + 1))}</span>{profile && <span className="profile-tag" translate="no">{profile.name.charAt(0).toUpperCase()}</span>}{player.blocked.length > 0 && <span className="filter-count">{player.blocked.length}</span>}{pick?.locked && <span className="mini-lock"><Icon name="lock" size={12} /></span>}</div>
                    <div className="portrait tf2-portrait">
                      <div className="portrait-grid" /><div className="portrait-fallback"><Icon name="gamepad" size={48} /></div>
                      {mercenary ? <img className="hero-image" src={asset(mercenary.portrait)} alt={mercenary.name} decoding="async" draggable={false} onLoad={handleImageLoad} onError={handleImageError} /> : <div className="portrait-loading"><span /><span /><span /></div>}
                      <div className="portrait-vignette" />
                      {mercenary && <span className="class-emblem" aria-hidden="true"><img src={asset('assets/tf2/icons/' + mercenary.key.replace(/^tf2-/, '') + '.png')} alt="" /></span>}
                    </div>
                    <div className="hero-info"><div className="hero-name-row"><h2>{mercenary?.name ?? 'Sin selección'}</h2><span className={`role-dot tf2-dot ${mercenary?.group ?? ''}`} /></div><div className={`hero-role tf2-role ${mercenary?.group ?? ''}`}>{mercenary && <img className="hero-role-icon" src={asset('assets/tf2/icons/' + mercenary.key.replace(/^tf2-/, '') + '.png')} alt="" aria-hidden="true" />}{mercenary ? tf2GroupLabels[mercenary.group] : 'Genera un equipo'}</div></div>
                    {profile && <div className="loadout"><div><small>Perfil</small><span translate="no">{profile.name}</span></div></div>}
                    <div className="card-actions tf2-card-actions">
                      <button type="button" onClick={() => rerollTf2(index)} disabled={!mercenary || pick?.locked || tf2RerollingIndex !== null} data-tooltip="Cambiar clase"><Icon name="reroll" size={18} /></button>
                      <button type="button" onClick={() => openTf2Filter(index)} className={player.blocked.length > 0 ? 'active-filter' : ''} data-tooltip="Filtro"><Icon name="filter" size={18} /></button>
                      <button type="button" onClick={() => toggleTf2Lock(index)} disabled={!mercenary} className={pick?.locked ? 'active-lock' : ''} data-tooltip={pick?.locked ? 'Liberar' : 'Fijar'}><Icon name={pick?.locked ? 'unlock' : 'lock'} size={17} /></button>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <ViewportAction className="tf2-principal-generate-dock">
          <button type="button" className={`generate principal-generate-action tf2-generate ${tf2Generating ? 'generating' : ''}`} onClick={generateTf2Team} disabled={tf2Generating || tf2RerollingIndex !== null}>
            <span className="generate-glow" /><Icon name={tf2Generating ? 'refresh' : 'spark'} size={19} /><span>{tf2Generating ? 'Reuniendo…' : 'Generar equipo'}</span>
          </button>
        </ViewportAction>
      </main>
    )
  }

  function renderPrincipal() {
    return (
      <main className="workspace overwatch-workspace standard-game">
        <GameSidebar className={`sidebar ${mobileConfigOpen ? 'mobile-config-open' : 'mobile-config-closed'}`} locale={activeLocale} open={mobileConfigOpen} activeTab={mobileConfigTab} onToggle={() => { setMobileConfigOpen((value) => !value); playSound('click') }} onTabChange={(tab) => { setMobileConfigTab(tab); playSound('click') }}>



          <section className={`side-panel squad-panel mobile-config-section ${mobileConfigTab === 'squad' ? 'mobile-active' : ''}`}>
            <div className="panel-title-row">
              <div><label>Escuadra</label></div>
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
                    value={isDefaultPlayerName(player.name, index + 1) ? localizedPlayerName(activeLocale, index + 1) : player.name}
                    disabled={Boolean(player.profileId)}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => updatePlayerName(index, event.target.value)}
                    aria-label={`Nombre del jugador ${index + 1}`}
                    title={player.profileId ? 'El nombre lo controla el perfil asignado.' : PERSON_NAME_HINT}
                    onFocus={() => playSound('click')} maxLength={PLAYER_NAME_MAX_LENGTH} pattern={PERSON_NAME_PATTERN}
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
                  <button type="button" className={`roster-inline-filter ${player.blocked.length ? 'active-filter' : ''}`} onClick={() => openFilter(index)} aria-label={`Filtro de ${player.name}`}><Icon name="filter" size={14} />{player.blocked.length > 0 && <b>{player.blocked.length}</b>}</button>
                  <div className="player-role-choices">{roles.map((role) => (
                    <button
                      type="button"
                      className={`role ${role} ${player.roles[role] ? 'active' : ''}`}
                      onClick={() => togglePlayerRole(index, role)}
                      title={roleLabels[role]}
                      aria-pressed={player.roles[role]}
                      key={role}
                    >
                      <img src={asset(`assets/roles/${role}.png`)} alt="" /><span>{roleLabels[role]}</span>
                    </button>
                  ))}</div>
                </div>
              ))}
            </div>
          </section>

          <section className={`side-panel rules mobile-config-section ${mobileConfigTab === 'rules' ? 'mobile-active' : ''}`}>
            <div className="panel-title-row">
              <div><label>Reglas</label></div>
              <Icon name="settings" size={17} />
            </div>

            <label className="game-rule-select"><span>Modo de perfiles</span><select value={profileMode} onChange={(event: ChangeEvent<HTMLSelectElement>) => { setProfileMode(event.target.value as ProfileMode); playSound('profileSelect') }}>{profileModes.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
            <button type="button" className={`toggle-row ${avoidRepeated ? 'enabled' : ''}`} onClick={() => { const next = !avoidRepeated; setAvoidRepeated(next); toggleRuleSound(next) }} aria-pressed={avoidRepeated}>
              <span className="switch"><span /></span><span><b>Evitar repetidos</b></span>
            </button>
            <button type="button" className={`toggle-row ${roleComposition ? 'enabled' : ''}`} onClick={() => { const next = !roleComposition; setRoleComposition(next); toggleRuleSound(next) }} aria-pressed={roleComposition}>
              <span className="switch"><span /></span><span><b>Composición de roles</b></span>
            </button>
            <button type="button" className={`toggle-row perks-toggle ${randomPerks ? 'enabled' : ''}`} onClick={toggleRandomPerks} aria-pressed={randomPerks}>
              <span className="switch"><span /></span><span><b>Perks aleatorias</b></span>
            </button>
            <button type="button" className={`toggle-row stadium-toggle ${stadium ? 'enabled' : ''}`} onClick={toggleStadium} aria-pressed={stadium}>
              <span className="switch"><span /></span><span><b>Modo Stadium</b></span>
            </button>
            <button type="button" className={`toggle-row ${rolesOnly ? 'enabled' : ''}`} onClick={() => { const next = !rolesOnly; setRolesOnly(next); toggleRuleSound(next) }} aria-pressed={rolesOnly}>
              <span className="switch"><span /></span><span><b>Solo rol</b></span>
            </button>
          </section>

          <div className="sidebar-footer">
            <div className={`status-line ${loadError ? 'error' : ''}`}><span className="status-icon"><Icon name={loadError ? 'warning' : 'shield'} size={15} /></span><span>{status}</span></div>
          </div>
        </GameSidebar>

        <section className="content">
          <div className="content-topline">
            <div className="game-identity">
              <div className="game-title-row"><h1>Overwatch</h1></div>
            </div>
            <div className="topline-actions">
              <button type="button" className="generate-image-button" onClick={generateTeamImage} aria-busy={imageExporting} disabled={imageExporting || (!rolesOnly && !overwatchText.ready && picks.some((pick) => pick.perks.length > 0)) || !picks.some((pick) => pick.hero || pick.role)}>
                <Icon name="download" size={17} /> Generar imagen
              </button>
              <div className="match-summary">
                <div><small>Composición</small><strong>{compositionText}</strong></div>
                <div><small>Fijados</small><strong>{picks.filter((pick) => pick.locked).length}</strong></div>
                <div><small>Perfil</small><strong>{profileModeInfo.name}</strong></div>
              </div>
            </div>
          </div>

          {overwatchText.error && <div className="content-locale-error" role="alert"><span>No se pudo cargar el idioma.</span><button type="button" onClick={() => { overwatchText.retry(); playSound('click') }}>Volver a intentar</button></div>}
          {loadError ? (
            <div className="error-state"><Icon name="warning" size={34} /><h2>No se pudo cargar el catálogo</h2><p>{loadError}</p><button type="button" onClick={() => window.location.reload()}>Volver a intentar</button></div>
          ) : (
            <div className="team-stage">
              <div className="stage-grid" />
              <div className={`team-grid cards-${players.length}${cardDesign !== 'classic' ? ` bar-cards${cardDesign === 'horizontal' ? ' horizontal-cards' : ''}` : ''}`} style={{ '--cards': players.length } as CSSProperties}>
                {players.map((player, index) => {
                  const pick = picks[index]
                  const hero = pick?.hero
                  const visibleRole = pick?.role ?? hero?.role ?? assignedRoles[index]
                  const roleWatermarkStyle = visibleRole
                    ? ({ '--role-mask': `url("${asset(`assets/roles/${visibleRole}.png`)}")` } as CSSProperties)
                    : undefined
                  const generationClass = generationRevision % 2 === 0 ? 'generation-a' : 'generation-b'
                  const assignedProfile = profiles.find((item) => item.id === player.profileId)

                  if (cardDesign !== 'classic') return <BarCard design={cardDesign} key={player.id}
                    player={isDefaultPlayerName(player.name, index + 1) ? localizedPlayerName(activeLocale, index + 1) : player.name || localizedPlayerName(activeLocale, index + 1)}
                    index={index} name={translateGameText('overwatch', activeLocale, rolesOnly && visibleRole ? roleLabels[visibleRole] : hero?.name ?? 'Sin selección')}
                    role={translateGameText('overwatch', activeLocale, visibleRole ? roleLabels[visibleRole] : 'Genera un equipo')} roleId={visibleRole ?? undefined}
                    roleIcon={visibleRole ? asset(`assets/roles/${visibleRole}.png`) : undefined}
                    portrait={rolesOnly && visibleRole ? asset(`assets/roles/${visibleRole}.png`) : hero ? asset(hero.portrait) : ''}
                    rolesOnly={rolesOnly} locked={Boolean(pick?.locked)} profile={assignedProfile?.name} blocked={player.blocked.length}
                    perks={hero ? (pick?.perks ?? []).map((perk, i) => ({ ...perkText(hero, perk), icon: asset(perk.icon), tier: translateGameText('overwatch', activeLocale, stadium ? `PODER ${i + 1}` : hero.minorPerks.some((item) => item.name === perk.name) ? 'MENOR' : 'MAYOR') })) : []}
                    revision={generationRevision} motion={barMotion} locale={activeLocale}
                    actions={localizeUi(activeLocale, <>
                      <button type="button" onClick={() => reroll(index)} disabled={!hero || pick?.locked || rolesOnly || generating || rerollingIndex !== null} data-tooltip="Reroll" aria-label={`Reroll de ${player.name}`}><Icon name="reroll" size={18} /></button>
                      <button type="button" onClick={() => openFilter(index)} disabled={rolesOnly} data-tooltip="Filtro" aria-label={`Filtro de ${player.name}`} className={player.blocked.length > 0 ? 'active-filter' : ''}><Icon name="filter" size={18} /></button>
                      <button type="button" onClick={() => openDetails(index)} disabled={!hero} data-tooltip="Perks y detalles" aria-label={`Detalles de ${hero?.name ?? 'héroe'}`}><Icon name="details" size={18} /></button>
                      <button type="button" onClick={() => toggleLock(index)} disabled={!hero || rolesOnly || generating || rerollingIndex !== null} className={pick?.locked ? 'active-lock' : ''} data-tooltip={pick?.locked ? 'Liberar' : 'Fijar'} aria-label={pick?.locked ? `Liberar ${hero?.name}` : `Fijar ${hero?.name}`}><Icon name={pick?.locked ? 'unlock' : 'lock'} size={17} /></button>
                    </>, 'overwatch')} />

                  return (
                    <article className={`hero-card ${visibleRole ?? ''} ${generationClass} ${pick?.locked ? 'is-locked' : ''} ${rerollingIndex === index ? 'is-rerolling' : ''}`} style={{ '--delay': `${index * 55}ms` } as CSSProperties} key={player.id}>
                      <span className="card-corner top" /><span className="card-corner bottom" /><div className="card-shine" />
                      <div className="card-player">
                        <span className="player-index">{String(index + 1).padStart(2, '0')}</span>
                        <span translate="no">{isDefaultPlayerName(player.name, index + 1) ? localizedPlayerName(activeLocale, index + 1) : (player.name || localizedPlayerName(activeLocale, index + 1))}</span>
                        {assignedProfile && <span className="profile-tag" title={`Perfil: ${assignedProfile.name}`} translate="no">{assignedProfile.name.charAt(0).toUpperCase()}</span>}
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
                          {visibleRole && <img className="hero-role-icon" src={asset('assets/roles/' + visibleRole + '.png')} alt="" />}{visibleRole ? roleLabels[visibleRole] : 'Genera un equipo'}
                          {hero?.subrole && <><span>•</span>{subroleLabels[hero.subrole] ?? hero.subrole}</>}
                        </div>
                      </div>

                      {!rolesOnly && hero && pick.perks.length > 0 && (
                        <div className={`card-perks ${stadium ? 'stadium' : 'quickplay'}`}>
                          {pick.perks.map((perk, perkIndex) => (
                            <article className="card-perk" style={{ '--perk-delay': `${index * 55 + 230 + perkIndex * 75}ms` } as CSSProperties} key={`${perk.name}-${perkIndex}`} title={perkText(hero, perk).description}>
                              {perk.icon ? <img src={asset(perk.icon)} alt="" loading="eager" decoding="async" /> : <Icon name="spark" size={20} />}
                              <span><small>{stadium ? `PODER ${perkIndex + 1}` : hero.minorPerks.some((item) => item.name === perk.name) ? 'MENOR' : 'MAYOR'}</small><b translate="no" lang={activeLocale}>{perkText(hero, perk).name}</b></span>
                            </article>
                          ))}
                        </div>
                      )}

                      {assignedProfile && <div className="loadout"><div><small>Perfil</small><span translate="no">{assignedProfile.name}</span></div></div>}
                      <div className="card-actions four-actions">
                        <button type="button" onClick={() => reroll(index)} disabled={!hero || pick?.locked || rolesOnly || rerollingIndex !== null} data-tooltip="Reroll" aria-label={`Reroll de ${player.name}`}><Icon name="reroll" size={18} /></button>
                        <button type="button" onClick={() => openFilter(index)} disabled={rolesOnly} data-tooltip="Filtro" aria-label={`Filtro de ${player.name}`} className={player.blocked.length > 0 ? 'active-filter' : ''}><Icon name="filter" size={18} /></button>
                        <button type="button" onClick={() => openDetails(index)} disabled={!hero} data-tooltip="Perks y detalles" aria-label={`Detalles de ${hero?.name ?? 'héroe'}`}><Icon name="details" size={18} /></button>
                        <button type="button" onClick={() => toggleLock(index)} disabled={!hero || rolesOnly} className={pick?.locked ? 'active-lock' : ''} data-tooltip={pick?.locked ? 'Liberar' : 'Fijar'} aria-label={pick?.locked ? `Liberar ${hero?.name}` : `Fijar ${hero?.name}`}><Icon name={pick?.locked ? 'unlock' : 'lock'} size={17} /></button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          )}
        </section>

        <ViewportAction className="overwatch-principal-generate-dock">
          <button type="button" className={`generate principal-generate-action ${generating ? 'generating' : ''}`} onClick={generateTeam} disabled={!data || generating || rerollingIndex !== null}>
            <span className="generate-glow" /><Icon name={generating ? 'refresh' : 'spark'} size={19} /><span>{generating ? 'Generando…' : 'Generar equipo'}</span>
          </button>
        </ViewportAction>
      </main>
    )
  }

  useEffect(() => {
    if (activeView !== 'profiles') return
    const otherGames = ['pvz', ...rosterGameDefinitions.map((game) => game.id)]
    setOtherProfilePlayers(Object.fromEntries(otherGames.map((game) => {
      const saved = readStorage<unknown>(`overroll.web.${game}.players`, [])
      const rows = Array.isArray(saved) ? saved.slice(0, 12).filter((row) => row && typeof row === 'object').map((row, index) => ({ ...row, id: typeof row.id === 'string' ? row.id : `${game}-${index}`, name: sanitizePersonName(row.name), profileId: typeof row.profileId === 'string' ? row.profileId : '' })) : []
      return [game, rows]
    })))
  }, [activeView])

  function syncOtherProfile(profileId: string, name?: string) {
    const updated: typeof otherProfilePlayers = {}
    for (const game of ['pvz', ...rosterGameDefinitions.map((item) => item.id)]) {
      const saved = readStorage<unknown>(`overroll.web.${game}.players`, [])
      if (!Array.isArray(saved)) continue
      const rows = saved.slice(0, 12).filter((row) => row && typeof row === 'object').map((row) => row.profileId === profileId ? { ...row, profileId: name === undefined ? '' : profileId, name: sanitizePersonName(name ?? row.name) } : row)
      try { localStorage.setItem(`overroll.web.${game}.players`, JSON.stringify(rows)) } catch { /* Ignore unavailable storage. */ }
      updated[game] = rows
    }
    setOtherProfilePlayers(updated)
  }

  function assignOtherProfile(game: string, index: number, profileId: string) {
    const profile = profiles.find((item) => item.id === profileId)
    const rows = (otherProfilePlayers[game] ?? []).map((player, position) => position === index ? { ...player, profileId, name: sanitizePersonName(profile?.name ?? player.name) } : player)
    try { localStorage.setItem(`overroll.web.${game}.players`, JSON.stringify(rows)) } catch { /* Keep the editor usable when storage is blocked. */ }
    setOtherProfilePlayers((current) => ({ ...current, [game]: rows }))
    playSound('profileAssign')
  }

  function classifyVisible() {
    if (!currentProfile || !classifiedHeroes.length) return
    const keys = new Set(classifiedHeroes.map((hero) => hero.key))
    setProfiles((current) => current.map((profile) => profile.id === currentProfile.id ? { ...profile, heroes: Object.fromEntries(profileBuckets.map((bucket) => [bucket, [...profile.heroes[bucket].filter((key) => !keys.has(key)), ...(bucket === profileBulkBucket ? keys : [])]])) as Record<ProfileBucket, string[]> } : profile))
    playSound('profileClassify')
  }

  function profileMarkedCount(profile: UserProfile) {
    return profileBuckets.reduce((sum, bucket) => sum + profile.heroes[bucket].filter((key) => data?.heroes.some((hero) => hero.key === key)).length, 0)
  }

  function profileAssignedCount(profileId: string) {
    return players.filter((player) => player.profileId === profileId).length
      + tf2Players.filter((player) => player.profileId === profileId).length
      + Object.values(otherProfilePlayers).flat().filter((player) => player.profileId === profileId).length
  }

  function duplicateCurrentProfile() {
    if (!currentProfile) return
    const id = `profile-${Date.now()}`
    const copy: UserProfile = {
      id,
      name: sanitizePersonName(`${currentProfile.name}copia`, PROFILE_NAME_MAX_LENGTH),
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
            <h1>Perfiles</h1>
          </div>
          <button type="button" className="primary" onClick={createProfile}><Icon name="plus" size={16} /> Nuevo perfil</button>
        </header>

        {profiles.length === 0 ? (
          <section className="profiles-simple-empty">
            <Icon name="profile" size={42} />
            <h2>Crea tu primer perfil</h2>

            <button type="button" className="primary" onClick={createProfile}><Icon name="plus" size={16} /> Crear perfil</button>
          </section>
        ) : (
          <>
            <div className="profiles-workspace">
            <nav className="profiles-switcher" aria-label="Perfiles">{profiles.map((profile) => <button type="button" key={profile.id} className={profile.id === currentProfileId ? 'active' : ''} aria-pressed={profile.id === currentProfileId} onClick={() => { setCurrentProfileId(profile.id); playSound('profileSelect') }}><i translate="no">{profile.name.slice(0, 2).toLocaleUpperCase(activeLocale)}</i><strong translate="no">{profile.name}</strong><span>{profileMarkedCount(profile)} / {totalHeroes}</span></button>)}</nav>
            <div className="profiles-content">
            <section className="profiles-simple-toolbar">
              <label>
                <span>Perfil</span>
                <select value={currentProfileId} onChange={(event: ChangeEvent<HTMLSelectElement>) => { setCurrentProfileId(event.target.value); playSound('profileSelect') }}>
                  {profiles.map((profile) => <option value={profile.id} key={profile.id} translate="no">{profile.name}</option>)}
                </select>
              </label>

              {currentProfile && (
                <>
                  <label className="profile-name-field">
                    <span>Nombre</span>
                    <input value={currentProfile.name} onChange={(event: ChangeEvent<HTMLInputElement>) => renameCurrentProfile(event.target.value)} onFocus={() => playSound('profileSelect')} maxLength={PROFILE_NAME_MAX_LENGTH} pattern={PERSON_NAME_PATTERN} title={PERSON_NAME_HINT} />
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
                <nav className="profiles-simple-tabs" aria-label="Secciones del perfil" role="tablist">
                  <button type="button" role="tab" tabIndex={profileTab === 'heroes' ? 0 : -1} id="profile-tab-heroes" aria-selected={profileTab === 'heroes'} aria-controls="profile-panel" className={profileTab === 'heroes' ? 'active' : ''} onClick={() => { setProfileTab('heroes'); playSound('nav') }} onKeyDown={(event) => { const tabs = ['heroes', 'players', 'mode'] as const; const index = tabs.indexOf(profileTab); const next = event.key === 'ArrowRight' ? tabs[(index + 1) % 3] : event.key === 'ArrowLeft' ? tabs[(index + 2) % 3] : event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[2] : null; if (next) { event.preventDefault(); setProfileTab(next); playSound('nav'); document.getElementById('profile-tab-' + next)?.focus() } } }>
                    <Icon name="gamepad" size={16} /> Héroes
                  </button>
                  <button type="button" role="tab" tabIndex={profileTab === 'players' ? 0 : -1} id="profile-tab-players" aria-selected={profileTab === 'players'} aria-controls="profile-panel" className={profileTab === 'players' ? 'active' : ''} onClick={() => { setProfileTab('players'); playSound('nav') }} onKeyDown={(event) => { const tabs = ['heroes', 'players', 'mode'] as const; const index = tabs.indexOf(profileTab); const next = event.key === 'ArrowRight' ? tabs[(index + 1) % 3] : event.key === 'ArrowLeft' ? tabs[(index + 2) % 3] : event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[2] : null; if (next) { event.preventDefault(); setProfileTab(next); playSound('nav'); document.getElementById('profile-tab-' + next)?.focus() } } }>
                    <Icon name="users" size={16} /> Jugadores {assignedPlayers > 0 && <b>{assignedPlayers}</b>}
                  </button>
                  <button type="button" role="tab" tabIndex={profileTab === 'mode' ? 0 : -1} id="profile-tab-mode" aria-selected={profileTab === 'mode'} aria-controls="profile-panel" className={profileTab === 'mode' ? 'active' : ''} onClick={() => { setProfileTab('mode'); playSound('nav') }} onKeyDown={(event) => { const tabs = ['heroes', 'players', 'mode'] as const; const index = tabs.indexOf(profileTab); const next = event.key === 'ArrowRight' ? tabs[(index + 1) % 3] : event.key === 'ArrowLeft' ? tabs[(index + 2) % 3] : event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[2] : null; if (next) { event.preventDefault(); setProfileTab(next); playSound('nav'); document.getElementById('profile-tab-' + next)?.focus() } } }>
                    <Icon name="settings" size={16} /> Reglas
                  </button>
                </nav>

                <div id="profile-panel" role="tabpanel" aria-labelledby={'profile-tab-' + profileTab}>
                {profileTab === 'heroes' && (
                  <div className="profiles-simple-section">
                    <div className="profiles-hero-toolbar">
                      <div className="profile-search">
                        <Icon name="filter" size={16} />
                        <input value={profileSearch} onFocus={() => playSound('click')} onChange={(event: ChangeEvent<HTMLInputElement>) => setProfileSearch(event.target.value)} placeholder="Buscar héroe…" />
                      </div>
                      <div className="role-filter-tabs">
                        <button type="button" className={profileRole === 'all' ? 'active' : ''} onClick={() => { setProfileRole('all'); playSound('click') }}>Todos</button>
                        {roles.map((role) => (
                          <button type="button" className={`${role} ${profileRole === role ? 'active' : ''}`} onClick={() => { setProfileRole(role); playSound('click') }} key={role}>{roleLabels[role]}</button>
                        ))}
                      </div>
                    </div>

                    <div className="profiles-simple-hint">
                      <strong translate="no">Overwatch</strong>
                      <select aria-label="Filtrar categoría" value={profileBucketFilter} onChange={(event) => { setProfileBucketFilter(event.target.value as typeof profileBucketFilter); playSound('profileSelect') }}><option value="all">Todos</option><option value="unmarked">Sin clasificar</option>{profileBuckets.map((bucket) => <option key={bucket} value={bucket}>{bucketLabels[bucket]}</option>)}</select>
                      <div className="profile-bulk"><select aria-label="Clasificación" value={profileBulkBucket} onChange={(event) => { setProfileBulkBucket(event.target.value as typeof profileBulkBucket); playSound('profileSelect') }}><option value="">Sin clasificar</option>{profileBuckets.map((bucket) => <option key={bucket} value={bucket}>{bucketLabels[bucket]}</option>)}</select><button type="button" onClick={classifyVisible} disabled={!classifiedHeroes.length}>Aplicar a visibles</button></div>
                      {markedHeroes > 0 && <button type="button" onClick={clearCurrentProfile}><Icon name="reset" size={14} /> Reiniciar</button>}
                    </div>

                    <div className="profiles-simple-grid">
                      {!classifiedHeroes.length && <p className="profile-no-results">Sin resultados</p>}
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
                      <div><h2>Asignar a jugadores</h2></div>
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
                              <span><strong translate="no">{player.name || `Jugador${index + 1}`}</strong><small>{assigned ? <span translate="no">{currentProfile.name}</span> : otherProfile ? <span translate="no">{otherProfile.name}</span> : 'Sin perfil'}</small></span>
                              <Icon name={assigned ? 'check' : 'profile'} size={18} />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    {Object.entries(otherProfilePlayers).filter(([, roster]) => roster.length > 0).map(([game, roster]) => <div className="profiles-game-assignment" key={game}><div className="profiles-game-label"><strong translate="no">{game === 'pvz' ? 'Plants vs. Zombies GW2' : rosterGameDefinitions.find((item) => item.id === game)?.name}</strong><small>{roster.length} fichas</small></div><div className="profiles-player-list">{roster.map((player, index) => { const assigned = player.profileId === currentProfile.id; return <button type="button" className={assigned ? 'assigned' : ''} onClick={() => assignOtherProfile(game, index, assigned ? '' : currentProfile.id)} key={player.id}><span className="player-number">{String(index + 1).padStart(2, '0')}</span><span><strong translate="no">{player.name || localizedPlayerName(activeLocale, index + 1)}</strong><small>{player.profileId ? <span translate="no">{profiles.find((profile) => profile.id === player.profileId)?.name ?? player.name}</span> : 'Sin perfil'}</small></span><Icon name={assigned ? 'check' : 'profile'} size={18} /></button> })}</div></div>)}
                    <div className="profiles-game-assignment tf2-assignment">
                      <div className="profiles-game-label"><span className="settings-game-dot" style={{ '--module-accent': '#e8a45b' } as CSSProperties} /><strong>Team Fortress 2</strong><small>{tf2Players.length} fichas</small></div>
                      <div className="profiles-player-list">
                        {tf2Players.map((player, index) => {
                          const assigned = player.profileId === currentProfile.id
                          const otherProfile = profiles.find((profile) => profile.id === player.profileId)
                          return (
                            <button type="button" className={assigned ? 'assigned' : ''} onClick={() => tf2AssignPlayerProfile(index, assigned ? '' : currentProfile.id)} key={player.id}>
                              <span className="player-number">{String(index + 1).padStart(2, '0')}</span>
                              <span><strong translate="no">{player.name || `Jugador${index + 1}`}</strong><small>{assigned ? <span translate="no">{currentProfile.name}</span> : otherProfile ? <span translate="no">{otherProfile.name}</span> : 'Sin perfil'}</small></span>
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
                      <div><h2>Reglas del perfil</h2></div>
                    </header>
                    <span className="profile-game-scope" translate="no">Overwatch</span>
                    <div className="profiles-mode-list">
                      {profileModes.map((mode) => (
                        <button type="button" title={mode.description} className={profileMode === mode.id ? 'active' : ''} onClick={() => { setProfileMode(mode.id); playSound('profileSelect') }} aria-pressed={profileMode === mode.id} key={mode.id}>
                          <span className="mode-radio"><i /></span>
                          <span><strong>{mode.name}</strong></span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                </div>
              </section>
            )}
            </div></div>
          </>
        )}
      </main>
    )
  }

  function renderMore() {
    const tabs: Array<{ id: SettingsTab; label: string; icon: IconName }> = [
      { id: 'general', label: t('tab_general'), icon: 'settings' },
      { id: 'page-design', label: 'Diseño de página', icon: 'spark' },
      { id: 'card-design', label: 'Diseño de fichas', icon: 'details' },
      { id: 'audio', label: t('tab_audio'), icon: 'sound' },
      { id: 'language', label: t('tab_language'), icon: 'language' },
      { id: 'catalogs', label: t('tab_games'), icon: 'gamepad' },
      { id: 'credits', label: t('tab_credits'), icon: 'spark' },
    ]
    const selectedTab = tabs.find((tab) => tab.id === settingsTab) ?? tabs[0]
    const switchRow = (label: string, checked: boolean, change: (value: boolean) => void, disabled = false, feedback = true) => (
      <label className={`preference-row ${disabled ? 'disabled' : ''}`}>
        <span>{label}</span>
        <input className="preference-checkbox" type="checkbox" checked={checked} disabled={disabled} onChange={(event) => { change(event.target.checked); if (feedback) toggleRuleSound(event.target.checked) }} />
        <span className="preference-switch" aria-hidden="true"><span /></span>
      </label>
    )

    return (
      <main className="utility-page preferences-page">
        <header className="preferences-header">
          <h1>{t('settings_title')}</h1>
          <button type="button" className="preferences-back" onClick={() => navigate('principal')}><Icon name="close" size={18} /><span>Volver</span></button>
        </header>
        <div className="preferences-layout">
          <nav className="preferences-nav" role="tablist" aria-label="Configuración" aria-orientation="vertical">
            {tabs.map((tab, index) => (
              <button type="button" id={`preferences-tab-${tab.id}`} role="tab" aria-selected={settingsTab === tab.id} aria-controls={`preferences-panel-${tab.id}`} tabIndex={settingsTab === tab.id ? 0 : -1} className={settingsTab === tab.id ? 'active' : ''} key={tab.id}
                onClick={() => { setSettingsTab(tab.id); playSound('click') }}
                onKeyDown={(event) => {
                  const step = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 0
                  if (!step && event.key !== 'Home' && event.key !== 'End') return
                  event.preventDefault()
                  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + step + tabs.length) % tabs.length
                  setSettingsTab(tabs[next].id)
                  playSound('nav')
                  event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
                }}>
                <Icon name={tab.icon} size={18} /><span>{tab.label}</span>
              </button>
            ))}
          </nav>
          <section className="preferences-panel" id={`preferences-panel-${selectedTab.id}`} role="tabpanel" aria-labelledby={`preferences-tab-${selectedTab.id}`}>
            <header className="preferences-panel-header"><h2>{selectedTab.label}</h2></header>
            {settingsTab === 'general' && <>
              <div className="preferences-rows">
                {switchRow('Animaciones', animationsEnabled, setAnimationsEnabled)}
                {switchRow('Mejoras compactas', compactPerks, setCompactPerks)}
                {switchRow('Vista compacta en móvil', mobileCompactMode, setMobileCompactMode)}
                {switchRow('Modo ligero', lowPowerMode, setLowPowerMode)}
              </div>
              <footer className="preferences-actions">
                <button type="button" onClick={restoreRecommendedSettings}><Icon name="reset" size={16} />Restablecer ajustes</button>
                <button type="button" className="preferences-danger" onClick={resetLocalData}><Icon name="trash" size={16} />Borrar datos guardados</button>
              </footer>
            </>}
            {settingsTab === 'card-design' && <CardDesignOptions value={cardDesign} locale={activeLocale} asset={asset} onChange={(value) => { setCardDesign(value); playSound('click') }} />}
            {settingsTab === 'page-design' && <PageThemeOptions value={pageTheme} locale={activeLocale} onChange={(value) => { setPageTheme(value); playSound('click') }} />}
            {settingsTab === 'audio' && <>
              <div className="preferences-rows">
                {switchRow('Sonidos', soundEnabled, () => toggleSounds(), false, false)}
                <label className={`preference-row preference-volume ${!soundEnabled ? 'disabled' : ''}`}>
                  <span>Volumen</span>
                  <input type="range" min="0" max="1" step="0.05" value={soundVolume} disabled={!soundEnabled} onChange={(event) => setSoundVolume(Number(event.target.value))} onPointerUp={() => playSound('click')} onKeyUp={(event) => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) playSound('click') }} />
                  <output>{Math.round(soundVolume * 100)}%</output>
                </label>
                {switchRow('Sonido al pasar el mouse', hoverSounds, setHoverSounds, !soundEnabled)}
              </div>
              <footer className="preferences-actions"><button type="button" disabled={!soundEnabled} onClick={playConfirmTone}><Icon name="sound" size={16} />Probar sonido</button></footer>
            </>}
            {settingsTab === 'language' && <div className="preferences-rows">
              <label className="preference-row preference-language"><span>{t('tab_language')}</span>
                <select value={localePreference} onChange={(event) => { setLocalePreference(event.target.value as LocalePreference); playSound('click') }}>
                  <option value="auto">{t('language_auto_title')} · {localeName(browserLocale)}</option>
                  {localeChoices.map((choice) => <option value={choice.id} lang={choice.id} key={choice.id}>{choice.name}</option>)}
                </select>
              </label>
            </div>}
            {settingsTab === 'catalogs' && <div className="preferences-games">
              {gameModules.map((game) => <button type="button" className={game.id === activeGame ? 'selected' : ''} onClick={() => game.available ? activateGame(game.id) : notify(`${game.name}: ${game.status}`, 'info')} key={game.id}>
                <img src={asset(game.icon)} alt="" decoding="async" />
                <span><strong>{game.name}</strong><small>{game.catalogLabel}</small></span>
                <span className="preferences-game-action">{game.id === activeGame ? <Icon name="check" size={18} /> : 'Abrir'}</span>
              </button>)}
            </div>}
            {settingsTab === 'credits' && <div className="preferences-credits">
              <div className="preferences-credit-main">
                <div><h3>OverRoll</h3><p>Creado por <strong>SHAGGOS</strong></p><a href="https://github.com/SHAGGOS2/OverRoll" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a></div>
                <a className="preferences-hammond" href={creditsSongUrl(activeLocale)} target="_blank" rel="noreferrer" title={t('credits_hammond_hint')}><img src={asset('assets/hammond_credits.gif')} alt={t('credits_hammond_alt')} /></a>
              </div>
              <p className="preferences-attribution">Proyecto independiente. Sin afiliación ni respaldo de las empresas citadas.</p>
              <div className="game-credits-list">{gameCredits.map((credit) => <article key={credit.game}>
                <h3><a href={credit.url} target="_blank" rel="noreferrer noopener">{credit.game} ↗</a></h3>
                <dl><div><dt>Desarrollo</dt><dd translate="no">{credit.development}</dd></div><div><dt>Edición</dt><dd translate="no">{credit.publishing}</dd></div><div><dt>Marcas y personajes</dt><dd translate="no">{credit.rights}</dd></div></dl>
                {credit.notice && <small translate="no">{credit.notice}</small>}
              </article>)}</div>
              <p className="preferences-attribution">Interfaz e iconos propios · OverRoll / SHAGGOS</p>
            </div>}
          </section>
        </div>
      </main>
    )
  }
  return localizeUi(activeLocale,
    <div className={`app view-${activeView} ${animationsEnabled ? '' : 'reduce-motion'} ${compactPerks ? 'compact-perks' : ''} ${lowPowerMode ? 'low-power' : ''} ${mobileCompactMode ? 'mobile-compact' : ''}`}>
      <div className="ambient-grid" /><div className="ambient-orb orb-one" /><div className="ambient-orb orb-two" /><div className="noise-layer" />
      <ThemeBackdrop theme={pageTheme} />

      <AppHeader animationsEnabled={animationsEnabled && !lowPowerMode} onMenuToggle={(open) => playSound(open ? 'open' : 'close')} logoSrc={`${baseUrl}app_icon.png`} games={gameModules} activeGame={activeGame} activeView={activeView} locale={activeLocale} asset={asset} onGameChange={activateGame} onNavigate={navigate} onHover={hoverSound} />

      {activeGame === 'pvzgw2' && (activeView === 'principal' || activeView === 'roulette') && (
        <PvzModule
          view={activeView}
          profiles={profiles.map(({ id, name }) => ({ id, name }))}
          baseUrl={baseUrl}
          animationsEnabled={animationsEnabled}
          cardDesign={cardDesign}
          barMotion={barMotion}
          soundEnabled={soundEnabled}
          soundVolume={soundVolume}
          mobileCompactMode={mobileCompactMode}
          locale={activeLocale}
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
          cardDesign={cardDesign}
          barMotion={barMotion}
          soundEnabled={soundEnabled}
          soundVolume={soundVolume}
          mobileCompactMode={mobileCompactMode}
          locale={activeLocale}
          notify={notify}
          playUiSound={playSound}
          playConfirmTone={playConfirmTone}
        />
      )}
      {activeGame !== 'pvzgw2' && !isRosterGame(activeGame) && activeView === 'principal' && (activeGame === 'tf2' ? renderTf2Principal() : renderPrincipal())}
      {activeGame !== 'pvzgw2' && !isRosterGame(activeGame) && activeView === 'roulette' && (activeGame === 'tf2' ? <SharedRoulette key="tf2" gameId="tf2" title="Team Fortress 2" items={tf2Classes.map((item) => ({ ...item, role: item.group, icon: 'assets/tf2/icons/' + item.key.replace(/^tf2-/, '') + '.png' }))} roles={tf2Groups.map((id) => ({ id, label: tf2GroupLabels[id], color: tf2GroupColors[id] }))} storagePrefix="overroll.web.tf2" legacySelectionKey="rouletteSelectedKeys" baseUrl={baseUrl} locale={activeLocale} animationsEnabled={animationsEnabled} notify={notify} onSpin={() => playSound('tf2RouletteSpin')} onWin={() => playSound('tf2RouletteWin')} /> : data ? <SharedRoulette key="overwatch" gameId="overwatch" title="Overwatch" items={data.heroes} roles={roles.map((id) => ({ id, label: roleLabels[id], color: rouletteRoleColors[id], icon: 'assets/roles/' + id + '.png' }))} storagePrefix="overroll.web" legacySelectionKey="rouletteSelectedKeys" baseUrl={baseUrl} locale={activeLocale} animationsEnabled={animationsEnabled} notify={notify} onSpin={() => playSound('generate')} onWin={playConfirmTone} /> : null)}
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
                    <div><small>{stadium ? `PODER ${index + 1}` : selectedDetailHero.minorPerks.some((item) => item.name === perk.name) ? 'VENTAJA MENOR' : 'VENTAJA MAYOR'}</small><strong translate="no" lang={activeLocale}>{perkText(selectedDetailHero, perk).name}</strong><p translate="no" lang={activeLocale}>{perkText(selectedDetailHero, perk).description}</p></div>
                  </article>
                ))}
              </div>

              <div className="drawer-section-title catalog-title"><Icon name={stadium ? 'stadium' : 'details'} size={17} /><span>{stadium ? 'Catálogo Stadium · elige hasta 4' : 'Catálogo Quick Play · una menor y una mayor'}</span></div>
              <div className="perk-grid">
                {(stadium ? selectedDetailHero.stadiumPowers : [...selectedDetailHero.minorPerks, ...selectedDetailHero.majorPerks]).map((perk, index) => {
                  const selected = selectedDetailPick?.perks.some((item) => item.name === perk.name)
                  return (
                    <button type="button" className={`perk-card detailed selectable ${selected ? 'selected' : ''}`} onClick={() => toggleManualPerk(perk)} key={`${perk.name}-${index}`}>
                      {perk.icon ? <img src={asset(perk.icon)} alt="" loading="lazy" /> : <Icon name="spark" size={22} />}
                      <div><span>{selected ? '✓' : String(index + 1).padStart(2, '0')}</span><strong translate="no" lang={activeLocale}>{perkText(selectedDetailHero, perk).name}</strong><small>{stadium ? 'PODER STADIUM' : index < selectedDetailHero.minorPerks.length ? 'VENTAJA MENOR' : 'VENTAJA MAYOR'}</small><p translate="no" lang={activeLocale}>{perkText(selectedDetailHero, perk).description}</p></div>
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>
        </div>
      )}

      <AnimatedLayer open={Boolean(activeGame === 'overwatch' && filterIndex !== null && filterPlayer)} enabled={animationsEnabled} onClose={closeFilter} className="filter-layer">{activeGame === 'overwatch' && filterIndex !== null && filterPlayer && (<>
          <section className="filter-dialog" role="dialog" aria-modal="true" aria-label={`Filtro de ${filterPlayer.name}`}>
            <header className="filter-heading">
              <div><span className="eyebrow">Filtro individual</span><h2 translate="no">{filterPlayer.name || `Jugador${filterIndex + 1}`}</h2><p>{availableHeroes.length - filterPlayer.blocked.length} visibles · {filterPlayer.blocked.length} bloqueados</p></div>
              <button type="button" onClick={closeFilter} aria-label="Cerrar filtro"><Icon name="close" size={20} /></button>
            </header>

            <div className="filter-toolbar">
              <div className="profile-search"><Icon name="filter" size={16} /><input value={filterSearch} onFocus={() => playSound('click')} onChange={(event: ChangeEvent<HTMLInputElement>) => setFilterSearch(event.target.value)} placeholder="Buscar héroe…" /></div>
              <div className="role-filter-tabs">
                <button type="button" className={filterRole === 'all' ? 'active' : ''} onClick={() => { setFilterRole('all'); playSound('click') }}>Todos</button>
                {roles.map((role) => <button type="button" className={`${role} ${filterRole === role ? 'active' : ''}`} onClick={() => { setFilterRole(role); playSound('click') }} key={role}>{roleLabels[role]}</button>)}
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
        </>)}</AnimatedLayer>

      <AnimatedLayer open={Boolean(activeGame === 'tf2' && tf2FilterIndex !== null && tf2FilterPlayer)} enabled={animationsEnabled} onClose={closeTf2Filter} className="filter-layer tf2-filter-layer">{activeGame === 'tf2' && tf2FilterIndex !== null && tf2FilterPlayer && (<>
          <section className="filter-dialog tf2-filter-dialog" role="dialog" aria-modal="true" aria-label={`Filtro TF2 de ${tf2FilterPlayer.name}`}>
            <header className="filter-heading"><div><span className="eyebrow">Filtro individual · TF2</span><h2 translate="no">{tf2FilterPlayer.name || `Jugador${tf2FilterIndex + 1}`}</h2><p>{tf2Classes.length - tf2FilterPlayer.blocked.length} permitidas · {tf2FilterPlayer.blocked.length} bloqueadas</p></div><button type="button" onClick={closeTf2Filter} aria-label="Cerrar filtro"><Icon name="close" size={20} /></button></header>
            <div className="filter-toolbar"><div className="profile-search"><Icon name="filter" size={16} /><input value={tf2FilterSearch} onFocus={() => playSound('click')} onChange={(event: ChangeEvent<HTMLInputElement>) => setTf2FilterSearch(event.target.value)} placeholder="Buscar clase…" /></div><div className="role-filter-tabs tf2-filter-tabs"><button type="button" className={tf2FilterGroup === 'all' ? 'active' : ''} onClick={() => { setTf2FilterGroup('all'); playSound('click') }}>Todas</button>{tf2Groups.map((group) => <button type="button" className={`${group} ${tf2FilterGroup === group ? 'active' : ''}`} onClick={() => { setTf2FilterGroup(group); playSound('click') }} key={group}>{tf2GroupLabels[group]}</button>)}</div><button type="button" className="reset-classification" onClick={clearTf2Filter}><Icon name="reset" size={15} /> Reiniciar</button></div>
            <div className="filter-hero-grid tf2-filter-class-grid">{tf2VisibleFilterClasses.map((item) => { const blocked = tf2FilterPlayer.blocked.includes(item.key); return <button type="button" className={`filter-hero tf2-filter-class ${item.group} ${blocked ? 'blocked' : ''}`} onClick={() => toggleTf2BlockedClass(item.key)} aria-pressed={blocked} key={item.key}><img src={asset(item.portrait)} alt={item.name} /><span><strong>{item.name}</strong><small>{blocked ? 'BLOQUEADA' : tf2GroupLabels[item.group].toUpperCase()}</small></span><i>{blocked ? '×' : '✓'}</i></button> })}</div>
          </section>
        </>)}</AnimatedLayer>

      {toast && <div className={`toast ${toast.tone}`} role="status"><span><Icon name={toast.tone === 'warning' ? 'warning' : toast.tone === 'success' ? 'check' : 'spark'} size={17} /></span><p>{toast.message}</p></div>}
    </div>
  , activeGame)
}

export default App
