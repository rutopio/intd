const TRAILING_SLASHES_RE = /\/+$/;

export type Lang = "zh" | "en";
export type Page = "home" | "algo" | "about";

export interface RouteMeta {
  lang: Lang;
  page: Page;
  /** Canonical path (no origin), e.g. "/" or "/en/algo". */
  path: string;
}

const SITE = "IntD";

interface Copy {
  title: string;
  description: string;
}

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
};

export const OG_LOCALE: Record<Lang, string> = {
  zh: "zh_TW",
  en: "en_US",
};

export function pathFor(lang: Lang, page: Page): string {
  if (lang === "en") return page === "home" ? "/en" : `/en/${page}`;
  return page === "home" ? "/" : `/${page}`;
}

export function resolveRoute(pathname: string): RouteMeta {
  const p =
    pathname.length > 1 ? pathname.replace(TRAILING_SLASHES_RE, "") : pathname;
  const isEn = p === "/en" || p.startsWith("/en/");
  const lang: Lang = isEn ? "en" : "zh";
  const bare = isEn ? p.slice(3) || "/" : p;
  const page: Page =
    bare === "/algo" ? "algo" : bare === "/about" ? "about" : "home";
  return { lang, page, path: pathFor(lang, page) };
}

export function metaFor(route: RouteMeta): Copy {
  return COPY[route.lang][route.page];
}

export { SITE };
