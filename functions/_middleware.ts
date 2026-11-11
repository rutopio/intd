// Crawlers need route and shared-amount metadata before the SPA runs.

import {
  OG_HEIGHT,
  OG_IMAGE_VERSION,
  OG_WIDTH,
  parseBrand,
} from "../src/lib/render-og-image";
import { metaFor, OG_LOCALE, pathFor, resolveRoute } from "./seo-meta";

class AttrRewriter {
  constructor(
    private readonly attr: string,
    private readonly value: string
  ) {}
  element(el: Element) {
    el.setAttribute(this.attr, this.value);
  }
}

class TextRewriter {
  constructor(private readonly value: string) {}
  element(el: Element) {
    el.setInnerContent(this.value);
  }
}

class LangRewriter {
  constructor(private readonly lang: string) {}
  element(el: Element) {
    el.setAttribute("lang", this.lang);
  }
}

const setContent = (v: string) => new AttrRewriter("content", v);
const setHref = (v: string) => new AttrRewriter("href", v);

export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url);

  // Keep preview hosts out of search indexes.
  if (url.hostname.endsWith(".pages.dev")) {
    return Response.redirect(
      `https://intd.chingru.com${url.pathname}${url.search}`,
      301
    );
  }

  if (url.pathname.startsWith("/og")) return next();

  const response = await next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const route = resolveRoute(url.pathname);
  const { title, description } = metaFor(route);
  const canonical = `${url.origin}${route.path}`;
  const locale = OG_LOCALE[route.lang];

  const zhAlt = `${url.origin}${pathFor("zh", route.page)}`;
  const enAlt = `${url.origin}${pathFor("en", route.page)}`;

  const brand = parseBrand(url.search);
  const hasAmount = brand !== "IntD";
  const imageUrl = hasAmount
    ? `${url.origin}/og?p=${encodeURIComponent(brand)}&v=${OG_IMAGE_VERSION}`
    : `${url.origin}/og.png?v=${OG_IMAGE_VERSION}`;
  const imageW = OG_WIDTH;
  const imageH = OG_HEIGHT;
  // Preserve the amount query in share metadata.
  const ogUrl = hasAmount ? url.href : canonical;
  const imageAlt =
    route.lang === "en"
      ? "IntD integer decomposition calculator"
      : "IntD 整數拆解計算器";

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
    .transform(response);
};
