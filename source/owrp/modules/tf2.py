"""Offline Team Fortress 2 selector."""

from __future__ import annotations

from typing import Any

from .base import GameModule, ModuleMetadata
from .selection import choose


TF2_CLASSES = (
    ("scout", "Scout", "offense"),
    ("soldier", "Soldier", "offense"),
    ("pyro", "Pyro", "offense"),
    ("demoman", "Demoman", "defense"),
    ("heavy", "Heavy", "defense"),
    ("engineer", "Engineer", "defense"),
    ("medic", "Medic", "support"),
    ("sniper", "Sniper", "support"),
    ("spy", "Spy", "support"),
)


class Tf2Module(GameModule):
    metadata = ModuleMetadata(
        game_id="tf2",
        name="Team Fortress 2",
        short_name="TF2",
        accent="#e8a45b",
        status="available",
        description="Escuadras de hasta seis jugadores con las nueve clases oficiales.",
        source="Catálogo offline",
        view="GameTf2Page.qml",
    )

    def __init__(self, asset_root: str, state: dict[str, Any] | None = None) -> None:
        self.asset_root = asset_root.replace("\\", "/")
        super().__init__(state)
        self.state["mode"] = "mercenaries"

    def default_state(self) -> dict[str, Any]:
        return {
            "mode": "mercenaries",
            "allow_duplicates": False,
            "slots": [
                {
                    "id": f"tf2-slot-{index + 1}",
                    "name": f"Jugador {index + 1}",
                    "profileId": "",
                    "profileName": "",
                    "roles": ["offense", "defense", "support"],
                    "blocked": [],
                    "locked": False,
                    "hero": None,
                }
                for index in range(3)
            ],
        }

    def restore(self, payload: dict[str, Any]) -> None:
        super().restore(payload)
        valid_roles = {"offense", "defense", "support"}
        for slot in self.state.get("slots", []):
            roles = [role for role in slot.get("roles", valid_roles) if role in valid_roles]
            slot["roles"] = roles or sorted(valid_roles)

    def catalog(self) -> list[dict[str, Any]]:
        return [
            {
                "key": f"tf2-{key}",
                "name": name,
                "role": role,
                "side": "mercenary",
                "portrait": f"{self.asset_root}/{key}.jpg",
            }
            for key, name, role in TF2_CLASSES
        ]

    def generate(self, target: str = "all") -> list[dict[str, Any]]:
        used = {
            str(slot.get("hero", {}).get("key"))
            for slot in self.state["slots"]
            if slot.get("locked") and slot.get("hero")
        }
        roster = self.catalog()
        for slot in self.state["slots"]:
            if slot.get("locked"):
                continue
            roles = set(slot.get("roles", {"offense", "defense", "support"}))
            slot_roster = [hero for hero in roster if hero["role"] in roles]
            hero = choose(
                slot_roster,
                set(slot.get("blocked", [])),
                used,
                bool(self.state["allow_duplicates"]),
            )
            slot["hero"] = hero
            if hero:
                used.add(hero["key"])
        return self.state["slots"]

    def reroll(self, slot_id: str) -> dict[str, Any] | None:
        used = {
            str(slot.get("hero", {}).get("key"))
            for slot in self.state["slots"]
            if slot.get("id") != slot_id and slot.get("hero")
        }
        for slot in self.state["slots"]:
            if slot.get("id") != slot_id:
                continue
            current = str(slot.get("hero", {}).get("key", ""))
            roles = set(slot.get("roles", {"offense", "defense", "support"}))
            hero = choose(
                [entry for entry in self.catalog() if entry["role"] in roles],
                set(slot.get("blocked", [])) | ({current} if current else set()),
                used,
                bool(self.state["allow_duplicates"]),
            )
            slot["hero"] = hero
            return hero
        return None
