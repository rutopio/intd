import { INTD_ICON_PATH } from "./brand-icon";

const XML_SPECIAL_CHARACTER_RE = /[<>&'"]/g;
const POSITIVE_INTEGER_RE = /^[1-9][0-9]*$/;

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const OG_IMAGE_VERSION = "7";

const BG_COLOR = "#ffffff";
const FG_COLOR = "#000000";
const SUB_COLOR = "#525252";

/** Font family name embedded in the TTF subsets; resvg matches it by name. */
export const OG_FONT_FAMILY = "Inter Variable Display";

const SUBTITLE = "Integer Decomposition Calculator";

/** Fit the 811 × 800 icon in the 150 × 150 logo slot. */
const LOGO = `<g transform="translate(0.3875 1.4) scale(0.184)"><g transform="translate(81.1 80) scale(0.8)"><path d="${INTD_ICON_PATH}"/></g></g>`;

const LOGO_SIZE = 150;
const GAP = 32; // space between logo and brand
const BRAND_SIZE = 120;
const SUB_SIZE = 58.5;
const ROW_SUB_GAP = 42; // vertical space between the logo row and the subtitle

// Inter at 700 weight. Digits in the embedded OG font use the tnum glyphs.
const INTD_ADVANCE = 1.914;
const TABULAR_DIGIT_ADVANCE = 0.6445;

function escapeXml(s: string): string {
  return s.replace(
    XML_SPECIAL_CHARACTER_RE,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[c] as string
  );
}

export function renderOgSvg(brand: string): string {
  const safeBrand = escapeXml(brand);

  const brandWidth =
    BRAND_SIZE *
    (brand === "IntD" ? INTD_ADVANCE : brand.length * TABULAR_DIGIT_ADVANCE);
  const rowWidth = LOGO_SIZE + GAP + brandWidth;
  const rowX = (OG_WIDTH - rowWidth) / 2;

  const blockHeight = LOGO_SIZE + ROW_SUB_GAP + SUB_SIZE;
  const blockTop = (OG_HEIGHT - blockHeight) / 2;

  const logoX = rowX;
  const logoY = blockTop;
  // Brand baseline: vertically center the cap-height against the logo row.
  const brandX = rowX + LOGO_SIZE + GAP;
  const brandBaseline = blockTop + LOGO_SIZE / 2 + BRAND_SIZE * 0.35;

  const subBaseline = blockTop + LOGO_SIZE + ROW_SUB_GAP + SUB_SIZE * 0.8;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">` +
    `<rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${BG_COLOR}"/>` +
    `<g transform="translate(${logoX} ${logoY})" fill="${FG_COLOR}">${LOGO}</g>` +
    `<text x="${brandX}" y="${brandBaseline}" font-family="${OG_FONT_FAMILY}" font-weight="700" font-size="${BRAND_SIZE}" font-variant-numeric="tabular-nums" fill="${FG_COLOR}">${safeBrand}</text>` +
    `<text x="${OG_WIDTH / 2}" y="${subBaseline}" font-family="${OG_FONT_FAMILY}" font-weight="400" font-size="${SUB_SIZE}" fill="${SUB_COLOR}" text-anchor="middle">${SUBTITLE}</text>` +
    `</svg>`
  );
}

export function parseBrand(search: string): string {
  const p = new URLSearchParams(search).get("p");
  if (p && POSITIVE_INTEGER_RE.test(p) && Number(p) <= 99999) return p;
  return "IntD";
}
