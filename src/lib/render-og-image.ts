/**
 * Builds the Open Graph image SVG (1200x630) for the app: a white canvas with,
 * centered, a row of the favicon mark + a brand string in Inter bold,
 * then the subtitle "Integer Decomposition Calculator". Pure and platform
 * agnostic, so the Cloudflare Pages function reuses it to rasterize a per-share
 * PNG on demand. The brand is normally "IntD" but becomes the `?p=` number.
 */

import { INTD_ICON_PATH } from "./brand-icon"

/** Open Graph recommended 1.91:1 canvas. */
export const OG_WIDTH = 1200
export const OG_HEIGHT = 630
export const OG_IMAGE_VERSION = "3"

const BG_COLOR = "#ffffff"
const FG_COLOR = "#000000"
const SUB_COLOR = "#525252"

/** Font family name embedded in the TTF subsets; resvg matches it by name. */
export const OG_FONT_FAMILY = "Inter Variable Display"

const SUBTITLE = "Integer Decomposition Calculator"

/** Fit the 701 × 800 favicon path in the existing 150 × 150 logo slot. */
const LOGO = `<g transform="translate(9.28125 0) scale(0.1875)"><path d="${INTD_ICON_PATH}"/></g>`

// Layout constants (OG pixels).
const LOGO_SIZE = 150
const GAP = 32 // space between logo and brand
const BRAND_SIZE = 120
const SUB_SIZE = 39
const ROW_SUB_GAP = 42 // vertical space between the logo row and the subtitle

// Inter at 700 weight. Digits in the embedded OG font use the tnum glyphs.
const INTD_ADVANCE = 1.914
const TABULAR_DIGIT_ADVANCE = 0.6445

function escapeXml(s: string): string {
  return s.replace(
    /[<>&'"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[c] as string,
  )
}

/**
 * Returns the OG image as an SVG string. `brand` is the large text (digits for a
 * shared `?p=` amount, otherwise "IntD").
 */
export function renderOgSvg(brand: string): string {
  const safeBrand = escapeXml(brand)

  // Width of the logo row, to center it horizontally.
  const brandWidth =
    BRAND_SIZE *
    (brand === "IntD" ? INTD_ADVANCE : brand.length * TABULAR_DIGIT_ADVANCE)
  const rowWidth = LOGO_SIZE + GAP + brandWidth
  const rowX = (OG_WIDTH - rowWidth) / 2

  // Vertically center the (row + gap + subtitle) block.
  const blockHeight = LOGO_SIZE + ROW_SUB_GAP + SUB_SIZE
  const blockTop = (OG_HEIGHT - blockHeight) / 2

  const logoX = rowX
  const logoY = blockTop
  // Brand baseline: vertically center the cap-height against the logo row.
  const brandX = rowX + LOGO_SIZE + GAP
  const brandBaseline = blockTop + LOGO_SIZE / 2 + BRAND_SIZE * 0.35

  // Subtitle, centered, below the row.
  const subBaseline = blockTop + LOGO_SIZE + ROW_SUB_GAP + SUB_SIZE * 0.8

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">` +
    `<rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${BG_COLOR}"/>` +
    `<g transform="translate(${logoX} ${logoY})" fill="${FG_COLOR}">${LOGO}</g>` +
    `<text x="${brandX}" y="${brandBaseline}" font-family="${OG_FONT_FAMILY}" font-weight="700" font-size="${BRAND_SIZE}" font-variant-numeric="tabular-nums" fill="${FG_COLOR}">${safeBrand}</text>` +
    `<text x="${OG_WIDTH / 2}" y="${subBaseline}" font-family="${OG_FONT_FAMILY}" font-weight="400" font-size="${SUB_SIZE}" fill="${SUB_COLOR}" text-anchor="middle">${SUBTITLE}</text>` +
    `</svg>`
  )
}

/**
 * Parse the brand text from a URL search string. Returns the `p` digits when it
 * is a valid positive integer within range, otherwise "IntD".
 */
export function parseBrand(search: string): string {
  const p = new URLSearchParams(search).get("p")
  if (p && /^[1-9][0-9]*$/.test(p) && Number(p) <= 99999) return p
  return "IntD"
}
