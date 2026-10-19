# Fuentes de datos de juegos

OverRoll conserva snapshots locales para que el selector no dependa de una API
durante una partida. Las conexiones de red solo deben ejecutarse cuando el
usuario solicita una actualizacion.

## Disponibles

- Overwatch: snapshot local actualizable manualmente desde las páginas oficiales
  de héroes de Blizzard en español de México. La versión web se guarda en
  `web/public/data/heroes.json`, con retratos e iconos en `web/public/assets`.
- Marvel Rivals: catalogo local guardado por la aplicacion.
- Team Fortress 2: catalogo local de clases.
- Plants vs. Zombies: Garden Warfare 2: catalogo local de clases y variantes.
- Valorant: snapshot local de agentes y retratos. La app no incluye una clave
  de Riot ni consulta la API durante una partida.
- Last Flag: snapshot local mantenido desde el reparto publicado en su sitio oficial.
- Deadlock: snapshot local creado a partir de la API comunitaria documentada,
  incluyendo solo héroes con `player_selectable: true` y sin `disabled: true`.
  Catálogo web verificado el 19 de octubre de 2026: 43 héroes, con Rat King,
  Baba, Solomon, Deadman Danny y Violet. Nurse Harrow sigue pendiente de su
  lanzamiento del 20 de octubre. Los retratos se conservan dentro de la web.
- THE FINALS: catalogo local de tamanos, armas, especializaciones y artefactos.
- Paladins: 59 campeones y retratos locales. La API oficial de Hi-Rez documenta
  el catalogo y sus URL de iconos, pero exige Developer ID, Authentication Key
  y sesiones temporales. OverRoll no incluye ni almacena esas credenciales; el
  snapshot conserva una cache de retratos de Paladins Wiki.
- Apex Legends: 28 leyendas y clases extraidas del centro oficial de personajes
  de Electronic Arts. No se encontro una API publica oficial para este catalogo.
- FragPunk: 21 Lancers y retratos extraidos de los recursos publicados por el
  sitio oficial. No se encontro una API publica documentada.

## Referencias

- Overwatch: `https://overwatch.blizzard.com/es-mx/heroes/` y
  `https://overwatch.blizzard.com/en-us/news/patch-notes/live/2026/10/`.
  Catálogo web verificado el 19 de octubre de 2026: 54 héroes, sus ventajas
  menores y mayores, y los poderes de Estadio publicados. Sombra pertenece a
  Apoyo / Táctico. D.Mon usa el retrato 3D oficial guardado localmente como
  `assets/heroes/dmon-3d.png`, para evitar el retrato 2D antiguo y la dependencia
  de una URL externa. Doctrine también forma parte del catálogo local; la web
  solo consulta OverFast para él si recibe un snapshot antiguo sin ese héroe.
- Valorant: `https://developer.riotgames.com/docs/valorant` y
  `https://valorant-api.com/`.
- Last Flag: `https://lastflag.com/contestants/`.
- Deadlock: `https://api.deadlock-api.com/docs`,
  `https://api.deadlock-api.com/v1/assets/heroes` y
  `https://www.playdeadlock.com/cityneversleeps`.
  El calendario de estrenos se contrasta con las noticias oficiales de Valve:
  `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=1422450&count=30&maxlength=0`.
- THE FINALS: `https://www.thefinals.wiki/wiki/Builds`,
  `https://www.thefinals.wiki/wiki/Weapons` y
  `https://www.thefinals.wiki/wiki/Specializations`.
- Paladins: `https://www.hirezstudios.com/dev` y la guia oficial
  `https://www.hirezstudios.com/_files/ugd/126c6a_08bd7061efa1439b9a7f9ead5178904f.pdf`.
- Apex Legends: `https://www.ea.com/games/apex-legends/apex-legends/characters-hub`.
- FragPunk: `https://www.fragpunk.com/index.html`.

## Idiomas

- La interfaz general y los modulos de catalogo incluyen etiquetas para
  es-MX, es-ES, en-US, pt-BR, fr-FR, de-DE, ja-JP y ko-KR.
- Los nombres de personajes se conservan como nombres propios oficiales.
- Overwatch solo traduce nombres, perks y descripciones cuando esa localizacion
  existe en `heroes_snapshot.json`; en caso contrario usa el contenido ingles.

## Twitch y OBS

- OBS usa una ventana local transparente y no necesita credenciales.
- Twitch aun no inicia sesion ni consume chat.
- La futura conexion debe usar OAuth oficial y EventSub WebSocket. Nunca se
  deben guardar contrasenas de Twitch en la aplicacion.
