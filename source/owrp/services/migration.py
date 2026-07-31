"""Versioned, rollback-safe migration for settings and universal profiles."""

from __future__ import annotations

import copy
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


SCHEMA_VERSION = 2


class MigrationService:
    def __init__(self, data_dir: Path) -> None:
        self.data_dir = data_dir
        self.backup_dir = data_dir / ".migration_backups"

    @staticmethod
    def _read(path: Path, fallback: Any) -> Any:
        try:
            return json.loads(path.read_text(encoding="utf-8")) if path.exists() else fallback
        except (OSError, json.JSONDecodeError):
            return fallback

    @staticmethod
    def _write(path: Path, payload: Any) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix(path.suffix + ".tmp")
        temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        temporary.replace(path)

    @staticmethod
    def _version(payload: Any) -> int:
        try:
            return int(payload.get("schema_version", 1)) if isinstance(payload, dict) else 1
        except (TypeError, ValueError):
            return 1

    def _backup(self, paths: list[Path]) -> Path:
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        target = self.backup_dir / stamp
        target.mkdir(parents=True, exist_ok=True)
        for path in paths:
            if path.exists():
                (target / path.name).write_bytes(path.read_bytes())
        return target

    def migrate(self) -> dict[str, Any]:
        settings_path = self.data_dir / "settings.json"
        profiles_path = self.data_dir / "profiles.json"
        state_path = self.data_dir / "game_state.json"
        settings = self._read(settings_path, {})
        profiles = self._read(profiles_path, {})
        state = self._read(state_path, {})

        if min(
            self._version(settings),
            self._version(profiles),
            self._version(state),
        ) >= SCHEMA_VERSION:
            return {"changed": False, "version": SCHEMA_VERSION}

        originals = {
            settings_path: copy.deepcopy(settings),
            profiles_path: copy.deepcopy(profiles),
            state_path: copy.deepcopy(state),
        }
        backup = self._backup(list(originals))
        try:
            settings["schema_version"] = SCHEMA_VERSION
            settings.setdefault("active_game", "overwatch")

            migrated_profiles: list[dict[str, Any]] = []
            for raw in profiles.get("profiles", []):
                if not isinstance(raw, dict):
                    continue
                item = copy.deepcopy(raw)
                legacy_heroes = item.pop("heroes", {})
                games = item.get("games") if isinstance(item.get("games"), dict) else {}
                games.setdefault("overwatch", {"heroes": legacy_heroes})
                games.setdefault("tf2", {"blocked": []})
                games.setdefault("pvzgw2", {"blocked": [], "collection": []})
                item["games"] = games
                migrated_profiles.append(item)
            profiles["profiles"] = migrated_profiles
            profiles["schema_version"] = SCHEMA_VERSION

            state["schema_version"] = SCHEMA_VERSION
            state.setdefault("active_game", settings["active_game"])
            state.setdefault("games", {})
            state["games"].setdefault("overwatch", {})
            state["games"].setdefault("tf2", {})
            state["games"].setdefault("pvzgw2", {})

            self._write(settings_path, settings)
            self._write(profiles_path, profiles)
            self._write(state_path, state)
        except Exception:
            for path, payload in originals.items():
                self._write(path, payload)
            raise
        return {"changed": True, "version": SCHEMA_VERSION, "backup": str(backup)}
