"""Turn the generated masters in art-src/ into web assets.

Adapted from thelocalcode's script. The art here is gouache, so it keeps its
brush strokes instead of being flattened to a few colours.

- Keys out the flat magenta (#FF00FF) background to transparency, un-mixing the
  anti-aliased edge pixels so outlines don't keep a pink fringe.
- Finds the largest blank white box, if any, and writes it as fractions of the
  image to lib/art.json, so the page can lay live content exactly over it.
- Writes public/art/<name>.webp for every art-src/<name>.png.

Run: python3 scripts/process-art.py   (with Pillow + numpy)
"""

import json
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / "art-src", ROOT / "public" / "art"

MAGENTA = np.array([255.0, 0.0, 255.0])
# ponytail: thresholds tuned by eye on these images; widen LO if a fringe shows
LO, HI = 40.0, 190.0


def sharpen(img: Image.Image) -> Image.Image:
    return img.filter(ImageFilter.UnsharpMask(radius=2, percent=45, threshold=2))


def key_out(rgb: np.ndarray) -> np.ndarray:
    m = np.minimum(rgb[..., 0], rgb[..., 2]) - rgb[..., 1]  # "how magenta"
    bg = np.clip((m - LO) / (HI - LO), 0, 1)
    a = 1.0 - bg
    safe = np.maximum(a, 1e-3)[..., None]
    col = np.clip((rgb - (1 - a[..., None]) * MAGENTA) / safe, 0, 255)
    return np.dstack([col, a * 255]).astype(np.uint8)


def fringe(rgba: np.ndarray) -> int:
    """Visible pixels still leaning magenta. Should be close to zero."""
    m = np.minimum(rgba[..., 0].astype(int), rgba[..., 2].astype(int)) - rgba[..., 1].astype(int)
    return int(((rgba[..., 3] > 64) & (m > 60)).sum())


def blank_box(rgba: np.ndarray) -> dict | None:
    """Largest near-rectangular white region, as fractions of the image."""
    step = 4  # label on a 1/4-size mask; plenty for box edges
    white = (rgba[::step, ::step, :3].min(axis=2) > 232) & (rgba[::step, ::step, 3] > 250)
    h, w = white.shape
    seen = np.zeros_like(white)
    best = None
    for y in range(h):
        for x in range(w):
            if not white[y, x] or seen[y, x]:
                continue
            q, n = deque([(y, x)]), 0
            seen[y, x] = True
            y0 = y1 = y
            x0 = x1 = x
            while q:
                cy, cx = q.popleft()
                n += 1
                y0, y1, x0, x1 = min(y0, cy), max(y1, cy), min(x0, cx), max(x1, cx)
                for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                    if 0 <= ny < h and 0 <= nx < w and white[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((ny, nx))
            box = (x1 - x0 + 1) * (y1 - y0 + 1)
            if n > 0.02 * h * w and n / box > 0.8 and (best is None or n > best[0]):
                best = (n, x0, y0, x1 + 1, y1 + 1)
    if best is None:
        return None
    _, x0, y0, x1, y1 = best
    return {"x": round(x0 / w, 4), "y": round(y0 / h, 4), "w": round((x1 - x0) / w, 4), "h": round((y1 - y0) / h, 4)}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    (ROOT / "lib").mkdir(exist_ok=True)
    meta = {}
    for path in sorted(SRC.glob("*.png")):
        rgb = np.asarray(sharpen(Image.open(path).convert("RGB")), dtype=np.float64)
        rgba = key_out(rgb)
        ys, xs = np.nonzero(rgba[..., 3] > 8)
        pad = 6
        y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, rgba.shape[0])
        x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, rgba.shape[1])
        rgba = rgba[y0:y1, x0:x1]
        Image.fromarray(rgba).save(OUT / f"{path.stem}.webp", "WEBP", quality=86, method=6)
        h, w = rgba.shape[:2]
        meta[path.stem] = {"w": w, "h": h, "blank": blank_box(rgba)}
        print(path.stem, meta[path.stem], "fringe px:", fringe(rgba))
    (ROOT / "lib" / "art.json").write_text(json.dumps(meta, indent=2) + "\n")


if __name__ == "__main__":
    main()
