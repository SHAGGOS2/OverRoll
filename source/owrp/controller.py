# -*- coding: utf-8 -*-
from __future__ import annotations

import ctypes
import json
import os
import random
import re
import sys
import time
from pathlib import Path
from typing import Any

from PySide6.QtCore import Property, QProcess, QProcessEnvironment, QTimer, QUrl, Signal, Slot, QObject
from PySide6.QtGui import QGuiApplication, QImage

from .models import DictListModel, PICK_ROLES, PLAYER_ROLES, PROFILE_HERO_ROLES, TeamProxyModel
from tools import update_snapshot


ROLES = ("tank", "damage", "support")
ROLE_COLORS = {"tank": "#27baff", "damage": "#ff5064", "support": "#59e3a4"}
ROLE_ICONS = {
    "tank": "data/assets/role_tank.png",
    "damage": "data/assets/role_damage.png",
    "support": "data/assets/role_support.png",
}
LARGE_ROLE_ICONS = {
    "tank": "data/assets/role_tank_large.png",
    "damage": "data/assets/role_damage_large.png",
    "support": "data/assets/role_support_large.png",
}
SUBROLE_ICONS = {
    "flanker": "data/assets/subrole_damage_flanker.png",
    "recon": "data/assets/subrole_damage_recon.png",
    "sharpshooter": "data/assets/subrole_damage_sharpshooter.png",
    "specialist": "data/assets/subrole_damage_specialist.png",
    "medic": "data/assets/subrole_support_medic.png",
    "survivor": "data/assets/subrole_support_survivor.png",
    "tactician": "data/assets/subrole_support_tactician.png",
    "bruiser": "data/assets/subrole_tank_bruiser.png",
    "initiator": "data/assets/subrole_tank_initiator.png",
    "stalwart": "data/assets/subrole_tank_stalwart.png",
}
PROFILE_BUCKETS = ("main", "played", "practice", "avoid")
PROFILE_MODES = ("classic", "allprofile", "lowprob", "practice", "played", "prefer", "main")


class _SignalWriter:
    def __init__(self, emit: Any) -> None:
        self.emit = emit
        self.buffer = ""

    def write(self, value: str) -> int:
        self.buffer += value
        while "\n" in self.buffer:
            line, self.buffer = self.buffer.split("\n", 1)
            if line.strip():
                self.emit(line.strip())
        return len(value)

    def flush(self) -> None:
        if self.buffer.strip():
            self.emit(self.buffer.strip())
        self.buffer = ""


TEXT = {
    "es-mx": {
        "app_subtitle": "Arma la escuadra, mezcla los roles y entra a la partida.",
        "result": "RESULTADO",
        "profiles": "PERFILES",
        "settings": "CONFIGURACIÓN",
        "help": "AYUDA",
        "local_data": "DATOS LOCALES",
        "prepare": "PREPARAR PARTIDA",
        "format": "FORMATO",
        "squad": "ESCUADRA",
        "rules": "REGLAS",
        "quick_hero": "HÉROE RÁPIDO",
        "generate": "GENERAR EQUIPO",
        "ready": "Listo para randomizar",
        "ready_body": "Configura la escuadra y pulsa Generar equipo.",
        "team_122": "Equipo 1-2-2",
        "team_222": "Equipo 2-2-2",
        "custom_team": "Equipo personalizado",
        "custom_teams": "2 equipos personalizados",
        "team": "Equipo {number}",
        "tank": "Tanque",
        "damage": "Daño",
        "support": "Apoyo",
        "any_role": "Cualquier rol",
        "players": "jugadores",
        "one_team": "1 equipo",
        "two_teams": "2 equipos",
        "clear_names": "Nombres",
        "shuffle": "Mezclar",
        "reset_roles": "Roles",
        "unique": "Evitar héroes repetidos",
        "quickplay": "Solo Quick Play",
        "role_composition": "Composición de roles",
        "random_perks": "Randomizar perks / poderes",
        "roles_only": "Solo roles",
        "stadium": "Modo Stadium",
        "copy_image": "Copiar imagen",
        "random": "RANDOM",
        "reroll": "Cambiar héroe",
        "filter": "Filtrar héroes",
        "back": "VOLVER",
        "search": "Buscar héroe",
        "reset_filters": "Reiniciar filtros",
        "all_on": "ACTIVAR ROL",
        "all_off": "DESACTIVAR ROL",
        "visible": "{visible} visibles · {blocked} bloqueados",
        "profile_mode": "MODO DE PERFILES",
        "profile": "PERFIL",
        "new_profile": "Nuevo perfil",
        "delete_profile": "Borrar perfil",
        "import_profiles": "Importar",
        "export_profiles": "Exportar",
        "profile_identity": "IDENTIDAD DEL PERFIL",
        "profile_name": "Nombre del perfil",
        "save_name": "Guardar nombre",
        "assign_player": "Asignar a jugador",
        "assign": "Asignar",
        "remove": "Quitar",
        "classify": "CLASIFICAR HÉROES",
        "classify_help": "Marca cuánto usas cada héroe. Los modos de perfil decidirán cómo entra al random.",
        "main": "Main",
        "played": "Usado",
        "practice": "En práctica",
        "avoid": "No usado",
        "unmarked": "Sin marcar",
        "all": "Todos",
        "clear_categories": "Limpiar categorías",
        "sound": "Sonidos de interfaz",
        "settings_subtitle": "Ajusta la experiencia sin reiniciar la app.",
        "help_subtitle": "Elige un tema. Te mostramos qué tocar y qué resultado esperar.",
        "voices": "Voces después de reroll",
        "volume": "Volumen",
        "animations": "Animaciones de fichas",
        "compact": "Perks compactas",
        "hover_sounds": "Sonidos al pasar el mouse",
        "stats_sounds": "Sonidos de Estadísticas",
        "preview_sound": "PROBAR SONIDO",
        "audio_group": "AUDIO",
        "visual_group": "APARIENCIA",
        "appearance_help": "Controla sonidos, voces, movimiento y densidad de las fichas.",
        "data_help": "Cambia el idioma, actualiza datos y consulta el reparto de voces.",
        "credits_help": "Fuentes, autoría y avisos del proyecto.",
        "connections": "CONEXIONES",
        "connections_help": "OBS ya funciona. Twitch muestra la configuración prevista, pero todavía no inicia sesión ni lee el chat.",
        "obs_overlay": "OBS / OVERLAY",
        "obs_overlay_help": "Abre una ventana transparente independiente. En OBS, agrégala como Captura de ventana.",
        "show_overlay": "MOSTRAR OVERLAY",
        "overlay_enabled": "Ventana de overlay",
        "overlay_hint": "Título para OBS: OverRoll Overlay. Arrastra la ventana para colocarla sin alterar la aplicación principal.",
        "twitch": "TWITCH",
        "twitch_help": "Vista previa de la futura integración. El canal y el comando se guardan, pero todavía no hay conexión OAuth ni lectura del chat.",
        "twitch_channel": "Canal",
        "twitch_command": "Comando de ruleta",
        "twitch_pending": "NO CONECTADO · FUNCIÓN EN PREPARACIÓN",
        "twitch_oauth": "CONECTAR CON TWITCH",
        "other_hs": "JUEGOS",
        "other_hs_help": "Elige el juego activo. Cada módulo conserva sus reglas, filtros y resultados.",
        "other_hs_title": "JUEGOS",
        "other_hs_intro": "Overwatch, TF2 y PVZGW2 funcionan como módulos independientes. Los demás muestran su estado real.",
        "api_official": "API OFICIAL",
        "api_community": "API COMUNITARIA",
        "api_local": "DATOS LOCALES",
        "api_restricted": "ACCESO RESTRINGIDO",
        "hs_feasible": "FACTIBLE",
        "hs_caution": "CON PRECAUCIÓN",
        "hs_no_public": "SIN API PÚBLICA",
        "hs_available": "DISPONIBLE",
        "hs_unavailable": "NO DISPONIBLE",
        "use_catalog": "USAR CATÁLOGO",
        "catalog_active": "CATÁLOGO ACTIVO",
        "catalog_entries": "personajes",
        "hs_group_offense": "Ofensiva",
        "hs_group_defense": "Defensa",
        "hs_group_plants": "Plantas",
        "hs_group_zombies": "Zombis",
        "hs_overwatch": "Catálogo principal con el roster local de Overwatch, roles, retratos y actualización manual desde la API.",
        "hs_marvel": "Todavía no está disponible en esta versión de OverRoll.",
        "hs_valorant": "Todavía no está disponible en esta versión de OverRoll.",
        "hs_apex": "Todavía no está disponible en esta versión de OverRoll.",
        "hs_tf2": "Catálogo offline con las nueve clases, dividido en Ofensiva, Defensa y Apoyo. No necesita API.",
        "hs_pvz": "Catálogo offline con 121 personajes y variantes de Garden Warfare 2, dividido entre Plantas y Zombis.",
        "open_docs": "ABRIR DOCUMENTACIÓN",
        "data_general": "IDIOMA Y API",
        "voice_credits": "VOCES",
        "language": "Idioma",
        "update_api": "ACTUALIZAR DATOS DESDE API",
        "cancel_api": "CANCELAR ACTUALIZACIÓN",
        "api_idle": "Sin actualización activa.",
        "api_data_help": "Descarga un snapshot nuevo solo cuando tú lo solicitas. Si cancelas, los datos actuales se conservan.",
        "appearance": "APARIENCIA Y SONIDO",
        "data_section": "IDIOMA Y DATOS",
        "credits": "CRÉDITOS",
        "credits_body": "DIRECCIÓN Y DESARROLLO\nDirección de producto, diseño y pruebas: SHAGGOS.\nDesarrollo e implementación: OpenAI Codex.\n\nCATÁLOGOS ACTIVOS\nOverwatch: snapshot local actualizable mediante OverFast API; material de Blizzard Entertainment y referencias comunitarias de Overwatch Wiki/Fandom.\nMarvel Rivals: catálogo local y Team-Ups referenciados desde Marvel Rivals Wiki/Fandom; material de Marvel y NetEase Games.\nTeam Fortress 2: catálogo local de clases; material de Valve Corporation.\nPlants vs. Zombies: Garden Warfare 2: catálogo local de personajes y variantes; material de Electronic Arts y PopCap Games, con TierMaker como referencia comunitaria.\nValorant: Riot VAL-CONTENT-V1 y Valorant-API como fuentes de catálogo.\nLast Flag: reparto y retratos referenciados desde el sitio oficial de concursantes de Night Street Games.\nDeadlock: catálogo local y material de Valve Corporation.\nTHE FINALS: catálogo local basado en recursos de Embark Studios y THE FINALS Wiki.\nPaladins: catálogo local compatible con la API oficial de Hi-Rez y caché de retratos de Paladins Wiki; material de Hi-Rez Studios.\nFragPunk: catálogo y retratos locales obtenidos del sitio oficial; material de Bad Guitar Studio y NetEase Games.\nApex Legends: catálogo y retratos locales obtenidos del centro oficial de personajes de EA; material de Electronic Arts y Respawn Entertainment.\nAudio adicional: Kenney Interface Sounds, licencia CC0. Las voces incluidas se acreditan en Idioma y datos.",
        "credits_legal": "OverRoll es un proyecto fan gratuito y no oficial. No está afiliado, patrocinado ni respaldado por Blizzard Entertainment, Marvel, NetEase Games, Valve, Electronic Arts, PopCap Games, Riot Games, Respawn Entertainment, Hi-Rez Studios, Evil Mojo Games, Bad Guitar Studio o Night Street Games. Todos los nombres, marcas, personajes, imágenes y audios conservan los derechos de sus respectivos propietarios.",
        "credits_joke": "Se la llevó el tiburón",
        "help_start": "EMPEZAR",
        "help_profiles": "PERFILES",
        "help_filters": "FILTROS",
        "help_roulette": "RULETA MAKER",
        "help_stadium": "STADIUM",
        "help_catalogs": "CATÁLOGOS",
        "help_twitch": "TWITCH",
        "help_how_title": "QUÉ HACE",
        "help_steps_title": "PASO A PASO",
        "help_problem_title": "SI ALGO NO SALE",
        "help_start_body": "Esta es la forma normal de usar OverRoll. Tú preparas los jugadores y los roles permitidos; la app reparte los roles y elige un héroe válido para cada persona.",
        "help_profiles_body": "Un perfil recuerda qué héroes usa una persona. Primero clasificas sus héroes, después eliges cuánto debe respetar esas categorías y finalmente vinculas el perfil a un jugador.",
        "help_filters_body": "El filtro de una ficha sirve para decir: «a este jugador no le des estos héroes». Sólo afecta a esa persona y trabaja junto con sus roles activos y su perfil.",
        "help_roulette_body": "Ruleta Maker elige un solo héroe desde tu lista. Cada héroe puede ocupar varias casillas: más casillas significa más probabilidad de ganar.",
        "help_stadium_body": "Stadium limita el random a héroes compatibles y muestra cuatro poderes Stadium. Al apagarlo vuelven las perks normales de Quick Play.\n\nActualización del 16 de Julio: ya se murió este modo XD.",
        "help_catalogs_body": "Ruleta Maker puede cambiar entre catálogos separados para no mezclar personajes. Overwatch usa el roster principal; TF2 incluye sus nueve clases y PVZ Garden Warfare 2 incluye 121 personajes y variantes. Los dos catálogos adicionales funcionan completamente offline.",
        "help_twitch_body": "Cada persona conecta su propia cuenta mediante la autorización oficial de Twitch. OverRoll nunca necesita tu contraseña y otra instalación no obtiene acceso a tu canal. La integración todavía está en preparación: por ahora sólo se guardan el canal y el comando, sin iniciar sesión ni leer el chat.",
        "help_summary": "EN POCAS PALABRAS",
        "help_start_steps": "Elige 1-2-2, 2-2-2 o Personalizado.|Escribe los nombres y deja activos los roles que acepta cada persona.|Ajusta las reglas que quieras usar.|Pulsa Generar equipo. Los nombres no cambian de lugar.",
        "help_profiles_steps": "Crea un perfil o elige uno guardado.|En Clasificar héroes, asigna Main, Usado, En práctica o No usado.|Elige el Modo de perfiles; su descripción te dice qué categorías entran al sorteo.|Abre Asignar a jugador y vincúlalo. El nombre del perfil bloqueará el nombre de ese jugador.",
        "help_filters_steps": "Genera un equipo y abre el botón de filtro de la ficha deseada.|Apaga un héroe para bloquearlo o apaga un rol completo.|Cierra el filtro: el cambio queda guardado en esa ficha.|Usa reroll; el nuevo héroe respetará roles, perfil y bloqueos.",
        "help_roulette_steps": "En Formato, elige Ruleta Maker.|Selecciona los roles y los héroes que pueden participar.|Usa - y + en cada héroe. El número xN indica sus casillas y el porcentaje muestra su oportunidad.|Pulsa Crear ruleta y después Girar ruleta.",
        "help_stadium_steps": "Activa Modo Stadium en Reglas.|Genera el equipo: sólo entran héroes disponibles en ese modo.|Cada ficha mostrará cuatro poderes Stadium en lugar de las perks normales.|Apágalo para volver a Quick Play.",
        "help_catalogs_steps": "Abre Configuración y entra en Otros HS.|Pulsa Usar catálogo en Overwatch, Team Fortress 2 o PVZ Garden Warfare 2.|OverRoll volverá a Principal con Ruleta Maker activa y la lista del juego elegido.|Selecciona personajes, ajusta sus probabilidades, crea la ruleta y gírala.",
        "help_twitch_steps": "Cuando la conexión esté disponible, abre Configuración y entra en Conexiones.|Pulsa Conectar con Twitch y autoriza OverRoll en la página oficial.|Comprueba la cuenta y el canal mostrados antes de activar comandos.|Usa Pausar chat o Desconectar para detener el control inmediatamente.",
        "help_start_tip": "Para empezar rápido: elige formato, activa los roles que acepta cada jugador y pulsa Generar equipo.",
        "help_profiles_tip": "El perfil modifica qué héroes pueden salir, pero nunca ignora los roles ni los filtros de la ficha.",
        "help_filters_tip": "Si alguien recibe pocos resultados, revisa primero sus roles activos y después sus héroes bloqueados.",
        "help_roulette_tip": "Ejemplo: Ana x4 y Genji x1 significa cinco casillas; Ana tiene 80% y Genji 20%.",
        "help_stadium_tip": "Úsalo solo para partidas Stadium antiguas. Para Quick Play, mantenlo apagado.",
        "help_catalogs_tip": "El cambio de catálogo sólo afecta a Ruleta Maker. Los equipos, perfiles, perks y filtros de Overwatch no se modifican.",
        "help_twitch_tip": "Nadie puede conectar tu canal sin autorizarlo con tu cuenta. La conexión sólo permanecerá activa mientras OverRoll esté abierto y Twitch esté habilitado.",
        "no_profile": "Sin perfil",
        "snapshot": "Datos locales · Actualizado {date}",
        "snapshot_unknown": "Datos locales · Sin fecha",
        "api_running": "Actualizando snapshot local…",
        "api_cancelling": "Cancelando actualización…",
        "api_cancelled": "Actualización cancelada. Se conservaron los datos locales anteriores.",
        "api_done": "Datos actualizados. La app ya usa el nuevo snapshot.",
        "api_failed": "No se pudo completar la actualización.",
        "no_candidates": "No hay una combinación válida con esos roles, perfiles y filtros.",
        "no_alternative": "No hay otro héroe disponible para esta ficha.",
        "image_copied": "Fichas del resultado copiadas al portapapeles.",
        "mode_classic": "Sin perfil",
        "mode_allprofile": "Todos los marcados",
        "mode_lowprob": "Descubrir",
        "mode_practice": "Practicar",
        "mode_played": "Sin No usados",
        "mode_prefer": "Favoritos",
        "mode_main": "Solo Main",
        "mode_classic_help": "No toma en cuenta el perfil. Cualquier héroe permitido por los roles y filtros puede salir.",
        "mode_allprofile_help": "Elige por igual entre Main, Usado, En práctica y No usado. Los héroes sin marcar quedan fuera mientras haya opciones marcadas.",
        "mode_lowprob_help": "Sirve para variar: No usado tiene peso 8, En práctica 5, Usado 3 y Main 1. Así aparecen más los héroes que menos practicas.",
        "mode_practice_help": "Solo busca héroes marcados como En práctica o No usado. Úsalo para practicar y ampliar tu selección.",
        "mode_played_help": "Puede elegir Main, Usado o En práctica, pero evita los marcados como No usado.",
        "mode_prefer_help": "Solo busca Main y Usado. Es el modo para personajes que ya dominas o utilizas con frecuencia.",
        "mode_main_help": "Solo busca personajes marcados como Main. Si el rol asignado no tiene uno disponible, usa el pool permitido para no bloquear el equipo.",
    },
    "es-es": {},
    "en-us": {
        "app_subtitle": "Build the squad, shuffle roles, and get into the match.",
        "result": "RESULT",
        "profiles": "PROFILES",
        "settings": "SETTINGS",
        "help": "HELP",
        "local_data": "LOCAL DATA",
        "prepare": "PREPARE MATCH",
        "format": "FORMAT",
        "squad": "SQUAD",
        "rules": "RULES",
        "quick_hero": "QUICK HERO",
        "generate": "GENERATE TEAM",
        "ready": "Ready to randomize",
        "ready_body": "Set up the squad and press Generate team.",
        "team_122": "1-2-2 Team",
        "team_222": "2-2-2 Team",
        "custom_team": "Custom team",
        "custom_teams": "2 custom teams",
        "team": "Team {number}",
        "tank": "Tank",
        "damage": "Damage",
        "support": "Support",
        "any_role": "Any role",
        "players": "players",
        "one_team": "1 team",
        "two_teams": "2 teams",
        "clear_names": "Names",
        "shuffle": "Shuffle",
        "reset_roles": "Roles",
        "unique": "Avoid duplicate heroes",
        "quickplay": "Quick Play only",
        "role_composition": "Role composition",
        "random_perks": "Randomize perks / powers",
        "roles_only": "Roles only",
        "stadium": "Stadium mode",
        "copy_image": "Copy image",
        "random": "RANDOM",
        "reroll": "Reroll hero",
        "filter": "Filter heroes",
        "back": "BACK",
        "search": "Search hero",
        "reset_filters": "Reset filters",
        "all_on": "ENABLE ROLE",
        "all_off": "DISABLE ROLE",
        "visible": "{visible} visible · {blocked} blocked",
        "profile_mode": "PROFILE MODE",
        "profile": "PROFILE",
        "new_profile": "New profile",
        "delete_profile": "Delete profile",
        "import_profiles": "Import",
        "export_profiles": "Export",
        "profile_identity": "PROFILE IDENTITY",
        "profile_name": "Profile name",
        "save_name": "Save name",
        "assign_player": "Assign to player",
        "assign": "Assign",
        "remove": "Remove",
        "classify": "CLASSIFY HEROES",
        "classify_help": "Mark how often you use each hero. Profile modes decide how each category enters the picker.",
        "main": "Main",
        "played": "Used",
        "practice": "Played",
        "avoid": "Not used",
        "unmarked": "Unmarked",
        "all": "All",
        "clear_categories": "Clear categories",
        "sound": "Interface sounds",
        "settings_subtitle": "Adjust the experience without restarting the app.",
        "help_subtitle": "Choose a topic. We show what to press and what result to expect.",
        "voices": "Voices after reroll",
        "volume": "Volume",
        "animations": "Card animations",
        "compact": "Compact perks",
        "hover_sounds": "Sounds when hovering",
        "stats_sounds": "Statistics sounds",
        "preview_sound": "TEST SOUND",
        "audio_group": "AUDIO",
        "visual_group": "APPEARANCE",
        "appearance_help": "Control sounds, voices, motion, and card density.",
        "data_help": "Change language, update data, and view the voice cast.",
        "credits_help": "Project sources, authorship, and notices.",
        "connections": "CONNECTIONS",
        "connections_help": "OBS already works. Twitch shows the planned setup, but it does not sign in or read chat yet.",
        "obs_overlay": "OBS / OVERLAY",
        "obs_overlay_help": "Opens a separate transparent window. Add it to OBS as a Window Capture source.",
        "show_overlay": "SHOW OVERLAY",
        "overlay_enabled": "Overlay window",
        "overlay_hint": "OBS window title: OverRoll Overlay. Drag it into place without changing the main app.",
        "twitch": "TWITCH",
        "twitch_help": "Preview of the planned integration. Channel and command are saved, but OAuth and chat reading are not connected yet.",
        "twitch_channel": "Channel",
        "twitch_command": "Roulette command",
        "twitch_pending": "NOT CONNECTED · FEATURE IN PREPARATION",
        "twitch_oauth": "CONNECT TWITCH",
        "other_hs": "GAMES",
        "other_hs_help": "Choose the active game. Every module keeps its own rules, filters, and results.",
        "other_hs_title": "GAMES",
        "other_hs_intro": "Overwatch, TF2, and PVZGW2 work as independent modules. Other games show their real status.",
        "api_official": "OFFICIAL API",
        "api_community": "COMMUNITY API",
        "api_local": "LOCAL DATA",
        "api_restricted": "RESTRICTED ACCESS",
        "hs_feasible": "FEASIBLE",
        "hs_caution": "USE WITH CAUTION",
        "hs_no_public": "NO PUBLIC API",
        "hs_available": "AVAILABLE",
        "hs_unavailable": "NOT AVAILABLE",
        "use_catalog": "USE CATALOG",
        "catalog_active": "ACTIVE CATALOG",
        "catalog_entries": "characters",
        "hs_group_offense": "Offense",
        "hs_group_defense": "Defense",
        "hs_group_plants": "Plants",
        "hs_group_zombies": "Zombies",
        "hs_overwatch": "Main catalog with the local Overwatch roster, roles, portraits, and manual API updates.",
        "hs_marvel": "This catalog is not available in this version of OverRoll.",
        "hs_valorant": "This catalog is not available in this version of OverRoll.",
        "hs_apex": "This catalog is not available in this version of OverRoll.",
        "hs_tf2": "Offline catalog with all nine classes, grouped as Offense, Defense, and Support. No API is required.",
        "hs_pvz": "Offline catalog with 121 Garden Warfare 2 characters and variants, split between Plants and Zombies.",
        "open_docs": "OPEN DOCUMENTATION",
        "data_general": "LANGUAGE AND API",
        "voice_credits": "VOICES",
        "language": "Language",
        "update_api": "UPDATE DATA FROM API",
        "cancel_api": "CANCEL UPDATE",
        "api_idle": "No update is running.",
        "api_data_help": "Downloads a new snapshot only when you request it. Cancelling keeps the current local data.",
        "appearance": "APPEARANCE AND SOUND",
        "data_section": "LANGUAGE AND DATA",
        "credits": "CREDITS",
        "credits_body": "DIRECTION AND DEVELOPMENT\nProduct direction, design, and testing: SHAGGOS.\nDevelopment and implementation: OpenAI Codex.\n\nACTIVE CATALOGS\nOverwatch: local snapshot updateable through OverFast API; Blizzard Entertainment material and community references from Overwatch Wiki/Fandom.\nMarvel Rivals: local catalog and Team-Ups referenced from Marvel Rivals Wiki/Fandom; material from Marvel and NetEase Games.\nTeam Fortress 2: local class catalog; material from Valve Corporation.\nPlants vs. Zombies: Garden Warfare 2: local character and variant catalog; material from Electronic Arts and PopCap Games, with TierMaker as a community reference.\nValorant: Riot VAL-CONTENT-V1 and Valorant-API catalog sources.\nLast Flag: roster and portraits referenced from Night Street Games' official contestants site.\nDeadlock: local catalog and material from Valve Corporation.\nTHE FINALS: local catalog based on Embark Studios resources and THE FINALS Wiki.\nPaladins: local catalog compatible with the official Hi-Rez API and a Paladins Wiki portrait cache; material from Hi-Rez Studios.\nFragPunk: local catalog and portraits obtained from the official site; material from Bad Guitar Studio and NetEase Games.\nApex Legends: local catalog and portraits obtained from EA's official character hub; material from Electronic Arts and Respawn Entertainment.\nAdditional audio: Kenney Interface Sounds, CC0 license. Included voices are credited under Language and data.",
        "credits_legal": "OverRoll is a free, unofficial fan project. It is not affiliated with, sponsored, or endorsed by Blizzard Entertainment, Marvel, NetEase Games, Valve, Electronic Arts, PopCap Games, Riot Games, Respawn Entertainment, Hi-Rez Studios, Evil Mojo Games, Bad Guitar Studio, or Night Street Games. All names, trademarks, characters, images, and audio remain the property of their respective owners.",
        "credits_joke": "The shark took it",
        "help_start": "GETTING STARTED",
        "help_profiles": "PROFILES",
        "help_filters": "FILTERS",
        "help_roulette": "ROULETTE MAKER",
        "help_stadium": "STADIUM",
        "help_catalogs": "CATALOGS",
        "help_twitch": "TWITCH",
        "help_how_title": "WHAT IT DOES",
        "help_steps_title": "STEP BY STEP",
        "help_problem_title": "IF SOMETHING GOES WRONG",
        "help_start_body": "This is the normal OverRoll flow. You prepare the players and allowed roles; the app distributes roles and chooses one valid hero for each person.",
        "help_profiles_body": "A profile remembers which heroes a person uses. First classify their heroes, then choose how strongly those categories matter, and finally link the profile to a player.",
        "help_filters_body": "A card filter means: ‘do not give these heroes to this player’. It only affects that person and works together with active roles and their profile.",
        "help_roulette_body": "Roulette Maker chooses one hero from your list. A hero may occupy several slots: more slots means a higher chance to win.",
        "help_stadium_body": "Stadium limits the picker to compatible heroes and displays four Stadium powers. Turning it off restores normal Quick Play perks.\n\nJuly 16 update: this mode is dead now XD.",
        "help_catalogs_body": "Roulette Maker can switch between separate catalogs without mixing characters. Overwatch uses the main roster; TF2 includes all nine classes, and PVZ Garden Warfare 2 includes 121 characters and variants. Both additional catalogs work fully offline.",
        "help_twitch_body": "Each person connects their own account through Twitch's official authorization. OverRoll never needs your password, and another installation does not gain access to your channel. The integration is still in preparation: for now it only saves the channel and command without signing in or reading chat.",
        "help_summary": "IN SHORT",
        "help_start_steps": "Choose 1-2-2, 2-2-2, or Custom.|Enter names and leave enabled every role each person accepts.|Adjust any rules you want.|Press Generate team. Player names stay in place.",
        "help_profiles_steps": "Create a profile or choose a saved one.|Under Classify heroes, assign Main, Used, Played, or Not used.|Choose the Profile mode; its description tells you which categories enter the picker.|Open Assign to player and link it. The profile name locks that player's name.",
        "help_filters_steps": "Generate a team and open the filter button on the desired card.|Turn off a hero to block it, or turn off a whole role.|Close the filter; the change remains on that card.|Use reroll; the new hero respects roles, profile, and blocks.",
        "help_roulette_steps": "Under Format, choose Roulette Maker.|Select the roles and heroes that may participate.|Use - and + on each hero. xN is its slot count and the percentage is its chance.|Press Build roulette, then Spin roulette.",
        "help_stadium_steps": "Enable Stadium mode under Rules.|Generate the team; only heroes available in that mode can appear.|Each card shows four Stadium powers instead of normal perks.|Turn it off to return to Quick Play.",
        "help_catalogs_steps": "Open Settings and select Other HS.|Press Use catalog on Overwatch, Team Fortress 2, or PVZ Garden Warfare 2.|OverRoll returns to Main with Roulette Maker active and the selected game's list loaded.|Choose characters, adjust their odds, build the roulette, and spin it.",
        "help_twitch_steps": "When connection support is ready, open Settings and select Connections.|Press Connect Twitch and authorize OverRoll on the official page.|Check the displayed account and channel before enabling commands.|Use Pause chat or Disconnect to stop control immediately.",
        "help_start_tip": "Quick start: choose a format, enable each player's accepted roles, then press Generate team.",
        "help_profiles_tip": "Profiles affect which heroes may appear, but they never override card roles or hero filters.",
        "help_filters_tip": "If someone has too few results, check their active roles first and then their blocked heroes.",
        "help_roulette_tip": "Example: Ana x4 and Genji x1 makes five slots; Ana has 80% and Genji 20%.",
        "help_stadium_tip": "Use it only for old Stadium matches. Keep it off for Quick Play.",
        "help_catalogs_tip": "Catalog switching only affects Roulette Maker. Overwatch teams, profiles, perks, and filters remain unchanged.",
        "help_twitch_tip": "Nobody can connect your channel without authorizing it through your account. The connection will only remain active while OverRoll is open and Twitch is enabled.",
        "no_profile": "No profile",
        "snapshot": "Local data · Updated {date}",
        "snapshot_unknown": "Local data · No date",
        "api_running": "Updating local snapshot…",
        "api_cancelling": "Cancelling update…",
        "api_cancelled": "Update cancelled. Previous local data was kept.",
        "api_done": "Data updated. The app is using the new snapshot.",
        "api_failed": "The update could not be completed.",
        "no_candidates": "No valid combination matches those roles, profiles, and filters.",
        "no_alternative": "No other hero is available for this card.",
        "image_copied": "Result cards copied to the clipboard.",
        "mode_classic": "No profile",
        "mode_allprofile": "All marked",
        "mode_lowprob": "Discover",
        "mode_practice": "Practice",
        "mode_played": "Exclude Not used",
        "mode_prefer": "Favorites",
        "mode_main": "Main only",
        "mode_classic_help": "Ignores the profile. Any hero allowed by the player's roles and filters can be selected.",
        "mode_allprofile_help": "Chooses equally from Main, Used, Played, and Not used. Unmarked heroes stay out while marked choices are available.",
        "mode_lowprob_help": "Built for variety: Not used gets weight 8, Played 5, Used 3, and Main 1, so less familiar heroes appear more often.",
        "mode_practice_help": "Only looks for heroes marked Played or Not used. Use it to practice and expand your hero pool.",
        "mode_played_help": "Can choose Main, Used, or Played heroes, while avoiding those marked Not used.",
        "mode_prefer_help": "Only looks for Main and Used heroes. Choose this for characters you already know and play frequently.",
        "mode_main_help": "Only looks for Main heroes. If the assigned role has no available Main, it falls back to the allowed pool instead of blocking the team.",
    },
}
TEXT["es-es"] = dict(TEXT["es-mx"])
TEXT["es-es"].update({"damage": "Daño", "support": "Apoyo", "app_subtitle": "Prepara el equipo, mezcla los roles y entra en la partida."})


class AudioService(QObject):
    _SOUNDS = {
        "team": ("data/sounds/generate_team.mp3",),
        "reroll": ("data/sounds/reroll.mp3",),
        "quick": ("data/sounds/quick.mp3",),
        "toggle": ("data/sounds/kenney/toggle_001.mp3",),
        "toggle_on": ("data/sounds/kenney/switch_001.mp3",),
        "toggle_off": ("data/sounds/kenney/switch_002.mp3",),
        "nav": ("data/sounds/kenney/select_003.mp3",),
        "nav_hover": ("data/sounds/ui_nav.mp3",),
        "nav_click": ("data/sounds/click.mp3",),
        "click": ("data/sounds/kenney/click_001.mp3",),
        "profile": ("data/sounds/kenney/open_003.mp3",),
        "settings": ("data/sounds/kenney/open_001.mp3",),
        "help": ("data/sounds/kenney/question_001.mp3",),
        "data": ("data/sounds/kenney/select_004.mp3",),
        "mode": ("data/sounds/kenney/select_003.mp3",),
        "reset": ("data/sounds/click.mp3",),
        "shuffle": ("data/sounds/click.mp3",),
        "capture": ("data/sounds/kenney/confirmation_001.mp3",),
        "api": ("data/sounds/kenney/confirmation_003.mp3",),
        "filter": ("data/sounds/kenney/open_003.mp3",),
        "allow": ("data/sounds/allow.mp3",),
        "deny": ("data/sounds/kenney/error_002.mp3",),
        "roulette_build": ("data/sounds/kenney/confirmation_001.mp3",),
        "roulette_weight": ("data/sounds/kenney/click_002.mp3", "data/sounds/kenney/click_003.mp3"),
        "roulette_spin": ("data/sounds/kenney/roulette_spin.mp3",),
        "roulette_win": ("data/sounds/kenney/confirmation_002.mp3",),
        "stats_search": ("data/sounds/click.mp3",),
        "stats_open": ("data/sounds/click.mp3",),
        "stats_filter": ("data/sounds/click.mp3",),
        "stats_refresh": ("data/sounds/click.mp3",),
        "stats_link": ("data/sounds/click.mp3",),
        "stats_tab": ("data/sounds/click.mp3",),
        "tf2_click": ("data/sounds/games/tf2/buttonclick.wav",),
        "tf2_generate": ("data/sounds/games/tf2/mm_join.wav",),
        "tf2_reroll": ("data/sounds/games/tf2/critical-hit-sounds-effect.mp3",),
        "pvz_click": (
            "data/sounds/games/pvzgw2/Audio_Always_Loaded.032.ogg",
            "data/sounds/games/pvzgw2/Audio_Always_Loaded.048.ogg",
            "data/sounds/games/pvzgw2/Audio_Always_Loaded.062.ogg",
        ),
        "pvz_generate": ("data/sounds/games/pvzgw2/plants-vs-zombies-sun-pickup.mp3",),
        "pvz_reroll": ("data/sounds/games/pvzgw2/killpop.mp3",),
        "secret": ("data/sounds/ui/secret_unlocked.mp3",),
    }
    _CHANNELS = {
        "team": "team",
        "reroll": "reroll",
        "quick": "quick",
        "voice": "voice",
        "deny": "deny",
        "roulette_spin": "roulette",
        "roulette_win": "roulette_win",
        "nav_hover": "hover",
        "tf2_generate": "team",
        "tf2_reroll": "reroll",
        "pvz_generate": "team",
        "pvz_reroll": "reroll",
        "secret": "secret",
    }
    _VOLUME_MULTIPLIERS = {
        "tf2_generate": 0.62,
    }
    _HOLD_SECONDS = {
        "team": 0.55,
        "reroll": 0.38,
        "quick": 0.35,
        "voice": 2.5,
        "deny": 0.45,
        "roulette": 2.64,
        "roulette_win": 0.55,
        "secret": 2.0,
        "hover": 0.04,
        "ui": 0.06,
    }

    def __init__(self, resolver: Any, parent: QObject | None = None) -> None:
        super().__init__(parent)
        self.resolve = resolver
        self.enabled = True
        self.volume = 50
        self._last: dict[str, float] = {}
        self._busy_until: dict[str, float] = {}
        self._last_variant: dict[str, str] = {}
        self._backend: Any | bool | None = None
        self._active_channels: set[str] = set()
        self._channel_gain: dict[str, float] = {}

    def _ensure_backend(self) -> Any | None:
        if self._backend is False:
            return None
        if self._backend is None:
            if os.name != "nt":
                self._backend = False
                return None
            winmm = ctypes.WinDLL("winmm")
            send = winmm.mciSendStringW
            send.argtypes = [ctypes.c_wchar_p, ctypes.c_wchar_p, ctypes.c_uint, ctypes.c_void_p]
            send.restype = ctypes.c_uint
            self._backend = send
        return self._backend

    def _mci(self, command: str) -> tuple[int, str]:
        send = self._ensure_backend()
        if send is None:
            return 1, ""
        output = ctypes.create_unicode_buffer(256)
        code = int(send(command, output, len(output), None))
        return code, output.value

    def _sound_paths(self, kind: str, relative: str | None) -> list[str]:
        if relative:
            return [relative]
        candidates = [path for path in self._SOUNDS.get(kind, self._SOUNDS["click"]) if Path(self.resolve(path)).exists()]
        if not candidates:
            return []
        previous = self._last_variant.get(kind, "")
        random.shuffle(candidates)
        if len(candidates) > 1 and candidates[0] == previous:
            candidates.append(candidates.pop(0))
        return candidates

    @staticmethod
    def _alias(channel: str) -> str:
        return f"overroll_{channel}"

    def _close_channel(self, channel: str) -> None:
        alias = self._alias(channel)
        self._mci(f"stop {alias}")
        self._mci(f"close {alias}")
        self._active_channels.discard(channel)

    def _channel_playing(self, channel: str) -> bool:
        code, mode = self._mci(f"status {self._alias(channel)} mode")
        return code == 0 and mode.strip().lower() in {"playing", "paused", "seeking"}

    def configure(self, enabled: bool, volume: int) -> None:
        self.enabled = enabled
        self.volume = max(0, min(100, volume))
        for channel in self._active_channels:
            gain = self._channel_gain.get(channel, 1.0)
            self._mci(f"setaudio {self._alias(channel)} volume to {round(self.volume * 10 * gain)}")

    def play(self, kind: str, relative: str | None = None) -> None:
        if not self.enabled:
            return
        now = time.perf_counter()
        channel = self._CHANNELS.get(kind, "ui")
        restartable = channel in {"ui", "hover", "team", "reroll", "quick"}
        if not restartable and now - self._last.get(kind, 0.0) < (0.08 if kind != "voice" else 0.35):
            return
        # Each category owns a channel. UI feedback can restart itself without
        # interrupting voices, roulette audio, or action feedback.
        if not restartable and now < self._busy_until.get(channel, 0.0):
            return
        if not restartable and self._channel_playing(channel):
            return
        self._close_channel(channel)
        alias = self._alias(channel)
        for relative_path in self._sound_paths(kind, relative):
            path = Path(self.resolve(relative_path))
            if not path.exists():
                continue
            safe_path = str(path).replace('"', "")
            code, _ = self._mci(f'open "{safe_path}" alias {alias}')
            if code != 0:
                continue
            gain = self._VOLUME_MULTIPLIERS.get(kind, 1.0)
            self._channel_gain[channel] = gain
            self._mci(f"setaudio {alias} volume to {round(self.volume * 10 * gain)}")
            code, _ = self._mci(f"play {alias}")
            if code == 0:
                self._active_channels.add(channel)
                self._last_variant[kind] = relative_path
                self._last[kind] = now
                self._busy_until[channel] = now + self._HOLD_SECONDS.get(channel, self._HOLD_SECONDS["ui"])
                return
            self._close_channel(channel)

    def stop_voice(self) -> None:
        if "voice" in self._active_channels:
            self._close_channel("voice")
        self._busy_until["voice"] = 0.0

    def shutdown(self) -> None:
        for channel in list(self._active_channels):
            self._close_channel(channel)


class AppController(QObject):
    stateChanged = Signal()
    resultChanged = Signal()
    pageChanged = Signal()
    settingsChanged = Signal()
    profilesChanged = Signal()
    profileEditorChanged = Signal()
    localeChanged = Signal()
    apiChanged = Signal()
    statusChanged = Signal()
    memoryTrimRequested = Signal()
    secretRevealed = Signal(str)

    def __init__(self, project_dir: Path) -> None:
        super().__init__()
        self.project_dir = project_dir
        self.legacy_root = project_dir.parent / "OWRPRenewed"
        self.user_root = Path(os.environ.get("APPDATA", str(project_dir))) / "OWRPRenewed"
        self._url_cache: dict[str, str] = {}
        self.window: Any = None
        self._page = "result"
        self._mode = "122"
        self._custom_count = 5
        self._custom_teams = 1
        self._quick_role = "any"
        self._unique = True
        self._quickplay = True
        # Quick Play also controls balanced role composition. Keep the old
        # property as a compatibility alias for existing QML and profiles.
        self._role_composition = True
        self._random_perks = True
        self._roles_only = False
        self._stadium = False
        self._status = ""
        self._result_title = ""
        self._result_summary = "0 Tanques · 0 Daño · 0 Apoyo"
        self._team_count = 1
        self._api_running = False
        self._api_progress = 0.0
        self._api_status = ""
        self._api_process: QProcess | None = None
        self._api_output_buffer = ""
        self._api_cancel_requested = False
        self._profile_role = "all"
        self._profile_game = "overwatch"
        self._profile_search = ""
        self._current_profile_id = ""
        self.module_manager: Any = None
        self._revision = 0
        self._voice_serial = 0
        self._last_voice_path = ""
        self._secret_buffer = ""

        self.settings = self._load_json(self.user_root / "data/settings.json", {})
        try:
            overlay_card_size = int(self.settings.get("overlay_card_size", 200))
        except (TypeError, ValueError):
            overlay_card_size = 200
        try:
            sidebar_width = int(self.settings.get("sidebar_width", 326))
        except (TypeError, ValueError):
            sidebar_width = 326
        self.settings = {
            "schema_version": 2,
            "active_game": str(self.settings.get("active_game", "overwatch")),
            "sounds": bool(self.settings.get("sounds", True)),
            "hero_voices": bool(self.settings.get("hero_voices", True)),
            "volume": int(self.settings.get("volume", 50)),
            "animations": bool(self.settings.get("animations", True)),
            "compact_cards": bool(self.settings.get("compact_cards", True)),
            "hover_sounds": bool(self.settings.get("hover_sounds", True)),
            "stats_sounds": bool(self.settings.get("stats_sounds", True)),
            "secret_dps78_unlocked": bool(self.settings.get("secret_dps78_unlocked", False)),
            "secret_dps78_enabled": bool(self.settings.get("secret_dps78_enabled", False)),
            "secret_frogger_unlocked": bool(self.settings.get("secret_frogger_unlocked", False)),
            "secret_frogger_enabled": bool(self.settings.get("secret_frogger_enabled", False)),
            "performance_mode": (
                self.settings.get("performance_mode", "medium")
                if self.settings.get("performance_mode", "medium") in {"low", "medium", "high"}
                else "medium"
            ),
            "sidebar_width": max(326, min(460, sidebar_width)),
            "overlay_enabled": bool(self.settings.get("overlay_enabled", False)),
            "overlay_card_size": max(60, min(300, overlay_card_size)),
            "overlay_orientation": (
                self.settings.get("overlay_orientation", "horizontal")
                if self.settings.get("overlay_orientation", "horizontal") in {"horizontal", "vertical"}
                else "horizontal"
            ),
            "overlay_opacity": max(40, min(100, int(self.settings.get("overlay_opacity", 95)))),
            "overlay_spacing": max(0, min(24, int(self.settings.get("overlay_spacing", 8)))),
            "overlay_columns": max(0, min(8, int(self.settings.get("overlay_columns", 0)))),
            "overlay_show_names": bool(self.settings.get("overlay_show_names", True)),
            "overlay_show_details": bool(self.settings.get("overlay_show_details", True)),
            "twitch_channel": str(self.settings.get("twitch_channel", "")),
            "twitch_command": str(self.settings.get("twitch_command", "!overroll")),
            "locale": self.settings.get("locale", "es-mx") if self.settings.get("locale", "es-mx") in TEXT else "es-mx",
        }
        self.audio = AudioService(self.local_file, self)
        self.audio.configure(self.settings["sounds"], self.settings["volume"])
        self._profile_save_timer = QTimer(self)
        self._profile_save_timer.setSingleShot(True)
        self._profile_save_timer.setInterval(180)
        self._profile_save_timer.timeout.connect(self._save_profiles)

        self.snapshot: dict[str, Any] = {}
        self.heroes: list[dict[str, Any]] = []
        self.hero_by_key: dict[str, dict[str, Any]] = {}
        self._load_snapshot()
        latam_payload = self._load_json(
            self._resource_path("data/sounds/heroes/es-mx/latam_manifest.json"),
            {},
        )
        self._latam_voices: dict[str, dict[str, list[str]]] = latam_payload.get("heroes", {})
        self._load_profiles()

        self.players: list[dict[str, Any]] = []
        for index in range(24):
            assigned = self.player_profile_ids[index] if index < len(self.player_profile_ids) else ""
            profile_id = assigned if assigned in self.profiles else ""
            self.players.append({
                "playerIndex": index,
                "name": self._profile_name(profile_id) or f"Jugador {index + 1}",
                "roles": set(ROLES),
                "bans": set(),
                "profileId": profile_id,
            })

        self._player_model = DictListModel(PLAYER_ROLES, "playerIndex", self)
        self._pick_model = DictListModel(PICK_ROLES, "pickIndex", self)
        self._profile_hero_model = DictListModel(PROFILE_HERO_ROLES, "key", self)
        self._team1_model = TeamProxyModel(1, self)
        self._team2_model = TeamProxyModel(2, self)
        self._team1_model.setSourceModel(self._pick_model)
        self._team2_model.setSourceModel(self._pick_model)
        self.current_picks: list[dict[str, Any]] = []
        self._sync_players()
        self._refresh_profile_hero_model()
        self._set_ready_result()

    def attach_window(self, window: Any) -> None:
        self.window = window

    def attach_module_manager(self, manager: Any) -> None:
        self.module_manager = manager
        manager.attach_controller(self)
        self._refresh_profile_hero_model()

    @Property(QObject, constant=True)
    def playerModel(self) -> QObject:
        return self._player_model

    @Property(QObject, constant=True)
    def pickModel(self) -> QObject:
        return self._pick_model

    @Property(QObject, constant=True)
    def team1Model(self) -> QObject:
        return self._team1_model

    @Property(QObject, constant=True)
    def team2Model(self) -> QObject:
        return self._team2_model

    @Property(QObject, constant=True)
    def profileHeroModel(self) -> QObject:
        return self._profile_hero_model

    def _load_json(self, path: Path, fallback: Any) -> Any:
        try:
            return json.loads(path.read_text(encoding="utf-8")) if path.exists() else fallback
        except (OSError, json.JSONDecodeError):
            return fallback

    @staticmethod
    def _safe_relative_path(relative: str) -> Path | None:
        candidate = Path(str(relative).replace("/", os.sep))
        if not relative or candidate.is_absolute() or ".." in candidate.parts:
            return None
        return candidate

    def _resource_path(self, relative: str) -> Path:
        relative_path = self._safe_relative_path(relative)
        if relative_path is None:
            return self.project_dir / "__invalid_resource__"
        for root in (self.user_root, self.project_dir, self.legacy_root):
            resolved_root = root.resolve()
            candidate = (resolved_root / relative_path).resolve()
            try:
                candidate.relative_to(resolved_root)
            except ValueError:
                continue
            if candidate.exists():
                return candidate
        return self.project_dir / "__missing_resource__"

    def local_file(self, relative: str) -> str:
        return str(self._resource_path(relative)) if relative else ""

    def bundled_file(self, relative: str) -> str:
        """Return a branded runtime asset without allowing stale user data to override it."""
        relative_path = self._safe_relative_path(relative)
        if relative_path is None:
            return ""
        root = self.project_dir.resolve()
        path = (root / relative_path).resolve()
        try:
            path.relative_to(root)
        except ValueError:
            return ""
        return str(path) if path.exists() else ""

    def _url(self, relative: str) -> str:
        if not relative:
            return ""
        cached = self._url_cache.get(relative)
        if cached is not None:
            return cached
        path = self._resource_path(relative)
        url = QUrl.fromLocalFile(str(path)).toString() if path.exists() else ""
        self._url_cache[relative] = url
        return url

    def _secret_portrait(self, hero_key: str, fallback: str) -> str:
        hero = self.hero_by_key.get(str(hero_key))
        if not hero:
            return fallback
        if hero_key == "lucio" and self.settings.get("secret_frogger_enabled", False):
            candidate = self.project_dir / "data" / "assets" / "secrets" / "frogger" / "lucio.jpg"
            if candidate.is_file():
                return QUrl.fromLocalFile(str(candidate)).toString()
        if hero.get("role") == "damage" and self.settings.get("secret_dps78_enabled", False):
            candidate = self.project_dir / "data" / "assets" / "secrets" / "dps78" / f"{hero_key}.png"
            if candidate.is_file():
                return QUrl.fromLocalFile(str(candidate)).toString()
        return fallback

    @Slot(str, str, result=str)
    def heroPortrait(self, hero_key: str, fallback: str) -> str:
        resolved = str(fallback or "")
        normalized = resolved.replace("\\", "/")
        if normalized.startswith("../"):
            normalized = normalized[3:]
        if normalized.startswith("data/") or normalized.startswith("assets/"):
            resolved = self._url(normalized)
        return self._secret_portrait(hero_key, resolved)

    @Property(str, constant=True)
    def appIcon(self) -> str:
        path = self.bundled_file("data/assets/app_icon.png")
        return QUrl.fromLocalFile(path).toString() if path else ""

    @Slot(str, result=str)
    def roleIcon(self, role: str) -> str:
        return self._url(ROLE_ICONS.get(role, ""))

    @Slot(str, result=str)
    def assetUrl(self, relative: str) -> str:
        return self._url(relative)

    def _load_snapshot(self) -> None:
        path = self._resource_path("data/heroes_snapshot.json")
        self.snapshot = self._load_json(path, {"heroes": [], "locales": ["en-us", "es-mx", "es-es"]})
        self.heroes = [hero for hero in self.snapshot.get("heroes", []) if hero.get("role") in ROLES]
        self.heroes.sort(key=lambda hero: (ROLES.index(hero.get("role")), str(hero.get("name", "")).lower()))
        self.hero_by_key = {str(hero.get("key")): hero for hero in self.heroes}

    def _load_profiles(self) -> None:
        payload = self._load_json(self.user_root / "data/profiles.json", {})
        self.profile_mode = str(payload.get("mode", "classic"))
        if self.profile_mode not in PROFILE_MODES:
            self.profile_mode = "classic"
        self.profiles: dict[str, dict[str, Any]] = {}
        for raw in payload.get("profiles", []):
            if not isinstance(raw, dict):
                continue
            profile_id = str(raw.get("id") or f"profile_{random.randint(1000, 999999)}")
            game_payload = raw.get("games") if isinstance(raw.get("games"), dict) else {}
            ow_payload = game_payload.get("overwatch") if isinstance(game_payload.get("overwatch"), dict) else {}
            groups = raw.get("heroes") if isinstance(raw.get("heroes"), dict) else ow_payload.get("heroes", {})
            self.profiles[profile_id] = {
                "id": profile_id,
                "name": str(raw.get("name") or "Nuevo perfil"),
                "heroes": {bucket: sorted({str(key) for key in groups.get(bucket, [])}) for bucket in PROFILE_BUCKETS},
                "games": self._normalize_profile_games(game_payload),
            }
        self.player_profile_ids = [str(value) for value in payload.get("player_profiles", [])] if isinstance(payload.get("player_profiles"), list) else []
        if self.profiles:
            self._current_profile_id = next(iter(sorted(self.profiles, key=lambda key: self.profiles[key]["name"].lower())))

    def _normalize_profile_games(self, games: Any) -> dict[str, Any]:
        def clean_keys(value: Any, limit: int = 512) -> list[str]:
            if not isinstance(value, list):
                return []
            return sorted({str(key)[:100] for key in value})[:limit]

        source = games if isinstance(games, dict) else {}
        result: dict[str, Any] = {}
        for game_id in (
            "rivals", "valorant", "lastflag", "deadlock", "thefinals",
            "paladins", "fragpunk", "apex",
        ):
            game = source.get(game_id) if isinstance(source.get(game_id), dict) else {}
            groups = game.get("heroes") if isinstance(game.get("heroes"), dict) else {}
            result[game_id] = {
                "heroes": {
                    bucket: clean_keys(groups.get(bucket, []), 256)
                    for bucket in PROFILE_BUCKETS
                },
                "favorites": clean_keys(game.get("favorites", [])),
                "blocked": clean_keys(game.get("blocked", [])),
            }
        pvz = source.get("pvzgw2") if isinstance(source.get("pvzgw2"), dict) else {}
        result["pvzgw2"] = {
            "collection": clean_keys(pvz.get("collection", [])),
            "collection_configured": bool(pvz.get("collection_configured", False)),
            "favorites": clean_keys(pvz.get("favorites", [])),
            "blocked": clean_keys(pvz.get("blocked", [])),
        }
        tf2 = source.get("tf2") if isinstance(source.get("tf2"), dict) else {}
        result["tf2"] = {
            "favorites": clean_keys(tf2.get("favorites", [])),
            "blocked": clean_keys(tf2.get("blocked", [])),
        }
        return result

    def _save_profiles(self) -> None:
        self._profile_save_timer.stop()
        path = self.user_root / "data/profiles.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        assignments = [player.get("profileId", "") for player in getattr(self, "players", [])]
        if not assignments:
            assignments = self.player_profile_ids
        serialized_profiles = []
        for profile in self.profiles.values():
            item = dict(profile)
            games = dict(item.get("games", {}))
            games["overwatch"] = {"heroes": item.pop("heroes", {})}
            item["games"] = games
            serialized_profiles.append(item)
        payload = {
            "schema_version": 2,
            "mode": self.profile_mode,
            "profiles": sorted(serialized_profiles, key=lambda profile: profile["name"].lower()),
            "player_profiles": assignments,
        }
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    def _schedule_profiles_save(self) -> None:
        self._profile_save_timer.start()

    @Slot()
    def flushPendingWrites(self) -> None:
        if self._profile_save_timer.isActive():
            self._save_profiles()

    def _save_settings(self) -> None:
        path = self.user_root / "data/settings.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self.settings, ensure_ascii=False, indent=2), encoding="utf-8")

    def _text(self, key: str) -> str:
        locale = self.settings.get("locale", "es-mx")
        return TEXT.get(locale, TEXT["es-mx"]).get(key, TEXT["es-mx"].get(key, key))

    @Slot(str, result=str)
    def tr(self, key: str) -> str:
        return self._text(key)

    @Property(str, notify=localeChanged)
    def locale(self) -> str:
        return self.settings["locale"]

    @Property("QVariantMap", notify=localeChanged)
    def ui(self) -> dict[str, str]:
        locale = self.settings["locale"]
        merged = dict(TEXT["es-mx"])
        merged.update(TEXT.get(locale, {}))
        return merged

    @Property(str, notify=pageChanged)
    def currentPage(self) -> str:
        return self._page

    @Slot(str)
    def navigate(self, page: str) -> None:
        if page not in {"result", "games", "stats", "profiles", "settings", "help", "local"} or page == self._page:
            return
        self._page = page
        self.pageChanged.emit()
        self.memoryTrimRequested.emit()

    @Slot(str)
    def playUiSound(self, kind: str) -> None:
        if kind == "nav_hover" and not self.settings.get("hover_sounds", True):
            return
        if kind.startswith("stats_") and not self.settings.get("stats_sounds", True):
            return
        if kind in {
            "click", "filter", "help", "mode", "nav", "nav_hover", "nav_click", "profile", "reset", "shuffle", "toggle",
            "toggle_on", "toggle_off", "roulette_build", "roulette_weight", "roulette_spin", "roulette_win",
            "stats_search", "stats_open", "stats_filter", "stats_refresh", "stats_link", "stats_tab",
            "tf2_click", "tf2_generate", "tf2_reroll", "pvz_click", "pvz_generate", "pvz_reroll",
        }:
            self.audio.play(kind)

    @Property(str, notify=stateChanged)
    def mode(self) -> str:
        return self._mode

    @Slot(str)
    def setMode(self, mode: str) -> None:
        if mode not in {"122", "222", "custom"} or mode == self._mode:
            return
        self.audio.play("mode")
        self._mode = mode
        self._sync_players()
        self.stateChanged.emit()

    def _active_count(self) -> int:
        return 5 if self._mode == "122" else 6 if self._mode == "222" else self._custom_count

    @Property(int, notify=stateChanged)
    def playerCount(self) -> int:
        return self._active_count()

    @Property(int, notify=stateChanged)
    def customCount(self) -> int:
        return self._custom_count

    @Slot(int)
    def changeCustomCount(self, delta: int) -> None:
        value = max(1, min(24, self._custom_count + delta))
        if value == self._custom_count:
            return
        self._custom_count = value
        self._sync_players()
        self.audio.play("click")
        self.stateChanged.emit()

    @Slot(int)
    def setUnifiedPlayerCount(self, value: int) -> None:
        value = max(1, min(24, int(value)))
        self._custom_count = value
        self._mode = "122" if value == 5 else "222" if value == 6 else "custom"
        self._sync_players()
        self.audio.play("click")
        self.stateChanged.emit()

    @Property(int, notify=stateChanged)
    def customTeams(self) -> int:
        return self._custom_teams

    @Slot(int)
    def setCustomTeams(self, value: int) -> None:
        value = 2 if value == 2 else 1
        if value != self._custom_teams:
            self._custom_teams = value
            self.audio.play("mode")
            self.stateChanged.emit()

    def _profile_name(self, profile_id: str) -> str:
        return str(self.profiles.get(profile_id, {}).get("name", ""))

    def _player_row(self, player: dict[str, Any]) -> dict[str, Any]:
        profile_name = self._profile_name(str(player.get("profileId", "")))
        roles = player["roles"]
        return {
            "playerIndex": player["playerIndex"],
            "name": player["name"],
            "tank": "tank" in roles,
            "damage": "damage" in roles,
            "support": "support" in roles,
            "profileId": player.get("profileId", ""),
            "profileName": profile_name,
            "profileInitial": profile_name[:1].upper() if profile_name else "☆",
        }

    def _sync_players(self) -> None:
        self._player_model.replace([self._player_row(player) for player in self.players[: self._active_count()]])
        self.profilesChanged.emit()

    @Slot(int, str)
    def setPlayerName(self, index: int, name: str) -> None:
        if 0 <= index < len(self.players) and not self.players[index].get("profileId"):
            self.players[index]["name"] = name.strip() or f"Jugador {index + 1}"
            self._player_model.update_row(index, self._player_row(self.players[index]))
            self.stateChanged.emit()

    @Slot(int, str)
    def togglePlayerRole(self, index: int, role: str) -> None:
        if not 0 <= index < self._active_count() or role not in ROLES:
            return
        roles = self.players[index]["roles"]
        if role in roles:
            if len(roles) == 1:
                self.audio.play("deny")
                return
            roles.remove(role)
            sound = "toggle_off"
        else:
            roles.add(role)
            sound = "toggle_on"
        self.audio.play(sound)
        self._player_model.update_row(index, self._player_row(self.players[index]))

    @Slot()
    def clearNames(self) -> None:
        for index in range(self._active_count()):
            if not self.players[index].get("profileId"):
                self.players[index]["name"] = f"Jugador {index + 1}"
        self.audio.play("reset")
        self._sync_players()

    @Slot()
    def resetRoles(self) -> None:
        for player in self.players[: self._active_count()]:
            player["roles"] = set(ROLES)
        self.audio.play("reset")
        self._sync_players()

    @Slot()
    def shufflePlayers(self) -> None:
        count = self._active_count()
        original_names = [p["name"] for p in self.players[:count]]
        payload = [(set(p["roles"]), set(p["bans"]), p.get("profileId", "")) for p in self.players[:count]]
        random.shuffle(payload)
        for index, (player, values) in enumerate(zip(self.players[:count], payload)):
            player["roles"], player["bans"], player["profileId"] = values
            player["name"] = self._profile_name(player["profileId"]) or original_names[index]
        self.audio.play("shuffle")
        self._sync_players()

    @Property("QVariantList", notify=profilesChanged)
    def profileChoices(self) -> list[dict[str, str]]:
        rows = [{"id": "", "name": self._text("no_profile")}]
        rows.extend({"id": profile["id"], "name": profile["name"]} for profile in sorted(self.profiles.values(), key=lambda p: p["name"].lower()))
        return rows

    @Property("QStringList", notify=stateChanged)
    def playerNames(self) -> list[str]:
        return [str(player["name"]) for player in self.players[: self._active_count()]]

    @Property("QStringList", notify=profileEditorChanged)
    def profilePlayerNames(self) -> list[str]:
        count = self._active_count()
        if self.module_manager is not None and self._profile_game in self.module_manager.modules:
            count = len(self.module_manager.modules[self._profile_game].state.get("slots", []))
        return [str(player["name"]) for player in self.players[:count]]

    @Slot(int, str)
    def assignPlayerProfile(self, index: int, profile_id: str) -> None:
        if not 0 <= index < len(self.players):
            return
        valid_profile_id = profile_id if profile_id in self.profiles else ""
        self.players[index]["profileId"] = valid_profile_id
        self.players[index]["name"] = self._profile_name(valid_profile_id) or f"Jugador {index + 1}"
        self.audio.play("profile")
        if index < self._player_model.rowCount():
            self._player_model.update_row(index, self._player_row(self.players[index]))
        self._save_profiles()

    def _role_counts(self) -> dict[str, int]:
        if self._mode == "122":
            return {"tank": 1, "damage": 2, "support": 2}
        if self._mode == "222":
            return {"tank": 2, "damage": 2, "support": 2}
        return {role: 0 for role in ROLES}

    def _profile_groups(self, player: dict[str, Any]) -> dict[str, set[str]] | None:
        profile = self.profiles.get(str(player.get("profileId", "")))
        if not profile:
            return None
        return {bucket: set(profile["heroes"].get(bucket, [])) for bucket in PROFILE_BUCKETS}

    def _mode_buckets(self) -> tuple[str, ...] | None:
        return {
            "classic": None,
            "allprofile": PROFILE_BUCKETS,
            "lowprob": PROFILE_BUCKETS,
            "practice": ("practice", "avoid"),
            "played": ("main", "played", "practice"),
            "prefer": ("main", "played"),
            "main": ("main",),
        }.get(self.profile_mode)

    def _eligible_heroes(self, role: str | None = None) -> list[dict[str, Any]]:
        rows = []
        for hero in self.heroes:
            if role and hero.get("role") != role:
                continue
            gamemodes = hero.get("gamemodes") or []
            if self._quickplay and gamemodes and "quickplay" not in gamemodes:
                continue
            if self._stadium and not hero.get("stadium_powers"):
                continue
            rows.append(hero)
        return rows

    def _pool_for(self, player: dict[str, Any], role: str, used: set[str]) -> list[dict[str, Any]]:
        pool = [hero for hero in self._eligible_heroes(role) if hero["key"] not in player["bans"] and hero["key"] not in used]
        groups = self._profile_groups(player)
        buckets = self._mode_buckets()
        if groups and buckets is not None:
            allowed = set().union(*(groups.get(bucket, set()) for bucket in buckets))
            profiled = [hero for hero in pool if hero["key"] in allowed]
            if profiled:
                pool = profiled
        return pool

    def _pick_hero(self, player: dict[str, Any], role: str, used: set[str], exclude: str = "") -> dict[str, Any] | None:
        pool = [hero for hero in self._pool_for(player, role, used) if hero["key"] != exclude]
        if not pool:
            return None
        groups = self._profile_groups(player)
        if self.profile_mode == "lowprob" and groups:
            weights = {"avoid": 8, "practice": 5, "played": 3, "main": 1}
            hero_weights = []
            for hero in pool:
                bucket = next((name for name in PROFILE_BUCKETS if hero["key"] in groups.get(name, set())), "")
                hero_weights.append(weights.get(bucket, 1))
            return random.choices(pool, weights=hero_weights, k=1)[0]
        return random.choice(pool)

    def _can_play(self, player: dict[str, Any], role: str) -> bool:
        return role in player["roles"] and (self._roles_only or bool(self._pool_for(player, role, set())))

    def _assign_fixed(
        self,
        players: list[dict[str, Any]],
        slots: list[str],
        forced_roles: dict[int, str] | None = None,
    ) -> list[tuple[dict[str, Any], str]] | None:
        slots = slots[:]
        random.shuffle(slots)
        forced_roles = forced_roles or {}
        preassigned: list[tuple[dict[str, Any], str]] = []
        remaining_players = players[:]
        for player in players:
            role = forced_roles.get(int(player["playerIndex"]))
            if not role:
                continue
            if role not in slots or not self._can_play(player, role):
                return None
            slots.remove(role)
            preassigned.append((player, role))
            remaining_players = [
                item for item in remaining_players
                if item["playerIndex"] != player["playerIndex"]
            ]

        def backtrack(remaining_slots: list[str], remaining: list[dict[str, Any]]) -> list[tuple[dict[str, Any], str]] | None:
            if not remaining_slots:
                return []
            best = min(range(len(remaining_slots)), key=lambda i: sum(self._can_play(player, remaining_slots[i]) for player in remaining))
            role = remaining_slots[best]
            next_slots = remaining_slots[:best] + remaining_slots[best + 1 :]
            candidates = [player for player in remaining if self._can_play(player, role)]
            random.shuffle(candidates)
            for player in candidates:
                result = backtrack(next_slots, [item for item in remaining if item["playerIndex"] != player["playerIndex"]])
                if result is not None:
                    return [(player, role), *result]
            return None

        result = backtrack(slots, remaining_players)
        if result is not None:
            result = [*preassigned, *result]
            result.sort(key=lambda pair: pair[0]["playerIndex"])
        return result

    def _assign_custom(
        self,
        players: list[dict[str, Any]],
        forced_roles: dict[int, str] | None = None,
    ) -> list[tuple[dict[str, Any], str]] | None:
        forced_roles = forced_roles or {}
        if self._quickplay:
            count = len(players)
            if count == 1:
                slots = [random.choice(ROLES)]
            elif count == 2:
                slots = random.sample(list(ROLES), 2)
            elif count == 3:
                slots = list(ROLES)
            elif count == 5:
                slots = ["tank", "damage", "damage", "support", "support"]
            elif count == 6:
                slots = [role for role in ROLES for _ in range(2)]
            else:
                base, extra = divmod(count, len(ROLES))
                slots = [role for role in ROLES for _ in range(base)]
                slots.extend(random.sample(list(ROLES), extra))
            balanced = self._assign_fixed(players, slots, forced_roles)
            if balanced is not None:
                return balanced
        result = []
        for player in players:
            forced_role = forced_roles.get(int(player["playerIndex"]))
            if forced_role and self._can_play(player, forced_role):
                result.append((player, forced_role))
                continue
            roles = [role for role in ROLES if self._can_play(player, role)]
            if not roles:
                return None
            result.append((player, random.choice(roles)))
        return result

    def _assign_unique_heroes(
        self, assignments: list[tuple[dict[str, Any], str]]
    ) -> list[dict[str, Any]] | None:
        """Match every assigned player to a distinct compatible hero."""

        indexed = list(enumerate(assignments))

        def solve(
            remaining: list[tuple[int, tuple[dict[str, Any], str]]], used: set[str]
        ) -> dict[int, dict[str, Any]] | None:
            if not remaining:
                return {}

            choices = []
            for position, (_, (player, role)) in enumerate(remaining):
                pool = self._pool_for(player, role, used)
                if not pool:
                    return None
                choices.append((len(pool), position, pool))

            _, best_position, candidates = min(choices, key=lambda choice: choice[0])
            original_index, _ = remaining[best_position]
            next_remaining = remaining[:best_position] + remaining[best_position + 1 :]
            candidates = candidates[:]
            random.shuffle(candidates)
            for hero in candidates:
                result = solve(next_remaining, used | {hero["key"]})
                if result is not None:
                    result[original_index] = hero
                    return result
            return None

        matched = solve(indexed, set())
        return [matched[index] for index in range(len(assignments))] if matched is not None else None

    def _assign_custom_unique(
        self, players: list[dict[str, Any]]
    ) -> list[tuple[dict[str, Any], str, dict[str, Any]]] | None:
        """Choose a role and a distinct hero together for large custom teams."""

        def options_for(player: dict[str, Any], used: set[str]) -> list[tuple[str, dict[str, Any]]]:
            options = []
            for role in ROLES:
                if role in player["roles"]:
                    options.extend((role, hero) for hero in self._pool_for(player, role, used))
            random.shuffle(options)
            return options

        def solve(
            remaining: list[dict[str, Any]], used: set[str]
        ) -> list[tuple[dict[str, Any], str, dict[str, Any]]] | None:
            if not remaining:
                return []

            choices = [(len(options_for(player, used)), index) for index, player in enumerate(remaining)]
            option_count, best_index = min(choices, key=lambda choice: choice[0])
            if option_count == 0:
                return None

            player = remaining[best_index]
            next_remaining = remaining[:best_index] + remaining[best_index + 1 :]
            for role, hero in options_for(player, used):
                result = solve(next_remaining, used | {hero["key"]})
                if result is not None:
                    return [(player, role, hero), *result]
            return None

        result = solve(players[:], set())
        if result:
            result.sort(key=lambda item: item[0]["playerIndex"])
        return result

    def _localized(self, item: dict[str, Any], field: str) -> str:
        locale = self.settings["locale"]
        local = item.get("localizations") or {}
        return str((local.get(locale) or local.get("en-us") or {}).get(field) or item.get(field) or "")

    def _profile_bucket(self, player: dict[str, Any], hero_key: str) -> str:
        profile = self.profiles.get(str(player.get("profileId", "")))
        if not profile:
            return ""
        return next((name for name in PROFILE_BUCKETS if hero_key in profile["heroes"].get(name, [])), "")

    def _profile_tag(self, player: dict[str, Any], hero_key: str) -> str:
        profile = self.profiles.get(str(player.get("profileId", "")))
        if not profile:
            return ""
        bucket = self._profile_bucket(player, hero_key)
        return self._text(bucket) if bucket else ""

    def _perk_view(self, perk: dict[str, Any] | None) -> dict[str, str] | None:
        if not perk:
            return None
        return {
            "name": self._localized(perk, "name"),
            "description": self._localized(perk, "description"),
            "icon": self._url(str(perk.get("icon_path") or "")),
        }

    def _roll_perks(self, hero: dict[str, Any]) -> list[dict[str, str]]:
        if not self._random_perks:
            return []
        if self._stadium:
            powers = hero.get("stadium_powers") or []
            selected = random.sample(powers, min(4, len(powers))) if powers else []
            return [view for item in selected if (view := self._perk_view(item))]
        perks = hero.get("perks") or {}
        selected = []
        if perks.get("minor"):
            selected.append(random.choice(perks["minor"]))
        if perks.get("major"):
            selected.append(random.choice(perks["major"]))
        return [view for item in selected if (view := self._perk_view(item))]

    def _pick_view(self, pick: dict[str, Any], index: int) -> dict[str, Any]:
        hero = pick.get("hero")
        role = pick["role"]
        player = pick["player"]
        subrole = str(hero.get("subrole") or "") if hero else ""
        perks = list(pick.get("perks", []))[:4]
        view = {
            "pickIndex": index,
            "team": pick.get("team", 1),
            "playerIndex": player["playerIndex"],
            "playerName": player["name"],
            "profileName": self._profile_name(player.get("profileId", "")),
            "profileTag": self._profile_tag(player, hero["key"]) if hero else "",
            "heroKey": hero["key"] if hero else "",
            "heroName": self._localized(hero, "name") if hero else self._text(role),
            "role": role,
            "roleName": self._text(role),
            "subrole": subrole,
            "subroleName": subrole.replace("-", " ").title(),
            "portrait": self._secret_portrait(
                str(hero.get("key") or ""),
                self._url(str(hero.get("portrait_path") or "")),
            ) if hero else "",
            "roleIcon": self._url(ROLE_ICONS[role]),
            "largeRoleIcon": self._url(LARGE_ROLE_ICONS[role]),
            "subroleIcon": self._url(SUBROLE_ICONS.get(subrole, "")),
            "accent": ROLE_COLORS[role],
            "perkCount": len(perks),
            "rolesOnly": self._roles_only,
            "pinned": bool(pick.get("pinned", False)),
            "revision": pick.get("revision", self._revision),
        }
        for perk_index in range(4):
            perk = perks[perk_index] if perk_index < len(perks) else {}
            view[f"perk{perk_index}Name"] = str(perk.get("name", ""))
            view[f"perk{perk_index}Description"] = str(perk.get("description", ""))
            view[f"perk{perk_index}Icon"] = str(perk.get("icon", ""))
        return view

    def _summary(self, counts: dict[str, int]) -> str:
        return f"{counts['tank']} {self._text('tank')} · {counts['damage']} {self._text('damage')} · {counts['support']} {self._text('support')}"

    @Slot()
    def generateTeam(self) -> None:
        players = self.players[: self._active_count()]
        selected_heroes: list[dict[str, Any] | None] | None = None
        pinned_by_player = {
            int(pick["player"]["playerIndex"]): pick
            for pick in self.current_picks
            if pick.get("pinned") and pick.get("hero")
        }
        forced_roles = {
            player_index: str(pick["role"])
            for player_index, pick in pinned_by_player.items()
        }
        if self._mode == "custom" or not self._quickplay:
            assignments = self._assign_custom(players, forced_roles)
        else:
            counts = self._role_counts()
            slots = [role for role in ROLES for _ in range(counts[role])]
            assignments = self._assign_fixed(players, slots, forced_roles)
        if assignments is None:
            self._set_status(self._text("no_candidates"))
            self.audio.play("deny")
            return

        if self._roles_only:
            selected_heroes = [None] * len(assignments)
        elif pinned_by_player:
            selected_heroes = [None] * len(assignments)
            used: set[str] = set()
            for index, (player, role) in enumerate(assignments):
                previous = pinned_by_player.get(int(player["playerIndex"]))
                if not previous or previous.get("role") != role:
                    continue
                hero = previous.get("hero")
                allowed = {
                    candidate["key"]
                    for candidate in self._pool_for(player, role, set())
                }
                if hero and hero.get("key") in allowed and (not self._unique or hero["key"] not in used):
                    selected_heroes[index] = hero
                    used.add(hero["key"])
            for index, (player, role) in enumerate(assignments):
                if selected_heroes[index] is not None:
                    continue
                hero = self._pick_hero(player, role, used if self._unique else set())
                selected_heroes[index] = hero
                if hero and self._unique:
                    used.add(hero["key"])
        elif selected_heroes is None and self._unique:
            selected_heroes = self._assign_unique_heroes(assignments)
        elif selected_heroes is None:
            selected_heroes = [self._pick_hero(player, role, set()) for player, role in assignments]
        if selected_heroes is None or (not self._roles_only and any(hero is None for hero in selected_heroes)):
            self._set_status(self._text("no_candidates"))
            self.audio.play("deny")
            return

        team_count = min(self._custom_teams, len(assignments)) if self._mode == "custom" else 1
        split_at = (len(assignments) + 1) // 2 if team_count == 2 else len(assignments)
        picks = []
        counts = {role: 0 for role in ROLES}
        for position, ((player, role), hero) in enumerate(zip(assignments, selected_heroes)):
            counts[role] += 1
            self._revision += 1
            previous = pinned_by_player.get(int(player["playerIndex"]))
            stays_pinned = bool(
                previous
                and previous.get("pinned")
                and previous.get("role") == role
                and previous.get("hero", {}).get("key") == (hero or {}).get("key")
            )
            picks.append({
                "player": player,
                "role": role,
                "hero": hero,
                "perks": self._roll_perks(hero) if hero else [],
                "team": 1 if position < split_at else 2,
                "pinned": stays_pinned,
                "revision": self._revision,
            })

        self.current_picks = picks
        self._team_count = team_count
        if self._mode == "122":
            self._result_title = self._text("team_122")
        elif self._mode == "222":
            self._result_title = self._text("team_222")
        else:
            self._result_title = self._text("custom_teams" if team_count == 2 else "custom_team")
        self._result_summary = self._summary(counts)
        self._pick_model.replace([self._pick_view(pick, index) for index, pick in enumerate(picks)])
        self.audio.play("team")
        self._set_status("")
        self.resultChanged.emit()

    @Slot(int)
    def reroll(self, index: int) -> None:
        if not 0 <= index < len(self.current_picks) or self._roles_only:
            return
        pick = self.current_picks[index]
        if pick.get("pinned"):
            self.audio.play("deny")
            return
        used = {other["hero"]["key"] for i, other in enumerate(self.current_picks) if i != index and other.get("hero")} if self._unique else set()
        old_key = pick["hero"]["key"] if pick.get("hero") else ""
        hero = self._pick_hero(pick["player"], pick["role"], used, exclude=old_key)
        if not hero:
            self.audio.play("deny")
            self._set_status(self._text("no_alternative"))
            return
        self.audio.play("reroll")
        self.audio.stop_voice()
        self._revision += 1
        pick["hero"] = hero
        pick["perks"] = self._roll_perks(hero)
        pick["revision"] = self._revision
        self._pick_model.update_row(index, self._pick_view(pick, index))
        self._set_status("")
        self._voice_serial += 1
        serial = self._voice_serial
        hero_key = hero["key"]
        QTimer.singleShot(500, lambda: self._play_reroll_voice(serial, index, hero_key))

    @Slot(int)
    def togglePickPinned(self, index: int) -> None:
        if not 0 <= index < len(self.current_picks) or self._roles_only:
            return
        pick = self.current_picks[index]
        pick["pinned"] = not bool(pick.get("pinned", False))
        self._pick_model.update_row(index, self._pick_view(pick, index))
        self.audio.play("toggle_on" if pick["pinned"] else "toggle_off")

    def _play_reroll_voice(self, serial: int, index: int, hero_key: str) -> None:
        if serial != self._voice_serial or not self.settings.get("hero_voices", True):
            return
        if not 0 <= index < len(self.current_picks) or self.current_picks[index].get("hero", {}).get("key") != hero_key:
            return
        locale = self.settings["locale"]
        pick = self.current_picks[index]
        is_main = self._profile_bucket(pick["player"], hero_key) == "main"
        if locale in ("es-mx", "es-es"):
            hero_voices = self._latam_voices.get(hero_key, {})
            group = "main" if is_main and hero_voices.get("main") else "regular"
            options = [path for path in hero_voices.get(group, []) if self._resource_path(path).exists()]
            choices = [path for path in options if path != self._last_voice_path] or options
            if choices:
                selected = random.choice(choices)
                self._last_voice_path = selected
                self.audio.play("voice", selected)
                return
        candidates = [locale, "es-mx" if locale == "es-es" else ""] if locale.startswith("es-") else ["en-us"]
        for voice_locale in candidates:
            if not voice_locale:
                continue
            voice_types = (
                ("ultimate", "nano", "hero_selected", "hero_change", "voice_default")
                if is_main and voice_locale == "en-us"
                else ("hero_selected", "hero_change", "voice_default")
            )
            for voice_type in voice_types:
                relative = f"data/sounds/heroes/{voice_locale}/{hero_key}_{voice_type}.mp3"
                if self._resource_path(relative).exists():
                    self.audio.play("voice", relative)
                    return

    @Slot(str)
    def playRouletteVoice(self, hero_key: str) -> None:
        """Play one localized regular line after the roulette settles."""
        if not hero_key or not self.settings.get("hero_voices", True):
            return
        self.audio.stop_voice()
        locale = self.settings["locale"]
        if locale in ("es-mx", "es-es"):
            hero_voices = self._latam_voices.get(hero_key, {})
            options = [
                path for path in hero_voices.get("regular", [])
                if self._resource_path(path).exists()
            ]
            choices = [path for path in options if path != self._last_voice_path] or options
            if choices:
                selected = random.choice(choices)
                self._last_voice_path = selected
                self.audio.play("voice", selected)
                return
        voice_locale = "en-us"
        for voice_type in ("hero_selected", "hero_change", "voice_default"):
            relative = f"data/sounds/heroes/{voice_locale}/{hero_key}_{voice_type}.mp3"
            if self._resource_path(relative).exists():
                self.audio.play("voice", relative)
                return

    @Slot(str)
    def setQuickRole(self, role: str) -> None:
        value = role if role in (*ROLES, "any") else "any"
        if value != self._quick_role:
            self._quick_role = value
            self.audio.play("mode")
            self.stateChanged.emit()

    @Property(str, notify=stateChanged)
    def quickRole(self) -> str:
        return self._quick_role

    @Slot()
    def quickRoll(self) -> None:
        roles = list(ROLES) if self._quick_role == "any" else [self._quick_role]
        role = random.choice(roles)
        player = {"playerIndex": -1, "name": self._text("quick_hero"), "roles": set(ROLES), "bans": set(), "profileId": ""}
        hero = None if self._roles_only else self._pick_hero(player, role, set())
        if not self._roles_only and not hero:
            return
        self._revision += 1
        pick = {"player": player, "role": role, "hero": hero, "perks": self._roll_perks(hero) if hero else [], "team": 1, "revision": self._revision}
        self.current_picks = [pick]
        self._team_count = 1
        self._result_title = self._text("quick_hero").title()
        counts = {name: int(name == role) for name in ROLES}
        self._result_summary = self._summary(counts)
        self._pick_model.replace([self._pick_view(pick, 0)])
        self.audio.play("quick")
        self.resultChanged.emit()

    def _set_ready_result(self) -> None:
        self._result_title = self._text("ready")
        self._result_summary = self._summary({role: 0 for role in ROLES})
        self._status = self._text("ready_body")

    @Property(str, notify=resultChanged)
    def resultTitle(self) -> str:
        return self._result_title

    @Property(str, notify=resultChanged)
    def resultSummary(self) -> str:
        return self._result_summary

    @Property(int, notify=resultChanged)
    def resultTeamCount(self) -> int:
        return self._team_count

    @Property(bool, notify=resultChanged)
    def hasResults(self) -> bool:
        return bool(self.current_picks)

    @Property(int, notify=resultChanged)
    def resultCount(self) -> int:
        return len(self.current_picks)

    @Property(str, notify=statusChanged)
    def status(self) -> str:
        return self._status

    def _set_status(self, text: str) -> None:
        self._status = text
        self.statusChanged.emit()

    @Slot(QImage, int)
    def copyResultImage(self, image: QImage, logical_height: int) -> None:
        if image.isNull():
            return
        pixel_height = round(max(1, logical_height) * image.devicePixelRatio())
        cropped = image.copy(0, 0, image.width(), min(image.height(), pixel_height))
        QGuiApplication.clipboard().setImage(cropped)
        self.audio.play("capture")
        self._set_status(self._text("image_copied"))

    @Property(bool, notify=stateChanged)
    def uniqueHeroes(self) -> bool:
        return self._unique

    @Property(bool, notify=stateChanged)
    def quickplayOnly(self) -> bool:
        return self._quickplay

    @Property(bool, notify=stateChanged)
    def roleComposition(self) -> bool:
        return self._quickplay

    @Property(bool, notify=stateChanged)
    def randomPerks(self) -> bool:
        return self._random_perks

    @Property(bool, notify=stateChanged)
    def rolesOnly(self) -> bool:
        return self._roles_only

    @Property(bool, notify=stateChanged)
    def stadium(self) -> bool:
        return self._stadium

    @Slot(str)
    def toggleRule(self, rule: str) -> None:
        if rule == "composition":
            rule = "quickplay"
        attrs = {
            "unique": "_unique",
            "quickplay": "_quickplay",
            "perks": "_random_perks",
            "roles": "_roles_only",
            "stadium": "_stadium",
        }
        attr = attrs.get(rule)
        if not attr:
            return
        enabled = not getattr(self, attr)
        setattr(self, attr, enabled)
        if rule == "quickplay":
            self._role_composition = enabled
        if rule == "stadium" and self._stadium:
            self._quickplay = True
            self._role_composition = True
        self.audio.play("toggle_on" if enabled else "toggle_off")
        self.stateChanged.emit()

    @Slot(int, str, result="QVariantList")
    def filterHeroes(self, pick_index: int, query: str = "") -> list[dict[str, Any]]:
        if not 0 <= pick_index < len(self.current_picks):
            return []
        pick = self.current_picks[pick_index]
        player = pick["player"]
        query = query.strip().lower()
        groups = self._profile_groups(player)
        buckets = self._mode_buckets()
        profile_allowed = set().union(*(groups.get(bucket, set()) for bucket in buckets)) if groups and buckets is not None else None
        rows = []
        for hero in self._eligible_heroes():
            if hero["role"] not in player["roles"]:
                continue
            name = self._localized(hero, "name")
            if query and query not in name.lower():
                continue
            locked = bool(profile_allowed is not None and hero["key"] not in profile_allowed)
            rows.append({
                "key": hero["key"],
                "name": name,
                "role": hero["role"],
                "portrait": self._secret_portrait(
                    str(hero.get("key") or ""),
                    self._url(str(hero.get("portrait_path") or "")),
                ),
                "allowed": hero["key"] not in player["bans"],
                "profileLocked": locked,
            })
        return rows

    @Slot(int, str)
    def toggleHeroBan(self, pick_index: int, hero_key: str) -> None:
        if not 0 <= pick_index < len(self.current_picks):
            return
        player = self.current_picks[pick_index]["player"]
        if hero_key in player["bans"]:
            player["bans"].remove(hero_key)
            sound = "toggle_on"
        else:
            player["bans"].add(hero_key)
            sound = "toggle_off"
        self.audio.play(sound)

    @Slot(int, str)
    def toggleFilterRole(self, pick_index: int, role: str) -> None:
        if not 0 <= pick_index < len(self.current_picks) or role not in ROLES:
            return
        player = self.current_picks[pick_index]["player"]
        keys = {hero["key"] for hero in self._eligible_heroes(role)}
        all_allowed = all(key not in player["bans"] for key in keys)
        if all_allowed:
            player["bans"].update(keys)
            sound = "toggle_off"
        else:
            player["bans"].difference_update(keys)
            sound = "toggle_on"
        self.audio.play(sound)

    @Slot(int)
    def resetFilters(self, pick_index: int) -> None:
        if 0 <= pick_index < len(self.current_picks):
            self.current_picks[pick_index]["player"]["bans"].clear()
            self.audio.play("click")

    @Property("QVariantList", notify=profilesChanged)
    def profilesList(self) -> list[dict[str, str]]:
        return [{"id": p["id"], "name": p["name"]} for p in sorted(self.profiles.values(), key=lambda p: p["name"].lower())]

    @Property(str, notify=profilesChanged)
    def currentProfileId(self) -> str:
        return self._current_profile_id

    @Property(str, notify=profilesChanged)
    def currentProfileName(self) -> str:
        return self._profile_name(self._current_profile_id)

    @Slot(str)
    def selectProfile(self, profile_id: str) -> None:
        if profile_id in self.profiles and profile_id != self._current_profile_id:
            self._current_profile_id = profile_id
            self._refresh_profile_hero_model()
            self.profilesChanged.emit()
            self.profileEditorChanged.emit()

    @Slot()
    def newProfile(self) -> None:
        profile_id = f"profile_{int(time.time() * 1000)}"
        number = len(self.profiles) + 1
        self.profiles[profile_id] = {
            "id": profile_id,
            "name": f"{self._text('new_profile')} {number}",
            "heroes": {bucket: [] for bucket in PROFILE_BUCKETS},
            "games": self._normalize_profile_games({
                "tf2": {"blocked": [], "favorites": []},
                "pvzgw2": {
                    "blocked": [],
                    "collection": [],
                    "collection_configured": False,
                    "favorites": [],
                },
                "rivals": {
                    "heroes": {bucket: [] for bucket in PROFILE_BUCKETS},
                    "favorites": [],
                    "blocked": [],
                },
            }),
        }
        self._current_profile_id = profile_id
        self._save_profiles()
        self._refresh_profile_hero_model()
        self.audio.play("profile")
        self.profilesChanged.emit()
        self.profileEditorChanged.emit()

    @Slot()
    def deleteProfile(self) -> None:
        if self._current_profile_id not in self.profiles:
            return
        removed = self._current_profile_id
        self.profiles.pop(removed)
        for player in self.players:
            if player.get("profileId") == removed:
                player["profileId"] = ""
                player["name"] = f"Jugador {player['playerIndex'] + 1}"
        self._current_profile_id = next(iter(self.profiles), "")
        self._save_profiles()
        self._refresh_profile_hero_model()
        self._sync_players()
        self.profilesChanged.emit()
        self.profileEditorChanged.emit()

    @Slot(str)
    def renameCurrentProfile(self, name: str) -> None:
        profile = self.profiles.get(self._current_profile_id)
        name = name.strip()
        if profile and name:
            profile["name"] = name
            for player in self.players:
                if player.get("profileId") == self._current_profile_id:
                    player["name"] = name
            self._save_profiles()
            self._sync_players()
            self.profilesChanged.emit()

    @Property(str, notify=profilesChanged)
    def profileMode(self) -> str:
        return self.profile_mode

    @Property(str, notify=profilesChanged)
    def profileModeName(self) -> str:
        return self._text(f"mode_{self.profile_mode}")

    @Property("QVariantList", notify=localeChanged)
    def profileModes(self) -> list[dict[str, str]]:
        return [{"id": mode, "name": self._text(f"mode_{mode}"), "description": self._text(f"mode_{mode}_help")} for mode in PROFILE_MODES]

    @Property(str, notify=profilesChanged)
    def profileModeDescription(self) -> str:
        return self._text(f"mode_{self.profile_mode}_help")

    @Slot(str)
    def setProfileMode(self, mode: str) -> None:
        if mode not in PROFILE_MODES or mode == self.profile_mode:
            return
        self.profile_mode = mode
        self.audio.play("mode")
        self._save_profiles()
        self.profilesChanged.emit()

    @Property(str, notify=profileEditorChanged)
    def profileRole(self) -> str:
        return self._profile_role

    @Property(str, notify=profileEditorChanged)
    def profileGame(self) -> str:
        return self._profile_game

    @Property("QVariantList", notify=profileEditorChanged)
    def profileGames(self) -> list[dict[str, str]]:
        return [
            {"id": "overwatch", "name": "Overwatch"},
            {"id": "rivals", "name": "Marvel Rivals"},
            {"id": "pvzgw2", "name": "PVZ GW2"},
            {"id": "valorant", "name": "Valorant"},
            {"id": "lastflag", "name": "Last Flag"},
            {"id": "deadlock", "name": "Deadlock"},
            {"id": "thefinals", "name": "THE FINALS"},
            {"id": "paladins", "name": "Paladins"},
            {"id": "fragpunk", "name": "FragPunk"},
            {"id": "apex", "name": "Apex Legends"},
        ]

    @Property("QVariantList", notify=profileEditorChanged)
    def profileGameRoles(self) -> list[dict[str, str]]:
        if self._profile_game in {"lastflag", "fragpunk"}:
            return []
        if self._profile_game == "overwatch":
            return [
                {"id": "all", "label": self._text("all")},
                {"id": "tank", "label": self._text("tank")},
                {"id": "damage", "label": self._text("damage")},
                {"id": "support", "label": self._text("support")},
            ]
        if self._profile_game == "pvzgw2":
            return [
                {"id": "all", "label": self._text("all")},
                {"id": "plants", "label": "Plantas"},
                {"id": "zombies", "label": "Zombis"},
            ]
        rows = [{"id": "all", "label": self._text("all")}]
        if self.module_manager is not None and self._profile_game in self.module_manager.modules:
            module = self.module_manager.modules[self._profile_game]
            labels = (
                module.localized_role_labels(self.locale)
                if hasattr(module, "localized_role_labels")
                else getattr(module, "role_labels", {})
            )
            rows.extend(
                {"id": role, "label": str(labels.get(role, role.replace("-", " ").title()))}
                for role in getattr(module, "roles", ())
            )
        return rows

    @Slot(str)
    def setProfileGame(self, game_id: str) -> None:
        valid = {row["id"] for row in self.profileGames}
        if game_id not in valid or game_id == self._profile_game:
            return
        self._profile_game = game_id
        self._profile_role = "all"
        self._profile_search = ""
        self._refresh_profile_hero_model()
        self.audio.play("mode")
        self.profileEditorChanged.emit()

    @Slot(str)
    def setProfileRole(self, role: str) -> None:
        valid_roles = {
            "overwatch": {"all", *ROLES},
            "rivals": {"all", "vanguard", "duelist", "strategist", "flex"},
            "pvzgw2": {"all", "plants", "zombies"},
        }.get(self._profile_game, {"all"})
        if self.module_manager is not None and self._profile_game in self.module_manager.modules:
            module = self.module_manager.modules[self._profile_game]
            valid_roles = {"all", *getattr(module, "roles", ())}
        role = role if role in valid_roles else "all"
        if role != self._profile_role:
            self._profile_role = role
            self._refresh_profile_hero_model()
            self.audio.play("mode")
            self.profileEditorChanged.emit()

    @Slot(str)
    def setProfileSearch(self, query: str) -> None:
        query = query.strip().lower()
        if query != self._profile_search:
            self._profile_search = query
            self._refresh_profile_hero_model()
            self.profileEditorChanged.emit()

    @Property("QVariantList", notify=profileEditorChanged)
    def profileHeroRows(self) -> list[dict[str, Any]]:
        return self._build_profile_hero_rows()

    def _build_profile_hero_rows(self) -> list[dict[str, Any]]:
        profile = self.profiles.get(self._current_profile_id)
        rows: list[dict[str, Any]] = []
        if self._profile_game == "overwatch":
            source = [{
                "key": hero["key"],
                "name": self._localized(hero, "name"),
                "role": hero["role"],
                "roleName": self._text(hero["role"]),
                "subrole": str(hero.get("subrole") or "").replace("-", " ").title(),
                "portrait": self._secret_portrait(
                    str(hero.get("key") or ""),
                    self._url(str(hero.get("portrait_path") or "")),
                ),
                "baseKey": "",
                "baseName": "",
            } for hero in self.heroes]
            groups = profile.get("heroes", {}) if profile else {}
        elif self._profile_game != "pvzgw2" and self.module_manager is not None and self._profile_game in self.module_manager.modules:
            module = self.module_manager.modules[self._profile_game]
            role_labels = (
                module.localized_role_labels(self.locale)
                if hasattr(module, "localized_role_labels")
                else getattr(module, "role_labels", {})
            )
            source = [{
                **hero,
                "game": self._profile_game,
                "roleName": role_labels.get(
                    hero.get("role"), str(hero.get("role", "")).replace("-", " ").title()
                ),
                "subrole": "",
                "baseKey": "",
                "baseName": "",
            } for hero in module.catalog()]
            game_data = profile.get("games", {}).get(self._profile_game, {}) if profile else {}
            groups = game_data.get("heroes", {})
        elif self._profile_game == "pvzgw2" and self.module_manager is not None:
            source = []
            for base in self.module_manager.modules["pvzgw2"].catalog():
                for variant in base.get("variants", []):
                    variant_name = str(variant.get("name", ""))
                    name = str(base.get("name", ""))
                    if variant_name and variant_name != "Predeterminado":
                        name += " - " + variant_name
                    source.append({
                        "key": variant.get("key", ""),
                        "name": name,
                        "role": base.get("side", ""),
                        "roleName": "Plantas" if base.get("side") == "plants" else "Zombis",
                        "subrole": str(base.get("name", "")),
                        "portrait": variant.get("portrait", ""),
                        "baseKey": base.get("key", ""),
                        "baseName": base.get("name", ""),
                    })
            groups = {}
        else:
            source, groups = [], {}

        game_data = profile.get("games", {}).get(self._profile_game, {}) if profile else {}
        collection = set(game_data.get("collection", []))
        collection_configured = bool(game_data.get("collection_configured", False))
        favorites = set(game_data.get("favorites", []))
        blocked = set(game_data.get("blocked", []))
        for hero in source:
            role = str(hero.get("role", ""))
            name = str(hero.get("name", ""))
            if self._profile_role != "all" and role != self._profile_role:
                continue
            if self._profile_search and self._profile_search not in name.lower():
                continue
            key = str(hero.get("key", ""))
            bucket = next((item for item in PROFILE_BUCKETS if key in groups.get(item, [])), "")
            rows.append({
                "key": key,
                "name": name,
                "game": self._profile_game,
                "role": role,
                "roleName": str(hero.get("roleName", role)),
                "subrole": str(hero.get("subrole", "")),
                "portrait": str(hero.get("portrait", "")),
                "bucket": bucket,
                "baseKey": str(hero.get("baseKey", "")),
                "baseName": str(hero.get("baseName", "")),
                "owned": not collection_configured or key in collection,
                "favorite": key in favorites,
                "blocked": key in blocked,
            })
        return rows

    def _refresh_profile_hero_model(self) -> None:
        self._profile_hero_model.replace(self._build_profile_hero_rows())

    @Slot(str, str)
    def setHeroBucket(self, hero_key: str, bucket: str) -> None:
        profile = self.profiles.get(self._current_profile_id)
        if not profile or bucket not in (*PROFILE_BUCKETS, ""):
            return
        if self._profile_game == "pvzgw2":
            return
        groups = (
            profile["heroes"]
            if self._profile_game == "overwatch"
            else profile["games"][self._profile_game]["heroes"]
        )
        for name in PROFILE_BUCKETS:
            values = groups.setdefault(name, [])
            if hero_key in values:
                values.remove(hero_key)
        if bucket:
            groups[bucket].append(hero_key)
            groups[bucket].sort()
        row_index = self._profile_hero_model.index_of(hero_key)
        row = self._profile_hero_model.item(row_index)
        if row is not None:
            updated = dict(row)
            updated["bucket"] = bucket
            self._profile_hero_model.update_row(row_index, updated)
        self._schedule_profiles_save()
        self.audio.play("toggle_on" if bucket else "toggle_off")
        self.profileEditorChanged.emit()

    @Slot(str, str)
    def toggleProfileItemFlag(self, hero_key: str, flag: str) -> None:
        profile = self.profiles.get(self._current_profile_id)
        if not profile or self._profile_game != "pvzgw2" or flag not in {"owned", "favorite", "blocked"}:
            return
        data = profile["games"]["pvzgw2"]
        key = "collection" if flag == "owned" else "favorites" if flag == "favorite" else "blocked"
        values = set(data.get(key, []))
        if flag == "owned" and not data.get("collection_configured", False):
            values = {
                str(row.get("key"))
                for row in self._build_profile_hero_rows()
                if row.get("key")
            }
            data["collection_configured"] = True
        if hero_key in values:
            values.remove(hero_key)
        else:
            values.add(hero_key)
        data[key] = sorted(values)
        self._schedule_profiles_save()
        self._refresh_profile_hero_model()
        self.audio.play("toggle_on" if hero_key in values else "toggle_off")
        self.profileEditorChanged.emit()

    @Slot()
    def clearProfileCategories(self) -> None:
        profile = self.profiles.get(self._current_profile_id)
        if profile:
            if self._profile_game == "overwatch":
                profile["heroes"] = {bucket: [] for bucket in PROFILE_BUCKETS}
            elif self._profile_game == "pvzgw2":
                profile["games"]["pvzgw2"] = {
                    "collection": [],
                    "collection_configured": False,
                    "favorites": [],
                    "blocked": [],
                }
            else:
                profile["games"][self._profile_game]["heroes"] = {
                    bucket: [] for bucket in PROFILE_BUCKETS
                }
            self._schedule_profiles_save()
            self._refresh_profile_hero_model()
            self.profileEditorChanged.emit()

    @Slot(str, str, result="QVariantMap")
    def module_profile_rules(self, profile_id: str, game_id: str) -> dict[str, Any]:
        profile = self.profiles.get(profile_id)
        if not profile:
            return {}
        games = profile.get("games", {})
        if game_id in {
            "rivals", "valorant", "lastflag", "deadlock", "thefinals",
            "paladins", "fragpunk", "apex",
        }:
            data = dict(games.get(game_id, {}))
            data["mode"] = self.profile_mode
            return data
        if game_id == "pvzgw2":
            return dict(games.get("pvzgw2", {}))
        if game_id == "tf2":
            return dict(games.get("tf2", {}))
        return {"heroes": profile.get("heroes", {}), "mode": self.profile_mode}

    @Slot(str)
    def importProfiles(self, url: str) -> None:
        path = Path(QUrl(url).toLocalFile())
        try:
            if not path.is_file() or path.stat().st_size > 5_000_000:
                return
        except OSError:
            return
        payload = self._load_json(path, {})
        imported = 0
        rows = payload.get("profiles", []) if isinstance(payload, dict) else []
        for raw in rows[:100] if isinstance(rows, list) else []:
            if not isinstance(raw, dict):
                continue
            raw_id = str(raw.get("id") or f"profile_{int(time.time() * 1000)}_{imported}")[:80]
            profile_id = re.sub(r"[^A-Za-z0-9_.-]", "_", raw_id) or f"profile_{int(time.time() * 1000)}_{imported}"
            while profile_id in self.profiles:
                profile_id = f"{profile_id}_{imported + 1}"
            games = raw.get("games") if isinstance(raw.get("games"), dict) else {}
            ow_data = games.get("overwatch") if isinstance(games.get("overwatch"), dict) else {}
            groups = raw.get("heroes") if isinstance(raw.get("heroes"), dict) else ow_data.get("heroes", {})
            self.profiles[profile_id] = {
                "id": profile_id,
                "name": str(raw.get("name") or self._text("new_profile"))[:64],
                "heroes": {
                    bucket: sorted({str(k)[:100] for k in groups.get(bucket, [])})[:256]
                    for bucket in PROFILE_BUCKETS
                },
                "games": self._normalize_profile_games(games),
            }
            imported += 1
        if imported:
            self._current_profile_id = next(reversed(self.profiles))
            self._save_profiles()
            self._refresh_profile_hero_model()
            self.profilesChanged.emit()
            self.profileEditorChanged.emit()

    @Slot(str)
    def exportProfiles(self, url: str) -> None:
        path = Path(QUrl(url).toLocalFile())
        if path.suffix.lower() != ".json":
            path = path.with_suffix(".json")
        payload = {"mode": self.profile_mode, "profiles": list(self.profiles.values()), "player_profiles": [p.get("profileId", "") for p in self.players]}
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    @Property(bool, notify=settingsChanged)
    def soundEnabled(self) -> bool:
        return self.settings["sounds"]

    @Property(bool, notify=settingsChanged)
    def heroVoices(self) -> bool:
        return self.settings["hero_voices"]

    @Property(int, notify=settingsChanged)
    def volume(self) -> int:
        return self.settings["volume"]

    @Property(bool, notify=settingsChanged)
    def animationsEnabled(self) -> bool:
        return self.settings["animations"]

    @Property(bool, notify=settingsChanged)
    def compactCards(self) -> bool:
        return self.settings["compact_cards"]

    @Property(bool, notify=settingsChanged)
    def hoverSounds(self) -> bool:
        return self.settings["hover_sounds"]

    @Property(bool, notify=settingsChanged)
    def statsSounds(self) -> bool:
        return self.settings["stats_sounds"]

    @Property(bool, notify=settingsChanged)
    def secretDps78Unlocked(self) -> bool:
        return self.settings["secret_dps78_unlocked"]

    @Property(bool, notify=settingsChanged)
    def secretDps78Enabled(self) -> bool:
        return self.settings["secret_dps78_enabled"]

    @Property(bool, notify=settingsChanged)
    def secretFroggerUnlocked(self) -> bool:
        return self.settings["secret_frogger_unlocked"]

    @Property(bool, notify=settingsChanged)
    def secretFroggerEnabled(self) -> bool:
        return self.settings["secret_frogger_enabled"]

    @Property(bool, notify=settingsChanged)
    def secretsUnlocked(self) -> bool:
        return bool(
            self.settings["secret_dps78_unlocked"]
            or self.settings["secret_frogger_unlocked"]
        )

    @Property(str, notify=settingsChanged)
    def performanceMode(self) -> str:
        return self.settings["performance_mode"]

    @Property(int, notify=settingsChanged)
    def sidebarWidth(self) -> int:
        return self.settings["sidebar_width"]

    @Property(bool, notify=settingsChanged)
    def overlayEnabled(self) -> bool:
        return self.settings["overlay_enabled"]

    @Property(int, notify=settingsChanged)
    def overlayCardSize(self) -> int:
        return self.settings["overlay_card_size"]

    @Property(str, notify=settingsChanged)
    def overlayOrientation(self) -> str:
        return self.settings["overlay_orientation"]

    @Property(int, notify=settingsChanged)
    def overlayOpacity(self) -> int:
        return self.settings["overlay_opacity"]

    @Property(int, notify=settingsChanged)
    def overlaySpacing(self) -> int:
        return self.settings["overlay_spacing"]

    @Property(int, notify=settingsChanged)
    def overlayColumns(self) -> int:
        return self.settings["overlay_columns"]

    @Property(bool, notify=settingsChanged)
    def overlayShowNames(self) -> bool:
        return self.settings["overlay_show_names"]

    @Property(bool, notify=settingsChanged)
    def overlayShowDetails(self) -> bool:
        return self.settings["overlay_show_details"]

    @Property(str, notify=settingsChanged)
    def twitchChannel(self) -> str:
        return self.settings["twitch_channel"]

    @Property(str, notify=settingsChanged)
    def twitchCommand(self) -> str:
        return self.settings["twitch_command"]

    @Slot(str, bool)
    def setBoolSetting(self, key: str, value: bool) -> None:
        mapping = {
            "sounds": "sounds",
            "voices": "hero_voices",
            "animations": "animations",
            "compact": "compact_cards",
            "hover": "hover_sounds",
            "stats": "stats_sounds",
            "overlay": "overlay_enabled",
            "overlay_names": "overlay_show_names",
            "overlay_details": "overlay_show_details",
        }
        setting = mapping.get(key)
        if not setting:
            return
        self.settings[setting] = bool(value)
        self.audio.configure(self.settings["sounds"], self.settings["volume"])
        self._save_settings()
        self.settingsChanged.emit()

    def _refresh_secret_portraits(self) -> None:
        if self.current_picks:
            self._pick_model.replace([
                self._pick_view(pick, index)
                for index, pick in enumerate(self.current_picks)
            ])
            self.resultChanged.emit()
        self._refresh_profile_hero_model()
        self.profileEditorChanged.emit()

    @Slot(bool)
    def setSecretDps78Enabled(self, enabled: bool) -> None:
        if not self.settings.get("secret_dps78_unlocked", False):
            return
        enabled = bool(enabled)
        if enabled == self.settings.get("secret_dps78_enabled", False):
            return
        self.settings["secret_dps78_enabled"] = enabled
        self._save_settings()
        self._refresh_secret_portraits()
        self.settingsChanged.emit()

    @Slot(bool)
    def setSecretFroggerEnabled(self, enabled: bool) -> None:
        if not self.settings.get("secret_frogger_unlocked", False):
            return
        enabled = bool(enabled)
        if enabled == self.settings.get("secret_frogger_enabled", False):
            return
        self.settings["secret_frogger_enabled"] = enabled
        self._save_settings()
        self._refresh_secret_portraits()
        self.settingsChanged.emit()

    @Slot(str, result=str)
    def secretNotificationIcon(self, code: str) -> str:
        relative = (
            "data/assets/secrets/notifications/frogger.jpg"
            if str(code).upper() == "FROGGER"
            else "data/assets/secrets/notifications/dps78.png"
        )
        return self.assetUrl(relative)

    @Slot(str)
    def acceptSecretCharacter(self, character: str) -> None:
        cleaned = "".join(item for item in str(character).upper() if item.isalnum())
        if not cleaned:
            return
        self._secret_buffer = (self._secret_buffer + cleaned)[-16:]
        code = next(
            (candidate for candidate in ("DPS78", "FROGGER") if self._secret_buffer.endswith(candidate)),
            "",
        )
        if not code:
            return
        self._secret_buffer = ""
        prefix = "secret_dps78" if code == "DPS78" else "secret_frogger"
        unlocked_key = f"{prefix}_unlocked"
        enabled_key = f"{prefix}_enabled"
        was_unlocked = self.settings.get(unlocked_key, False)
        was_enabled = self.settings.get(enabled_key, False)
        self.settings[unlocked_key] = True
        self.settings[enabled_key] = True
        if not was_unlocked or not was_enabled:
            self._save_settings()
            self._refresh_secret_portraits()
        self.settingsChanged.emit()
        self.audio.play("secret")
        self.secretRevealed.emit(code)

    @Slot(str, str)
    def setTextSetting(self, key: str, value: str) -> None:
        mapping = {
            "twitch_channel": "twitch_channel",
            "twitch_command": "twitch_command",
            "overlay_orientation": "overlay_orientation",
            "performance_mode": "performance_mode",
        }
        setting = mapping.get(key)
        if not setting:
            return
        cleaned = str(value).strip()
        if setting == "twitch_channel":
            cleaned = cleaned.lstrip("#").lower()
        elif setting == "twitch_command":
            cleaned = cleaned if cleaned.startswith("!") else "!" + cleaned
        elif setting == "overlay_orientation":
            cleaned = cleaned if cleaned in {"horizontal", "vertical"} else "horizontal"
        elif setting == "performance_mode":
            cleaned = cleaned if cleaned in {"low", "medium", "high"} else "medium"
        if self.settings.get(setting) == cleaned:
            return
        self.settings[setting] = cleaned
        self._save_settings()
        self.settingsChanged.emit()
        if setting == "performance_mode":
            self.memoryTrimRequested.emit()

    @Slot(int)
    def setOverlayCardSize(self, value: int) -> None:
        value = max(60, min(300, int(value)))
        if value == self.settings["overlay_card_size"]:
            return
        self.settings["overlay_card_size"] = value
        self._save_settings()
        self.settingsChanged.emit()

    @Slot(int)
    def setSidebarWidth(self, value: int) -> None:
        value = max(326, min(460, int(value)))
        if value == self.settings["sidebar_width"]:
            return
        self.settings["sidebar_width"] = value
        self._save_settings()
        self.settingsChanged.emit()

    @Slot()
    def resetOverlayLayout(self) -> None:
        defaults = {
            "overlay_card_size": 160,
            "overlay_orientation": "horizontal",
            "overlay_opacity": 95,
            "overlay_spacing": 8,
            "overlay_columns": 0,
            "overlay_show_names": True,
            "overlay_show_details": True,
        }
        if all(self.settings.get(key) == value for key, value in defaults.items()):
            return
        self.settings.update(defaults)
        self._save_settings()
        self.settingsChanged.emit()

    @Slot(str, int)
    def setOverlayNumber(self, key: str, value: int) -> None:
        ranges = {
            "overlay_opacity": (40, 100),
            "overlay_spacing": (0, 24),
            "overlay_columns": (0, 8),
        }
        if key not in ranges:
            return
        low, high = ranges[key]
        value = max(low, min(high, int(value)))
        if self.settings.get(key) == value:
            return
        self.settings[key] = value
        self._save_settings()
        self.settingsChanged.emit()

    @Slot(int)
    def setVolume(self, value: int) -> None:
        value = max(0, min(100, value))
        if value == self.settings["volume"]:
            return
        self.settings["volume"] = value
        self.audio.configure(self.settings["sounds"], value)
        self._save_settings()
        self.settingsChanged.emit()

    @Slot(str)
    def setLocale(self, locale: str) -> None:
        if locale not in TEXT or locale == self.settings["locale"]:
            return
        self.settings["locale"] = locale
        self._save_settings()
        self._load_snapshot()
        self._refresh_profile_hero_model()
        self.localeChanged.emit()
        self.settingsChanged.emit()
        self.profilesChanged.emit()
        self.profileEditorChanged.emit()
        if self.current_picks:
            self._pick_model.replace([self._pick_view(pick, index) for index, pick in enumerate(self.current_picks)])
        else:
            self._set_ready_result()
        self.resultChanged.emit()
        self.stateChanged.emit()

    @Property("QVariantList", constant=True)
    def localeChoices(self) -> list[dict[str, str]]:
        return [
            {"id": "es-mx", "name": "Español (Latinoamérica)"},
            {"id": "es-es", "name": "Español (España)"},
            {"id": "en-us", "name": "English (US)"},
        ]

    @Property(str, notify=localeChanged)
    def snapshotLabel(self) -> str:
        date = str(self.snapshot.get("fetched_at") or "")[:10]
        return self._text("snapshot").format(date=date) if date else self._text("snapshot_unknown")

    @Property("QVariantList", notify=settingsChanged)
    def localHeroRows(self) -> list[dict[str, Any]]:
        return [{
            "key": hero["key"],
            "name": self._localized(hero, "name"),
            "role": self._text(hero["role"]),
            "subrole": str(hero.get("subrole") or "").replace("-", " ").title(),
            "portrait": self._secret_portrait(
                str(hero.get("key") or ""),
                self._url(str(hero.get("portrait_path") or "")),
            ),
            "stadium": bool(hero.get("stadium_powers")),
        } for hero in self.heroes]

    @Property(bool, notify=apiChanged)
    def apiRunning(self) -> bool:
        return self._api_running

    @Property(float, notify=apiChanged)
    def apiProgress(self) -> float:
        return self._api_progress

    @Property(bool, notify=apiChanged)
    def apiCancelling(self) -> bool:
        return self._api_cancel_requested

    @Property(str, notify=apiChanged)
    def apiStatus(self) -> str:
        return self._api_status or self._text("api_idle")

    @Slot()
    def updateFromApi(self) -> None:
        if self._api_running:
            return
        self.audio.play("api")
        self._api_running = True
        self._api_progress = 0.02
        self._api_status = self._text("api_running")
        self._api_cancel_requested = False
        self._api_output_buffer = ""
        self.apiChanged.emit()

        process = QProcess(self)
        process.setProcessChannelMode(QProcess.MergedChannels)
        environment = QProcessEnvironment.systemEnvironment()
        environment.insert("PYTHONUNBUFFERED", "1")
        process.setProcessEnvironment(environment)
        process.readyReadStandardOutput.connect(self._read_api_output)
        process.finished.connect(self._api_process_finished)
        process.errorOccurred.connect(self._api_process_error)
        self._api_process = process

        executable_name = Path(sys.executable).name.lower()
        packaged = executable_name not in {"python.exe", "pythonw.exe", "python3.exe", "py.exe"}
        if packaged:
            process.start(sys.executable, ["--update-api-worker", str(self.user_root)])
        else:
            process.start(sys.executable, [str(self.project_dir / "main.py"), "--update-api-worker", str(self.user_root)])

    @Slot()
    def cancelApiUpdate(self) -> None:
        process = self._api_process
        if not self._api_running or process is None:
            return
        self._api_cancel_requested = True
        self._api_status = self._text("api_cancelling")
        self.apiChanged.emit()
        process.terminate()
        QTimer.singleShot(300, self._kill_api_process_if_running)

    def _kill_api_process_if_running(self) -> None:
        if self._api_process is not None and self._api_process.state() != QProcess.NotRunning:
            self._api_process.kill()

    def _api_process_error(self, _error: QProcess.ProcessError) -> None:
        if _error != QProcess.ProcessError.FailedToStart:
            return
        process = self._api_process
        if process is None or process.state() != QProcess.NotRunning:
            return
        self._api_process = None
        process.deleteLater()
        self._api_running = False
        self._api_progress = 0.0
        self._api_status = self._text("api_cancelled" if self._api_cancel_requested else "api_failed")
        self._api_cancel_requested = False
        self.apiChanged.emit()

    def _read_api_output(self) -> None:
        if self._api_process is None:
            return
        self._api_output_buffer += bytes(self._api_process.readAllStandardOutput()).decode("utf-8", errors="replace")
        while "\n" in self._api_output_buffer:
            line, self._api_output_buffer = self._api_output_buffer.split("\n", 1)
            self._on_api_line(line.strip())

    @Slot(int, QProcess.ExitStatus)
    def _api_process_finished(self, exit_code: int, exit_status: QProcess.ExitStatus) -> None:
        if self._api_output_buffer.strip():
            self._on_api_line(self._api_output_buffer.strip())
        self._api_output_buffer = ""
        process = self._api_process
        self._api_process = None
        if process is not None:
            process.deleteLater()
        if self._api_cancel_requested:
            self._api_running = False
            self._api_progress = 0.0
            self._api_status = self._text("api_cancelled")
            self._api_cancel_requested = False
            self.apiChanged.emit()
            return
        self._on_api_finished(exit_code == 0 and exit_status == QProcess.NormalExit)

    @Slot(str)
    def _on_api_line(self, line: str) -> None:
        if not line:
            return
        match = re.search(r"\[(\d+)/(\d+)\]", line)
        if match:
            current, total = int(match.group(1)), max(1, int(match.group(2)))
            self._api_progress = current / total
        self._api_status = line
        self.apiChanged.emit()

    @Slot(bool)
    def _on_api_finished(self, success: bool) -> None:
        self._api_running = False
        self._api_progress = 1.0 if success else 0.0
        self._api_status = self._text("api_done" if success else "api_failed")
        if success:
            self._url_cache.clear()
            self._load_snapshot()
            self.localeChanged.emit()
            self.profileEditorChanged.emit()
        self.apiChanged.emit()
