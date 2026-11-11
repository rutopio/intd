import { initWasm, Resvg } from "@resvg/resvg-wasm";
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";

import {
  INTER_OG_BOLD_TTF_BASE64,
  INTER_OG_REGULAR_TTF_BASE64,
} from "../src/lib/inter-og-font";
import { OG_WIDTH, parseBrand, renderOgSvg } from "../src/lib/render-og-image";

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
const FONT_BYTES = [
  base64ToBytes(INTER_OG_REGULAR_TTF_BASE64),
  base64ToBytes(INTER_OG_BOLD_TTF_BASE64),
];

// Share initialization across concurrent requests; a failed attempt remains retryable.
let wasmReady: Promise<void> | null = null;
function ensureWasm(): Promise<void> {
  if (!wasmReady) {
    wasmReady = initWasm(resvgWasm as WebAssembly.Module).catch((error) => {
      wasmReady = null;
      throw error;
    });
  }
  return wasmReady;
}

export const onRequestGet: PagesFunction = async ({ request }) => {
  const url = new URL(request.url);
  const brand = parseBrand(url.search);
  const svg = renderOgSvg(brand);

  await ensureWasm();
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: OG_WIDTH },
    font: { fontBuffers: FONT_BYTES, loadSystemFonts: false },
  });
  const png = resvg.render().asPng();

  return new Response(png.buffer as ArrayBuffer, {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=86400, s-maxage=2592000, immutable",
    },
  });
};

export const config = { runtime: "edge" };
