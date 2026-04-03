#!/usr/bin/env python3
"""Regenerate Apple PWA splash screens from the app icon (black background)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ICON_CANDIDATES = [
	ROOT / "static/img/icons/android-icon-512x512.png",
	Path.home() / "Desktop/IconKitchen-Output/ios/AppIcon~ios-marketing.png",
]
OUT_DIR = ROOT / "static/img/splash"

# (stem, css_width_pt, css_height_pt, dpr) — portrait logical size × scale → pixel canvas
DEVICES: list[tuple[str, int, int, int]] = [
	("iphone-14", 390, 844, 3),
	("iphone-14-pro", 393, 852, 3),
	("iphone-14-pro-max", 430, 932, 3),
	("iphone-15-pro", 402, 874, 3),
	("iphone-15-pro-max", 440, 956, 3),
	("iphone-x", 375, 812, 3),
	("iphone-xs-max", 414, 896, 3),
	("iphone-xr", 414, 896, 2),
	("iphone-678p", 414, 736, 3),
	("iphone-678", 375, 667, 2),
	("iphone-se1", 320, 568, 2),
	("ipad-pro-11", 834, 1194, 2),
	("ipad-pro-12", 1024, 1366, 2),
	("ipad-10", 810, 1080, 2),
	("ipad-air", 820, 1180, 2),
	("ipad-mini", 744, 1133, 2),
]

# Centered logo: fraction of shorter screen edge
ICON_FRAC = 0.22


def load_icon() -> Image.Image:
	for p in ICON_CANDIDATES:
		if p.is_file():
			img = Image.open(p).convert("RGBA")
			print(f"Using icon: {p}")
			return img
	raise SystemExit("No icon found. Add static/img/icons/android-icon-512x512.png")


def scaled_icon(icon: Image.Image, canvas_w: int, canvas_h: int) -> Image.Image:
	max_side = max(64, int(min(canvas_w, canvas_h) * ICON_FRAC))
	iw, ih = icon.size
	scale = min(max_side / iw, max_side / ih)
	nw, nh = max(1, int(iw * scale)), max(1, int(ih * scale))
	return icon.resize((nw, nh), Image.Resampling.LANCZOS)


def render_splash(canvas_w: int, canvas_h: int, icon: Image.Image) -> Image.Image:
	canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 255))
	sc = scaled_icon(icon, canvas_w, canvas_h)
	x = (canvas_w - sc.width) // 2
	y = (canvas_h - sc.height) // 2
	canvas.paste(sc, (x, y), sc)
	return canvas


def main() -> None:
	icon = load_icon()
	OUT_DIR.mkdir(parents=True, exist_ok=True)
	for stem, cw, ch, dpr in DEVICES:
		pw, ph = cw * dpr, ch * dpr
		render_splash(pw, ph, icon).save(OUT_DIR / f"splash-{stem}.png", optimize=True)
		render_splash(ph, pw, icon).save(
			OUT_DIR / f"splash-{stem}-landscape.png", optimize=True
		)
		print(f"  {stem} portrait {pw}×{ph}, landscape {ph}×{pw}")
	print(f"Wrote {len(DEVICES) * 2} files to {OUT_DIR}")


if __name__ == "__main__":
	main()
