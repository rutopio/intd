/**
 * Cloudflare Pages middleware: inject per-route SEO metadata into the served
 * HTML. The app is a single index.html shell whose static head only describes
 * the zh home page, and crawlers don't run JS, so the correct title /
 * description / canonical / locale / OG tags for each route (and language) must
 * be written here.
 *
 * On top of that, when a shared URL carries a valid `?p=` amount, the OG/Twitter
 * image is swapped for the on-demand /og image of that number.
 *
 * Only the HTML app shell is rewritten; /og and static assets pass through.
 */

import { OG_HEIGHT, OG_WIDTH, parseBrand } from "../src/lib/render-og-image"
import { metaFor, OG_LOCALE, pathFor, resolveRoute } from "./seo-meta"

class AttrRewriter {
  constructor(
    private readonly attr: string,
    private readonly value: string,
  ) {}
  element(el: Element) {
    el.setAttribute(this.attr, this.value)
  }
}

class TextRewriter {
  constructor(private readonly value: string) {}
  element(el: Element) {
    el.setInnerContent(this.value)
  }
}

const setContent = (v: string) => new AttrRewriter("content", v)
const setHref = (v: string) => new AttrRewriter("href", v)

export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url)

  // Don't touch the image function or anything that isn't the HTML shell.
  if (url.pathname.startsWith("/og")) return next()

  const response = await next()
  const contentType = response.headers.get("content-type") || ""
  if (!contentType.includes("text/html")) return response

  const route = resolveRoute(url.pathname)
  const { title, description } = metaFor(route)
  const canonical = `${url.origin}${route.path}`
  const locale = OG_LOCALE[route.lang]

  // hreflang alternates: same page in each language. x-default points to zh.
  const zhAlt = `${url.origin}${pathFor("zh", route.page)}`
  const enAlt = `${url.origin}${pathFor("en", route.page)}`

  // Default image is the static og.png; a valid ?p= shares the dynamic number.
  const brand = parseBrand(url.search)
  const hasAmount = brand !== "IntD"
  const imageUrl = hasAmount
    ? `${url.origin}/og?p=${encodeURIComponent(brand)}`
    : `${url.origin}/og.png`
  const imageW = hasAmount ? OG_WIDTH : 2400
  const imageH = hasAmount ? OG_HEIGHT : 1260
  // og:url reflects the actual shared URL (keeps the ?p so the unfurl is exact).
  const ogUrl = hasAmount ? url.href : canonical

  return new HTMLRewriter()
    .on("title", new TextRewriter(title))
    .on('meta[name="description"]', setContent(description))
    .on('link[rel="canonical"]', setHref(canonical))
    .on('link[hreflang="zh-Hant"]', setHref(zhAlt))
    .on('link[hreflang="en"]', setHref(enAlt))
    .on('link[hreflang="x-default"]', setHref(zhAlt))
    .on('meta[property="og:title"]', setContent(title))
    .on('meta[property="og:description"]', setContent(description))
    .on('meta[property="og:url"]', setContent(ogUrl))
    .on('meta[property="og:locale"]', setContent(locale))
    .on('meta[property="og:image"]', setContent(imageUrl))
    .on('meta[property="og:image:width"]', setContent(String(imageW)))
    .on('meta[property="og:image:height"]', setContent(String(imageH)))
    .on('meta[name="twitter:title"]', setContent(title))
    .on('meta[name="twitter:description"]', setContent(description))
    .on('meta[name="twitter:image"]', setContent(imageUrl))
    .transform(response)
}
