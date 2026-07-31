"""Build offline Paladins, FragPunk, and Apex catalogs from cached source pages.

The script deliberately separates metadata parsing from downloads. It writes a
curl config that can be reviewed before any network request is made.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import tempfile
from pathlib import Path
from typing import Any, Iterable


PALADINS_ROLES = {
    "frontline": (
        "Ash", "Atlas", "Azaan", "Barik", "Fernando", "Inara", "Khan",
        "Makoa", "Nyx", "Raum", "Ruckus", "Terminus", "Torvald", "Yagorath",
    ),
    "damage": (
        "Betty La Bomba", "Bomb King", "Cassie", "Dredge", "Drogoz", "Imani",
        "Kasumi", "Kinessa", "Lian", "Omen", "Octavia", "Saati", "Sha Lin",
        "Strix", "Tiberius", "Tyra", "Viktor", "Vivian", "Willo",
    ),
    "flank": (
        "Androxus", "Buck", "Caspian", "Evie", "Koga", "Lex", "Maeve",
        "Skye", "Talus", "Vatu", "VII", "Vora", "Zhin",
    ),
    "support": (
        "Corvus", "Furia", "Grohk", "Grover", "Io", "Jenos", "Lillith",
        "Mal'Damba", "Moji", "Pip", "Rei", "Seris", "Ying",
    ),
}

FRAGPUNK_NAMES = {
    "calamity": "Calamity",
    "wildstyle": "Wildstyle",
    "fengxingzhe": "Windwalker",
    "feit": "Counterfeit",
    "ixchel": "Ixchel",
    "aura": "Aura",
    "hurricane": "Hurricane",
    "chum": "Chum",
    "hollowpoint": "Hollowpoint",
    "kismet": "Kismet",
    "serket": "Serket",
    "pathojen": "Pathojen",
    "zephyr": "Zephyr",
    "corona": "Corona",
    "broker": "Broker",
    "axon": "Axon",
    "jaguar": "Jaguar",
    "spider": "Spider",
    "sonar": "Sonar",
    "nitro": "Nitro",
    "dex": "Dex",
}


def slug(value: str) -> str:
    value = value.casefold().replace("'", "")
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")


def normalized(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.casefold())


def find_dict_with_items(value: Any) -> dict[str, Any] | None:
    if isinstance(value, dict):
        items = value.get("items")
        if isinstance(items, list) and items and all(
            isinstance(row, dict) and "slug" in row and "image" in row
            for row in items
        ):
            return value
        for child in value.values():
            found = find_dict_with_items(child)
            if found:
                return found
    elif isinstance(value, list):
        for child in value:
            found = find_dict_with_items(child)
            if found:
                return found
    return None


def parse_next_data(path: Path) -> list[dict[str, Any]]:
    source = path.read_text(encoding="utf-8")
    match = re.search(
        r'<script[^>]+id="__NEXT_DATA__"[^>]*>(.*?)</script>',
        source,
        flags=re.DOTALL,
    )
    if not match:
        raise RuntimeError(f"No se encontro __NEXT_DATA__ en {path}")
    payload = json.loads(html.unescape(match.group(1)))
    collection = find_dict_with_items(payload)
    if not collection:
        raise RuntimeError(f"No se encontro el catalogo de personajes en {path}")
    return list(collection["items"])


def build_apex(cache_dir: Path) -> tuple[dict[str, Any], list[tuple[str, str]]]:
    by_key: dict[str, dict[str, Any]] = {}
    for filename in ("apex_official.html", "apex_official_page2.html"):
        for raw in parse_next_data(cache_dir / filename):
            key = str(raw.get("slug", "")).strip()
            categories = raw.get("categories", [])
            role = str(categories[0].get("slug", "legend")) if categories else "legend"
            image = raw.get("image", {})
            url = str(image.get("ar1X1", "")).strip()
            if key and url:
                by_key[key] = {
                    "key": key,
                    "name": str(raw.get("name", key)).strip(),
                    "role": role,
                    "portrait": f"{key}.jpg",
                }
    heroes = sorted(by_key.values(), key=lambda row: (row["role"], row["name"]))
    downloads = [
        (str(next(
            raw.get("image", {}).get("ar1X1", "")
            for filename in ("apex_official.html", "apex_official_page2.html")
            for raw in parse_next_data(cache_dir / filename)
            if raw.get("slug") == row["key"]
        )), row["portrait"])
        for row in heroes
    ]
    return {
        "schema_version": 1,
        "source": "https://www.ea.com/games/apex-legends/apex-legends/characters-hub",
        "heroes": heroes,
    }, downloads


def build_fragpunk(cache_dir: Path) -> tuple[dict[str, Any], list[tuple[str, str]]]:
    css = (cache_dir / "fragpunk_index.css").read_text(encoding="utf-8")
    image_urls: dict[str, str] = {}
    pattern = re.compile(
        r"\.role-([a-z0-9-]+)(?![a-z0-9-])[^{]*\{[^}]*?"
        r"url\((https://www\.fragpunk\.com/[^)]+)\)",
        flags=re.IGNORECASE,
    )
    for match in pattern.finditer(css):
        key = match.group(1)
        if not key.startswith("stroke-") and key in FRAGPUNK_NAMES:
            image_urls[key] = match.group(2).strip("\"'")
    missing = sorted(set(FRAGPUNK_NAMES) - set(image_urls))
    if missing:
        raise RuntimeError(f"Faltan retratos de FragPunk: {', '.join(missing)}")
    heroes = [
        {
            "key": key,
            "name": name,
            "role": "lancer",
            "portrait": f"{key}.png",
        }
        for key, name in FRAGPUNK_NAMES.items()
    ]
    heroes.sort(key=lambda row: row["name"])
    return {
        "schema_version": 1,
        "source": "https://www.fragpunk.com/index.html",
        "heroes": heroes,
    }, [(image_urls[row["key"]], row["portrait"]) for row in heroes]


def build_paladins(cache_dir: Path) -> tuple[dict[str, Any], list[tuple[str, str]]]:
    payload = json.loads(
        (cache_dir / "paladins_fernando_images.json").read_text(encoding="utf-8")
    )
    images: dict[str, str] = {}
    for raw in payload.get("query", {}).get("pages", {}).values():
        title = str(raw.get("title", ""))
        match = re.fullmatch(r"File:Champion (.+?) Icon\.png", title, re.IGNORECASE)
        info = raw.get("imageinfo", [])
        if match and info:
            images[normalized(match.group(1))] = str(info[0].get("url", ""))

    heroes: list[dict[str, Any]] = []
    downloads: list[tuple[str, str]] = []
    for role, names in PALADINS_ROLES.items():
        for name in names:
            key = slug(name)
            url = images.get(normalized(name), "")
            if not url:
                raise RuntimeError(f"No se encontro el retrato de Paladins para {name}")
            portrait = f"{key}.png"
            heroes.append({
                "key": key,
                "name": name,
                "role": role,
                "portrait": portrait,
            })
            downloads.append((url, portrait))
    heroes.sort(key=lambda row: (row["role"], row["name"]))
    return {
        "schema_version": 1,
        "source": (
            "Hi-Rez Paladins API (catalog metadata; credentials required) + "
            "Paladins Wiki image cache"
        ),
        "heroes": heroes,
    }, downloads


def write_catalog(
    root: Path,
    game_id: str,
    payload: dict[str, Any],
    downloads: Iterable[tuple[str, str]],
) -> list[tuple[str, Path]]:
    target = root / game_id
    target.mkdir(parents=True, exist_ok=True)
    (target / "catalog.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return [(url, target / filename) for url, filename in downloads]


def write_curl_config(path: Path, rows: Iterable[tuple[str, Path]]) -> None:
    rows = list(rows)
    lines = ["fail", "location", "retry = 2", "connect-timeout = 15"]
    for index, (url, target) in enumerate(rows):
        lines.extend((
            f'url = "{url}"',
            f'output = "{target.resolve().as_posix()}"',
        ))
        if index < len(rows) - 1:
            lines.append("next")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--project",
        type=Path,
        default=Path(__file__).resolve().parents[1],
    )
    parser.add_argument(
        "--cache-dir",
        type=Path,
        default=Path(tempfile.gettempdir()),
    )
    args = parser.parse_args()

    asset_root = args.project.resolve() / "data" / "assets" / "games"
    all_downloads: list[tuple[str, Path]] = []
    for game_id, builder in (
        ("paladins", build_paladins),
        ("fragpunk", build_fragpunk),
        ("apex", build_apex),
    ):
        payload, downloads = builder(args.cache_dir.resolve())
        all_downloads.extend(write_catalog(asset_root, game_id, payload, downloads))
        print(f"{game_id}: {len(payload['heroes'])} personajes")

    manifest = args.project.resolve() / "tools" / "external-game-assets.curl"
    write_curl_config(manifest, all_downloads)
    print(f"Manifest de descarga: {manifest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
