# -*- coding: utf-8 -*-
"""Download a local Overwatch data snapshot for OverRoll.

The app imports this module only when the user presses the update button.
Normal use reads the local JSON snapshot and performs no network requests.
"""

from __future__ import annotations

import json
import os
import re
import time
import urllib.request
from urllib.error import URLError
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit


API_ROOT = "https://overfast-api.tekrop.fr"
APP_DIR = Path(os.environ.get("OWRP_APP_DIR", Path(__file__).resolve().parents[1]))
OUTPUT_PATH = APP_DIR / "data" / "heroes_snapshot.json"
ASSET_DIR = APP_DIR / "data" / "assets"
LOCALES = [locale.strip().lower() for locale in os.environ.get("OWRP_LOCALES", "en-us,es-mx,es-es").split(",") if locale.strip()]
BASE_LOCALE = LOCALES[0] if LOCALES else "en-us"
MAX_JSON_BYTES = 8_000_000
MAX_ASSET_BYTES = 6_000_000


def _require_https(url: str) -> None:
    parsed = urlsplit(url)
    if parsed.scheme.lower() != "https" or not parsed.hostname:
        raise ValueError("Solo se permiten descargas HTTPS.")


def _read_limited(response: Any, limit: int) -> bytes:
    payload = response.read(limit + 1)
    if len(payload) > limit:
        raise ValueError("La respuesta remota excede el limite permitido.")
    return payload


def fetch_json(url: str) -> Any:
    last_error = None
    for attempt in range(3):
        try:
            return _fetch_json_once(url)
        except (TimeoutError, URLError) as exc:
            last_error = exc
            wait = attempt + 1
            print(f"  Reintentando en {wait}s: {url}")
            time.sleep(wait)
    raise last_error or RuntimeError(f"No se pudo descargar {url}")


def _fetch_json_once(url: str) -> Any:
    _require_https(url)
    request = urllib.request.Request(url, headers={"User-Agent": "OWRPSnapshot/2.0"})
    with urllib.request.urlopen(request, timeout=45) as response:
        return json.loads(_read_limited(response, MAX_JSON_BYTES).decode("utf-8"))


def fetch_bytes(url: str) -> bytes:
    _require_https(url)
    request = urllib.request.Request(url, headers={"User-Agent": "OWRPSnapshot/2.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        content_type = response.headers.get("Content-Type", "").lower()
        if content_type and not content_type.startswith("image/"):
            raise ValueError("El recurso remoto no es una imagen.")
        return _read_limited(response, MAX_ASSET_BYTES)


def save_asset(url: str | None, relative_path: str) -> str:
    if not url:
        return ""
    relative = Path(relative_path)
    if relative.is_absolute() or ".." in relative.parts:
        return ""
    root = APP_DIR.resolve()
    output_path = (root / relative).resolve()
    try:
        output_path.relative_to(root)
    except ValueError:
        return ""
    if output_path.exists() and output_path.stat().st_size > 0:
        return relative_path
    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_bytes(fetch_bytes(url))
        return relative_path
    except Exception as exc:
        print(f"  No se pudo guardar imagen: {url} ({exc})")
        return ""


def with_local_icons(hero_key: str, group: str, perks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    localized = []
    for index, perk in enumerate(perks, start=1):
        copy = dict(perk)
        perk_key = slug(copy.get("name", f"{group}-{index}"))
        copy["icon_path"] = save_asset(
            copy.get("icon"),
            f"data/assets/perks/{hero_key}_{group}_{index:02d}_{perk_key}.png",
        )
        localized.append(copy)
    return localized


def localized_url(path: str, locale: str) -> str:
    return f"{API_ROOT}{path}?locale={locale}"


def attach_perk_localizations(items: list[dict[str, Any]], localized_items: list[dict[str, Any]], locale: str) -> None:
    for index, item in enumerate(items):
        if index >= len(localized_items):
            continue
        localized = localized_items[index] or {}
        item.setdefault("localizations", {})[locale] = {
            "name": localized.get("name") or item.get("name", ""),
            "description": localized.get("description") or item.get("description", ""),
        }


def main() -> None:
    print(f"Locales: {', '.join(LOCALES)}")
    heroes = fetch_json(localized_url("/heroes", BASE_LOCALE))
    snapshot_heroes = []

    for index, hero in enumerate(heroes, start=1):
        key = hero.get("key") or slug(hero.get("name", ""))
        print(f"[{index:02d}/{len(heroes):02d}] {hero.get('name', key)}")
        try:
            detail = fetch_json(localized_url(f"/heroes/{key}", BASE_LOCALE))
        except Exception:
            detail = {}

        merged = {
            "key": key,
            "name": detail.get("name") or hero.get("name"),
            "localizations": {
                BASE_LOCALE: {
                    "name": detail.get("name") or hero.get("name") or key,
                }
            },
            "role": detail.get("role") or hero.get("role"),
            "subrole": detail.get("subrole") or hero.get("subrole") or "",
            "gamemodes": hero.get("gamemodes") or detail.get("gamemodes") or ["quickplay"],
            "portrait": detail.get("portrait") or hero.get("portrait") or "",
            "portrait_path": save_asset(
                detail.get("portrait") or hero.get("portrait"),
                f"data/assets/heroes/{key}.png",
            ),
        }
        perks = detail.get("perks") or {}
        merged["perks"] = {
            "minor": with_local_icons(key, "minor", perks.get("minor") or []),
            "major": with_local_icons(key, "major", perks.get("major") or []),
        }
        merged["stadium_powers"] = with_local_icons(
            key,
            "stadium",
            detail.get("stadium_powers") or [],
        )
        attach_perk_localizations(merged["perks"]["minor"], perks.get("minor") or [], BASE_LOCALE)
        attach_perk_localizations(merged["perks"]["major"], perks.get("major") or [], BASE_LOCALE)
        attach_perk_localizations(merged["stadium_powers"], detail.get("stadium_powers") or [], BASE_LOCALE)

        for locale in LOCALES[1:]:
            try:
                localized_detail = fetch_json(localized_url(f"/heroes/{key}", locale))
            except Exception as exc:
                print(f"  No se pudo cargar locale {locale}: {exc}")
                continue
            merged["localizations"][locale] = {
                "name": localized_detail.get("name") or merged["name"],
            }
            localized_perks = localized_detail.get("perks") or {}
            attach_perk_localizations(merged["perks"]["minor"], localized_perks.get("minor") or [], locale)
            attach_perk_localizations(merged["perks"]["major"], localized_perks.get("major") or [], locale)
            attach_perk_localizations(merged["stadium_powers"], localized_detail.get("stadium_powers") or [], locale)
            time.sleep(0.03)
        snapshot_heroes.append(merged)
        time.sleep(0.05)

    payload = {
        "source": "OverFast API snapshot",
        "api_root": API_ROOT,
        "locales": LOCALES,
        "base_locale": BASE_LOCALE,
        "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "heroes": sorted(snapshot_heroes, key=lambda item: (item.get("role", ""), item.get("name", ""))),
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nSnapshot guardado en: {OUTPUT_PATH}")
    print(f"Héroes guardados: {len(snapshot_heroes)}")


def slug(name: str) -> str:
    value = name.lower().replace(":", "").replace(".", "").replace(" ", "-")
    value = re.sub(r'[<>"/\\|?*]', "", value)
    return value


if __name__ == "__main__":
    main()
