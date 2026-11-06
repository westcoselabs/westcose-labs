"""Normalize the approved imagegen sheets; preserve alpha and fit stable square pivots."""
from pathlib import Path
import argparse
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument("source", type=Path)
args = parser.parse_args()
target = Path(__file__).resolve().parents[1] / "public/games/low-tide-loot"
target.mkdir(parents=True, exist_ok=True)

def save_sprite(image, name, size):
    image = image.convert("RGBA")
    # Ignore nearly invisible generation noise when finding the content bounds.
    bounds = image.getchannel("A").point(lambda a: 255 if a > 32 else 0).getbbox()
    assert bounds, f"Empty sprite: {name}"
    image = image.crop(bounds)
    image.thumbnail((size - 12, size - 12), Image.Resampling.LANCZOS)
    output = Image.new("RGBA", (size, size))
    output.alpha_composite(image, ((size - image.width) // 2, (size - image.height) // 2))
    output.save(target / f"{name}.webp", quality=92, method=6)
    print(name, output.size, (target / f"{name}.webp").stat().st_size)

save_sprite(Image.open(args.source / "exec-b0b742f5-6f97-4ffb-ad42-898a77f42bba.png"), "scavenger-buggy", 512)
for filename, cols, rows, names in [
    ("exec-ab265154-d20b-4b0f-905c-5eb2695a394d.png", 4, 3,
     "cash gold watch cooler concrete tire anchor towel board flipflop motel ring".split()),
    ("exec-2c06ef87-596a-43c0-9cda-17846bdea61d.png", 5, 2,
     "silver phone camera shades wallet earbuds keys crab jewelryCrab drive".split()),
]:
    sheet = Image.open(args.source / filename)
    for i, name in enumerate(names):
        x, y = i % cols, i // cols
        tile = sheet.crop((round(x * sheet.width / cols), round(y * sheet.height / rows),
                           round((x + 1) * sheet.width / cols), round((y + 1) * sheet.height / rows)))
        save_sprite(tile, f"loot-{name}", 192)
