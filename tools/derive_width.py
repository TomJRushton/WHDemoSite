"""
derive_width.py — add one smaller WebP width to every photo already in assets/img (PERF-003).

No downloads. For each image in photography/manifest.json it takes the LARGEST committed
WebP (<file>-<maxW>.webp), resizes it to the requested width and saves <file>-<width>.webp.
Existing files are never overwritten. Afterwards rebuild js/photography.js with:

    python3 tools/fetch_project_photos.py --from-assets

Usage:
    python3 tools/derive_width.py            # default: 400
    python3 tools/derive_width.py --width 400 --quality 82
"""
import argparse, json, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest", default=str(ROOT / "photography/manifest.json"))
    ap.add_argument("--img", default=str(ROOT / "assets/img"))
    ap.add_argument("--width", type=int, default=400)
    ap.add_argument("--quality", type=int, default=82)
    a = ap.parse_args()

    man = json.load(open(a.manifest, encoding="utf-8"))
    img_dir = Path(a.img)
    made, skipped, failed = 0, 0, []
    for p in man["projects"]:
        for img in p["images"]:
            files = sorted(img_dir.glob(f'{img["file"]}-*.webp'), key=lambda f: int(f.stem.rsplit("-", 1)[1]))
            if not files:
                failed.append(f'{img["file"]}: no WebP files'); continue
            out = img_dir / f'{img["file"]}-{a.width}.webp'
            if out.exists():
                skipped += 1; continue
            src = Image.open(files[-1]).convert("RGB")
            if src.width <= a.width:
                failed.append(f'{img["file"]}: largest file is only {src.width}px wide'); continue
            h = round(src.height * a.width / src.width)
            src.resize((a.width, h), Image.LANCZOS).save(out, "WEBP", quality=a.quality, method=6)
            made += 1
            print("ok  ", out.name, f"{a.width}x{h}")
    print(f"\n{made} created, {skipped} already present, {len(failed)} failed")
    if failed:
        [print("  " + f) for f in failed]; sys.exit(1)


if __name__ == "__main__":
    main()
