# Web font audit and reproducible comparison

Measured on 2026-11-11 against the same page content and CSS text scale at 1280 × 720 in Chromium. The baseline came from commit `c8b5bf2`; the concurrent footer and text-size edits were copied into the temporary baseline so the comparison isolates font changes. Browser cache was cleared before each route. Byte counts below are uncompressed WOFF2 file bytes for each distinct font URL requested, not transfer compression. Every observed font response was HTTP 200.

The full [before inventory](before-inventory.json) and [after inventory](after-inventory.json) list **each WOFF2 file** (140 before, 28 after), its size, glyph count, mapped codepoints, variable axes, GSUB/GPOS feature tags, and hinting tables/instructions. The 20 KaTeX WOFF2 files are included in both inventories; alternate KaTeX WOFF/TTF assets are build outputs but were not requested by these browser pages. The [per-page record](page-metrics.json) lists every requested file and preload.

## Font bytes

| Family | Before | After, all available WOFF2 | Files before → after | Notes |
| --- | ---: | ---: | ---: | --- |
| Inter normal and italic | 760,808 B | 134,444 B | 14 → 4 | Both styles have core and extended faces. |
| Noto Sans TC | 4,194,768 B | 3,248,364 B | 105 → 3 | The normal pages use only the 33,296 B core and 164,036 B extended files; a 3,051,032 B legacy file is lazy. |
| Paper Mono | 38,720 B | 38,720 B | 1 → 1 | Kept unchanged for pixel identity. |
| KaTeX | 259,792 B | 259,792 B | 20 → 20 | Dependency owned, unchanged. |
| **Total** | **5,254,088 B** | **3,681,320 B** | **140 → 28** | **1,572,768 B fewer WOFF2 bytes across site assets and dependencies.** |

The generated faces have these mapped codepoints: Inter normal core 327, extended 1; Inter italic core 327, extended 1; Noto core 237, extended 607, legacy 11,308. The extended Inter character is `Σ`, found only in code examples here, so those two files did not download in the measured routes. Latin-1 and Latin Extended-A remain in the Inter core: moving them to the extended face broke kerning in accented words. The 3 MB Noto legacy face preserves baseline glyphs in arbitrary user-entered item names such as `鳳梨`; none of the six standard routes requested it. A rare new character downloads that entire legacy file, which is slower than the original small Noto shard for that state. This is the cost of preserving its appearance while keeping the ordinary pages small.

## Per-page downloaded font bytes

| Route | Before | After | Saved | Font requests before → after | Preloads before → after |
| --- | ---: | ---: | ---: | ---: | --- |
| `/` | 1,042,976 B | 298,488 B | 71.4% | 16 → 4 | Inter normal → Inter normal core, Noto core |
| `/en` | 524,184 B | 298,488 B | 43.1% | 8 → 4 | same |
| `/algo` | 1,664,956 B | 460,120 B | 72.4% | 30 → 12 | Inter normal → Inter normal core, Noto core, Inter italic core |
| `/en/algo` | 389,240 B | 296,084 B | 23.9% | 11 → 11 | same as `/algo` |
| `/about` | 980,252 B | 298,488 B | 69.5% | 14 → 4 | same as `/` |
| `/en/about` | 390,340 B | 298,488 B | 23.5% | 6 → 4 | same as `/` |

The Noto extended face is requested on `/`, `/en`, `/algo`, `/about`, and `/en/about` because those routes show Chinese text, including sample calculator results in English. It is **not** requested on `/en/algo`. The legacy face and both Inter extended faces were absent from all six ordinary page loads. Paper Mono is requested on every route by the current footer; seven KaTeX faces are requested on each algorithm route. No generated fallback face sits between the core and extended faces. Each `unicode-range` is generated from, and checked against, its output font's actual cmap; the faces have disjoint ranges.

## Rendering proof

The [pixel diff results](pixel-diffs.json) and [before/after PNGs](screenshots/) are checked in. All six routes were captured as full pages at the same viewport after fonts loaded. The calculator result, settings dialog, an accented/italic/bold-italic/tabular-numeral/CJK/code specimen, and a custom Chinese item name were also compared. The settings input was blurred to avoid a blinking caret. The result and route captures waited for entry animation to settle.

| State | Different pixels | Largest channel delta | Explanation |
| --- | ---: | ---: | --- |
| `/` | 35 of 1,102,080 | 4 of 255 | An 8 × 8 region in the animated new-combination icon was sampled at a different phase. Text and layout match. |
| `/en`, `/algo`, `/en/algo`, `/about`, `/en/about` | 0 | 0 | Exact pixels. |
| Result cards, settings dialog, accented specimen, custom `鳳梨` input | 0 | 0 | Exact pixels. |

Before adding legacy coverage, the custom `鳳梨` input differed in 511 pixels; the extra face reduced that to zero. Before keeping Latin-1/Extended-A in the core, the accented italic specimen differed in 3,826 pixels; it now matches. The Chinese algorithm article needed one inline `halt` override on a closing quote to preserve its original fullwidth advance after sharding; its text did not change.

## Security update after the font comparison

The requested `pnpm audit` initially found 104 advisories. Updating dependencies, removing the unused `shadcn` CLI package, and pinning patched transitive KaTeX and Sharp versions reduced it to **zero known vulnerabilities**. The direct dependencies now include KaTeX 0.18.2, Zod 4.6.7, and Vite 8.3.7. Vite 8.3 required an explicit `@` alias in `vite.config.ts` for the production build.

KaTeX 0.18 shortened the first multiline display equation by 0.3em, shifting all following article content about five pixels. A narrow CSS rule restores the old line box. [Production-build pixel diffs](security-upgrade-diffs.json) and the corresponding `audit-*` screenshots in [screenshots](screenshots/) compare the old locked dependencies with the patched build on identical content: **all six routes are exactly zero different pixels**, including both algorithm pages. This comparison used production builds for both sides, after fonts and result-card animations settled.

## Font decisions and limits

- The current UI uses normal weights 300, 400, 500, 550, 700, italics through 700, an optical-size range driven by CSS `font-optical-sizing: auto`, and explicit `tabular-nums`. The Chinese amount cells use 300, MDX semibold is 550, and strong inside emphasis needs bold italic. The source scan includes JSX, inline styles, translations, MDX, and the U+2010 hyphen used by `hyphens: auto`.
- Inter keeps `calt`, `ccmp`, `locl`, `kern`, `mark`, `mkmk`, and `tnum`. Noto keeps `ccmp`, `locl`, `halt`, and `palt`. Unused feature tables were removed from generated faces. Paper Mono and KaTeX retain their original feature tables.
- Inter remains variable on `opsz` 14–32 and `wght` 100–900; Noto remains `wght` 100–900. Restricting these ranges to observed values changed hundreds of thousands of pixels in trial captures, so the axes were left intact. Inter has no hint tables; removing Noto hinting changed 2,872 pixels on `/` to save roughly 140 B, so it was retained. Paper Mono subsetting changed 94,284 pixels on `/en/algo`, so that 38,720 B file remains intact and unsplit. KaTeX files remain untouched.
- The pinned Inter and Noto OFL license headers declare **no Reserved Font Name**. Their internal names remain unchanged; changing those names altered CoreText rasterization in trial captures. [Inter's license](../../public/font/OFL-Inter.txt) and [Noto's license](../../public/font/OFL-Noto-Sans-TC.txt) are retained with the output. `font-display: swap` and the CSS fallback stack are unchanged.
- Noto has a third lazy face for input outside checked-in content. This departs from the requested two-file split. It adds 3,051,032 B to the deployed font set but **zero bytes** to the six measured ordinary page loads. Without it, user-entered Chinese names can change appearance. A future optimization could split this rare-input face into smaller lazy ranges if its download cost matters.

## Regeneration

From the repository root, with network access for a first run:

```sh
python3 -m pip install -r scripts/requirements-fonts.txt
python3 scripts/optimize-fonts.py
python3 scripts/verify-fonts.py
pnpm build
```

The optimizer downloads checksum-pinned Inter 4.1 and Noto Sans TC sources into ignored `.font-source-cache`, reads the checked-in original coverage maps, writes WOFF2 files and `src/generated-fonts.css`, and updates core preload hashes in `index.html`. It is **not** part of the build. Rerunning without a source or content change is byte-for-byte deterministic. Rerun it when visible copy, translations, MDX/code examples, component text, font families, weights, variable-axis settings, or OpenType feature settings change. Repeat the browser pixel and network checks after any regenerated output; the checked-in audit describes this measured state, not future content.

Embedding core fonts in the global CSS and idle precaching of extended fonts remain future experiments; neither is applied here.
