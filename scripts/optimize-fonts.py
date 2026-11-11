#!/usr/bin/env python3
"""Regenerate the checked-in web fonts. Run manually after visible text or font CSS changes.

Requires fonttools[woff] and network access for the pinned upstream font files.
This script is deliberately not part of the Vite build.
"""

from __future__ import annotations

import hashlib
import io
import json
import re
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / ".font-source-cache"
OUTPUT = ROOT / "public/fonts"
CSS = ROOT / "src/styles/generated-fonts.css"
SOURCES = {
    "inter-normal": (
        "https://raw.githubusercontent.com/rsms/inter/v4.1/docs/font-files/InterVariable.woff2",
        "693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3",
    ),
    "inter-italic": (
        "https://raw.githubusercontent.com/rsms/inter/v4.1/docs/font-files/InterVariable-Italic.woff2",
        "e564f652916db6c139570fefb9524a77c4d48f30c92928de9db19b6b5c7a262a",
    ),
    "noto-tc": (
        "https://raw.githubusercontent.com/google/fonts/b950a7257470b900078f2bf3223823a8602de7e1/ofl/notosanstc/NotoSansTC%5Bwght%5D.ttf",
        "864727d210d54f2537bbe23b3a839436c3992af72de9322af5270897246bd44f",
    ),
}
CORE = set(range(0x20, 0x7F)) | {0xA0, 0x2010, 0x2011, 0x2013, 0x2014,
                                   0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026}
LATIN = set(range(0xA0, 0x180))
NOTO_CORE = CORE | {ord("中"), ord("；")}
FEATURES = {
    "inter": ["calt", "ccmp", "locl", "kern", "mark", "mkmk", "tnum"],
    "noto-tc": ["ccmp", "locl", "halt", "palt"],
}
AXES = {
    "inter-normal": {"opsz": (14, 32), "wght": (100, 900)},
    "inter-italic": {"opsz": (14, 32), "wght": (100, 900)},
    "noto-tc": {"wght": (100, 900)},
}
PAPER_SOURCE = ROOT / "assets/fonts/PaperMono-original.woff2"
PAPER_OUTPUT = OUTPUT / "PaperMono[wght].woff2"


def source(name: str) -> Path:
    url, digest = SOURCES[name]
    CACHE.mkdir(exist_ok=True)
    path = CACHE / (name + Path(url).suffix)
    if not path.exists() or hashlib.sha256(path.read_bytes()).hexdigest() != digest:
        urllib.request.urlretrieve(url, path)
    if hashlib.sha256(path.read_bytes()).hexdigest() != digest:
        raise ValueError(f"Source checksum changed: {url}")
    return path


def content_codepoints() -> set[int]:
    # Scan content, translations, and inline JSX strings/styles. False positives
    # from comments cost a little space but avoid missing a lazy UI state.
    paths = (ROOT / "src").rglob("*")
    chars = set()
    for path in paths:
        if path.suffix in {".tsx", ".ts", ".mdx", ".json"} and path.name != "routeTree.gen.ts":
            chars.update(map(ord, path.read_text(encoding="utf-8")))
    return chars | LATIN | CORE


def unicode_range(codepoints: set[int]) -> str:
    ordered = sorted(codepoints)
    runs = []
    for cp in ordered:
        if runs and cp == runs[-1][1] + 1:
            runs[-1][1] = cp
        else:
            runs.append([cp, cp])
    return ",".join(f"U+{a:X}" if a == b else f"U+{a:X}-{b:X}" for a, b in runs)


def remove_empty_layout_tables(font: TTFont) -> None:
    """Discard empty layout tables only when the encoded WOFF2 gets smaller."""
    for tag in ("GSUB", "GPOS"):
        if tag not in font:
            continue
        layout = font[tag].table
        if layout.FeatureList and layout.FeatureList.FeatureRecord:
            continue
        if layout.LookupList and layout.LookupList.Lookup:
            continue
        original = io.BytesIO()
        font.save(original)
        empty = font[tag]
        del font[tag]
        cleaned = io.BytesIO()
        font.save(cleaned)
        if len(cleaned.getvalue()) >= len(original.getvalue()):
            font[tag] = empty


def make_paper_mono() -> None:
    # Keep every glyph, original glyph ID, axis, hint, and default feature.
    # The earlier glyph/axis subset changed pixels on the algorithm article.
    font = TTFont(PAPER_SOURCE)
    options = subset.Options()
    options.flavor = "woff2"
    options.hinting = True
    options.glyph_names = True
    options.retain_gids = True
    options.layout_features = ["ccmp", "locl", "rvrn", "mark", "mkmk"]
    options.name_IDs = ["*"]
    options.name_languages = ["*"]
    options.recalc_bounds = False
    worker = subset.Subsetter(options=options)
    worker.populate(glyphs=font.getGlyphOrder())
    worker.subset(font)
    font.flavor = "woff2"
    font.recalcTimestamp = False
    font.save(PAPER_OUTPUT)
    check = TTFont(PAPER_OUTPUT)
    original = TTFont(PAPER_SOURCE)
    if check.getGlyphOrder() != original.getGlyphOrder() or check.getBestCmap() != original.getBestCmap():
        raise ValueError("Paper Mono glyph order or coverage changed")
    print(f"{PAPER_OUTPUT.relative_to(ROOT)}: {PAPER_OUTPUT.stat().st_size} bytes, "
          f"{len(check.getBestCmap())} mapped characters")


def make_font(name: str, part: str, selected: set[int]) -> tuple[set[int], str]:
    font = TTFont(source(name))
    available = set(font.getBestCmap())
    wanted = selected & available
    if not wanted:
        raise ValueError(f"Empty subset: {name}-{part}")
    # Keep the full axis ranges and hinting. Narrowing either changed pixels in
    # the baseline comparison, even at the values the current UI requests.
    options = subset.Options()
    options.hinting = True
    options.layout_features = FEATURES["inter" if name.startswith("inter") else name]
    options.name_IDs = ["*"]
    options.name_languages = ["*"]
    worker = subset.Subsetter(options=options)
    worker.populate(unicodes=wanted)
    worker.subset(font)
    font = instantiateVariableFont(font, AXES[name], inplace=True, updateFontNames=False)
    # fontTools can re-add Unicode mappings through layout closure (notably
    # U+2264/U+2265 in the large Noto face). Keep cmap ownership disjoint.
    for table in font["cmap"].tables:
        if table.isUnicode():
            for cp in set(table.cmap) - wanted:
                del table.cmap[cp]
    # These pinned OFL sources have no Reserved Font Name; retaining the
    # original internal names also preserves CoreText's pixel rasterization.
    font.flavor = "woff2"
    font.recalcTimestamp = False
    font["head"].modified = 3600000000
    remove_empty_layout_tables(font)
    target = OUTPUT / f"{name}-{part}.woff2"
    font.save(target)
    check = TTFont(target)
    actual = set(check.getBestCmap())
    if not wanted <= actual:
        raise ValueError(f"Missing mapped characters: {target}: {wanted - actual}")
    print(f"{target.relative_to(ROOT)}: {target.stat().st_size} bytes, {len(actual)} mapped characters")
    return actual, hashlib.sha256(target.read_bytes()).hexdigest()[:8]


def main() -> None:
    OUTPUT.mkdir(exist_ok=True)
    make_paper_mono()
    for stale in OUTPUT.glob("paper-mono-*.woff2"):
        stale.unlink()
    content = content_codepoints()
    old_coverage = json.loads((ROOT / "assets/fonts/inter-coverage.json").read_text())
    noto_core = NOTO_CORE | set(json.loads((ROOT / "assets/fonts/noto-core-coverage.json").read_text()))
    old_noto_ranges = json.loads((ROOT / "assets/fonts/noto-original-coverage.json").read_text())
    old_noto_coverage = {cp for start, end in old_noto_ranges for cp in range(start, end + 1)}
    faces = []
    core_urls = {}
    for name, family, style in [
        ("inter-normal", "Inter Variable", "normal"),
        ("inter-italic", "Inter Variable", "italic"),
        ("noto-tc", "Noto Sans TC Variable", "normal"),
    ]:
        available = set(TTFont(source(name)).getBestCmap())
        if name.startswith("inter"):
            available &= set(old_coverage[style])
        else:
            available &= old_noto_coverage
        core = (noto_core if name == "noto-tc" else CORE | LATIN) & available
        extended = (content & available) - core
        if core & extended:
            raise ValueError(f"Overlapping ranges for {name}")
        for part, chars in [("extended", extended), ("core", core)]:
            actual, digest = make_font(name, part, chars)
            weight = "100 900"
            url = f"/fonts/{name}-{part}.woff2?v={digest}"
            if part == "core":
                core_urls[name] = url
            faces.append(f'''@font-face {{
  font-family: "{family}";
  font-style: {style};
  font-display: swap;
  font-weight: {weight};
  src: url("{url}") format("woff2");
  unicode-range: {unicode_range(actual)};
}}''')
        if name == "noto-tc":
            # User-supplied item names are unbounded. This third, non-preloaded
            # face preserves the baseline Noto glyphs outside checked-in text.
            legacy = available - core - extended
            actual, digest = make_font(name, "legacy", legacy)
            faces.append(f'''@font-face {{
  font-family: "{family}";
  font-style: normal;
  font-display: swap;
  font-weight: 100 900;
  src: url("/fonts/noto-tc-legacy.woff2?v={digest}") format("woff2");
  unicode-range: {unicode_range(actual)};
}}''')
    CSS.write_text("/* Generated by scripts/optimize-fonts.py; edit the script, then rerun. */\n" +
                   "\n\n".join(faces) + "\n", encoding="utf-8")
    html = ROOT / "index.html"
    markup = html.read_text(encoding="utf-8")
    for name, url in core_urls.items():
        markup, count = re.subn(rf"/fonts/{name}-core\.woff2(?:\?v=[0-9a-f]{{8}})?", url, markup)
        if count != 1:
            raise ValueError(f"Expected one preload for {name}, found {count}")
    html.write_text(markup, encoding="utf-8")


if __name__ == "__main__":
    main()
