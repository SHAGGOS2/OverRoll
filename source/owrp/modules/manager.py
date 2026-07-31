"""Registry, lifecycle, and persistence for game modules."""

from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any

from PySide6.QtCore import QObject, Property, Signal, Slot

from ..models import DictListModel
from .overwatch import OverwatchModule
from .pvzgw2 import PvzGw2Module
from .rivals import RivalsModule
from .roster import (
    ApexModule,
    DeadlockModule,
    FragPunkModule,
    LastFlagModule,
    PaladinsModule,
    RosterModule,
    ValorantModule,
)
from .tf2 import Tf2Module
from .thefinals import TheFinalsModule


PLANNED_GAMES: tuple[tuple[str, str, str, str], ...] = ()

PLANNED_SOURCES = {
    "paladins": {
        "description": (
            "API oficial documentada por Hi-Rez. La integracion requerira un Developer ID, "
            "una Authentication Key y sesiones temporales; no se guardaran credenciales en el catalogo."
        ),
        "source": "Hi-Rez Studios API · credenciales requeridas",
    },
    "fragpunk": {
        "description": (
            "No hay una API publica documentada por el estudio. El modulo queda preparado "
            "para un snapshot local verificable cuando exista una fuente estable."
        ),
        "source": "Snapshot local pendiente · sin API publica documentada",
    },
    "apex": {
        "description": (
            "Existe una API comunitaria no oficial con clave obligatoria. Antes de activarla "
            "se necesitara consentimiento, cache local y atribucion visible de la fuente."
        ),
        "source": "Apex Legends Status API · comunitaria · requiere clave",
    },
    "valorant": {
        "description": "Agentes y roles investigados; falta integrar el selector local.",
        "source": "Riot VAL-CONTENT-V1 + Valorant-API",
    },
    "lastflag": {
        "description": "Reparto y retratos guardados desde la pagina oficial de concursantes.",
        "source": "Last Flag · sitio oficial",
    },
    "thefinals": {
        "description": "Builds investigadas; la API publica encontrada solo cubre leaderboards.",
        "source": "Embark + THE FINALS Wiki + leaderboard API",
    },
}

GAME_DESCRIPTIONS = {
    "overwatch": {
        "es-mx": "Selector completo con roles, perks, perfiles, Stadium y ruleta.",
        "es-es": "Selector completo con roles, ventajas, perfiles, Stadium y ruleta.",
        "en-us": "Complete selector with roles, perks, profiles, Stadium, and roulette.",
        "pt-br": "Seletor completo com funções, vantagens, perfis, Stadium e roleta.",
        "fr-fr": "Sélecteur complet avec rôles, perks, profils, Stadium et roulette.",
        "de-de": "Vollständige Auswahl mit Rollen, Perks, Profilen, Stadium und Roulette.",
        "ja-jp": "ロール、パーク、プロフィール、Stadium、ルーレット対応の完全なセレクター。",
        "ko-kr": "역할, 특전, 프로필, 스타디움 및 룰렛을 지원하는 전체 선택기.",
    },
    "tf2": {
        "es-mx": "Escuadras de hasta seis jugadores con las nueve clases oficiales.",
        "es-es": "Escuadras de hasta seis jugadores con las nueve clases oficiales.",
        "en-us": "Squads of up to six players using the nine official classes.",
        "pt-br": "Equipes de até seis jogadores com as nove classes oficiais.",
        "fr-fr": "Escouades de six joueurs maximum avec les neuf classes officielles.",
        "de-de": "Teams mit bis zu sechs Spielern und den neun offiziellen Klassen.",
        "ja-jp": "公式9クラスを使用する最大6人のチーム。",
        "ko-kr": "공식 9개 클래스로 구성된 최대 6인 분대.",
    },
    "pvzgw2": {
        "es-mx": "Equipos de Plantas o Zombis con personajes base, variantes y contenido DLC.",
        "es-es": "Equipos de Plantas o Zombis con personajes base, variantes y contenido DLC.",
        "en-us": "Plant or Zombie teams with base characters, variants, and DLC content.",
        "pt-br": "Equipes de Plantas ou Zumbis com personagens base, variantes e conteúdo DLC.",
        "fr-fr": "Équipes Plantes ou Zombies avec personnages de base, variantes et contenu DLC.",
        "de-de": "Pflanzen- oder Zombie-Teams mit Basisfiguren, Varianten und DLC-Inhalten.",
        "ja-jp": "基本キャラクター、バリエーション、DLCを含むプラントまたはゾンビのチーム。",
        "ko-kr": "기본 캐릭터, 변형 및 DLC를 포함한 식물 또는 좀비 팀.",
    },
    "rivals": {
        "es-mx": "Equipos de hasta seis jugadores con roles, perfiles y Team-Ups.",
        "es-es": "Equipos de hasta seis jugadores con roles, perfiles y Team-Ups.",
        "en-us": "Teams of up to six players with roles, profiles, and Team-Ups.",
        "pt-br": "Equipes de até seis jogadores com funções, perfis e Team-Ups.",
        "fr-fr": "Équipes de six joueurs maximum avec rôles, profils et Team-Ups.",
        "de-de": "Teams mit bis zu sechs Spielern, Rollen, Profilen und Team-Ups.",
        "ja-jp": "ロール、プロフィール、Team-Up対応の最大6人チーム。",
        "ko-kr": "역할, 프로필 및 팀업을 지원하는 최대 6인 팀.",
    },
    "valorant": {
        "es-mx": "Escuadras de agentes con roles, perfiles, filtros y ruleta sin conexión.",
        "es-es": "Escuadras de agentes con roles, perfiles, filtros y ruleta sin conexión.",
        "en-us": "Agent squads with roles, profiles, filters, and an offline roulette.",
        "pt-br": "Esquadrões de agentes com funções, perfis, filtros e roleta offline.",
        "fr-fr": "Escouades d'agents avec rôles, profils, filtres et roulette hors ligne.",
        "de-de": "Agenten-Teams mit Rollen, Profilen, Filtern und Offline-Roulette.",
        "ja-jp": "ロール、プロフィール、フィルター、オフラインルーレット対応のエージェント部隊。",
        "ko-kr": "역할, 프로필, 필터 및 오프라인 룰렛을 지원하는 요원 분대.",
    },
    "lastflag": {
        "es-mx": "Selector 5v5 del reparto publicado, con perfiles y ruleta sin conexión.",
        "es-es": "Selector 5v5 del reparto publicado, con perfiles y ruleta sin conexión.",
        "en-us": "A 5v5 selector for the published cast, with profiles and offline roulette.",
        "pt-br": "Seletor 5v5 do elenco publicado, com perfis e roleta offline.",
        "fr-fr": "Sélecteur 5v5 du casting publié, avec profils et roulette hors ligne.",
        "de-de": "5v5-Auswahl der veröffentlichten Besetzung mit Profilen und Offline-Roulette.",
        "ja-jp": "公開キャスト向けの5v5セレクター。プロフィールとオフラインルーレットに対応。",
        "ko-kr": "공개 출연진용 5대5 선택기. 프로필과 오프라인 룰렛 지원.",
    },
    "deadlock": {
        "es-mx": "Seis jugadores; cada ficha propone tres héroes con prioridad.",
        "es-es": "Seis jugadores; cada ficha propone tres héroes con prioridad.",
        "en-us": "Six players; each card proposes three heroes in priority order.",
        "pt-br": "Seis jogadores; cada ficha sugere três heróis por prioridade.",
        "fr-fr": "Six joueurs ; chaque carte propose trois héros par priorité.",
        "de-de": "Sechs Spieler; jede Karte schlägt drei Helden nach Priorität vor.",
        "ja-jp": "6人用。各カードに優先順で3人のヒーロー候補を表示。",
        "ko-kr": "6인용. 각 카드에 우선순위에 따라 영웅 3명을 제안합니다.",
    },
    "thefinals": {
        "es-mx": "Crea concursantes por tamaño, arma, especialización y tres artefactos.",
        "es-es": "Crea concursantes por tamaño, arma, especialización y tres dispositivos.",
        "en-us": "Build contestants by size, weapon, specialization, and three gadgets.",
        "pt-br": "Monte competidores por tamanho, arma, especialização e três dispositivos.",
        "fr-fr": "Créez des candidats par gabarit, arme, spécialisation et trois gadgets.",
        "de-de": "Erstelle Kandidaten nach Größe, Waffe, Spezialisierung und drei Gadgets.",
        "ja-jp": "体格、武器、専門スキル、3つのガジェットで競技者を構成。",
        "ko-kr": "체형, 무기, 전문화, 장비 3개로 참가자를 구성합니다.",
    },
    "paladins": {
        "es-mx": "Equipos de campeones con roles, perfiles, filtros y ruleta sin conexión.",
        "es-es": "Equipos de campeones con roles, perfiles, filtros y ruleta sin conexión.",
        "en-us": "Champion teams with roles, profiles, filters, and an offline roulette.",
        "pt-br": "Equipes de campeões com funções, perfis, filtros e roleta offline.",
        "fr-fr": "Équipes de champions avec rôles, profils, filtres et roulette hors ligne.",
        "de-de": "Champion-Teams mit Rollen, Profilen, Filtern und Offline-Roulette.",
        "ja-jp": "ロール、プロフィール、フィルター、オフラインルーレット対応のチャンピオンチーム。",
        "ko-kr": "역할, 프로필, 필터 및 오프라인 룰렛을 지원하는 챔피언 팀.",
    },
    "fragpunk": {
        "es-mx": "Escuadras de Lancers con perfiles, filtros y ruleta sin conexión.",
        "es-es": "Escuadras de Lancers con perfiles, filtros y ruleta sin conexión.",
        "en-us": "Lancer squads with profiles, filters, and an offline roulette.",
        "pt-br": "Esquadrões de Lancers com perfis, filtros e roleta offline.",
        "fr-fr": "Escouades de Lancers avec profils, filtres et roulette hors ligne.",
        "de-de": "Lancer-Trupps mit Profilen, Filtern und Offline-Roulette.",
        "ja-jp": "プロフィール、フィルター、オフラインルーレット対応のランサー部隊。",
        "ko-kr": "프로필, 필터 및 오프라인 룰렛을 지원하는 랜서 분대.",
    },
    "apex": {
        "es-mx": "Escuadras de leyendas con clases, perfiles, filtros y ruleta sin conexión.",
        "es-es": "Escuadras de leyendas con clases, perfiles, filtros y ruleta sin conexión.",
        "en-us": "Legend squads with classes, profiles, filters, and an offline roulette.",
        "pt-br": "Esquadrões de lendas com classes, perfis, filtros e roleta offline.",
        "fr-fr": "Escouades de légendes avec classes, profils, filtres et roulette hors ligne.",
        "de-de": "Legenden-Trupps mit Klassen, Profilen, Filtern und Offline-Roulette.",
        "ja-jp": "クラス、プロフィール、フィルター、オフラインルーレット対応のレジェンド部隊。",
        "ko-kr": "클래스, 프로필, 필터 및 오프라인 룰렛을 지원하는 레전드 분대.",
    },
}


class ModuleManager(QObject):
    changed = Signal()

    def __init__(self, project_dir: Path, data_dir: Path, parent: QObject | None = None) -> None:
        super().__init__(parent)
        self.project_dir = project_dir
        self.data_dir = data_dir
        self.controller: Any = None
        self.display_locale = "es-mx"
        self.state_path = data_dir / "game_state.json"
        payload = self._read()
        game_state = payload.get("games", {}) if isinstance(payload.get("games"), dict) else {}
        self.modules = {
            "overwatch": OverwatchModule(game_state.get("overwatch")),
            "tf2": Tf2Module(
                (project_dir / "data/assets/games/tf2").as_uri(),
                game_state.get("tf2"),
            ),
            "pvzgw2": PvzGw2Module(
                project_dir / "data/assets/other_hs/pvzgw2",
                game_state.get("pvzgw2"),
            ),
            "rivals": RivalsModule(
                project_dir / "data/assets/games/rivals",
                game_state.get("rivals"),
            ),
            "valorant": ValorantModule(
                project_dir / "data/assets/games/valorant",
                game_state.get("valorant"),
            ),
            "lastflag": LastFlagModule(
                project_dir / "data/assets/games/lastflag",
                game_state.get("lastflag"),
            ),
            "deadlock": DeadlockModule(
                project_dir / "data/assets/games/deadlock",
                game_state.get("deadlock"),
            ),
            "thefinals": TheFinalsModule(
                project_dir / "data/assets/games/thefinals",
                game_state.get("thefinals"),
            ),
            "paladins": PaladinsModule(
                project_dir / "data/assets/games/paladins",
                game_state.get("paladins"),
            ),
            "fragpunk": FragPunkModule(
                project_dir / "data/assets/games/fragpunk",
                game_state.get("fragpunk"),
            ),
            "apex": ApexModule(
                project_dir / "data/assets/games/apex",
                game_state.get("apex"),
            ),
        }
        requested = str(payload.get("active_game", "overwatch"))
        self.active_id = requested if requested in self.modules else "overwatch"
        self._slot_model = DictListModel(("modelData",), "id", self)
        self._refresh_slot_model()

    def _refresh_slot_model(self) -> None:
        self._slot_model.replace([
            {"id": str(slot.get("id", index)), "modelData": dict(slot)}
            for index, slot in enumerate(self.modules[self.active_id].state.get("slots", []))
        ])

    def _notify_changed(self) -> None:
        self._refresh_slot_model()
        self.changed.emit()

    def attach_controller(self, controller: Any) -> None:
        self.controller = controller
        self.display_locale = str(getattr(controller, "locale", "es-mx") or "es-mx")
        self.controller.localeChanged.connect(self.changed.emit)
        self.controller.setProfileGame(self.active_id)
        self._sync_profiles()
        self._refresh_slot_model()

    def _sync_profiles(self) -> None:
        if self.controller is None or self.active_id == "overwatch":
            return
        module = self.modules[self.active_id]
        rules: dict[str, dict[str, Any]] = {}
        profile_names = {
            str(row.get("id", "")): str(row.get("name", ""))
            for row in self.controller.profileChoices
            if str(row.get("id", ""))
        }
        players = getattr(self.controller, "players", [])
        for index, slot in enumerate(module.state.get("slots", [])):
            slot["slotIndex"] = index
            if index < len(players):
                player = players[index]
                slot["name"] = str(player.get("name") or f"Jugador {index + 1}")
                slot["profileId"] = str(player.get("profileId", ""))
            profile_id = str(slot.get("profileId", ""))
            slot["profileName"] = profile_names.get(profile_id, "") if profile_id else ""
            if profile_id:
                rules[profile_id] = self.controller.module_profile_rules(
                    profile_id,
                    self.active_id,
                )
        module.profile_rules = rules

    def _read(self) -> dict[str, Any]:
        try:
            return json.loads(self.state_path.read_text(encoding="utf-8")) if self.state_path.exists() else {}
        except (OSError, json.JSONDecodeError):
            return {}

    def save(self) -> None:
        payload = {
            "schema_version": 2,
            "active_game": self.active_id,
            "games": {key: module.serialize() for key, module in self.modules.items()},
        }
        self.state_path.parent.mkdir(parents=True, exist_ok=True)
        temporary = self.state_path.with_suffix(".json.tmp")
        temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        temporary.replace(self.state_path)

    @Property(str, notify=changed)
    def activeGame(self) -> str:
        return self.active_id

    @Property(str, notify=changed)
    def activeView(self) -> str:
        return self.modules[self.active_id].metadata.view

    @Property("QVariantMap", notify=changed)
    def activeMetadata(self) -> dict[str, Any]:
        return self._localized_descriptor(self.modules[self.active_id])

    @Property("QVariantList", notify=changed)
    def games(self) -> list[dict[str, Any]]:
        rows = [self._localized_descriptor(module) for module in self.modules.values()]
        rows.extend({
            "game_id": key,
            "name": name,
            "short_name": name,
            "accent": accent,
            "status": status,
            "description": PLANNED_SOURCES.get(key, {}).get(
                "description",
                "Módulo visible, todavía no disponible en esta versión.",
            ),
            "source": PLANNED_SOURCES.get(key, {}).get("source", "Pendiente"),
            "view": "",
            "available": False,
            "experimental": status == "experimental",
        } for key, name, accent, status in PLANNED_GAMES)
        return rows

    @Property("QVariantList", notify=changed)
    def activeCatalog(self) -> list[dict[str, Any]]:
        return self.modules[self.active_id].catalog()

    @Property("QVariantList", notify=changed)
    def activeRoles(self) -> list[dict[str, str]]:
        module = self.modules[self.active_id]
        roles = tuple(getattr(module, "roles", ()))
        labels = (
            module.localized_role_labels(self._locale())
            if isinstance(module, RosterModule)
            else getattr(module, "role_labels", {})
        )
        colors = getattr(module, "role_colors", {})
        return [
            {
                "id": role,
                "name": str(labels.get(role, role.replace("-", " ").title())),
                "color": str(colors.get(role, module.metadata.accent)),
            }
            for role in roles
        ]

    def _locale(self) -> str:
        return self.display_locale

    @Slot(str)
    def setDisplayLocale(self, locale: str) -> None:
        normalized = str(locale or "es-mx").lower()
        if normalized == self.display_locale:
            return
        self.display_locale = normalized
        self.changed.emit()

    def _localized_descriptor(self, module: Any) -> dict[str, Any]:
        row = module.descriptor()
        descriptions = GAME_DESCRIPTIONS.get(str(row.get("game_id", "")), {})
        if descriptions:
            row["description"] = descriptions.get(
                self._locale(),
                descriptions.get("en-us", row.get("description", "")),
            )
        return row

    @Property("QVariantList", notify=changed)
    def activeSlots(self) -> list[dict[str, Any]]:
        return self.modules[self.active_id].state.get("slots", [])

    @Property(QObject, constant=True)
    def activeSlotModel(self) -> QObject:
        return self._slot_model

    @Property(int, notify=changed)
    def activeMaxPlayers(self) -> int:
        return int(getattr(self.modules[self.active_id], "max_players", 8))

    @Property("QVariantList", notify=changed)
    def plantSlots(self) -> list[dict[str, Any]]:
        return [slot for slot in self.activeSlots if slot.get("side") == "plants"]

    @Property("QVariantList", notify=changed)
    def zombieSlots(self) -> list[dict[str, Any]]:
        return [slot for slot in self.activeSlots if slot.get("side") == "zombies"]

    @Property(bool, notify=changed)
    def allowDuplicates(self) -> bool:
        return bool(self.modules[self.active_id].state.get("allow_duplicates", False))

    @Property(bool, notify=changed)
    def sideSwitchEnabled(self) -> bool:
        return bool(self.modules[self.active_id].state.get("allow_side_switch", True))

    @Property(bool, notify=changed)
    def useVariants(self) -> bool:
        return bool(self.modules[self.active_id].state.get("use_variants", True))

    @Property(bool, notify=changed)
    def includeDlc(self) -> bool:
        return bool(self.modules[self.active_id].state.get("include_dlc", True))

    @Property(str, notify=changed)
    def activeMode(self) -> str:
        return str(self.modules[self.active_id].state.get("mode", ""))

    @Property(bool, notify=changed)
    def prioritizeTeamups(self) -> bool:
        return bool(self.modules[self.active_id].state.get("prioritize_teamups", False))

    @Property(bool, notify=changed)
    def useTeamups(self) -> bool:
        return bool(self.modules[self.active_id].state.get("use_teamups", True))

    @Property(bool, notify=changed)
    def rivalsRoleComposition(self) -> bool:
        return bool(self.modules[self.active_id].state.get("role_composition", True))

    @Property(bool, notify=changed)
    def rivalsRolesOnly(self) -> bool:
        return bool(self.modules[self.active_id].state.get("roles_only", False))

    @Property(bool, notify=changed)
    def valorantCharacterOnly(self) -> bool:
        return bool(self.modules[self.active_id].state.get("character_only", False))

    @Property("QVariantList", notify=changed)
    def activeTeamups(self) -> list[dict[str, Any]]:
        return list(self.modules[self.active_id].state.get("active_teamups", []))

    @Slot(str, result=bool)
    def activate(self, game_id: str) -> bool:
        if game_id not in self.modules:
            return False
        if game_id == self.active_id:
            return True
        self.active_id = game_id
        if self.controller is not None:
            self.controller.setProfileGame(game_id)
        self._sync_profiles()
        self.save()
        self._notify_changed()
        return True

    @Slot(str)
    def generate(self, target: str = "all") -> None:
        self._sync_profiles()
        self.modules[self.active_id].generate(target)
        self.save()
        self._notify_changed()

    @Slot(str)
    def reroll(self, slot_id: str) -> None:
        self._sync_profiles()
        self.modules[self.active_id].reroll(slot_id)
        self.save()
        self._notify_changed()

    @Slot(str)
    def toggleLock(self, slot_id: str) -> None:
        for slot in self.modules[self.active_id].state.get("slots", []):
            if slot.get("id") == slot_id:
                slot["locked"] = not bool(slot.get("locked"))
                break
        self.save()
        self._notify_changed()

    @Slot(str)
    def switchSide(self, slot_id: str) -> None:
        if self.active_id != "pvzgw2" or not self.sideSwitchEnabled:
            return
        slots = self.modules[self.active_id].state.get("slots", [])
        source = next((slot for slot in slots if slot.get("id") == slot_id), None)
        if not source:
            return
        destination = "zombies" if source.get("side") == "plants" else "plants"
        if sum(slot.get("side") == destination for slot in slots) >= 4:
            return
        source["side"] = destination
        source["hero"] = None
        source["locked"] = False
        self.modules[self.active_id].reroll(slot_id)
        self.save()
        self._notify_changed()

    @Slot(str, str)
    def toggleBlocked(self, slot_id: str, hero_key: str) -> None:
        for slot in self.modules[self.active_id].state.get("slots", []):
            if slot.get("id") != slot_id:
                continue
            blocked = {str(key) for key in slot.get("blocked", [])}
            if hero_key in blocked:
                blocked.remove(hero_key)
            else:
                blocked.add(hero_key)
            slot["blocked"] = sorted(blocked)
            break
        self.save()
        self._notify_changed()

    @Slot(str)
    def clearBlocked(self, slot_id: str) -> None:
        for slot in self.modules[self.active_id].state.get("slots", []):
            if slot.get("id") == slot_id:
                slot["blocked"] = []
                break
        self.save()
        self._notify_changed()

    @Slot(str)
    def addSlot(self, side: str = "") -> None:
        module = self.modules[self.active_id]
        slots = module.state.get("slots", [])
        if isinstance(module, RosterModule):
            if len(slots) >= module.max_players:
                return
            slot = module.new_slot(len(slots))
            slot["id"] = f"{self.active_id}-{time.time_ns()}"
            slots.append(slot)
            self._sync_profiles()
            self.save()
            self._notify_changed()
            return
        if self.active_id == "tf2":
            if len(slots) >= 6:
                return
            prefix = "tf2"
        elif self.active_id == "rivals":
            if len(slots) >= 6:
                return
            prefix = "rivals"
        elif self.active_id == "pvzgw2":
            side = side if side in {"plants", "zombies"} else "plants"
            if len(slots) >= 8:
                return
            prefix = f"pvz-{side}"
        else:
            return
        serial = int(time.time_ns())
        slot = {
            "id": f"{prefix}-{serial}",
            "name": f"Jugador {len(slots) + 1}",
            "profileId": "",
            "profileName": "",
            "blocked": [],
            "locked": False,
            "hero": None,
        }
        if self.active_id == "pvzgw2":
            slot["side"] = side
        elif self.active_id == "rivals":
            slot["roles"] = ["vanguard", "duelist", "strategist", "flex"]
            slot["teamupKey"] = ""
        elif self.active_id == "tf2":
            slot["roles"] = ["offense", "defense", "support"]
        slots.append(slot)
        self._sync_profiles()
        self.save()
        self._notify_changed()

    @Slot(str)
    def removeSlot(self, slot_id: str) -> None:
        slots = self.modules[self.active_id].state.get("slots", [])
        if len(slots) <= 1:
            return
        self.modules[self.active_id].state["slots"] = [
            slot for slot in slots if slot.get("id") != slot_id
        ]
        self.save()
        self._notify_changed()

    @Slot(bool)
    def setAllowDuplicates(self, enabled: bool) -> None:
        self.modules[self.active_id].state["allow_duplicates"] = bool(enabled)
        self.save()
        self._notify_changed()

    @Slot(bool)
    def setSideSwitchEnabled(self, enabled: bool) -> None:
        if self.active_id != "pvzgw2":
            return
        self.modules[self.active_id].state["allow_side_switch"] = bool(enabled)
        self.save()
        self._notify_changed()

    @Slot(bool)
    def setUseVariants(self, enabled: bool) -> None:
        if self.active_id != "pvzgw2":
            return
        self.modules[self.active_id].state["use_variants"] = bool(enabled)
        self.save()
        self._notify_changed()

    @Slot(bool)
    def setIncludeDlc(self, enabled: bool) -> None:
        if self.active_id != "pvzgw2":
            return
        self.modules[self.active_id].state["include_dlc"] = bool(enabled)
        self.save()
        self._notify_changed()

    @Slot(str)
    def setActiveMode(self, mode: str) -> None:
        module = self.modules[self.active_id]
        valid = {"mercenaries"} if self.active_id == "tf2" else set()
        if mode not in valid or module.state.get("mode") == mode:
            return
        module.state["mode"] = mode
        self.save()
        self._notify_changed()

    @Slot(bool)
    def setPrioritizeTeamups(self, enabled: bool) -> None:
        if self.active_id != "rivals":
            return
        self.modules[self.active_id].state["prioritize_teamups"] = bool(enabled)
        self.save()
        self._notify_changed()

    @Slot(bool)
    def setUseTeamups(self, enabled: bool) -> None:
        if self.active_id != "rivals":
            return
        module = self.modules[self.active_id]
        module.state["use_teamups"] = bool(enabled)
        if hasattr(module, "_update_teamups"):
            module._update_teamups()
        self.save()
        self._notify_changed()

    @Slot(bool)
    def setRivalsRoleComposition(self, enabled: bool) -> None:
        if self.active_id != "rivals":
            return
        self.modules[self.active_id].state["role_composition"] = bool(enabled)
        self.save()
        self._notify_changed()

    @Slot(bool)
    def setRivalsRolesOnly(self, enabled: bool) -> None:
        if self.active_id != "rivals":
            return
        self.modules[self.active_id].state["roles_only"] = bool(enabled)
        self.save()
        self._notify_changed()

    @Slot(bool)
    def setValorantCharacterOnly(self, enabled: bool) -> None:
        if self.active_id != "valorant":
            return
        self.modules[self.active_id].state["character_only"] = bool(enabled)
        self.save()
        self._notify_changed()

    @Slot(str, str)
    def setSlotHero(self, slot_id: str, hero_key: str) -> None:
        module = self.modules[self.active_id]
        hero = next((dict(row) for row in module.catalog() if row.get("key") == hero_key), None)
        assigned_slot = None
        for slot in module.state.get("slots", []):
            if slot.get("id") == slot_id:
                slot["hero"] = hero
                assigned_slot = slot
                break
        if hasattr(module, "_update_teamups"):
            if assigned_slot is not None and hasattr(module, "_randomize_teamup_choice"):
                module._randomize_teamup_choice(assigned_slot)
            module._update_teamups()
        self.save()
        self._notify_changed()

    @Slot(str, str)
    def setSlotTeamup(self, slot_id: str, teamup_key: str) -> None:
        if self.active_id != "rivals":
            return
        module = self.modules[self.active_id]
        if module.set_teamup(slot_id, teamup_key):
            self.save()
            self._notify_changed()

    @Slot(str, str)
    def toggleSlotRole(self, slot_id: str, role: str) -> None:
        module = self.modules[self.active_id]
        valid_roles = {
            "rivals": {"vanguard", "duelist", "strategist", "flex"},
            "tf2": {"offense", "defense", "support"},
        }.get(self.active_id, set())
        if isinstance(module, RosterModule):
            valid_roles = set(module.roles)
        if role not in valid_roles:
            return
        for slot in self.modules[self.active_id].state.get("slots", []):
            if slot.get("id") != slot_id:
                continue
            roles = set(slot.get("roles", valid_roles))
            if role in roles and len(roles) > 1:
                roles.remove(role)
            else:
                roles.add(role)
            slot["roles"] = sorted(roles)
            break
        self.save()
        self._notify_changed()

    @Slot(str, str)
    def setSlotSide(self, slot_id: str, side: str) -> None:
        if self.active_id != "pvzgw2" or side not in {"plants", "zombies"}:
            return
        for slot in self.modules[self.active_id].state.get("slots", []):
            if slot.get("id") != slot_id or slot.get("side") == side:
                continue
            slot["side"] = side
            slot["hero"] = None
            slot["locked"] = False
            self.modules[self.active_id].reroll(slot_id)
            break
        self.save()
        self._notify_changed()

    @Slot(int, str)
    def assignSlotProfile(self, index: int, profile_id: str) -> None:
        if self.controller is None or self.active_id == "overwatch":
            return
        slots = self.modules[self.active_id].state.get("slots", [])
        if not 0 <= index < len(slots):
            return
        self.controller.assignPlayerProfile(index, profile_id)
        self._sync_profiles()
        self.save()
        self._notify_changed()

    @Slot(int, str)
    def setSlotName(self, index: int, name: str) -> None:
        if self.controller is None or self.active_id == "overwatch":
            return
        slots = self.modules[self.active_id].state.get("slots", [])
        if not 0 <= index < len(slots) or slots[index].get("profileId"):
            return
        clean_name = str(name).strip() or f"Jugador {index + 1}"
        self.controller.setPlayerName(index, clean_name)
        self._sync_profiles()
        self.save()
        self._notify_changed()

    @Slot(int)
    def adjustPlayerCount(self, delta: int) -> None:
        slots = self.modules[self.active_id].state.get("slots", [])
        if delta > 0:
            if isinstance(self.modules[self.active_id], RosterModule):
                self.addSlot("")
            elif self.active_id == "tf2":
                self.addSlot("")
            elif self.active_id == "rivals":
                self.addSlot("")
            elif self.active_id == "pvzgw2":
                side = str(slots[0].get("side", "plants")) if slots else "plants"
                self.addSlot(side)
            return
        if delta >= 0 or len(slots) <= 1:
            return
        self.removeSlot(str(slots[-1].get("id", "")))
