/**
 * Cloudflare Pages middleware: when a shared URL carries a valid `?p=` amount,
 * rewrite the static OG/Twitter image meta to point at the on-demand /og image
 * for that number. Crawlers (Facebook, Discord, Twitter) don't run JS, so the
 * per-share preview must be injected into the served HTML here.
 *
 * URLs without a valid `?p=` keep the static /og.png meta from index.html.
 * Only the HTML app shell is rewritten; /og and static assets pass through.
 */

import { OG_HEIGHT, OG_WIDTH, parseBrand } from "../src/lib/render-og-image"

class MetaContentRewriter {
  constructor(private readonly content: string) {}
  element(el: Element) {
    el.setAttribute("content", this.content)
  }
}

export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url)

  // Don't touch the image function or anything that isn't the HTML shell.
  if (url.pathname.startsWith("/og")) return next()

  const response = await next()
  const contentType = response.headers.get("content-type") || ""
  if (!contentType.includes("text/html")) return response

  // Only override the static image when a real ?p= amount is shared.
  if (parseBrand(url.search) === "IntD") return response

  const imageUrl = `${url.origin}/og?p=${encodeURIComponent(
    new URLSearchParams(url.search).get("p") as string,
  )}`

  return new HTMLRewriter()
    .on('meta[property="og:image"]', new MetaContentRewriter(imageUrl))
    .on('meta[name="twitter:image"]', new MetaContentRewriter(imageUrl))
    .on(
      'meta[property="og:image:width"]',
      new MetaContentRewriter(String(OG_WIDTH)),
    )
    .on(
      'meta[property="og:image:height"]',
      new MetaContentRewriter(String(OG_HEIGHT)),
    )
    .on('meta[property="og:url"]', new MetaContentRewriter(url.href))
    .transform(response)
}
