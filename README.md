# OverRoll: Random Hero Picker

Selector aleatorio de personajes y equipos para Windows. Esta edición usa
PySide6 y Qt Quick para conservar las fichas en memoria, actualizar sólo los
datos que cambian y mantener una respuesta fluida incluso con equipos grandes.

## Funciones

- Formatos 1-2-2, 2-2-2 y Personalizado de 1 a 24 jugadores.
- Uno o dos equipos, roles aleatorios y nombres que permanecen en su lugar.
- Reroll individual, filtros por jugador y bloqueo rápido por rol.
- Quick Play, Stadium con cuatro poderes y vista de sólo roles.
- Perfiles importables y exportables con categorías Main, Usado, Jugado y No usado.
- Modos de perfil con probabilidades distintas para cada categoría.
- Interfaz en Español Latinoamérica, Español España, inglés, portugués,
  francés, alemán, japonés y coreano. Los nombres propios de Overwatch usan
  las localizaciones disponibles en el snapshot.
- Sonidos de interfaz y voces locales después del reroll.
- Copia visual del resultado al portapapeles.
- Juegos independientes para Overwatch, Team Fortress 2, PVZ Garden Warfare 2,
  Marvel Rivals, Valorant, Last Flag, Deadlock, THE FINALS, Paladins, FragPunk
  y Apex Legends.
- TF2 con nueve clases, modo aleatorio o personalizado y hasta seis jugadores.
- PVZ GW2 con plantas, zombis, variantes, DLC y colección por perfil.
- Marvel Rivals con 52 héroes locales, roles, perfiles y prioridad para Team-Ups.
- Overlay para OBS con fichas desde 60 px, orientación, columnas, opacidad,
  separación y restauración de posición o diseño.

## Abrir la app

En el portable, extrae el ZIP completo y abre `OverRoll.exe`. No necesita Python
ni una instalacion adicional.

El `OverRoll.exe` de un solo archivo prepara sus recursos en una cache local la
primera vez que se abre. Esa primera ejecucion puede tardar mas; las siguientes
reutilizan la cache y abren mucho mas rapido. La pantalla con el logo dorado
confirma de inmediato que la aplicacion ya esta iniciando.

La carpeta `Codigo_Fuente` no incluye dependencias ni recursos con copyright.
Para ejecutarla con Python, instala primero sus requisitos y coloca junto a ella
las carpetas locales `data` y `assets/fonts`:

```powershell
py -3.12 -m pip install -r requirements.txt
python main.py
```

Los perfiles y ajustes se guardan en `%APPDATA%\OWRPRenewed\data` para conservar
compatibilidad con las versiones anteriores.

## Datos y privacidad

La app funciona con `data/heroes_snapshot.json` y recursos locales. No mantiene
servicios ni procesos de red en segundo plano. La red se usa al pulsar
**Actualizar datos desde API** y al solicitar **Estadísticas**. El progreso se
muestra en Configuración y toda actividad termina al completar, fallar o cerrar
la aplicación.

La actualización consulta [OverFast API](https://overfast-api.tekrop.fr/) y guarda
el nuevo snapshot en la carpeta de datos del usuario. La app continúa funcionando
con el último snapshot válido si no hay conexión.

Paladins, Apex Legends y FragPunk usan catálogos y retratos locales, por lo que
no abren conexiones durante una partida. Paladins documenta una API oficial que
requiere credenciales; Apex y FragPunk se sincronizan desde sus páginas
oficiales porque no ofrecen una API pública documentada para este catálogo.
Consulta `docs/DATA_SOURCES.md` para ver las fuentes y limitaciones.

## Crear distribuciones

La portable y el EXE único se construyen con Python 3.12 y Nuitka. La portable
deja sus librerías visibles; el EXE único prepara sus recursos en una caché
versionada al abrir.

Con las dependencias instaladas:

```powershell
powershell -ExecutionPolicy Bypass -File tools/build_nuitka_portable.ps1
powershell -ExecutionPolicy Bypass -File tools/build_cached_exe.ps1
```

- Portable: `OverRoll_Portable.zip`
- Un solo archivo: `OverRoll.exe`

El portable suele abrir más rápido y ser más transparente para los antivirus.
El EXE único es más cómodo de compartir, pero su empaquetado puede provocar
falsos positivos heurísticos en algunos motores.
Para distribucion publica, la forma correcta de ganar reputacion en Windows es
firmar los ejecutables con un certificado de firma de codigo y enviar cualquier
deteccion heuristica al proveedor que la marque como falso positivo.

## Créditos

Dirección de diseño: SHAGGOS.

Desarrollo e implementación: OpenAI Codex.

Datos actualizables: OverFast API.

Catálogos offline adicionales:

- Team Fortress 2: nueve clases para Ruleta Maker.
- Plants vs. Zombies: Garden Warfare 2: 121 personajes y variantes, con
  retratos obtenidos de la [plantilla comunitaria de TierMaker](https://tiermaker.com/create/characters-in-plants-vs-zombies-garden-warfare-2).
- Paladins: 59 campeones; metadatos compatibles con la API oficial de Hi-Rez y
  retratos conservados en el snapshot local.
- FragPunk: 21 Lancers extraídos del sitio oficial.
- Apex Legends: 28 leyendas y clases extraídas del centro oficial de personajes
  de Electronic Arts.

Audio: efectos y voces de Overwatch (Blizzard Entertainment) y sonidos
adicionales de interfaz de Kenney, `Interface Sounds 1.0` (CC0 1.0).

OverRoll es una herramienta fan gratuita y no oficial. No está afiliada,
respaldada ni publicada por Blizzard Entertainment.

Overwatch, sus personajes, nombres, imágenes, sonidos e información son marcas y
materiales de Blizzard Entertainment, Inc. Los datos locales se obtienen mediante
un snapshot de OverFast API.

Team Fortress 2 y sus materiales pertenecen a Valve Corporation. Plants vs.
Zombies y Garden Warfare 2 pertenecen a Electronic Arts y PopCap Games. OverRoll
no está afiliada ni respaldada por estas compañías. Paladins pertenece a
Hi-Rez Studios. FragPunk pertenece a Bad Guitar Studio y NetEase Games. Apex
Legends pertenece a Electronic Arts y Respawn Entertainment.

Rajdhani y Open Sans se distribuyen bajo SIL Open Font License 1.1. Sus licencias
están incluidas en `assets/fonts`.

La licencia CC0 incluida con los sonidos de Kenney se encuentra en
`data/sounds/kenney/LICENSE.txt`. Más información en [kenney.nl](https://kenney.nl/).
