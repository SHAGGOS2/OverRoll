"""Build offline catalog snapshots for optional OverRoll game modules.

The app never calls these services while selecting a team. This tool is only
used by maintainers to refresh the bundled JSON and portrait files.
"""

from __future__ import annotations

import json
import re
import shutil
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "data" / "assets" / "games"
USER_AGENT = "OverRoll catalog snapshot/2.4 (+offline randomizer)"


def request(url: str) -> bytes:
    headers = {"User-Agent": USER_AGENT, "Accept": "application/json,text/html,*/*"}
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30) as response:
        return response.read()


def read_json(url: str) -> Any:
    return json.loads(request(url).decode("utf-8"))


def slug(value: str) -> str:
    clean = re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-")
    return clean or "entry"


def download(url: str, target: Path) -> str:
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_suffix(target.suffix + ".tmp")
    temporary.write_bytes(request(url))
    temporary.replace(target)
    return target.name


def write_catalog(game_id: str, payload: dict[str, Any]) -> None:
    directory = ASSET_ROOT / game_id
    directory.mkdir(parents=True, exist_ok=True)
    target = directory / "catalog.json"
    temporary = target.with_suffix(".json.tmp")
    temporary.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    temporary.replace(target)


def build_valorant() -> None:
    endpoint = "https://valorant-api.com/v1/agents?isPlayableCharacter=true"
    payload = read_json(endpoint)
    directory = ASSET_ROOT / "valorant"
    heroes: list[dict[str, Any]] = []
    for row in payload.get("data", []):
        name = str(row.get("displayName", "")).strip()
        role = str((row.get("role") or {}).get("displayName", "")).casefold()
        portrait_url = str(row.get("displayIcon") or row.get("fullPortraitV2") or "")
        if not name or role not in {"duelist", "controller", "initiator", "sentinel"}:
            continue
        key = slug(name)
        portrait = download(portrait_url, directory / f"{key}.png")
        heroes.append(
            {
                "key": key,
                "name": name,
                "role": role,
                "portrait": portrait,
            }
        )
    write_catalog(
        "valorant",
        {
            "schema_version": 1,
            "source": endpoint,
            "heroes": sorted(heroes, key=lambda item: (item["role"], item["name"])),
        },
    )


def deadlock_portrait(row: dict[str, Any]) -> str:
    images = row.get("images") if isinstance(row.get("images"), dict) else {}
    for key in (
        "icon_hero_card",
        "icon_image_small",
        "icon_image_large",
        "selection_image",
    ):
        value = images.get(key)
        if value:
            return str(value)
    for key in ("icon", "image", "portrait"):
        if row.get(key):
            return str(row[key])
    return ""


def build_deadlock() -> None:
    endpoint = "https://assets.deadlock-api.com/v2/heroes?language=english"
    payload = read_json(endpoint)
    rows = payload.get("heroes", payload) if isinstance(payload, dict) else payload
    directory = ASSET_ROOT / "deadlock"
    heroes: list[dict[str, Any]] = []
    for row in rows if isinstance(rows, list) else []:
        if not isinstance(row, dict) or row.get("disabled") is True:
            continue
        name = str(row.get("name") or row.get("class_name") or "").strip()
        portrait_url = deadlock_portrait(row)
        if not name or not portrait_url:
            continue
        key = slug(name)
        extension = Path(urllib.parse.urlparse(portrait_url).path).suffix or ".png"
        portrait = download(portrait_url, directory / f"{key}{extension}")
        heroes.append(
            {
                "key": key,
                "name": name,
                "role": "hero",
                "portrait": portrait,
            }
        )
    write_catalog(
        "deadlock",
        {
            "schema_version": 1,
            "source": endpoint,
            "heroes": sorted(heroes, key=lambda item: item["name"]),
        },
    )


LAST_FLAG = (
    ("knives", "Knives", "assassin"),
    ("lumberjack", "Lumberjack", "tank"),
    ("bounty-hunter", "Bounty Hunter", "all-rounder"),
    ("scout", "Scout", "recon"),
    ("arsenal", "Arsenal", "area-control"),
    ("banshee", "Banshee", "support"),
    ("roadie", "Roadie", "crowd-control"),
    ("skyfire", "Skyfire", "offensive"),
    ("tango", "Tango", "control"),
)


def page_image(html: str, base_url: str) -> str:
    patterns = (
        r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)',
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']',
        r'<img[^>]+alt=["\'][^"\']+["\'][^>]+src=["\']([^"\']+)',
    )
    for pattern in patterns:
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            return urllib.parse.urljoin(base_url, match.group(1))
    return ""


def build_last_flag() -> None:
    directory = ASSET_ROOT / "lastflag"
    heroes: list[dict[str, Any]] = []
    for key, name, role in LAST_FLAG:
        page_url = f"https://lastflag.wiki/characters/{key}"
        html = request(page_url).decode("utf-8", errors="replace")
        portrait_url = page_image(html, page_url)
        portrait = ""
        if portrait_url:
            extension = Path(urllib.parse.urlparse(portrait_url).path).suffix or ".webp"
            portrait = download(portrait_url, directory / f"{key}{extension}")
        heroes.append(
            {
                "key": key,
                "name": name,
                "role": role,
                "portrait": portrait,
            }
        )
    write_catalog(
        "lastflag",
        {
            "schema_version": 1,
            "source": "https://lastflag.wiki/characters",
            "heroes": heroes,
        },
    )


def main() -> None:
    ASSET_ROOT.mkdir(parents=True, exist_ok=True)
    for builder in (build_valorant, build_deadlock, build_last_flag):
        print(f"[snapshot] {builder.__name__.removeprefix('build_')}", flush=True)
        builder()
    print("[snapshot] complete", flush=True)


if __name__ == "__main__":
    main()
