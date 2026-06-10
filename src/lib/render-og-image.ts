/**
 * Builds the Open Graph image SVG (1200x630) for the app: a white canvas with,
 * centered, a row of the calculator logo + a brand string in Paper Mono bold,
 * then the subtitle "Integer Decomposition Calculator". Pure and platform
 * agnostic, so the Cloudflare Pages function reuses it to rasterize a per-share
 * PNG on demand. The brand is normally "IntD" but becomes the `?p=` number.
 */

/** Open Graph recommended 1.91:1 canvas. */
export const OG_WIDTH = 1200
export const OG_HEIGHT = 630

const BG_COLOR = "#ffffff"
const FG_COLOR = "#000000"
const SUB_COLOR = "#525252"

/** Font family name embedded in the woff2; resvg matches text to it by name. */
export const OG_FONT_FAMILY = "Paper Mono"

const SUBTITLE = "Integer Decomposition Calculator"

/** The calculator logo, same path data as public/favicon.svg, drawn black. */
const LOGO = `<g transform="translate(0 0) scale(0.5859375)">\
<rect x="80" y="64" width="96" height="48" opacity="0.2"/>\
<rect x="80" y="64" width="96" height="48" fill="none" stroke="${FG_COLOR}" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>\
<rect x="32" y="48.01" width="192" height="160" rx="8" transform="translate(256.01 0.01) rotate(90)" fill="none" stroke="${FG_COLOR}" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>\
<circle cx="88" cy="148" r="12"/><circle cx="128" cy="148" r="12"/><circle cx="168" cy="148" r="12"/>\
<circle cx="88" cy="188" r="12"/><circle cx="128" cy="188" r="12"/><circle cx="168" cy="188" r="12"/>\
</g>`

// Layout constants (OG pixels). The logo viewBox is 256; scaled to 150 above.
const LOGO_SIZE = 150
const GAP = 32 // space between logo and brand
const BRAND_SIZE = 120
const SUB_SIZE = 26
const ROW_SUB_GAP = 24 // vertical space between the logo row and the subtitle

/** Approx advance width of Paper Mono glyphs at a given font size (monospace). */
const MONO_ADVANCE = 0.6

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
  const brandWidth = brand.length * BRAND_SIZE * MONO_ADVANCE
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
    `<text x="${brandX}" y="${brandBaseline}" font-family="${OG_FONT_FAMILY}" font-weight="700" font-size="${BRAND_SIZE}" letter-spacing="-2" fill="${FG_COLOR}">${safeBrand}</text>` +
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
