# Content and localization

Checked 19–20 October 2026. Company credits are maintained in `src/gameCredits.ts` with an official link per game. Attribution identifies developers, publishers and rights holders; it does not assert a license or endorsement. The credits identify OverRoll as independent and distinguish its own interface pictograms from game assets.

## Publisher terminology

- Overwatch: <https://overwatch.blizzard.com/es-mx/heroes/> and the equivalent `es-es`, `en-us`, `de-de`, `fr-fr`, `pt-br`, `ja-jp`, `ko-kr` lists. The current hero selector supplies the ten subrole labels. Regional differences include **Matón / Fuerte**, **Inquebrantable / Valeroso**, **Ojo de águila / Tirador**, **Sobreviviente / Superviviente** (LatAm / Spain). Current selectors take precedence over older news articles. Ventajas / Estadio: <https://news.blizzard.com/es-mx/article/24246206/overwatch-en-primer-plano-comienza-el-reinado-de-talon>.
- VALORANT: <https://playvalorant.com/ko-kr/console/>, <https://playvalorant.com/de-de/console/> and equivalent FR/PT/JA pages. Roles are game-specific: Korean Controller/Duelist/Initiator/Sentinel → 전략가/타격대/척후대/감시자; German Controller → Taktiker.
- Marvel Rivals: <https://www.marvelrivals.com/jp/heroes_data/index.html> and <https://www.neteasegames.com/jp/news/MarvelRivals/20250331/37027_1197300.html>. Japanese Duelist is ファイター; VALORANT uses デュエリスト.
- Paladins: publisher-maintained localized descriptions at <https://store.steampowered.com/app/1517480/Paladins_Starter_Edition/?l=spanish> and its `brazilian`, `french`, `german` versions. Front Line → Primera línea / Tanque / Tank / Tank.
- Apex: <https://help.ea.com/es-mx/articles/apex-legends/abilities/> — Leyendas; Asalto, Escaramuza, Reconocimiento, Control, Apoyo.
- THE FINALS: <https://www.reachthefinals.com/> — contestants, builds; Light / Medium / Heavy. Unverified localized item names retain their catalog names.
- FragPunk: <https://www.fragpunk.com/> — Lancers.
- Last Flag: <https://lastflag.com/contestants> and <https://lastflag.com/eula> — contestants; the independence notice also reflects section 7.1(c).
- TF2: <https://www.teamfortress.com/freetoplay/> — classes / mercenaries.
- Plants vs. Zombies Garden Warfare 2: <https://www.ea.com/games/plants-vs-zombies/plants-vs-zombies-garden-warfare-2> — characters, classes, plants / zombies.
- Deadlock: <https://forums.playdeadlock.com/categories/art-feedback-heroes.14/> — heroes; no invented rigid roles.

## Character names and fallback

`src/gameNames.ts` retains the publisher URLs and retrieval date for all 54 Overwatch heroes and 29 VALORANT agents across eight localized lists. Source slugs provide stable identifiers; existing local portraits, role assignments and filters remain authoritative for functionality. Proper names are matched independently of UI terminology. Unsupported or unverified translations retain a canonical name. Other third-party catalogs and items retain their canonical names when a localized publisher payload is unavailable. The Overwatch perk content policy is documented below.

Nine interface locales are supported. The React output localizer handles text, placeholders, tooltips and accessible names before reconciliation. It leaves input values, handlers, IDs and user names unchanged. Terms are scoped by game and Spanish region. Overwatch perk names and descriptions use the selected content locale, independently of the interface text dictionary. Other game content without a verified localized payload retains its catalog language.

OverFast and Deadlock API are community services, not publisher APIs.

## Overwatch perks and Stadium powers

`public/data/overwatch-texts/<locale>.json` contains 612 plain-text names and descriptions per locale: 216 normal perks and 396 Stadium powers across the current 54-hero catalog. The eight `es-mx`, `es-es`, `en-us`, `de-de`, `fr-fr`, `pt-br`, `ja-jp` and `ko-kr` dictionaries were matched to the current localized Blizzard hero pages on 20 October 2026. `sources.json` records those publisher URLs.

Simplified Chinese uses verified mainland publisher names when the current icon identity matches. Mainland descriptions were incomplete or outdated, so most descriptions and the remaining names are editorial regional adaptations of the current official Traditional Chinese pages, checked against current English mechanics and values. They are not represented as official mainland translations. `zh-cn-provenance.json` records the source and adaptation for every entry, including the mainland payload at <https://ld5.res.netease.com/pc/zt/20241115153332/static/heroConfigs.json>.

Keys combine hero, group (`minorPerks`, `majorPerks`, `stadiumPowers`) and canonical local icon path. Group is required because seven normal perks share a name and icon with a different Stadium power. Presentation translation never mutates stored selections. Cards, detail drawers, tooltips and exported image labels use the same resolver. Locale loads are cached separately and can be retried; non-Spanish locales do not temporarily display Spanish perk content.
