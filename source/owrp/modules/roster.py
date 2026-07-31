"""Reusable offline roster selector for hero-based games."""

from __future__ import annotations

import json
import random
from pathlib import Path
from typing import Any

from .base import GameModule, ModuleMetadata


PROFILE_BUCKETS = ("main", "played", "practice", "avoid")


class RosterModule(GameModule):
    default_players = 5
    max_players = 12
    role_labels: dict[str, str] = {}
    role_labels_by_locale: dict[str, dict[str, str]] = {}
    role_colors: dict[str, str] = {}

    def __init__(self, asset_dir: Path, state: dict[str, Any] | None = None) -> None:
        self.asset_dir = asset_dir.resolve()
        self.profile_rules: dict[str, dict[str, Any]] = {}
        self._catalog_cache: list[dict[str, Any]] | None = None
        super().__init__(state)

    @property
    def roles(self) -> tuple[str, ...]:
        values = {str(row.get("role", "")) for row in self.catalog()}
        return tuple(sorted(value for value in values if value))

    def default_state(self) -> dict[str, Any]:
        return {
            "allow_duplicates": False,
            "slots": [
                self.new_slot(index)
                for index in range(self.default_players)
            ],
        }

    def new_slot(self, index: int) -> dict[str, Any]:
        return {
            "id": f"{self.metadata.game_id}-slot-{index + 1}",
            "name": f"Jugador {index + 1}",
            "profileId": "",
            "profileName": "",
            "roles": list(self.roles),
            "blocked": [],
            "locked": False,
            "hero": None,
        }

    @staticmethod
    def _read_json(path: Path, fallback: Any) -> Any:
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return fallback

    def catalog(self) -> list[dict[str, Any]]:
        if self._catalog_cache is not None:
            return self._catalog_cache
        payload = self._read_json(self.asset_dir / "catalog.json", {})
        rows: list[dict[str, Any]] = []
        for raw in payload.get("heroes", []):
            key = str(raw.get("key", "")).strip()
            name = str(raw.get("name", key)).strip()
            role = str(raw.get("role", "hero")).strip() or "hero"
            portrait_name = str(raw.get("portrait", "")).strip()
            portrait_path = self.asset_dir / Path(portrait_name).name
            if not key or not name:
                continue
            rows.append(
                {
                    "key": key,
                    "name": name,
                    "role": role,
                    "side": "hero",
                    "portrait": portrait_path.as_uri() if portrait_path.is_file() else "",
                    "details": list(raw.get("details", [])),
                }
            )
        rows.sort(key=lambda item: (item["role"], item["name"]))
        self._catalog_cache = rows
        return rows

    def restore(self, payload: dict[str, Any]) -> None:
        super().restore(payload)
        by_key = {row["key"]: row for row in self.catalog()}
        valid_roles = set(self.roles)
        normalized: list[dict[str, Any]] = []
        for index, raw in enumerate(self.state.get("slots", [])):
            if not isinstance(raw, dict):
                continue
            slot = dict(raw)
            slot.setdefault("id", f"{self.metadata.game_id}-slot-{index + 1}")
            slot.setdefault("name", f"Jugador {index + 1}")
            slot.setdefault("profileId", "")
            slot.setdefault("profileName", "")
            roles = [role for role in slot.get("roles", []) if role in valid_roles]
            slot["roles"] = roles or list(self.roles)
            slot["blocked"] = [
                key for key in slot.get("blocked", [])
                if key in by_key
            ]
            hero_key = str((slot.get("hero") or {}).get("key", ""))
            slot["hero"] = dict(by_key[hero_key]) if hero_key in by_key else None
            slot["locked"] = bool(slot.get("locked", False))
            normalized.append(slot)
        self.state["slots"] = normalized[: self.max_players] or [self.new_slot(0)]

    def _profile(self, slot: dict[str, Any]) -> dict[str, Any]:
        return self.profile_rules.get(str(slot.get("profileId", "")), {})

    @staticmethod
    def _bucket(profile: dict[str, Any], hero_key: str) -> str:
        groups = profile.get("heroes", {})
        for bucket in PROFILE_BUCKETS:
            if hero_key in groups.get(bucket, []):
                return bucket
        return ""

    def _profile_allows(self, slot: dict[str, Any], hero: dict[str, Any]) -> bool:
        profile = self._profile(slot)
        if not profile:
            return True
        bucket = self._bucket(profile, hero["key"])
        mode = str(profile.get("mode", "classic"))
        if mode in {"classic", "allprofile", "lowprob"}:
            return True
        allowed = {
            "practice": {"practice", "avoid"},
            "played": {"main", "played", "practice"},
            "prefer": {"main", "played"},
            "main": {"main"},
        }.get(mode, set())
        return bucket in allowed

    def _weight(self, slot: dict[str, Any], hero: dict[str, Any]) -> int:
        profile = self._profile(slot)
        bucket = self._bucket(profile, hero["key"])
        mode = str(profile.get("mode", "classic"))
        if mode == "lowprob":
            return {"avoid": 8, "practice": 5, "played": 3, "main": 1}.get(bucket, 5)
        if mode == "allprofile":
            return {"main": 6, "played": 4, "practice": 2, "avoid": 1}.get(bucket, 1)
        return 1

    def _candidates(
        self,
        slot: dict[str, Any],
        used: set[str],
        extra_blocked: set[str] | None = None,
    ) -> list[dict[str, Any]]:
        blocked = set(slot.get("blocked", [])) | (extra_blocked or set())
        roles = set(slot.get("roles", self.roles))
        rows = [
            hero for hero in self.catalog()
            if hero["key"] not in blocked
            and hero["role"] in roles
            and self._profile_allows(slot, hero)
            and (self.state.get("allow_duplicates") or hero["key"] not in used)
        ]
        if not rows and not self.state.get("allow_duplicates"):
            rows = [
                hero for hero in self.catalog()
                if hero["key"] not in blocked
                and hero["role"] in roles
                and self._profile_allows(slot, hero)
            ]
        return rows

    def _choose(
        self,
        slot: dict[str, Any],
        used: set[str],
        extra_blocked: set[str] | None = None,
    ) -> dict[str, Any] | None:
        rows = self._candidates(slot, used, extra_blocked)
        if not rows:
            return None
        return dict(random.choices(rows, weights=[self._weight(slot, row) for row in rows], k=1)[0])

    def generate(self, target: str = "all") -> list[dict[str, Any]]:
        used = {
            str((slot.get("hero") or {}).get("key", ""))
            for slot in self.state["slots"]
            if slot.get("locked") and slot.get("hero")
        }
        for slot in self.state["slots"]:
            if slot.get("locked"):
                continue
            hero = self._choose(slot, used)
            slot["hero"] = hero
            if hero:
                used.add(hero["key"])
        return self.state["slots"]

    def reroll(self, slot_id: str) -> dict[str, Any] | None:
        used = {
            str((slot.get("hero") or {}).get("key", ""))
            for slot in self.state["slots"]
            if slot.get("id") != slot_id and slot.get("hero")
        }
        for slot in self.state["slots"]:
            if slot.get("id") != slot_id:
                continue
            current = str((slot.get("hero") or {}).get("key", ""))
            hero = self._choose(slot, used, {current} if current else set())
            slot["hero"] = hero
            return hero
        return None

    def localized_role_labels(self, locale: str) -> dict[str, str]:
        return self.role_labels_by_locale.get(
            locale,
            self.role_labels_by_locale.get("en-us", self.role_labels),
        )


class PaladinsModule(RosterModule):
    metadata = ModuleMetadata(
        game_id="paladins",
        name="Paladins",
        short_name="PALADINS",
        accent="#43aee8",
        status="available",
        description="Equipos de campeones con roles, perfiles, filtros y ruleta offline.",
        source="Hi-Rez Paladins API + snapshot local",
        view="GameRosterPage.qml",
    )
    default_players = 5
    max_players = 10
    role_labels = {
        "frontline": "Frente",
        "damage": "Daño",
        "flank": "Flanco",
        "support": "Apoyo",
    }
    role_labels_by_locale = {
        "es-mx": role_labels,
        "es-es": role_labels,
        "en-us": {
            "frontline": "Front Line",
            "damage": "Damage",
            "flank": "Flank",
            "support": "Support",
        },
        "pt-br": {
            "frontline": "Linha de frente",
            "damage": "Dano",
            "flank": "Flanco",
            "support": "Suporte",
        },
        "fr-fr": {
            "frontline": "Avant-garde",
            "damage": "Dégâts",
            "flank": "Flanc",
            "support": "Soutien",
        },
        "de-de": {
            "frontline": "Front",
            "damage": "Schaden",
            "flank": "Flanke",
            "support": "Unterstützung",
        },
        "ja-jp": {
            "frontline": "フロントライン",
            "damage": "ダメージ",
            "flank": "フランク",
            "support": "サポート",
        },
        "ko-kr": {
            "frontline": "프론트라인",
            "damage": "공격",
            "flank": "플랭커",
            "support": "지원",
        },
    }
    role_colors = {
        "frontline": "#45b9ff",
        "damage": "#ff5964",
        "flank": "#a878ff",
        "support": "#55d9a4",
    }


class FragPunkModule(RosterModule):
    metadata = ModuleMetadata(
        game_id="fragpunk",
        name="FragPunk",
        short_name="FRAGPUNK",
        accent="#ef4d7b",
        status="available",
        description="Escuadras de Lancers con perfiles, filtros y ruleta offline.",
        source="FragPunk official website + local snapshot",
        view="GameRosterPage.qml",
    )
    default_players = 5
    max_players = 10
    role_labels = {"lancer": "Lancer"}
    role_labels_by_locale = {
        locale: {"lancer": "Lancer"}
        for locale in ("es-mx", "es-es", "en-us", "pt-br", "fr-fr", "de-de", "ja-jp", "ko-kr")
    }
    role_colors = {"lancer": "#ef4d7b"}


class ApexModule(RosterModule):
    metadata = ModuleMetadata(
        game_id="apex",
        name="Apex Legends",
        short_name="APEX",
        accent="#d85a52",
        status="available",
        description="Escuadras de leyendas con clases, perfiles, filtros y ruleta offline.",
        source="Electronic Arts official characters hub + local snapshot",
        view="GameRosterPage.qml",
    )
    default_players = 3
    max_players = 6
    role_labels = {
        "assault": "Asalto",
        "skirmisher": "Escaramuza",
        "recon": "Reconocimiento",
        "controller": "Control",
        "support": "Apoyo",
    }
    role_labels_by_locale = {
        "es-mx": role_labels,
        "es-es": role_labels,
        "en-us": {
            "assault": "Assault",
            "skirmisher": "Skirmisher",
            "recon": "Recon",
            "controller": "Controller",
            "support": "Support",
        },
        "pt-br": {
            "assault": "Assalto",
            "skirmisher": "Escaramuçador",
            "recon": "Reconhecimento",
            "controller": "Controle",
            "support": "Suporte",
        },
        "fr-fr": {
            "assault": "Assaut",
            "skirmisher": "Escarmouche",
            "recon": "Reconnaissance",
            "controller": "Contrôle",
            "support": "Soutien",
        },
        "de-de": {
            "assault": "Angriff",
            "skirmisher": "Plänkler",
            "recon": "Aufklärung",
            "controller": "Kontrolle",
            "support": "Unterstützung",
        },
        "ja-jp": {
            "assault": "アサルト",
            "skirmisher": "スカーミッシャー",
            "recon": "リコン",
            "controller": "コントローラー",
            "support": "サポート",
        },
        "ko-kr": {
            "assault": "어설트",
            "skirmisher": "스커미셔",
            "recon": "리콘",
            "controller": "컨트롤러",
            "support": "서포트",
        },
    }
    role_colors = {
        "assault": "#ff5964",
        "skirmisher": "#ff9f1c",
        "recon": "#52b9ff",
        "controller": "#a878ff",
        "support": "#55d9a4",
    }


class ValorantModule(RosterModule):
    metadata = ModuleMetadata(
        game_id="valorant",
        name="Valorant",
        short_name="VAL",
        accent="#ff5964",
        status="available",
        description="Escuadras de agentes con roles, perfiles, filtros y ruleta offline.",
        source="Riot Public Content + snapshot local",
        view="GameRosterPage.qml",
    )
    default_players = 5
    max_players = 10
    role_labels = {
        "controller": "Controlador",
        "duelist": "Duelista",
        "initiator": "Iniciador",
        "sentinel": "Centinela",
    }
    role_colors = {
        "controller": "#8d7aff",
        "duelist": "#ff5964",
        "initiator": "#52b9ff",
        "sentinel": "#55d9a4",
    }
    buy_plans = (
        ("ECO", "Classic + habilidades"),
        ("PISTOLAS", "Ghost o Sheriff"),
        ("COMPRA MEDIA", "Spectre, Bulldog o Guardian"),
        ("COMPRA COMPLETA", "Vandal o Phantom + escudo pesado"),
        ("LARGO ALCANCE", "Marshal u Operator"),
    )

    def default_state(self) -> dict[str, Any]:
        state = super().default_state()
        state["character_only"] = False
        return state

    def _with_loadout(self, hero: dict[str, Any] | None) -> dict[str, Any] | None:
        if not hero:
            return None
        if self.state.get("character_only", False):
            enriched = dict(hero)
            enriched["details"] = []
            return enriched
        plan, purchase = random.choice(self.buy_plans)
        enriched = dict(hero)
        enriched["details"] = [
            {"label": "ARMA INICIAL", "value": "Classic"},
            {"label": f"PLAN ALEATORIO · {plan}", "value": purchase},
        ]
        return enriched

    def generate(self, target: str = "all") -> list[dict[str, Any]]:
        rows = super().generate(target)
        for slot in rows:
            if not slot.get("locked"):
                slot["hero"] = self._with_loadout(slot.get("hero"))
        return rows

    def reroll(self, slot_id: str) -> dict[str, Any] | None:
        hero = self._with_loadout(super().reroll(slot_id))
        for slot in self.state["slots"]:
            if slot.get("id") == slot_id:
                slot["hero"] = hero
                break
        return hero


class LastFlagModule(RosterModule):
    metadata = ModuleMetadata(
        game_id="lastflag",
        name="Last Flag",
        short_name="LAST FLAG",
        accent="#72c7ff",
        status="available",
        description="Selector 5v5 del reparto publicado, con perfiles y ruleta offline.",
        source="Last Flag · sitio oficial · snapshot local",
        view="GameRosterPage.qml",
    )
    default_players = 5
    max_players = 10
    role_labels = {"contestant": "Concursante"}
    role_colors = {"contestant": "#72c7ff"}

    def catalog(self) -> list[dict[str, Any]]:
        rows = super().catalog()
        if rows and rows[0].get("role") != "contestant":
            self._catalog_cache = [
                {
                    **row,
                    "original_role": row.get("role", ""),
                    "role": "contestant",
                }
                for row in rows
            ]
        return self._catalog_cache or []


class DeadlockModule(RosterModule):
    metadata = ModuleMetadata(
        game_id="deadlock",
        name="Deadlock",
        short_name="DEADLOCK",
        accent="#c8a96b",
        status="experimental",
        description="Seis jugadores; cada ficha propone tres heroes con prioridad.",
        source="Deadlock API snapshot local",
        view="GameRosterPage.qml",
        experimental=True,
    )
    default_players = 6
    max_players = 6
    role_labels = {"hero": "Heroe"}
    role_colors = {"hero": "#c8a96b"}
    priorities = (
        ("max", "PRIORIDAD MAXIMA"),
        ("high", "PRIORIDAD ALTA"),
        ("selected", "SELECCIONADO"),
    )

    def restore(self, payload: dict[str, Any]) -> None:
        super().restore(payload)
        by_key = {row["key"]: row for row in self.catalog()}
        for slot in self.state["slots"]:
            restored: list[dict[str, Any]] = []
            for index, raw in enumerate(slot.get("options", [])):
                key = str((raw or {}).get("key", ""))
                if key not in by_key or index >= len(self.priorities):
                    continue
                priority, label = self.priorities[index]
                restored.append({
                    **dict(by_key[key]),
                    "priority": priority,
                    "priorityLabel": label,
                })
            slot["options"] = restored
            if restored:
                slot["hero"] = dict(restored[0])
        while len(self.state["slots"]) < self.default_players:
            self.state["slots"].append(self.new_slot(len(self.state["slots"])))

    def new_slot(self, index: int) -> dict[str, Any]:
        slot = super().new_slot(index)
        slot["options"] = []
        return slot

    def _draft_options(
        self,
        slot: dict[str, Any],
        used: set[str],
        extra_blocked: set[str] | None = None,
    ) -> list[dict[str, Any]]:
        options: list[dict[str, Any]] = []
        local_blocked = set(extra_blocked or set())
        for priority, label in self.priorities:
            hero = self._choose(slot, used, local_blocked)
            if not hero:
                break
            hero["priority"] = priority
            hero["priorityLabel"] = label
            options.append(hero)
            local_blocked.add(hero["key"])
            used.add(hero["key"])
        return options

    def generate(self, target: str = "all") -> list[dict[str, Any]]:
        used: set[str] = set()
        for slot in self.state["slots"]:
            if not slot.get("locked"):
                continue
            locked_options = slot.get("options", [])
            if locked_options:
                used.update(str(option.get("key", "")) for option in locked_options)
            elif slot.get("hero"):
                used.add(str(slot["hero"].get("key", "")))

        for slot in self.state["slots"]:
            if slot.get("locked"):
                continue
            options = self._draft_options(slot, used)
            slot["options"] = options
            slot["hero"] = dict(options[0]) if options else None
        return self.state["slots"]

    def reroll(self, slot_id: str) -> dict[str, Any] | None:
        used: set[str] = set()
        for slot in self.state["slots"]:
            if slot.get("id") == slot_id:
                continue
            options = slot.get("options", [])
            if options:
                used.update(str(option.get("key", "")) for option in options)
            elif slot.get("hero"):
                used.add(str(slot["hero"].get("key", "")))

        for slot in self.state["slots"]:
            if slot.get("id") != slot_id:
                continue
            previous = {
                str(option.get("key", ""))
                for option in slot.get("options", [])
            }
            options = self._draft_options(slot, used, previous)
            slot["options"] = options
            slot["hero"] = dict(options[0]) if options else None
            return slot["hero"]
        return None
