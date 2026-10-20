import { officialGameNames } from './gameNames.ts'
import type { SupportedLocale } from './localization'
type Terms = Partial<Record<SupportedLocale, Record<string, string>>>
const terms: Record<string, Terms> = {
 valorant: {
  'de-de': { Controlador: 'Taktiker', Duelista: 'Duellant', Iniciador: 'Initiator', Centinela: 'Wächter' },
  'ko-kr': { Controlador: '전략가', Duelista: '타격대', Iniciador: '척후대', Centinela: '감시자' },
  'ja-jp': { Controlador: 'コントローラー', Duelista: 'デュエリスト', Iniciador: 'イニシエーター', Centinela: 'センチネル' },
 },
 paladins: { 'es-mx': { Frontline: 'Primera línea' }, 'es-es': { Frontline: 'Primera línea' }, 'en-us': { Frontline: 'Front Line' }, 'pt-br': { Frontline: 'Tanque' }, 'fr-fr': { Frontline: 'Tank', Daño: 'Dégâts', Flanco: 'Flanc', Apoyo: 'Soutien' }, 'de-de': { Frontline: 'Tank', Apoyo: 'Unterstützer' } },
 rivals: { 'ja-jp': { Vanguardia: 'ヴァンガード', Duelista: 'ファイター', Estratega: 'ストラテジスト' } },
 overwatch: {
  'es-mx': { Luchador: 'Fuerte', Vanguardia: 'Valeroso', Táctico: 'Estratega', Perks: 'Ventajas', Stadium: 'Estadio', 'Perks aleatorias': 'Ventajas aleatorias', 'Modo Stadium': 'Modo Estadio', 'Cuatro poderes Stadium': 'Cuatro poderes de Estadio', 'Perks y detalles': 'Ventajas y detalles', 'Perks elegidas': 'Ventajas elegidas' },
  'es-es': { Luchador: 'Fuerte', Vanguardia: 'Valeroso', Táctico: 'Estratega', Perks: 'Ventajas', Stadium: 'Estadio', 'Perks aleatorias': 'Ventajas aleatorias', 'Modo Stadium': 'Modo Estadio', 'Cuatro poderes Stadium': 'Cuatro poderes de Estadio', 'Perks y detalles': 'Ventajas y detalles', 'Perks elegidas': 'Ventajas elegidas' },
 },
}
export function gameTerm(game: string, locale: SupportedLocale, source: string): string | undefined {
 const trimmed = source.trim(), dictionary = terms[game]?.[locale]
 const key = dictionary && Object.keys(dictionary).find((value) => value.toLocaleLowerCase(locale) === trimmed.toLocaleLowerCase(locale))
 if (key && dictionary) {
  let value = dictionary[key]
  if (trimmed === trimmed.toLocaleUpperCase(locale)) value = value.toLocaleUpperCase(locale)
  return source.replace(trimmed, value)
 }
 const character = characterKeys[game]?.get(trimmed.toLocaleLowerCase('en-US'))
 if (character) {
   const name = officialGameNames[game]?.[locale]?.[character] ?? officialGameNames[game]?.['en-us']?.[character]
   if (name) return source.replace(trimmed, name)
 }
 return undefined
}

const characterKeys: Record<string, Map<string, string>> = Object.fromEntries(Object.entries(officialGameNames).map(([game, locales]) => [game, new Map(Object.values(locales).flatMap((names) => Object.entries(names ?? {}).map(([key, name]) => [name.toLocaleLowerCase('en-US'), key])))]))

// Current labels from the localized hero selectors take precedence over older news posts.
const currentOwSubroles = {
  "es-mx": {
    "Especialista": "Especialista",
    "Flanqueador": "Flanqueador",
    "Tirador": "Ojo de águila",
    "Reconocimiento": "Reconocimiento",
    "Táctico": "Estratega",
    "Médico": "Médico",
    "Superviviente": "Sobreviviente",
    "Iniciador": "Iniciador",
    "Vanguardia": "Inquebrantable",
    "Luchador": "Matón"
  },
  "es-es": {
    "Especialista": "Especialista",
    "Flanqueador": "Flanqueador",
    "Reconocimiento": "Reconocimiento",
    "Tirador": "Tirador",
    "Táctico": "Estratega",
    "Médico": "Médico",
    "Superviviente": "Superviviente",
    "Luchador": "Fuerte",
    "Iniciador": "Iniciador",
    "Vanguardia": "Valeroso"
  },
  "en-us": {
    "Flanqueador": "Flanker",
    "Reconocimiento": "Recon",
    "Tirador": "Sharpshooter",
    "Especialista": "Specialist",
    "Médico": "Medic",
    "Superviviente": "Survivor",
    "Táctico": "Tactician",
    "Luchador": "Bruiser",
    "Iniciador": "Initiator",
    "Vanguardia": "Stalwart"
  },
  "de-de": {
    "Reconocimiento": "Aufklärer",
    "Flanqueador": "Flankierer",
    "Tirador": "Scharfschütze",
    "Especialista": "Spezialist",
    "Médico": "Sanitäter",
    "Táctico": "Taktiker",
    "Superviviente": "Überlebenskünstler",
    "Vanguardia": "Bollwerk",
    "Luchador": "Frontbrecher",
    "Iniciador": "Vorprescher"
  },
  "fr-fr": {
    "Flanqueador": "Attaque par les flancs",
    "Reconocimiento": "Reconnaissance",
    "Especialista": "Spécialiste",
    "Tirador": "Spécialiste en précision",
    "Médico": "Secouriste",
    "Superviviente": "Survie",
    "Táctico": "Tactique",
    "Luchador": "Colosse",
    "Iniciador": "Engagement",
    "Vanguardia": "Indéfectible"
  },
  "pt-br": {
    "Tirador": "Artilharia",
    "Especialista": "Especialidade",
    "Flanqueador": "Flanqueamento",
    "Reconocimiento": "Reconhecimento",
    "Táctico": "Estratégia",
    "Médico": "Restauração",
    "Superviviente": "Sobrevivência",
    "Luchador": "Combate",
    "Iniciador": "Incursão",
    "Vanguardia": "Robustez"
  },
  "ja-jp": {
    "Tirador": "シャープシューター",
    "Especialista": "スペシャリスト",
    "Flanqueador": "フランカー",
    "Reconocimiento": "リコン",
    "Superviviente": "サバイバー",
    "Táctico": "タクティシャン",
    "Médico": "メディック",
    "Iniciador": "イニシエーター",
    "Vanguardia": "ストールワート",
    "Luchador": "ブルーザー"
  },
  "ko-kr": {
    "Tirador": "명사수",
    "Reconocimiento": "수색가",
    "Especialista": "전문가",
    "Flanqueador": "측면 공격가",
    "Superviviente": "생존왕",
    "Médico": "의무관",
    "Táctico": "전술가",
    "Vanguardia": "강건한 자",
    "Iniciador": "개시자",
    "Luchador": "투사"
  }
}
for (const [locale, values] of Object.entries(currentOwSubroles)) {
  terms.overwatch[locale as SupportedLocale] = { ...terms.overwatch[locale as SupportedLocale], ...values }
}
