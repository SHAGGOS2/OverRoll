"""Compatibility wrapper for the existing Overwatch implementation."""

from __future__ import annotations

from typing import Any

from .base import GameModule, ModuleMetadata


class OverwatchModule(GameModule):
    metadata = ModuleMetadata(
        game_id="overwatch",
        name="Overwatch",
        short_name="OW2",
        accent="#f6a21a",
        status="available",
        description="Selector completo con roles, perks, Stadium, perfiles y ruleta.",
        source="Snapshot local + actualización manual",
        view="",
    )

    def default_state(self) -> dict[str, Any]:
        return {}

    def catalog(self) -> list[dict[str, Any]]:
        return []

    def generate(self, target: str = "all") -> list[dict[str, Any]]:
        return []

    def reroll(self, slot_id: str) -> dict[str, Any] | None:
        return None
