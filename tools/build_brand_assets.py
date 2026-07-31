from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "branding" / "overroll_logo_source.png"
ASSET_DIR = ROOT / "data" / "assets"
FONT_DIR = ROOT / "assets" / "fonts"


def fitted_logo(source: Image.Image, size: int, padding: int) -> Image.Image:
    image = source.convert("RGBA")

    # The supplied image has a small creator badge outside the actual mark.
    if image.width >= 1500 and image.height >= 1500:
        transparent = Image.new("RGBA", (image.width - 1470, image.height - 1470))
        image.paste(transparent, (1470, 1470))

    bounds = image.getbbox()
    if bounds:
        image = image.crop(bounds)

    # Keep the supplied mark readable at Windows' 16-48 px icon sizes. The
    # original dark lower gradient otherwise looks nearly black in the app.
    alpha = image.getchannel("A")
    gold = Image.new("RGBA", image.size)
    pixels = gold.load()
    denominator = max(1, image.height - 1)
    for y in range(image.height):
        ratio = y / denominator
        top = (255, 232, 156)
        bottom = (232, 145, 20)
        color = tuple(round(top[channel] * (1 - ratio) + bottom[channel] * ratio) for channel in range(3))
        for x in range(image.width):
            pixels[x, y] = (*color, alpha.getpixel((x, y)))
    image = gold
    available = size - padding * 2
    image.thumbnail((available, available), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size))
    canvas.alpha_composite(image, ((size - image.width) // 2, (size - image.height) // 2))
    return canvas


def font(name: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    path = FONT_DIR / name
    return ImageFont.truetype(path, size) if path.exists() else ImageFont.load_default()


def main() -> None:
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE)
    icon = fitted_logo(source, 512, 22)
    icon.save(ASSET_DIR / "app_icon.png", optimize=True)
    icon.save(
        ASSET_DIR / "app_icon.ico",
        sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )

    splash = Image.new("RGBA", (720, 400), "#06111f")
    draw = ImageDraw.Draw(splash)
    draw.rectangle((0, 396, 720, 399), fill="#f5a623")
    splash_logo = fitted_logo(source, 212, 10)
    splash.alpha_composite(splash_logo, (254, 32))

    title_font = font("Rajdhani-Bold.ttf", 58)
    subtitle_font = font("OpenSans-SemiBold.ttf", 18)
    title = "OVERROLL"
    subtitle = "RANDOM HERO PICKER"
    title_box = draw.textbbox((0, 0), title, font=title_font)
    subtitle_box = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    draw.text(((720 - (title_box[2] - title_box[0])) / 2, 246), title, font=title_font, fill="#f7f9fc")
    draw.text(((720 - (subtitle_box[2] - subtitle_box[0])) / 2, 318), subtitle, font=subtitle_font, fill="#59c8ff")
    splash.convert("RGB").save(ASSET_DIR / "splash.png", optimize=True)


if __name__ == "__main__":
    main()
