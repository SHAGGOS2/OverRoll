from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import unicodedata
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / "data" / "sounds" / "heroes" / "es-mx" / "latam"
MANIFEST = ROOT / "data" / "sounds" / "heroes" / "es-mx" / "latam_manifest.json"
SNAPSHOT = ROOT / "data" / "heroes_snapshot.json"

ALIASES = {
    "briggite": "brigitte",
    "dva": "dva",
    "junkerqueen": "junker-queen",
    "roadhog": "roadhog",
    "soldado76": "soldier-76",
    "torbjorn": "torbjorn",
    "wreckingball": "wrecking-ball",
}


def normalized(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    return "".join(character for character in value.lower() if character.isalnum())


def classify(path: Path) -> tuple[str, bool]:
    stem = path.stem.strip()
    nano = bool(re.search(r"\bnano(?:-\d+)?\b", stem, re.IGNORECASE))
    stem = re.sub(r"\s+nano(?:-\d+)?\s*$", "", stem, flags=re.IGNORECASE)
    stem = re.sub(r"\s*-\d+\s*$", "", stem)
    return normalized(stem), nano


def main() -> None:
    parser = argparse.ArgumentParser(description="Importa las voces LATAM de OverRoll.")
    parser.add_argument("source", type=Path)
    args = parser.parse_args()

    snapshot = json.loads(SNAPSHOT.read_text(encoding="utf-8"))
    keys = {str(hero["key"]) for hero in snapshot.get("heroes", [])}
    lookup = {normalized(key): key for key in keys}
    lookup.update(ALIASES)

    DESTINATION.mkdir(parents=True, exist_ok=True)
    manifest: dict[str, dict[str, list[str]]] = {}
    unmatched: list[str] = []

    sources = [item for item in args.source.iterdir() if item.suffix.lower() in {".mp3", ".mp4"}]
    for source in sorted(sources, key=lambda item: item.name.casefold()):
        base, nano = classify(source)
        hero_key = lookup.get(base)
        if not hero_key:
            unmatched.append(source.name)
            continue
        group = "main" if nano else "regular"
        entries = manifest.setdefault(hero_key, {"regular": [], "main": []})[group]
        target_dir = DESTINATION / hero_key
        target_dir.mkdir(parents=True, exist_ok=True)
        target = target_dir / f"{group}_{len(entries):02d}.mp3"
        if source.suffix.lower() == ".mp4":
            import imageio_ffmpeg

            subprocess.run(
                [imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-i", str(source), "-vn", "-codec:a", "libmp3lame", "-q:a", "2", str(target)],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        else:
            shutil.copy2(source, target)
        entries.append(target.relative_to(ROOT).as_posix())

    payload = {"locale": "es-mx", "heroes": manifest}
    MANIFEST.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    imported = sum(len(group) for hero in manifest.values() for group in hero.values())
    print(f"Importados: {imported}; heroes: {len(manifest)}; sin asignar: {len(unmatched)}")
    for name in unmatched:
        print(f"SIN ASIGNAR: {name}")


if __name__ == "__main__":
    main()
