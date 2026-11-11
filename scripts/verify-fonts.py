#!/usr/bin/env python3
"""Check checked-in font faces against their real cmap tables."""

from __future__ import annotations

import re
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
CSS = (ROOT / "src/styles/generated-fonts.css").read_text(encoding="utf-8")


def expand_ranges(value: str) -> set[int]:
    codepoints = set()
    for item in value.split(","):
        start, _, end = item.strip().removeprefix("U+").partition("-")
        codepoints.update(range(int(start, 16), int(end or start, 16) + 1))
    return codepoints


def main() -> None:
    seen: dict[str, set[int]] = {}
    blocks = re.findall(r"@font-face\s*\{([^}]*)\}", CSS, re.S)
    if len(blocks) != 7:
        raise ValueError(f"Expected seven generated font faces, got {len(blocks)}")
    for block in blocks:
        name = re.search(r'/fonts/([\w-]+\.woff2)', block)
        declared = re.search(r'unicode-range:\s*([^;]+);', block)
        if not name or not declared or "font-display: swap;" not in block:
            raise ValueError(f"Incomplete font face: {block}")
        path = ROOT / "public/fonts" / name.group(1)
        actual = set(TTFont(path).getBestCmap())
        if actual != expand_ranges(declared.group(1)):
            raise ValueError(f"Incorrect unicode-range: {path}")
        stem, part = name.group(1).removesuffix(".woff2").rsplit("-", 1)
        if actual & seen.get(stem, set()):
            raise ValueError(f"Font faces overlap: {stem}")
        seen.setdefault(stem, set()).update(actual)
        print(f"{path.relative_to(ROOT)}: {path.stat().st_size} bytes, {len(actual)} codepoints")


if __name__ == "__main__":
    main()
