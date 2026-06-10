/**
 * Per-route SEO metadata for the OG/Twitter/title rewrite in _middleware.ts.
 *
 * The app is a single index.html shell, so the static head only describes the zh
 * home page. Crawlers don't run JS, so the middleware injects the right title /
 * description / canonical / locale per route here. Pure data, no app imports, so
 * it stays out of the client bundle.
 */

export type Lang = "zh" | "en"
export type Page = "home" | "algo" | "about"

export interface RouteMeta {
  lang: Lang
  page: Page
  /** Canonical path (no origin), e.g. "/" or "/en/algo". */
  path: string
}

const SITE = "IntD"

interface Copy {
  title: string
  description: string
}

// Title/description per (lang, page). Titles suffix the site name except home,
// whose title is already the full brand line.
const COPY: Record<Lang, Record<Page, Copy>> = {
  zh: {
    home: {
      title: "IntD - Integer Decomposition Calculator",
      description:
        "整數拆解計算器：給定一個目標價格，嘗試湊出由便當、飲料、與一元塑膠袋組成的合理解法。",
    },
    algo: {
      title: "演算法 | IntD",
      description:
        "解釋「受限整數拆解 (Constrained Integer Decomposition)」問題與 DFS 解法、約束條件與排序策略。",
    },
    about: {
      title: "關於 | IntD",
      description:
        "IntD 是一個整數拆解計算器：給定一個目標價格，嘗試湊出由便當、飲料、與一元塑膠袋組成的合理解法。",
    },
  },
  en: {
    home: {
      title: "IntD - Integer Decomposition Calculator",
      description:
        "A demo of a constrained integer decomposition algorithm: given a target total, enumerate item-and-quantity combinations via DFS and rank them by balance.",
    },
    algo: {
      title: "Algorithm | IntD",
      description:
        "How IntD's constrained integer decomposition works: the DFS solver, its constraints, and the ranking strategies.",
    },
    about: {
      title: "About | IntD",
      description:
        "IntD is a small tool that demonstrates an integer decomposition algorithm: enter a total and list sensible combinations of items and a one-dollar item.",
    },
  },
}

/** OG locale code per language. */
export const OG_LOCALE: Record<Lang, string> = {
  zh: "zh_TW",
  en: "en_US",
}

/** Canonical path for a page in a given language. zh is bare, en is /en-prefixed. */
export function pathFor(lang: Lang, page: Page): string {
  if (lang === "en") return page === "home" ? "/en" : `/en/${page}`
  return page === "home" ? "/" : `/${page}`
}

/** Resolve a URL pathname to its language, page, and canonical path. */
export function resolveRoute(pathname: string): RouteMeta {
  // Strip trailing slash (except root) for stable matching.
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname
  const isEn = p === "/en" || p.startsWith("/en/")
  const lang: Lang = isEn ? "en" : "zh"
  // Bare path within the language (drop the /en prefix).
  const bare = isEn ? p.slice(3) || "/" : p
  const page: Page =
    bare === "/algo" ? "algo" : bare === "/about" ? "about" : "home"
  return { lang, page, path: pathFor(lang, page) }
}

/** Title and description for a resolved route. */
export function metaFor(route: RouteMeta): Copy {
  return COPY[route.lang][route.page]
}

export { SITE }
