from pathlib import Path

from PIL import Image


root = Path(__file__).resolve().parents[1]
splash = Image.open(root / "data" / "assets" / "splash.png").convert("RGBA")

# Use the exact mark shown by the splash, excluding its title and orange footer.
mark = splash.crop((235, 18, 485, 248))
pixels = mark.load()
for y in range(mark.height):
    for x in range(mark.width):
        red, green, blue, _ = pixels[x, y]
        # The splash background is blue-black; the mark is warm yellow/orange.
        alpha = max(0, min(255, (red - blue - 3) * 9))
        pixels[x, y] = (red, green, blue, alpha)

bounds = mark.getbbox()
mark = mark.crop(bounds)
side = max(mark.size)
padding = max(10, side // 18)
canvas = Image.new("RGBA", (side + padding * 2, side + padding * 2), (0, 0, 0, 0))
canvas.alpha_composite(mark, ((canvas.width - mark.width) // 2, (canvas.height - mark.height) // 2))

output = root / "data" / "assets"
icon = canvas.resize((512, 512), Image.Resampling.LANCZOS)
icon.save(output / "app_icon.png", optimize=True)
icon.save(
    output / "app_icon.ico",
    format="ICO",
    sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
)
