# Fuentes de datos de juegos

OverRoll conserva snapshots locales para que el selector no dependa de una API
durante una partida. Las conexiones de red solo deben ejecutarse cuando el
usuario solicita una actualizacion.

## Disponibles

- Overwatch: snapshot local actualizable manualmente.
- Marvel Rivals: catalogo local guardado por la aplicacion.
- Team Fortress 2: catalogo local de clases.
- Plants vs. Zombies: Garden Warfare 2: catalogo local de clases y variantes.
- Valorant: snapshot local de agentes y retratos. La app no incluye una clave
  de Riot ni consulta la API durante una partida.
- Last Flag: snapshot local mantenido desde el reparto publicado en su sitio oficial.
- Deadlock: snapshot local creado a partir de la API comunitaria documentada.
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

- Valorant: `https://developer.riotgames.com/docs/valorant` y
  `https://valorant-api.com/`.
- Last Flag: `https://lastflag.com/contestants/`.
- Deadlock: `https://api.deadlock-api.com/docs`.
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
