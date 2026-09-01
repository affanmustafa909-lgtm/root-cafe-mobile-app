"""Generate Roots Cafe app icons from the provided logo."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
RES = ROOT / "android" / "app" / "src" / "main" / "res"
SOURCE = ASSETS / "logo-source.png"
BLACK = (0, 0, 0, 255)

MIPMAP_LEGACY = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}
MIPMAP_ADAPTIVE = {
    "mdpi": 108,
    "hdpi": 162,
    "xhdpi": 216,
    "xxhdpi": 324,
    "xxxhdpi": 432,
}
SPLASH = {
    "mdpi": 288,
    "hdpi": 432,
    "xhdpi": 576,
    "xxhdpi": 864,
    "xxxhdpi": 1152,
}


def crop_content(im: Image.Image, threshold: int = 25, pad: int = 12) -> Image.Image:
    pixels = im.load()
    w, h = im.size
    minx, miny, maxx, maxy = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a > 20 and (r > threshold or g > threshold or b > threshold):
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
    minx = max(0, minx - pad)
    miny = max(0, miny - pad)
    maxx = min(w, maxx + pad + 1)
    maxy = min(h, maxy + pad + 1)
    return im.crop((minx, miny, maxx, maxy))


def fit_on_canvas(
    logo: Image.Image,
    size: int,
    fill_ratio: float,
    background: tuple[int, int, int, int] | None,
) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), background or (0, 0, 0, 0))
    max_w = int(size * fill_ratio)
    max_h = int(size * fill_ratio)
    lw, lh = logo.size
    scale = min(max_w / lw, max_h / lh)
    new_size = (max(1, int(lw * scale)), max(1, int(lh * scale)))
    fitted = logo.resize(new_size, Image.Resampling.LANCZOS)
    x = (size - new_size[0]) // 2
    y = (size - new_size[1]) // 2
    canvas.paste(fitted, (x, y), fitted)
    return canvas


def make_monochrome(logo: Image.Image, size: int, fill_ratio: float) -> Image.Image:
    base = fit_on_canvas(logo, size, fill_ratio, None)
    pixels = base.load()
    w, h = base.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a < 20:
                pixels[x, y] = (0, 0, 0, 0)
                continue
            luma = 0.299 * r + 0.587 * g + 0.114 * b
            if luma < 18:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                pixels[x, y] = (255, 255, 255, min(255, int(a * (luma / 255) * 1.35 + 40)))
    return base.filter(ImageFilter.SMOOTH)


def save_png(im: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, format="PNG", optimize=True)


def save_webp(im: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, format="WEBP", quality=95, method=6)


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    logo = crop_content(source)

    icon = fit_on_canvas(logo, 1024, 0.86, BLACK)
    splash = fit_on_canvas(logo, 1024, 0.78, BLACK)
    foreground = fit_on_canvas(logo, 1024, 0.62, None)
    background = Image.new("RGBA", (1024, 1024), BLACK)
    monochrome = make_monochrome(logo, 1024, 0.62)
    favicon = fit_on_canvas(logo, 96, 0.88, BLACK)

    save_png(source, ASSETS / "logo-source.png")
    save_png(icon, ASSETS / "icon.png")
    save_png(splash, ASSETS / "splash-icon.png")
    save_png(foreground, ASSETS / "android-icon-foreground.png")
    save_png(background, ASSETS / "android-icon-background.png")
    save_png(monochrome, ASSETS / "android-icon-monochrome.png")
    save_png(favicon, ASSETS / "favicon.png")

    for dens, size in MIPMAP_LEGACY.items():
        launcher = fit_on_canvas(logo, size, 0.86, BLACK)
        folder = RES / f"mipmap-{dens}"
        save_webp(launcher, folder / "ic_launcher.webp")
        save_webp(launcher, folder / "ic_launcher_round.webp")

    for dens, size in MIPMAP_ADAPTIVE.items():
        folder = RES / f"mipmap-{dens}"
        save_webp(fit_on_canvas(logo, size, 0.62, None), folder / "ic_launcher_foreground.webp")
        save_webp(Image.new("RGBA", (size, size), BLACK), folder / "ic_launcher_background.webp")
        save_webp(make_monochrome(logo, size, 0.62), folder / "ic_launcher_monochrome.webp")

    for dens, size in SPLASH.items():
        save_png(
            fit_on_canvas(logo, size, 0.78, BLACK),
            RES / f"drawable-{dens}" / "splashscreen_logo.png",
        )

    print("Generated Roots Cafe icons from", SOURCE.name)
    print("Logo crop size:", logo.size)


if __name__ == "__main__":
    main()
