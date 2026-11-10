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

import {
  OG_HEIGHT,
  OG_IMAGE_VERSION,
  OG_WIDTH,
  parseBrand,
} from "../src/lib/render-og-image"
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

class LangRewriter {
  constructor(private readonly lang: string) {}
  element(el: Element) {
    el.setAttribute("lang", this.lang)
  }
}

const setContent = (v: string) => new AttrRewriter("content", v)
const setHref = (v: string) => new AttrRewriter("href", v)

export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url)

  // Canonical-host redirect. Any *.pages.dev host (<project>.pages.dev and every
  // <hash>.<project>.pages.dev preview URL) is 301'd to the custom domain, path +
  // query preserved, so the pages.dev origin never gets indexed or linked.
  if (url.hostname.endsWith(".pages.dev")) {
    const target = new URL(
      url.pathname + url.search,
      "https://intd.chingru.com",
    )
    return Response.redirect(target.toString(), 301)
  }

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
    ? `${url.origin}/og?p=${encodeURIComponent(brand)}&v=${OG_IMAGE_VERSION}`
    : `${url.origin}/og.png?v=${OG_IMAGE_VERSION}`
  const imageW = OG_WIDTH
  const imageH = OG_HEIGHT
  // og:url reflects the actual shared URL (keeps the ?p so the unfurl is exact).
  const ogUrl = hasAmount ? url.href : canonical
  const imageAlt =
    route.lang === "en"
      ? "IntD integer decomposition calculator"
      : "IntD 整數拆解計算器"

  return new HTMLRewriter()
    .on("html", new LangRewriter(route.lang === "en" ? "en" : "zh-Hant"))
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
    .on('meta[property="og:image:alt"]', setContent(imageAlt))
    .on('meta[property="og:image:width"]', setContent(String(imageW)))
    .on('meta[property="og:image:height"]', setContent(String(imageH)))
    .on('meta[name="twitter:title"]', setContent(title))
    .on('meta[name="twitter:description"]', setContent(description))
    .on('meta[name="twitter:image"]', setContent(imageUrl))
    .on('meta[name="twitter:image:alt"]', setContent(imageAlt))
    .transform(response)
}
