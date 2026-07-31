"""Offline THE FINALS loadout randomizer."""

from __future__ import annotations

import json
import random
import re
from pathlib import Path
from typing import Any

from .roster import RosterModule
from .base import ModuleMetadata


class TheFinalsModule(RosterModule):
    metadata = ModuleMetadata(
        game_id="thefinals",
        name="THE FINALS",
        short_name="FINALS",
        accent="#f4d447",
        status="available",
        description="Crea concursantes por tamano, arma, especializacion y tres artefactos.",
        source="Embark + THE FINALS Wiki snapshot local",
        view="GameRosterPage.qml",
    )
    default_players = 3
    max_players = 12
    role_labels = {"light": "Ligero", "medium": "Medio", "heavy": "Pesado"}
    role_colors = {"light": "#50d8ff", "medium": "#f4d447", "heavy": "#ff6b56"}

    def __init__(self, asset_dir: Path, state: dict[str, Any] | None = None) -> None:
        self.loadout_data: dict[str, Any] = {}
        try:
            self.loadout_data = json.loads(
                (asset_dir / "loadouts.json").read_text(encoding="utf-8")
            )
        except (OSError, json.JSONDecodeError):
            self.loadout_data = {}
        super().__init__(asset_dir, state)

    def catalog(self) -> list[dict[str, Any]]:
        if self._catalog_cache is not None:
            return self._catalog_cache
        rows: list[dict[str, Any]] = []
        for role, label in self.role_labels.items():
            rows.append(
                {
                    "key": role,
                    "name": label,
                    "role": role,
                    "side": "contestant",
                    "portrait": (self.asset_dir / f"{role}.svg").as_uri(),
                    "details": [],
                }
            )
        self._catalog_cache = rows
        return rows

    def _build_loadout(self, hero: dict[str, Any] | None) -> dict[str, Any] | None:
        if not hero:
            return None
        role = str(hero.get("role", ""))
        data = self.loadout_data.get(role, {})
        weapon = random.choice(data.get("weapons", ["Sin arma"]))
        specialization = random.choice(data.get("specializations", ["Sin especializacion"]))
        gadgets = list(data.get("gadgets", []))
        random.shuffle(gadgets)
        selected_gadgets = gadgets[:3]

        def item(name: str) -> dict[str, str]:
            slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
            icon_path = self.asset_dir / "items" / f"{slug}.webp"
            if not icon_path.is_file():
                icon_path = self.asset_dir / "items" / f"{slug}.png"
            return {
                "name": name,
                "icon": icon_path.as_uri() if icon_path.is_file() else "",
            }

        result = dict(hero)
        result["weapon"] = item(weapon)
        result["specialization"] = item(specialization)
        result["gadgets"] = [item(value) for value in selected_gadgets]
        result["details"] = [
            {"label": "ARMA", "value": weapon},
            {"label": "ESPECIALIZACION", "value": specialization},
            *[
                {"label": f"ARTEFACTO {index + 1}", "value": value}
                for index, value in enumerate(selected_gadgets)
            ],
        ]
        return result

    def generate(self, target: str = "all") -> list[dict[str, Any]]:
        super().generate(target)
        for slot in self.state["slots"]:
            if not slot.get("locked"):
                slot["hero"] = self._build_loadout(slot.get("hero"))
        return self.state["slots"]

    def reroll(self, slot_id: str) -> dict[str, Any] | None:
        hero = super().reroll(slot_id)
        for slot in self.state["slots"]:
            if slot.get("id") == slot_id:
                slot["hero"] = self._build_loadout(hero)
                return slot["hero"]
        return None
