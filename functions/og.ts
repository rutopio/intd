/**
 * Cloudflare Pages Function: on-demand Open Graph image.
 *
 *   GET /og?p=8133
 *
 * Reuses the app's pure OG renderer to build a 1200x630 SVG (logo + brand +
 * subtitle), then rasterizes it to PNG with resvg-wasm. The brand is the `?p=`
 * amount when valid, otherwise "IntD". Cached at the edge so repeated shares are
 * cheap. Crawlers (Facebook, Discord, Twitter) fetch this via the rewritten meta
 * in _middleware.ts.
 */

import { initWasm, Resvg } from "@resvg/resvg-wasm"
// The .wasm is imported as a module so Wrangler bundles it with the function.
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm"

import { PAPER_MONO_WOFF2_BASE64 } from "../src/lib/paper-mono-font"
import { OG_WIDTH, parseBrand, renderOgSvg } from "../src/lib/render-og-image"

// Decode the embedded Paper Mono woff2 once per isolate.
function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}
const FONT_BYTES = base64ToBytes(PAPER_MONO_WOFF2_BASE64)

// initWasm must run once per isolate; guard with a shared promise.
let wasmReady: Promise<void> | null = null
function ensureWasm(): Promise<void> {
  if (!wasmReady) {
    wasmReady = initWasm(resvgWasm as WebAssembly.Module)
  }
  return wasmReady
}

export const onRequestGet: PagesFunction = async ({ request }) => {
  const url = new URL(request.url)
  const brand = parseBrand(url.search)
  const svg = renderOgSvg(brand)

  await ensureWasm()
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: OG_WIDTH },
    font: { fontBuffers: [FONT_BYTES], loadSystemFonts: false },
  })
  const png = resvg.render().asPng()

  return new Response(png.buffer as ArrayBuffer, {
    headers: {
      "content-type": "image/png",
      // Cache aggressively at the edge; the image is a pure function of ?p=.
      "cache-control": "public, max-age=86400, s-maxage=2592000, immutable",
    },
  })
}

export const config = { runtime: "edge" }
