"""Offline Marvel Rivals selector with optional Team-Up prioritization."""

from __future__ import annotations

import json
import random
from pathlib import Path
from typing import Any

from .base import GameModule, ModuleMetadata


RIVALS_ROLES = ("vanguard", "duelist", "strategist", "flex")
PROFILE_BUCKETS = ("main", "played", "practice", "avoid")


class RivalsModule(GameModule):
    metadata = ModuleMetadata(
        game_id="rivals",
        name="Marvel Rivals",
        short_name="Rivals",
        accent="#ffd34e",
        status="available",
        description="Equipos de hasta seis jugadores con roles, perfiles y Team-Ups.",
        source="Catalogo oficial guardado localmente",
        view="GameRivalsPage.qml",
    )

    def __init__(self, asset_dir: Path, state: dict[str, Any] | None = None) -> None:
        self.asset_dir = asset_dir.resolve()
        self.profile_rules: dict[str, dict[str, Any]] = {}
        self._catalog_cache: list[dict[str, Any]] | None = None
        self.teamups = self._read_json(asset_dir / "teamups.json", {}).get("teamups", [])
        self._teamups_by_receiver: dict[str, list[dict[str, Any]]] = {}
        for teamup in self.teamups:
            receiver = str(teamup.get("receiver", ""))
            if receiver:
                self._teamups_by_receiver.setdefault(receiver, []).append(teamup)
        super().__init__(state)
        for slot in self.state.get("slots", []):
            self._normalize_teamup_choice(slot)
        self._update_teamups()

    @staticmethod
    def _read_json(path: Path, fallback: Any) -> Any:
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return fallback

    def default_state(self) -> dict[str, Any]:
        return {
            "allow_duplicates": False,
            "prioritize_teamups": True,
            "use_teamups": True,
            "role_composition": True,
            "roles_only": False,
            "active_teamups": [],
            "slots": [
                {
                    "id": f"rivals-slot-{index + 1}",
                    "name": f"Jugador {index + 1}",
                    "profileId": "",
                    "roles": list(RIVALS_ROLES),
                    "blocked": [],
                    "locked": False,
                    "teamupKey": "",
                    "hero": None,
                }
                for index in range(6)
            ],
        }

    def restore(self, payload: dict[str, Any]) -> None:
        super().restore(payload)
        catalog_by_key = {entry["key"]: entry for entry in self.catalog()}
        valid = set(catalog_by_key)
        for slot in self.state.get("slots", []):
            slot["roles"] = [
                role for role in slot.get("roles", RIVALS_ROLES)
                if role in RIVALS_ROLES
            ] or list(RIVALS_ROLES)
            slot["blocked"] = [key for key in slot.get("blocked", []) if key in valid]
            hero = slot.get("hero") or {}
            if hero.get("key") not in valid:
                slot["hero"] = None
            else:
                slot["hero"] = dict(catalog_by_key[str(hero.get("key"))])
            self._normalize_teamup_choice(slot)

    def catalog(self) -> list[dict[str, Any]]:
        if self._catalog_cache is not None:
            return self._catalog_cache
        payload = self._read_json(self.asset_dir / "catalog.json", {})
        rows: list[dict[str, Any]] = []
        for raw in payload.get("heroes", []):
            key = str(raw.get("key", ""))
            role = str(raw.get("role", ""))
            portrait = self.asset_dir / Path(str(raw.get("portrait", ""))).name
            if not key or role not in RIVALS_ROLES or not portrait.exists():
                continue
            options = [
                {
                    "key": str(teamup.get("key", "")),
                    "name": str(teamup.get("name", "")),
                    "anchor": str(teamup.get("anchor", "")),
                }
                for teamup in self._teamups_by_receiver.get(key, [])
            ]
            rows.append({
                "key": key,
                "name": str(raw.get("name", key)),
                "role": role,
                "side": "hero",
                "portrait": portrait.as_uri(),
                "teamups": options,
            })
        rows.sort(key=lambda entry: (RIVALS_ROLES.index(entry["role"]), entry["name"]))
        self._catalog_cache = rows
        return rows

    def _profile(self, slot: dict[str, Any]) -> dict[str, Any]:
        return self.profile_rules.get(str(slot.get("profileId", "")), {})

    def _profile_bucket(self, profile: dict[str, Any], key: str) -> str:
        groups = profile.get("heroes", {})
        for bucket in PROFILE_BUCKETS:
            if key in groups.get(bucket, []):
                return bucket
        return ""

    def _profile_allows(self, slot: dict[str, Any], hero: dict[str, Any]) -> bool:
        profile = self._profile(slot)
        if not profile:
            return True
        bucket = self._profile_bucket(profile, hero["key"])
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
        bucket = self._profile_bucket(profile, hero["key"])
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
        forced_role: str = "",
    ) -> list[dict[str, Any]]:
        blocked = set(slot.get("blocked", [])) | (extra_blocked or set())
        roles = set(slot.get("roles", RIVALS_ROLES))
        rows = [
            hero for hero in self.catalog()
            if hero["key"] not in blocked
            and hero["role"] in roles
            and (not forced_role or hero["role"] == forced_role)
            and self._profile_allows(slot, hero)
            and (self.state.get("allow_duplicates") or hero["key"] not in used)
        ]
        if not rows and not self.state.get("allow_duplicates"):
            rows = [
                hero for hero in self.catalog()
                if hero["key"] not in blocked
                and hero["role"] in roles
                and (not forced_role or hero["role"] == forced_role)
                and self._profile_allows(slot, hero)
            ]
        return rows

    def _choose(
        self,
        slot: dict[str, Any],
        used: set[str],
        blocked: set[str] | None = None,
        forced_role: str = "",
    ) -> dict[str, Any] | None:
        rows = self._candidates(slot, used, blocked, forced_role)
        if not rows and forced_role:
            rows = self._candidates(slot, used, blocked)
        if not rows:
            return None
        weights = [self._weight(slot, hero) for hero in rows]
        return dict(random.choices(rows, weights=weights, k=1)[0])

    def _normalize_teamup_choice(self, slot: dict[str, Any]) -> None:
        if not self.state.get("use_teamups", True):
            slot["teamupKey"] = ""
            return
        hero_key = str((slot.get("hero") or {}).get("key", ""))
        options = self._teamups_by_receiver.get(hero_key, [])
        valid = {str(option.get("key", "")) for option in options}
        current = str(slot.get("teamupKey", ""))
        slot["teamupKey"] = current if current in valid else (
            str(random.choice(options).get("key", "")) if options else ""
        )

    def _randomize_teamup_choice(self, slot: dict[str, Any]) -> None:
        if not self.state.get("use_teamups", True):
            slot["teamupKey"] = ""
            return
        hero_key = str((slot.get("hero") or {}).get("key", ""))
        options = self._teamups_by_receiver.get(hero_key, [])
        slot["teamupKey"] = (
            str(random.choice(options).get("key", "")) if options else ""
        )

    def _place_teamup(self, slots: list[dict[str, Any]], used: set[str]) -> set[str]:
        if (
            len(slots) < 2
            or not self.state.get("use_teamups", True)
            or not self.state.get("prioritize_teamups", True)
            or self.state.get("role_composition", True)
        ):
            return set()
        by_key = {hero["key"]: hero for hero in self.catalog()}
        options: list[
            tuple[
                dict[str, Any],
                dict[str, Any],
                dict[str, Any],
                dict[str, Any],
                dict[str, Any],
            ]
        ] = []
        for teamup in self.teamups:
            keys = list(teamup.get("heroes", []))
            if len(keys) != 2 or keys[0] not in by_key or keys[1] not in by_key:
                continue
            for first in slots:
                for second in slots:
                    if first is second:
                        continue
                    hero_a, hero_b = by_key[keys[0]], by_key[keys[1]]
                    if hero_a["key"] in used or hero_b["key"] in used:
                        continue
                    if hero_a not in self._candidates(first, used):
                        continue
                    if hero_b not in self._candidates(second, used | {hero_a["key"]}):
                        continue
                    options.append((teamup, first, second, hero_a, hero_b))
        if not options:
            return set()
        teamup, first, second, hero_a, hero_b = random.choice(options)
        first["hero"] = dict(hero_a)
        second["hero"] = dict(hero_b)
        teamup_key = str(teamup.get("key", ""))
        receiver_key = str(teamup.get("receiver", ""))
        if hero_a["key"] == receiver_key:
            first["teamupKey"] = teamup_key
            self._randomize_teamup_choice(second)
        else:
            second["teamupKey"] = teamup_key
            self._randomize_teamup_choice(first)
        return {str(first["id"]), str(second["id"])}

    def generate(self, target: str = "all") -> list[dict[str, Any]]:
        used = {
            str(slot.get("hero", {}).get("key"))
            for slot in self.state["slots"]
            if slot.get("locked") and slot.get("hero")
        }
        open_slots = [slot for slot in self.state["slots"] if not slot.get("locked")]
        placed = self._place_teamup(open_slots, used)
        role_plan: list[str] = []
        if self.state.get("role_composition", True):
            templates = {
                1: ["duelist"],
                2: ["vanguard", "strategist"],
                3: ["vanguard", "duelist", "strategist"],
                4: ["vanguard", "duelist", "duelist", "strategist"],
                5: ["vanguard", "duelist", "duelist", "strategist", "strategist"],
                6: ["vanguard", "vanguard", "duelist", "duelist", "strategist", "strategist"],
            }
            role_plan = list(templates.get(len(open_slots), templates[6]))
            random.shuffle(role_plan)
        for slot in open_slots:
            if str(slot.get("id")) in placed:
                used.add(str(slot["hero"]["key"]))
                continue
            forced_role = role_plan.pop() if role_plan else ""
            hero = self._choose(slot, used, forced_role=forced_role)
            slot["hero"] = hero
            self._randomize_teamup_choice(slot)
            if hero:
                used.add(hero["key"])
        self._update_teamups()
        return self.state["slots"]

    def reroll(self, slot_id: str) -> dict[str, Any] | None:
        used = {
            str(slot.get("hero", {}).get("key"))
            for slot in self.state["slots"]
            if slot.get("id") != slot_id and slot.get("hero")
        }
        existing = {str(slot.get("hero", {}).get("key")) for slot in self.state["slots"] if slot.get("hero")}
        partner_keys = {
            hero_key
            for teamup in self.teamups
            for hero_key in teamup.get("heroes", [])
            if any(
                other in existing
                for other in teamup.get("heroes", [])
                if other != hero_key
            )
        }
        for slot in self.state["slots"]:
            if slot.get("id") != slot_id:
                continue
            current = str(slot.get("hero", {}).get("key", ""))
            forced_role = (
                str((slot.get("hero") or {}).get("role", ""))
                if self.state.get("role_composition", True)
                else ""
            )
            rows = self._candidates(
                slot,
                used,
                {current} if current else set(),
                forced_role,
            )
            if self.state.get("prioritize_teamups", True):
                paired = [hero for hero in rows if hero["key"] in partner_keys]
                if paired:
                    rows = paired
            hero = dict(random.choice(rows)) if rows else None
            slot["hero"] = hero
            self._randomize_teamup_choice(slot)
            self._update_teamups()
            return hero
        return None

    def set_teamup(self, slot_id: str, teamup_key: str) -> bool:
        for slot in self.state.get("slots", []):
            if str(slot.get("id", "")) != slot_id:
                continue
            hero_key = str((slot.get("hero") or {}).get("key", ""))
            valid = {
                str(option.get("key", ""))
                for option in self._teamups_by_receiver.get(hero_key, [])
            }
            if teamup_key not in valid:
                return False
            slot["teamupKey"] = teamup_key
            self._update_teamups()
            return True
        return False

    def _update_teamups(self) -> None:
        if not self.state.get("use_teamups", True):
            for slot in self.state.get("slots", []):
                slot["teamupKey"] = ""
            self.state["active_teamups"] = []
            return
        present = {
            str(slot.get("hero", {}).get("key"))
            for slot in self.state.get("slots", [])
            if slot.get("hero")
        }
        by_key = {str(teamup.get("key", "")): teamup for teamup in self.teamups}
        active: list[dict[str, Any]] = []
        seen: set[str] = set()
        for slot in self.state.get("slots", []):
            self._normalize_teamup_choice(slot)
            key = str(slot.get("teamupKey", ""))
            teamup = by_key.get(key)
            if not teamup or key in seen:
                continue
            anchor = str(teamup.get("anchor", ""))
            if anchor and anchor in present:
                active.append({
                    "key": key,
                    "name": str(teamup.get("name", "")),
                    "receiver": str(teamup.get("receiver", "")),
                    "anchor": anchor,
                    "enhanced": True,
                })
                seen.add(key)
        self.state["active_teamups"] = active
