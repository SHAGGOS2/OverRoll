const STORAGE_PREFIX = 'overroll.web.'
const SCHEMA_KEY = `${STORAGE_PREFIX}schemaVersion`
const CURRENT_SCHEMA = 2

type JsonRecord = Record<string, unknown>

type EnumRepair = {
  allowed: readonly string[]
  fallback: string
  aliases?: Record<string, string>
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function readValue(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return undefined
    return JSON.parse(raw) as unknown
  } catch {
    return undefined
  }
}

function writeValue(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // El navegador puede bloquear el almacenamiento; la app debe seguir abriendo.
  }
}

function removeValue(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // El navegador puede bloquear el almacenamiento; la app debe seguir abriendo.
  }
}

function repairBoolean(key: string, fallback: boolean) {
  const value = readValue(key)
  if (value === undefined) return
  if (typeof value === 'boolean') return
  if (value === 'true' || value === 1) writeValue(key, true)
  else if (value === 'false' || value === 0) writeValue(key, false)
  else writeValue(key, fallback)
}

function repairNumber(key: string, fallback: number, minimum: number, maximum: number) {
  const value = readValue(key)
  if (value === undefined) return
  const parsed = typeof value === 'number' ? value : Number(value)
  writeValue(key, Number.isFinite(parsed) ? Math.max(minimum, Math.min(maximum, parsed)) : fallback)
}

function repairString(key: string, fallback = '') {
  const value = readValue(key)
  if (value === undefined) return
  writeValue(key, typeof value === 'string' ? value : fallback)
}

function repairEnum(key: string, options: EnumRepair) {
  const value = readValue(key)
  if (value === undefined) return
  if (typeof value === 'string') {
    const normalized = options.aliases?.[value] ?? value
    if (options.allowed.includes(normalized)) {
      writeValue(key, normalized)
      return
    }
  }
  writeValue(key, options.fallback)
}

function repairStringArray(key: string) {
  const value = readValue(key)
  if (value === undefined) return
  if (!Array.isArray(value)) {
    removeValue(key)
    return
  }
  writeValue(key, value.filter((item): item is string => typeof item === 'string'))
}

function repairArray(key: string) {
  const value = readValue(key)
  if (value !== undefined && !Array.isArray(value)) removeValue(key)
}

function repairWeightRecord(key: string) {
  const value = readValue(key)
  if (value === undefined) return
  if (!isRecord(value)) {
    removeValue(key)
    return
  }
  const repaired: Record<string, number> = {}
  Object.entries(value).forEach(([itemKey, rawWeight]) => {
    const weight = Number(rawWeight)
    if (Number.isFinite(weight)) repaired[itemKey] = Math.max(1, Math.min(64, Math.round(weight)))
  })
  writeValue(key, repaired)
}

function repairRoleRecord(key: string) {
  const value = readValue(key)
  if (value === undefined) return
  if (!isRecord(value)) {
    writeValue(key, { tank: true, damage: true, support: true })
    return
  }
  writeValue(key, {
    tank: value.tank !== false,
    damage: value.damage !== false,
    support: value.support !== false,
  })
}

export function repairOverRollStorage() {
  if (typeof window === 'undefined') return

  repairEnum(`${STORAGE_PREFIX}activeGame`, {
    allowed: ['overwatch', 'tf2', 'pvzgw2'],
    fallback: 'overwatch',
    aliases: { pvz: 'pvzgw2', gardenwarfare2: 'pvzgw2' },
  })
  repairEnum(`${STORAGE_PREFIX}profileMode`, {
    allowed: ['classic', 'allprofile', 'lowprob', 'practice', 'played', 'prefer', 'main'],
    fallback: 'classic',
  })
  repairString(`${STORAGE_PREFIX}currentProfileId`)

  ;[
    'avoidRepeated',
    'roleComposition',
    'rolesOnly',
    'randomPerks',
    'stadium',
    'soundEnabled',
    'hoverSounds',
    'animationsEnabled',
    'compactPerks',
    'lowPowerMode',
    'mobileCompactMode',
    'rouletteInitialized',
    'tf2.avoidRepeated',
    'pvz.avoidRepeated',
    'pvz.useVariants',
    'pvz.includeDlc',
    'pvz.sideSwitchEnabled',
  ].forEach((suffix) => repairBoolean(`${STORAGE_PREFIX}${suffix}`, suffix !== 'rolesOnly' && suffix !== 'stadium' && suffix !== 'hoverSounds' && suffix !== 'compactPerks' && suffix !== 'lowPowerMode'))

  repairNumber(`${STORAGE_PREFIX}soundVolume`, 0.42, 0, 1)
  repairRoleRecord(`${STORAGE_PREFIX}rouletteRolesEnabled`)

  ;[
    'rouletteSelectedKeys',
    'tf2.rouletteSelectedKeys',
    'pvz.rouletteSelectedKeys',
  ].forEach((suffix) => repairStringArray(`${STORAGE_PREFIX}${suffix}`))

  ;[
    'rouletteWeights',
    'tf2.rouletteWeights',
    'pvz.rouletteWeights',
  ].forEach((suffix) => repairWeightRecord(`${STORAGE_PREFIX}${suffix}`))

  ;[
    'players',
    'profiles',
    'tf2.players',
    'pvz.players',
    'pvz.picks',
  ].forEach((suffix) => repairArray(`${STORAGE_PREFIX}${suffix}`))

  repairEnum(`${STORAGE_PREFIX}pvz.rouletteSide`, {
    allowed: ['plants', 'zombies'],
    fallback: 'plants',
    aliases: { plant: 'plants', zombie: 'zombies' },
  })

  writeValue(SCHEMA_KEY, CURRENT_SCHEMA)
}

export function clearOverRollStorage() {
  if (typeof window === 'undefined') return
  try {
    const keys: string[] = []
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index)
      if (key?.startsWith(STORAGE_PREFIX)) keys.push(key)
    }
    keys.forEach((key) => window.localStorage.removeItem(key))
  } catch {
    // La recarga seguirá funcionando aunque el almacenamiento esté bloqueado.
  }
}
