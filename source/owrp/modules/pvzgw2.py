"""Offline Plants vs. Zombies: Garden Warfare 2 selector."""

from __future__ import annotations

import random
import re
from pathlib import Path
from typing import Any

from .base import GameModule, ModuleMetadata
from .selection import choose


PVZ_GROUPS = (
    ("plants", "citron", "Citron", 1, 6),
    ("plants", "rose", "Rose", 7, 12),
    ("plants", "kernel-corn", "Kernel Corn", 13, 18),
    ("plants", "peashooter", "Peashooter", 19, 28),
    ("plants", "chomper", "Chomper", 29, 40),
    ("plants", "sunflower", "Sunflower", 41, 50),
    ("plants", "cactus", "Cactus", 51, 60),
    ("plants", "torchwood", "Torchwood", 61, 61),
    ("zombies", "imp", "Imp", 1, 7),
    ("zombies", "super-brainz", "Super Brainz", 8, 13),
    ("zombies", "captain-deadbeard", "Captain Deadbeard", 14, 19),
    ("zombies", "foot-soldier", "Foot Soldier", 20, 29),
    ("zombies", "engineer", "Engineer", 30, 39),
    ("zombies", "scientist", "Scientist", 40, 49),
    ("zombies", "all-star", "All-Star", 50, 59),
    ("zombies", "hover-goat-3000", "Hover Goat-3000", 60, 60),
)

DLC_SLUGS = {
    "plant-61-torchwood",
    "plant-39-unicorn-chomper",
    "plant-40-twilight-chomper",
    "zombie-5-z7-imp",
    "zombie-60-hover-goat-3000",
}

NAME_OVERRIDES = {
    "plant-12-nec-rose": "Nec'Rose",
    "plant-14-bbq-corn": "BBQ Corn",
    "zombie-2-lil--drake": "Lil' Drake",
    "zombie-5-z7-imp": "Z7 Imp",
    "zombie-24-general-surpremo": "General Supremo",
    "zombie-39-ac-perry": "AC Perry",
    "zombie-42-dr-toxic": "Dr. Toxic",
    "zombie-60-hover-goat-3000": "Hover Goat-3000",
}


def display_name(slug: str) -> str:
    if slug in NAME_OVERRIDES:
        return NAME_OVERRIDES[slug]
    value = re.sub(r"^(plant|zombie)-\d+-", "", slug)
    return value.replace("--", "' ").replace("-", " ").title()


def slug_number(slug: str) -> int:
    match = re.match(r"^(?:plant|zombie)-(\d+)-", slug)
    return int(match.group(1)) if match else -1


class PvzGw2Module(GameModule):
    metadata = ModuleMetadata(
        game_id="pvzgw2",
        name="Plants vs. Zombies: Garden Warfare 2",
        short_name="PVZ GW2",
        accent="#75d66b",
        status="available",
        description="Escuadras de una facción con personaje base, variantes y contenido DLC.",
        source="Catálogo offline",
        view="GamePvzPage.qml",
    )

    def __init__(self, asset_dir: Path, state: dict[str, Any] | None = None) -> None:
        self.asset_dir = asset_dir.resolve()
        self.profile_rules: dict[str, dict[str, Any]] = {}
        self._catalog_cache: list[dict[str, Any]] | None = None
        super().__init__(state)

    def default_state(self) -> dict[str, Any]:
        return {
            "allow_duplicates": False,
            "use_variants": True,
            "include_dlc": True,
            "slots": [
                {
                    "id": f"pvz-slot-{index + 1}",
                    "name": f"Jugador {index + 1}",
                    "profileId": "",
                    "side": "plants",
                    "blocked": [],
                    "locked": False,
                    "hero": None,
                }
                for index in range(4)
            ],
        }

    def restore(self, payload: dict[str, Any]) -> None:
        super().restore(payload)
        valid_keys = {entry["key"] for entry in self.catalog()}
        for slot in self.state.get("slots", []):
            slot["side"] = slot.get("side") if slot.get("side") in {"plants", "zombies"} else "plants"
            slot["blocked"] = [
                key for key in slot.get("blocked", [])
                if key in valid_keys
            ]
            hero = slot.get("hero")
            if hero and (hero.get("key") not in valid_keys or not hero.get("variant")):
                slot["hero"] = None

    def catalog(self) -> list[dict[str, Any]]:
        if self._catalog_cache is not None:
            return self._catalog_cache
        assets: dict[tuple[str, int], Path] = {}
        for path in self.asset_dir.glob("*.png"):
            slug = path.stem
            side = "plants" if slug.startswith("plant-") else "zombies"
            assets[(side, slug_number(slug))] = path

        rows: list[dict[str, Any]] = []
        for side, base_key, base_name, start, end in PVZ_GROUPS:
            variants: list[dict[str, Any]] = []
            for number in range(start, end + 1):
                path = assets.get((side, number))
                if not path:
                    continue
                slug = path.stem
                variants.append({
                    "key": f"pvz-{slug}",
                    "name": "Predeterminado" if number == start else display_name(slug),
                    "portrait": path.as_uri(),
                    "isDlc": slug in DLC_SLUGS,
                })
            if not variants:
                continue
            rows.append({
                "key": f"pvz-{side}-{base_key}",
                "name": base_name,
                "role": side,
                "side": side,
                "portrait": variants[0]["portrait"],
                "variants": variants,
            })
        self._catalog_cache = rows
        return rows

    def _side_catalog(self, side: str) -> list[dict[str, Any]]:
        return [entry for entry in self.catalog() if entry["side"] == side]

    def _selection(self, slot: dict[str, Any], used: set[str], extra_blocked: set[str] | None = None) -> dict[str, Any] | None:
        side = str(slot.get("side", "plants"))
        blocked = set(slot.get("blocked", [])) | (extra_blocked or set())
        profile = self.profile_rules.get(str(slot.get("profileId", "")), {})
        collection = set(profile.get("collection", []))
        configured = bool(profile.get("collection_configured", False))
        profile_blocked = set(profile.get("blocked", []))
        favorites = set(profile.get("favorites", []))

        def variants_for(base: dict[str, Any]) -> list[dict[str, Any]]:
            variants = [
                dict(variant)
                for variant in base.get("variants", [])
                if (self.state.get("include_dlc", True) or not variant.get("isDlc"))
                and (not configured or variant.get("key") in collection)
                and variant.get("key") not in profile_blocked
            ]
            if not self.state.get("use_variants", True):
                variants = variants[:1]
            return variants

        roster = [
            base for base in self._side_catalog(side)
            if variants_for(base)
        ]
        base = choose(
            roster,
            blocked,
            used,
            bool(self.state["allow_duplicates"]),
        )
        if not base:
            return None
        variants = variants_for(base)
        if not variants:
            return None
        weights = [5 if variant.get("key") in favorites else 1 for variant in variants]
        variant = random.choices(variants, weights=weights, k=1)[0]
        base["variant"] = variant
        return base

    def generate(self, target: str = "all") -> list[dict[str, Any]]:
        if target in {"plants", "zombies"}:
            for slot in self.state["slots"]:
                if slot.get("side") != target:
                    slot["side"] = target
                    slot["hero"] = None
                    slot["locked"] = False
        elif target == "both":
            split = (len(self.state["slots"]) + 1) // 2
            indices = list(range(len(self.state["slots"])))
            previous = [slot.get("side") for slot in self.state["slots"]]
            for _ in range(8):
                random.shuffle(indices)
                plant_indices = set(indices[:split])
                proposal = [
                    "plants" if index in plant_indices else "zombies"
                    for index in range(len(self.state["slots"]))
                ]
                if proposal != previous or len(indices) <= 1:
                    break
            for index, slot in enumerate(self.state["slots"]):
                side = proposal[index]
                if slot.get("side") != side:
                    slot["side"] = side
                    slot["hero"] = None
                    slot["locked"] = False

        used: set[str] = set()
        for slot in self.state["slots"]:
            if slot.get("locked") and slot.get("hero"):
                used.add(str(slot["hero"].get("key", "")))
                continue
            hero = self._selection(slot, used)
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
            hero = self._selection(slot, used, {current} if current else set())
            slot["hero"] = hero
            return hero
        return None
