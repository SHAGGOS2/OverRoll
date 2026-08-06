# OverRoll Web

Port web de OverRoll para generar equipos y ruletas independientes de distintos hero shooters.

## Juegos incluidos

- Overwatch 2
- Team Fortress 2
- Plants vs. Zombies: Garden Warfare 2
- Marvel Rivals
- Valorant
- Deadlock
- Last Flag
- THE FINALS
- Paladins
- FragPunk
- Apex Legends

Cada juego conserva su propio catálogo, jugadores, filtros, bloqueos, reglas y ruleta en `localStorage`. Cambiar de juego no borra la configuración de los demás.

## Funciones principales

- Generación de equipos por número de jugadores.
- Roles habilitables por jugador desde un selector compacto, sin barras internas en la escuadra.
- Composición equilibrada de roles.
- Reroll individual y bloqueo de resultados.
- Filtros individuales de personajes.
- Perfiles compartidos para nombres de jugadores.
- Ruleta independiente con selección y peso de 1x a 5x.
- Team-Ups en Marvel Rivals.
- Builds completas en THE FINALS: complexión, especialización, arma y tres artefactos.
- Interfaz de todos los juegos unificada con la base visual de Overwatch: escuadra, reglas, resultados y acciones.
- Configuración por pestañas: cada opción muestra únicamente su propio contenido.
- Exportación de imagen de equipo para los ocho módulos nuevos.
- Interfaz adaptable a computadora y móvil.
- Créditos, fuentes de datos y avisos de propiedad integrados.

## Desarrollo

```bash
npm install
npm run dev -- --host 0.0.0.0
```

## Compilación

```bash
npm run build
```

La salida se genera en `dist/`.

## Créditos

- Dirección de diseño, idea y pruebas: **SHAGGOS**.
- Desarrollo e implementación: **OpenAI Codex**.
- Datos de Overwatch: **OverFast API**.
- Sonidos adicionales de interfaz: **Kenney, Interface Sounds 1.0, CC0 1.0**.

OverRoll es una herramienta fan gratuita y no oficial. Las marcas, personajes, imágenes, sonidos y demás materiales de cada juego pertenecen a sus respectivos propietarios.
