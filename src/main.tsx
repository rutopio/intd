import { NOT_FOUND_TITLE } from "@rutopio/ui/not-found"
import { RouterProvider } from "@tanstack/react-router"
import { ThemeProvider } from "next-themes"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import {
  metaFor,
  OG_LOCALE,
  pathFor,
  resolveRoute,
} from "../functions/seo-meta"
import i18n from "./lib/i18n"
import { getLangFromPath } from "./lib/language"
import { OG_IMAGE_VERSION, parseBrand } from "./lib/render-og-image"
import { getRouter } from "./router"
import "./styles/globals.css"

const router = getRouter()

function syncLanguage(pathname: string) {
  const lang = getLangFromPath(pathname)
  if (i18n.language !== lang) void i18n.changeLanguage(lang)
  document.documentElement.lang = lang === "en" ? "en" : "zh-Hant"
}

function syncMetadata(pathname: string) {
  const route = resolveRoute(pathname)
  const { title, description } = metaFor(route)
  const origin = window.location.origin
  const canonical = `${origin}${route.path}`
  const brand = parseBrand(window.location.search)
  const image =
    brand === "IntD"
      ? `${origin}/og.png?v=${OG_IMAGE_VERSION}`
      : `${origin}/og?p=${encodeURIComponent(brand)}&v=${OG_IMAGE_VERSION}`
  const setContent = (selector: string, value: string) => {
    document
      .querySelector<HTMLMetaElement>(selector)
      ?.setAttribute("content", value)
  }
  const setHref = (selector: string, value: string) => {
    document
      .querySelector<HTMLLinkElement>(selector)
      ?.setAttribute("href", value)
  }

  document.title = router.state.statusCode === 404 ? NOT_FOUND_TITLE : title
  setContent('meta[name="description"]', description)
  setHref('link[rel="canonical"]', canonical)
  for (const [code, lang] of [
    ["zh-Hant", "zh"],
    ["en", "en"],
    ["x-default", "zh"],
  ] as const) {
    setHref(`link[hreflang="${code}"]`, `${origin}${pathFor(lang, route.page)}`)
  }
  for (const key of ["title", "description", "image"] as const) {
    const value =
      key === "title" ? title : key === "description" ? description : image
    setContent(`meta[property="og:${key}"]`, value)
    setContent(`meta[name="twitter:${key}"]`, value)
  }
  setContent(
    'meta[property="og:url"]',
    brand === "IntD" ? canonical : window.location.href,
  )
  setContent('meta[property="og:locale"]', OG_LOCALE[route.lang])
  const imageAlt =
    route.lang === "en"
      ? "IntD integer decomposition calculator"
      : "IntD 整數拆解計算器"
  setContent('meta[property="og:image:alt"]', imageAlt)
  setContent('meta[name="twitter:image:alt"]', imageAlt)
}

syncLanguage(window.location.pathname)
syncMetadata(window.location.pathname)
router.subscribe("onBeforeRouteMount", ({ toLocation }) => {
  syncLanguage(toLocation.pathname)
})

// Track the initial load and SPA navigations; gtag config disables automatic page views.
router.subscribe("onResolved", ({ fromLocation, toLocation }) => {
  syncMetadata(toLocation.pathname)
  if (fromLocation && fromLocation.pathname !== toLocation.pathname) {
    requestAnimationFrame(() =>
      document.getElementById("main-content")?.focus({ preventScroll: true }),
    )
  }
  window.gtag?.("event", "page_view", {
    page_path: toLocation.pathname,
    page_location: window.location.href,
    page_referrer: fromLocation
      ? new URL(fromLocation.href, window.location.origin).href
      : document.referrer,
  })
})

// biome-ignore lint/style/noNonNullAssertion: #root is defined in index.html
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
