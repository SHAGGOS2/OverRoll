from __future__ import annotations

import json
import re
import shutil
import subprocess
import tempfile
import urllib.parse
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / "data" / "sounds" / "heroes" / "en-us"
SOURCES_PATH = DESTINATION / "main_sources.json"
USER_AGENT = "OverRoll/2.3.3 (local voice snapshot builder)"

HERO_PAGES = {
    "dva": "D.Va",
    "junker-queen": "Junker Queen",
    "lucio": "Lúcio",
    "soldier-76": "Soldier: 76",
    "torbjorn": "Torbjörn",
    "wrecking-ball": "Wrecking Ball",
}


def request_json(params: dict[str, str]) -> dict:
    query = urllib.parse.urlencode({"format": "json", "formatversion": "2", **params})
    request = urllib.request.Request(
        f"https://overwatch.fandom.com/api.php?{query}",
        headers={"User-Agent": USER_AGENT},
    )
    with urllib.request.urlopen(request, timeout=35) as response:
        return json.load(response)


def page_title(hero_key: str) -> str:
    return HERO_PAGES.get(hero_key, hero_key.replace("-", " ").title())


def nano_audio_name(hero_key: str) -> tuple[str, str]:
    title = page_title(hero_key)
    payload = request_json({"action": "parse", "page": f"{title}/Quotes", "prop": "wikitext"})
    wikitext = payload["parse"]["wikitext"]
    match = re.search(r"Nano[- ]Boosted", wikitext, flags=re.IGNORECASE)
    if not match:
        raise RuntimeError(f"No Nano-Boosted section found for {title}")
    section = wikitext[match.end() : match.end() + 2600]
    audio = re.search(r"\{\{Audio\s*\|\s*([^}|]+\.ogg)", section, flags=re.IGNORECASE)
    if not audio:
        raise RuntimeError(f"No audio found after Nano-Boosted for {title}")
    filename = audio.group(1).strip()
    quote_block = section[: audio.start()]
    quote_lines = [
        line.strip(" |'")
        for line in quote_block.splitlines()
        if line.startswith("|") and not line.startswith("|-") and "rowspan" not in line
    ]
    quote = quote_lines[-1] if quote_lines else "Nano-Boosted voice line"
    quote = re.sub(r"<[^>]+>", "", quote).strip()
    return filename, quote


def media_url(filename: str) -> str:
    payload = request_json(
        {
            "action": "query",
            "titles": f"File:{filename}",
            "prop": "imageinfo",
            "iiprop": "url",
        }
    )
    pages = payload.get("query", {}).get("pages", [])
    if not pages or not pages[0].get("imageinfo"):
        raise RuntimeError(f"No media URL resolved for {filename}")
    return pages[0]["imageinfo"][0]["url"]


def ffmpeg_executable() -> str:
    executable = shutil.which("ffmpeg")
    if executable:
        return executable
    bundled_candidates = (
        Path(r"C:\Program Files (x86)\Steam\steamapps\common\REPO\BoomboxedCart\ffmpeg\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe"),
        Path(r"C:\Program Files\ffmpeg\bin\ffmpeg.exe"),
    )
    for candidate in bundled_candidates:
        if candidate.exists():
            return str(candidate)
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError as exc:
        raise RuntimeError("ffmpeg is required to convert the downloaded OGG files") from exc


def download_and_convert(url: str, target: Path, ffmpeg: str) -> None:
    with tempfile.NamedTemporaryFile(suffix=".ogg", delete=False) as temporary:
        request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(request, timeout=35) as response:
            temporary.write(response.read())
        temporary_path = Path(temporary.name)
    try:
        subprocess.run(
            [ffmpeg, "-y", "-i", str(temporary_path), "-vn", "-codec:a", "libmp3lame", "-q:a", "2", str(target)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    finally:
        temporary_path.unlink(missing_ok=True)


def main() -> None:
    snapshot = json.loads((ROOT / "data" / "heroes_snapshot.json").read_text(encoding="utf-8"))
    hero_keys = [hero["key"] for hero in snapshot.get("heroes", [])]
    sources = json.loads(SOURCES_PATH.read_text(encoding="utf-8"))
    resolved = sources.setdefault("heroes", {})
    ffmpeg = ffmpeg_executable()
    failures: list[str] = []

    for hero_key in hero_keys:
        target = DESTINATION / f"{hero_key}_nano.mp3"
        if target.exists() and target.stat().st_size > 1_000:
            print(f"SKIP {hero_key}")
            continue
        try:
            filename, quote = nano_audio_name(hero_key)
            url = media_url(filename)
            download_and_convert(url, target, ffmpeg)
            resolved[hero_key] = {"quote": quote, "url": url, "file": filename}
            print(f"OK   {hero_key}: {filename}")
        except Exception as exc:  # Keep the useful partial snapshot if a new hero has no page yet.
            failures.append(f"{hero_key}: {exc}")
            print(f"MISS {hero_key}: {exc}")

    sources["source"] = "Overwatch Wiki quote pages (English Nano-Boosted lines)"
    sources["missing"] = failures
    SOURCES_PATH.write_text(json.dumps(sources, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if failures:
        print("\nUnresolved:")
        print("\n".join(failures))


if __name__ == "__main__":
    main()
